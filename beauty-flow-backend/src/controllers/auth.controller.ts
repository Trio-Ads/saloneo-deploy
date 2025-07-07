import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { User } from '../models/User';
import { generateToken, generateRefreshToken, AuthRequest } from '../middleware/auth';
import { logger } from '../utils/logger';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { email, password, firstName, lastName, establishmentName, phone, address } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ error: 'User already exists' });
      return;
    }

    // Create user (password will be hashed by the pre-save middleware)
    const user = new User({
      email,
      password, // Don't hash here, let the middleware handle it
      firstName,
      lastName,
      establishmentName,
      phone,
      address,
      isEmailVerified: true, // Auto-verify for now
      subscription: {
        plan: 'FREE',
        isActive: true,
        startDate: new Date(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days trial
      },
    });

    await user.save();

    // Generate tokens
    const userId = (user as any)._id.toString();
    const token = generateToken(userId);
    const refreshToken = generateRefreshToken(userId);

    // Save refresh token
    user.refreshToken = refreshToken;
    await user.save();

    res.status(201).json({
      message: 'User created successfully',
      token,
      refreshToken,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        establishmentName: user.establishmentName,
        phone: user.phone,
        address: user.address,
        subscription: user.subscription,
      },
    });
  } catch (error) {
    logger.error('Register error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    // Find user and explicitly select password field
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    // Validate user password exists
    if (!user.password) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    // Check if account is active
    if (!user.isActive) {
      res.status(403).json({ error: 'Account is deactivated' });
      return;
    }

    // Generate tokens
    const userId = (user as any)._id.toString();
    const token = generateToken(userId);
    const refreshToken = generateRefreshToken(userId);

    // Save refresh token
    user.refreshToken = refreshToken;
    user.lastLogin = new Date();
    await user.save();

    res.json({
      token,
      refreshToken,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        establishmentName: user.establishmentName,
        subscription: user.subscription,
      },
    });
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(400).json({ error: 'Refresh token required' });
      return;
    }

    // Find user with this refresh token
    const user = await User.findOne({ refreshToken });
    if (!user) {
      res.status(401).json({ error: 'Invalid refresh token' });
      return;
    }

    // Generate new tokens
    const userId = (user as any)._id.toString();
    const newToken = generateToken(userId);
    const newRefreshToken = generateRefreshToken(userId);

    // Save new refresh token
    user.refreshToken = newRefreshToken;
    await user.save();

    res.json({
      token: newToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    logger.error('Refresh token error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const logout = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.userId);
    if (user) {
      user.refreshToken = undefined;
      await user.save();
    }

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    logger.error('Logout error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getCurrentUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.userId).select('-password -refreshToken');
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({ user });
  } catch (error) {
    logger.error('Get current user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const verifyEmail = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token } = req.params;

    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: Date.now() },
    });

    if (!user) {
      res.status(400).json({ error: 'Invalid or expired token' });
      return;
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    res.json({ message: 'Email verified successfully' });
  } catch (error) {
    logger.error('Verify email error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if user exists
      res.json({ message: 'If the email exists, a reset link has been sent' });
      return;
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.passwordResetToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    // TODO: Send email with reset link
    // For now, just return the token (in production, this should be sent via email)
    res.json({ 
      message: 'If the email exists, a reset link has been sent',
      resetToken: resetToken // Remove this in production
    });
  } catch (error) {
    logger.error('Forgot password error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { token } = req.params;
    const { password } = req.body;

    // Hash the token to compare with stored hash
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      res.status(400).json({ error: 'Invalid or expired token' });
      return;
    }

    // Update password
    user.password = await bcrypt.hash(password, 10);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    logger.error('Reset password error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
