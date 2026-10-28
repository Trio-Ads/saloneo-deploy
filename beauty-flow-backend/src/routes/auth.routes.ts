import { Router } from 'express';
import { body } from 'express-validator';
import {
  register,
  login,
  refreshToken,
  logout,
  getCurrentUser,
  verifyEmail,
  forgotPassword,
  resetPassword
} from '../controllers/auth.controller';
import { authenticateAny } from '../middleware/auth';
import { acceptInvitation, getInvitation } from '../controllers/staff.controller';

const router = Router();

// Register
router.post(
  '/register',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }),
    body('establishmentName').notEmpty().trim(),
  ],
  register
);

// Login
router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty(),
  ],
  login
);

// Refresh token
router.post('/refresh', refreshToken);

// Logout / current user: any account (owner, staff, supplier, admin)
router.post('/logout', authenticateAny, logout);
router.get('/me', authenticateAny, getCurrentUser);

// Staff invitation: who is invited, then set name + password (logs in)
router.get('/invitation/:token', getInvitation);
router.post('/invitation/:token', acceptInvitation);

// Verify email
router.get('/verify-email/:token', verifyEmail);

// Forgot password
router.post(
  '/forgot-password',
  [body('email').isEmail().normalizeEmail()],
  forgotPassword
);

// Reset password
router.post(
  '/reset-password/:token',
  [body('password').isLength({ min: 6 })],
  resetPassword
);

export default router;
