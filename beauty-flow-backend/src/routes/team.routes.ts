import { Router } from 'express';
import { body, param } from 'express-validator';
import * as teamController from '../controllers/team.controller';
import { authenticate, checkLimits } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get team statistics
router.get('/stats', teamController.getTeamStats);

// Get all team members
router.get('/', teamController.getAllTeamMembers);

// Get team member by ID
router.get(
  '/:id',
  [param('id').isMongoId()],
  teamController.getTeamMemberById
);

// Create new team member
router.post(
  '/',
  checkLimits('teamMembers'),
  [
    body('firstName').notEmpty().trim(),
    body('lastName').notEmpty().trim(),
    body('email').isEmail().normalizeEmail(),
    body('phone').optional().trim(),
    body('role').notEmpty().trim(),
    body('specialties').optional().isArray(),
    body('services').optional().isArray(),
    body('services.*').optional().isMongoId(),
    body('color').optional().matches(/^#[0-9A-F]{6}$/i),
    body('isActive').optional().isBoolean(),
  ],
  teamController.createTeamMember
);

// Update team member
router.put(
  '/:id',
  [
    param('id').isMongoId(),
    body('firstName').optional().notEmpty().trim(),
    body('lastName').optional().notEmpty().trim(),
    body('email').optional().isEmail().normalizeEmail(),
    body('phone').optional().trim(),
    body('role').optional().notEmpty().trim(),
    body('specialties').optional().isArray(),
    body('services').optional().isArray(),
    body('services.*').optional().isMongoId(),
    body('color').optional().matches(/^#[0-9A-F]{6}$/i),
    body('isActive').optional().isBoolean(),
  ],
  teamController.updateTeamMember
);

// Toggle team member status
router.patch(
  '/:id/toggle-status',
  [param('id').isMongoId()],
  teamController.toggleTeamMemberStatus
);

// Update working hours
router.patch(
  '/:id/working-hours',
  [
    param('id').isMongoId(),
    body('workingHours').isObject(),
  ],
  teamController.updateWorkingHours
);

// Update permissions
router.patch(
  '/:id/permissions',
  [
    param('id').isMongoId(),
    body('permissions').isObject(),
    body('permissions.canManageAppointments').optional().isBoolean(),
    body('permissions.canManageClients').optional().isBoolean(),
    body('permissions.canManageServices').optional().isBoolean(),
    body('permissions.canViewReports').optional().isBoolean(),
  ],
  teamController.updatePermissions
);

// Delete team member
router.delete(
  '/:id',
  [param('id').isMongoId()],
  teamController.deleteTeamMember
);

export default router;
