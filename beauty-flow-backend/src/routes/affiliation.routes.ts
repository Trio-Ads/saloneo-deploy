import { Router } from 'express';
import { body } from 'express-validator';
import { authenticate } from '../middleware/auth';
import {
  getAffiliationData,
  activateAffiliation,
  updateAffiliationSettings,
  getCommissions,
  getMarketingMaterials,
  generateAffiliateLink,
  trackClick,
  requestPayout,
  getAffiliationStats
} from '../controllers/affiliation.controller';

const router = Router();

// Toutes les routes nécessitent une authentification
router.use(authenticate);

// Obtenir les données d'affiliation
router.get('/stats', getAffiliationData);

// Activer le programme d'affiliation
router.post('/activate', activateAffiliation);

// Mettre à jour les paramètres d'affiliation
router.put('/settings', [
  body('payoutMethod').optional().isIn(['bank', 'paypal', 'crypto']),
  body('payoutDetails').optional().isObject(),
  body('minimumPayout').optional().isNumeric().isIn([50, 100, 200, 500])
], updateAffiliationSettings);

// Obtenir les commissions
router.get('/commissions', getCommissions);

// Obtenir le matériel marketing
router.get('/marketing-materials', getMarketingMaterials);

// Générer un lien d'affiliation
router.post('/generate-link', [
  body('campaign').optional().isString().trim()
], generateAffiliateLink);

// Demander un paiement
router.post('/payout-request', [
  body('amount').isNumeric().isFloat({ min: 50 }).withMessage('Le montant minimum est de 50€')
], requestPayout);

// Obtenir les statistiques détaillées
router.get('/detailed-stats', getAffiliationStats);

// Route publique pour tracker les clics (pas d'authentification requise)
router.post('/track-click/:affiliateCode', trackClick);

export default router;
