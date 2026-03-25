import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { getUsageStats } from '../middleware/checkLimits';
import {
  getCurrentSubscription,
  getPlans,
  subscribe,
  cancel,
  getInvoices,
} from '../controllers/subscription.controller';

const router = Router();

// Route pour obtenir les statistiques d'utilisation
router.get('/usage-stats', authenticate, getUsageStats);

// Subscription endpoints used by frontend
router.get('/', authenticate, getCurrentSubscription);
router.get('/plans', authenticate, getPlans);
router.post('/subscribe', authenticate, subscribe);
router.post('/cancel', authenticate, cancel);
router.get('/invoices', authenticate, getInvoices);

export default router;
