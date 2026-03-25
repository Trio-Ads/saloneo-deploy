import { Router } from 'express';
import { body, param, query } from 'express-validator';
import * as appointmentsController from '../controllers/appointments.controller';
import { authenticate } from '../middleware/auth';
import { checkSubscriptionLimit } from '../middleware/checkLimits';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get available slots
router.get('/available-slots', 
  [
    query('date').isISO8601().toDate(),
    // serviceId can be a Mongo ObjectId (DB) or a UUID (legacy/local)
    query('serviceId').isString().isLength({ min: 1 }),
    // teamMemberId can be a Mongo ObjectId (DB) or a UUID (legacy/local)
    query('teamMemberId').optional().isString().isLength({ min: 1 }),
  ],
  appointmentsController.getAvailableSlots
);

// Get all appointments
router.get('/', appointmentsController.getAllAppointments);

// Get appointment by ID
router.get(
  '/:id',
  [param('id').isMongoId()],
  appointmentsController.getAppointmentById
);

// Create new appointment
router.post(
  '/',
  checkSubscriptionLimit('appointments'),
  [
    body('clientId').isMongoId(),
    body('serviceId').isString().isLength({ min: 1 }).withMessage('Service ID is required'),
    body('teamMemberId').optional().isString().isLength({ min: 1 }).withMessage('Team member ID must be a valid string'),
    body('date').isISO8601().toDate(),
    body('startTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
    body('notes').optional().trim().isLength({ max: 500 }),
  ],
  appointmentsController.createAppointment
);

// Update appointment
router.put(
  '/:id',
  [
    param('id').isMongoId(),
    body('clientId').optional().isMongoId(),
    // serviceId/teamMemberId may not be MongoId depending on data source
    body('serviceId').optional().isString().isLength({ min: 1 }),
    body('teamMemberId').optional().isString().isLength({ min: 1 }),
    body('date').optional().isISO8601().toDate(),
    body('startTime').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
    body('notes').optional().trim().isLength({ max: 500 }),
  ],
  appointmentsController.updateAppointment
);

// Update appointment status
router.patch(
  '/:id/status',
  [
    param('id').isMongoId(),
    // NOTE: accept legacy/camelCase values too (will be normalized in controller)
    body('status').isIn([
      'scheduled',
      'confirmed',
      'in_progress',
      'completed',
      'cancelled',
      'no_show',
      'rescheduled',
      'noShow'
    ]),
  ],
  appointmentsController.updateAppointmentStatus
);

// Delete appointment
router.delete(
  '/:id',
  [param('id').isMongoId()],
  appointmentsController.deleteAppointment
);

export default router;
