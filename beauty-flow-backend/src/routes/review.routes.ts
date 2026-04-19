import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { listReviews, createReview, updateReview, deleteReview } from '../controllers/review.controller';

const router = Router();

router.get('/',       authenticate, listReviews);
router.post('/',      authenticate, createReview);
router.patch('/:id',  authenticate, updateReview);
router.delete('/:id', authenticate, deleteReview);

export default router;
