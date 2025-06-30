import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/User';
import { Service } from '../models/Service';
import { Client } from '../models/Client';
import { TeamMember } from '../models/Team';
import { Appointment } from '../models/Appointment';

export interface AuthRequest extends Request {
  userId?: string;
  user?: IUser;
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      throw new Error();
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'secret'
    ) as { userId: string };

    const user = await User.findOne({
      _id: decoded.userId,
      isActive: true,
    }).select('-password');

    if (!user) {
      throw new Error();
    }

    req.userId = (user as any)._id.toString();
    req.user = user as any;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Please authenticate' });
  }
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
