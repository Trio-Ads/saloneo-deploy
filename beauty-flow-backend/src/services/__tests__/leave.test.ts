// Run: cd beauty-flow-backend && npx ts-node --transpile-only src/services/__tests__/leave.test.ts
import assert from 'assert';
import { hitsLeave, leaveBalance, leaveDays, plainHours, plannedMinutes, validLeaveWindow, workSpans } from '../leave';

// Tue–Sat 09:00–18:00 with lunch 12:00–13:00 (8 h), Mon + Sun off
const day = { isWorking: true, start: '09:00', end: '18:00', breaks: [{ start: '12:00', end: '13:00' }] };
const hours = { monday: { isWorking: false }, tuesday: day, wednesday: day, thursday: day, friday: day, saturday: day, sunday: { isWorking: false } };

assert.deepStrictEqual(workSpans(hours, '2026-11-03'), [[540, 720], [780, 1080]]); // Tuesday
assert.deepStrictEqual(workSpans(hours, '2026-11-02'), []); // Monday off
assert.deepStrictEqual(plainHours(new Map(Object.entries(hours))), hours);

/* days a leave costs: only the member's working days */
assert.strictEqual(leaveDays(hours, { from: '2026-11-02', to: '2026-11-08' }), 5); // Mon–Sun week: Tue–Sat
assert.strictEqual(leaveDays(hours, { from: '2026-11-08', to: '2026-11-09' }), 0); // Sun + Mon
assert.strictEqual(leaveDays(hours, { from: '2026-11-03', to: '2026-11-03', start: '09:00', end: '12:00' }), 0.5); // 3 h of 8 → half day
assert.strictEqual(leaveDays(hours, { from: '2026-11-03', to: '2026-11-03', start: '14:00', end: '18:00' }), 0.5); // 4 h of 8
assert.strictEqual(leaveDays(hours, { from: '2026-11-03', to: '2026-11-03', start: '12:00', end: '13:00' }), 0); // lunch only
assert.strictEqual(leaveDays(hours, { from: '2026-11-03', to: '2026-11-03', start: '08:00', end: '19:00' }), 1);
assert.strictEqual(leaveDays({}, { from: '2026-11-03', to: '2026-11-07' }), 0); // no hours set: nothing to take off
// Clipped to a year
assert.strictEqual(leaveDays(hours, { from: '2026-12-29', to: '2027-01-02' }, '2026-01-01', '2026-12-31'), 3); // Tue 29–Thu 31
assert.strictEqual(leaveDays(hours, { from: '2026-12-29', to: '2027-01-02' }, '2027-01-01', '2027-12-31'), 2); // Fri 1, Sat 2

/* balance: approved annual leave of the year */
assert.deepStrictEqual(leaveBalance(30, hours, [{ from: '2026-11-02', to: '2026-11-08' }, { from: '2026-11-03', to: '2026-11-03', start: '09:00', end: '12:00' }], 2026), { allowance: 30, taken: 5.5, remaining: 24.5 });
assert.deepStrictEqual(leaveBalance(30, hours, [{ from: '2027-01-05', to: '2027-01-06' }], 2026), { allowance: 30, taken: 0, remaining: 30 });
assert.deepStrictEqual(leaveBalance(2, hours, [{ from: '2026-11-02', to: '2026-11-08' }], 2026).remaining, -3); // overdrawn shows as negative

/* planned hours of a month: working hours minus absences */
// November 2026, Tue–Sat
const novWorking = Array.from({ length: 30 }, (_, i) => `2026-11-${String(i + 1).padStart(2, '0')}`).filter((d) => workSpans(hours, d).length).length;
assert.strictEqual(plannedMinutes(hours, [], '2026-11'), novWorking * 480);
assert.strictEqual(plannedMinutes(hours, [{ from: '2026-11-03', to: '2026-11-04' }], '2026-11'), (novWorking - 2) * 480);
assert.strictEqual(plannedMinutes(hours, [{ from: '2026-11-03', to: '2026-11-03', start: '14:00', end: '16:00' }], '2026-11'), novWorking * 480 - 120);
// Overlapping absences are not subtracted twice; an absence outside the month changes nothing
assert.strictEqual(plannedMinutes(hours, [{ from: '2026-11-03', to: '2026-11-03', start: '14:00', end: '16:00' }, { from: '2026-11-03', to: '2026-11-03', start: '15:00', end: '17:00' }], '2026-11'), novWorking * 480 - 180);
assert.strictEqual(plannedMinutes(hours, [{ from: '2026-10-01', to: '2026-10-31' }], '2026-11'), novWorking * 480);
assert.strictEqual(plannedMinutes(hours, [], '2026-12'), Array.from({ length: 31 }, (_, i) => `2026-12-${String(i + 1).padStart(2, '0')}`).filter((d) => workSpans(hours, d).length).length * 480);

/* conflicts */
assert.strictEqual(hitsLeave({ from: '2026-11-03', to: '2026-11-05' }, { date: '2026-11-04', startTime: '10:00', endTime: '10:30' }), true);
assert.strictEqual(hitsLeave({ from: '2026-11-03', to: '2026-11-05' }, { date: '2026-11-06', startTime: '10:00' }), false);
assert.strictEqual(hitsLeave({ from: '2026-11-03', to: '2026-11-03', start: '14:00', end: '16:00' }, { date: '2026-11-03', startTime: '13:30', endTime: '14:15' }), true);
assert.strictEqual(hitsLeave({ from: '2026-11-03', to: '2026-11-03', start: '14:00', end: '16:00' }, { date: '2026-11-03', startTime: '13:30', endTime: '14:00' }), false); // ends as it starts
assert.strictEqual(hitsLeave({ from: '2026-11-03', to: '2026-11-03', start: '14:00', end: '16:00' }, { date: '2026-11-03', startTime: '15:45', duration: 60 }), true);

/* validation */
assert.strictEqual(validLeaveWindow({ from: '2026-11-03', to: '2026-11-05' }), true);
assert.strictEqual(validLeaveWindow({ from: '2026-11-05', to: '2026-11-03' }), false);
assert.strictEqual(validLeaveWindow({ from: '2026-11-03', to: '2028-11-03' }), false); // over a year
assert.strictEqual(validLeaveWindow({ from: '2026-13-01', to: '2026-13-01' }), false);
assert.strictEqual(validLeaveWindow({ from: '2026-11-03', to: '2026-11-03', start: '14:00', end: '12:00' }), false);
assert.strictEqual(validLeaveWindow({ from: '2026-11-03', to: '2026-11-03', start: '14:00' }), false);
assert.strictEqual(validLeaveWindow({ from: '2026-11-03', to: '2026-11-03', start: '9:00', end: '12:00' }), false);
assert.strictEqual(validLeaveWindow({ from: { $gt: '' } as any, to: '2026-11-03' }), false);

console.log('leave: all assertions passed');
