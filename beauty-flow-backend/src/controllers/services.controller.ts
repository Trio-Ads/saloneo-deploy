import { Response } from 'express';
import { validationResult } from 'express-validator';
import { Service } from '../models/Service';
import { AuthRequest } from '../middleware/auth';
import { logger } from '../utils/logger';

export const getAllServices = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 10, category, isActive } = req.query;
    const userId = req.userId;

    const query: any = { userId };
    
    // Category filter
    if (category) {
      query.category = category;
    }

    // Active filter
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    const skip = (Number(page) - 1) * Number(limit);
    
    const [services, total] = await Promise.all([
      Service.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Service.countDocuments(query),
    ]);

    res.json({
      services,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    logger.error('Get all services error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getServiceById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const service = await Service.findOne({ _id: id, userId });
    
    if (!service) {
      res.status(404).json({ error: 'Service not found' });
      return;
    }

    res.json({ service });
  } catch (error) {
    logger.error('Get service by id error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const createService = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const userId = req.userId;
    
    // Si aucune currency n'est spécifiée, récupérer celle du profil utilisateur
    let currency = req.body.currency;
    if (!currency) {
      const { User } = require('../models/User');
      const user = await User.findById(userId).select('settings.currency');
      currency = user?.settings?.currency || 'EUR';
    }
    
    const serviceData = {
      ...req.body,
      userId,
      currency,
    };

    const service = new Service(serviceData);
    await service.save();

    res.status(201).json({ service });
  } catch (error) {
    logger.error('Create service error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const updateService = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { id } = req.params;
    const userId = req.userId;

    const service = await Service.findOneAndUpdate(
      { _id: id, userId },
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!service) {
      res.status(404).json({ error: 'Service not found' });
      return;
    }

    res.json({ service });
  } catch (error) {
    logger.error('Update service error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const deleteService = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const service = await Service.findOneAndDelete({ _id: id, userId });

    if (!service) {
      res.status(404).json({ error: 'Service not found' });
      return;
    }

    res.json({ message: 'Service deleted successfully' });
  } catch (error) {
    logger.error('Delete service error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getServiceCategories = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;

    const categories = await Service.distinct('category', { userId });

    res.json({ categories });
  } catch (error) {
    logger.error('Get service categories error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const toggleServiceStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const service = await Service.findOne({ _id: id, userId });

    if (!service) {
      res.status(404).json({ error: 'Service not found' });
      return;
    }

    service.isActive = !service.isActive;
    await service.save();

    res.json({ service });
  } catch (error) {
    logger.error('Toggle service status error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getServiceStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;

    const [total, active, byCategory] = await Promise.all([
      Service.countDocuments({ userId }),
      Service.countDocuments({ userId, isActive: true }),
      Service.aggregate([
        { $match: { userId } },
        { $group: { _id: '$category', count: { $sum: 1 } } },
      ]),
    ]);

    res.json({
      stats: {
        total,
        active,
        inactive: total - active,
        byCategory: byCategory.map(cat => ({
          category: cat._id,
          count: cat.count,
        })),
      },
    });
  } catch (error) {
    logger.error('Get service stats error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Add image to service
export const addServiceImage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { url, alt } = req.body;
    const userId = req.userId;

    const service = await Service.findOne({ _id: id, userId });

    if (!service) {
      res.status(404).json({ error: 'Service not found' });
      return;
    }

    // Check if we already have 5 images
    if (service.images.length >= 5) {
      res.status(400).json({ error: 'Maximum 5 images per service' });
      return;
    }

    // Add the new image
    service.images.push({
      url,
      alt: alt || '',
      isPrimary: service.images.length === 0, // First image is primary
    });

    await service.save();

    res.json({ service });
  } catch (error) {
    logger.error('Add service image error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Remove image from service
export const removeServiceImage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { imageUrl } = req.body;
    const userId = req.userId;

    const service = await Service.findOne({ _id: id, userId });

    if (!service) {
      res.status(404).json({ error: 'Service not found' });
      return;
    }

    // Remove the image
    service.images = service.images.filter(img => img.url !== imageUrl);

    // If we removed the primary image, make the first remaining image primary
    if (service.images.length > 0 && !service.images.some(img => img.isPrimary)) {
      service.images[0].isPrimary = true;
    }

    await service.save();

    res.json({ service });
  } catch (error) {
    logger.error('Remove service image error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Update service images
export const updateServiceImages = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { images } = req.body;
    const userId = req.userId;

    const service = await Service.findOne({ _id: id, userId });

    if (!service) {
      res.status(404).json({ error: 'Service not found' });
      return;
    }

    // Validate images array
    if (!Array.isArray(images) || images.length > 5) {
      res.status(400).json({ error: 'Invalid images array or too many images (max 5)' });
      return;
    }

    // Update images
    service.images = images.map((img, index) => ({
      url: img.url,
      alt: img.alt || '',
      isPrimary: index === 0, // First image is primary
    }));

    await service.save();

    res.json({ service });
  } catch (error) {
    logger.error('Update service images error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
