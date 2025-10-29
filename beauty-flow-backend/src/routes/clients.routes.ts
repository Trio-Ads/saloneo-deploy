import { Router } from 'express';
import { body, param } from 'express-validator';
import * as clientsController from '../controllers/clients.controller';
import { authenticate } from '../middleware/auth';
import { checkSubscriptionLimit } from '../middleware/checkLimits';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get client statistics
router.get('/stats', clientsController.getClientStats);

// Search clients
router.get('/search', clientsController.searchClients);

// Get all clients
router.get('/', clientsController.getAllClients);

// Get client by ID
router.get(
  '/:id',
  [param('id').isMongoId()],
  clientsController.getClientById
);

// Create new client
router.post(
  '/',
  checkSubscriptionLimit('clients'),
  [
    body('firstName').notEmpty().trim(),
    body('lastName').notEmpty().trim(),
    body('email').optional().isEmail().normalizeEmail(),
    body('phone').notEmpty().trim(),
    body('dateOfBirth').optional().isISO8601(),
    body('gender').optional().isIn(['male', 'female', 'other']),
    body('address').optional().trim(),
    body('notes').optional().trim(),
    body('preferences.notifications.email').optional().isBoolean(),
    body('preferences.notifications.sms').optional().isBoolean(),
    body('preferences.language').optional().isIn(['fr', 'en', 'ar', 'es', 'tr', 'pt']),
  ],
  clientsController.createClient
);

// Update client
router.put(
  '/:id',
  [
    param('id').isMongoId(),
    body('firstName').optional().notEmpty().trim(),
    body('lastName').optional().notEmpty().trim(),
    body('email').optional().isEmail().normalizeEmail(),
    body('phone').optional().trim(),
    body('dateOfBirth').optional().isISO8601(),
    body('gender').optional().isIn(['male', 'female', 'other']),
    body('address').optional().trim(),
    body('notes').optional().trim(),
    body('preferences.notifications.email').optional().isBoolean(),
    body('preferences.notifications.sms').optional().isBoolean(),
    body('preferences.language').optional().isIn(['fr', 'en', 'ar', 'es', 'tr', 'pt']),
  ],
  clientsController.updateClient
);

// Delete client
router.delete(
  '/:id',
  [param('id').isMongoId()],
  clientsController.deleteClient
);

export default router;
