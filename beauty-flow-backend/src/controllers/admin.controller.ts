import { Response } from 'express';
import { User, PlanType, SubscriptionDuration } from '../models/User';
import { Appointment } from '../models/Appointment';
import { Client } from '../models/Client';
import { Service } from '../models/Service';
import { AuthRequest } from '../middleware/adminAuth';
import { logger } from '../utils/logger';

/**
 * Get all users with pagination, search, and filters
 * GET /api/admin/users
 */
export const getAllUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      page = 1,
      limit = 25,
      search = '',
      planFilter = '',
      statusFilter = ''
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Build query
    const query: any = { role: { $ne: 'admin' } }; // Exclude admins from list

    // Search by establishment name or email
    if (search) {
      query.$or = [
        { establishmentName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Filter by plan
    if (planFilter && planFilter !== 'all') {
      query['subscription.plan'] = planFilter;
    }

    // Filter by status
    if (statusFilter === 'active') {
      query['subscription.isActive'] = true;
      query['subscription.expiresAt'] = { $gt: new Date() };
    } else if (statusFilter === 'expired') {
      query.$or = [
        { 'subscription.isActive': false },
        { 'subscription.expiresAt': { $lte: new Date() } }
      ];
    }

    // Get users with pagination
    const users = await User.find(query)
      .select('email establishmentName subscription createdAt isActive')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    // Get total count
    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum)
        }
      }
    });
  } catch (error) {
    logger.error('Error getting all users:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve users'
    });
  }
};

/**
 * Get user by ID with full details
 * GET /api/admin/users/:id
 */
export const getUserById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const user = await User.findById(id)
      .select('-password -refreshToken -passwordResetToken -emailVerificationToken')
      .lean();

    if (!user) {
      res.status(404).json({
        success: false,
        error: 'User not found'
      });
      return;
    }

    // Get user statistics
    const [appointmentsCount, clientsCount, servicesCount] = await Promise.all([
      Appointment.countDocuments({ userId: id }),
      Client.countDocuments({ userId: id }),
      Service.countDocuments({ userId: id })
    ]);

    res.json({
      success: true,
      data: {
        user,
        stats: {
          appointmentsCount,
          clientsCount,
          servicesCount
        }
      }
    });
  } catch (error) {
    logger.error('Error getting user by ID:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve user'
    });
  }
};

/**
 * Update user subscription
 * PATCH /api/admin/users/:id/subscription
 */
export const updateUserSubscription = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { plan, duration, expiresAt, isActive } = req.body;

    // Validate plan
    if (plan && !Object.values(PlanType).includes(plan)) {
      res.status(400).json({
        success: false,
        error: 'Invalid plan type'
      });
      return;
    }

    // Validate duration
    if (duration && !Object.values(SubscriptionDuration).includes(duration)) {
      res.status(400).json({
        success: false,
        error: 'Invalid subscription duration'
      });
      return;
    }

    const user = await User.findById(id);

    if (!user) {
      res.status(404).json({
        success: false,
        error: 'User not found'
      });
      return;
    }

    // Update subscription fields
    if (plan !== undefined) {
      user.subscription.plan = plan;
    }
    if (duration !== undefined) {
      user.subscription.duration = duration;
    }
    if (expiresAt !== undefined) {
      user.subscription.expiresAt = new Date(expiresAt);
    }
    if (isActive !== undefined) {
      user.subscription.isActive = isActive;
    }

    await user.save();

    // Log the action
    logger.info('Admin updated user subscription', {
      adminId: req.user?.id,
      adminEmail: req.user?.email,
      userId: id,
      userEmail: user.email,
      changes: { plan, duration, expiresAt, isActive }
    });

    res.json({
      success: true,
      message: 'Subscription updated successfully',
      data: {
        subscription: user.subscription
      }
    });
  } catch (error) {
    logger.error('Error updating user subscription:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update subscription'
    });
  }
};

/**
 * Get platform statistics
 * GET /api/admin/stats
 */
export const getPlatformStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Get user counts by plan
    const [
      totalUsers,
      freeUsers,
      starterUsers,
      proUsers,
      enterpriseUsers,
      activeUsers,
      totalAppointments,
      totalClients,
      totalServices
    ] = await Promise.all([
      User.countDocuments({ role: { $ne: 'admin' } }),
      User.countDocuments({ 'subscription.plan': PlanType.FREE }),
      User.countDocuments({ 'subscription.plan': PlanType.STARTER }),
      User.countDocuments({ 'subscription.plan': PlanType.PRO }),
      User.countDocuments({ 'subscription.plan': PlanType.ENTERPRISE }),
      User.countDocuments({
        'subscription.isActive': true,
        'subscription.expiresAt': { $gt: new Date() }
      }),
      Appointment.countDocuments(),
      Client.countDocuments(),
      Service.countDocuments()
    ]);

    // Get recent users (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentUsers = await User.countDocuments({
      createdAt: { $gte: thirtyDaysAgo },
      role: { $ne: 'admin' }
    });

    res.json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          active: activeUsers,
          recent: recentUsers,
          byPlan: {
            free: freeUsers,
            starter: starterUsers,
            pro: proUsers,
            enterprise: enterpriseUsers
          }
        },
        platform: {
          totalAppointments,
          totalClients,
          totalServices
        }
      }
    });
  } catch (error) {
    logger.error('Error getting platform stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve platform statistics'
    });
  }
};
