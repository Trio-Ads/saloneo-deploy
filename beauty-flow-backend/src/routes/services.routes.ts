import { Router } from 'express';
import { body, param } from 'express-validator';
import * as servicesController from '../controllers/services.controller';
import { authenticate, checkLimits } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get service statistics
router.get('/stats', servicesController.getServiceStats);

// Get service categories
router.get('/categories', servicesController.getServiceCategories);

// Get all services
router.get('/', servicesController.getAllServices);

// Get service by ID
router.get(
  '/:id',
  [param('id').isMongoId()],
  servicesController.getServiceById
);

// Create new service
router.post(
  '/',
  checkLimits('services'),
  [
    body('name').notEmpty().trim(),
    body('category').notEmpty().trim(),
    body('description').optional().trim(),
    body('duration').isInt({ min: 5, max: 480 }), // 5 min to 8 hours
    body('price').isFloat({ min: 0 }),
    body('currency').optional().isIn(['EUR', 'USD', 'GBP', 'MAD', 'TND', 'AED']),
    body('color').optional().matches(/^#[0-9A-F]{6}$/i),
    body('isActive').optional().isBoolean(),
    body('availableOnline').optional().isBoolean(),
    body('maxCapacity').optional().isInt({ min: 1 }),
    body('buffer.before').optional().isInt({ min: 0 }),
    body('buffer.after').optional().isInt({ min: 0 }),
  ],
  servicesController.createService
);

// Update service
router.put(
  '/:id',
  [
    param('id').isMongoId(),
    body('name').optional().notEmpty().trim(),
    body('category').optional().notEmpty().trim(),
    body('description').optional().trim(),
    body('duration').optional().isInt({ min: 5, max: 480 }),
    body('price').optional().isFloat({ min: 0 }),
    body('currency').optional().isIn(['EUR', 'USD', 'GBP', 'MAD', 'TND', 'AED']),
    body('color').optional().matches(/^#[0-9A-F]{6}$/i),
    body('isActive').optional().isBoolean(),
    body('availableOnline').optional().isBoolean(),
    body('maxCapacity').optional().isInt({ min: 1 }),
    body('buffer.before').optional().isInt({ min: 0 }),
    body('buffer.after').optional().isInt({ min: 0 }),
  ],
  servicesController.updateService
);

// Toggle service status
router.patch(
  '/:id/toggle-status',
  [param('id').isMongoId()],
  servicesController.toggleServiceStatus
);

// Delete service
router.delete(
  '/:id',
  [param('id').isMongoId()],
  servicesController.deleteService
);

// Add image to service
router.post(
  '/:id/images',
  [
    param('id').isMongoId(),
    body('url').notEmpty().isURL(),
    body('alt').optional().trim(),
  ],
  servicesController.addServiceImage
);

// Remove image from service
router.delete(
  '/:id/images',
  [
    param('id').isMongoId(),
    body('imageUrl').notEmpty().isURL(),
  ],
  servicesController.removeServiceImage
);

// Update service images
router.put(
  '/:id/images',
  [
    param('id').isMongoId(),
    body('images').isArray({ max: 5 }),
    body('images.*.url').notEmpty().isURL(),
    body('images.*.alt').optional().trim(),
  ],
  servicesController.updateServiceImages
);

export default router;
