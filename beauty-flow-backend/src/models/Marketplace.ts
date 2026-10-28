import crypto from 'crypto';
import { Schema, model, Types } from 'mongoose';

/**
 * Supplier marketplace (B2B supplies). Saloneo only takes the payment (SATIM, escrow) and validates delivery;
 * suppliers ship with their own carrier. Rules and lifecycle live in services/marketplace.ts.
 */

export const MARKET_CATEGORIES = [
  'coloration', 'hair_care', 'styling', 'nails', 'lashes_brows', 'face_care', 'body_care', 'waxing', 'hygiene', 'equipment', 'spa',
] as const;
export type MarketCategory = typeof MARKET_CATEGORIES[number];

export const SUPPLIER_STATUSES = ['pending', 'approved', 'rejected', 'suspended'] as const;
export type SupplierStatus = typeof SUPPLIER_STATUSES[number];

/** 'ALL' in a zone list = toute l'Algérie; otherwise official wilaya names (utils/wilayas.ts). */
export const ALL_ZONES = 'ALL';

export interface ISupplier {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  companyName: string;
  slug: string;
  nif?: string;
  rc?: string;
  contactName?: string;
  phone?: string;
  email: string;
  wilaya?: string;
  address?: string;
  description?: string;
  categories: MarketCategory[];
  status: SupplierStatus;
  statusReason?: string;
  /** Per-supplier commission override (%); null/undefined = platform default. */
  commissionPercent?: number | null;
  shipping: { zones: string[]; fee: number; freeAbove: number; leadTimeDays: number };
  payout?: { legalName?: string; method?: 'ccp' | 'bank'; rib?: string; updatedAt?: Date };
  invited?: boolean;
  approvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const supplierSchema = new Schema<ISupplier>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    companyName: { type: String, required: true, trim: true, maxlength: 120 },
    slug: { type: String, required: true, unique: true },
    nif: { type: String, trim: true, maxlength: 30 },
    rc: { type: String, trim: true, maxlength: 30 },
    contactName: { type: String, trim: true, maxlength: 120 },
    phone: { type: String, trim: true, maxlength: 30 },
    email: { type: String, required: true, lowercase: true, trim: true },
    wilaya: String,
    address: { type: String, trim: true, maxlength: 300 },
    description: { type: String, trim: true, maxlength: 1000 },
    categories: [{ type: String, enum: MARKET_CATEGORIES }],
    status: { type: String, enum: SUPPLIER_STATUSES, default: 'pending', index: true },
    statusReason: { type: String, maxlength: 500 },
    commissionPercent: { type: Number, min: 0, max: 100, default: null },
    shipping: {
      zones: { type: [String], default: [] },
      fee: { type: Number, default: 0, min: 0 },
      freeAbove: { type: Number, default: 0, min: 0 },
      leadTimeDays: { type: Number, default: 3, min: 0, max: 60 },
    },
    // Sensitive: never in public responses
    payout: { type: { legalName: String, method: { type: String, enum: ['ccp', 'bank'] }, rib: String, updatedAt: Date }, select: false },
    invited: Boolean,
    approvedAt: Date,
  },
  { timestamps: true }
);
export const Supplier = model<ISupplier>('Supplier', supplierSchema);

export interface ISupplierProduct {
  _id: Types.ObjectId;
  supplierId: Types.ObjectId;
  name: string;
  brand?: string;
  category: MarketCategory;
  description?: string;
  photos: string[];
  /** Selling unit as shown: "Flacon 1 L", "Boîte de 100", "Carton de 12". */
  unit: string;
  sku?: string;
  /** Pro price, DA TTC. */
  price: number;
  minOrderQty: number;
  stock: number;
  /** Override of the supplier's lead time (days), optional. */
  leadTimeDays?: number;
  /** Override of the supplier's delivery zones; empty = supplier zones. */
  zones: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const supplierProductSchema = new Schema<ISupplierProduct>(
  {
    supplierId: { type: Schema.Types.ObjectId, ref: 'Supplier', required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 140 },
    brand: { type: String, trim: true, maxlength: 80 },
    category: { type: String, enum: MARKET_CATEGORIES, required: true },
    description: { type: String, trim: true, maxlength: 1500 },
    photos: { type: [String], default: [] },
    unit: { type: String, trim: true, maxlength: 60, default: 'Unité' },
    sku: { type: String, trim: true, maxlength: 60 },
    price: { type: Number, required: true, min: 1 },
    minOrderQty: { type: Number, default: 1, min: 1 },
    stock: { type: Number, default: 0, min: 0 },
    leadTimeDays: { type: Number, min: 0, max: 60 },
    zones: { type: [String], default: [] },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);
supplierProductSchema.index({ supplierId: 1, sku: 1 });
export const SupplierProduct = model<ISupplierProduct>('SupplierProduct', supplierProductSchema);

export const ORDER_STATUSES = [
  'pending_payment', 'paid', 'accepted', 'shipped', 'delivered', 'disputed', 'released',
  'refund_pending', 'refunded', 'partially_refunded', 'cancelled', 'expired',
] as const;
export type OrderStatus = typeof ORDER_STATUSES[number];

export interface OrderItem {
  productId: Types.ObjectId;
  name: string;
  brand?: string;
  unit: string;
  sku?: string;
  price: number;
  qty: number;
  total: number;
  /** Salon product this line feeds when "Ajouter au stock" is used (remembered for next orders). */
  stockProductId?: Types.ObjectId;
  stockQty?: number;
}

export interface IMarketOrder {
  _id: string;
  number: string;
  salonId: Types.ObjectId;
  supplierId: Types.ObjectId;
  salonName: string;
  supplierName: string;
  shipTo: { name: string; contact?: string; phone?: string; address: string; wilaya: string };
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  commissionPercent: number;
  /** Set at settlement, on the amount that goes to the supplier. */
  commission?: number;
  refundAmount?: number;
  status: OrderStatus;
  /** Final status a refund_pending order reaches once the gateway refund goes through. */
  refundTarget?: 'refunded' | 'partially_refunded';
  refundError?: string;
  stockRestored?: boolean;
  shipment?: { carrier?: string; tracking?: string; shippedAt?: Date };
  dispute?: { reason: string; openedAt: Date; resolution?: string; resolvedAt?: Date };
  satim: { orderId?: string; orderNumber?: string };
  attempts: number;
  cardLast4?: string;
  approvalCode?: string;
  lastMessage?: string;
  paidAt?: Date;
  acceptedAt?: Date;
  deliveredAt?: Date;
  releasedAt?: Date;
  refundedAt?: Date;
  stockAddedAt?: Date;
  reminders: { d3?: boolean; d6?: boolean; ship?: boolean };
  payoutId?: Types.ObjectId;
  messages: { from: 'salon' | 'supplier' | 'admin'; body: string; at: Date }[];
  createdAt: Date;
  updatedAt: Date;
}

const orderSchema = new Schema<IMarketOrder>(
  {
    // Random, unguessable: the only identifier in the SATIM return URL
    _id: { type: String, default: () => crypto.randomBytes(12).toString('hex') },
    number: { type: String, required: true, unique: true },
    salonId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    supplierId: { type: Schema.Types.ObjectId, ref: 'Supplier', required: true, index: true },
    salonName: String,
    supplierName: String,
    shipTo: { name: String, contact: String, phone: String, address: String, wilaya: String },
    items: [{
      _id: false,
      productId: { type: Schema.Types.ObjectId, ref: 'SupplierProduct' },
      name: String, brand: String, unit: String, sku: String,
      price: Number, qty: Number, total: Number,
      stockProductId: { type: Schema.Types.ObjectId, ref: 'Product' },
      stockQty: Number,
    }],
    subtotal: { type: Number, required: true, min: 0 },
    deliveryFee: { type: Number, default: 0, min: 0 },
    total: { type: Number, required: true, min: 0 },
    commissionPercent: { type: Number, default: 0 },
    commission: Number,
    refundAmount: Number,
    status: { type: String, enum: ORDER_STATUSES, default: 'pending_payment', index: true },
    refundTarget: { type: String, enum: ['refunded', 'partially_refunded'] },
    refundError: String,
    stockRestored: Boolean,
    shipment: { carrier: String, tracking: String, shippedAt: Date },
    dispute: { reason: String, openedAt: Date, resolution: String, resolvedAt: Date },
    satim: { orderId: { type: String, index: true }, orderNumber: String },
    attempts: { type: Number, default: 0 },
    cardLast4: String,
    approvalCode: String,
    lastMessage: String,
    paidAt: Date,
    acceptedAt: Date,
    deliveredAt: Date,
    releasedAt: Date,
    refundedAt: Date,
    stockAddedAt: Date,
    reminders: { d3: Boolean, d6: Boolean, ship: Boolean },
    payoutId: { type: Schema.Types.ObjectId, ref: 'SupplierPayout' },
    messages: [{ _id: false, from: { type: String, enum: ['salon', 'supplier', 'admin'] }, body: { type: String, maxlength: 2000 }, at: Date }],
  },
  { timestamps: true }
);
orderSchema.index({ status: 1, createdAt: 1 });
orderSchema.index({ status: 1, 'shipment.shippedAt': 1 });
orderSchema.index({ supplierId: 1, createdAt: -1 });
orderSchema.index({ salonId: 1, createdAt: -1 });
export const MarketOrder = model<IMarketOrder>('MarketOrder', orderSchema);

/** Append-only audit trail: one document per status change (never updated or deleted). */
const orderEventSchema = new Schema(
  {
    orderId: { type: String, required: true, index: true },
    from: { type: String, default: null },
    to: { type: String, required: true },
    actor: { type: String, enum: ['salon', 'supplier', 'admin', 'system'], required: true },
    note: String,
    at: { type: Date, default: Date.now },
  },
  { versionKey: false }
);
export const MarketOrderEvent = model('MarketOrderEvent', orderEventSchema);

/** A bank/CCP transfer from Saloneo to a supplier, recorded by an admin. */
const supplierPayoutSchema = new Schema(
  {
    supplierId: { type: Schema.Types.ObjectId, ref: 'Supplier', required: true, index: true },
    amount: { type: Number, required: true, min: 0 },
    paidAt: { type: Date, required: true },
    reference: { type: String, trim: true, maxlength: 120 },
    method: { type: String, enum: ['ccp', 'bank'] },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);
export const SupplierPayout = model('SupplierPayout', supplierPayoutSchema);

/** Platform-wide marketplace settings (one document, _id 'marketplace'). */
export interface MarketSettingsDoc { commissionPercent: number; autoReleaseDays: number; shipDeadlineDays: number }
export const DEFAULT_MARKET_SETTINGS: MarketSettingsDoc = { commissionPercent: 8, autoReleaseDays: 7, shipDeadlineDays: 5 };
const marketSettingsSchema = new Schema(
  {
    _id: { type: String, default: 'marketplace' },
    commissionPercent: { type: Number, default: DEFAULT_MARKET_SETTINGS.commissionPercent, min: 0, max: 100 },
    autoReleaseDays: { type: Number, default: DEFAULT_MARKET_SETTINGS.autoReleaseDays, min: 1, max: 60 },
    shipDeadlineDays: { type: Number, default: DEFAULT_MARKET_SETTINGS.shipDeadlineDays, min: 1, max: 60 },
  },
  { versionKey: false }
);
export const MarketSettings = model('MarketSettings', marketSettingsSchema);
