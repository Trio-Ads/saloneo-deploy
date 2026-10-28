import { Router } from 'express';
import { authenticate, authenticateAny, requireRole } from '../middleware/auth';
import { adminAuth, logAdminAction } from '../middleware/adminAuth';
import { uploadSingle } from '../middleware/upload';
import * as C from '../controllers/marketplace.controller';

/** /api/supplier — "Devenir fournisseur" (public), then the supplier space (role supplier only). */
export const supplierRoutes = Router();
supplierRoutes.post('/apply', C.apply);
supplierRoutes.use(authenticateAny, requireRole('supplier'), C.loadSupplier);
supplierRoutes.get('/me', C.getMe);
supplierRoutes.put('/me', C.updateMe);
supplierRoutes.put('/payout-info', C.updateSupplierPayout);
supplierRoutes.get('/dashboard', C.dashboard);
supplierRoutes.post('/upload', uploadSingle('file'), C.uploadPhoto);
supplierRoutes.get('/products', C.listProducts);
supplierRoutes.post('/products', C.createProduct);
supplierRoutes.post('/products/import', C.importProducts);
supplierRoutes.put('/products/:id', C.updateProduct);
supplierRoutes.delete('/products/:id', C.deleteProduct);
supplierRoutes.get('/orders', C.supplierOrders);
supplierRoutes.get('/orders/:id', C.supplierOrder);
supplierRoutes.post('/orders/:id/accept', C.acceptOrder);
supplierRoutes.post('/orders/:id/refuse', C.refuseOrder);
supplierRoutes.post('/orders/:id/ship', C.shipOrder);
supplierRoutes.post('/orders/:id/messages', C.supplierMessage);
supplierRoutes.get('/payments', C.supplierPayments);

/** /api/market — the salon buys (salon owner only: staff and suppliers are refused). */
export const marketRoutes = Router();
marketRoutes.use(authenticate, requireRole('owner', 'admin'));
marketRoutes.get('/context', C.context);
marketRoutes.get('/suppliers', C.browseSuppliers);
marketRoutes.get('/suppliers/:slug', C.supplierPage);
marketRoutes.get('/products', C.searchProducts);
marketRoutes.post('/quote', C.quote);
marketRoutes.get('/orders', C.salonOrders);
marketRoutes.post('/orders', C.checkout);
marketRoutes.get('/orders/:id', C.salonOrder);
marketRoutes.post('/orders/:id/confirm-payment', C.confirmPayment);
marketRoutes.post('/orders/:id/retry', C.retryPayment);
marketRoutes.post('/orders/:id/cancel', C.cancelOrder);
marketRoutes.post('/orders/:id/received', C.confirmReceived);
marketRoutes.post('/orders/:id/dispute', C.openDispute);
marketRoutes.post('/orders/:id/stock', C.addToStock);
marketRoutes.post('/orders/:id/messages', C.salonMessage);

/** /api/admin/marketplace — validation, arbitration, escrow, payouts, settings. */
export const adminMarketRoutes = Router();
adminMarketRoutes.use(authenticate, adminAuth, logAdminAction);
adminMarketRoutes.get('/overview', C.adminOverview);
adminMarketRoutes.put('/settings', C.adminSettings);
adminMarketRoutes.get('/suppliers', C.adminSuppliers);
adminMarketRoutes.post('/suppliers/invite', C.adminInvite);
adminMarketRoutes.patch('/suppliers/:id', C.adminUpdateSupplier);
adminMarketRoutes.get('/orders', C.adminOrders);
adminMarketRoutes.get('/orders/:id', C.adminOrder);
adminMarketRoutes.post('/orders/:id/resolve', C.adminResolve);
adminMarketRoutes.post('/orders/:id/refund', C.adminRetryRefund);
adminMarketRoutes.post('/orders/:id/mark-refunded', C.adminMarkRefunded);
adminMarketRoutes.post('/orders/:id/messages', C.adminMessage);
adminMarketRoutes.get('/balances', C.adminBalances);
adminMarketRoutes.get('/balances.csv', C.adminBalancesCsv);
adminMarketRoutes.get('/payouts', C.adminPayouts);
adminMarketRoutes.post('/payouts', C.adminPayout);
