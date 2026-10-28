import { dayNum, keyOf, toMin, weekday } from './availability';

/** TeamMember.workingHours as stored: { monday: { isWorking, start, end, breaks } … } (Map or plain object) */
export type MemberHours = Record<string, { isWorking?: boolean; start?: string; end?: string; breaks?: { start: string; end: string }[] } | undefined>;
export interface Window { from: string; to: string; start?: string; end?: string }

type Span = [number, number];
export const plainHours = (wh: any): MemberHours => (wh instanceof Map ? Object.fromEntries(wh) : wh || {});

/** Worked minute spans of one day, breaks removed. */
export function workSpans(hours: MemberHours, date: string): Span[] {
  const d = hours[weekday(date)];
  if (!d?.isWorking || !d.start || !d.end) return [];
  let spans: Span[] = [[toMin(d.start), toMin(d.end)]];
  for (const b of d.breaks || []) {
    const bs = toMin(b.start), be = toMin(b.end);
    spans = spans.flatMap(([s, e]): Span[] => (be <= s || bs >= e ? [[s, e]] : ([[s, bs], [be, e]] as Span[]).filter(([a, c]) => a < c)));
  }
  return spans.filter(([s, e]) => s < e);
}

const total = (spans: Span[]) => spans.reduce((n, [s, e]) => n + e - s, 0);
const overlap = (spans: Span[], from: number, to: number) => spans.reduce((n, [s, e]) => n + Math.max(0, Math.min(e, to) - Math.max(s, from)), 0);
const days = (from: string, to: string) => {
  const out: string[] = [];
  for (let n = dayNum(from); n <= dayNum(to); n++) out.push(keyOf(n));
  return out;
};

/** Minutes of `date` a window takes off this member's schedule. */
function minutesOff(hours: MemberHours, w: Window, date: string): number {
  if (date < w.from || date > w.to) return 0;
  const spans = workSpans(hours, date);
  return w.start && w.end ? overlap(spans, toMin(w.start), toMin(w.end)) : total(spans);
}

/**
 * Working days a leave costs, per the member's own hours (days they don't work are free);
 * an hours-only leave counts its share of that day, rounded to the half day.
 * Only days inside [clipFrom, clipTo] count (balance of one year).
 */
export function leaveDays(hours: MemberHours, w: Window, clipFrom = '0000-01-01', clipTo = '9999-12-31'): number {
  const from = w.from > clipFrom ? w.from : clipFrom, to = w.to < clipTo ? w.to : clipTo;
  if (from > to) return 0;
  let n = 0;
  for (const date of days(from, to)) {
    const day = total(workSpans(hours, date));
    if (day) n += minutesOff(hours, w, date) / day;
  }
  return Math.round(n * 2) / 2;
}

/** Annual leave balance of a calendar year: approved annual leaves only. */
export function leaveBalance(allowance: number, hours: MemberHours, approvedAnnual: Window[], year: number) {
  const taken = approvedAnnual.reduce((n, w) => n + leaveDays(hours, w, `${year}-01-01`, `${year}-12-31`), 0);
  return { allowance, taken, remaining: Math.round((allowance - taken) * 2) / 2 };
}

/** Planned minutes of a month ('YYYY-MM'): working hours minus absences (overlapping absences counted once per minute). */
export function plannedMinutes(hours: MemberHours, absences: Window[], month: string): number {
  const first = `${month}-01`;
  const next = keyOf(Date.UTC(+month.slice(0, 4), +month.slice(5, 7), 1) / 864e5);
  let n = 0;
  for (const date of days(first, keyOf(dayNum(next) - 1))) {
    let spans = workSpans(hours, date);
    for (const a of absences) {
      if (date < a.from || date > a.to) continue;
      if (!(a.start && a.end)) { spans = []; break; }
      const as = toMin(a.start), ae = toMin(a.end);
      spans = spans.flatMap(([s, e]): Span[] => (ae <= s || as >= e ? [[s, e]] : ([[s, as], [ae, e]] as Span[]).filter(([x, y]) => x < y)));
    }
    n += total(spans);
  }
  return n;
}

/** Does an appointment (salon-local day + 'HH:mm' times) fall in the leave? */
export function hitsLeave(w: Window, appt: { date: string; startTime: string; endTime?: string; duration?: number }): boolean {
  if (appt.date < w.from || appt.date > w.to) return false;
  if (!(w.start && w.end)) return true;
  const s = toMin(appt.startTime), e = appt.endTime ? toMin(appt.endTime) : s + (appt.duration || 30);
  return s < toMin(w.end) && toMin(w.start) < e;
}

/** A request is valid when its days are real, ordered, within ~a year, and an hour window (if any) is ordered. */
export function validLeaveWindow(w: Partial<Window>): w is Window {
  // Round-trip rejects 2026-13-01 / 02-30, which Date.UTC would silently roll over
  const isDay = (s: unknown) => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s) && keyOf(dayNum(s)) === s;
  const isTime = (s: unknown) => typeof s === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(s);
  if (!isDay(w.from) || !isDay(w.to) || w.from! > w.to! || dayNum(w.to!) - dayNum(w.from!) > 366) return false;
  if (w.start === undefined && w.end === undefined) return true;
  return isTime(w.start) && isTime(w.end) && toMin(w.start!) < toMin(w.end!);
}
