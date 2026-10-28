import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User, IUser, UserRole, SALON_ACCOUNT_FILTER } from '../models/User';
import { Service } from '../models/Service';
import { Client } from '../models/Client';
import { TeamMember } from '../models/Team';
import { Appointment } from '../models/Appointment';
import { Actor, normalizePermissions, sanitizeForStaff, staffAllowed } from './permissions';

export interface AuthRequest extends Request {
  /** Salon scope: the owner's user id (for staff logins too) */
  userId?: string;
  /** The salon owner's account (for staff logins too: plan limits, salon settings) */
  user?: IUser;
  /** The account that is logged in (the staff member's own User for staff logins) */
  account?: IUser;
  /** Who is acting: owner, staff (with teamMemberId + permissions), supplier or admin */
  actor?: Actor;
}

/** Route guard by actor role, used after `authenticate` / `authenticateAny`. */
export const requireRole = (...roles: string[]) => (req: AuthRequest, res: Response, next: NextFunction): void => {
  const role = req.actor?.role || (req.user as any)?.role || 'owner';
  if (roles.includes(role)) return next();
  res.status(403).json({ error: 'Forbidden', code: 'ROLE_FORBIDDEN' });
};

/** Verifies the token and loads who is acting. Staff resolve to their owner's salon; throws when not allowed in. */
async function identify(req: AuthRequest): Promise<void> {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) throw new Error('No token');
  const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as { userId: string };
  const user = await User.findOne({ _id: decoded.userId, isActive: true }).select('-password');
  if (!user) throw new Error('No user');
  const id = (user as any)._id.toString();
  const role = user.role || UserRole.OWNER;
  req.account = user;

  if (role === UserRole.STAFF) {
    // Revoked access (isActive false), a removed or deactivated member, or a closed salon all lock the login out
    const [owner, member] = await Promise.all([
      User.findOne({ _id: user.salonId, isActive: true, ...SALON_ACCOUNT_FILTER }).select('-password'),
      TeamMember.findOne({ _id: user.teamMemberId, userId: user.salonId, isActive: true }).select('permissions').lean(),
    ]);
    if (!owner || !member) throw new Error('Staff access closed');
    req.userId = (owner as any)._id.toString();
    req.user = owner;
    req.actor = { id, role, teamMemberId: String(user.teamMemberId), permissions: normalizePermissions((member as any).permissions) };
    return;
  }
  req.userId = id;
  req.user = user;
  req.actor = { id, role };
}

/** Any logged-in account (supplier space, /auth/me). Pair with requireRole on role-specific routes. */
export const authenticateAny = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    await identify(req);
  } catch {
    res.status(401).json({ error: 'Please authenticate' });
    return;
  }
  next();
};

/**
 * Salon routes. Owners/admins as before; suppliers refused; staff checked against STAFF_POLICY (default deny)
 * and their JSON responses filtered (client contacts, money) per their permissions.
 */
export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    await identify(req);
  } catch {
    res.status(401).json({ error: 'Please authenticate' });
    return;
  }
  const actor = req.actor!;
  if (actor.role === UserRole.SUPPLIER) {
    res.status(403).json({ error: 'Forbidden', code: 'ROLE_FORBIDDEN' });
    return;
  }
  if (actor.role === UserRole.STAFF) {
    if (!staffAllowed(actor, req.method, req.originalUrl)) {
      res.status(403).json({ error: 'Forbidden', code: 'STAFF_FORBIDDEN' });
      return;
    }
    if (!(res as any).staffFiltered) {
      (res as any).staffFiltered = true;
      const json = res.json.bind(res);
      res.json = (body?: any) => json(res.statusCode < 400 ? sanitizeForStaff(body, actor.permissions) : body);
    }
  }
  next();
};


export const generateToken = (userId: string): string => {
  const secret = process.env.JWT_SECRET || 'secret';
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  
  return jwt.sign({ userId }, secret, { expiresIn } as any);
};

export const generateRefreshToken = (userId: string): string => {
  const secret = process.env.JWT_REFRESH_SECRET || 'refresh-secret';
  const expiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '30d';
  
  return jwt.sign({ userId }, secret, { expiresIn } as any);
};

// Define limits for each plan
const PLAN_LIMITS = {
  FREE: {
    appointments: 30,
    clients: 50,
    services: 5,
    teamMembers: 2, // Augmenté à 2 pour permettre les tests
    products: 10
  },
  STARTER: {
    appointments: 200,
    clients: 500,
    services: 50,
    teamMembers: 5,
    products: 100
  },
  PRO: {
    appointments: 1000,
    clients: 2000,
    services: 200,
    teamMembers: 20,
    products: 500
  },
  ENTERPRISE: {
    appointments: -1, // unlimited
    clients: -1,
    services: -1,
    teamMembers: -1,
    products: -1
  }
};

export const checkLimits = (resource: keyof typeof PLAN_LIMITS.FREE) => {
  return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new Error('User not found');
      }

      const userPlan = req.user.subscription.plan;
      const limits = PLAN_LIMITS[userPlan as keyof typeof PLAN_LIMITS];
      
      if (!limits) {
        res.status(500).json({ error: 'Invalid subscription plan' });
        return;
      }

      const limit = limits[resource];
      
      // If limit is -1, it means unlimited (ENTERPRISE plan)
      if (limit === -1) {
        next();
        return;
      }

      // Count current resources for this user
      let currentCount = 0;
      const userId = req.userId;

      switch (resource) {
        case 'services':
          currentCount = await Service.countDocuments({ userId });
          break;
        case 'clients':
          currentCount = await Client.countDocuments({ userId });
          break;
        case 'teamMembers':
          currentCount = await TeamMember.countDocuments({ userId });
          break;
        case 'appointments':
          currentCount = await Appointment.countDocuments({ userId });
          break;
        case 'products':
          // Import Product model
          const { Product } = await import('../models/Product');
          currentCount = await Product.countDocuments({ userId, isActive: true });
          break;
        default:
          res.status(500).json({ error: 'Unknown resource type' });
          return;
      }

      if (currentCount >= limit) {
        res.status(403).json({
          error: 'Limit reached',
          message: `You have reached the limit of ${limit} ${resource} for your ${userPlan} plan`,
          current: currentCount,
          limit: limit,
          plan: userPlan
        });
        return;
      }

      next();
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  };
};
