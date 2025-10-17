import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { cloudStorageService } from '../services/cloudStorageService';
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

    // Upload to Cloudinary
    const result = await cloudStorageService.uploadFile(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype,
      {
        folder: 'saloneo/general',
        optimize: true,
      }
    );

    res.json({
      message: 'File uploaded successfully',
      file: {
        filename: req.file.originalname,
        originalName: req.file.originalname,
        size: result.size,
        mimetype: req.file.mimetype,
        url: result.cdnUrl || result.url,
        publicId: result.publicId,
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

    const filesArray = req.files as Express.Multer.File[];

    // Upload all files to Cloudinary
    const uploadPromises = filesArray.map(file =>
      cloudStorageService.uploadFile(
        file.buffer,
        file.originalname,
        file.mimetype,
        {
          folder: 'saloneo/general',
          optimize: true,
        }
      )
    );

    const results = await Promise.all(uploadPromises);

    const files = results.map((result, index) => ({
      filename: filesArray[index].originalname,
      originalName: filesArray[index].originalname,
      size: result.size,
      mimetype: filesArray[index].mimetype,
      url: result.cdnUrl || result.url,
      publicId: result.publicId,
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
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Delete old avatar from Cloudinary if exists
    if (user.avatar && user.avatar.includes('cloudinary')) {
      const publicId = user.avatar.split('/').slice(-1)[0].split('.')[0];
      await cloudStorageService.deleteFile(publicId).catch(() => {});
    }

    // Upload new avatar to Cloudinary
    const result = await cloudStorageService.uploadFile(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype,
      {
        folder: 'saloneo/avatars',
        optimize: true,
        generateThumbnails: true,
        thumbnailSizes: [
          { width: 50, height: 50, suffix: 'thumb' },
          { width: 150, height: 150, suffix: 'medium' },
        ],
      }
    );

    // Update user avatar
    user.avatar = result.cdnUrl || result.url;
    await user.save();

    res.json({
      message: 'Avatar uploaded successfully',
      avatar: result.cdnUrl || result.url,
      thumbnails: result.thumbnails,
    });
  } catch (error) {
    logger.error('Upload avatar error:', error);
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
      res.status(404).json({ error: 'Service not found' });
      return;
    }

    // Upload to Cloudinary
    const result = await cloudStorageService.uploadFile(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype,
      {
        folder: 'saloneo/services',
        optimize: true,
        generateThumbnails: true,
        thumbnailSizes: [
          { width: 300, height: 200, suffix: 'thumb' },
          { width: 600, height: 400, suffix: 'medium' },
        ],
      }
    );

    // Add new image to images array
    if (!service.images) {
      service.images = [];
    }
    
    service.images.push({
      url: result.cdnUrl || result.url,
      alt: req.file.originalname,
      isPrimary: service.images.length === 0, // First image is primary
    });
    
    await service.save();

    res.json({
      message: 'Service image uploaded successfully',
      image: result.cdnUrl || result.url,
      thumbnails: result.thumbnails,
      publicId: result.publicId,
    });
  } catch (error) {
    logger.error('Upload service image error:', error);
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
      res.status(404).json({ error: 'Team member not found' });
      return;
    }

    // Delete old avatar from Cloudinary if exists
    if (teamMember.avatar && teamMember.avatar.includes('cloudinary')) {
      const publicId = teamMember.avatar.split('/').slice(-1)[0].split('.')[0];
      await cloudStorageService.deleteFile(publicId).catch(() => {});
    }

    // Upload new avatar to Cloudinary
    const result = await cloudStorageService.uploadFile(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype,
      {
        folder: 'saloneo/team',
        optimize: true,
        generateThumbnails: true,
        thumbnailSizes: [
          { width: 50, height: 50, suffix: 'thumb' },
          { width: 150, height: 150, suffix: 'medium' },
        ],
      }
    );

    // Update team member avatar
    teamMember.avatar = result.cdnUrl || result.url;
    await teamMember.save();

    res.json({
      message: 'Team member avatar uploaded successfully',
      avatar: result.cdnUrl || result.url,
      thumbnails: result.thumbnails,
    });
  } catch (error) {
    logger.error('Upload team member avatar error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const deleteFile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { publicId } = req.body;

    if (!publicId) {
      res.status(400).json({ error: 'Public ID is required' });
      return;
    }

    const success = await cloudStorageService.deleteFile(publicId);

    if (success) {
      res.json({ message: 'File deleted successfully' });
    } else {
      res.status(404).json({ error: 'File not found or could not be deleted' });
    }
  } catch (error) {
    logger.error('Delete file error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get optimized image URL
export const getOptimizedImageUrl = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { publicId } = req.params;
    const { width, height, format, quality } = req.query;

    if (!publicId) {
      res.status(400).json({ error: 'Public ID is required' });
      return;
    }

    const optimizedUrl = cloudStorageService.getCDNUrl(publicId, {
      width: width ? parseInt(width as string) : undefined,
      height: height ? parseInt(height as string) : undefined,
      format: format as any,
      quality: quality ? parseInt(quality as string) : undefined,
    });

    res.json({
      url: optimizedUrl,
    });
  } catch (error) {
    logger.error('Get optimized image URL error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
