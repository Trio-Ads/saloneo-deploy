// Run: cd beauty-flow-backend && npx ts-node --transpile-only src/services/__tests__/availability.test.ts
import assert from 'assert';
import {
  Ctx, Staff, DEFAULT_BOOKING, checkSlot, computeDay, decideSlot, normalizeBusinessHours, normalizeStaffHours,
  normalizeRanges, nowIn, toMin, availabilityDays, resolveStylistId, firstSlot,
  isPublicService,
} from '../availability';
import { needsOnlineFix } from '../../utils/migrations';

const day = (start: string, end: string, breaks: { start: string; end: string }[] = []) => ({ isWorking: true, start, end, breaks });
const off = { isWorking: false, start: '09:00', end: '18:00' };

// 2026-11-02 is a Monday, 2026-11-06 a Friday.
const MON = '2026-11-02', TUE = '2026-11-03', FRI = '2026-11-06';

function ctx(over: Partial<Ctx> = {}, service: Partial<Ctx['service']> = {}): Ctx {
  return {
    hours: normalizeBusinessHours({
      saturday: { isOpen: true, start: '09:00', end: '19:00', breaks: [{ start: '12:30', end: '13:30' }] },
      sunday: { isOpen: true, start: '09:00', end: '19:00', breaks: [{ start: '12:30', end: '13:30' }] },
      monday: { isOpen: true, start: '09:00', end: '19:00', breaks: [{ start: '12:30', end: '13:30' }] },
      tuesday: { isOpen: true, start: '09:00', end: '19:00', breaks: [{ start: '12:30', end: '13:30' }] },
      wednesday: { isOpen: true, start: '09:00', end: '19:00' },
      thursday: { isOpen: true, start: '09:00', end: '19:00' },
      friday: { isOpen: false, start: '09:00', end: '19:00' },
    }).hours,
    booking: { ...DEFAULT_BOOKING },
    closures: [],
    staff: [],
    busy: [],
    service: { id: 'svc', duration: 60, before: 0, after: 0, noticeMinutes: 60, horizonDays: 60, ...service },
    now: { date: '2026-11-01', minutes: 10 * 60 },
    ...over,
  };
}
const staff = (id: string, hours: any = null, extra: Partial<Staff> = {}): Staff =>
  ({ id, name: id, hours: hours ? normalizeStaffHours(hours) : null, absences: [], serviceIds: [], ...extra });
const times = (c: Ctx, date: string, s: Staff[]) => computeDay(c, date, s).slots.map((x) => x.time);
let n = 0;
const test = (name: string, fn: () => void) => { fn(); n++; console.log('ok', name); };

test('normalizes legacy shapes', () => {
  assert.strictEqual(normalizeBusinessHours(undefined).configured, false);
  const def = normalizeBusinessHours(null).hours;
  assert.strictEqual(def.friday.isOpen, false);
  assert.strictEqual(def.saturday.isOpen, true);
  const legacy = normalizeBusinessHours({ start: '9:00', end: '19:00', lunchBreak: { enabled: true, start: '12:00', end: '14:00' }, minBookingTime: 24 });
  assert.deepStrictEqual(legacy.hours.monday, { isOpen: true, start: '09:00', end: '19:00', breaks: [{ start: '12:00', end: '14:00' }] });
  const perDay = normalizeBusinessHours({ monday: { open: '10:00', close: '16:00' }, sunday: { closed: true, open: '', close: '' } }).hours;
  assert.strictEqual(perDay.monday.isOpen, true);
  assert.strictEqual(perDay.sunday.isOpen, false);
  assert.strictEqual(perDay.tuesday.isOpen, false, 'missing day = closed');
  assert.deepStrictEqual(normalizeRanges([{ date: '2026-11-04', reason: 'Aïd' }, { from: '2026-11-10', to: '2026-11-08' }, { foo: 1 }]),
    [{ from: '2026-11-04', to: '2026-11-04', reason: 'Aïd' }, { from: '2026-11-08', to: '2026-11-10' }]);
  assert.strictEqual(resolveStylistId('owner-abc'), 'abc');
  assert.strictEqual(resolveStylistId('stylist-any'), null);
});

test('Mongoose Map working hours are read (not ignored)', () => {
  const map = new Map<string, any>([['monday', day('14:00', '16:00')], ['tuesday', off]]);
  const c = ctx();
  assert.deepStrictEqual(times(c, MON, [staff('a', map)]), ['14:00', '14:15', '14:30', '14:45', '15:00']);
  assert.deepStrictEqual(times(c, TUE, [staff('a', map)]), [], 'day off yields nothing (was 09:00–18:00)');
});

test('salon closed day and salon ∩ staff', () => {
  const c = ctx();
  assert.deepStrictEqual(computeDay(c, FRI, [staff('a')]), { date: FRI, open: false, slots: [] });
  // staff 08:00–11:00, salon opens 09:00 → 09:00..10:00 only
  assert.deepStrictEqual(times(c, MON, [staff('a', { monday: day('08:00', '11:00') })]), ['09:00', '09:15', '09:30', '09:45', '10:00']);
  // staff without configured hours inherits salon hours
  const all = times(c, MON, [staff('a')]);
  assert.strictEqual(all[0], '09:00');
  assert.strictEqual(all[all.length - 1], '18:00');
});

test('breaks (salon and staff) are respected', () => {
  const c = ctx();
  const t = times(c, MON, [staff('a')]);
  assert.ok(t.includes('11:30') && !t.includes('11:45') && !t.includes('12:30') && !t.includes('13:15') && t.includes('13:30'));
  const s = staff('a', { monday: day('09:00', '19:00', [{ start: '15:00', end: '16:00' }]) });
  const ts = times(c, MON, [s]);
  assert.ok(ts.includes('14:00') && !ts.includes('14:15') && !ts.includes('15:45') && ts.includes('16:00'));
});

test('buffers must fit in hours and do not overlap', () => {
  const c = ctx({}, { before: 15, after: 15 });
  const t = times(c, MON, [staff('a')]);
  assert.strictEqual(t[0], '09:15', 'before-buffer starts at opening');
  assert.strictEqual(t[t.length - 1], '17:45', 'after-buffer ends at closing');
  assert.ok(!t.includes('11:30') && t.includes('11:15'), 'buffer cannot run into lunch');
});

test('overlap with an existing appointment (with its buffers)', () => {
  const c = ctx({ staff: [staff('a')], busy: [{ stylistId: 'a', date: MON, start: toMin('10:00'), end: toMin('11:00') + 15 }] });
  const t = times(c, MON, [staff('a')]);
  assert.ok(t.includes('09:00') && !t.includes('09:15') && !t.includes('11:00') && t.includes('11:15'));
  assert.deepStrictEqual(decideSlot(c, MON, '10:30', 'a'), { reason: 'SLOT_TAKEN' });
  assert.deepStrictEqual(decideSlot(c, MON, '10:30', 'a', { ignoreOverlap: true }), { stylistId: 'a' });
});

test('closures and absences', () => {
  const c = ctx({ staff: [staff('a')], closures: normalizeRanges([{ date: MON, reason: 'Aïd' }]) });
  assert.strictEqual(computeDay(c, MON, [staff('a')]).open, false);
  assert.deepStrictEqual(decideSlot(c, MON, '10:00', 'a'), { reason: 'OUTSIDE_HOURS' });
  const abs = staff('a', null, { absences: normalizeRanges([{ from: MON, to: TUE }]) });
  assert.deepStrictEqual(times(ctx(), TUE, [abs]), []);
  assert.deepStrictEqual(decideSlot(ctx(), MON, '10:00', 'a'), { reason: 'STAFF_UNAVAILABLE' }, 'unknown staff');
  assert.deepStrictEqual(decideSlot(ctx({ staff: [abs] }), MON, '10:00', 'a'), { reason: 'STAFF_UNAVAILABLE' });
});

test('partial-day absence (14:00–16:00) blocks only that window', () => {
  const ranges = normalizeRanges([{ from: MON, start: '14:00', end: '16:00', reason: 'Médical' }, { from: TUE, start: '16:00', end: '15:00' }]);
  assert.deepStrictEqual(ranges, [{ from: MON, to: MON, start: '14:00', end: '16:00', reason: 'Médical' }, { from: TUE, to: TUE }], 'invalid window = whole day');
  const a = staff('a', null, { absences: [ranges[0]] });
  const t = times(ctx({}, { duration: 30 }), MON, [a]); // salon lunch 12:30–13:30
  assert.ok(t.includes('13:30') && !t.includes('13:45') && !t.includes('15:45') && t.includes('16:00') && t.includes('09:00'), t.join(' '));
  assert.strictEqual(computeDay(ctx(), MON, [a]).open, true);
  assert.deepStrictEqual(decideSlot(ctx({ staff: [a] }), MON, '14:30', 'a'), { reason: 'STAFF_UNAVAILABLE' });
  const withBuffer = times(ctx({}, { duration: 30, after: 15 }), MON, [a]);
  assert.ok(!withBuffer.includes('13:30') && withBuffer.includes('16:00'), 'after-buffer runs into the absence');
});

test('interval alignment', () => {
  const c = ctx({ booking: { ...DEFAULT_BOOKING, slotInterval: 30 } });
  const t = times(c, MON, [staff('a')]);
  assert.ok(t.every((x) => toMin(x) % 30 === 0) && t.includes('09:30') && !t.includes('09:15'));
  assert.deepStrictEqual(decideSlot({ ...c, staff: [staff('a')] }, MON, '09:10', 'a'), { reason: 'OUTSIDE_HOURS' });
});

test('lead time, past and horizon in Africa/Algiers (across midnight)', () => {
  // 23:30 UTC on Nov 1 = 00:30 on Nov 2 in Algiers (UTC+1)
  const now = nowIn('Africa/Algiers', new Date('2026-11-01T23:30:00Z'));
  assert.deepStrictEqual(now, { date: MON, minutes: 30 });
  // Sunday 18:30 local with a 15h notice → Monday from 09:30
  const c = ctx({ now: { date: '2026-11-01', minutes: toMin('18:30') } }, { noticeMinutes: 15 * 60 });
  const t = times(c, MON, [staff('a')]);
  assert.strictEqual(t[0], '09:30');
  assert.deepStrictEqual(decideSlot({ ...c, staff: [staff('a')] }, MON, '09:15', 'a'), { reason: 'TOO_SOON' });
  assert.deepStrictEqual(times(ctx({ now: { date: MON, minutes: 20 * 60 } }), MON, [staff('a')]), [], 'no past slots');
  const far = ctx({ staff: [staff('a')] }, { horizonDays: 3 });
  assert.deepStrictEqual(decideSlot(far, '2026-11-05', '10:00', 'a'), { reason: 'TOO_FAR' });
  assert.ok('stylistId' in decideSlot(far, '2026-11-04', '10:00', 'a'));
  assert.deepStrictEqual(decideSlot(ctx({ staff: [staff('a')] }), FRI, '10:00', 'a', { ignoreHours: true }), { stylistId: 'a' }, 'force');
});

test('"peu importe": union of staff and least-loaded assignment', () => {
  const a = staff('a', { monday: day('09:00', '12:00') });
  const b = staff('b', { monday: day('14:00', '19:00') });
  const c = staff('c', null, { serviceIds: ['other'] }); // cannot do this service
  const busy = [{ stylistId: 'b', date: MON, start: toMin('15:00'), end: toMin('16:00') }];
  const cx = ctx({ staff: [a, b, c], busy });
  const daySlots = availabilityDays(cx, MON, 1)[0].slots;
  assert.deepStrictEqual(daySlots.find((s) => s.time === '09:00')!.staff, ['a']);
  assert.deepStrictEqual(daySlots.find((s) => s.time === '14:00')!.staff, ['b'], 'back-to-back is fine');
  assert.deepStrictEqual(daySlots.find((s) => s.time === '14:15'), undefined, '14:15+60 overlaps b at 15:00');
  assert.deepStrictEqual(daySlots.find((s) => s.time === '16:00')!.staff, ['b']);
  assert.ok(!daySlots.some((s) => s.staff.includes('c')));
  // both a2 and b2 free at 10:00; b2 has one appointment that day → a2
  const a2 = staff('a2'), b2 = staff('b2');
  const cy = ctx({ staff: [b2, a2], busy: [{ stylistId: 'b2', date: MON, start: toMin('16:00'), end: toMin('17:00') }] });
  assert.deepStrictEqual(decideSlot(cy, MON, '10:00', null), { stylistId: 'a2' });
  const cz = ctx({ staff: [staff('z'), staff('y')] });
  assert.deepStrictEqual(decideSlot(cz, MON, '10:00', null), { stylistId: 'y' }, 'tie → smallest id');
  const cw = ctx({ staff: [a2], busy: [{ stylistId: 'a2', date: MON, start: toMin('10:00'), end: toMin('11:00') }] });
  assert.deepStrictEqual(decideSlot(cw, MON, '10:00', null), { reason: 'SLOT_TAKEN' });
});

test('checkSlot ignoreHours still refuses overlaps', () => {
  const c = ctx({ busy: [{ stylistId: 'a', date: FRI, start: toMin('10:00'), end: toMin('11:00') }] });
  assert.strictEqual(checkSlot(c, staff('a'), FRI, toMin('10:30'), { ignoreHours: true }), 'SLOT_TAKEN');
});

test('firstSlot = first slot the calendar lists, skipping closed and full days', () => {
  const a = staff('a');
  // now = Sun 2026-11-01 10:00, notice 60 min → 11:00 today
  assert.deepStrictEqual(firstSlot(ctx({ staff: [a] }), 7), { date: '2026-11-01', time: '11:00' });
  // today taken until closing → tomorrow's opening
  const full = ctx({ staff: [a], busy: [{ stylistId: 'a', date: '2026-11-01', start: 0, end: 1440 }] });
  assert.deepStrictEqual(firstSlot(full, 7), { date: MON, time: '09:00' });
  assert.strictEqual(firstSlot(full, 1), null, 'nothing within the window');
  // Thursday 19:00 → Friday closed → Saturday 09:00
  const thu = ctx({ staff: [a], now: { date: '2026-11-05', minutes: 19 * 60 } });
  assert.deepStrictEqual(firstSlot(thu, 7), { date: '2026-11-07', time: '09:00' });
  assert.deepStrictEqual(firstSlot(thu, 7)!.time, availabilityDays(thu, '2026-11-07', 1)[0].slots[0].time);
  assert.strictEqual(firstSlot(ctx({ staff: [staff('b', null, { serviceIds: ['other'] })] }), 7), null, 'no eligible staff');
});

test('public pages only offer active services switched on for online booking', () => {
  assert.strictEqual(isPublicService({ isActive: true, settings: { isOnline: true } }), true);
  assert.strictEqual(isPublicService({ isActive: true, settings: { isOnline: false } }), false);
  assert.strictEqual(isPublicService({ isActive: false, settings: { isOnline: true } }), false);
  assert.strictEqual(isPublicService({ isActive: true }), false);
  assert.strictEqual(isPublicService(null), false);
});

test('services-online migration: only services never deliberately switched off', () => {
  const before = new Date('2026-10-01T10:00:00Z'), after = new Date('2026-10-28T16:00:00Z');
  assert.strictEqual(needsOnlineFix({ settings: { isOnline: false }, updatedAt: before }), true);
  assert.strictEqual(needsOnlineFix({ settings: {}, updatedAt: before }), true, 'missing flag');
  assert.strictEqual(needsOnlineFix({ settings: { isOnline: false } }), true, 'no updatedAt');
  assert.strictEqual(needsOnlineFix({ settings: { isOnline: false }, updatedAt: after }), false, 'switched off after the fix');
  assert.strictEqual(needsOnlineFix({ settings: { isOnline: true }, updatedAt: before }), false, 'already online');
});

console.log(`\n${n} availability checks passed`);
