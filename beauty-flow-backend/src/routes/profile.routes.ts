import { Router } from 'express';
import { body } from 'express-validator';
import * as profileController from '../controllers/profile.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get current user profile
router.get('/', profileController.getProfile);

// Update general profile info
router.put(
  '/',
  [
    body('establishmentName').optional().trim().notEmpty(),
    body('phone').optional().trim(),
    body('address.street').optional().trim(),
    body('address.city').optional().trim(),
    body('address.state').optional().trim(),
    body('address.postalCode').optional().trim(),
    body('address.country').optional().trim(),
  ],
  profileController.updateProfile
);

// Update password
router.put(
  '/password',
  [
    body('currentPassword').notEmpty(),
    body('newPassword').isLength({ min: 6 }),
  ],
  profileController.updatePassword
);

// Update email
router.put(
  '/email',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty(),
  ],
  profileController.updateEmail
);

// Update business information
router.put(
  '/business',
  [
    body('establishmentName').optional().trim().notEmpty(),
    body('phone').optional().trim(),
    body('address').optional().isObject(),
    body('businessHours').optional().isObject(),
    body('socialMedia').optional().isObject(),
  ],
  profileController.updateBusinessInfo
);

// Update preferences
router.put(
  '/preferences',
  [
    body('language').optional().isIn(['fr', 'en', 'ar', 'es', 'tr', 'pt']),
    body('currency').optional().isIn(['EUR', 'USD', 'GBP', 'MAD', 'TND', 'DZD']),
    body('timezone').optional().trim(),
    body('notifications').optional().isObject(),
  ],
  profileController.updatePreferences
);

// Delete account
router.delete(
  '/',
  [
    body('password').notEmpty(),
  ],
  profileController.deleteAccount
);

export default router;
