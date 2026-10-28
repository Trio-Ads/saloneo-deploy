/**
 * Online deposits (acomptes). Card payments (CIB / Edahabia via SATIM) are collected on Saloneo's
 * merchant account, then paid out to each salon minus an optional platform commission.
 *
 * Pure rules first (amount, cancellation policy, state machine, ledger — tested in __tests__/deposits.test.ts),
 * then the operations. Every status change goes through transition(): an atomic compare-and-set on the
 * current status (so confirming twice never credits twice) that appends a DepositEvent.
 *
 * Hold: an online booking that needs a deposit is saved as `pending_payment` with holdExpiresAt
 * (= now + HOLD_MINUTES) under the availability lock; the engine ignores it once that instant has passed,
 * and sweepExpiredHolds() (every minute) releases it for good.
 */
import { Types } from 'mongoose';
import * as cron from 'node-cron';
import { Deposit, DepositEvent, DepositSettings, DepositStatus, IDeposit, Payout } from '../models/Deposit';
import { Appointment } from '../models/Appointment';
import { User } from '../models/User';
import { Service } from '../models/Service';
import { satimPaymentService } from './satimPayment.service';
import { emailService } from './emailService';
import { onCapacityFreed } from './waitlist';
import { logger } from '../utils/logger';
import {
  AvailabilityError, BookingSettings, bookWithLock, dateKey, dayNum, fmt, keyOf, normalizeBooking, nowIn, staffName, toMin, withSlotLock,
} from './availability';

/**
 * Production gate: online deposits run only with DEPOSITS_ENABLED=1 (set it once real SATIM credentials are live).
 * Off: deposit services book like any other (no pending_payment, no payment step); settings stay editable.
 */
export const depositsEnabled = () => ['1', 'true'].includes(String(process.env.DEPOSITS_ENABLED || '').toLowerCase());

export const HOLD_MINUTES = 15;
export const MIN_DEPOSIT = 500; // DA
export const MAX_ATTEMPTS = 5;

/* ── pure rules ──────────────────────────────────────────────── */

export type DepositMode = 'none' | 'fixed' | 'percent';
export interface DepositRule { mode?: DepositMode | string; value?: number }

/**
 * Deposit in DA for a service price: percent of the price rounded to 50 DA, or a fixed amount;
 * at least MIN_DEPOSIT and never more than the price. 0 = no deposit.
 */
export function depositAmount(price: number, rule?: DepositRule | null): number {
  const p = Number(price) || 0, v = Number(rule?.value) || 0;
  if (!rule || p <= 0 || v <= 0 || (rule.mode !== 'fixed' && rule.mode !== 'percent')) return 0;
  const raw = rule.mode === 'percent' ? Math.round((p * Math.min(100, v)) / 100 / 50) * 50 : Math.round(v);
  return Math.min(p, Math.max(MIN_DEPOSIT, raw));
}

export interface Policy {
  /** Last moment (salon time) to cancel for free / reschedule freely. */
  freeUntil: { date: string; time: string };
  isFree: boolean;
  started: boolean;
}

/** Free-cancellation deadline of an appointment, in the salon's timezone (`now` from nowIn). */
export function cancellationPolicy(hours: number, appt: { date: Date | string; startTime: string }, now: { date: string; minutes: number }): Policy {
  const start = dayNum(dateKey(appt.date)) * 1440 + toMin(appt.startTime);
  const current = dayNum(now.date) * 1440 + now.minutes;
  const deadline = start - hours * 60;
  return {
    freeUntil: { date: keyOf(Math.floor(deadline / 1440)), time: fmt(((deadline % 1440) + 1440) % 1440) },
    isFree: current <= deadline,
    started: current >= start,
  };
}

export type CancelDecision = { ok: true; deposit: 'refund' | 'retain' | null } | { ok: false; code: 'CANCELLATION_DISABLED' | 'CANCELLATION_DEADLINE_PASSED' };
/** Client cancellation online: before the deadline → free (deposit refunded); after → deposit kept, or refused without deposit. */
export function clientCancelDecision(booking: BookingSettings, policy: Policy, paidDeposit: boolean): CancelDecision {
  if (!booking.allowCancellation) return { ok: false, code: 'CANCELLATION_DISABLED' };
  if (paidDeposit) return { ok: true, deposit: policy.isFree ? 'refund' : 'retain' };
  return policy.isFree ? { ok: true, deposit: null } : { ok: false, code: 'CANCELLATION_DEADLINE_PASSED' };
}

export type RescheduleDecision = { ok: true; late: boolean } | { ok: false; code: 'RESCHEDULE_DEADLINE_PASSED' };
/** Client reschedule: free before the deadline; after it, once if the salon allows it (deposit carries over). */
export function clientRescheduleDecision(booking: BookingSettings, policy: Policy, lateReschedules = 0): RescheduleDecision {
  if (policy.isFree) return { ok: true, late: false };
  if (!policy.started && booking.lateReschedule && lateReschedules < 1) return { ok: true, late: true };
  return { ok: false, code: 'RESCHEDULE_DEADLINE_PASSED' };
}

/** Allowed status changes. expired → paid: SATIM confirms a payment that arrived after the hold ran out. */
export const TRANSITIONS: Record<DepositStatus, DepositStatus[]> = {
  pending: ['paid', 'failed', 'expired'],
  failed: ['pending', 'paid', 'expired'],
  expired: ['paid'],
  paid: ['refund_pending', 'retained', 'applied'],
  refund_pending: ['refund_pending', 'refunded'],
  refunded: [],
  retained: [],
  applied: [],
};
export const canTransition = (from: DepositStatus, to: DepositStatus) => TRANSITIONS[from]?.includes(to) ?? false;

export const commissionOf = (amount: number, percent: number) => Math.round((amount * Math.max(0, percent)) / 100);

export interface Ledger { pending: number; earned: number; commission: number; paidOut: number; available: number; refundPending: number }
/**
 * Salon balance: retained + applied deposits (the salon's money) − commission − payouts = available.
 * Paid deposits of upcoming appointments are "en attente".
 */
export function ledger(deposits: { status: string; amount: number; commission?: number }[], payouts: { amount: number }[]): Ledger {
  const l = { pending: 0, earned: 0, commission: 0, paidOut: 0, available: 0, refundPending: 0 };
  for (const d of deposits) {
    if (d.status === 'paid') l.pending += d.amount;
    if (d.status === 'refund_pending') l.refundPending += d.amount;
    if (d.status === 'retained' || d.status === 'applied') { l.earned += d.amount; l.commission += d.commission || 0; }
  }
  l.paidOut = payouts.reduce((s, p) => s + p.amount, 0);
  l.available = l.earned - l.commission - l.paidOut;
  return l;
}

/** Status shown to the salon: settled deposits already transferred read as "reversé". */
export const displayStatus = (d: { status: string; payoutId?: unknown }) => (d.payoutId ? 'paid_out' : d.status);

/** RIP (CCP, Algérie Poste: 007 99999 …) or bank RIB: 20 digits. */
export function validRib(method: string, rib: string): boolean {
  if (!/^\d{20}$/.test(rib)) return false;
  return method === 'ccp' ? rib.startsWith('00799999') : method === 'bank';
}

/* ── errors ──────────────────────────────────────────────────── */

export type DepositErrorCode =
  | 'NOT_FOUND' | 'HOLD_EXPIRED' | 'PAYMENT_UNAVAILABLE' | 'TOO_MANY_ATTEMPTS' | 'NOT_RETRYABLE' | 'VERIFY_FAILED'
  | 'PAYOUT_EXCEEDS_BALANCE' | 'INVALID';
const HTTP: Record<DepositErrorCode, number> = {
  NOT_FOUND: 404, HOLD_EXPIRED: 410, PAYMENT_UNAVAILABLE: 503, TOO_MANY_ATTEMPTS: 429, NOT_RETRYABLE: 409, VERIFY_FAILED: 502,
  PAYOUT_EXCEEDS_BALANCE: 400, INVALID: 400,
};
export class DepositError extends Error {
  constructor(public code: DepositErrorCode, message: string = code) { super(message); }
  get status() { return HTTP[this.code]; }
}
/** Express helper: { error, code } with the right status for DepositError; false for anything else. */
export function sendDepositError(res: any, error: unknown): boolean {
  if (!(error instanceof DepositError)) return false;
  res.status(error.status).json({ error: error.message, code: error.code });
  return true;
}

/* ── state changes ───────────────────────────────────────────── */

type Actor = 'client' | 'salon' | 'admin' | 'system';

/** Compare-and-set the status (from one of `from`), then append the audit event. null when the deposit was not in `from`. */
async function transition(id: string, from: DepositStatus[], to: DepositStatus, actor: Actor, note?: string, set: Record<string, any> = {}): Promise<IDeposit | null> {
  const allowed = from.filter((f) => canTransition(f, to));
  const before = await Deposit.findOneAndUpdate({ _id: id, status: { $in: allowed } }, { $set: { ...set, status: to } }, { new: false }).lean();
  if (!before) return null;
  await DepositEvent.create({ depositId: id, userId: before.userId, from: before.status, to, actor, note });
  logger.info('Deposit status', { depositId: id, from: before.status, to, actor });
  return Deposit.findById(id).lean() as any;
}

/** A hold ran out: the waitlist (services/waitlist.ts) may offer the slot. Cancellations call it from their own paths. */
export function capacityFreed(salonId: string, date: string, stylistId?: string): void {
  onCapacityFreed(salonId, date, stylistId).catch((e) => logger.error('onCapacityFreed failed', e));
}

const frontend = () => process.env.FRONTEND_URL || 'https://saloneo.app';
const ascii = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^\x20-\x7e]/g, '').trim();

/** New SATIM order for the deposit (each attempt needs its own order number). */
async function registerOrder(dep: IDeposit, salonName: string, slug: string, language?: string): Promise<string> {
  if ((dep.attempts || 0) >= MAX_ATTEMPTS) throw new DepositError('TOO_MANY_ATTEMPTS', 'Trop de tentatives de paiement');
  const orderNumber = `AC${Date.now().toString().slice(-6)}${String(Math.floor(Math.random() * 100)).padStart(2, '0')}`;
  // SATIM appends ?orderId=… on return; the page never trusts it and re-checks with SATIM by deposit id
  const back = `${frontend()}/booking/payment-return?d=${dep._id}&s=${encodeURIComponent(slug)}`;
  const { orderId, formUrl } = await satimPaymentService.registerPayment({
    orderNumber,
    amount: Math.round(dep.amount * 100),
    returnUrl: back,
    failUrl: back,
    description: ascii(`Acompte ${salonName} - ${dep.serviceName}`),
    udf1: dep._id,
    udf2: String(dep.userId),
    language,
  });
  await Deposit.updateOne({ _id: dep._id }, { $set: { 'satim.orderId': orderId, 'satim.orderNumber': orderNumber }, $inc: { attempts: 1 } });
  return formUrl;
}

/** After the booking is held as pending_payment: the Deposit record and its first SATIM order. Releases the hold if SATIM is down. */
export async function startDeposit(appt: any, salon: any, serviceName: string, slug: string, language?: string): Promise<{ deposit: IDeposit; formUrl: string }> {
  const dep = (await Deposit.create({
    userId: salon._id,
    appointmentId: appt._id,
    serviceId: String(appt.serviceId),
    serviceName,
    clientName: `${appt.clientInfo?.firstName || ''} ${appt.clientInfo?.lastName || ''}`.trim(),
    clientEmail: appt.clientInfo?.email || undefined,
    amount: appt.deposit.amount,
    holdExpiresAt: appt.holdExpiresAt,
  })).toObject() as IDeposit;
  await DepositEvent.create({ depositId: dep._id, userId: salon._id, from: null, to: 'pending', actor: 'client', note: 'Réservation en ligne' });
  await Appointment.updateOne({ _id: appt._id }, { $set: { 'deposit.id': dep._id } });
  try {
    const formUrl = await registerOrder(dep, salon.establishmentName || '', slug, language);
    return { deposit: dep, formUrl };
  } catch (error) {
    logger.error('Deposit: SATIM registration failed, releasing the hold', { depositId: dep._id, error: (error as Error).message });
    await transition(dep._id, ['pending'], 'expired', 'system', 'Passerelle de paiement indisponible');
    await Appointment.updateOne({ _id: appt._id, status: 'pending_payment' }, {
      $set: { status: 'cancelled', cancellation: { cancelledBy: 'client', cancelledAt: new Date(), reason: 'Paiement indisponible' } },
    });
    throw error instanceof DepositError ? error : new DepositError('PAYMENT_UNAVAILABLE', 'Le paiement en ligne est momentanément indisponible');
  }
}

/** Paid: the booking leaves pending_payment for the salon's chosen status. */
async function confirmAppointment(dep: IDeposit) {
  const salon: any = await User.findById(dep.userId).select('bookingSettings').lean();
  await Appointment.updateOne({ _id: dep.appointmentId }, {
    $set: { status: normalizeBooking(salon?.bookingSettings).paidStatus, 'deposit.paid': true, 'deposit.paidAt': dep.paidAt },
    $unset: { holdExpiresAt: 1, cancellation: 1 },
  });
}

async function markPaid(dep: IDeposit, r: { cardLast4?: string; approvalCode?: string; message?: string }): Promise<IDeposit | null> {
  const set = { paidAt: new Date(), cardLast4: r.cardLast4, approvalCode: r.approvalCode, lastMessage: r.message };
  const updated = await transition(dep._id, ['pending', 'failed'], 'paid', 'client', 'Paiement SATIM confirmé', set);
  if (updated) {
    await confirmAppointment(updated);
    sendBookingConfirmation(String(updated.appointmentId)).catch((e) => logger.error('Deposit paid: emails failed', e));
    return updated;
  }
  const current: any = await Deposit.findById(dep._id).lean();
  if (current?.status !== 'expired') return current; // already paid (idempotent) or settled

  // Paid after the hold ran out: keep the booking if the slot is still free, otherwise refund at once
  const appt: any = await Appointment.findById(current.appointmentId);
  try {
    if (!appt) throw new AvailabilityError('SLOT_TAKEN');
    await bookWithLock(current.userId, String(appt.serviceId), dateKey(appt.date), appt.startTime, String(appt.stylistId), async () => {
      const u = await transition(current._id, ['expired'], 'paid', 'client', 'Paiement reçu après le délai — créneau toujours libre', set);
      if (u) await confirmAppointment(u);
    }, { excludeAppointmentId: appt._id, duration: appt.duration, force: true });
    sendBookingConfirmation(String(appt._id)).catch((e) => logger.error('Deposit paid late: emails failed', e));
  } catch (error) {
    if (!(error instanceof AvailabilityError)) throw error;
    const u = await transition(current._id, ['expired'], 'paid', 'system', 'Paiement reçu après le délai — créneau repris', set);
    if (u) {
      const after = await refundDeposit(u._id, 'system', 'Créneau plus disponible : paiement arrivé après le délai');
      notifyLateRefund(after || u).catch((e) => logger.error('Late payment notice failed', e));
    }
  }
  return Deposit.findById(dep._id).lean() as any;
}

/**
 * Ask SATIM where the current order stands (never trust return-URL params).
 * from 'return': the client is back on our page — an unpaid order is a failure they can retry.
 * from 'sweep': only a payment is acted upon.
 */
export async function syncPayment(id: string, from: 'return' | 'sweep'): Promise<IDeposit | null> {
  const dep: any = await Deposit.findById(id).lean();
  if (!dep || !['pending', 'failed', 'expired'].includes(dep.status) || !dep.satim?.orderId) return dep;
  let r;
  try {
    r = await satimPaymentService.checkPayment(dep.satim.orderId);
  } catch (error) {
    logger.error('Deposit: SATIM status check failed', { depositId: id, error: (error as Error).message });
    throw new DepositError('VERIFY_FAILED', 'Impossible de vérifier le paiement pour le moment');
  }
  if (r.paid) return markPaid(dep, r);
  if (from === 'return' && dep.status === 'pending') {
    return (await transition(id, ['pending'], 'failed', 'client', r.message || 'Paiement non abouti', { lastMessage: r.message || '' })) || (Deposit.findById(id).lean() as any);
  }
  if (from === 'return' && r.message && r.message !== dep.lastMessage) await Deposit.updateOne({ _id: id }, { $set: { lastMessage: r.message } });
  return Deposit.findById(id).lean() as any;
}

/** "Réessayer": a new SATIM order for the same hold, while it lasts. */
export async function retryPayment(id: string, slug: string, language?: string): Promise<string> {
  const dep = await syncPayment(id, 'return');
  if (!dep) throw new DepositError('NOT_FOUND');
  if (dep.status === 'paid') throw new DepositError('NOT_RETRYABLE', 'Cet acompte est déjà payé');
  if (dep.status !== 'failed' && dep.status !== 'pending') throw new DepositError('HOLD_EXPIRED', 'Le délai de paiement est dépassé');
  if (new Date(dep.holdExpiresAt).getTime() <= Date.now()) throw new DepositError('HOLD_EXPIRED', 'Le délai de paiement est dépassé');
  const salon: any = await User.findById(dep.userId).select('establishmentName').lean();
  if (dep.status === 'failed' && !(await transition(id, ['failed'], 'pending', 'client', 'Nouvelle tentative de paiement'))) {
    throw new DepositError('NOT_RETRYABLE');
  }
  return registerOrder({ ...dep, status: 'pending' }, salon?.establishmentName || '', slug, language);
}

/** Holds past their time: last SATIM check (a payment may have gone through without the client coming back), then release. */
export async function sweepExpiredHolds(now = new Date()): Promise<number> {
  const due: any[] = await Deposit.find({ status: { $in: ['pending', 'failed'] }, holdExpiresAt: { $lte: now } }).limit(100).lean();
  let released = 0;
  for (const d of due) {
    if (d.satim?.orderId) {
      try {
        const s = await syncPayment(d._id, 'sweep');
        if (s?.status === 'paid') continue;
      } catch {
        // SATIM unreachable: retry next minute; give up waiting after 30 min (a late payment is still caught on return)
        if (now.getTime() - new Date(d.holdExpiresAt).getTime() < 30 * 60000) continue;
      }
    }
    const e = await transition(d._id, ['pending', 'failed'], 'expired', 'system', 'Délai de paiement dépassé');
    if (!e) continue;
    const appt: any = await Appointment.findOneAndUpdate(
      { _id: e.appointmentId, status: 'pending_payment' },
      { $set: { status: 'cancelled', cancellation: { cancelledBy: 'client', cancelledAt: now, reason: 'Acompte non payé dans le délai' } } },
      { new: true }
    ).lean();
    if (appt) capacityFreed(String(appt.userId), dateKey(appt.date), String(appt.stylistId));
    released++;
  }
  return released;
}

export async function commissionPercent(): Promise<number> {
  const s: any = await DepositSettings.findById('deposits').lean();
  return s?.commissionPercent || 0;
}

async function settle(dep: IDeposit, to: 'retained' | 'applied', actor: Actor, note: string): Promise<IDeposit | null> {
  const pct = await commissionPercent();
  return transition(dep._id, ['paid'], to, actor, note, { settledAt: new Date(), commissionPercent: pct, commission: commissionOf(dep.amount, pct) });
}

/** Full refund through SATIM. Claimed first (paid → refund_pending) so it can only run once; a gateway refusal stays refund_pending and alerts the admins. */
export async function refundDeposit(id: string, actor: Actor, note: string): Promise<IDeposit | null> {
  const claimed = await transition(id, ['paid', 'refund_pending'], 'refund_pending', actor, note);
  if (!claimed) return Deposit.findById(id).lean() as any;
  let r: { ok: boolean; message?: string };
  try {
    r = claimed.satim?.orderId ? await satimPaymentService.refundPayment(claimed.satim.orderId, Math.round(claimed.amount * 100)) : { ok: false, message: 'Commande SATIM inconnue' };
  } catch (error) {
    r = { ok: false, message: (error as Error).message };
  }
  if (r.ok) {
    const done = await transition(id, ['refund_pending'], 'refunded', 'system', 'Remboursement SATIM effectué', { refundedAt: new Date(), refundError: '' });
    if (done) notifyDeposit(done, 'refunded').catch((e) => logger.error('Refund email failed', e));
    return done;
  }
  await Deposit.updateOne({ _id: id }, { $set: { refundError: r.message || 'Refus de la passerelle' } });
  alertAdmins(claimed, r.message).catch((e) => logger.error('Refund alert failed', e));
  return Deposit.findById(id).lean() as any;
}

/** Admin closes a failed refund done by other means (bank transfer to the client…). */
export async function markRefundedManually(id: string, note: string) {
  const done = await transition(id, ['refund_pending'], 'refunded', 'admin', note || 'Remboursement effectué manuellement', { refundedAt: new Date(), refundError: '' });
  if (done) notifyDeposit(done, 'refunded').catch((e) => logger.error('Refund email failed', e));
  return done;
}

const latestDeposit = (appointmentId: unknown) => Deposit.findOne({ appointmentId }).sort({ createdAt: -1 }).lean() as Promise<IDeposit | null>;

/**
 * Salon-side change of a booking (dashboard): cancelled/deleted → full refund (or the unpaid hold is dropped);
 * no-show → deposit kept; completed → deposit applied to the bill.
 */
export async function onSalonChange(appointmentId: unknown, change: 'cancelled' | 'deleted' | 'no_show' | 'completed'): Promise<void> {
  const dep = await latestDeposit(appointmentId);
  if (!dep) return;
  if (change === 'cancelled' || change === 'deleted') {
    if (dep.status === 'pending' || dep.status === 'failed') await transition(dep._id, ['pending', 'failed'], 'expired', 'salon', 'Réservation annulée par le salon avant paiement');
    if (dep.status === 'paid') await refundDeposit(dep._id, 'salon', 'Annulé par le salon');
  }
  if (dep.status !== 'paid') return;
  if (change === 'no_show') {
    const s = await settle(dep, 'retained', 'salon', 'Absence (no-show)');
    if (s) notifyDeposit(s, 'retained_no_show').catch((e) => logger.error('Retained email failed', e));
  }
  if (change === 'completed') await settle(dep, 'applied', 'salon', 'Prestation réalisée : acompte déduit');
}

/** Client cancelled online (policy already checked): refund before the deadline, keep it after. */
export async function onClientCancel(appointmentId: unknown, outcome: 'refund' | 'retain'): Promise<IDeposit | null> {
  const dep = await latestDeposit(appointmentId);
  if (!dep || dep.status !== 'paid') return dep;
  if (outcome === 'refund') return refundDeposit(dep._id, 'client', 'Annulation par la cliente avant la date limite');
  const s = await settle(dep, 'retained', 'client', 'Annulation tardive : acompte conservé par le salon');
  if (s) notifyDeposit(s, 'retained_late').catch((e) => logger.error('Retained email failed', e));
  return s;
}

/* ── views ───────────────────────────────────────────────────── */

export const paidDepositOf = async (appointmentId: unknown) => {
  const d = await latestDeposit(appointmentId);
  return d && ['paid', 'refund_pending', 'refunded', 'retained', 'applied'].includes(d.status) ? d : null;
};

/** What the client sees about the rules of one booking (manage page, booking step). */
export function policyView(booking: BookingSettings, appt: { date: Date | string; startTime: string; lateReschedules?: number }, tz: string, paidDeposit: boolean) {
  const policy = cancellationPolicy(booking.cancellationDeadlineHours, appt, nowIn(tz));
  const cancel = clientCancelDecision(booking, policy, paidDeposit);
  const resched = clientRescheduleDecision(booking, policy, appt.lateReschedules || 0);
  return {
    allowCancellation: booking.allowCancellation,
    freeCancellationHours: booking.cancellationDeadlineHours,
    lateReschedule: booking.lateReschedule,
    policyText: booking.policyText,
    freeUntil: policy.freeUntil,
    isFree: policy.isFree,
    canCancel: cancel.ok,
    cancelOutcome: cancel.ok ? cancel.deposit : null,
    cancelBlocked: cancel.ok ? null : cancel.code,
    canReschedule: resched.ok,
    lateRescheduleNext: resched.ok && resched.late,
    rescheduleBlocked: resched.ok ? null : resched.code,
  };
}

/** The salon's rules as shown before booking (public page). */
export const bookingPolicy = (b: BookingSettings) => ({
  allowCancellation: b.allowCancellation,
  freeCancellationHours: b.cancellationDeadlineHours,
  lateReschedule: b.lateReschedule,
  policyText: b.policyText,
});

/** Public view of one deposit for the SATIM return page (no client PII beyond the booking itself). */
export async function publicDepositView(dep: IDeposit, salon: any) {
  const appt: any = await Appointment.findById(dep.appointmentId).lean();
  const booking = normalizeBooking(salon.bookingSettings);
  const paid = ['paid', 'retained', 'applied'].includes(dep.status);
  return {
    id: dep._id,
    status: dep.status,
    amount: dep.amount,
    currency: dep.currency,
    orderNumber: dep.satim?.orderNumber,
    paidAt: dep.paidAt,
    cardLast4: paid ? dep.cardLast4 : undefined,
    approvalCode: paid ? dep.approvalCode : undefined,
    message: dep.status === 'failed' ? dep.lastMessage : undefined,
    holdExpiresAt: dep.holdExpiresAt,
    canRetry: (dep.status === 'failed' || dep.status === 'pending') && new Date(dep.holdExpiresAt).getTime() > Date.now() && (dep.attempts || 0) < MAX_ATTEMPTS,
    appointment: appt && {
      date: dateKey(appt.date),
      startTime: appt.startTime,
      duration: appt.duration,
      price: appt.price,
      serviceName: dep.serviceName,
      stylistName: await staffName(salon, appt.stylistId),
      status: appt.status,
      // Only once paid: the link that lets the client manage the booking
      modificationToken: paid ? appt.tokens?.modification : undefined,
    },
    policy: bookingPolicy(booking),
    salon: {
      establishmentName: salon.establishmentName,
      slug: salon.slug,
      address: salon.address,
      publicPhone: salon.publicPhone,
      theme: salon.theme,
      settings: { currency: salon.settings?.currency || 'DZD' },
    },
  };
}

/** Salon "Acomptes" tab: balance, deposits, payouts and payout details. */
export async function salonDepositsView(userId: string) {
  const [all, payouts, user, pct]: any[] = await Promise.all([
    Deposit.find({ userId, status: { $nin: ['pending', 'failed', 'expired'] } }).sort({ createdAt: -1 }).lean(),
    Payout.find({ userId }).sort({ paidAt: -1 }).lean(),
    User.findById(userId).select('+payout').lean(),
    commissionPercent(),
  ]);
  const appts: any[] = await Appointment.find({ _id: { $in: all.slice(0, 200).map((d: any) => d.appointmentId) } }).select('date startTime').lean();
  const when = new Map(appts.map((a) => [String(a._id), { date: dateKey(a.date), startTime: a.startTime }]));
  return {
    depositsEnabled: depositsEnabled(),
    summary: ledger(all, payouts),
    commissionPercent: pct,
    deposits: all.slice(0, 200).map((d: any) => ({
      id: d._id,
      createdAt: d.createdAt,
      appointment: when.get(String(d.appointmentId)),
      clientName: d.clientName,
      serviceName: d.serviceName,
      amount: d.amount,
      commission: d.commission || 0,
      status: displayStatus(d),
      orderNumber: d.satim?.orderNumber,
    })),
    payouts: payouts.map((p: any) => ({ id: p._id, amount: p.amount, paidAt: p.paidAt, reference: p.reference, method: p.method })),
    payoutInfo: user?.payout || null,
  };
}

/** Admin: every salon with deposit activity and its balance (with payout details, for the transfer). */
export async function adminBalances() {
  // ponytail: loads every settled deposit in memory; switch to an aggregation when this reaches ~100k deposits
  const [deps, payouts]: any[] = await Promise.all([
    Deposit.find({ status: { $in: ['paid', 'refund_pending', 'retained', 'applied'] } }).select('userId status amount commission').lean(),
    Payout.find({}).select('userId amount paidAt').lean(),
  ]);
  const ids = [...new Set([...deps, ...payouts].map((x: any) => String(x.userId)))];
  const users: any[] = await User.find({ _id: { $in: ids } }).select('+payout establishmentName email').lean();
  const of = (list: any[], id: string) => list.filter((x) => String(x.userId) === id);
  return users
    .map((u) => {
      const id = String(u._id), own = of(payouts, id);
      return {
        userId: id,
        establishmentName: u.establishmentName,
        email: u.email,
        payout: u.payout || null,
        ...ledger(of(deps, id), own),
        lastPayoutAt: own.map((p) => p.paidAt).sort().pop() || null,
      };
    })
    .sort((a, b) => b.available - a.available);
}

const csvCell = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
/** Bank transfer list: salons with money to receive (French Excel: ';' + UTF-8 BOM). */
export async function adminBalancesCsv(): Promise<string> {
  const rows = (await adminBalances()).filter((b) => b.available > 0);
  const lines = [
    ['Salon', 'Bénéficiaire', 'Mode', 'RIB / RIP', 'Montant (DA)', 'Email'],
    ...rows.map((b) => [b.establishmentName, b.payout?.legalName || '', b.payout?.method === 'ccp' ? 'CCP' : b.payout?.method === 'bank' ? 'Banque' : '', b.payout?.rib || '', b.available, b.email]),
  ];
  return '﻿' + lines.map((l) => l.map(csvCell).join(';')).join('\r\n');
}

/** Admin records a transfer to a salon; the settled deposits it covers (oldest first) read as "reversé". */
export async function recordPayout(userId: string, amount: number, paidAt: Date, reference: string, adminId?: string) {
  if (!Types.ObjectId.isValid(userId) || !(amount > 0) || isNaN(paidAt.getTime())) throw new DepositError('INVALID', 'Montant ou date invalide');
  // The availability lock doubles as a per-salon mutex: two payouts cannot both pass the balance check
  return withSlotLock(userId, 'payout', async () => {
    const [deps, prior, user]: any[] = await Promise.all([
      Deposit.find({ userId, status: { $in: ['retained', 'applied'] } }).sort({ settledAt: 1 }).lean(),
      Payout.find({ userId }).lean(),
      User.findById(userId).select('+payout establishmentName email').lean(),
    ]);
    if (!user) throw new DepositError('NOT_FOUND');
    const amountDa = Math.round(amount);
    if (amountDa > ledger(deps, prior).available) throw new DepositError('PAYOUT_EXCEEDS_BALANCE', 'Le montant dépasse le solde disponible');
    const payout: any = await Payout.create({ userId, amount: amountDa, paidAt, reference: reference?.trim(), method: user.payout?.method, createdBy: adminId });
    let left = amountDa;
    const covered: string[] = [];
    for (const d of deps.filter((x: any) => !x.payoutId)) {
      const net = d.amount - (d.commission || 0);
      if (net > left) break;
      left -= net;
      covered.push(d._id);
    }
    if (covered.length) await Deposit.updateMany({ _id: { $in: covered } }, { $set: { payoutId: payout._id } });
    notifyPayout(user, payout).catch((e) => logger.error('Payout email failed', e));
    return payout;
  });
}

/* ── emails ──────────────────────────────────────────────────── */

const da = (n: number) => `${Math.round(n).toLocaleString('fr-FR')} DA`;
const longDate = (key: string) =>
  new Date(`${key}T00:00:00.000Z`).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
const mask = (rib?: string) => (rib ? `•••• ${rib.slice(-4)}` : '');

/** One generic template ('deposit-notice'): title, intro, rows, note, button. */
export function notice(to: string | string[], data: { subject: string; title: string; intro: string; rows: [string, string][]; note?: string; buttonLabel?: string; buttonUrl?: string; salon?: any }) {
  const s = data.salon || {};
  return emailService.sendTemplateEmail('deposit-notice', to, {
    ...data,
    rows: data.rows.filter(([, v]) => v).map(([label, value]) => ({ label, value })),
    salonName: s.establishmentName || 'Saloneo',
    salonAddress: s.address || '',
    salonPhone: s.publicPhone || s.phone || '',
    salonEmail: s.email || '',
  });
}

/** Policy sentence used in emails, from the salon's settings. */
export function policySentence(b: BookingSettings, withDeposit = true): string {
  const base = !b.allowCancellation
    ? "L'annulation en ligne n'est pas proposée par ce salon : contactez-le directement."
    : withDeposit
      ? `Annulation gratuite jusqu'à ${b.cancellationDeadlineHours} h avant le rendez-vous : l'acompte vous est alors remboursé. Après ce délai, ou en cas d'absence, l'acompte est conservé par le salon.`
      : `Annulation gratuite en ligne jusqu'à ${b.cancellationDeadlineHours} h avant le rendez-vous. Passé ce délai, contactez le salon.`;
  return b.policyText ? `${base} ${b.policyText}` : base;
}

async function notifyDeposit(dep: IDeposit, kind: 'refunded' | 'retained_late' | 'retained_no_show') {
  const [salon, appt]: any[] = await Promise.all([
    User.findById(dep.userId).select('establishmentName address publicPhone phone email bookingSettings').lean(),
    Appointment.findById(dep.appointmentId).select('date startTime clientInfo').lean(),
  ]);
  const rows: [string, string][] = [
    ['Montant', da(dep.amount)],
    ['Prestation', dep.serviceName],
    ['Rendez-vous', appt ? `${longDate(dateKey(appt.date))} à ${appt.startTime}` : ''],
    ['N° de commande', dep.satim?.orderNumber || ''],
  ];
  const to = dep.clientEmail || appt?.clientInfo?.email;
  if (kind === 'refunded') {
    if (to) await notice(to, {
      subject: `Acompte remboursé - ${salon?.establishmentName || 'Saloneo'}`,
      title: 'Votre acompte a été remboursé',
      intro: `Bonjour ${dep.clientName}, le remboursement de votre acompte a été effectué sur la carte utilisée pour le paiement.`,
      rows,
      note: 'Selon votre banque, le montant apparaît sur votre compte sous quelques jours ouvrés.',
      salon,
    });
    return;
  }
  const late = kind === 'retained_late';
  if (to) await notice(to, {
    subject: `Acompte conservé - ${salon?.establishmentName || 'Saloneo'}`,
    title: 'Votre acompte est conservé par le salon',
    intro: late
      ? `Bonjour ${dep.clientName}, votre rendez-vous a bien été annulé. L'annulation ayant eu lieu après la date limite d'annulation gratuite, l'acompte est conservé par le salon, comme prévu par sa politique d'annulation.`
      : `Bonjour ${dep.clientName}, le salon a indiqué votre absence au rendez-vous. Comme prévu par sa politique d'annulation, l'acompte est conservé.`,
    rows,
    note: salon ? policySentence(normalizeBooking(salon.bookingSettings)) : undefined,
    salon,
  });
  if (late && salon?.email) await notice(salon.email, {
    subject: `Annulation tardive - acompte conservé (${dep.clientName})`,
    title: 'Annulation tardive : l’acompte vous revient',
    intro: `${dep.clientName} a annulé après la date limite d'annulation gratuite. L'acompte est conservé et ajouté à votre solde à reverser.`,
    rows,
    buttonLabel: 'Voir mes acomptes',
    buttonUrl: `${frontend()}/profile?tab=deposits`,
    salon,
  });
}

/** Paid after the hold ran out and the slot was rebooked: the salon (who may call the client) and the admins are told. */
async function notifyLateRefund(dep: IDeposit) {
  const [salon, appt, admins]: any[] = await Promise.all([
    User.findById(dep.userId).select('establishmentName address publicPhone phone email').lean(),
    Appointment.findById(dep.appointmentId).select('date startTime clientInfo').lean(),
    adminEmails(),
  ]);
  const refunded = dep.status === 'refunded';
  const data = {
    subject: `Paiement tardif remboursé - ${dep.clientName}`,
    title: 'Acompte payé après le délai : remboursé',
    intro: `${dep.clientName} a payé son acompte après l'expiration du délai de ${HOLD_MINUTES} minutes, alors que le créneau avait été réservé entre-temps. ${refunded ? "L'acompte lui a été remboursé automatiquement." : "Le remboursement automatique a échoué : il est à traiter dans l'administration."} Aucun rendez-vous n'a été créé.`,
    rows: [
      ['Cliente', dep.clientName],
      ['Téléphone', appt?.clientInfo?.phone || ''],
      ['Créneau demandé', appt ? `${longDate(dateKey(appt.date))} à ${appt.startTime}` : ''],
      ['Prestation', dep.serviceName],
      ['Montant', da(dep.amount)],
      ['N° de commande', dep.satim?.orderNumber || ''],
    ] as [string, string][],
    salon,
  };
  if (salon?.email) await notice(salon.email, { ...data, note: 'Vous pouvez la contacter pour lui proposer un autre créneau.' });
  if (admins.length) await notice(admins, { ...data, subject: `[Admin] ${data.subject} (${salon?.establishmentName || ''})` });
}

async function notifyPayout(user: any, payout: any) {
  if (!user.email) return;
  await notice(user.email, {
    subject: `Versement de vos acomptes - ${da(payout.amount)}`,
    title: 'Vos acomptes ont été versés',
    intro: `Bonjour, Saloneo vient d'effectuer le virement de vos acomptes encaissés en ligne.`,
    rows: [
      ['Montant', da(payout.amount)],
      ['Date du virement', new Date(payout.paidAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })],
      ['Référence', payout.reference || ''],
      ['Compte', [user.payout?.method === 'ccp' ? 'CCP' : user.payout?.method === 'bank' ? 'Banque' : '', mask(user.payout?.rib)].filter(Boolean).join(' ')],
    ],
    note: 'Selon votre banque, le virement peut prendre quelques jours ouvrés.',
    buttonLabel: 'Voir le détail',
    buttonUrl: `${frontend()}/profile?tab=deposits`,
    salon: user,
  });
}

export async function adminEmails(): Promise<string[]> {
  const admins: any[] = await User.find({ $or: [{ isAdmin: true }, { role: 'admin' }] }).select('email').lean();
  return [...new Set([...admins.map((a) => a.email), process.env.ADMIN_EMAIL].filter(Boolean) as string[])];
}

async function alertAdmins(dep: IDeposit, message?: string) {
  const to = await adminEmails();
  const salon: any = await User.findById(dep.userId).select('establishmentName').lean();
  if (to.length) await notice(to, {
    subject: `Remboursement d'acompte en échec - ${dep.satim?.orderNumber || dep._id}`,
    title: 'Remboursement d’acompte à traiter',
    intro: 'Le remboursement automatique via SATIM a échoué. Relancez-le ou effectuez-le manuellement depuis l’administration.',
    rows: [
      ['Salon', salon?.establishmentName || String(dep.userId)],
      ['Cliente', dep.clientName],
      ['Montant', da(dep.amount)],
      ['N° de commande', dep.satim?.orderNumber || ''],
      ['Erreur', message || 'Refus de la passerelle'],
    ],
    buttonLabel: 'Ouvrir l’administration',
    buttonUrl: `${frontend()}/admin`,
  });
}

async function weeklyAdminReminder() {
  const due = (await adminBalances()).filter((b) => b.available > 0);
  const to = await adminEmails();
  if (!due.length || !to.length) return;
  const total = due.reduce((s, b) => s + b.available, 0);
  await notice(to, {
    subject: `Acomptes à reverser : ${da(total)}`,
    title: 'Acomptes à reverser cette semaine',
    intro: `${due.length} salon(s) ont un solde d'acomptes disponible. Total à reverser : ${da(total)}.`,
    rows: due.map((b) => [b.establishmentName || b.email, `${da(b.available)}${b.payout?.rib ? '' : ' (RIB manquant)'}`] as [string, string]),
    buttonLabel: 'Exporter le fichier de virements',
    buttonUrl: `${frontend()}/admin`,
  });
}

/**
 * Booking confirmation emails (client + salon), sent at booking time for services without deposit
 * and once the deposit is paid otherwise. Includes the deposit and the cancellation policy.
 */
export async function sendBookingConfirmation(appointmentId: string): Promise<void> {
  const appt: any = await Appointment.findById(appointmentId).lean();
  if (!appt) return;
  const [salon, service, staff, dep]: any[] = await Promise.all([
    User.findById(appt.userId).select('firstName lastName establishmentName address phone publicPhone email logo settings bookingSettings').lean(),
    Service.findById(appt.serviceId).select('name duration price').lean(),
    staffName(appt.userId, appt.stylistId),
    paidDepositOf(appt._id),
  ]);
  if (!salon) return;
  const booking = normalizeBooking(salon.bookingSettings);
  const link = `${frontend()}/appointment/${appt.tokens.modification}`;
  const data: Record<string, any> = {
    clientName: `${appt.clientInfo.firstName} ${appt.clientInfo.lastName}`,
    salonName: salon.establishmentName || `${salon.firstName} ${salon.lastName}`,
    serviceName: service?.name || '',
    appointmentDate: longDate(dateKey(appt.date)),
    appointmentTime: appt.startTime,
    serviceDuration: String(appt.duration),
    servicePrice: String(appt.price),
    currency: salon.settings?.currency || 'DZD',
    staffName: staff || '',
    salonAddress: salon.address || '',
    salonPhone: salon.publicPhone || salon.phone || '',
    salonEmail: salon.email || '',
    salonLogo: salon.logo || '',
    bookingUrl: link,
    modificationLink: link,
    confirmationToken: appt.confirmationToken,
    policyText: policySentence(booking, !!dep),
    ...(dep ? {
      depositAmount: da(dep.amount),
      depositRemaining: da(Math.max(0, appt.price - dep.amount)),
      depositOrderNumber: dep.satim?.orderNumber || '',
    } : {}),
  };
  if (appt.clientInfo.email) await emailService.sendTemplateEmail('appointment-confirmation', appt.clientInfo.email, data);
  if (salon.email) {
    await emailService.sendTemplateEmail('appointment-confirmation', salon.email, {
      ...data,
      clientPhone: appt.clientInfo.phone,
      clientEmail: appt.clientInfo.email,
      notes: appt.notes || 'Aucune note',
      appointmentId: String(appt._id),
    });
  }
}

/* ── jobs ────────────────────────────────────────────────────── */

let started = false;
/** Every minute: release expired holds. Mondays 09:00 (Algiers): payout reminder to the admins. */
export function startDepositJobs() {
  if (started) return;
  started = true;
  cron.schedule('* * * * *', () => {
    sweepExpiredHolds().catch((e) => logger.error('Deposit hold sweep failed', e));
  });
  cron.schedule('0 9 * * 1', () => {
    weeklyAdminReminder().catch((e) => logger.error('Weekly payout reminder failed', e));
  }, { timezone: 'Africa/Algiers' });
}
