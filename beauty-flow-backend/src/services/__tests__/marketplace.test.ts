// Run: cd beauty-flow-backend && npx ts-node --transpile-only src/services/__tests__/marketplace.test.ts
import assert from 'assert';
import {
  TRANSITIONS, addDays, algiersDateTime, canTransition, catalogFromCsv, deliveryFee, deliversTo, dueAction, findCategory, lineProblem,
  monthStart, normalizeZones, orderTotals, parseCsv, productZones, settlement, supplierLedger, validNif, validRc, validateProduct,
} from '../marketplace';
import { DEFAULT_MARKET_SETTINGS, ORDER_STATUSES } from '../../models/Marketplace';

/* delivery fee: flat per order, free from `freeAbove` DA of goods */
assert.strictEqual(deliveryFee(5000, { fee: 600, freeAbove: 20000 }), 600);
assert.strictEqual(deliveryFee(20000, { fee: 600, freeAbove: 20000 }), 0); // threshold included
assert.strictEqual(deliveryFee(19999, { fee: 600, freeAbove: 20000 }), 600);
assert.strictEqual(deliveryFee(100000, { fee: 600, freeAbove: 0 }), 600); // 0 = never free
assert.strictEqual(deliveryFee(100, { fee: 0, freeAbove: 0 }), 0);
assert.strictEqual(deliveryFee(100, { fee: -50, freeAbove: 0 }), 0);

/* totals */
assert.deepStrictEqual(orderTotals([{ price: 1850, qty: 3 }, { price: 420, qty: 10 }], { fee: 500, freeAbove: 15000 }), { subtotal: 9750, deliveryFee: 500, total: 10250 });
assert.deepStrictEqual(orderTotals([{ price: 1850, qty: 10 }], { fee: 500, freeAbove: 15000 }), { subtotal: 18500, deliveryFee: 0, total: 18500 });
assert.deepStrictEqual(orderTotals([], { fee: 500, freeAbove: 0 }), { subtotal: 0, deliveryFee: 0, total: 0 }); // empty cart: no fee

/* commission on what the supplier keeps (8 % default, rounded to the dinar) */
assert.deepStrictEqual(settlement(10250, 0, 8), { share: 10250, commission: 820, net: 9430 });
assert.deepStrictEqual(settlement(10250, 4000, 8), { share: 6250, commission: 500, net: 5750 }); // partial refund
assert.deepStrictEqual(settlement(10250, 10250, 8), { share: 0, commission: 0, net: 0 });
assert.deepStrictEqual(settlement(999, 0, 8), { share: 999, commission: 80, net: 919 }); // 79.92 → 80
assert.deepStrictEqual(settlement(1000, 0, 0), { share: 1000, commission: 0, net: 1000 }); // per-supplier override 0 %
assert.deepStrictEqual(settlement(1000, 0, 12.5), { share: 1000, commission: 125, net: 875 });

/* state machine */
assert.ok(canTransition('pending_payment', 'paid'));
assert.ok(canTransition('paid', 'accepted') && canTransition('accepted', 'shipped') && canTransition('shipped', 'delivered') && canTransition('delivered', 'released'));
assert.ok(canTransition('shipped', 'released')); // auto-release
assert.ok(canTransition('shipped', 'disputed') && canTransition('accepted', 'disputed'));
assert.ok(canTransition('disputed', 'released') && canTransition('disputed', 'refund_pending'));
assert.ok(canTransition('refund_pending', 'refunded') && canTransition('refund_pending', 'partially_refunded'));
assert.ok(canTransition('expired', 'paid') && canTransition('cancelled', 'paid')); // late SATIM payment
assert.ok(!canTransition('paid', 'shipped')); // accept first
assert.ok(!canTransition('paid', 'released') && !canTransition('accepted', 'released')); // never released before delivery/shipping
assert.ok(!canTransition('pending_payment', 'accepted') && !canTransition('pending_payment', 'refund_pending')); // nothing to refund
assert.ok(!canTransition('delivered', 'disputed')); // confirmed received: no dispute after
for (const end of ['released', 'refunded', 'partially_refunded'] as const) assert.deepStrictEqual(TRANSITIONS[end], []);
for (const s of ORDER_STATUSES) for (const t of TRANSITIONS[s]) assert.ok(ORDER_STATUSES.includes(t), `${s} → ${t}`);
assert.ok(!canTransition('released', 'refund_pending')); // settled money never comes back by itself

/* deadlines (Algeria: UTC+1, no DST → N days = N × 24 h) */
const S = DEFAULT_MARKET_SETTINGS;
assert.deepStrictEqual(S, { commissionPercent: 8, autoReleaseDays: 7, shipDeadlineDays: 5 });
const paidAt = new Date('2026-11-02T22:30:00Z'); // 23:30 on Nov 2 in Algiers
const ord = (o: any) => ({ reminders: {}, ...o });
assert.strictEqual(dueAction(ord({ status: 'paid', paidAt }), S, new Date('2026-11-06T22:29:00Z')), null);
assert.strictEqual(dueAction(ord({ status: 'paid', paidAt }), S, new Date('2026-11-06T22:30:00Z')), 'remind_ship'); // eve of deadline
assert.strictEqual(dueAction(ord({ status: 'paid', paidAt, reminders: { ship: true } }), S, new Date('2026-11-07T22:29:59Z')), null);
assert.strictEqual(dueAction(ord({ status: 'accepted', paidAt, reminders: { ship: true } }), S, new Date('2026-11-07T22:30:00Z')), 'ship_deadline'); // exactly 5 days
assert.strictEqual(algiersDateTime(addDays(paidAt, 5)), '07/11/2026 à 23:30'); // shown in Algiers time
assert.strictEqual(algiersDateTime(new Date('2026-11-07T23:30:00Z')), '08/11/2026 à 00:30'); // past midnight in Algiers
const shippedAt = new Date('2026-11-10T09:00:00Z');
const shipped = (r = {}) => ord({ status: 'shipped', paidAt, shipment: { shippedAt }, reminders: r });
assert.strictEqual(dueAction(shipped(), S, new Date('2026-11-13T08:59:00Z')), null);
assert.strictEqual(dueAction(shipped(), S, new Date('2026-11-13T09:00:00Z')), 'remind_first'); // D+3
assert.strictEqual(dueAction(shipped({ d3: true }), S, new Date('2026-11-15T09:00:00Z')), null);
assert.strictEqual(dueAction(shipped({ d3: true }), S, new Date('2026-11-16T09:00:00Z')), 'remind_last'); // D+6
assert.strictEqual(dueAction(shipped(), S, new Date('2026-11-16T09:00:00Z')), 'remind_last'); // late job: only the last one goes out
assert.strictEqual(dueAction(shipped({ d3: true, d6: true }), S, new Date('2026-11-17T08:59:59Z')), null);
assert.strictEqual(dueAction(shipped({ d3: true, d6: true }), S, new Date('2026-11-17T09:00:00Z')), 'auto_release'); // D+7
assert.strictEqual(dueAction(shipped(), { ...S, autoReleaseDays: 3 }, new Date('2026-11-12T09:00:00Z')), 'remind_last'); // short window: one reminder
assert.strictEqual(dueAction(ord({ status: 'disputed', paidAt, shipment: { shippedAt } }), S, new Date('2027-01-01')), null); // frozen
assert.strictEqual(dueAction(ord({ status: 'delivered', paidAt }), S, new Date('2027-01-01')), null);
const created = new Date('2026-11-01T10:00:00Z');
assert.strictEqual(dueAction(ord({ status: 'pending_payment', createdAt: created }), S, new Date('2026-11-01T10:59:00Z')), null);
assert.strictEqual(dueAction(ord({ status: 'pending_payment', createdAt: created }), S, new Date('2026-11-01T11:00:00Z')), 'expire');
// Month start in Algiers: Nov 1 00:00 local = Oct 31 23:00 UTC
assert.strictEqual(monthStart(new Date('2026-11-15T12:00:00Z')).toISOString(), '2026-10-31T23:00:00.000Z');
assert.strictEqual(monthStart(new Date('2026-10-31T23:30:00Z')).toISOString(), '2026-10-31T23:00:00.000Z'); // already November in Algiers

/* supplier ledger */
const L = supplierLedger([
  { status: 'paid', total: 10000, commissionPercent: 8 }, // escrow: 9200 expected
  { status: 'shipped', total: 5000, commissionPercent: 8 }, // escrow: 4600
  { status: 'disputed', total: 2000, commissionPercent: 8 }, // frozen, still escrow: 1840
  { status: 'released', total: 10250, commission: 820, commissionPercent: 8 }, // 9430
  { status: 'partially_refunded', total: 10250, refundAmount: 4000, commission: 500, commissionPercent: 8 }, // 5750
  { status: 'refunded', total: 7000, refundAmount: 7000, commissionPercent: 8 }, // nothing
  { status: 'pending_payment', total: 3000, commissionPercent: 8 }, // nothing
], [{ amount: 9000 }]);
assert.deepStrictEqual(L, { pending: 15640, earned: 16500, commission: 1320, paidOut: 9000, available: 6180 });

/* zones and lines */
assert.ok(deliversTo(['ALL'], 'Tamanrasset') && deliversTo(['Alger', 'Blida'], 'Blida') && !deliversTo(['Alger'], 'Oran') && !deliversTo(['ALL'], ''));
assert.deepStrictEqual(productZones({ zones: [] }, { shipping: { zones: ['Oran'] } }), ['Oran']); // inherits supplier zones
assert.deepStrictEqual(productZones({ zones: ['Alger'] }, { shipping: { zones: ['ALL'] } }), ['Alger']); // product override (e.g. furniture)
assert.deepStrictEqual(normalizeZones(['alger', 'Béjaïa', 'nowhere', '31']), ['Alger', 'Béjaïa', 'Oran']);
assert.deepStrictEqual(normalizeZones("Toute l'Algérie"), ['ALL']);
assert.deepStrictEqual(normalizeZones('Alger|Blida'), ['Alger', 'Blida']);
const sup = { shipping: { zones: ['Alger'] } };
const prod = { isActive: true, minOrderQty: 6, stock: 40, zones: [] };
assert.strictEqual(lineProblem(prod, 6, 'Alger', sup), null);
assert.strictEqual(lineProblem(prod, 5, 'Alger', sup), 'MIN_QTY');
assert.strictEqual(lineProblem(prod, 41, 'Alger', sup), 'OUT_OF_STOCK');
assert.strictEqual(lineProblem(prod, 6, 'Oran', sup), 'NOT_DELIVERED');
assert.strictEqual(lineProblem(prod, 2.5, 'Alger', sup), 'BAD_QTY');
assert.strictEqual(lineProblem({ ...prod, isActive: false }, 6, 'Alger', sup), 'UNAVAILABLE');
assert.strictEqual(lineProblem(null, 6, 'Alger', sup), 'UNAVAILABLE');

/* catalogue validation + CSV */
assert.strictEqual(findCategory('Cils & sourcils'), 'lashes_brows');
assert.strictEqual(findCategory('hygiene et jetables'), undefined); // label must match ("&" is folded, "et" is not)
assert.strictEqual(findCategory('Hygiène & jetables'), 'hygiene');
assert.strictEqual(findCategory('epilation'), 'waxing');
assert.strictEqual(validateProduct({ name: 'X', category: 'nails', price: 100 }).error, 'name');
assert.strictEqual(validateProduct({ name: 'Vernis', category: 'nope', price: 100 }).error, 'category');
assert.strictEqual(validateProduct({ name: 'Vernis', category: 'nails', price: 0 }).error, 'price');
assert.strictEqual(validateProduct({ name: 'Vernis', category: 'nails', price: 100, minOrderQty: 0 }).error, 'minOrderQty');
assert.strictEqual(validateProduct({ name: 'Vernis', category: 'nails', price: 100, photos: ['javascript:alert(1)'] }).error, 'photos');
const v = validateProduct({ name: ' Vernis gel ', category: 'Ongles', price: '1 250,00', stock: '12' }).value!;
assert.deepStrictEqual([v.name, v.category, v.price, v.stock, v.minOrderQty, v.unit, v.zones], ['Vernis gel', 'nails', 1250, 12, 1, 'Unité', []]);

assert.deepStrictEqual(parseCsv('a;b\n"x;1";"say ""hi"""\r\n\n'), [['a', 'b'], ['x;1', 'say "hi"']]);
assert.deepStrictEqual(parseCsv('a,b\n"line\nbreak",2'), [['a', 'b'], ['line\nbreak', '2']]);
const csv = [
  '﻿nom;marque;categorie;unite;reference;prix_ttc;quantite_min;stock;delai_jours;zones',
  'Shampooing kératine 1 L;Atlas Pro;Soins cheveux;Flacon 1 L;SK-1;1 850;6;120;2;Alger|Blida',
  'Gants nitrile;;Hygiène & jetables;Boîte de 100;GN-100;950;1;500;;ALL',
  ';Atlas Pro;Coiffage;;;800;1;1;;', // no name
  'Cire;Atlas Pro;Inconnue;;;800;1;1;;', // bad category
].join('\n');
const imp = catalogFromCsv(csv);
assert.strictEqual(imp.rows.length, 2);
assert.deepStrictEqual(imp.errors, [{ line: 4, field: 'name' }, { line: 5, field: 'category' }]);
assert.deepStrictEqual([imp.rows[0].price, imp.rows[0].minOrderQty, imp.rows[0].leadTimeDays, imp.rows[0].zones, imp.rows[0].sku], [1850, 6, 2, ['Alger', 'Blida'], 'SK-1']);
assert.deepStrictEqual([imp.rows[1].brand, imp.rows[1].leadTimeDays, imp.rows[1].zones], [undefined, undefined, ['ALL']]);
assert.deepStrictEqual(catalogFromCsv('foo;bar\n1;2').errors, [{ line: 1, field: 'header' }]);

/* supplier identifiers */
assert.ok(validNif('000216001234567') && !validNif('12345') && !validNif('00021600123456A'));
assert.ok(validRc('16/00-1234567B21') && !validRc('x') && !validRc('<script>'));

console.log('marketplace tests: OK');
