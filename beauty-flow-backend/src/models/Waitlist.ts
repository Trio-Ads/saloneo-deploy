import { Schema, model, Document, Types } from 'mongoose';
import crypto from 'crypto';

export const TIMES_OF_DAY = ['morning', 'afternoon', 'evening', 'any'] as const;
export type TimeOfDay = typeof TIMES_OF_DAY[number];
export const WAITLIST_STATUSES = ['active', 'offered', 'booked', 'expired', 'cancelled'] as const;
export type WaitlistStatus = typeof WAITLIST_STATUSES[number];

export interface WaitlistOffer {
  /** Salon-local day + time; stylistId = who the engine assigned when the offer was made. */
  slot: { date: string; time: string; stylistId: string };
  sentAt: Date;
  expiresAt: Date;
  /** Unique booking link of this offer. */
  token: string;
  /** Slot held for this client while the offer runs (salon setting "réserver pour l'offre"). */
  held: boolean;
  manual: boolean;
  channels: string[];
  outcome?: 'booked' | 'expired' | 'taken' | 'cancelled';
}

export interface IWaitlistEntry extends Document {
  userId: Types.ObjectId;
  serviceId: string;
  /** null = "peu importe" */
  stylistId?: string | null;
  from: string;
  to: string;
  timeOfDay: TimeOfDay;
  client: { firstName: string; lastName: string; phone: string; email?: string };
  /** Digits-only national number (last 9 digits): duplicate detection and booked detection. */
  phoneKey: string;
  status: WaitlistStatus;
  offers: WaitlistOffer[];
  /** Manage link (leave the list). */
  token: string;
  bookedAppointmentId?: Types.ObjectId;
  lang?: string;
  createdAt: Date;
  updatedAt: Date;
}

export const newToken = () => crypto.randomBytes(16).toString('hex');

const waitlistSchema = new Schema<IWaitlistEntry>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    serviceId: { type: String, required: true },
    stylistId: { type: String, default: null },
    from: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
    to: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
    timeOfDay: { type: String, enum: TIMES_OF_DAY, default: 'any' },
    client: {
      firstName: { type: String, required: true, trim: true, maxlength: 60 },
      lastName: { type: String, trim: true, maxlength: 60, default: '' },
      phone: { type: String, required: true, trim: true, maxlength: 30 },
      email: { type: String, trim: true, lowercase: true, maxlength: 120 },
    },
    phoneKey: { type: String, required: true },
    status: { type: String, enum: WAITLIST_STATUSES, default: 'active' },
    offers: [{
      _id: false,
      slot: { date: String, time: String, stylistId: String },
      sentAt: Date,
      expiresAt: Date,
      token: String,
      held: { type: Boolean, default: false },
      manual: { type: Boolean, default: false },
      channels: [String],
      outcome: { type: String, enum: ['booked', 'expired', 'taken', 'cancelled'] },
    }],
    token: { type: String, required: true, unique: true, default: newToken },
    bookedAppointmentId: { type: Schema.Types.ObjectId, ref: 'Appointment' },
    lang: String,
  },
  { timestamps: true }
);

waitlistSchema.index({ userId: 1, status: 1, from: 1, to: 1 });
waitlistSchema.index({ userId: 1, phoneKey: 1, status: 1 });
waitlistSchema.index({ 'offers.token': 1 });

export const WaitlistEntry = model<IWaitlistEntry>('WaitlistEntry', waitlistSchema);
