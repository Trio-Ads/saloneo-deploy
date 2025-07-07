import { Router } from 'express';
import { PaymentController } from '../controllers/payment.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// Routes publiques pour les retours SATIM (pas d'auth requise)
router.get('/satim/return', PaymentController.handlePaymentReturn);
router.get('/satim/fail', PaymentController.handlePaymentFail);

// Routes protégées (authentification requise)
// Initier un paiement SATIM
router.post('/satim/initiate', authenticate, PaymentController.initiateSatimPayment);

// Vérifier le statut d'une transaction
router.get('/transaction/:transactionId/status', authenticate, PaymentController.checkTransactionStatus);

// Historique des transactions
router.get('/transactions', authenticate, PaymentController.getTransactionHistory);

// Routes admin (TODO: ajouter middleware admin)
router.post('/transaction/:transactionId/refund', authenticate, PaymentController.initiateRefund);

export default router;
