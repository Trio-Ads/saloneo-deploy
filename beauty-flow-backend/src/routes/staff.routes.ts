import { Router } from 'express';
import * as staff from '../controllers/staff.controller';
import { authenticate, requireRole } from '../middleware/auth';
import { uploadSingle } from '../middleware/upload';

// Staff space: the logged-in team member's own profile, leave requests and stats (staff logins only)
const router = Router();

router.use(authenticate, requireRole('staff'));

router.get('/me', staff.getMe);
router.put('/me', staff.updateMe);
router.put('/me/password', staff.updateMyPassword);
router.get('/me/stats', staff.getMyStats);

router.get('/leaves', staff.myLeaves);
router.post('/leaves', staff.requestLeave);
router.post('/leaves/seen', staff.markDecisionsSeen);
router.delete('/leaves/:id', staff.cancelMyLeave);

export default router;

// Leave certificates: staff upload theirs; owner and that staff member read it (checked in the controller)
export const leaveAttachmentRoutes = Router();
leaveAttachmentRoutes.use(authenticate);
leaveAttachmentRoutes.post('/', uploadSingle('file'), staff.uploadLeaveAttachment);
leaveAttachmentRoutes.get('/:id', staff.getLeaveAttachment);
