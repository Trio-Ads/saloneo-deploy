/**
 * Availability engine — the ONLY place that decides whether a time can be booked.
 * Pure functions (normalizers, checkSlot, computeDay, decideSlot) + one DB loader (loadContext)
 * + a per-salon-day lock (withSlotLock) so concurrent bookings cannot both pass the check.
 *
 * Times are minutes from midnight in the salon's timezone (Africa/Algiers by default);
 * dates are 'YYYY-MM-DD' keys (appointments store them as UTC midnight of that calendar day).
 */
import mongoose, { Schema, Types } from 'mongoose';
import { User } from '../models/User';
import { Service } from '../models/Service';
import { TeamMember } from '../models/Team';
import { Appointment } from '../models/Appointment';

export const DAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const;
export type DayKey = typeof DAYS[number];
export interface Interval { start: string; end: string }
export interface DayHours { isOpen: boolean; start: string; end: string; breaks: Interval[] }
export type WeekHours = Record<DayKey, DayHours>;
/** Inclusive days; with start/end only that time window of each day is blocked (e.g. 14:00–16:00 médical). */
export interface DateRange { from: string; to: string; start?: string; end?: string; reason?: string }
export interface BookingSettings {
  slotInterval: number;
  minNoticeMinutes: number;
  maxAdvanceDays: number;
  allowAnyStaff: boolean;
  bufferMinutes: number;
  allowCancellation: boolean;
  cancellationDeadlineHours: number;
}
export type Reason = 'SLOT_TAKEN' | 'OUTSIDE_HOURS' | 'TOO_SOON' | 'TOO_FAR' | 'STAFF_UNAVAILABLE';

export const SLOT_INTERVALS = [10, 15, 20, 30, 60];
export const DEFAULT_BOOKING: BookingSettings = {
  slotInterval: 15,
  minNoticeMinutes: 60,
  maxAdvanceDays: 60,
  allowAnyStaff: true,
  bufferMinutes: 0,
  allowCancellation: true,
  cancellationDeadlineHours: 24,
};
// Service schema used to store these as defaults on every service: treat them as "not set" (salon setting wins).
const LEGACY_NOTICE_HOURS = 24;
const LEGACY_ADVANCE_DAYS = 30;

export const REASON_MESSAGES: Record<Reason, string> = {
  SLOT_TAKEN: "Ce créneau n'est plus disponible",
  OUTSIDE_HOURS: 'Ce créneau est en dehors des horaires du salon',
  TOO_SOON: 'Ce créneau est trop proche pour être réservé',
  TOO_FAR: 'Ce créneau est trop loin dans le temps pour être réservé',
  STAFF_UNAVAILABLE: "Ce membre de l'équipe n'est pas disponible à ce moment-là",
};

export class AvailabilityError extends Error {
  constructor(public code: Reason) { super(REASON_MESSAGES[code]); }
}

/* ── time & date helpers ─────────────────────────────────────── */

const HHMM = /^([01]?\d|2[0-3]):[0-5]\d$/;
const isTime = (t: unknown): t is string => typeof t === 'string' && HHMM.test(t);
export const toMin = (t: string) => { const [h, m] = String(t).split(':').map(Number); return h * 60 + (m || 0); };
export const fmt = (m: number) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
const pad = (t: string) => fmt(toMin(t));

const DAY_MS = 864e5;
export const dayNum = (key: string) => Date.UTC(+key.slice(0, 4), +key.slice(5, 7) - 1, +key.slice(8, 10)) / DAY_MS;
export const keyOf = (n: number) => new Date(n * DAY_MS).toISOString().slice(0, 10);
export const weekday = (key: string): DayKey => DAYS[new Date(dayNum(key) * DAY_MS).getUTCDay()];
export const isDateKey = (s: unknown): s is string => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s) && !isNaN(dayNum(s));
/** 'YYYY-MM-DD' of a stored appointment date or request value. */
export function dateKey(d: Date | string): string {
  if (typeof d === 'string' && /^\d{4}-\d{2}-\d{2}/.test(d)) return d.slice(0, 10);
  return new Date(d).toISOString().slice(0, 10);
}

/** Current date and minute-of-day in the salon's timezone. */
export function nowIn(timeZone: string, now = new Date()): { date: string; minutes: number } {
  let f: Intl.DateTimeFormat;
  try {
    f = new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
  } catch {
    f = new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Algiers', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
  }
  const p = Object.fromEntries(f.formatToParts(now).map((x) => [x.type, x.value]));
  return { date: `${p.year}-${p.month}-${p.day}`, minutes: Number(p.hour) * 60 + Number(p.minute) };
}

/* ── normalizers (accept every stored shape, never migrate) ──── */

function normBreaks(raw: any): Interval[] {
  const list = Array.isArray(raw) ? raw : raw && typeof raw === 'object' && raw.enabled ? [raw] : [];
  return list
    .filter((b: any) => isTime(b?.start) && isTime(b?.end) && toMin(b.start) < toMin(b.end))
    .map((b: any) => ({ start: pad(b.start), end: pad(b.end) }))
    .sort((a: Interval, b: Interval) => toMin(a.start) - toMin(b.start));
}

/** One day from any shape: {isOpen,start,end,breaks} | {start,end,lunchBreak} | {open,close,closed} | {isWorking,…}. */
function normDay(d: any): DayHours {
  const start = d?.start ?? d?.open, end = d?.end ?? d?.close;
  const valid = isTime(start) && isTime(end) && toMin(start) < toMin(end);
  return {
    isOpen: !!d && valid && d.isOpen !== false && d.closed !== true && d.isWorking !== false,
    start: isTime(start) ? pad(start) : '09:00',
    end: isTime(end) ? pad(end) : '18:00',
    breaks: normBreaks(d?.breaks ?? d?.lunchBreak),
  };
}

const plain = (raw: any) => (raw instanceof Map ? Object.fromEntries(raw) : raw?.toObject ? raw.toObject() : raw);

/** Algeria default: Saturday–Thursday 09:00–18:00, Friday closed. */
export const DEFAULT_HOURS: WeekHours = Object.fromEntries(
  DAYS.map((d): [DayKey, DayHours] => [d, { isOpen: d !== 'friday', start: '09:00', end: '18:00', breaks: [] }])
) as WeekHours;

/**
 * Salon hours from what is stored in User.businessHours:
 * per-day objects (missing day = closed), the legacy single { start, end, lunchBreak } (= every day),
 * or nothing (→ Algeria default, `configured: false` so the dashboard warns).
 */
export function normalizeBusinessHours(raw: any): { hours: WeekHours; configured: boolean } {
  raw = plain(raw);
  if (raw && typeof raw === 'object') {
    if (DAYS.some((d) => raw[d])) {
      return { hours: Object.fromEntries(DAYS.map((d) => [d, normDay(plain(raw[d]))])) as WeekHours, configured: true };
    }
    if (isTime(raw.start) && isTime(raw.end)) {
      const day = normDay(raw);
      return { hours: Object.fromEntries(DAYS.map((d) => [d, day])) as WeekHours, configured: true };
    }
  }
  return { hours: DEFAULT_HOURS, configured: false };
}

/** Staff hours (Mongoose Map or plain object). null = not configured → inherits salon hours. */
export function normalizeStaffHours(raw: any): WeekHours | null {
  raw = plain(raw);
  if (!raw || typeof raw !== 'object' || !DAYS.some((d) => raw[d])) return null;
  return Object.fromEntries(DAYS.map((d) => [d, normDay(plain(raw[d]))])) as WeekHours;
}

export function normalizeBooking(raw: any): BookingSettings {
  const b = { ...DEFAULT_BOOKING, ...(plain(raw) || {}) };
  const num = (v: any, def: number, min: number, max: number) => (Number.isFinite(+v) ? Math.min(max, Math.max(min, Math.round(+v))) : def);
  return {
    slotInterval: SLOT_INTERVALS.includes(+b.slotInterval) ? +b.slotInterval : DEFAULT_BOOKING.slotInterval,
    minNoticeMinutes: num(b.minNoticeMinutes, DEFAULT_BOOKING.minNoticeMinutes, 0, 60 * 24 * 14),
    maxAdvanceDays: num(b.maxAdvanceDays, DEFAULT_BOOKING.maxAdvanceDays, 1, 365),
    allowAnyStaff: b.allowAnyStaff !== false,
    bufferMinutes: num(b.bufferMinutes, 0, 0, 120),
    allowCancellation: b.allowCancellation !== false,
    cancellationDeadlineHours: num(b.cancellationDeadlineHours, DEFAULT_BOOKING.cancellationDeadlineHours, 0, 24 * 14),
  };
}

/** Closures / absences: [{ date } | { from, to? }, start?, end?, reason] → [{ from, to, start?, end?, reason }], inclusive days. */
export function normalizeRanges(raw: any): DateRange[] {
  if (!Array.isArray(raw)) return [];
  return raw.flatMap((r: any) => {
    const from = r?.from ?? r?.date, to = r?.to || from;
    if (!from) return [];
    const f = dateKey(from), t = dateKey(to);
    if (!isDateKey(f) || !isDateKey(t)) return [];
    const timed = isTime(r.start) && isTime(r.end) && toMin(r.start) < toMin(r.end);
    return [{
      from: f <= t ? f : t,
      to: f <= t ? t : f,
      ...(timed ? { start: pad(r.start), end: pad(r.end) } : {}),
      ...(r.reason ? { reason: String(r.reason).slice(0, 120) } : {}),
    }];
  });
}

/* ── the rules ───────────────────────────────────────────────── */

export interface Staff { id: string; name: string; hours: WeekHours | null; absences: DateRange[]; serviceIds: string[] }
/** An occupied block of one staff member, buffers already included. */
export interface Busy { stylistId: string; date: string; start: number; end: number }
export interface Ctx {
  hours: WeekHours;
  booking: BookingSettings;
  closures: DateRange[];
  staff: Staff[];
  busy: Busy[];
  service: { id: string; duration: number; before: number; after: number; noticeMinutes: number; horizonDays: number };
  now: { date: string; minutes: number };
}
export interface CheckOptions { ignoreHours?: boolean; ignoreOverlap?: boolean }

type Span = [number, number];
function openSpans(day: DayHours | undefined): Span[] {
  if (!day?.isOpen) return [];
  let spans: Span[] = [[toMin(day.start), toMin(day.end)]];
  for (const b of day.breaks) {
    const bs = toMin(b.start), be = toMin(b.end);
    spans = spans.flatMap(([s, e]): Span[] => (be <= s || bs >= e ? [[s, e]] : ([[s, bs], [be, e]] as Span[]).filter(([a, c]) => a < c)));
  }
  return spans;
}
const fits = (spans: Span[], s: number, e: number) => spans.some(([a, b]) => a <= s && e <= b);
/** Whole-day ranges covering date. */
const covers = (ranges: DateRange[], date: string) => ranges.some((r) => !r.start && r.from <= date && date <= r.to);
/** Ranges blocking [from, to) minutes on date: whole days, or their time window. */
const blocks = (ranges: DateRange[], date: string, from: number, to: number) =>
  ranges.some((r) => r.from <= date && date <= r.to && (!r.start || (from < toMin(r.end!) && toMin(r.start) < to)));
export const canDo = (staff: Staff, serviceId: string) => staff.serviceIds.length === 0 || staff.serviceIds.includes(serviceId);
export const salonOpen = (ctx: Ctx, date: string) => !!ctx.hours[weekday(date)]?.isOpen && !covers(ctx.closures, date);

/** null when `staff` can take the service at `start` (minutes) on `date`; otherwise why not. */
export function checkSlot(ctx: Ctx, staff: Staff, date: string, start: number, opts: CheckOptions = {}): Reason | null {
  const s = ctx.service;
  const from = start - s.before, to = start + s.duration + s.after;
  if (!opts.ignoreHours) {
    const today = dayNum(ctx.now.date);
    if (dayNum(date) * 1440 + start < today * 1440 + ctx.now.minutes + s.noticeMinutes) return 'TOO_SOON';
    if (dayNum(date) > today + s.horizonDays) return 'TOO_FAR';
    const wd = weekday(date);
    if (start % ctx.booking.slotInterval !== 0 || blocks(ctx.closures, date, from, to) || !fits(openSpans(ctx.hours[wd]), from, to)) return 'OUTSIDE_HOURS';
    if (!canDo(staff, s.id) || blocks(staff.absences, date, from, to) || (staff.hours && !fits(openSpans(staff.hours[wd]), from, to))) return 'STAFF_UNAVAILABLE';
  }
  if (!opts.ignoreOverlap && ctx.busy.some((b) => b.stylistId === staff.id && b.date === date && from < b.end && b.start < to)) return 'SLOT_TAKEN';
  return null;
}

/** Bookable times of one day for the given staff (all eligible staff when "peu importe"). */
export function computeDay(ctx: Ctx, date: string, staff: Staff[]) {
  const open = salonOpen(ctx, date);
  const slots: { time: string; staff: string[] }[] = [];
  if (open) {
    for (let t = 0; t < 1440; t += ctx.booking.slotInterval) {
      const free = staff.filter((m) => !checkSlot(ctx, m, date, t)).map((m) => m.id);
      if (free.length) slots.push({ time: fmt(t), staff: free });
    }
  }
  return { date, open, slots };
}

/** "Peu importe": the free staff with the fewest appointments that day, ties broken by id. */
export function pickStaff(ctx: Ctx, date: string, candidates: string[]): string {
  const load = (id: string) => ctx.busy.filter((b) => b.stylistId === id && b.date === date).length;
  return [...candidates].sort((a, b) => load(a) - load(b) || (a < b ? -1 : a > b ? 1 : 0))[0];
}

/** Decide one booking: the staff that gets it, or the reason it is refused. stylistId null = any eligible staff. */
export function decideSlot(ctx: Ctx, date: string, time: string, stylistId: string | null, opts: CheckOptions = {}): { stylistId: string } | { reason: Reason } {
  if (!isDateKey(date) || !isTime(time)) return { reason: 'OUTSIDE_HOURS' };
  const pool = stylistId ? ctx.staff.filter((m) => m.id === stylistId) : ctx.staff.filter((m) => canDo(m, ctx.service.id));
  if (!pool.length) return { reason: 'STAFF_UNAVAILABLE' };
  const results = pool.map((m) => ({ id: m.id, reason: checkSlot(ctx, m, date, toMin(time), opts) }));
  const free = results.filter((r) => !r.reason).map((r) => r.id);
  if (free.length) return { stylistId: stylistId ?? pickStaff(ctx, date, free) };
  return { reason: results.some((r) => r.reason === 'SLOT_TAKEN') ? 'SLOT_TAKEN' : results[0].reason! };
}

/* ── loader ──────────────────────────────────────────────────── */

const SALON_FIELDS = 'firstName lastName establishmentName businessHours bookingSettings closures settings showAsTeamMember avatar logo';
export interface StaffView { id: string; firstName: string; lastName: string; avatar?: string; color?: string; isOwner?: boolean }

/**
 * Everything the rules need for one salon + service over [from, to] (day keys).
 * staffMode (dashboard): no minimum notice and a one-year horizon; past times stay refused unless forced.
 * Returns service: null when serviceId is not one of the salon's services (ctx then uses a 30 min default).
 * duration overrides the service duration (an existing appointment keeps its own length when moved).
 */
export async function loadContext(
  salonId: string | Types.ObjectId,
  serviceId: string,
  range: { from: string; to: string },
  opts: { excludeAppointmentId?: any; staffMode?: boolean; duration?: number; now?: Date } = {}
) {
  const salon: any = await User.findById(salonId).select(SALON_FIELDS).lean();
  if (!salon) return null;
  const [service, members, services, appointments]: any[] = await Promise.all([
    Types.ObjectId.isValid(serviceId) ? Service.findOne({ _id: serviceId, userId: salon._id }).lean() : null,
    TeamMember.find({ userId: salon._id, isActive: true }).lean(),
    Service.find({ userId: salon._id }).select('buffer').lean(),
    Appointment.find({
      userId: salon._id,
      status: { $ne: 'cancelled' },
      date: { $gte: new Date(`${range.from}T00:00:00.000Z`), $lt: new Date((dayNum(range.to) + 1) * DAY_MS) },
      ...(opts.excludeAppointmentId ? { _id: { $ne: opts.excludeAppointmentId } } : {}),
    }).select('date startTime endTime stylistId serviceId').lean(),
  ]);
  return contextFrom(salon, { service, members, services, appointments }, { ...opts, serviceId });
}

/** loadContext without the queries: builds the context from already-loaded documents (used for batches). */
export function contextFrom(
  salon: any,
  { service, members, services, appointments }: { service: any; members: any[]; services: any[]; appointments: any[] },
  opts: { serviceId?: string; staffMode?: boolean; duration?: number; now?: Date } = {}
) {
  const serviceId = opts.serviceId ?? String(service?._id ?? '');
  const booking = normalizeBooking(salon.bookingSettings);
  const { hours, configured } = normalizeBusinessHours(salon.businessHours);
  const bufferOf = new Map<string, { before: number; after: number }>(
    services.map((s: any) => [String(s._id), { before: s.buffer?.before || 0, after: s.buffer?.after || booking.bufferMinutes }])
  );

  const staff: Staff[] = members.map((m: any) => ({
    id: String(m._id),
    name: `${m.firstName} ${m.lastName || ''}`.trim(),
    hours: normalizeStaffHours(m.workingHours),
    absences: normalizeRanges(m.absences),
    serviceIds: [...(m.services || []), ...(m.specialties || [])].map(String).filter((id) => Types.ObjectId.isValid(id)),
  }));
  const views: StaffView[] = members.map((m: any) => ({ id: String(m._id), firstName: m.firstName, lastName: m.lastName || '', avatar: m.avatar, color: m.color }));
  // Owner is bookable when shown as a team member, or when the salon has nobody else (solo salon).
  if (salon.showAsTeamMember || members.length === 0) {
    const id = String(salon._id);
    staff.unshift({ id, name: `${salon.firstName || ''} ${salon.lastName || ''}`.trim() || salon.establishmentName, hours: null, absences: [], serviceIds: [] });
    views.unshift({ id, firstName: salon.firstName || salon.establishmentName, lastName: salon.lastName || '', avatar: salon.avatar, isOwner: true });
  }

  const st = service?.settings || {};
  const own = bufferOf.get(String(service?._id)) || { before: 0, after: booking.bufferMinutes };
  const ctx: Ctx = {
    hours,
    booking,
    closures: normalizeRanges(salon.closures),
    staff,
    busy: appointments.map((a: any) => {
      const buf = bufferOf.get(String(a.serviceId)) || { before: 0, after: booking.bufferMinutes };
      return { stylistId: String(a.stylistId), date: dateKey(a.date), start: toMin(a.startTime) - buf.before, end: toMin(a.endTime) + buf.after };
    }),
    service: {
      id: service ? String(service._id) : String(serviceId),
      duration: opts.duration || service?.duration || 30,
      before: own.before,
      after: own.after,
      noticeMinutes: opts.staffMode ? 0
        : typeof st.minimumBookingTime === 'number' && st.minimumBookingTime !== LEGACY_NOTICE_HOURS ? st.minimumBookingTime * 60 : booking.minNoticeMinutes,
      horizonDays: opts.staffMode ? 366
        : typeof st.maximumBookingAdvance === 'number' && st.maximumBookingAdvance !== LEGACY_ADVANCE_DAYS ? st.maximumBookingAdvance : booking.maxAdvanceDays,
    },
    now: nowIn(salon.settings?.timezone || 'Africa/Algiers', opts.now),
  };
  return { ctx, salon, service, configured, staffViews: views };
}

/**
 * Display name of whoever holds an appointment: a team member, or the owner (stylistId = salon user id).
 * `salon` may be the populated owner document or just its id. undefined when unknown.
 */
export async function staffName(salon: any, stylistId: unknown): Promise<string | undefined> {
  const id = String(stylistId || ''), salonId = String(salon?._id ?? salon ?? '');
  if (!Types.ObjectId.isValid(id)) return undefined;
  if (id === salonId) {
    const owner: any = salon?.firstName !== undefined ? salon : await User.findById(salonId).select('firstName lastName establishmentName').lean();
    return `${owner?.firstName || ''} ${owner?.lastName || ''}`.trim() || owner?.establishmentName;
  }
  const m: any = await TeamMember.findById(id).select('firstName lastName').lean();
  return m ? `${m.firstName} ${m.lastName || ''}`.trim() : undefined;
}

/** Days [from, from+days) as the public calendar wants them; staff restricted to `stylistId` when given. */
export function availabilityDays(ctx: Ctx, from: string, days: number, stylistId?: string | null) {
  const staff = stylistId ? ctx.staff.filter((m) => m.id === stylistId) : ctx.staff.filter((m) => canDo(m, ctx.service.id));
  const start = dayNum(from);
  return Array.from({ length: days }, (_, i) => computeDay(ctx, keyOf(start + i), staff));
}

/** Earliest bookable slot within `days` days from today (any eligible staff), or null — the first slot computeDay would list. */
export function firstSlot(ctx: Ctx, days: number): { date: string; time: string } | null {
  const staff = ctx.staff.filter((m) => canDo(m, ctx.service.id));
  const start = dayNum(ctx.now.date);
  for (let i = 0; i < days; i++) {
    const date = keyOf(start + i);
    if (!salonOpen(ctx, date)) continue;
    for (let t = 0; t < 1440; t += ctx.booking.slotInterval) {
      if (staff.some((m) => !checkSlot(ctx, m, date, t))) return { date, time: fmt(t) };
    }
  }
  return null;
}

export interface NextSlot { date: string; time: string; /** 0 = today in the salon's timezone */ inDays: number }

/**
 * Next online-bookable slot of several salons within `days` days: 4 queries for the whole batch,
 * then the rules run in memory per salon and online service. Salons with nothing free are absent from the map.
 */
export async function loadNextSlots(salonIds: Array<string | Types.ObjectId>, days = 7, now?: Date): Promise<Map<string, NextSlot>> {
  const out = new Map<string, NextSlot>();
  if (!salonIds.length) return out;
  const ids = salonIds.map((id) => new Types.ObjectId(String(id)));
  // Widest window any salon timezone can need: yesterday (UTC) to today + days.
  const from = dayNum(dateKey(now || new Date())) - 1;
  const [salons, members, services, appointments]: any[][] = await Promise.all([
    User.find({ _id: { $in: ids } }).select(SALON_FIELDS).lean(),
    TeamMember.find({ userId: { $in: ids }, isActive: true }).lean(),
    Service.find({ userId: { $in: ids } }).select('userId buffer duration settings isActive').lean(),
    Appointment.find({
      userId: { $in: ids },
      status: { $ne: 'cancelled' },
      date: { $gte: new Date(from * DAY_MS), $lt: new Date((from + days + 2) * DAY_MS) },
    }).select('userId date startTime endTime stylistId serviceId').lean(),
  ]);
  const by = (list: any[]) => {
    const m = new Map<string, any[]>();
    for (const x of list) { const k = String(x.userId); if (!m.has(k)) m.set(k, []); m.get(k)!.push(x); }
    return m;
  };
  const membersOf = by(members), servicesOf = by(services), appointmentsOf = by(appointments);
  for (const salon of salons) {
    const id = String(salon._id), own = servicesOf.get(id) || [];
    let best: { date: string; time: string } | null = null, today = '';
    for (const service of own.filter((s) => s.isActive && s.settings?.isOnline)) {
      const { ctx } = contextFrom(salon, { service, members: membersOf.get(id) || [], services: own, appointments: appointmentsOf.get(id) || [] }, { now });
      today = ctx.now.date;
      const slot = firstSlot(ctx, days);
      if (slot && (!best || slot.date + slot.time < best.date + best.time)) best = slot;
    }
    if (best) out.set(id, { ...best, inDays: dayNum(best.date) - dayNum(today) });
  }
  return out;
}

/** Staff ids accepted from clients: 'owner-<id>' (legacy public ids) → <id>; '' / 'any' / 'stylist-any' → null (peu importe). */
export function resolveStylistId(raw: unknown): string | null {
  const id = typeof raw === 'string' ? raw.trim() : '';
  if (!id || id === 'any' || id === 'stylist-any') return null;
  return id.startsWith('owner-') ? id.slice(6) : id;
}

/* ── anti double-booking lock ────────────────────────────────── */

// One short-lived lock document per salon-day (_id is unique). Holding it, a request re-reads the day's
// appointments, re-checks the slot and saves — so two concurrent bookings of overlapping times on the same
// day are serialized and the second one sees the first. Expires by itself (15 s) if a process dies.
const SlotLock = (mongoose.models.SlotLock as mongoose.Model<any>) ||
  mongoose.model('SlotLock', new Schema({ _id: String, until: Date }, { versionKey: false }));

export async function withSlotLock<T>(salonId: string | Types.ObjectId, date: string, fn: () => Promise<T>): Promise<T> {
  const key = `${salonId}:${date}`;
  let until: Date | null = null;
  for (let i = 0; i < 80 && !until; i++) {
    const u = new Date(Date.now() + 15000);
    try {
      await SlotLock.updateOne({ _id: key, until: { $lt: new Date() } }, { $set: { until: u } }, { upsert: true });
      until = u;
    } catch (e: any) {
      if (e?.code !== 11000) throw e; // held by another request: wait and retry
      await new Promise((r) => setTimeout(r, 40 + Math.random() * 80));
    }
  }
  if (!until) throw new AvailabilityError('SLOT_TAKEN');
  try {
    return await fn();
  } finally {
    await SlotLock.deleteOne({ _id: key, until }).catch(() => undefined);
  }
}

/**
 * Lock the day, reload, decide. Throws AvailabilityError (→ 409) when refused.
 * `save(stylistId)` runs while the lock is held and must persist the appointment.
 */
export async function bookWithLock<T>(
  salonId: string | Types.ObjectId,
  serviceId: string,
  date: string,
  time: string,
  stylistId: string | null,
  save: (stylistId: string, loaded: NonNullable<Awaited<ReturnType<typeof loadContext>>>) => Promise<T>,
  opts: { excludeAppointmentId?: any; staffMode?: boolean; duration?: number; force?: boolean; forceOverlap?: boolean } = {}
): Promise<T> {
  if (!isDateKey(date)) throw new AvailabilityError('OUTSIDE_HOURS');
  return withSlotLock(salonId, date, async () => {
    const loaded = await loadContext(salonId, serviceId, { from: date, to: date }, opts);
    if (!loaded) throw new AvailabilityError('STAFF_UNAVAILABLE');
    const d = decideSlot(loaded.ctx, date, time, stylistId, { ignoreHours: !!opts.force, ignoreOverlap: !!opts.forceOverlap });
    if ('reason' in d) throw new AvailabilityError(d.reason);
    return save(d.stylistId, loaded);
  });
}

/** Express helper: 409 { error, code } for availability refusals; returns false for any other error. */
export function sendAvailabilityError(res: any, error: unknown): boolean {
  if (!(error instanceof AvailabilityError)) return false;
  res.status(409).json({ error: error.message, code: error.code });
  return true;
}
