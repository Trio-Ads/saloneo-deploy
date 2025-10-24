import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { adminAuth, logAdminAction } from '../middleware/adminAuth';
import {
  getAllUsers,
  getUserById,
  updateUserSubscription,
  getPlatformStats
} from '../controllers/admin.controller';

const router = Router();

// All admin routes require authentication and admin privileges
router.use(authenticate);
router.use(adminAuth);
router.use(logAdminAction); // Log all admin actions for audit

/**
 * @route   GET /api/admin/users
 * @desc    Get all users with pagination, search, and filters
 * @access  Admin only
 * @query   page, limit, search, planFilter, statusFilter
 */
router.get('/users', getAllUsers);

/**
 * @route   GET /api/admin/users/:id
 * @desc    Get user by ID with full details and statistics
 * @access  Admin only
 */
router.get('/users/:id', getUserById);

/**
 * @route   PATCH /api/admin/users/:id/subscription
 * @desc    Update user subscription (plan, duration, expiry, status)
 * @access  Admin only
 * @body    { plan?, duration?, expiresAt?, isActive? }
 */
router.patch('/users/:id/subscription', updateUserSubscription);

/**
 * @route   GET /api/admin/stats
 * @desc    Get platform statistics (users, plans, activity)
 * @access  Admin only
 */
router.get('/stats', getPlatformStats);

export default router;
