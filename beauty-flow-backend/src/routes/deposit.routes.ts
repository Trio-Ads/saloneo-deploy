import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { getSalonDeposits, updatePayoutInfo } from '../controllers/deposit.controller';

// Salon side of online deposits: balance, history, payout details (Profil → Acomptes)
const router = Router();
router.use(authenticate);
router.get('/', getSalonDeposits);
router.put('/payout-info', updatePayoutInfo);

export default router;
