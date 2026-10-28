/**
 * Waitlist engine — when capacity frees up, offer the slot to the waiting clients, first come first served.
 *
 * onCapacityFreed(salonId, date, stylistId?) is the single entry point every code path that frees time calls
 * (cancel, reschedule away, delete, deposit hold expired; hours/absence changes go through recheckSalon).
 * Slots come from the availability engine only. An outstanding offer counts as busy for the other entries,
 * so one freed slot is offered to one client at a time; when the offer expires or the slot is taken, the next
 * entry gets it. Never throws: callers fire and forget.
 */
import * as cron from 'node-cron';
import { Types } from 'mongoose';
import { WaitlistEntry, IWaitlistEntry, TimeOfDay, WaitlistOffer, newToken } from '../models/Waitlist';
import { User } from '../models/User';
import { Service } from '../models/Service';
import { Appointment } from '../models/Appointment';
import {
  Busy, Ctx, availabilityDays, dateKey, dayNum, decideSlot, isPublicService, keyOf, loadContext, nowIn, toMin, withSlotLock,
} from './availability';
import { emailService } from './emailService';
import { smsService } from './smsService';
import { salonBaseSlug } from '../utils/slug';
import { logger } from '../utils/logger';

/* ── rules (pure) ────────────────────────────────────────────── */

/** Same periods as the public slot picker: morning < 12:00 ≤ afternoon < 17:00 ≤ evening (salon-local time). */
export const WINDOWS: Record<TimeOfDay, [number, number]> = {
  morning: [0, 720], afternoon: [720, 1020], evening: [1020, 1440], any: [0, 1440],
};
export const inWindow = (timeOfDay: TimeOfDay, time: string) => {
  const [a, b] = WINDOWS[timeOfDay] || WINDOWS.any, m = toMin(time);
  return a <= m && m < b;
};
/** National number for matching: 0555 12 34 56, +213 555123456 and 00213555123456 are the same client. */
export const phoneKey = (phone: unknown) => String(phone || '').replace(/\D/g, '').slice(-9);
export const overlaps = (a: { from: string; to: string }, b: { from: string; to: string }) => a.from <= b.to && b.from <= a.to;
export const OPEN = ['active', 'offered'];
export const MAX_ENTRIES = 3;
export const MAX_DAYS = 14;

export const OFFER_MINUTES = [15, 30, 60];
export interface WaitlistSettings { enabled: boolean; offerMinutes: number; holdSlot: boolean }
export const normalizeWaitlistSettings = (raw: any): WaitlistSettings => ({
  enabled: raw?.enabled !== false,
  offerMinutes: OFFER_MINUTES.includes(+raw?.offerMinutes) ? +raw.offerMinutes : 30,
  holdSlot: raw?.holdSlot === true,
});

type EntryLike = Pick<IWaitlistEntry, 'serviceId' | 'from' | 'to' | 'timeOfDay' | 'status' | 'phoneKey' | 'createdAt'> & {
  stylistId?: string | null;
  offers: Pick<WaitlistOffer, 'slot' | 'outcome'>[];
};
export interface Slot { date: string; time: string; stylistId: string }

/** The block an offered slot occupies (buffers included), so the other entries do not get it too. */
export const busyOf = (ctx: Ctx, slot: Slot): Busy => ({
  stylistId: slot.stylistId, date: slot.date,
  start: toMin(slot.time) - ctx.service.before, end: toMin(slot.time) + ctx.service.duration + ctx.service.after,
});

/** First bookable slot of `date` for the entry: its staff (or any), its time of day, not one it already let expire (same time, same staff). */
export function findSlot(ctx: Ctx, date: string, entry: EntryLike, extra: Busy[] = []): Slot | null {
  const c = extra.length ? { ...ctx, busy: [...ctx.busy, ...extra] } : ctx;
  const letGo = new Set(entry.offers.filter((o) => o.outcome === 'expired' && o.slot.date === date).map((o) => `${o.slot.time}|${o.slot.stylistId}`));
  for (const s of availabilityDays(c, date, 1, entry.stylistId || null)[0].slots) {
    if (!inWindow(entry.timeOfDay, s.time)) continue;
    const d = decideSlot(c, date, s.time, entry.stylistId || null);
    if ('stylistId' in d && !letGo.has(`${s.time}|${d.stylistId}`)) return { date, time: s.time, stylistId: d.stylistId };
  }
  return null;
}

/**
 * FIFO over the active entries waiting for `date`: each gets the first slot still left for it.
 * `extra` = outstanding offers (busy); it grows with every planned offer. `ctxOf` null = service not bookable.
 */
export function planOffers<E extends EntryLike>(
  entries: E[], date: string, ctxOf: (serviceId: string) => Ctx | null, extra: Busy[] = [], freedStylistId?: string | null
): { entry: E; slot: Slot }[] {
  const out: { entry: E; slot: Slot }[] = [];
  const fifo = [...entries].sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt));
  for (const entry of fifo) {
    if (entry.status !== 'active' || date < entry.from || date > entry.to) continue;
    if (freedStylistId && entry.stylistId && entry.stylistId !== freedStylistId) continue;
    const ctx = ctxOf(entry.serviceId);
    const slot = ctx && findSlot(ctx, date, entry, extra);
    if (!ctx || !slot) continue;
    out.push({ entry, slot });
    extra.push(busyOf(ctx, slot));
  }
  return out;
}

/** The appointment proving the client got a place: same phone and service, a day of the range, booked after joining. */
export function bookedBy<A extends { serviceId: any; date: any; createdAt: any; clientInfo?: { phone?: string } }>(entry: EntryLike, appointments: A[]): A | undefined {
  return appointments.find((a) =>
    String(a.serviceId) === entry.serviceId && phoneKey(a.clientInfo?.phone) === entry.phoneKey
    && entry.from <= dateKey(a.date) && dateKey(a.date) <= entry.to && +new Date(a.createdAt) >= +new Date(entry.createdAt));
}

/** Same phone + service + overlapping days among the client's open entries: updated instead of duplicated. */
export const findDuplicate = <E extends EntryLike>(open: E[], input: { serviceId: string; phoneKey: string; from: string; to: string }) =>
  open.find((e) => OPEN.includes(e.status) && e.phoneKey === input.phoneKey && e.serviceId === input.serviceId && overlaps(e, input));

export const currentOffer = (e: { status: string; offers: WaitlistOffer[] }) =>
  e.status === 'offered' ? e.offers[e.offers.length - 1] : undefined;
/** The running offer has run out (the next client may have the slot). */
export const offerExpired = (e: { status: string; offers: WaitlistOffer[] }, now = new Date()) => {
  const o = currentOffer(e);
  return !!o && +o.expiresAt <= +now;
};
/** An entry stays on the list through its last day, in the salon's timezone. */
export const entryExpired = (e: { to: string }, now = new Date(), timeZone = 'Africa/Algiers') => e.to < nowIn(timeZone, now).date;

/* ── notifications ───────────────────────────────────────────── */

export interface OfferMessage {
  salonName: string; date: string; time: string; expires: string; link: string; clientName: string; serviceName: string;
  salonAddress?: string; salonPhone?: string; salonEmail?: string;
}
export const offerText = (d: OfferMessage) =>
  `Bonne nouvelle : un créneau s'est libéré le ${d.date} à ${d.time} chez ${d.salonName}. Réservez-le avant ${d.expires} : ${d.link}`;

/** One sender per channel; WhatsApp = one more entry here. */
type Channel = 'email' | 'sms';
const CHANNELS: Record<Channel, { address: (c: IWaitlistEntry['client']) => string | undefined; send: (to: string, template: 'waitlist-offer', data: OfferMessage) => Promise<unknown> }> = {
  email: {
    address: (c) => c.email || undefined,
    send: (to, template, data) => emailService.sendTemplateEmail(template, to, data as any),
  },
  sms: {
    address: (c) => (smsService.isConfigured() ? c.phone : undefined),
    send: async (to, _template, data) => {
      const r = await smsService.sendSMS({ to, message: offerText(data) });
      if (!r.success) throw new Error(r.error || 'SMS failed');
    },
  },
};

export async function notify(channel: Channel, template: 'waitlist-offer', data: OfferMessage, client: IWaitlistEntry['client']): Promise<boolean> {
  const to = CHANNELS[channel].address(client);
  if (!to) return false;
  try {
    await CHANNELS[channel].send(to, template, data);
    return true;
  } catch (error) {
    logger.error(`Waitlist ${channel} offer failed:`, error);
    return false;
  }
}

const frontendUrl = () => process.env.FRONTEND_URL || 'https://saloneo.app';
export const salonSlug = (salon: any) => salon.slug || salonBaseSlug(salon);
export const offerLink = (salon: any, token: string) => `${frontendUrl()}/salon/${salonSlug(salon)}?offer=${token}`;
export const manageLink = (token: string) => `${frontendUrl()}/waitlist/${token}`;

async function sendOffer(entry: IWaitlistEntry, offer: WaitlistOffer, salon: any) {
  const service: any = await Service.findById(entry.serviceId).select('name').lean();
  const tz = salon.settings?.timezone || 'Africa/Algiers';
  const data: OfferMessage = {
    salonName: salon.establishmentName || `${salon.firstName || ''} ${salon.lastName || ''}`.trim(),
    clientName: `${entry.client.firstName} ${entry.client.lastName || ''}`.trim(),
    serviceName: service?.name || '',
    date: new Date(`${offer.slot.date}T12:00:00Z`).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' }),
    time: offer.slot.time,
    expires: offer.expiresAt.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', timeZone: tz }),
    link: offerLink(salon, offer.token),
    salonAddress: salon.address || '', salonPhone: salon.publicPhone || salon.phone || '', salonEmail: salon.email || '',
  };
  const channels: string[] = [];
  for (const ch of Object.keys(CHANNELS) as Channel[]) if (await notify(ch, 'waitlist-offer', data, entry.client)) channels.push(ch);
  await WaitlistEntry.updateOne({ _id: entry._id, 'offers.token': offer.token }, { $set: { 'offers.$.channels': channels } });
}

/* ── database side ───────────────────────────────────────────── */

const SALON = 'establishmentName firstName lastName slug settings waitlist address phone publicPhone email';
const BOOKED_STATUSES = ['scheduled', 'confirmed', 'rescheduled', 'in_progress', 'completed'];

/** Outstanding offers of the salon on `date`, as busy blocks (service buffers included). */
async function offeredBusy(salonId: any, date: string, exceptEntryId?: any): Promise<Busy[]> {
  const offered = await WaitlistEntry.find({ userId: salonId, status: 'offered', ...(exceptEntryId ? { _id: { $ne: exceptEntryId } } : {}) }).lean();
  const out: Busy[] = [];
  for (const e of offered) {
    const o = currentOffer(e as any);
    if (!o || o.slot.date !== date) continue;
    const s: any = await Service.findById(e.serviceId).select('duration buffer').lean();
    const before = s?.buffer?.before || 0, after = s?.buffer?.after || 0;
    out.push({ stylistId: o.slot.stylistId, date, start: toMin(o.slot.time) - before, end: toMin(o.slot.time) + (s?.duration || 30) + after });
  }
  return out;
}

/** Marks the entries whose client already booked (any channel); returns the ones still waiting. */
async function dropBooked(salonId: any, entries: IWaitlistEntry[]): Promise<IWaitlistEntry[]> {
  if (!entries.length) return entries;
  const from = entries.reduce((m, e) => (e.from < m ? e.from : m), entries[0].from);
  const to = entries.reduce((m, e) => (e.to > m ? e.to : m), entries[0].to);
  const since = new Date(Math.min(...entries.map((e) => +e.createdAt)));
  const appointments: any[] = await Appointment.find({
    userId: salonId,
    status: { $in: BOOKED_STATUSES },
    serviceId: { $in: [...new Set(entries.map((e) => e.serviceId))] },
    date: { $gte: new Date(`${from}T00:00:00.000Z`), $lt: new Date((dayNum(to) + 1) * 864e5) },
    createdAt: { $gte: since },
  }).select('serviceId date createdAt clientInfo.phone').lean();
  const waiting: IWaitlistEntry[] = [];
  for (const e of entries) {
    const a = bookedBy(e, appointments);
    if (!a) { waiting.push(e); continue; }
    const o = currentOffer(e);
    if (o) o.outcome = 'booked';
    e.status = 'booked';
    e.bookedAppointmentId = a._id;
    await e.save();
  }
  return waiting;
}

async function createOffer(entry: IWaitlistEntry, slot: Slot, settings: WaitlistSettings, manual = false): Promise<WaitlistOffer> {
  const now = new Date();
  const offer: WaitlistOffer = {
    slot, sentAt: now, expiresAt: new Date(+now + settings.offerMinutes * 60000),
    token: newToken(), held: settings.holdSlot, manual, channels: [],
  };
  entry.offers.push(offer);
  entry.status = 'offered';
  await entry.save();
  return offer;
}

/**
 * Capacity freed on `date` (optionally for one staff member): offer it to the waiting clients, FIFO.
 * Safe to call from anywhere, any number of times; never throws.
 */
export async function onCapacityFreed(salonId: string | Types.ObjectId, date: string | Date, stylistId?: string | null): Promise<void> {
  try {
    const day = dateKey(date);
    const salon: any = await User.findById(salonId).select(SALON).lean();
    if (!salon) return;
    const settings = normalizeWaitlistSettings(salon.waitlist);
    if (!settings.enabled || day < nowIn(salon.settings?.timezone || 'Africa/Algiers').date) return;

    const planned = await withSlotLock(salon._id, `waitlist:${day}`, async () => {
      const candidates = await WaitlistEntry.find({ userId: salon._id, status: 'active', from: { $lte: day }, to: { $gte: day } }).sort({ createdAt: 1 });
      const waiting = await dropBooked(salon._id, candidates);
      if (!waiting.length) return [];
      const ctxs = new Map<string, Ctx | null>();
      for (const id of new Set(waiting.map((e) => e.serviceId))) {
        const loaded = await loadContext(salon._id, id, { from: day, to: day });
        ctxs.set(id, loaded && isPublicService(loaded.service) ? loaded.ctx : null);
      }
      const plan = planOffers(waiting, day, (id) => ctxs.get(id) ?? null, await offeredBusy(salon._id, day), stylistId);
      const made: { entry: IWaitlistEntry; offer: WaitlistOffer }[] = [];
      for (const { entry, slot } of plan) made.push({ entry, offer: await createOffer(entry, slot, settings) });
      return made;
    });
    for (const { entry, offer } of planned) await sendOffer(entry, offer, salon);
  } catch (error) {
    logger.error('Waitlist onCapacityFreed error:', error);
  }
}

/** Hours, closures, absences or staff changed: every day someone waits for is checked again. */
export async function recheckSalon(salonId: string | Types.ObjectId): Promise<void> {
  try {
    const salon: any = await User.findById(salonId).select('settings').lean();
    if (!salon) return;
    const today = nowIn(salon.settings?.timezone || 'Africa/Algiers').date;
    const entries = await WaitlistEntry.find({ userId: salonId, status: 'active', to: { $gte: today } }).select('from to').lean();
    const days = new Set<string>();
    for (const e of entries) for (let d = Math.max(dayNum(e.from), dayNum(today)); d <= dayNum(e.to); d++) days.add(keyOf(d));
    for (const d of [...days].sort()) await onCapacityFreed(salonId, d);
  } catch (error) {
    logger.error('Waitlist recheck error:', error);
  }
}

/** Ends the outstanding offer of an entry (expired / taken / cancelled) and passes the slot on. */
async function closeOffer(entry: IWaitlistEntry, outcome: 'expired' | 'taken' | 'cancelled', status: 'active' | 'cancelled' = 'active') {
  const o = currentOffer(entry);
  if (!o) return;
  o.outcome = outcome;
  entry.status = status;
  await entry.save();
  // An expired / given-up offer frees the slot for the next entry; a taken one frees nothing, but the entry waits again
  await onCapacityFreed(entry.userId, o.slot.date, outcome === 'taken' ? undefined : o.slot.stylistId);
}

/** Is the offered slot still bookable by its client right now? (the hold, if any, does not count against them) */
export async function offerStillFree(entry: IWaitlistEntry, offer: WaitlistOffer): Promise<boolean> {
  const loaded = await loadContext(entry.userId, entry.serviceId, { from: offer.slot.date, to: offer.slot.date }, { offerToken: offer.token });
  if (!loaded || !isPublicService(loaded.service)) return false;
  const busy = offer.held ? [] : await offeredBusy(entry.userId, offer.slot.date, entry._id);
  const ctx = { ...loaded.ctx, busy: [...loaded.ctx.busy, ...busy] };
  return 'stylistId' in decideSlot(ctx, offer.slot.date, offer.slot.time, offer.slot.stylistId);
}

/** Every minute: booked offers are closed, expired or taken ones go to the next entry. */
export async function sweepOffers(now = new Date()): Promise<void> {
  const offered = await WaitlistEntry.find({ status: 'offered' });
  const bySalon = new Map<string, IWaitlistEntry[]>();
  for (const e of offered) bySalon.set(String(e.userId), [...(bySalon.get(String(e.userId)) || []), e]);
  for (const [salonId, entries] of bySalon) {
    try {
      for (const e of await dropBooked(salonId, entries)) {
        if (offerExpired(e, now)) await closeOffer(e, 'expired');
        else if (!(await offerStillFree(e, currentOffer(e)!))) await closeOffer(e, 'taken');
      }
    } catch (error) {
      logger.error('Waitlist sweep error:', error);
    }
  }
}

/** Daily: entries whose last day has passed leave the list. */
export async function expireEntries(now = new Date()): Promise<number> {
  const res = await WaitlistEntry.updateMany(
    { status: { $in: OPEN }, to: { $lt: nowIn('Africa/Algiers', now).date } },
    { $set: { status: 'expired' } }
  );
  return res.modifiedCount;
}

let started = false;
export function startWaitlistCron() {
  if (started) return;
  started = true;
  cron.schedule('* * * * *', () => { sweepOffers().catch((e) => logger.error('Waitlist sweep error:', e)); });
  cron.schedule('5 0 * * *', () => { expireEntries().catch((e) => logger.error('Waitlist expiry error:', e)); }, { timezone: 'Africa/Algiers' });
}

/* ── used by the controllers ─────────────────────────────────── */

/** Manual offer from the dashboard: that exact slot, checked by the engine with the public rules. */
export async function offerSlot(entry: IWaitlistEntry, date: string, time: string, stylistId: string | null): Promise<{ offer?: WaitlistOffer; reason?: string }> {
  const salon: any = await User.findById(entry.userId).select(SALON).lean();
  const settings = normalizeWaitlistSettings(salon?.waitlist);
  const replaced = currentOffer(entry)?.slot;
  const made = await withSlotLock(entry.userId, `waitlist:${date}`, async () => {
    const loaded = await loadContext(entry.userId, entry.serviceId, { from: date, to: date }, { offerToken: currentOffer(entry)?.token });
    if (!loaded || !isPublicService(loaded.service)) return { reason: 'SERVICE_UNAVAILABLE' };
    const ctx = { ...loaded.ctx, busy: [...loaded.ctx.busy, ...(await offeredBusy(entry.userId, date, entry._id))] };
    const d = decideSlot(ctx, date, time, stylistId ?? entry.stylistId ?? null);
    if ('reason' in d) return { reason: d.reason };
    const previous = currentOffer(entry);
    if (previous) previous.outcome = 'cancelled';
    entry.status = 'active';
    return { offer: await createOffer(entry, { date, time, stylistId: d.stylistId }, settings, true) };
  });
  if (made.offer) {
    await sendOffer(entry, made.offer, salon);
    if (replaced) await onCapacityFreed(entry.userId, replaced.date, replaced.stylistId);
  }
  return made;
}

/** Free times of a day for an entry (public rules, other outstanding offers excluded) — the dashboard picker. */
export async function freeTimes(entry: IWaitlistEntry, date: string): Promise<string[]> {
  const loaded = await loadContext(entry.userId, entry.serviceId, { from: date, to: date }, { offerToken: currentOffer(entry)?.token });
  if (!loaded || !isPublicService(loaded.service)) return [];
  const ctx = { ...loaded.ctx, busy: [...loaded.ctx.busy, ...(await offeredBusy(entry.userId, date, entry._id))] };
  return availabilityDays(ctx, date, 1, entry.stylistId || null)[0].slots.map((s) => s.time);
}

/** Client or salon removes an entry; an outstanding offer goes to the next client. */
export async function removeEntry(entry: IWaitlistEntry): Promise<void> {
  if (currentOffer(entry)) return closeOffer(entry, 'cancelled', 'cancelled');
  entry.status = 'cancelled';
  await entry.save();
}

export { closeOffer };
