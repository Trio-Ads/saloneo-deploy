// Run: cd beauty-flow-backend && npx ts-node --transpile-only src/services/__tests__/waitlist.test.ts
import assert from 'assert';
import { Ctx, DEFAULT_BOOKING, normalizeBusinessHours, nowIn } from '../availability';
import {
  inWindow, phoneKey, findSlot, planOffers, bookedBy, findDuplicate, offerExpired, entryExpired,
  normalizeWaitlistSettings, offerText, busyOf,
} from '../waitlist';

// 2026-11-02 is a Monday. Salon open 09:00–19:00, lunch 12:30–13:30, one service of 60 min, slots every 30 min.
const MON = '2026-11-02', TUE = '2026-11-03';
const open = { isOpen: true, start: '09:00', end: '19:00', breaks: [{ start: '12:30', end: '13:30' }] };
const staff = (id: string) => ({ id, name: id, hours: null, absences: [], serviceIds: [] });
const busy = (stylistId: string, date: string, start: string, end: string) => {
  const m = (t: string) => +t.slice(0, 2) * 60 + +t.slice(3);
  return { stylistId, date, start: m(start), end: m(end) };
};
function ctx(over: Partial<Ctx> = {}): Ctx {
  return {
    hours: normalizeBusinessHours({ monday: open, tuesday: open }).hours,
    booking: { ...DEFAULT_BOOKING, slotInterval: 30 },
    closures: [],
    staff: [staff('amina'), staff('yasmine')],
    busy: [],
    service: { id: 'svc', duration: 60, before: 0, after: 0, noticeMinutes: 60, horizonDays: 60 },
    now: { date: '2026-11-01', minutes: 10 * 60 },
    ...over,
  };
}
/** A day where both stylists are fully booked. */
const fullDay = (date: string) => ['amina', 'yasmine'].flatMap((s) => [busy(s, date, '09:00', '12:30'), busy(s, date, '13:30', '19:00')]);
let seq = 0;
const entry = (over: any = {}) => ({
  serviceId: 'svc', stylistId: null, from: MON, to: TUE, timeOfDay: 'any', status: 'active', phoneKey: '555123456',
  createdAt: new Date(Date.UTC(2026, 9, 20, 10, seq++)), offers: [], id: `e${seq}`, ...over,
});

let n = 0;
const test = (name: string, fn: () => void) => { fn(); n++; console.log('ok', name); };

test('time-of-day windows match the public picker (salon-local minutes)', () => {
  assert.ok(inWindow('morning', '09:00') && inWindow('morning', '11:45') && !inWindow('morning', '12:00'));
  assert.ok(inWindow('afternoon', '12:00') && inWindow('afternoon', '16:30') && !inWindow('afternoon', '17:00'));
  assert.ok(inWindow('evening', '17:00') && inWindow('evening', '20:30') && !inWindow('evening', '16:59'));
  assert.ok(inWindow('any', '00:00') && inWindow('any', '23:59'));
});

test('phone numbers compare as the national number', () => {
  assert.strictEqual(phoneKey('0555 12 34 56'), '555123456');
  assert.strictEqual(phoneKey('+213 555-12-34-56'), '555123456');
  assert.strictEqual(phoneKey('00213555123456'), '555123456');
  assert.notStrictEqual(phoneKey('0555123457'), phoneKey('0555123456'));
});

test('a freed slot is found only inside the date range and the time-of-day window', () => {
  const c = ctx({ busy: fullDay(MON).filter((b) => !(b.stylistId === 'amina' && b.start === 13 * 60 + 30)) }); // amina free 13:30–19:00
  assert.strictEqual(findSlot(c, MON, entry({ timeOfDay: 'morning' })), null, 'afternoon slot not offered to a morning client');
  assert.deepStrictEqual(findSlot(c, MON, entry({ timeOfDay: 'afternoon' })), { date: MON, time: '13:30', stylistId: 'amina' });
  assert.deepStrictEqual(findSlot(c, MON, entry({ timeOfDay: 'evening' })), { date: MON, time: '17:00', stylistId: 'amina' });
  assert.strictEqual(findSlot(c, MON, entry({ stylistId: 'yasmine' })), null, 'only the wanted stylist');
  // planOffers skips days outside the range
  assert.deepStrictEqual(planOffers([entry({ from: TUE, to: TUE })], MON, () => c), []);
});

test('the engine rules still apply (notice, salon timezone "now")', () => {
  // Monday 13:00 in Algiers: 13:30 is inside the 60 min notice, 14:00 is the first bookable
  const c = ctx({ busy: fullDay(MON).filter((b) => !(b.stylistId === 'amina' && b.start === 13 * 60 + 30)), now: nowIn('Africa/Algiers', new Date('2026-11-02T12:00:00Z')) });
  assert.deepStrictEqual(c.now, { date: MON, minutes: 13 * 60 }, 'Algiers is UTC+1');
  assert.deepStrictEqual(findSlot(c, MON, entry()), { date: MON, time: '14:00', stylistId: 'amina' });
});

test('FIFO: the oldest matching entry gets the slot, the next one does not get the same slot', () => {
  const c = ctx({ busy: [...fullDay(MON).filter((b) => !(b.stylistId === 'amina' && b.start === 9 * 60)), busy('amina', MON, '10:00', '12:30')] }); // amina free 09:00–10:00
  const late = entry({ createdAt: new Date('2026-10-25T10:00:00Z') });
  const early = entry({ createdAt: new Date('2026-10-21T10:00:00Z') });
  const plan = planOffers([late, early], MON, () => c);
  assert.strictEqual(plan.length, 1);
  assert.strictEqual(plan[0].entry, early);
  assert.deepStrictEqual(plan[0].slot, { date: MON, time: '09:00', stylistId: 'amina' });
  // While that offer runs (it is busy), the late entry gets nothing; when it expires the late one gets it
  assert.deepStrictEqual(planOffers([late], MON, () => c, [busyOf(c, plan[0].slot)]), []);
  const expired = { ...early, status: 'active', offers: [{ slot: plan[0].slot, outcome: 'expired' as const }] };
  const next = planOffers([late, expired], MON, () => c);
  assert.strictEqual(next.length, 1);
  assert.strictEqual(next[0].entry, late, 'an entry is not offered again the slot it let expire');
  // …but the same time with another stylist is a new slot for it
  const yasmineFree = ctx({ busy: [...fullDay(MON).filter((b) => !(b.stylistId === 'yasmine' && b.start === 9 * 60)), busy('yasmine', MON, '10:00', '12:30')] });
  assert.deepStrictEqual(planOffers([expired], MON, () => yasmineFree)[0]?.slot, { date: MON, time: '09:00', stylistId: 'yasmine' });
});

test('two freed slots go to two entries; offered/booked entries and other stylists are skipped', () => {
  const c = ctx({ busy: fullDay(MON).filter((b) => b.start !== 9 * 60).concat([busy('amina', MON, '10:00', '12:30'), busy('yasmine', MON, '10:00', '12:30')]) });
  const a = entry(), b = entry(), offered = entry({ status: 'offered' }), booked = entry({ status: 'booked' });
  const plan = planOffers([booked, a, offered, b], MON, () => c);
  assert.deepStrictEqual(plan.map((p) => [p.entry, p.slot.stylistId]), [[a, 'amina'], [b, 'yasmine']]);
  // Freed for yasmine: an entry waiting for amina only is not woken up
  const forAmina = entry({ stylistId: 'amina' });
  assert.deepStrictEqual(planOffers([forAmina], MON, () => c, [], 'yasmine'), []);
  // Service no longer bookable online → no offer
  assert.deepStrictEqual(planOffers([entry()], MON, () => null), []);
});

test('offer and entry expiry', () => {
  const now = new Date('2026-11-02T10:00:00Z');
  const offered = (expiresAt: string) => ({ status: 'offered', offers: [{ expiresAt: new Date(expiresAt) } as any] });
  assert.strictEqual(offerExpired(offered('2026-11-02T10:30:00Z'), now), false);
  assert.strictEqual(offerExpired(offered('2026-11-02T09:59:59Z'), now), true);
  assert.strictEqual(offerExpired({ status: 'active', offers: [] }, now), false);
  // 23:30 UTC on Nov 2 is already Nov 3 in Algiers: a list ending Nov 2 is over, one ending Nov 3 is not
  assert.strictEqual(entryExpired({ to: MON }, new Date('2026-11-02T22:30:00Z')), false);
  assert.strictEqual(entryExpired({ to: MON }, new Date('2026-11-02T23:30:00Z')), true);
  assert.strictEqual(entryExpired({ to: TUE }, new Date('2026-11-02T23:30:00Z')), false);
});

test('duplicate request (same phone + service + overlapping days) is merged, not duplicated', () => {
  const existing = entry({ from: MON, to: '2026-11-05' });
  const input = (over: any = {}) => ({ serviceId: 'svc', phoneKey: '555123456', from: '2026-11-05', to: '2026-11-08', ...over });
  assert.strictEqual(findDuplicate([existing], input()), existing, 'overlap on Nov 5');
  assert.strictEqual(findDuplicate([existing], input({ from: '2026-11-06' })), undefined, 'no overlap');
  assert.strictEqual(findDuplicate([existing], input({ serviceId: 'other' })), undefined, 'other service');
  assert.strictEqual(findDuplicate([existing], input({ phoneKey: '555000000' })), undefined, 'other client');
  assert.strictEqual(findDuplicate([{ ...existing, status: 'cancelled' }], input()), undefined, 'closed entries do not count');
});

test('booked detection: same phone + service, a day of the range, after joining', () => {
  const e = entry({ createdAt: new Date('2026-10-30T10:00:00Z') });
  const appt = (over: any = {}) => ({ serviceId: 'svc', date: new Date(`${MON}T00:00:00.000Z`), createdAt: new Date('2026-11-01T08:00:00Z'), clientInfo: { phone: '+213555123456' }, ...over });
  assert.ok(bookedBy(e, [appt()]));
  assert.strictEqual(bookedBy(e, [appt({ clientInfo: { phone: '0555999999' } })]), undefined);
  assert.strictEqual(bookedBy(e, [appt({ serviceId: 'other' })]), undefined);
  assert.strictEqual(bookedBy(e, [appt({ date: new Date('2026-11-09T00:00:00.000Z') })]), undefined);
  assert.strictEqual(bookedBy(e, [appt({ createdAt: new Date('2026-10-29T08:00:00Z') })]), undefined, 'older booking');
});

test('settings defaults and message', () => {
  assert.deepStrictEqual(normalizeWaitlistSettings(undefined), { enabled: true, offerMinutes: 30, holdSlot: false });
  assert.deepStrictEqual(normalizeWaitlistSettings({ enabled: false, offerMinutes: 45, holdSlot: true }), { enabled: false, offerMinutes: 30, holdSlot: true });
  assert.strictEqual(normalizeWaitlistSettings({ offerMinutes: '60' }).offerMinutes, 60);
  assert.strictEqual(
    offerText({ salonName: 'Maison Lina', date: 'lundi 2 novembre', time: '09:00', expires: '10:30', link: 'https://x/y', clientName: '', serviceName: '' }),
    "Bonne nouvelle : un créneau s'est libéré le lundi 2 novembre à 09:00 chez Maison Lina. Réservez-le avant 10:30 : https://x/y"
  );
});

console.log(`\n${n} tests passed`);
