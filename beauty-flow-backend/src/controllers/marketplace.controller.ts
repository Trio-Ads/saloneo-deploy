import { NextFunction, Request, Response } from 'express';
import { Types } from 'mongoose';
import { AuthRequest, generateRefreshToken, generateToken } from '../middleware/auth';
import { accountPayload } from './staff.controller';
import { MARKET_CATEGORIES, MarketOrder, Supplier, SupplierPayout, SupplierProduct } from '../models/Marketplace';
import { User } from '../models/User';
import { logger } from '../utils/logger';
import { WILAYAS, findWilaya, parseAddress } from '../utils/wilayas';
import { validRib } from '../services/deposits';
import { cloudStorageService } from '../services/cloudStorageService';
import * as M from '../services/marketplace';

type SupplierRequest = AuthRequest & { supplier?: any };

const fail = (res: Response, error: unknown, what: string) => {
  if (M.sendMarketError(res, error)) return;
  logger.error(`${what} error:`, error);
  res.status(500).json({ error: 'Server error' });
};
/** Wrap a handler: MarketError → its status, anything else → 500 (logged). */
const h = (what: string, fn: (req: any, res: Response) => Promise<unknown>) => async (req: Request, res: Response) => {
  try {
    const out = await fn(req, res);
    if (out !== undefined && !res.headersSent) res.json(out);
  } catch (error) {
    fail(res, error, what);
  }
};
const id = (v: unknown) => {
  const s = String(v || '');
  if (!Types.ObjectId.isValid(s)) throw new M.MarketError('NOT_FOUND');
  return s;
};
const payoutInfo = (body: any) => {
  const legalName = String(body?.legalName || '').trim().slice(0, 120);
  const method = body?.method;
  const rib = String(body?.rib || '').replace(/\D/g, '');
  if (!legalName || (method !== 'ccp' && method !== 'bank') || !validRib(method, rib)) throw new M.MarketError('INVALID', 'Coordonnées de versement invalides');
  return { legalName, method: method as 'ccp' | 'bank', rib };
};

/* ── public: "Devenir fournisseur" ───────────────────────────── */

// POST /supplier/apply — creates the account (pending) and signs the supplier in
export const apply = h('Supplier apply', async (req, res) => {
  const b = req.body || {};
  const email = String(b.email || '').trim().toLowerCase();
  const nif = String(b.nif || '').replace(/\s/g, '');
  const rc = String(b.rc || '').trim();
  const problems: string[] = [];
  if (!/^\S+@\S+\.\S+$/.test(email)) problems.push('email');
  if (String(b.password || '').length < 8) problems.push('password');
  if (String(b.companyName || '').trim().length < 2) problems.push('companyName');
  if (String(b.contactName || '').trim().length < 2) problems.push('contactName');
  if (!/^[\d +().-]{8,20}$/.test(String(b.phone || ''))) problems.push('phone');
  if (!findWilaya(b.wilaya)) problems.push('wilaya');
  if (!M.validNif(nif)) problems.push('nif');
  if (!M.validRc(rc)) problems.push('rc');
  const categories = (Array.isArray(b.categories) ? b.categories : []).filter((c: string) => (MARKET_CATEGORIES as readonly string[]).includes(c));
  if (!categories.length) problems.push('categories');
  let payout;
  try { payout = payoutInfo(b.payout); } catch { problems.push('rib'); }
  if (problems.length) throw new M.MarketError('INVALID', 'Formulaire incomplet', problems);
  const { user, supplier } = await M.createSupplierAccount({
    email, password: String(b.password), companyName: String(b.companyName).trim().slice(0, 120), contactName: String(b.contactName).trim().slice(0, 120),
    phone: String(b.phone).trim(), wilaya: b.wilaya, address: String(b.address || '').trim().slice(0, 300), nif, rc, categories,
    description: String(b.description || '').trim().slice(0, 1000), payout,
  });
  const token = generateToken(String(user._id));
  const refreshToken = generateRefreshToken(String(user._id));
  await User.updateOne({ _id: user._id }, { $set: { refreshToken, lastLogin: new Date() } });
  M.notifyApplication(supplier).catch((e) => logger.error('Supplier application emails failed', e));
  res.status(201).json({ token, refreshToken, user: await accountPayload(user) });
});

/* ── supplier space ──────────────────────────────────────────── */

export const loadSupplier = async (req: SupplierRequest, res: Response, next: NextFunction) => {
  try {
    const s: any = await Supplier.findOne({ userId: req.userId }).lean();
    if (!s) { res.status(404).json({ error: 'Profil fournisseur introuvable', code: 'NOT_FOUND' }); return; }
    req.supplier = s;
    next();
  } catch (error) {
    fail(res, error, 'Load supplier');
  }
};

const supplierProfile = async (s: any) => {
  const full: any = await Supplier.findById(s._id).select('+payout').lean();
  const settings = await M.getSettings();
  return {
    id: String(full._id), companyName: full.companyName, slug: full.slug, email: full.email, contactName: full.contactName, phone: full.phone,
    wilaya: full.wilaya, address: full.address, nif: full.nif, rc: full.rc, description: full.description, categories: full.categories,
    status: full.status, statusReason: full.statusReason, shipping: full.shipping, payoutInfo: full.payout || null,
    commissionPercent: full.commissionPercent ?? settings.commissionPercent,
    settings: { autoReleaseDays: settings.autoReleaseDays, shipDeadlineDays: settings.shipDeadlineDays },
    paymentsEnabled: M.marketPaymentsEnabled(),
  };
};

export const getMe = h('Supplier me', async (req: SupplierRequest) => supplierProfile(req.supplier));

// PUT /supplier/me — company card + delivery rules (status, commission and email are admin-side)
export const updateMe = h('Supplier update', async (req: SupplierRequest) => {
  const b = req.body || {};
  const set: Record<string, any> = {};
  const text = (k: string, max: number) => { if (b[k] !== undefined) set[k] = String(b[k] || '').trim().slice(0, max); };
  text('contactName', 120); text('address', 300); text('description', 1000);
  if (b.companyName !== undefined) {
    const name = String(b.companyName).trim().slice(0, 120);
    if (name.length < 2) throw new M.MarketError('INVALID', 'Raison sociale requise');
    set.companyName = name;
  }
  if (b.phone !== undefined) {
    if (!/^[\d +().-]{8,20}$/.test(String(b.phone))) throw new M.MarketError('INVALID', 'Téléphone invalide');
    set.phone = String(b.phone).trim();
  }
  if (b.wilaya !== undefined) {
    if (!findWilaya(b.wilaya)) throw new M.MarketError('INVALID', 'Wilaya invalide');
    set.wilaya = findWilaya(b.wilaya);
  }
  if (b.nif !== undefined) {
    const nif = String(b.nif).replace(/\s/g, '');
    if (!M.validNif(nif)) throw new M.MarketError('INVALID', 'NIF invalide');
    set.nif = nif;
  }
  if (b.rc !== undefined) {
    if (!M.validRc(String(b.rc).trim())) throw new M.MarketError('INVALID', 'RC invalide');
    set.rc = String(b.rc).trim();
  }
  if (b.categories !== undefined) set.categories = (Array.isArray(b.categories) ? b.categories : []).filter((c: string) => (MARKET_CATEGORIES as readonly string[]).includes(c));
  if (b.shipping !== undefined) {
    const fee = Math.round(Number(b.shipping.fee) || 0), freeAbove = Math.round(Number(b.shipping.freeAbove) || 0), lead = Number(b.shipping.leadTimeDays);
    if (fee < 0 || fee > 1000000 || freeAbove < 0 || freeAbove > 100000000 || !Number.isInteger(lead) || lead < 0 || lead > 60) {
      throw new M.MarketError('INVALID', 'Règles de livraison invalides');
    }
    const zones = M.normalizeZones(b.shipping.zones);
    if (!zones.length) throw new M.MarketError('INVALID', 'Choisissez au moins une wilaya de livraison');
    set.shipping = { zones, fee, freeAbove, leadTimeDays: lead };
  }
  await Supplier.updateOne({ _id: req.supplier._id }, { $set: set });
  if (set.companyName) await User.updateOne({ _id: req.userId }, { $set: { establishmentName: set.companyName } });
  return supplierProfile(req.supplier);
});

export const updateSupplierPayout = h('Supplier payout info', async (req: SupplierRequest) => {
  const payout = { ...payoutInfo(req.body), updatedAt: new Date() };
  await Supplier.updateOne({ _id: req.supplier._id }, { $set: { payout } });
  return { payoutInfo: payout };
});

export const dashboard = h('Supplier dashboard', async (req: SupplierRequest) => M.supplierDashboard(req.supplier));

const productRow = (p: any) => ({
  id: String(p._id), name: p.name, brand: p.brand, category: p.category, description: p.description, photos: p.photos, unit: p.unit, sku: p.sku,
  price: p.price, minOrderQty: p.minOrderQty, stock: p.stock, leadTimeDays: p.leadTimeDays, zones: p.zones, isActive: p.isActive, updatedAt: p.updatedAt,
});

// POST /supplier/upload (multipart "file") — product photo, same storage as the salon uploads
export const uploadPhoto = h('Supplier upload', async (req: SupplierRequest) => {
  const f = (req as any).file;
  if (!f) throw new M.MarketError('INVALID', 'Aucun fichier');
  const r = await cloudStorageService.uploadFile(f.buffer, f.originalname, f.mimetype, { folder: `saloneo/suppliers/${req.supplier._id}`, optimize: true });
  return { url: r.cdnUrl || r.url };
});

export const listProducts = h('Supplier products', async (req: SupplierRequest) => {
  const rows = await SupplierProduct.find({ supplierId: req.supplier._id }).sort({ category: 1, name: 1 }).lean();
  return { products: rows.map(productRow) };
});

export const createProduct = h('Supplier create product', async (req: SupplierRequest, res) => {
  const { value, error } = M.validateProduct(req.body);
  if (!value) throw new M.MarketError('INVALID', 'Produit invalide', [error]);
  if ((await SupplierProduct.countDocuments({ supplierId: req.supplier._id })) >= 5000) throw new M.MarketError('INVALID', 'Catalogue limité à 5 000 produits');
  const p = await SupplierProduct.create({ ...value, supplierId: req.supplier._id });
  res.status(201).json({ product: productRow(p.toObject()) });
});

export const updateProduct = h('Supplier update product', async (req: SupplierRequest) => {
  const { value, error } = M.validateProduct(req.body);
  if (!value) throw new M.MarketError('INVALID', 'Produit invalide', [error]);
  const p = await SupplierProduct.findOneAndUpdate({ _id: id(req.params.id), supplierId: req.supplier._id }, { $set: value, ...(value.leadTimeDays === undefined ? { $unset: { leadTimeDays: 1 } } : {}) }, { new: true }).lean();
  if (!p) throw new M.MarketError('NOT_FOUND');
  return { product: productRow(p) };
});

// DELETE — orders keep their own snapshot of the lines, so removing a product never breaks history
export const deleteProduct = h('Supplier delete product', async (req: SupplierRequest) => {
  const r = await SupplierProduct.deleteOne({ _id: id(req.params.id), supplierId: req.supplier._id });
  if (!r.deletedCount) throw new M.MarketError('NOT_FOUND');
  return { success: true };
});

// POST /supplier/products/import { csv } — upsert by reference (sku) when given, else create
export const importProducts = h('Supplier import', async (req: SupplierRequest) => {
  const csv = String(req.body?.csv || '');
  if (!csv.trim() || csv.length > 5_000_000) throw new M.MarketError('INVALID', 'Fichier vide ou trop volumineux');
  const { rows, errors } = M.catalogFromCsv(csv);
  if (rows.length > 3000) throw new M.MarketError('INVALID', '3 000 lignes maximum par import');
  if (req.body?.dryRun) return { created: 0, updated: 0, valid: rows.length, errors };
  let created = 0, updated = 0;
  for (const r of rows) {
    if (r.sku) {
      const u = await SupplierProduct.updateOne({ supplierId: req.supplier._id, sku: r.sku }, { $set: r });
      if (u.matchedCount) { updated++; continue; }
    }
    await SupplierProduct.create({ ...r, supplierId: req.supplier._id });
    created++;
  }
  return { created, updated, valid: rows.length, errors };
});

export const supplierOrders = h('Supplier orders', async (req: SupplierRequest) =>
  M.listOrders({ supplierId: req.supplier._id }, 'supplier', req.query));

export const supplierOrder = h('Supplier order', async (req: SupplierRequest) => {
  const o: any = await MarketOrder.findOne({ _id: String(req.params.id), supplierId: req.supplier._id, status: { $nin: ['pending_payment', 'cancelled', 'expired'] } }).lean();
  if (!o) throw new M.MarketError('NOT_FOUND', 'Commande introuvable');
  const s: any = await Supplier.findById(req.supplier._id).lean();
  return { order: await M.orderView(o, 'supplier'), supplier: { companyName: s.companyName, nif: s.nif, rc: s.rc, address: s.address, wilaya: s.wilaya, phone: s.phone, email: s.email } };
});

const view = async (o: any, side: 'salon' | 'supplier' | 'admin') => ({ order: await M.orderView(o, side) });
export const acceptOrder = h('Accept order', async (req: SupplierRequest) => view(await M.acceptOrder(String(req.params.id), req.supplier._id), 'supplier'));
export const refuseOrder = h('Refuse order', async (req: SupplierRequest) => view(await M.refuseOrder(String(req.params.id), req.supplier._id, req.body?.reason), 'supplier'));
export const shipOrder = h('Ship order', async (req: SupplierRequest) =>
  view(await M.shipOrder(String(req.params.id), req.supplier._id, req.body?.carrier, req.body?.tracking), 'supplier'));
export const supplierMessage = h('Supplier message', async (req: SupplierRequest) => ({ message: await M.postMessage(String(req.params.id), 'supplier', req.supplier._id, req.body?.body) }));
export const supplierPayments = h('Supplier payments', async (req: SupplierRequest) => M.supplierPayments(req.supplier));

/* ── salon side ──────────────────────────────────────────────── */

// GET /market/context — gate, delivery wilaya and ship-to defaults from the salon profile
export const context = h('Market context', async (req: AuthRequest) => {
  const u: any = await User.findById(req.userId).select('establishmentName firstName lastName phone publicPhone address directory').lean();
  const wilaya = u?.directory?.wilaya || parseAddress(u?.address).wilaya || '';
  const [count, hasOrders] = await Promise.all([
    Supplier.countDocuments({ status: 'approved' }),
    MarketOrder.exists({ salonId: req.userId, status: { $in: ['paid', 'accepted', 'shipped', 'disputed'] } }),
  ]);
  return {
    paymentsEnabled: M.marketPaymentsEnabled(),
    wilaya,
    suppliers: count,
    hasOpenOrders: !!hasOrders,
    shipTo: {
      name: u?.establishmentName || '', contact: [u?.firstName, u?.lastName].filter(Boolean).join(' '),
      phone: u?.phone || u?.publicPhone || '', address: u?.address || '', wilaya,
    },
    wilayas: WILAYAS,
  };
});

export const browseSuppliers = h('Market suppliers', async (req) =>
  ({ suppliers: await M.browseSuppliers(findWilaya(req.query.wilaya as string), String(req.query.category || '') || undefined) }));

export const supplierPage = h('Market supplier', async (req) => {
  const s: any = await Supplier.findOne({ slug: String(req.params.slug), status: 'approved' }).lean();
  if (!s) throw new M.MarketError('NOT_FOUND', 'Fournisseur introuvable');
  const wilaya = findWilaya(req.query.wilaya as string);
  const products: any[] = await SupplierProduct.find({ supplierId: s._id, isActive: true }).sort({ category: 1, name: 1 }).lean();
  return { supplier: M.publicSupplier(s, { deliverable: wilaya ? M.deliversTo(s.shipping?.zones, wilaya) : undefined }), products: products.map((p) => M.publicProduct(p, s, wilaya)) };
});

export const searchProducts = h('Market products', async (req) => M.searchProducts({
  q: req.query.q as string, category: req.query.category as string, wilaya: findWilaya(req.query.wilaya as string),
  supplier: req.query.supplier as string, page: Number(req.query.page), onlyDeliverable: req.query.deliverable === '1',
}));

export const quote = h('Market quote', async (req) => {
  const wilaya = findWilaya(req.body?.wilaya);
  if (!wilaya) throw new M.MarketError('INVALID', 'Wilaya de livraison requise');
  const { raw, ...q } = await M.quoteCart(String(req.body?.supplierId), req.body?.items, wilaya);
  return q;
});

export const checkout = h('Market checkout', async (req: AuthRequest, res) => {
  const out = await M.checkout(req.userId!, req.body, String(req.body?.lang || '').slice(0, 2));
  res.status(201).json(out);
});

export const salonOrders = h('Salon market orders', async (req: AuthRequest) => M.listOrders({ salonId: req.userId }, 'salon', req.query));

const salonOrderView = async (o: any, salonId: string) => {
  const order = await M.orderView(o, 'salon');
  const suggestions = ['delivered', 'released', 'partially_refunded'].includes(o.status) && !o.stockAddedAt
    ? await M.stockSuggestions(salonId, o.items.map((i: any) => i.productId))
    : {};
  return { order, stockSuggestions: suggestions };
};

export const salonOrder = h('Salon market order', async (req: AuthRequest) => {
  const o: any = await MarketOrder.findOne({ _id: String(req.params.id), salonId: req.userId }).lean();
  if (!o) throw new M.MarketError('NOT_FOUND', 'Commande introuvable');
  return salonOrderView(o, req.userId!);
});

// POST /market/orders/:id/confirm-payment — back from SATIM: asks SATIM, idempotent
export const confirmPayment = h('Market confirm payment', async (req: AuthRequest) => {
  const o: any = await MarketOrder.findOne({ _id: String(req.params.id), salonId: req.userId }).select('_id').lean();
  if (!o) throw new M.MarketError('NOT_FOUND', 'Commande introuvable');
  return salonOrderView(await M.syncOrderPayment(o._id, 'return'), req.userId!);
});

export const retryPayment = h('Market retry payment', async (req: AuthRequest) =>
  ({ formUrl: await M.retryOrderPayment(String(req.params.id), req.userId!, String(req.body?.lang || '').slice(0, 2)) }));

const salonAction = (what: string, fn: (id: string, salonId: string, body: any) => Promise<any>) =>
  h(what, async (req: AuthRequest) => salonOrderView(await fn(String(req.params.id), req.userId!, req.body || {}), req.userId!));
export const cancelOrder = salonAction('Market cancel', (i, s) => M.salonCancel(i, s));
export const confirmReceived = salonAction('Market received', (i, s) => M.confirmReceived(i, s));
export const openDispute = salonAction('Market dispute', (i, s, b) => M.openDispute(i, s, b.reason));
export const addToStock = salonAction('Market add to stock', (i, s, b) => M.addToStock(i, s, b.lines));
export const salonMessage = h('Salon message', async (req: AuthRequest) => ({ message: await M.postMessage(String(req.params.id), 'salon', req.userId!, req.body?.body) }));

/* ── admin ───────────────────────────────────────────────────── */

export const adminOverview = h('Admin market overview', async () => ({
  paymentsEnabled: M.marketPaymentsEnabled(), stats: await M.adminStats(), settings: await M.getSettings(),
}));
export const adminSuppliers = h('Admin suppliers', async () => ({ suppliers: await M.adminSuppliers() }));

export const adminInvite = h('Admin invite supplier', async (req: AuthRequest, res) => {
  const b = req.body || {};
  if (!/^\S+@\S+\.\S+$/.test(String(b.email || '')) || String(b.companyName || '').trim().length < 2) throw new M.MarketError('INVALID', 'E-mail et raison sociale requis');
  const s = await M.inviteSupplier({
    email: String(b.email), companyName: String(b.companyName).trim().slice(0, 120), contactName: String(b.contactName || '').trim().slice(0, 120),
    phone: String(b.phone || '').trim().slice(0, 30), wilaya: b.wilaya,
  }, String((req.user as any)?.id));
  res.status(201).json({ supplier: { id: String(s._id), companyName: s.companyName } });
});

// PATCH /admin/marketplace/suppliers/:id { status?, reason?, commissionPercent? }
export const adminUpdateSupplier = h('Admin update supplier', async (req) => {
  const sid = id(req.params.id);
  const b = req.body || {};
  if (b.commissionPercent !== undefined) await M.setSupplierCommission(sid, b.commissionPercent);
  if (b.status !== undefined) {
    if (!['approved', 'rejected', 'suspended'].includes(b.status)) throw new M.MarketError('INVALID', 'Statut invalide');
    await M.setSupplierStatus(sid, b.status, String(b.reason || '').slice(0, 500));
  }
  return { success: true };
});

export const adminOrders = h('Admin market orders', async (req) => {
  const f: Record<string, any> = {};
  if (req.query.supplierId && Types.ObjectId.isValid(String(req.query.supplierId))) f.supplierId = new Types.ObjectId(String(req.query.supplierId));
  return M.listOrders(f, 'admin', req.query);
});

export const adminOrder = h('Admin market order', async (req) => {
  const o: any = await MarketOrder.findById(String(req.params.id)).lean();
  if (!o) throw new M.MarketError('NOT_FOUND');
  return { order: await M.orderView(o, 'admin') };
});

export const adminResolve = h('Admin resolve dispute', async (req) => {
  const decision = req.body?.decision;
  if (!['release', 'refund', 'partial'].includes(decision)) throw new M.MarketError('INVALID', 'Décision invalide');
  return view(await M.resolveDispute(String(req.params.id), decision, Number(req.body?.amount), req.body?.note), 'admin');
});
export const adminRetryRefund = h('Admin retry refund', async (req) => view(await M.retryRefund(String(req.params.id)), 'admin'));
export const adminMarkRefunded = h('Admin mark refunded', async (req) => view(await M.markRefundedManually(String(req.params.id), req.body?.note), 'admin'));
export const adminMessage = h('Admin message', async (req) => ({ message: await M.postMessage(String(req.params.id), 'admin', null, req.body?.body) }));

export const adminBalances = h('Admin market balances', async () => ({ balances: await M.adminBalances() }));
export const adminBalancesCsv = h('Admin market CSV', async (_req, res) => {
  const csv = await M.adminBalancesCsv();
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="saloneo-virements-fournisseurs-${new Date().toISOString().slice(0, 10)}.csv"`);
  res.send(csv);
});
export const adminPayout = h('Admin market payout', async (req: AuthRequest, res) => {
  const { supplierId, amount, paidAt, reference } = req.body || {};
  const payout = await M.recordSupplierPayout(String(supplierId), Number(amount), new Date(paidAt || Date.now()), String(reference || ''), (req.user as any)?.id);
  res.status(201).json({ success: true, payout });
});
export const adminPayouts = h('Admin market payouts', async (req) => {
  const f = req.query.supplierId && Types.ObjectId.isValid(String(req.query.supplierId)) ? { supplierId: String(req.query.supplierId) } : {};
  return { payouts: await SupplierPayout.find(f).sort({ paidAt: -1 }).limit(200).lean() };
});
export const adminSettings = h('Admin market settings', async (req) => ({ settings: await M.saveSettings(req.body) }));

