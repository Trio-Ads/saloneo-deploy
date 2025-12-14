import { Router } from 'express';
import { feedbackController } from '../controllers/feedback.controller';
import { authenticate } from '../middleware/auth';
import { adminAuth } from '../middleware/adminAuth';

const router = Router();

/**
 * @route   POST /api/admin/feedback/send/:userId
 * @desc    Send feedback request email to a specific user
 * @access  Admin only
 */
router.post('/admin/feedback/send/:userId', 
  authenticate, 
  adminAuth, 
  async (req, res) => {
    await feedbackController.sendFeedbackToUser(req, res);
  }
);

/**
 * @route   GET /api/admin/feedback/stats
 * @desc    Get feedback statistics
 * @access  Admin only
 */
router.get('/admin/feedback/stats', 
  authenticate, 
  adminAuth, 
  async (req, res) => {
    await feedbackController.getFeedbackStats(req, res);
  }
);

/**
 * @route   POST /api/feedback/submit
 * @desc    Submit user feedback (public endpoint)
 * @access  Public
 */
router.post('/feedback/submit', async (req, res) => {
  await feedbackController.submitFeedback(req, res);
});

export default router;
