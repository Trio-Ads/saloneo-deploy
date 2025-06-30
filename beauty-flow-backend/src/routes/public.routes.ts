import { Router } from 'express';
import { body } from 'express-validator';
import * as publicController from '../controllers/public.controller';

const router = Router();

// Get salon info by slug
router.get('/salon/:slug', publicController.getSalonBySlug);

// Get services by slug
router.get('/services/:slug', publicController.getServicesBySlug);

// Get team by slug
router.get('/team/:slug', publicController.getTeamBySlug);

// Create public appointment with client management
router.post(
  '/appointments/:slug',
  [
    body('serviceId').notEmpty().trim(),
    body('stylistId').notEmpty().trim(),
    body('date').notEmpty().isISO8601(),
    body('startTime').notEmpty().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
    body('clientData.firstName').notEmpty().trim(),
    body('clientData.lastName').notEmpty().trim(),
    body('clientData.phone').notEmpty().trim(),
    body('clientData.email').optional().isEmail().normalizeEmail(),
    body('clientData.birthDate').optional().isISO8601(),
    body('clientData.address').optional().trim(),
    body('notes').optional().trim().isLength({ max: 500 }),
  ],
  publicController.createPublicBooking
);

// Get salon info by public token (legacy)
router.get('/salon-token/:token', publicController.getSalonInfo);

// Get available services (legacy)
router.get('/salon-token/:token/services', publicController.getPublicServices);

// Get team members (legacy)
router.get('/salon-token/:token/team', publicController.getPublicTeamMembers);

// Get available slots (legacy)
router.get('/salon-token/:token/slots', publicController.getPublicAvailableSlots);

// Create appointment (legacy)
router.post(
  '/salon-token/:token/appointments',
  [
    body('serviceId').notEmpty().isMongoId(),
    body('teamMemberId').optional().isMongoId(),
    body('date').notEmpty().isISO8601(),
    body('startTime').notEmpty().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
    body('clientInfo.firstName').notEmpty().trim(),
    body('clientInfo.lastName').notEmpty().trim(),
    body('clientInfo.phone').notEmpty().trim(),
    body('clientInfo.email').optional().isEmail().normalizeEmail(),
    body('notes').optional().trim().isLength({ max: 500 }),
  ],
  publicController.createPublicAppointment
);

// Get appointment by confirmation token
router.get('/appointments/:confirmationToken', publicController.getAppointmentByToken);

// Get appointment by modification token
router.get('/appointment/:token', publicController.getAppointmentByModificationToken);

// Cancel appointment
router.post(
  '/appointments/:confirmationToken/cancel',
  [
    body('reason').optional().trim().isLength({ max: 500 }),
  ],
  publicController.cancelPublicAppointment
);


export default router;
