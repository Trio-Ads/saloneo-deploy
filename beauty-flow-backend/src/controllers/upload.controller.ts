import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { getFileUrl, deleteUploadedFile } from '../middleware/upload';
import { logger } from '../utils/logger';
import { User } from '../models/User';
import { Service } from '../models/Service';
import { TeamMember } from '../models/Team';

export const uploadFile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    const fileUrl = getFileUrl(req.file.path, `${req.protocol}://${req.get('host')}`);

    res.json({
      message: 'File uploaded successfully',
      file: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
        path: req.file.path,
        url: fileUrl,
      },
    });
  } catch (error) {
    logger.error('Upload file error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const uploadMultipleFiles = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      res.status(400).json({ error: 'No files uploaded' });
      return;
    }

    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const files = req.files.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
      path: file.path,
      url: getFileUrl(file.path, baseUrl),
    }));

    res.json({
      message: 'Files uploaded successfully',
      files,
    });
  } catch (error) {
    logger.error('Upload multiple files error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const uploadProfileAvatar = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    const userId = req.userId;
    const user = await User.findById(userId);

    if (!user) {
      await deleteUploadedFile(req.file.path);
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Delete old avatar if exists
    if (user.avatar) {
      await deleteUploadedFile(user.avatar).catch(() => {});
    }

    // Update user avatar
    const fileUrl = getFileUrl(req.file.path, `${req.protocol}://${req.get('host')}`);
    user.avatar = req.file.path;
    await user.save();

    res.json({
      message: 'Avatar uploaded successfully',
      avatar: fileUrl,
    });
  } catch (error) {
    logger.error('Upload avatar error:', error);
    if (req.file) {
      await deleteUploadedFile(req.file.path).catch(() => {});
    }
    res.status(500).json({ error: 'Server error' });
  }
};

export const uploadServiceImage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    const { serviceId } = req.params;
    const userId = req.userId;

    const service = await Service.findOne({ _id: serviceId, userId });

    if (!service) {
      await deleteUploadedFile(req.file.path);
      res.status(404).json({ error: 'Service not found' });
      return;
    }

    // Add new image to images array
    const fileUrl = getFileUrl(req.file.path, `${req.protocol}://${req.get('host')}`);
    if (!service.images) {
      service.images = [];
    }
    service.images.push({
      url: fileUrl,
      alt: req.file.originalname,
      isPrimary: service.images.length === 0, // First image is primary
    });
    await service.save();

    res.json({
      message: 'Service image uploaded successfully',
      image: fileUrl,
    });
  } catch (error) {
    logger.error('Upload service image error:', error);
    if (req.file) {
      await deleteUploadedFile(req.file.path).catch(() => {});
    }
    res.status(500).json({ error: 'Server error' });
  }
};

export const uploadTeamMemberAvatar = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    const { teamMemberId } = req.params;
    const userId = req.userId;

    const teamMember = await TeamMember.findOne({ _id: teamMemberId, userId });

    if (!teamMember) {
      await deleteUploadedFile(req.file.path);
      res.status(404).json({ error: 'Team member not found' });
      return;
    }

    // Delete old avatar if exists
    if (teamMember.avatar) {
      await deleteUploadedFile(teamMember.avatar).catch(() => {});
    }

    // Update team member avatar
    const fileUrl = getFileUrl(req.file.path, `${req.protocol}://${req.get('host')}`);
    teamMember.avatar = req.file.path;
    await teamMember.save();

    res.json({
      message: 'Team member avatar uploaded successfully',
      avatar: fileUrl,
    });
  } catch (error) {
    logger.error('Upload team member avatar error:', error);
    if (req.file) {
      await deleteUploadedFile(req.file.path).catch(() => {});
    }
    res.status(500).json({ error: 'Server error' });
  }
};

export const deleteFile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { filePath } = req.body;

    if (!filePath) {
      res.status(400).json({ error: 'File path is required' });
      return;
    }

    await deleteUploadedFile(filePath);

    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    logger.error('Delete file error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
