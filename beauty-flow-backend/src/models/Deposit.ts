import crypto from 'crypto';
import { Schema, model, Types } from 'mongoose';

/**
 * Online deposits (acomptes): collected on Saloneo's SATIM merchant account, then paid out to the salon.
 * Lifecycle and rules live in services/deposits.ts; every status change appends a DepositEvent.
 */
export const DEPOSIT_STATUSES = ['pending', 'paid', 'failed', 'expired', 'refund_pending', 'refunded', 'retained', 'applied'] as const;
export type DepositStatus = typeof DEPOSIT_STATUSES[number];

export interface IDeposit {
  _id: string;
  userId: Types.ObjectId; // salon
  appointmentId: Types.ObjectId;
  serviceId: string;
  serviceName: string;
  clientName: string;
  clientEmail?: string;
  amount: number; // DA
  currency: string;
  status: DepositStatus;
  holdExpiresAt: Date;
  attempts: number;
  satim: { orderId?: string; orderNumber?: string };
  /** Last message from SATIM (respCode_desc) shown to the client on failure. */
  lastMessage?: string;
  cardLast4?: string;
  approvalCode?: string;
  paidAt?: Date;
  refundedAt?: Date;
  refundError?: string;
  /** When the money became the salon's (retained / applied); commission is taken then. */
  settledAt?: Date;
  commissionPercent?: number;
  commission?: number;
  payoutId?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const depositSchema = new Schema<IDeposit>(
  {
    // Random, unguessable: it is the only identifier in the SATIM return URL
    _id: { type: String, default: () => crypto.randomBytes(12).toString('hex') },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    appointmentId: { type: Schema.Types.ObjectId, ref: 'Appointment', required: true, index: true },
    serviceId: { type: String, required: true },
    serviceName: { type: String, default: '' },
    clientName: { type: String, default: '' },
    clientEmail: String,
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'DZD' },
    status: { type: String, enum: DEPOSIT_STATUSES, default: 'pending', index: true },
    holdExpiresAt: { type: Date, required: true },
    attempts: { type: Number, default: 0 },
    satim: {
      orderId: { type: String, index: true },
      orderNumber: String,
    },
    lastMessage: String,
    cardLast4: String,
    approvalCode: String,
    paidAt: Date,
    refundedAt: Date,
    refundError: String,
    settledAt: Date,
    commissionPercent: Number,
    commission: Number,
    payoutId: { type: Schema.Types.ObjectId, ref: 'Payout' },
  },
  { timestamps: true }
);
depositSchema.index({ status: 1, holdExpiresAt: 1 });
depositSchema.index({ userId: 1, createdAt: -1 });

export const Deposit = model<IDeposit>('Deposit', depositSchema);

/** Append-only audit trail: one document per status change (never updated or deleted). */
const depositEventSchema = new Schema(
  {
    depositId: { type: String, required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    from: { type: String, default: null },
    to: { type: String, required: true },
    actor: { type: String, enum: ['client', 'salon', 'admin', 'system'], required: true },
    note: String,
    at: { type: Date, default: Date.now },
  },
  { versionKey: false }
);
export const DepositEvent = model('DepositEvent', depositEventSchema);

/** A bank/CCP transfer from Saloneo to a salon, recorded by an admin. */
const payoutSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    amount: { type: Number, required: true, min: 0 },
    paidAt: { type: Date, required: true },
    reference: { type: String, trim: true, maxlength: 120 },
    method: { type: String, enum: ['ccp', 'bank'] },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);
export const Payout = model('Payout', payoutSchema);

/** Platform-wide deposit settings (one document, _id 'deposits'). */
const depositSettingsSchema = new Schema(
  { _id: { type: String, default: 'deposits' }, commissionPercent: { type: Number, default: 0, min: 0, max: 100 } },
  { versionKey: false }
);
export const DepositSettings = model('DepositSettings', depositSettingsSchema);
