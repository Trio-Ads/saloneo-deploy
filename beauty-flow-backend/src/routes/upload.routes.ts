import { Router } from 'express';
import * as uploadController from '../controllers/upload.controller';
import { authenticate } from '../middleware/auth';
import { uploadSingle, uploadMultiple } from '../middleware/upload';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Upload single file
router.post('/single/:type', uploadSingle('file'), uploadController.uploadFile);

// Upload multiple files
router.post('/multiple/:type', uploadMultiple('files'), uploadController.uploadMultipleFiles);

// Upload profile avatar
router.post('/avatar', uploadSingle('avatar'), uploadController.uploadProfileAvatar);

// Upload service image
router.post('/service/:serviceId/image', uploadSingle('image'), uploadController.uploadServiceImage);

// Upload team member avatar
router.post('/team/:teamMemberId/avatar', uploadSingle('avatar'), uploadController.uploadTeamMemberAvatar);

// Delete file
router.delete('/file', uploadController.deleteFile);

export default router;
