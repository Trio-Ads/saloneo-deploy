import { Response } from 'express';
import { validationResult } from 'express-validator';
import { User } from '../models/User';
import { AuthRequest } from '../middleware/auth';
import { logger } from '../utils/logger';
import bcrypt from 'bcryptjs';

export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.userId).select('-password -refreshToken');
    
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json(user);
  } catch (error) {
    logger.error('Get profile error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const userId = req.userId;
    const updates = req.body;

    // Remove fields that shouldn't be updated through this endpoint
    delete updates.password;
    delete updates.email;
    delete updates.subscription;
    delete updates.refreshToken;
    delete updates.isActive;

    // Handle settings (language, currency, timezone) properly
    const updateData: any = {};
    
    // Direct user fields
    if (updates.firstName !== undefined) updateData.firstName = updates.firstName;
    if (updates.lastName !== undefined) updateData.lastName = updates.lastName;
    if (updates.establishmentName !== undefined) updateData.establishmentName = updates.establishmentName;
    if (updates.phone !== undefined) updateData.phone = updates.phone;
    if (updates.address !== undefined) updateData.address = updates.address;
    if (updates.showAsTeamMember !== undefined) updateData.showAsTeamMember = updates.showAsTeamMember;
    
    // Interface fields
    if (updates.theme !== undefined) updateData.theme = updates.theme;
    if (updates.logo !== undefined) updateData.logo = updates.logo;
    if (updates.banner !== undefined) updateData.banner = updates.banner;
    if (updates.presentation !== undefined) updateData.presentation = updates.presentation;
    if (updates.serviceDisplay !== undefined) {
      updateData.serviceDisplay = updates.serviceDisplay;
      logger.info('🔍 ServiceDisplay being saved:', updates.serviceDisplay);
    }
    if (updates.businessHours !== undefined) updateData.businessHours = updates.businessHours;
    if (updates.showTeamOnPublicPage !== undefined) updateData.showTeamOnPublicPage = updates.showTeamOnPublicPage;
    
    // Handle settings object - use dot notation to preserve other settings
    if (updates.settings) {
      if (updates.settings.language !== undefined) updateData['settings.language'] = updates.settings.language;
      if (updates.settings.currency !== undefined) updateData['settings.currency'] = updates.settings.currency;
      if (updates.settings.timezone !== undefined) updateData['settings.timezone'] = updates.settings.timezone;
    }
    
    // Handle preferences (legacy support - map to settings) - use dot notation
    if (updates.preferences) {
      if (updates.preferences.language !== undefined) updateData['settings.language'] = updates.preferences.language;
      if (updates.preferences.currency !== undefined) updateData['settings.currency'] = updates.preferences.currency;
      if (updates.preferences.timezone !== undefined) updateData['settings.timezone'] = updates.preferences.timezone;
    }

    logger.info('Updating user profile:', { userId, updateData });

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password -refreshToken');

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    logger.info('Profile updated successfully:', { userId, user: user.toObject() });
    res.json({ user });
  } catch (error) {
    logger.error('Update profile error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const updatePassword = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { currentPassword, newPassword } = req.body;
    const userId = req.userId;

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ error: 'Current password is incorrect' });
      return;
    }

    // Hash new password
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    logger.error('Update password error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const updateEmail = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { email, password } = req.body;
    const userId = req.userId;

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ error: 'Password is incorrect' });
      return;
    }

    // Check if email is already taken
    const existingUser = await User.findOne({ email, _id: { $ne: userId } });
    if (existingUser) {
      res.status(400).json({ error: 'Email already in use' });
      return;
    }

    user.email = email;
    user.isEmailVerified = false;
    await user.save();

    res.json({ 
      message: 'Email updated successfully',
      user: {
        id: user._id,
        email: user.email,
        establishmentName: user.establishmentName,
      }
    });
  } catch (error) {
    logger.error('Update email error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const updateBusinessInfo = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const userId = req.userId;
    const { establishmentName, phone, address, businessHours, socialMedia } = req.body;

    const updates: any = {};
    if (establishmentName) updates.establishmentName = establishmentName;
    if (phone) updates.phone = phone;
    if (address) updates.address = address;
    if (businessHours) updates.businessHours = businessHours;
    if (socialMedia) updates.socialMedia = socialMedia;

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password -refreshToken');

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({ user });
  } catch (error) {
    logger.error('Update business info error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const updatePreferences = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const userId = req.userId;
    const { language, currency, timezone, notifications } = req.body;

    const updates: any = { preferences: {} };
    if (language) updates.preferences.language = language;
    if (currency) updates.preferences.currency = currency;
    if (timezone) updates.preferences.timezone = timezone;
    if (notifications) updates.preferences.notifications = notifications;

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password -refreshToken');

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({ user });
  } catch (error) {
    logger.error('Update preferences error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const deleteAccount = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { password } = req.body;
    const userId = req.userId;

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ error: 'Password is incorrect' });
      return;
    }

    // Soft delete - just deactivate the account
    user.isActive = false;
    await user.save();

    res.json({ message: 'Account deactivated successfully' });
  } catch (error) {
    logger.error('Delete account error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
