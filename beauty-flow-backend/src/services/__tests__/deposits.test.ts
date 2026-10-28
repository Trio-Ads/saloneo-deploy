// Run: cd beauty-flow-backend && npx ts-node --transpile-only src/services/__tests__/deposits.test.ts
import assert from 'assert';
import {
  MIN_DEPOSIT, canTransition, cancellationPolicy, clientCancelDecision, clientRescheduleDecision, commissionOf,
  depositAmount, displayStatus, ledger, validRib, TRANSITIONS,
} from '../deposits';
import { DEFAULT_BOOKING, nowIn } from '../availability';

/* amount: percent rounded to 50 DA, min 500 DA, never above the price */
assert.strictEqual(depositAmount(15000, { mode: 'percent', value: 30 }), 4500);
assert.strictEqual(depositAmount(2900, { mode: 'percent', value: 30 }), 850); // 870 → 850
assert.strictEqual(depositAmount(2950, { mode: 'percent', value: 30 }), 900); // 885 → 900
assert.strictEqual(depositAmount(1000, { mode: 'percent', value: 10 }), MIN_DEPOSIT); // 100 → min 500
assert.strictEqual(depositAmount(400, { mode: 'percent', value: 50 }), 400); // min capped by the price
assert.strictEqual(depositAmount(3000, { mode: 'fixed', value: 1000 }), 1000);
assert.strictEqual(depositAmount(3000, { mode: 'fixed', value: 5000 }), 3000); // never > price
assert.strictEqual(depositAmount(3000, { mode: 'fixed', value: 200 }), MIN_DEPOSIT);
assert.strictEqual(depositAmount(3000, { mode: 'percent', value: 250 }), 3000); // percent capped at 100
assert.strictEqual(depositAmount(3000, { mode: 'none', value: 30 }), 0);
assert.strictEqual(depositAmount(3000, { mode: 'percent', value: 0 }), 0);
assert.strictEqual(depositAmount(0, { mode: 'fixed', value: 1000 }), 0); // free service: no deposit
assert.strictEqual(depositAmount(3000, undefined), 0);
assert.strictEqual(depositAmount(3000, { mode: 'bogus', value: 10 }), 0);

/* policy deadline, in Africa/Algiers (UTC+1, no DST): appointment 2026-11-10 10:00, 24 h free cancellation */
const appt = { date: '2026-11-10T00:00:00.000Z', startTime: '10:00' };
const at = (iso: string) => nowIn('Africa/Algiers', new Date(iso));
// 2026-11-09 09:00Z = 10:00 in Algiers: exactly the deadline → still free
let p = cancellationPolicy(24, appt, at('2026-11-09T09:00:00Z'));
assert.deepStrictEqual(p.freeUntil, { date: '2026-11-09', time: '10:00' });
assert.strictEqual(p.isFree, true);
assert.strictEqual(cancellationPolicy(24, appt, at('2026-11-09T09:01:00Z')).isFree, false); // one minute late
// Late evening UTC is already the next day in Algiers
assert.strictEqual(cancellationPolicy(24, { date: '2026-11-10', startTime: '00:30' }, at('2026-11-08T23:15:00Z')).isFree, true); // 00:15 on the 9th
assert.strictEqual(cancellationPolicy(24, { date: '2026-11-10', startTime: '00:30' }, at('2026-11-08T23:45:00Z')).isFree, false); // 00:45 on the 9th
// Deadline across midnight: 10:00 − 48 h
assert.deepStrictEqual(cancellationPolicy(48, appt, at('2026-11-01T00:00:00Z')).freeUntil, { date: '2026-11-08', time: '10:00' });
assert.deepStrictEqual(cancellationPolicy(12, { date: '2026-11-10', startTime: '09:00' }, at('2026-11-01T00:00:00Z')).freeUntil, { date: '2026-11-09', time: '21:00' });
// 0 h: free until it starts
p = cancellationPolicy(0, appt, at('2026-11-10T08:59:00Z'));
assert.strictEqual(p.isFree, true);
assert.strictEqual(p.started, false);
assert.strictEqual(cancellationPolicy(0, appt, at('2026-11-10T09:00:00Z')).started, true);

/* client decisions */
const b = { ...DEFAULT_BOOKING };
const free = cancellationPolicy(24, appt, at('2026-11-01T00:00:00Z'));
const late = cancellationPolicy(24, appt, at('2026-11-09T20:00:00Z'));
const started = cancellationPolicy(24, appt, at('2026-11-10T09:30:00Z'));
assert.deepStrictEqual(clientCancelDecision(b, free, true), { ok: true, deposit: 'refund' });
assert.deepStrictEqual(clientCancelDecision(b, late, true), { ok: true, deposit: 'retain' });
assert.deepStrictEqual(clientCancelDecision(b, free, false), { ok: true, deposit: null });
assert.deepStrictEqual(clientCancelDecision(b, late, false), { ok: false, code: 'CANCELLATION_DEADLINE_PASSED' });
assert.deepStrictEqual(clientCancelDecision({ ...b, allowCancellation: false }, free, true), { ok: false, code: 'CANCELLATION_DISABLED' });
assert.deepStrictEqual(clientRescheduleDecision(b, free), { ok: true, late: false });
assert.deepStrictEqual(clientRescheduleDecision(b, late, 0), { ok: true, late: true }); // allowed once
assert.deepStrictEqual(clientRescheduleDecision(b, late, 1), { ok: false, code: 'RESCHEDULE_DEADLINE_PASSED' });
assert.deepStrictEqual(clientRescheduleDecision({ ...b, lateReschedule: false }, late, 0), { ok: false, code: 'RESCHEDULE_DEADLINE_PASSED' });
assert.deepStrictEqual(clientRescheduleDecision(b, started, 0), { ok: false, code: 'RESCHEDULE_DEADLINE_PASSED' });

/* state machine */
assert.ok(canTransition('pending', 'paid'));
assert.ok(canTransition('failed', 'pending')); // retry
assert.ok(canTransition('expired', 'paid')); // payment arrived after the hold
assert.ok(canTransition('paid', 'refund_pending'));
assert.ok(canTransition('refund_pending', 'refunded'));
assert.ok(canTransition('paid', 'retained'));
assert.ok(canTransition('paid', 'applied'));
assert.ok(!canTransition('paid', 'paid')); // a second confirmation never credits twice
assert.ok(!canTransition('pending', 'refunded'));
assert.ok(!canTransition('refunded', 'paid'));
assert.ok(!canTransition('retained', 'refund_pending'));
assert.ok(!canTransition('applied', 'retained'));
assert.ok(!canTransition('expired', 'pending')); // an expired hold cannot be retried
for (const terminal of ['refunded', 'retained', 'applied'] as const) assert.deepStrictEqual(TRANSITIONS[terminal], []);

/* ledger: retained + applied − commission − payouts; paid = en attente */
const deps = [
  { status: 'paid', amount: 1000 },
  { status: 'retained', amount: 2000, commission: 100 },
  { status: 'applied', amount: 4500, commission: 225 },
  { status: 'refunded', amount: 3000 },
  { status: 'refund_pending', amount: 700 },
  { status: 'expired', amount: 900 },
];
const l = ledger(deps, [{ amount: 3000 }]);
assert.deepStrictEqual(l, { pending: 1000, earned: 6500, commission: 325, paidOut: 3000, available: 3175, refundPending: 700 });
assert.strictEqual(ledger([], []).available, 0);
assert.strictEqual(commissionOf(4500, 5), 225);
assert.strictEqual(commissionOf(1250, 2.5), 31); // 31.25 → 31
assert.strictEqual(commissionOf(1000, 0), 0);
assert.strictEqual(displayStatus({ status: 'retained', payoutId: 'x' }), 'paid_out');
assert.strictEqual(displayStatus({ status: 'retained' }), 'retained');

/* payout details */
assert.ok(validRib('ccp', '00799999001234567890'));
assert.ok(!validRib('ccp', '00100123001234567890')); // a bank RIB is not a CCP RIP
assert.ok(validRib('bank', '00100123001234567890'));
assert.ok(!validRib('bank', '0010012300123456789')); // 19 digits
assert.ok(!validRib('bank', '0010012300123456789a'));
assert.ok(!validRib('paypal', '00100123001234567890'));

console.log('deposits: all assertions passed');
process.exit(0);
