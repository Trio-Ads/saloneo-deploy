import { Router } from 'express';
import { PaymentController } from '../controllers/payment.controller';
import { authenticate } from '../middleware/auth';
import { satimMock, satimMockEnabled } from '../services/satimPayment.service';

const router = Router();

// Routes publiques pour les retours SATIM (pas d'auth requise)
router.get('/satim/return', PaymentController.handlePaymentReturn);
router.get('/satim/fail', PaymentController.handlePaymentFail);

// Dev-only mock of the SATIM payment page (SATIM_MOCK=1, never in production): 404 otherwise
router.get('/satim-mock/pay', (req, res) => {
  const orderId = String(req.query.orderId || '');
  const order = satimMockEnabled() ? satimMock.get(orderId) : undefined;
  if (!order) { res.status(404).send('Not found'); return; }
  const esc = (v: string) => v.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]!));
  const link = (action: string, label: string, bg: string) =>
    `<a href="/api/payment/satim-mock/act?orderId=${encodeURIComponent(orderId)}&action=${action}" style="display:block;padding:14px;margin:8px 0;border-radius:10px;background:${bg};color:#fff;text-decoration:none;text-align:center;font-weight:600">${label}</a>`;
  res.send(`<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>SATIM (simulation)</title></head>
<body style="font-family:system-ui,sans-serif;background:#f4f4f5;margin:0;padding:24px 16px">
<main style="max-width:420px;margin:0 auto;background:#fff;border-radius:16px;padding:24px;box-shadow:0 1px 2px rgba(0,0,0,.06)">
<p style="margin:0;color:#b45309;font-size:13px;font-weight:600">Passerelle de test locale — aucun paiement réel</p>
<h1 style="font-size:20px;margin:8px 0 4px">Paiement CIB / Edahabia</h1>
<p style="margin:0 0 16px;color:#52525b">${esc(order.description)}</p>
<p style="margin:0;color:#52525b">Commande n° ${esc(order.orderNumber)}</p>
<p style="font-size:28px;font-weight:700;margin:4px 0 20px">${(order.amount / 100).toLocaleString('fr-FR')} DA</p>
${link('success', 'Payer — carte valide', '#15803d')}
${link('success_refund_fails', 'Payer — le remboursement échouera', '#0f766e')}
${link('declined', 'Refuser — solde insuffisant', '#b91c1c')}
${link('cancel', 'Annuler et revenir', '#52525b')}
</main></body></html>`);
});
router.get('/satim-mock/act', (req, res) => {
  const next = satimMockEnabled() ? satimMock.act(String(req.query.orderId || ''), String(req.query.action || '')) : null;
  if (!next) { res.status(404).send('Not found'); return; }
  res.redirect(next);
});

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
