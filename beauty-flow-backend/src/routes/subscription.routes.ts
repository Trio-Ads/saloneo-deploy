import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { getUsageStats } from '../middleware/checkLimits';

const router = Router();

// Route pour obtenir les statistiques d'utilisation
router.get('/usage-stats', authenticate, getUsageStats);

export default router;
