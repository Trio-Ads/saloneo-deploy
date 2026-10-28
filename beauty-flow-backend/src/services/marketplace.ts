/**
 * Supplier marketplace (B2B supplies). The salon pays by CIB / Edahabia (SATIM) on Saloneo's merchant account;
 * the money stays in escrow until the salon confirms delivery (or auto-release), then goes to the supplier's
 * balance minus the Saloneo commission and is paid out by bank transfer. Saloneo never handles logistics.
 *
 * Pure rules first (totals, fees, commission, state machine, deadlines, ledger, CSV — tested in
 * __tests__/marketplace.test.ts), then the operations. Every status change goes through transition():
 * an atomic compare-and-set on the current status (confirming twice never credits twice) that appends a MarketOrderEvent.
 *
 * pending_payment → paid → accepted → shipped → delivered → released
 *                                   ↘ disputed → released | refunded | partially_refunded (admin)
 * paid / accepted → refund_pending → refunded (refused, ship deadline passed, cancelled by the salon)
 * pending_payment → cancelled | expired (a late SATIM payment still lands as paid)
 */
import { Types } from 'mongoose';
import * as cron from 'node-cron';
import crypto from 'crypto';
import {
  ALL_ZONES, DEFAULT_MARKET_SETTINGS, IMarketOrder, ISupplier, MARKET_CATEGORIES, MarketCategory, MarketOrder, MarketOrderEvent,
  MarketSettings, MarketSettingsDoc, OrderStatus, Supplier, SupplierPayout, SupplierProduct,
} from '../models/Marketplace';
import { Product } from '../models/Product';
import { User } from '../models/User';
import { satimPaymentService } from './satimPayment.service';
import { adminEmails, commissionOf, notice } from './deposits';
import { withSlotLock } from './availability';
import { WILAYAS, findWilaya } from '../utils/wilayas';
import { generateSalonSlug } from '../utils/slug';
import { logger } from '../utils/logger';

/**
 * Production gate: online payment of orders runs only with MARKETPLACE_PAYMENTS_ENABLED=1.
 * Off: catalogue, cart and quote work; checkout is refused (no order is created, nothing is confirmed).
 */
export const marketPaymentsEnabled = () => ['1', 'true'].includes(String(process.env.MARKETPLACE_PAYMENTS_ENABLED || '').toLowerCase());

export const UNPAID_EXPIRY_MINUTES = 60;
export const MAX_ATTEMPTS = 5;
export const MAX_LINES = 60;
export const MAX_QTY = 10000;
const DAY_MS = 86400000;
export const TZ = 'Africa/Algiers';

/* ── pure rules ──────────────────────────────────────────────── */

export interface Shipping { zones: string[]; fee: number; freeAbove: number; leadTimeDays: number }

/** Flat fee per order, waived from `freeAbove` DA of goods (0 = never free). */
export function deliveryFee(subtotal: number, shipping: Pick<Shipping, 'fee' | 'freeAbove'>): number {
  const fee = Math.max(0, Math.round(Number(shipping?.fee) || 0));
  const free = Math.max(0, Math.round(Number(shipping?.freeAbove) || 0));
  return fee === 0 || (free > 0 && subtotal >= free) ? 0 : fee;
}

export function orderTotals(lines: { price: number; qty: number }[], shipping: Pick<Shipping, 'fee' | 'freeAbove'>) {
  const subtotal = lines.reduce((s, l) => s + Math.round(l.price) * l.qty, 0);
  const fee = lines.length ? deliveryFee(subtotal, shipping) : 0;
  return { subtotal, deliveryFee: fee, total: subtotal + fee };
}

/** What the supplier gets once an order settles: the kept amount (total − refund) minus the commission on it. */
export function settlement(total: number, refundAmount: number, percent: number) {
  const share = Math.max(0, Math.round(total) - Math.round(refundAmount || 0));
  const commission = commissionOf(share, percent);
  return { share, commission, net: share - commission };
}

export const TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending_payment: ['paid', 'cancelled', 'expired'],
  // A SATIM payment that lands after expiry/abandon is still the salon's money: take it, the supplier accepts or refuses
  expired: ['paid'],
  cancelled: ['paid'],
  paid: ['accepted', 'refund_pending'],
  accepted: ['shipped', 'delivered', 'disputed', 'refund_pending'],
  shipped: ['delivered', 'disputed', 'released'],
  delivered: ['released'],
  disputed: ['released', 'refund_pending'],
  refund_pending: ['refund_pending', 'refunded', 'partially_refunded'],
  released: [],
  refunded: [],
  partially_refunded: [],
};
export const canTransition = (from: OrderStatus, to: OrderStatus) => TRANSITIONS[from]?.includes(to) ?? false;

/** Money held by Saloneo, not yet the supplier's. */
export const ESCROW: OrderStatus[] = ['paid', 'accepted', 'shipped', 'delivered', 'disputed'];
export const SETTLED: OrderStatus[] = ['released', 'partially_refunded'];

export interface SupplierLedger { pending: number; earned: number; commission: number; paidOut: number; available: number }
/** Supplier balance: en attente (escrow, net of the expected commission) · disponible (settled − payouts) · versé. */
export function supplierLedger(orders: { status: string; total: number; refundAmount?: number; commission?: number; commissionPercent?: number }[], payouts: { amount: number }[]): SupplierLedger {
  const l = { pending: 0, earned: 0, commission: 0, paidOut: 0, available: 0 };
  for (const o of orders) {
    if ((ESCROW as string[]).includes(o.status)) l.pending += settlement(o.total, 0, o.commissionPercent || 0).net;
    if ((SETTLED as string[]).includes(o.status)) {
      const share = Math.max(0, o.total - (o.status === 'partially_refunded' ? o.refundAmount || 0 : 0));
      l.earned += share;
      l.commission += o.commission || 0;
    }
  }
  l.paidOut = payouts.reduce((s, p) => s + p.amount, 0);
  l.available = l.earned - l.commission - l.paidOut;
  return l;
}

export const addDays = (d: Date | string, days: number) => new Date(new Date(d).getTime() + days * DAY_MS);

export type DueAction = 'expire' | 'ship_deadline' | 'remind_ship' | 'auto_release' | 'remind_last' | 'remind_first';
/**
 * What the jobs must do with an order now. Algeria has no DST, so "N days" is exactly N × 24 h after the event
 * (dates are shown in Africa/Algiers). Reminders go out once, before the deadline: the salon at D+3 and on the
 * eve of auto-release (D+6 for 7 days); the supplier on the eve of the shipping deadline.
 */
export function dueAction(
  o: { status: string; createdAt?: Date | string; paidAt?: Date | string; shipment?: { shippedAt?: Date | string }; reminders?: { d3?: boolean; d6?: boolean; ship?: boolean } },
  s: MarketSettingsDoc,
  now: Date,
): DueAction | null {
  const t = now.getTime(), r = o.reminders || {};
  if (o.status === 'pending_payment' && o.createdAt) return t >= new Date(o.createdAt).getTime() + UNPAID_EXPIRY_MINUTES * 60000 ? 'expire' : null;
  if ((o.status === 'paid' || o.status === 'accepted') && o.paidAt) {
    const deadline = addDays(o.paidAt, s.shipDeadlineDays).getTime();
    if (t >= deadline) return 'ship_deadline';
    if (!r.ship && t >= deadline - DAY_MS) return 'remind_ship';
    return null;
  }
  if (o.status === 'shipped' && o.shipment?.shippedAt) {
    const shipped = new Date(o.shipment.shippedAt).getTime();
    if (t >= shipped + s.autoReleaseDays * DAY_MS) return 'auto_release';
    if (!r.d6 && s.autoReleaseDays > 1 && t >= shipped + (s.autoReleaseDays - 1) * DAY_MS) return 'remind_last';
    if (!r.d3 && !r.d6 && s.autoReleaseDays > 4 && t >= shipped + 3 * DAY_MS) return 'remind_first';
  }
  return null;
}

/** "28/10/2026 à 14:05" in Algiers time. */
export function algiersDateTime(d: Date | string): string {
  const p = Object.fromEntries(new Intl.DateTimeFormat('fr-FR', { timeZone: TZ, day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false })
    .formatToParts(new Date(d)).map((x) => [x.type, x.value]));
  return `${p.day}/${p.month}/${p.year} à ${p.hour === '24' ? '00' : p.hour}:${p.minute}`;
}
const algiersDay = (d: Date | string) => algiersDateTime(d).slice(0, 10);
/** First instant of the current month in Algiers (UTC+1). */
export function monthStart(now = new Date()): Date {
  const local = new Date(now.getTime() + 3600000);
  return new Date(Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), 1) - 3600000);
}

export const deliversTo = (zones: string[] | undefined, wilaya?: string) => !!wilaya && !!zones && (zones.includes(ALL_ZONES) || zones.includes(wilaya));
export const productZones = (p: { zones?: string[] }, supplier: { shipping?: { zones?: string[] } }) => (p.zones?.length ? p.zones : supplier.shipping?.zones || []);
export const leadTime = (p: { leadTimeDays?: number | null }, supplier: { shipping?: { leadTimeDays?: number } }) =>
  p.leadTimeDays ?? supplier.shipping?.leadTimeDays ?? 3;

export type LineProblem = 'UNAVAILABLE' | 'MIN_QTY' | 'OUT_OF_STOCK' | 'NOT_DELIVERED' | 'BAD_QTY';
/** Why a cart line cannot be ordered as is (null = fine). */
export function lineProblem(p: { isActive?: boolean; minOrderQty?: number; stock?: number; zones?: string[] } | null, qty: number, wilaya: string, supplier: { shipping?: { zones?: string[] } }): LineProblem | null {
  if (!p || p.isActive === false) return 'UNAVAILABLE';
  if (!Number.isInteger(qty) || qty < 1 || qty > MAX_QTY) return 'BAD_QTY';
  if ((p.stock ?? 0) < qty) return 'OUT_OF_STOCK';
  if (qty < (p.minOrderQty || 1)) return 'MIN_QTY';
  if (!deliversTo(productZones(p, supplier), wilaya)) return 'NOT_DELIVERED';
  return null;
}

/* Catalogue: validation and CSV import */

/** French labels (CSV column "categorie" accepts the key or this label). */
export const CATEGORY_LABELS: Record<MarketCategory, string> = {
  coloration: 'Coloration', hair_care: 'Soins cheveux', styling: 'Coiffage', nails: 'Ongles', lashes_brows: 'Cils & sourcils',
  face_care: 'Soins visage', body_care: 'Soins corps', waxing: 'Épilation', hygiene: 'Hygiène & jetables', equipment: 'Matériel & mobilier', spa: 'Spa & hammam',
};
const fold = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
const categoryByName = new Map<string, MarketCategory>(
  MARKET_CATEGORIES.flatMap((c) => [[fold(c), c], [fold(CATEGORY_LABELS[c]), c]] as [string, MarketCategory][])
);
export const findCategory = (v: unknown): MarketCategory | undefined => categoryByName.get(fold(String(v ?? '')));

/** Zones from a list of names/"ALL"/"toute l'Algérie" (unknown names dropped). */
export function normalizeZones(raw: unknown): string[] {
  const list = Array.isArray(raw) ? raw : String(raw ?? '').split(/[|,;]/);
  const out = new Set<string>();
  for (const z of list) {
    const s = String(z).trim();
    if (!s) continue;
    if (s === ALL_ZONES || /^toute?s? l.?alg[ée]rie$|^all$/i.test(s)) return [ALL_ZONES];
    const w = findWilaya(s) || (/^\d{1,2}$/.test(s) ? WILAYAS[Number(s) - 1] : undefined);
    if (w) out.add(w);
  }
  return [...out];
}

export interface ProductInput {
  name: string; brand?: string; category: MarketCategory; description?: string; unit: string; sku?: string;
  price: number; minOrderQty: number; stock: number; leadTimeDays?: number; zones: string[]; photos: string[]; isActive: boolean;
}
const num = (v: unknown) => {
  if (typeof v === 'number') return v;
  const s = String(v ?? '').replace(/\s|DA|da/g, '').replace(',', '.');
  return s === '' ? NaN : Number(s);
};
const str = (v: unknown, max: number) => String(v ?? '').trim().slice(0, max);
const isUrl = (u: string) => /^https?:\/\/\S+$/i.test(u) || /^\/uploads\/\S+$/.test(u);

/** Server-side validation of a product (form or CSV row): { value } or { error: field }. */
export function validateProduct(raw: any): { value?: ProductInput; error?: string } {
  const name = str(raw?.name, 140);
  if (name.length < 2) return { error: 'name' };
  const category = findCategory(raw?.category);
  if (!category) return { error: 'category' };
  const price = Math.round(num(raw?.price));
  if (!(price >= 1 && price <= 100000000)) return { error: 'price' };
  const minOrderQty = raw?.minOrderQty === undefined || raw?.minOrderQty === '' ? 1 : num(raw.minOrderQty);
  if (!Number.isInteger(minOrderQty) || minOrderQty < 1 || minOrderQty > MAX_QTY) return { error: 'minOrderQty' };
  const stock = raw?.stock === undefined || raw?.stock === '' ? 0 : num(raw.stock);
  if (!Number.isInteger(stock) || stock < 0 || stock > 10000000) return { error: 'stock' };
  const lead = raw?.leadTimeDays === undefined || raw?.leadTimeDays === '' || raw?.leadTimeDays === null ? undefined : num(raw.leadTimeDays);
  if (lead !== undefined && !(Number.isInteger(lead) && lead >= 0 && lead <= 60)) return { error: 'leadTimeDays' };
  const photos = (Array.isArray(raw?.photos) ? raw.photos : String(raw?.photos ?? '').split(/[|\s]+/)).map((u: unknown) => String(u).trim()).filter(Boolean);
  if (photos.some((u: string) => !isUrl(u)) || photos.length > 6) return { error: 'photos' };
  return {
    value: {
      name, category, price, minOrderQty, stock, photos,
      brand: str(raw?.brand, 80) || undefined,
      description: str(raw?.description, 1500) || undefined,
      unit: str(raw?.unit, 60) || 'Unité',
      sku: str(raw?.sku, 60) || undefined,
      leadTimeDays: lead,
      zones: normalizeZones(raw?.zones),
      isActive: raw?.isActive !== false && raw?.isActive !== 'false',
    },
  };
}

/** CSV columns (header row required, ';' or ',' separated, UTF-8). Documented in the supplier catalogue screen. */
export const CSV_COLUMNS = ['nom', 'marque', 'categorie', 'description', 'unite', 'reference', 'prix_ttc', 'quantite_min', 'stock', 'delai_jours', 'zones', 'photos'] as const;
const CSV_FIELD: Record<string, keyof ProductInput> = {
  nom: 'name', marque: 'brand', categorie: 'category', description: 'description', unite: 'unit', reference: 'sku',
  prix_ttc: 'price', prix: 'price', quantite_min: 'minOrderQty', stock: 'stock', delai_jours: 'leadTimeDays', zones: 'zones', photos: 'photos',
};

/** RFC 4180-ish parser (quotes, doubled quotes, newlines inside quotes), separator auto-detected from the header. */
export function parseCsv(text: string): string[][] {
  const src = text.replace(/^﻿/, '');
  const head = src.split(/\r?\n/, 1)[0] || '';
  const sep = (head.match(/;/g) || []).length >= (head.match(/,/g) || []).length ? ';' : ',';
  const rows: string[][] = [];
  let row: string[] = [], cell = '', q = false;
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (q) {
      if (c === '"' && src[i + 1] === '"') { cell += '"'; i++; } else if (c === '"') q = false; else cell += c;
    } else if (c === '"') q = true;
    else if (c === sep) { row.push(cell); cell = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && src[i + 1] === '\n') i++;
      row.push(cell); rows.push(row); row = []; cell = '';
    } else cell += c;
  }
  if (cell !== '' || row.length) { row.push(cell); rows.push(row); }
  return rows.filter((r) => r.some((c) => c.trim() !== ''));
}

/** Catalogue rows from a CSV: valid products + one error per invalid line (1-based, header = line 1). */
export function catalogFromCsv(text: string): { rows: ProductInput[]; errors: { line: number; field: string }[] } {
  const all = parseCsv(text);
  if (!all.length) return { rows: [], errors: [{ line: 1, field: 'header' }] };
  const header = all[0].map((h) => fold(h).replace(/ /g, '_'));
  if (!header.includes('nom') || !header.some((h) => h === 'prix_ttc' || h === 'prix') || !header.includes('categorie')) {
    return { rows: [], errors: [{ line: 1, field: 'header' }] };
  }
  const rows: ProductInput[] = [], errors: { line: number; field: string }[] = [];
  all.slice(1).forEach((cells, i) => {
    const raw: Record<string, string> = {};
    header.forEach((h, j) => { if (CSV_FIELD[h]) raw[CSV_FIELD[h]] = cells[j] ?? ''; });
    const { value, error } = validateProduct(raw);
    if (value) rows.push(value); else errors.push({ line: i + 2, field: error! });
  });
  return { rows, errors };
}

/** NIF: 15 digits (20 accepted for older cards). RC: free form "16/00-1234567B21". */
export const validNif = (s: string) => /^\d{15}(\d{5})?$/.test(s);
export const validRc = (s: string) => s.length >= 5 && s.length <= 30 && /^[\w/ .-]+$/.test(s);

/* ── errors ──────────────────────────────────────────────────── */

export type MarketErrorCode =
  | 'NOT_FOUND' | 'INVALID' | 'NOT_ALLOWED' | 'PAYMENT_UNAVAILABLE' | 'TOO_MANY_ATTEMPTS' | 'VERIFY_FAILED'
  | 'SUPPLIER_UNAVAILABLE' | 'CART_INVALID' | 'PAYOUT_EXCEEDS_BALANCE' | 'EMAIL_TAKEN' | 'NOT_APPROVED';
const HTTP: Record<MarketErrorCode, number> = {
  NOT_FOUND: 404, INVALID: 400, NOT_ALLOWED: 409, PAYMENT_UNAVAILABLE: 503, TOO_MANY_ATTEMPTS: 429, VERIFY_FAILED: 502,
  SUPPLIER_UNAVAILABLE: 409, CART_INVALID: 409, PAYOUT_EXCEEDS_BALANCE: 400, EMAIL_TAKEN: 409, NOT_APPROVED: 403,
};
export class MarketError extends Error {
  constructor(public code: MarketErrorCode, message: string = code, public details?: unknown) { super(message); }
  get status() { return HTTP[this.code]; }
}
export function sendMarketError(res: any, error: unknown): boolean {
  if (!(error instanceof MarketError)) return false;
  res.status(error.status).json({ error: error.message, code: error.code, ...(error.details ? { details: error.details } : {}) });
  return true;
}

/* ── settings ────────────────────────────────────────────────── */

export async function getSettings(): Promise<MarketSettingsDoc> {
  const s: any = await MarketSettings.findById('marketplace').lean();
  return {
    commissionPercent: s?.commissionPercent ?? DEFAULT_MARKET_SETTINGS.commissionPercent,
    autoReleaseDays: s?.autoReleaseDays ?? DEFAULT_MARKET_SETTINGS.autoReleaseDays,
    shipDeadlineDays: s?.shipDeadlineDays ?? DEFAULT_MARKET_SETTINGS.shipDeadlineDays,
  };
}

export async function saveSettings(raw: any): Promise<MarketSettingsDoc> {
  const pct = Number(raw?.commissionPercent), rel = Number(raw?.autoReleaseDays), ship = Number(raw?.shipDeadlineDays);
  if (!(pct >= 0 && pct <= 100) || !Number.isInteger(rel) || rel < 1 || rel > 60 || !Number.isInteger(ship) || ship < 1 || ship > 60) {
    throw new MarketError('INVALID', 'Paramètres invalides');
  }
  const value = { commissionPercent: Math.round(pct * 10) / 10, autoReleaseDays: rel, shipDeadlineDays: ship };
  await MarketSettings.updateOne({ _id: 'marketplace' }, { $set: value }, { upsert: true });
  return value;
}

/* ── suppliers ───────────────────────────────────────────────── */

async function uniqueSupplierSlug(name: string, id?: Types.ObjectId): Promise<string> {
  const base = generateSalonSlug(name) || 'fournisseur';
  let slug = base;
  for (let i = 2; await Supplier.exists({ slug, ...(id ? { _id: { $ne: id } } : {}) }); i++) slug = `${base}-${i}`;
  return slug;
}

/** Account (User role supplier) + Supplier profile. Public signup → pending; admin invite → approved, password set by link. */
export async function createSupplierAccount(input: {
  email: string; password?: string; companyName: string; contactName?: string; phone?: string; wilaya?: string; address?: string;
  nif?: string; rc?: string; categories?: string[]; description?: string; payout?: { legalName: string; method: 'ccp' | 'bank'; rib: string };
}, invitedBy?: string) {
  const email = String(input.email || '').trim().toLowerCase();
  if (await User.exists({ email })) throw new MarketError('EMAIL_TAKEN', 'Un compte existe déjà avec cet e-mail');
  const user: any = await User.create({
    email,
    password: input.password || crypto.randomBytes(24).toString('hex'),
    firstName: input.contactName || '',
    establishmentName: input.companyName,
    phone: input.phone,
    address: input.address,
    role: 'supplier',
    isEmailVerified: !!input.password,
    // Never a salon: no trial, never listed in the directory
    subscription: { plan: 'FREE', isActive: false, startDate: new Date() },
    directory: { listed: false },
  });
  try {
    const supplier = await Supplier.create({
      userId: user._id,
      companyName: input.companyName,
      slug: await uniqueSupplierSlug(input.companyName),
      email,
      contactName: input.contactName,
      phone: input.phone,
      wilaya: findWilaya(input.wilaya),
      address: input.address,
      nif: input.nif,
      rc: input.rc,
      description: input.description,
      categories: (input.categories || []).map(findCategory).filter(Boolean),
      status: invitedBy ? 'approved' : 'pending',
      approvedAt: invitedBy ? new Date() : undefined,
      invited: !!invitedBy,
      shipping: { zones: input.wilaya && findWilaya(input.wilaya) ? [findWilaya(input.wilaya)!] : [], fee: 0, freeAbove: 0, leadTimeDays: 3 },
      ...(input.payout ? { payout: { ...input.payout, updatedAt: new Date() } } : {}),
    });
    return { user, supplier };
  } catch (error) {
    await User.deleteOne({ _id: user._id });
    throw error;
  }
}

/** Invited supplier: a password link valid 7 days (the reset-password page sets it). */
export async function inviteSupplier(input: { email: string; companyName: string; contactName?: string; phone?: string; wilaya?: string }, adminId: string) {
  const { user, supplier } = await createSupplierAccount(input, adminId);
  const token = crypto.randomBytes(32).toString('hex');
  await User.updateOne({ _id: user._id }, { $set: { passwordResetToken: crypto.createHash('sha256').update(token).digest('hex'), passwordResetExpires: addDays(new Date(), 7) } });
  notice(supplier.email, {
    subject: 'Invitation : vendez vos produits aux salons sur Saloneo',
    title: `Bienvenue sur Saloneo, ${supplier.companyName}`,
    intro: "Saloneo vous invite à proposer vos produits professionnels aux salons de beauté. Saloneo encaisse le paiement de chaque commande et vous le reverse après la livraison ; vous livrez avec votre propre transporteur.",
    rows: [['Identifiant', supplier.email]],
    note: 'Ce lien est valable 7 jours. Complétez ensuite votre fiche entreprise (NIF, RC, RIB) et votre catalogue.',
    buttonLabel: 'Créer mon mot de passe',
    buttonUrl: `${frontend()}/reset-password?token=${token}`,
  }).catch((e) => logger.error('Supplier invite email failed', e));
  return supplier;
}

export async function setSupplierStatus(id: string, status: 'approved' | 'rejected' | 'suspended', reason?: string) {
  const s: any = await Supplier.findByIdAndUpdate(id, {
    $set: { status, statusReason: reason || '', ...(status === 'approved' ? { approvedAt: new Date() } : {}) },
  }, { new: true }).lean();
  if (!s) throw new MarketError('NOT_FOUND');
  const texts = {
    approved: { subject: 'Votre compte fournisseur Saloneo est validé', title: 'Compte validé', intro: 'Votre catalogue est désormais visible par les salons qui se trouvent dans vos zones de livraison.' },
    rejected: { subject: 'Votre demande fournisseur Saloneo', title: 'Demande non retenue', intro: "Après examen, nous ne pouvons pas valider votre compte fournisseur pour le moment." },
    suspended: { subject: 'Votre compte fournisseur Saloneo est suspendu', title: 'Compte suspendu', intro: "Votre catalogue n'est plus visible par les salons. Les commandes en cours restent à honorer." },
  }[status];
  notice(s.email, { ...texts, rows: [['Motif', reason || '']], buttonLabel: 'Ouvrir mon espace fournisseur', buttonUrl: `${frontend()}/fournisseur` })
    .catch((e) => logger.error('Supplier status email failed', e));
  return s;
}

export const supplierOfUser = (userId: string) => Supplier.findOne({ userId }).lean() as Promise<ISupplier | null>;

/** Public card of a supplier (no RIB, no NIF). */
export const publicSupplier = <T extends object>(s: any, extra: T = {} as T) => ({
  id: String(s._id), slug: s.slug, companyName: s.companyName, wilaya: s.wilaya, description: s.description,
  categories: s.categories, shipping: s.shipping, phone: s.phone, ...extra,
});

/* ── catalogue for salons ────────────────────────────────────── */

export const publicProduct = (p: any, supplier: any, wilaya?: string) => ({
  id: String(p._id), supplierId: String(p.supplierId), name: p.name, brand: p.brand, category: p.category, description: p.description,
  photos: p.photos, unit: p.unit, sku: p.sku, price: p.price, minOrderQty: p.minOrderQty, stock: p.stock,
  leadTimeDays: leadTime(p, supplier), deliverable: wilaya ? deliversTo(productZones(p, supplier), wilaya) : undefined,
  supplier: supplier ? { id: String(supplier._id), slug: supplier.slug, companyName: supplier.companyName, wilaya: supplier.wilaya } : undefined,
});

const approvedSuppliers = () => Supplier.find({ status: 'approved' }).lean();

/** Approved suppliers delivering to `wilaya` (all approved without a wilaya), with their product count per category. */
export async function browseSuppliers(wilaya?: string, category?: string) {
  const suppliers: any[] = await approvedSuppliers();
  const counts: any[] = await SupplierProduct.aggregate([
    { $match: { supplierId: { $in: suppliers.map((s) => s._id) }, isActive: true } },
    { $group: { _id: { s: '$supplierId', c: '$category' }, n: { $sum: 1 } } },
  ]);
  return suppliers
    .map((s) => {
      const own = counts.filter((c) => String(c._id.s) === String(s._id));
      const total = own.reduce((n, c) => n + c.n, 0);
      return publicSupplier(s, {
        productCount: total,
        productCategories: own.map((c) => c._id.c),
        deliverable: wilaya ? deliversTo(s.shipping?.zones, wilaya) : undefined,
      });
    })
    .filter((s) => s.productCount > 0 && (!category || s.productCategories.includes(category)) && (!wilaya || s.deliverable))
    .sort((a, b) => b.productCount - a.productCount);
}

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Product search across approved suppliers. Text search on name/brand/description; deliverable lines first. */
export async function searchProducts(q: { q?: string; category?: string; wilaya?: string; supplier?: string; page?: number; onlyDeliverable?: boolean }) {
  const suppliers: any[] = await approvedSuppliers();
  const byId = new Map(suppliers.map((s) => [String(s._id), s]));
  const filter: Record<string, any> = { supplierId: { $in: suppliers.map((s) => s._id) }, isActive: true };
  if (q.supplier) {
    const s = suppliers.find((x) => x.slug === q.supplier || String(x._id) === q.supplier);
    filter.supplierId = s ? s._id : null;
  }
  if (q.category && (MARKET_CATEGORIES as readonly string[]).includes(q.category)) filter.category = q.category;
  const text = String(q.q || '').trim().slice(0, 80);
  if (text) {
    // Every word must match somewhere (accents and case folded through the regex on name/brand/description)
    const words = fold(text).split(' ').filter((w) => w.length > 1).slice(0, 6);
    const accent = (w: string) => escapeRegex(w).replace(/a/g, '[aàâä]').replace(/e/g, '[eéèêë]').replace(/i/g, '[iîï]').replace(/o/g, '[oôö]').replace(/u/g, '[uùûü]').replace(/c/g, '[cç]');
    if (words.length) filter.$and = words.map((w) => ({ $or: ['name', 'brand', 'description', 'sku'].map((f) => ({ [f]: { $regex: accent(w), $options: 'i' } })) }));
  }
  // ponytail: loads the matching catalogue in memory to rank deliverable first; paginate in Mongo past ~20k products
  const all: any[] = await SupplierProduct.find(filter).sort({ name: 1 }).limit(2000).lean();
  let items = all.map((p) => publicProduct(p, byId.get(String(p.supplierId)), q.wilaya));
  if (q.onlyDeliverable && q.wilaya) items = items.filter((p) => p.deliverable);
  items.sort((a, b) => Number(b.deliverable ?? 0) - Number(a.deliverable ?? 0));
  const page = Math.max(1, Math.floor(Number(q.page) || 1)), size = 24;
  return { total: items.length, page, pageSize: size, items: items.slice((page - 1) * size, page * size) };
}

/** Server-side pricing of a supplier cart for a delivery wilaya: lines, totals and per-line problems. */
export async function quoteCart(supplierId: string, items: { productId: string; qty: number }[], wilaya: string) {
  if (!Types.ObjectId.isValid(supplierId) || !Array.isArray(items) || !items.length || items.length > MAX_LINES) throw new MarketError('INVALID', 'Panier invalide');
  const supplier: any = await Supplier.findById(supplierId).lean();
  if (!supplier || supplier.status !== 'approved') throw new MarketError('SUPPLIER_UNAVAILABLE', "Ce fournisseur n'accepte pas de commandes pour le moment");
  const ids = items.map((i) => String(i.productId)).filter((id) => Types.ObjectId.isValid(id));
  const products: any[] = await SupplierProduct.find({ _id: { $in: ids }, supplierId: supplier._id }).lean();
  const byId = new Map(products.map((p) => [String(p._id), p]));
  const seen = new Set<string>();
  const lines = items.map((i) => {
    const p = byId.get(String(i.productId));
    const qty = Number(i.qty);
    const dup = seen.has(String(i.productId));
    seen.add(String(i.productId));
    return {
      productId: String(i.productId),
      qty,
      product: p ? publicProduct(p, supplier, wilaya) : null,
      problem: dup ? 'BAD_QTY' as LineProblem : lineProblem(p || null, qty, wilaya, supplier),
    };
  });
  const ok = lines.filter((l) => !l.problem && l.product);
  const totals = orderTotals(ok.map((l) => ({ price: l.product!.price, qty: l.qty })), supplier.shipping || { fee: 0, freeAbove: 0 });
  return { supplier: publicSupplier(supplier), lines, totals, valid: ok.length === lines.length, raw: { supplier, byId } };
}

/* ── orders: state changes ───────────────────────────────────── */

type Actor = 'salon' | 'supplier' | 'admin' | 'system';

/** Compare-and-set the status (from one of `from`), then append the audit event. null when the order was not in `from`. */
async function transition(id: string, from: OrderStatus[], to: OrderStatus, actor: Actor, note?: string, set: Record<string, any> = {}): Promise<IMarketOrder | null> {
  const allowed = from.filter((f) => canTransition(f, to));
  const before = await MarketOrder.findOneAndUpdate({ _id: id, status: { $in: allowed } }, { $set: { ...set, status: to } }, { new: false }).lean();
  if (!before) return null;
  await MarketOrderEvent.create({ orderId: id, from: before.status, to, actor, note });
  logger.info('Market order status', { orderId: id, from: before.status, to, actor });
  return MarketOrder.findById(id).lean() as any;
}

const frontend = () => process.env.FRONTEND_URL || 'https://saloneo.app';
const ascii = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^\x20-\x7e]/g, '').trim();
const orderNumber = () => `CF-${Date.now().toString(36).slice(-4).toUpperCase()}${crypto.randomBytes(2).toString('hex').toUpperCase()}`;

async function registerSatim(o: IMarketOrder, language?: string): Promise<string> {
  if ((o.attempts || 0) >= MAX_ATTEMPTS) throw new MarketError('TOO_MANY_ATTEMPTS', 'Trop de tentatives de paiement');
  const satimNumber = `MP${Date.now().toString().slice(-6)}${String(Math.floor(Math.random() * 100)).padStart(2, '0')}`;
  // SATIM appends ?orderId=…; the page never trusts it and re-checks with SATIM by order id
  const back = `${frontend()}/marketplace/payment-return?o=${o._id}`;
  const { orderId, formUrl } = await satimPaymentService.registerPayment({
    orderNumber: satimNumber,
    amount: Math.round(o.total * 100),
    returnUrl: back,
    failUrl: back,
    description: ascii(`Commande ${o.number} - ${o.supplierName}`),
    udf1: o._id,
    udf2: String(o.salonId),
    language,
  });
  await MarketOrder.updateOne({ _id: o._id }, { $set: { 'satim.orderId': orderId, 'satim.orderNumber': satimNumber, lastMessage: '' }, $inc: { attempts: 1 } });
  return formUrl;
}

export interface ShipTo { name: string; contact?: string; phone: string; address: string; wilaya: string }
export function validShipTo(raw: any): ShipTo | null {
  const s = { name: str(raw?.name, 120), contact: str(raw?.contact, 120), phone: str(raw?.phone, 30), address: str(raw?.address, 300), wilaya: findWilaya(raw?.wilaya) || '' };
  return s.name && s.address.length >= 5 && /^[\d +().-]{8,20}$/.test(s.phone) && s.wilaya ? s : null;
}

/** One supplier cart → one order (amounts computed here, never taken from the client) → SATIM payment page. */
export async function checkout(salonId: string, body: any, language?: string): Promise<{ orderId: string; formUrl: string }> {
  if (!marketPaymentsEnabled()) throw new MarketError('PAYMENT_UNAVAILABLE', 'Le paiement en ligne sera bientôt disponible');
  const shipTo = validShipTo(body?.shipTo);
  if (!shipTo) throw new MarketError('INVALID', 'Adresse de livraison incomplète');
  const quote = await quoteCart(String(body?.supplierId), body?.items, shipTo.wilaya);
  if (!quote.valid) throw new MarketError('CART_INVALID', 'Le panier a changé', quote.lines.filter((l) => l.problem).map((l) => ({ productId: l.productId, problem: l.problem })));
  const [salon, settings]: any[] = await Promise.all([User.findById(salonId).select('establishmentName').lean(), getSettings()]);
  const s = quote.raw.supplier;
  const items = quote.lines.map((l) => {
    const p = quote.raw.byId.get(l.productId);
    return { productId: p._id, name: p.name, brand: p.brand, unit: p.unit, sku: p.sku, price: p.price, qty: l.qty, total: p.price * l.qty };
  });
  const order = (await MarketOrder.create({
    number: orderNumber(),
    salonId,
    supplierId: s._id,
    salonName: salon?.establishmentName || shipTo.name,
    supplierName: s.companyName,
    shipTo,
    items,
    ...quote.totals,
    commissionPercent: s.commissionPercent ?? settings.commissionPercent,
    status: 'pending_payment',
    reminders: {},
  })).toObject() as IMarketOrder;
  await MarketOrderEvent.create({ orderId: order._id, from: null, to: 'pending_payment', actor: 'salon' });
  try {
    return { orderId: order._id, formUrl: await registerSatim(order, language) };
  } catch (error) {
    logger.error('Market order: SATIM registration failed', { orderId: order._id, error: (error as Error).message });
    await transition(order._id, ['pending_payment'], 'cancelled', 'system', 'Passerelle de paiement indisponible');
    throw error instanceof MarketError ? error : new MarketError('PAYMENT_UNAVAILABLE', 'Le paiement en ligne est momentanément indisponible');
  }
}

/** Stock leaves the supplier's catalogue at payment (never below 0). */
async function takeStock(o: IMarketOrder) {
  for (const it of o.items) {
    const r = await SupplierProduct.updateOne({ _id: it.productId, stock: { $gte: it.qty } }, { $inc: { stock: -it.qty } });
    if (!r.modifiedCount) await SupplierProduct.updateOne({ _id: it.productId }, { $set: { stock: 0 } });
  }
}
/** Full refund of goods never shipped: back to stock, once. */
async function restoreStock(o: IMarketOrder) {
  const claimed = await MarketOrder.updateOne({ _id: o._id, stockRestored: { $ne: true } }, { $set: { stockRestored: true } });
  if (!claimed.modifiedCount) return;
  for (const it of o.items) await SupplierProduct.updateOne({ _id: it.productId }, { $inc: { stock: it.qty } });
}

async function markPaid(o: IMarketOrder, r: { cardLast4?: string; approvalCode?: string; message?: string }): Promise<IMarketOrder | null> {
  const late = o.status !== 'pending_payment';
  const updated = await transition(o._id, ['pending_payment', 'expired', 'cancelled'], 'paid', 'system',
    late ? 'Paiement SATIM confirmé après expiration de la commande' : 'Paiement SATIM confirmé',
    { paidAt: new Date(), cardLast4: r.cardLast4, approvalCode: r.approvalCode, lastMessage: r.message });
  if (!updated) return MarketOrder.findById(o._id).lean() as any; // already paid: idempotent
  await takeStock(updated);
  notifyOrder(updated, 'paid').catch((e) => logger.error('Market paid emails failed', e));
  return updated;
}

/**
 * Ask SATIM where the current payment stands (never trust return-URL params).
 * 'return': the salon is back on our page (a refusal message is kept to show it); 'sweep': only a payment is acted upon.
 */
export async function syncOrderPayment(id: string, from: 'return' | 'sweep'): Promise<IMarketOrder | null> {
  const o: any = await MarketOrder.findById(id).lean();
  if (!o || !['pending_payment', 'expired', 'cancelled'].includes(o.status) || !o.satim?.orderId) return o;
  let r;
  try {
    r = await satimPaymentService.checkPayment(o.satim.orderId);
  } catch (error) {
    logger.error('Market order: SATIM status check failed', { orderId: id, error: (error as Error).message });
    throw new MarketError('VERIFY_FAILED', 'Impossible de vérifier le paiement pour le moment');
  }
  if (r.paid) return markPaid(o, r);
  if (from === 'return' && o.status === 'pending_payment') {
    await MarketOrder.updateOne({ _id: id }, { $set: { lastMessage: r.message || 'Paiement non abouti' } });
  }
  return MarketOrder.findById(id).lean() as any;
}

export async function retryOrderPayment(id: string, salonId: string, language?: string): Promise<string> {
  const o = await syncOrderPayment(id, 'return');
  if (!o || String(o.salonId) !== String(salonId)) throw new MarketError('NOT_FOUND');
  if (o.status !== 'pending_payment') throw new MarketError('NOT_ALLOWED', o.status === 'paid' ? 'Cette commande est déjà payée' : 'Cette commande ne peut plus être payée');
  if (!marketPaymentsEnabled()) throw new MarketError('PAYMENT_UNAVAILABLE', 'Le paiement en ligne sera bientôt disponible');
  return registerSatim(o, language);
}

const ownOrder = async (id: string, field: 'salonId' | 'supplierId', owner: string | Types.ObjectId) => {
  const o: any = await MarketOrder.findOne({ _id: String(id), [field]: owner }).lean();
  if (!o) throw new MarketError('NOT_FOUND', 'Commande introuvable');
  return o as IMarketOrder;
};
const mustBe = (o: IMarketOrder | null, what = "Cette action n'est plus possible pour cette commande") => {
  if (!o) throw new MarketError('NOT_ALLOWED', what);
  return o;
};

/**
 * Refund through SATIM. Claimed first (→ refund_pending, amount and outcome stored) so it runs once;
 * a gateway refusal stays refund_pending and alerts the admins (retry or mark as refunded manually).
 */
async function startRefund(id: string, from: OrderStatus[], amount: number, actor: Actor, note?: string): Promise<IMarketOrder> {
  const current: any = await MarketOrder.findById(id).lean();
  if (!current) throw new MarketError('NOT_FOUND');
  const full = amount >= current.total;
  const claimed = mustBe(await transition(id, from, 'refund_pending', actor, note || undefined, {
    refundAmount: full ? current.total : Math.round(amount), refundTarget: full ? 'refunded' : 'partially_refunded', refundError: '',
  }));
  if (full && !claimed.shipment?.shippedAt) await restoreStock(claimed);
  return processRefund(claimed);
}

async function processRefund(o: IMarketOrder): Promise<IMarketOrder> {
  let r: { ok: boolean; message?: string };
  try {
    r = o.satim?.orderId ? await satimPaymentService.refundPayment(o.satim.orderId, Math.round((o.refundAmount || 0) * 100)) : { ok: false, message: 'Commande SATIM inconnue' };
  } catch (error) {
    r = { ok: false, message: (error as Error).message };
  }
  if (r.ok) return closeRefund(o, 'system', 'Remboursement SATIM effectué');
  await MarketOrder.updateOne({ _id: o._id }, { $set: { refundError: r.message || 'Refus de la passerelle' } });
  alertRefundFailed(o, r.message).catch((e) => logger.error('Market refund alert failed', e));
  return (await MarketOrder.findById(o._id).lean()) as any;
}

async function closeRefund(o: IMarketOrder, actor: Actor, note: string): Promise<IMarketOrder> {
  const target = o.refundTarget || 'refunded';
  const set: Record<string, any> = { refundedAt: new Date(), refundError: '' };
  if (target === 'partially_refunded') {
    set.commission = settlement(o.total, o.refundAmount || 0, o.commissionPercent).commission;
    set.releasedAt = new Date();
  }
  const done = await transition(o._id, ['refund_pending'], target, actor, note, set);
  if (done) notifyOrder(done, target).catch((e) => logger.error('Market refund email failed', e));
  return done || ((await MarketOrder.findById(o._id).lean()) as any);
}

/** Funds become the supplier's: commission taken on the order total. */
async function release(id: string, from: OrderStatus[], actor: Actor, note: string): Promise<IMarketOrder | null> {
  const o: any = await MarketOrder.findById(id).lean();
  if (!o) return null;
  const done = await transition(id, from, 'released', actor, note, { releasedAt: new Date(), commission: settlement(o.total, 0, o.commissionPercent).commission });
  if (done) notifyOrder(done, 'released').catch((e) => logger.error('Market release email failed', e));
  return done;
}

/* Salon actions */

/** Salon abandons an unpaid order, or cancels a paid one the supplier has not accepted yet (full refund). */
export async function salonCancel(id: string, salonId: string) {
  const o = await ownOrder(id, 'salonId', salonId);
  if (o.status === 'pending_payment') {
    await syncOrderPayment(id, 'return').catch(() => null); // a payment may just have gone through: then it stays paid
    return (await transition(id, ['pending_payment'], 'cancelled', 'salon')) || ((await MarketOrder.findById(id).lean()) as any);
  }
  if (o.status !== 'paid') throw new MarketError('NOT_ALLOWED', 'Le fournisseur a déjà accepté cette commande : écrivez-lui ou signalez un problème');
  return startRefund(id, ['paid'], Number.MAX_SAFE_INTEGER, 'salon', '');
}

/** "Reçue et conforme": delivered, then the funds are released to the supplier. */
export async function confirmReceived(id: string, salonId: string) {
  await ownOrder(id, 'salonId', salonId);
  const d = mustBe(await transition(id, ['shipped', 'accepted'], 'delivered', 'salon', undefined, { deliveredAt: new Date() }));
  return (await release(d._id, ['delivered'], 'system', 'Fonds libérés au fournisseur après confirmation de réception')) || d;
}

/** "Signaler un problème": funds frozen until an admin decides. */
export async function openDispute(id: string, salonId: string, reason: string) {
  await ownOrder(id, 'salonId', salonId);
  const text = str(reason, 1000);
  if (text.length < 5) throw new MarketError('INVALID', 'Décrivez le problème');
  const d = mustBe(await transition(id, ['accepted', 'shipped'], 'disputed', 'salon', text, { dispute: { reason: text, openedAt: new Date() } }));
  notifyOrder(d, 'disputed').catch((e) => logger.error('Market dispute email failed', e));
  return d;
}

/**
 * "Ajouter au stock" after delivery: each line goes to an existing salon product (or a new one) by a quantity
 * the salon chooses (a carton of 12 = 12 units). The mapping is remembered on the order lines for next time.
 */
export async function addToStock(id: string, salonId: string, lines: { index: number; productId?: string; create?: { name: string; unit: string }; qty: number }[]) {
  const o = await ownOrder(id, 'salonId', salonId);
  if (!['delivered', 'released', 'partially_refunded'].includes(o.status)) throw new MarketError('NOT_ALLOWED', 'Disponible une fois la commande reçue');
  if (o.stockAddedAt) throw new MarketError('NOT_ALLOWED', 'Le stock a déjà été mis à jour pour cette commande');
  if (!Array.isArray(lines) || !lines.length) throw new MarketError('INVALID', 'Aucune ligne');
  const plan: { index: number; productId: Types.ObjectId; qty: number }[] = [];
  for (const l of lines) {
    const qty = Number(l.qty);
    if (!o.items[l.index] || !(Number.isFinite(qty) && qty > 0 && qty <= 1000000)) throw new MarketError('INVALID', 'Ligne invalide');
    let productId: Types.ObjectId | undefined;
    if (l.productId) {
      const p: any = Types.ObjectId.isValid(l.productId) ? await Product.findOne({ _id: l.productId, userId: salonId }).select('_id').lean() : null;
      if (!p) throw new MarketError('INVALID', 'Produit introuvable');
      productId = p._id;
    } else if (l.create?.name) {
      const unit = ['ml', 'g', 'unité', 'l', 'kg'].includes(l.create.unit) ? l.create.unit : 'unité';
      const p: any = await Product.create({ userId: salonId, name: str(l.create.name, 100), unit, quantity: 0, minQuantity: 0, description: o.items[l.index].brand || '' });
      productId = p._id;
    }
    if (productId) plan.push({ index: l.index, productId, qty });
  }
  // Claim first: two clicks cannot add twice
  const claimed = await MarketOrder.updateOne({ _id: o._id, stockAddedAt: { $exists: false } }, { $set: { stockAddedAt: new Date() } });
  if (!claimed.modifiedCount) throw new MarketError('NOT_ALLOWED', 'Le stock a déjà été mis à jour pour cette commande');
  const set: Record<string, any> = {};
  for (const p of plan) {
    await Product.updateOne({ _id: p.productId, userId: salonId }, { $inc: { quantity: p.qty } });
    set[`items.${p.index}.stockProductId`] = p.productId;
    set[`items.${p.index}.stockQty`] = p.qty;
  }
  if (Object.keys(set).length) await MarketOrder.updateOne({ _id: o._id }, { $set: set });
  return MarketOrder.findById(o._id).lean();
}

/** Mapping suggested for "Ajouter au stock": the salon's last choice for the same supplier product. */
export async function stockSuggestions(salonId: string, productIds: Types.ObjectId[]) {
  const prev: any[] = await MarketOrder.find({ salonId, 'items.stockProductId': { $exists: true }, 'items.productId': { $in: productIds } })
    .sort({ stockAddedAt: -1 }).limit(50).select('items stockAddedAt').lean();
  const map: Record<string, { productId: string; perUnit: number }> = {};
  for (const o of prev) for (const it of o.items) {
    const k = String(it.productId);
    if (it.stockProductId && !map[k]) map[k] = { productId: String(it.stockProductId), perUnit: it.stockQty && it.qty ? it.stockQty / it.qty : 1 };
  }
  return map;
}

/* Supplier actions */

export async function acceptOrder(id: string, supplierId: Types.ObjectId) {
  await ownOrder(id, 'supplierId', supplierId);
  const a = mustBe(await transition(id, ['paid'], 'accepted', 'supplier', undefined, { acceptedAt: new Date() }));
  notifyOrder(a, 'accepted').catch((e) => logger.error('Market accepted email failed', e));
  return a;
}

export async function refuseOrder(id: string, supplierId: Types.ObjectId, reason: string) {
  await ownOrder(id, 'supplierId', supplierId);
  const why = str(reason, 500);
  if (why.length < 3) throw new MarketError('INVALID', 'Indiquez le motif du refus');
  return startRefund(id, ['paid', 'accepted'], Number.MAX_SAFE_INTEGER, 'supplier', `Refusée par le fournisseur : ${why}`);
}

export async function shipOrder(id: string, supplierId: Types.ObjectId, carrier: string, tracking: string) {
  await ownOrder(id, 'supplierId', supplierId);
  const s = mustBe(await transition(id, ['accepted'], 'shipped', 'supplier', [str(carrier, 80), str(tracking, 80)].filter(Boolean).join(' · ') || undefined, {
    shipment: { carrier: str(carrier, 80), tracking: str(tracking, 80), shippedAt: new Date() },
  }));
  notifyOrder(s, 'shipped').catch((e) => logger.error('Market shipped email failed', e));
  return s;
}

/** Simple thread on the order (salon ⇄ supplier, admin in disputes); the other side gets an email. */
export async function postMessage(id: string, from: 'salon' | 'supplier' | 'admin', owner: string | Types.ObjectId | null, body: string) {
  const text = str(body, 2000);
  if (!text) throw new MarketError('INVALID', 'Message vide');
  const o = owner ? await ownOrder(id, from === 'salon' ? 'salonId' : 'supplierId', owner) : ((await MarketOrder.findById(id).lean()) as any as IMarketOrder);
  if (!o) throw new MarketError('NOT_FOUND');
  if (['pending_payment', 'cancelled', 'expired'].includes(o.status)) throw new MarketError('NOT_ALLOWED', 'Messagerie disponible une fois la commande payée');
  const msg = { from, body: text, at: new Date() };
  await MarketOrder.updateOne({ _id: o._id }, { $push: { messages: { $each: [msg], $slice: -200 } } });
  notifyMessage(o, msg).catch((e) => logger.error('Market message email failed', e));
  return msg;
}

/* Admin arbitration */

export async function resolveDispute(id: string, decision: 'release' | 'refund' | 'partial', amount: number, note: string) {
  const o: any = await MarketOrder.findById(id).lean();
  if (!o) throw new MarketError('NOT_FOUND');
  if (o.status !== 'disputed') throw new MarketError('NOT_ALLOWED', "Cette commande n'est pas en litige");
  const resolution = str(note, 500) || { release: 'Fonds libérés au fournisseur', refund: 'Remboursement total du salon', partial: 'Remboursement partiel du salon' }[decision];
  await MarketOrder.updateOne({ _id: id }, { $set: { 'dispute.resolution': resolution, 'dispute.resolvedAt': new Date() } });
  if (decision === 'release') return mustBe(await release(id, ['disputed'], 'admin', `Litige clos : ${resolution}`));
  if (decision === 'refund') return startRefund(id, ['disputed'], Number.MAX_SAFE_INTEGER, 'admin', `Litige clos : ${resolution}`);
  const a = Math.round(Number(amount));
  if (!(a >= 1 && a < o.total)) throw new MarketError('INVALID', 'Montant du remboursement partiel invalide');
  return startRefund(id, ['disputed'], a, 'admin', `Litige clos : ${resolution}`);
}

export async function retryRefund(id: string) {
  const claimed = mustBe(await transition(id, ['refund_pending'], 'refund_pending', 'admin', 'Nouvelle tentative de remboursement'), 'Aucun remboursement en attente');
  return processRefund(claimed);
}

export async function markRefundedManually(id: string, note: string) {
  const o: any = await MarketOrder.findOne({ _id: id, status: 'refund_pending' }).lean();
  if (!o) throw new MarketError('NOT_ALLOWED', 'Aucun remboursement en attente');
  return closeRefund(o, 'admin', str(note, 200) || 'Remboursement effectué manuellement');
}

/* ── views ───────────────────────────────────────────────────── */

const events = (orderId: string) => MarketOrderEvent.find({ orderId }).sort({ at: 1 }).select('-_id from to actor note at').lean();

/** Order as one side sees it. The supplier sees the delivery address (needed to ship), never card details. */
export async function orderView(o: IMarketOrder, side: 'salon' | 'supplier' | 'admin', extra = true) {
  const s = await getSettings();
  // What the supplier keeps: nothing once fully refunded, the remainder after a partial refund
  const share = settlement(o.total, o.refundTarget === 'refunded' ? o.total : o.refundTarget === 'partially_refunded' ? o.refundAmount || 0 : 0, o.commissionPercent);
  const base: Record<string, any> = {
    id: o._id, number: o.number, status: o.status, createdAt: o.createdAt, paidAt: o.paidAt, acceptedAt: o.acceptedAt,
    deliveredAt: o.deliveredAt, releasedAt: o.releasedAt, refundedAt: o.refundedAt,
    salonName: o.salonName, supplierName: o.supplierName, supplierId: String(o.supplierId), shipTo: o.shipTo,
    items: o.items.map((it) => ({ productId: String(it.productId), name: it.name, brand: it.brand, unit: it.unit, sku: it.sku, price: it.price, qty: it.qty, total: it.total, stockProductId: it.stockProductId ? String(it.stockProductId) : undefined, stockQty: it.stockQty })),
    subtotal: o.subtotal, deliveryFee: o.deliveryFee, total: o.total, refundAmount: o.refundAmount || 0, refundTarget: o.refundTarget,
    shipment: o.shipment, dispute: o.dispute, messages: o.messages || [], stockAddedAt: o.stockAddedAt,
    deadlines: {
      ship: o.paidAt && ['paid', 'accepted'].includes(o.status) ? addDays(o.paidAt, s.shipDeadlineDays) : undefined,
      autoRelease: o.shipment?.shippedAt && o.status === 'shipped' ? addDays(o.shipment.shippedAt, s.autoReleaseDays) : undefined,
      payment: o.status === 'pending_payment' ? new Date(new Date(o.createdAt).getTime() + UNPAID_EXPIRY_MINUTES * 60000) : undefined,
    },
  };
  if (side === 'salon') {
    Object.assign(base, {
      orderNumber: o.satim?.orderNumber, cardLast4: o.paidAt ? o.cardLast4 : undefined, approvalCode: o.paidAt ? o.approvalCode : undefined,
      message: o.status === 'pending_payment' ? o.lastMessage : undefined,
      canRetry: o.status === 'pending_payment' && (o.attempts || 0) < MAX_ATTEMPTS,
    });
  } else {
    Object.assign(base, {
      commissionPercent: o.commissionPercent,
      commission: o.commission ?? share.commission,
      net: o.commission != null ? Math.max(0, share.share - o.commission) : share.net,
      paidOut: !!o.payoutId,
    });
  }
  if (side === 'admin') Object.assign(base, { salonId: String(o.salonId), satim: o.satim, refundError: o.refundError, attempts: o.attempts });
  if (extra) base.events = await events(o._id);
  return base;
}

export async function supplierDashboard(supplier: ISupplier) {
  const since = monthStart();
  const [orders, payouts]: any[] = await Promise.all([
    MarketOrder.find({ supplierId: supplier._id, status: { $nin: ['pending_payment', 'cancelled', 'expired'] } }).select('status total refundAmount commission commissionPercent releasedAt number salonName createdAt paidAt items shipTo').sort({ createdAt: -1 }).lean(),
    SupplierPayout.find({ supplierId: supplier._id }).select('amount').lean(),
  ]);
  const monthNet = orders
    .filter((o: any) => SETTLED.includes(o.status) && o.releasedAt && new Date(o.releasedAt) >= since)
    .reduce((s: number, o: any) => s + Math.max(0, o.total - (o.status === 'partially_refunded' ? o.refundAmount || 0 : 0)) - (o.commission || 0), 0);
  const s = await getSettings();
  const toHandle = orders.filter((o: any) => o.status === 'paid' || o.status === 'accepted' || o.status === 'disputed').slice(0, 20);
  return {
    toAccept: orders.filter((o: any) => o.status === 'paid').length,
    toShip: orders.filter((o: any) => o.status === 'accepted').length,
    disputed: orders.filter((o: any) => o.status === 'disputed').length,
    monthNet,
    balance: supplierLedger(orders, payouts),
    products: await SupplierProduct.countDocuments({ supplierId: supplier._id, isActive: true }),
    lowStock: await SupplierProduct.countDocuments({ supplierId: supplier._id, isActive: true, stock: { $lt: 5 } }),
    orders: toHandle.map((o: any) => ({
      id: o._id, number: o.number, status: o.status, salonName: o.salonName, wilaya: o.shipTo?.wilaya, total: o.total, createdAt: o.createdAt,
      itemCount: o.items.reduce((n: number, i: any) => n + i.qty, 0),
      shipBy: o.paidAt ? addDays(o.paidAt, s.shipDeadlineDays) : undefined,
    })),
  };
}

const listRow = (o: any, side: 'salon' | 'supplier' | 'admin') => ({
  id: o._id, number: o.number, status: o.status, createdAt: o.createdAt, paidAt: o.paidAt,
  salonName: o.salonName, supplierName: o.supplierName, supplierId: String(o.supplierId), wilaya: o.shipTo?.wilaya,
  total: o.total, refundAmount: o.refundAmount || 0, itemCount: o.items.reduce((n: number, i: any) => n + i.qty, 0),
  firstItems: o.items.slice(0, 3).map((i: any) => i.name), lines: o.items.length,
  ...(side !== 'salon' ? { commission: o.commission, commissionPercent: o.commissionPercent, paidOut: !!o.payoutId } : {}),
  ...(side === 'admin' ? { disputeReason: o.dispute?.reason, refundError: o.refundError } : {}),
});

export async function listOrders(filter: Record<string, any>, side: 'salon' | 'supplier' | 'admin', q: { status?: string; q?: string; page?: number }) {
  const f: Record<string, any> = { ...filter };
  const groups: Record<string, string[]> = {
    open: ['paid', 'accepted', 'shipped', 'delivered', 'disputed', 'refund_pending'],
    to_handle: ['paid', 'accepted'],
    done: ['released', 'refunded', 'partially_refunded'],
    unpaid: ['pending_payment', 'cancelled', 'expired'],
  };
  if (q.status && groups[q.status]) f.status = { $in: groups[q.status] };
  else if (q.status && TRANSITIONS[q.status as OrderStatus]) f.status = q.status;
  else if (side !== 'admin') f.status = { $nin: side === 'supplier' ? groups.unpaid : ['expired'] };
  if (q.q) f.number = { $regex: escapeRegex(String(q.q).trim().toUpperCase().slice(0, 20)) };
  const page = Math.max(1, Math.floor(Number(q.page) || 1)), size = 30;
  const [total, rows]: any[] = await Promise.all([
    MarketOrder.countDocuments(f),
    MarketOrder.find(f).sort({ createdAt: -1 }).skip((page - 1) * size).limit(size).lean(),
  ]);
  return { total, page, pageSize: size, orders: rows.map((o: any) => listRow(o, side)) };
}

export async function supplierPayments(supplier: ISupplier) {
  const [orders, payouts, full]: any[] = await Promise.all([
    MarketOrder.find({ supplierId: supplier._id, status: { $in: [...ESCROW, ...SETTLED] } }).sort({ createdAt: -1 }).lean(),
    SupplierPayout.find({ supplierId: supplier._id }).sort({ paidAt: -1 }).lean(),
    Supplier.findById(supplier._id).select('+payout').lean(),
  ]);
  return {
    balance: supplierLedger(orders, payouts),
    payouts: payouts.map((p: any) => ({ id: p._id, amount: p.amount, paidAt: p.paidAt, reference: p.reference, method: p.method })),
    settled: orders.filter((o: any) => SETTLED.includes(o.status)).slice(0, 300).map((o: any) => listRow(o, 'supplier')),
    payoutInfo: full?.payout || null,
  };
}

/* Admin */

export async function adminSuppliers() {
  const [suppliers, counts, gmv]: any[] = await Promise.all([
    Supplier.find({}).select('+payout').sort({ createdAt: -1 }).lean(),
    SupplierProduct.aggregate([{ $match: { isActive: true } }, { $group: { _id: '$supplierId', n: { $sum: 1 } } }]),
    MarketOrder.aggregate([{ $match: { status: { $in: [...ESCROW, ...SETTLED, 'refund_pending'] } } }, { $group: { _id: '$supplierId', n: { $sum: 1 }, gmv: { $sum: '$total' } } }]),
  ]);
  const settings = await getSettings();
  const c = new Map(counts.map((x: any) => [String(x._id), x.n]));
  const g = new Map(gmv.map((x: any) => [String(x._id), x]));
  return suppliers.map((s: any) => ({
    id: String(s._id), companyName: s.companyName, slug: s.slug, email: s.email, phone: s.phone, contactName: s.contactName,
    wilaya: s.wilaya, address: s.address, nif: s.nif, rc: s.rc, categories: s.categories, description: s.description,
    status: s.status, statusReason: s.statusReason, invited: !!s.invited, createdAt: s.createdAt, approvedAt: s.approvedAt,
    commissionPercent: s.commissionPercent ?? null, effectiveCommission: s.commissionPercent ?? settings.commissionPercent,
    payout: s.payout ? { legalName: s.payout.legalName, method: s.payout.method, rib: s.payout.rib } : null,
    shipping: s.shipping, products: c.get(String(s._id)) || 0, orders: (g.get(String(s._id)) as any)?.n || 0, gmv: (g.get(String(s._id)) as any)?.gmv || 0,
  }));
}

export async function setSupplierCommission(id: string, value: unknown) {
  const v = value === null || value === '' ? null : Number(value);
  if (v !== null && !(v >= 0 && v <= 100)) throw new MarketError('INVALID', 'Commission invalide');
  const s = await Supplier.findByIdAndUpdate(id, { $set: { commissionPercent: v === null ? null : Math.round(v * 10) / 10 } }, { new: true }).lean();
  if (!s) throw new MarketError('NOT_FOUND');
  return s;
}

export async function adminBalances() {
  // ponytail: loads every escrow/settled order in memory; switch to an aggregation past ~100k orders
  const [orders, payouts, suppliers]: any[] = await Promise.all([
    MarketOrder.find({ status: { $in: [...ESCROW, ...SETTLED] } }).select('supplierId status total refundAmount commission commissionPercent').lean(),
    SupplierPayout.find({}).select('supplierId amount paidAt').lean(),
    Supplier.find({}).select('+payout companyName email').lean(),
  ]);
  const of = (list: any[], id: string) => list.filter((x) => String(x.supplierId) === id);
  return suppliers
    .map((s: any) => {
      const id = String(s._id), own = of(payouts, id);
      return {
        supplierId: id, companyName: s.companyName, email: s.email, payout: s.payout || null,
        ...supplierLedger(of(orders, id), own),
        lastPayoutAt: own.map((p: any) => p.paidAt).sort().pop() || null,
      };
    })
    .filter((b: any) => b.pending || b.available || b.paidOut)
    .sort((a: any, b: any) => b.available - a.available);
}

const csvCell = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
export async function adminBalancesCsv(): Promise<string> {
  const rows = (await adminBalances()).filter((b: any) => b.available > 0);
  const lines = [
    ['Fournisseur', 'Bénéficiaire', 'Mode', 'RIB / RIP', 'Montant (DA)', 'Email'],
    ...rows.map((b: any) => [b.companyName, b.payout?.legalName || '', b.payout?.method === 'ccp' ? 'CCP' : b.payout?.method === 'bank' ? 'Banque' : '', b.payout?.rib || '', b.available, b.email]),
  ];
  return '﻿' + lines.map((l) => l.map(csvCell).join(';')).join('\r\n');
}

/** Admin records a transfer to a supplier; the settled orders it covers (oldest first) read as "versé". */
export async function recordSupplierPayout(supplierId: string, amount: number, paidAt: Date, reference: string, adminId?: string) {
  if (!Types.ObjectId.isValid(supplierId) || !(amount > 0) || isNaN(paidAt.getTime())) throw new MarketError('INVALID', 'Montant ou date invalide');
  // The availability lock doubles as a per-supplier mutex: two payouts cannot both pass the balance check
  return withSlotLock(supplierId, 'market-payout', async () => {
    const [orders, prior, supplier]: any[] = await Promise.all([
      MarketOrder.find({ supplierId, status: { $in: SETTLED } }).sort({ releasedAt: 1 }).lean(),
      SupplierPayout.find({ supplierId }).lean(),
      Supplier.findById(supplierId).select('+payout companyName email').lean(),
    ]);
    if (!supplier) throw new MarketError('NOT_FOUND');
    const amountDa = Math.round(amount);
    if (amountDa > supplierLedger(orders, prior).available) throw new MarketError('PAYOUT_EXCEEDS_BALANCE', 'Le montant dépasse le solde disponible');
    const payout: any = await SupplierPayout.create({ supplierId, amount: amountDa, paidAt, reference: reference?.trim(), method: supplier.payout?.method, createdBy: adminId });
    let left = amountDa;
    const covered: string[] = [];
    for (const o of orders.filter((x: any) => !x.payoutId)) {
      const net = Math.max(0, o.total - (o.status === 'partially_refunded' ? o.refundAmount || 0 : 0)) - (o.commission || 0);
      if (net > left) break;
      left -= net;
      covered.push(o._id);
    }
    if (covered.length) await MarketOrder.updateMany({ _id: { $in: covered } }, { $set: { payoutId: payout._id } });
    notice(supplier.email, {
      subject: `Versement Saloneo - ${da(amountDa)}`,
      title: 'Votre versement a été effectué',
      intro: `Bonjour, Saloneo vient d'effectuer le virement des commandes livrées à vos clients salons (commission déduite).`,
      rows: [
        ['Montant', da(amountDa)],
        ['Date du virement', algiersDay(paidAt)],
        ['Référence', reference?.trim() || ''],
        ['Compte', [supplier.payout?.method === 'ccp' ? 'CCP' : supplier.payout?.method === 'bank' ? 'Banque' : '', supplier.payout?.rib ? `•••• ${supplier.payout.rib.slice(-4)}` : ''].filter(Boolean).join(' ')],
      ],
      note: 'Selon votre banque, le virement peut prendre quelques jours ouvrés.',
      buttonLabel: 'Voir mes paiements',
      buttonUrl: `${frontend()}/fournisseur/paiements`,
    }).catch((e) => logger.error('Supplier payout email failed', e));
    return payout;
  });
}

export async function adminStats() {
  const since = monthStart();
  const [all, month, byStatus, suppliers]: any[] = await Promise.all([
    MarketOrder.aggregate([{ $match: { paidAt: { $exists: true } } }, { $group: { _id: null, gmv: { $sum: '$total' }, refunds: { $sum: { $ifNull: ['$refundAmount', 0] } }, n: { $sum: 1 }, commission: { $sum: { $ifNull: ['$commission', 0] } } } }]),
    MarketOrder.aggregate([{ $match: { paidAt: { $gte: since } } }, { $group: { _id: null, gmv: { $sum: '$total' }, refunds: { $sum: { $ifNull: ['$refundAmount', 0] } }, n: { $sum: 1 } } }]),
    MarketOrder.aggregate([{ $group: { _id: '$status', n: { $sum: 1 }, total: { $sum: '$total' } } }]),
    Supplier.aggregate([{ $group: { _id: '$status', n: { $sum: 1 } } }]),
  ]);
  const st = Object.fromEntries(byStatus.map((x: any) => [x._id, x]));
  const commissionMonth: any[] = await MarketOrder.aggregate([{ $match: { releasedAt: { $gte: since }, status: { $in: SETTLED } } }, { $group: { _id: null, c: { $sum: '$commission' } } }]);
  return {
    gmv: (all[0]?.gmv || 0) - (all[0]?.refunds || 0),
    paidOrders: all[0]?.n || 0,
    commission: all[0]?.commission || 0,
    gmvMonth: (month[0]?.gmv || 0) - (month[0]?.refunds || 0),
    ordersMonth: month[0]?.n || 0,
    commissionMonth: commissionMonth[0]?.c || 0,
    escrow: ESCROW.reduce((s, k) => s + (st[k]?.total || 0), 0),
    disputes: st.disputed?.n || 0,
    refundsPending: st.refund_pending?.n || 0,
    byStatus: Object.fromEntries(byStatus.map((x: any) => [x._id, x.n])),
    suppliers: Object.fromEntries(suppliers.map((x: any) => [x._id, x.n])),
  };
}

/* ── emails ──────────────────────────────────────────────────── */

const da = (n: number) => `${Math.round(n).toLocaleString('fr-FR').replace(/ | /g, ' ')} DA`;
const salonEmail = async (o: IMarketOrder) => ((await User.findById(o.salonId).select('email').lean()) as any)?.email as string | undefined;
const supplierEmail = async (o: IMarketOrder) => ((await Supplier.findById(o.supplierId).select('email').lean()) as any)?.email as string | undefined;
const itemsLine = (o: IMarketOrder) => o.items.map((i) => `${i.qty} × ${i.name}`).join(', ').slice(0, 300);
const salonUrl = (o: IMarketOrder) => `${frontend()}/products?tab=suppliers&order=${o._id}`;
const supplierUrl = (o: IMarketOrder) => `${frontend()}/fournisseur/commandes/${o._id}`;

type Kind = 'paid' | 'accepted' | 'shipped' | 'released' | 'refunded' | 'partially_refunded' | 'disputed';
async function notifyOrder(o: IMarketOrder, kind: Kind) {
  const [toSalon, toSupplier, settings] = await Promise.all([salonEmail(o), supplierEmail(o), getSettings()]);
  const rows: [string, string][] = [['Commande', o.number], ['Articles', itemsLine(o)], ['Total TTC', da(o.total)]];
  const net = settlement(o.total, kind === 'partially_refunded' ? o.refundAmount || 0 : 0, o.commissionPercent);
  if (kind === 'paid') {
    const shipBy = algiersDateTime(addDays(o.paidAt || new Date(), settings.shipDeadlineDays));
    if (toSupplier) await notice(toSupplier, {
      subject: `Nouvelle commande ${o.number} - ${o.salonName}`,
      title: 'Nouvelle commande payée',
      intro: `${o.salonName} (${o.shipTo.wilaya}) vient de commander et de payer. Le montant est conservé par Saloneo et vous sera versé après la réception par le salon.`,
      rows: [...rows, ['À expédier avant le', shipBy]],
      note: `Acceptez ou refusez la commande depuis votre espace. Sans expédition avant le ${shipBy}, le salon est remboursé automatiquement.`,
      buttonLabel: 'Voir la commande', buttonUrl: supplierUrl(o),
    });
    if (toSalon) await notice(toSalon, {
      subject: `Paiement reçu - commande ${o.number}`,
      title: 'Votre commande est payée',
      intro: `Merci ! ${o.supplierName} a été prévenu. Votre paiement est conservé par Saloneo jusqu'à ce que vous confirmiez la réception.`,
      rows: [...rows, ['N° de transaction', o.satim?.orderNumber || ''], ['Carte', o.cardLast4 ? `•••• ${o.cardLast4}` : '']],
      buttonLabel: 'Suivre ma commande', buttonUrl: salonUrl(o),
    });
  }
  if (kind === 'accepted' && toSalon) await notice(toSalon, {
    subject: `Commande ${o.number} acceptée par ${o.supplierName}`,
    title: 'Commande acceptée', intro: `${o.supplierName} prépare votre commande. Vous serez prévenu à l'expédition.`, rows,
    buttonLabel: 'Suivre ma commande', buttonUrl: salonUrl(o),
  });
  if (kind === 'shipped' && toSalon) await notice(toSalon, {
    subject: `Commande ${o.number} expédiée`,
    title: 'Votre commande est en route',
    intro: `${o.supplierName} a expédié votre commande. À réception, vérifiez-la puis confirmez « Reçue et conforme » ou signalez un problème.`,
    rows: [...rows, ['Transporteur', o.shipment?.carrier || ''], ['N° de suivi', o.shipment?.tracking || '']],
    note: `Sans action de votre part, le paiement est versé au fournisseur le ${algiersDateTime(addDays(o.shipment?.shippedAt || new Date(), settings.autoReleaseDays))}.`,
    buttonLabel: 'Confirmer la réception', buttonUrl: salonUrl(o),
  });
  if (kind === 'released' && toSupplier) await notice(toSupplier, {
    subject: `Fonds libérés - commande ${o.number}`,
    title: 'Le paiement de la commande vous est acquis',
    intro: `${o.deliveredAt ? `${o.salonName} a confirmé la réception.` : 'Le délai de confirmation est écoulé.'} Le montant est ajouté à votre solde disponible et sera inclus dans le prochain versement.`,
    rows: [...rows, [`Commission Saloneo (${o.commissionPercent} %)`, da(o.commission ?? net.commission)], ['Net pour vous', da(net.share - (o.commission ?? net.commission))]],
    buttonLabel: 'Voir mes paiements', buttonUrl: `${frontend()}/fournisseur/paiements`,
  });
  if (kind === 'refunded' || kind === 'partially_refunded') {
    const amount = kind === 'refunded' ? o.total : o.refundAmount || 0;
    if (toSalon) await notice(toSalon, {
      subject: `Remboursement - commande ${o.number}`,
      title: kind === 'refunded' ? 'Votre commande a été remboursée' : 'Remboursement partiel effectué',
      intro: `Le remboursement de ${da(amount)} a été effectué sur la carte utilisée pour le paiement.`,
      rows: [...rows, ['Remboursé', da(amount)]],
      note: 'Selon votre banque, le montant apparaît sur votre compte sous quelques jours ouvrés.',
      buttonLabel: 'Voir la commande', buttonUrl: salonUrl(o),
    });
    if (toSupplier) await notice(toSupplier, {
      subject: `Commande ${o.number} ${kind === 'refunded' ? 'remboursée' : 'partiellement remboursée'}`,
      title: kind === 'refunded' ? 'Commande remboursée au salon' : 'Remboursement partiel du salon',
      intro: kind === 'refunded' ? `La commande de ${o.salonName} a été remboursée intégralement.` : `${da(amount)} ont été remboursés au salon. Le reste vous est acquis.`,
      rows: kind === 'refunded' ? rows : [...rows, ['Remboursé au salon', da(amount)], ['Net pour vous', da(net.net)]],
      buttonLabel: 'Voir la commande', buttonUrl: supplierUrl(o),
    });
  }
  if (kind === 'disputed') {
    const data = {
      subject: `Litige - commande ${o.number}`,
      title: 'Un problème a été signalé',
      intro: `${o.salonName} a signalé un problème. Les fonds sont bloqués jusqu'à la décision de l'équipe Saloneo.`,
      rows: [...rows, ['Problème', o.dispute?.reason || '']] as [string, string][],
    };
    if (toSupplier) await notice(toSupplier, { ...data, note: 'Répondez au salon dans la messagerie de la commande : un accord à l’amiable accélère la décision.', buttonLabel: 'Voir la commande', buttonUrl: supplierUrl(o) });
    const admins = await adminEmails();
    if (admins.length) await notice(admins, { ...data, subject: `[Admin] ${data.subject} (${o.supplierName})`, buttonLabel: "Ouvrir l'administration", buttonUrl: `${frontend()}/admin?section=marketplace` });
  }
}

async function notifyMessage(o: IMarketOrder, msg: { from: string; body: string }) {
  const to = msg.from === 'salon' ? await supplierEmail(o) : msg.from === 'supplier' ? await salonEmail(o) : null;
  const targets = msg.from === 'admin' ? [await salonEmail(o), await supplierEmail(o)].filter(Boolean) as string[] : to ? [to] : [];
  if (!targets.length) return;
  const sender = msg.from === 'salon' ? o.salonName : msg.from === 'supplier' ? o.supplierName : 'Équipe Saloneo';
  await notice(targets, {
    subject: `Nouveau message - commande ${o.number}`,
    title: `Message de ${sender}`,
    intro: msg.body.slice(0, 1000),
    rows: [['Commande', o.number]],
    buttonLabel: 'Répondre',
    buttonUrl: msg.from === 'salon' ? supplierUrl(o) : salonUrl(o),
  });
}

async function alertRefundFailed(o: IMarketOrder, message?: string) {
  const to = await adminEmails();
  if (to.length) await notice(to, {
    subject: `Remboursement marketplace en échec - ${o.number}`,
    title: 'Remboursement à traiter',
    intro: "Le remboursement automatique via SATIM a échoué. Relancez-le ou effectuez-le manuellement depuis l'administration.",
    rows: [['Commande', o.number], ['Salon', o.salonName], ['Fournisseur', o.supplierName], ['Montant', da(o.refundAmount || o.total)], ['Erreur', message || 'Refus de la passerelle']],
    buttonLabel: "Ouvrir l'administration", buttonUrl: `${frontend()}/admin?section=marketplace`,
  });
}

/** New public application → admins. */
export async function notifyApplication(s: any) {
  const to = await adminEmails();
  if (to.length) await notice(to, {
    subject: `Nouvelle demande fournisseur - ${s.companyName}`,
    title: 'Demande fournisseur à valider',
    intro: `${s.companyName} (${s.wilaya || '—'}) demande à vendre sur la marketplace Saloneo.`,
    rows: [['Contact', s.contactName || ''], ['E-mail', s.email], ['Téléphone', s.phone || ''], ['NIF', s.nif || ''], ['RC', s.rc || '']],
    buttonLabel: 'Examiner la demande', buttonUrl: `${frontend()}/admin?section=marketplace`,
  });
  await notice(s.email, {
    subject: 'Votre demande fournisseur Saloneo est bien reçue',
    title: 'Demande reçue',
    intro: "Merci ! Notre équipe vérifie vos informations (NIF, RC) sous 48 h ouvrées. En attendant, vous pouvez préparer votre catalogue depuis votre espace fournisseur.",
    rows: [['Entreprise', s.companyName]],
    buttonLabel: 'Ouvrir mon espace', buttonUrl: `${frontend()}/fournisseur`,
  });
}

async function remind(o: IMarketOrder, which: 'remind_first' | 'remind_last' | 'remind_ship', settings: MarketSettingsDoc) {
  const field = which === 'remind_ship' ? 'reminders.ship' : which === 'remind_first' ? 'reminders.d3' : 'reminders.d6';
  // Claim the reminder first so a slow SMTP never sends it twice
  const claimed = await MarketOrder.updateOne({ _id: o._id, status: o.status, [field]: { $ne: true } }, { $set: { [field]: true } });
  if (!claimed.modifiedCount) return;
  if (which === 'remind_ship') {
    const to = await supplierEmail(o);
    const by = algiersDateTime(addDays(o.paidAt!, settings.shipDeadlineDays));
    if (to) await notice(to, {
      subject: `Rappel : commande ${o.number} à expédier avant le ${by}`,
      title: 'Commande à expédier',
      intro: `La commande de ${o.salonName} n'est pas encore expédiée. Sans expédition avant le ${by}, le salon sera remboursé automatiquement.`,
      rows: [['Commande', o.number], ['Articles', itemsLine(o)], ['Total TTC', da(o.total)]],
      buttonLabel: 'Voir la commande', buttonUrl: supplierUrl(o),
    });
    return;
  }
  const to = await salonEmail(o);
  const at = algiersDateTime(addDays(o.shipment!.shippedAt!, settings.autoReleaseDays));
  if (to) await notice(to, {
    subject: `Avez-vous reçu la commande ${o.number} ?`,
    title: 'Confirmez la réception de votre commande',
    intro: `${o.supplierName} a expédié votre commande le ${algiersDateTime(o.shipment!.shippedAt!)}. Si elle est arrivée et conforme, confirmez-la. En cas de souci, signalez un problème : les fonds restent bloqués.`,
    rows: [['Commande', o.number], ['Articles', itemsLine(o)], ['Versement automatique au fournisseur le', at]],
    buttonLabel: 'Confirmer ou signaler', buttonUrl: salonUrl(o),
  });
}

/* ── jobs ────────────────────────────────────────────────────── */

/** One pass of every deadline (tested end to end with a fake `now`). Returns what was done per order. */
export async function runDueJobs(now = new Date()): Promise<{ id: string; action: DueAction }[]> {
  const settings = await getSettings();
  const due: any[] = await MarketOrder.find({
    $or: [
      { status: 'pending_payment', createdAt: { $lte: new Date(now.getTime() - UNPAID_EXPIRY_MINUTES * 60000) } },
      { status: { $in: ['paid', 'accepted'] }, paidAt: { $lte: addDays(now, 1 - settings.shipDeadlineDays) } },
      { status: 'shipped', 'shipment.shippedAt': { $lte: addDays(now, -Math.min(3, settings.autoReleaseDays - 1)) } },
    ],
  }).sort({ updatedAt: 1 }).limit(1000).lean(); // ponytail: 1000 per minute; batch with a cursor if volume ever gets there
  const done: { id: string; action: DueAction }[] = [];
  for (const o of due) {
    const action = dueAction(o, settings, now);
    if (!action) continue;
    try {
      if (action === 'expire') {
        if (o.satim?.orderId) {
          try {
            const s = await syncOrderPayment(o._id, 'sweep');
            if (s?.status === 'paid') continue;
          } catch {
            // SATIM unreachable: retry next run, give up waiting 30 min later (a late payment still lands as paid)
            if (now.getTime() - new Date(o.createdAt).getTime() < (UNPAID_EXPIRY_MINUTES + 30) * 60000) continue;
          }
        }
        if (!(await transition(o._id, ['pending_payment'], 'expired', 'system', 'Commande non payée dans le délai'))) continue;
      }
      if (action === 'ship_deadline') {
        await startRefund(o._id, ['paid', 'accepted'], Number.MAX_SAFE_INTEGER, 'system', `Non expédiée dans les ${settings.shipDeadlineDays} jours : remboursement automatique`);
      }
      if (action === 'auto_release') {
        if (!(await release(o._id, ['shipped'], 'system', `Versement automatique ${settings.autoReleaseDays} jours après l'expédition`))) continue;
      }
      if (action === 'remind_first' || action === 'remind_last' || action === 'remind_ship') await remind(o, action, settings);
      done.push({ id: o._id, action });
    } catch (error) {
      logger.error('Market job failed', { orderId: o._id, action, error: (error as Error).message });
    }
  }
  return done;
}

let started = false;
/** Every minute: deadlines (unpaid expiry, ship deadline refunds, auto-release, reminders). */
export function startMarketplaceJobs() {
  if (started) return;
  started = true;
  cron.schedule('* * * * *', () => {
    runDueJobs().catch((e) => logger.error('Marketplace jobs failed', e));
  }, { timezone: TZ });
}
