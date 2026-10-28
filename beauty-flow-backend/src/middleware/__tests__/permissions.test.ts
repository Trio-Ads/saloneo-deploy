// Run: cd beauty-flow-backend && npx ts-node --transpile-only src/middleware/__tests__/permissions.test.ts
import assert from 'assert';
import {
  Actor, apiPath, can, canEditAppointment, canSeeAppointment, maskContact, normalizePermissions, planningScope,
  sanitizeForStaff, staffAllowed,
} from '../permissions';
import { DEFAULT_STAFF_PERMISSIONS } from '../../models/Team';

const TM = 'aaaaaaaaaaaaaaaaaaaaaaaa', OTHER = 'bbbbbbbbbbbbbbbbbbbbbbbb', ID = 'cccccccccccccccccccccccc';
const owner: Actor = { id: 'o', role: 'owner' };
const admin: Actor = { id: 'a', role: 'admin' };
const supplier: Actor = { id: 's', role: 'supplier' };
const staff = (p: object = {}): Actor => ({ id: 'u', role: 'staff', teamMemberId: TM, permissions: normalizePermissions(p) });
const own = staff();
const all = staff({ planning: 'all', canEditAppointments: 'all', canViewClientContacts: true, canViewRevenue: true, canManageServices: true, canManageProducts: true });
const r = (actor: Actor) => ({ actor });

/* defaults: own planning, create on, edit own, clients on (contacts masked), revenue/services/products off */
assert.deepStrictEqual(normalizePermissions(undefined), DEFAULT_STAFF_PERMISSIONS);
assert.deepStrictEqual(normalizePermissions({ canManageAppointments: true, canViewReports: true }), DEFAULT_STAFF_PERMISSIONS); // legacy fields ignored
assert.strictEqual(normalizePermissions({ planning: 'everything', canEditAppointments: 'yes', canViewRevenue: 'true' }).planning, 'own'); // junk → defaults
assert.strictEqual(normalizePermissions({ canEditAppointments: 'yes' }).canEditAppointments, 'own');
assert.strictEqual(normalizePermissions({ canViewRevenue: 'true' }).canViewRevenue, false);

/* can(): owners/admins everything, suppliers nothing, staff per permission */
for (const p of ['owner', 'staff', 'createAppointments', 'editAppointments', 'viewClients', 'viewClientContacts', 'viewRevenue', 'manageServices', 'manageProducts'] as const) {
  assert.strictEqual(can(r(owner), p), true, p);
  assert.strictEqual(can(r(admin), p), true, p);
  assert.strictEqual(can(r(supplier), p), false, p);
  assert.strictEqual(can({}, p), false, p);
}
assert.strictEqual(can(r(own), 'owner'), false);
assert.strictEqual(can(r(all), 'owner'), false); // no permission set makes staff an owner
assert.strictEqual(can(r(own), 'createAppointments'), true);
assert.strictEqual(can(r(own), 'viewClients'), true);
assert.strictEqual(can(r(own), 'viewClientContacts'), false);
assert.strictEqual(can(r(own), 'viewRevenue'), false);
assert.strictEqual(can(r(own), 'manageServices'), false);
assert.strictEqual(can(r(own), 'manageProducts'), false);
assert.strictEqual(can(r(staff({ canViewClients: false, canViewClientContacts: true })), 'viewClientContacts'), false); // contacts need clients
assert.strictEqual(can(r(staff({ canEditAppointments: 'none' })), 'editAppointments'), false);

/* planning scope + appointment ownership */
assert.strictEqual(planningScope(r(owner)), null);
assert.strictEqual(planningScope(r(own)), TM);
assert.strictEqual(planningScope(r(all)), null);
assert.strictEqual(planningScope(r({ id: 'u', role: 'staff', permissions: DEFAULT_STAFF_PERMISSIONS })), '-'); // no member id → matches nothing
assert.strictEqual(canSeeAppointment(r(own), TM), true);
assert.strictEqual(canSeeAppointment(r(own), OTHER), false);
assert.strictEqual(canSeeAppointment(r(all), OTHER), true);
assert.strictEqual(canEditAppointment(r(owner), OTHER), true);
assert.strictEqual(canEditAppointment(r(own), TM), true);
assert.strictEqual(canEditAppointment(r(own), OTHER), false);
assert.strictEqual(canEditAppointment(r(all), OTHER), true);
assert.strictEqual(canEditAppointment(r(staff({ planning: 'all' })), OTHER), false); // sees all, edits own (default)
assert.strictEqual(canEditAppointment(r(staff({ planning: 'own', canEditAppointments: 'all' })), OTHER), false); // edit never wider than planning
assert.strictEqual(canEditAppointment(r(staff({ canEditAppointments: 'none' })), TM), false);
assert.strictEqual(canEditAppointment(r(supplier), TM), false);
assert.strictEqual(canEditAppointment(r(own), null), false); // "peu importe" reassignment is not "own"

/* route policy: default deny, every owner-only area refused even to the widest staff */
assert.strictEqual(apiPath('/api/appointments/?page=2&limit=500'), '/appointments');
assert.strictEqual(apiPath('/api'), '/');
const allowed = (a: Actor, m: string, u: string) => staffAllowed(a, m, u);
const ownerOnly: Array<[string, string]> = [
  ['PUT', '/api/appointments/booking-settings'], ['DELETE', `/api/appointments/${ID}`],
  ['PUT', `/api/clients/${ID}`], ['DELETE', `/api/clients/${ID}`],
  ['DELETE', `/api/services/${ID}`],
  ['GET', '/api/team/stats'], ['GET', `/api/team/${ID}`], ['POST', '/api/team'], ['PUT', `/api/team/${ID}`],
  ['PATCH', `/api/team/${ID}/permissions`], ['PATCH', `/api/team/${ID}/working-hours`], ['PATCH', `/api/team/${ID}/toggle-status`],
  ['DELETE', `/api/team/${ID}`], ['POST', `/api/team/${TM}/access`], ['DELETE', `/api/team/${TM}/access`],
  ['GET', '/api/team/leaves'], ['POST', `/api/team/leaves/${ID}/decision`], ['GET', `/api/team/${TM}/hr`], ['PUT', `/api/team/${TM}/hr`],
  ['PUT', '/api/profile'], ['PUT', '/api/profile/password'], ['PUT', '/api/profile/business'], ['DELETE', '/api/profile'],
  ['POST', '/api/upload/avatar'], ['POST', '/api/upload/logo'], ['POST', '/api/upload/banner'], ['DELETE', '/api/upload/file'],
  ['POST', `/api/upload/team/${OTHER}/avatar`], ['POST', '/api/upload/single/general'], ['POST', '/api/upload/single/leave'], ['POST', '/api/upload/multiple/leave'], ['DELETE', `/api/leave-attachments/${ID}`],
  ['GET', '/api/subscription'], ['POST', '/api/subscription/subscribe'], ['GET', '/api/subscription/usage-stats'],
  ['POST', '/api/payment/satim/initiate'], ['GET', '/api/payment/transactions'],
  ['GET', '/api/deposits'], ['PUT', '/api/deposits/payout-info'],
  ['GET', '/api/affiliation/stats'], ['GET', '/api/admin/users'], ['GET', '/api/admin/stats'],
  ['GET', '/api/reviews'], ['PATCH', `/api/reviews/${ID}`],
  ['GET', '/api/waitlist'], ['PUT', '/api/waitlist/settings'],
  ['GET', '/api/email/stats'], ['POST', '/api/email/send-reminders'],
  ['POST', '/api/admin/feedback/send/x'],
  ['GET', '/api/marketplace/orders'], ['POST', '/api/marketplace/orders'], ['GET', '/api/supplier/products'],
  ['HEAD', '/api/appointments'], ['OPTIONS', '/api/appointments'],
  ['GET', '/api/Team'], ['GET', '/api/teams'], ['GET', '/api/team/x/../stats'],
];
for (const [m, u] of ownerOnly) {
  assert.strictEqual(allowed(all, m, u), false, `${m} ${u} must be owner-only`);
  assert.strictEqual(allowed(own, m, u), false, `${m} ${u} must be owner-only`);
}
// What the default staff (own planning) can reach
for (const [m, u] of [
  ['GET', '/api/appointments'], ['GET', `/api/appointments/${ID}`], ['POST', '/api/appointments'], ['PUT', `/api/appointments/${ID}`],
  ['PATCH', `/api/appointments/${ID}/status`], ['GET', '/api/appointments/available-slots?serviceId=1'], ['GET', '/api/appointments/booking-settings'],
  ['GET', '/api/clients'], ['GET', '/api/clients/search?q=a'], ['GET', `/api/clients/${ID}`], ['POST', '/api/clients'],
  ['GET', '/api/services'], ['GET', '/api/services/categories'], ['GET', `/api/services/${ID}`],
  ['GET', '/api/team'], ['GET', '/api/profile'], ['POST', `/api/upload/team/${TM}/avatar`], ['POST', '/api/leave-attachments'], ['GET', `/api/leave-attachments/${ID}`],
  ['GET', '/api/staff/me'], ['PUT', '/api/staff/me/password'], ['POST', '/api/staff/leaves'], ['DELETE', `/api/staff/leaves/${ID}`],
] as Array<[string, string]>) assert.strictEqual(allowed(own, m, u), true, `${m} ${u} allowed to default staff`);
// …and what needs a permission it does not have by default
for (const [m, u] of [
  ['GET', '/api/clients/stats'], ['GET', '/api/services/stats'],
  ['POST', '/api/services'], ['PUT', `/api/services/${ID}`], ['PATCH', `/api/services/${ID}/toggle-status`], ['POST', `/api/upload/service/${ID}/image`],
  ['GET', '/api/products'], ['POST', '/api/products'], ['PATCH', `/api/products/${ID}/quantity`], ['DELETE', `/api/products/${ID}`],
] as Array<[string, string]>) {
  assert.strictEqual(allowed(own, m, u), false, `${m} ${u} refused by default`);
  assert.strictEqual(allowed(all, m, u), true, `${m} ${u} allowed with the permission`);
}
assert.strictEqual(allowed(staff({ canCreateAppointments: false }), 'POST', '/api/appointments'), false);
assert.strictEqual(allowed(staff({ canCreateAppointments: false }), 'POST', '/api/clients'), false);
assert.strictEqual(allowed(staff({ canEditAppointments: 'none' }), 'PATCH', `/api/appointments/${ID}/status`), false);
assert.strictEqual(allowed(staff({ canViewClients: false }), 'GET', '/api/clients'), false);
assert.strictEqual(allowed(staff({ canViewClients: false }), 'GET', `/api/clients/${ID}`), false);

/* masking: client contacts (lists, populated appointment.clientId, clientInfo snapshot), money */
assert.strictEqual(maskContact('phone', '0555 12 34 56'), '•• •• •• 56');
assert.strictEqual(maskContact('phone', '12'), '•• •• •• ••');
assert.strictEqual(maskContact('email', 'amira@gmail.com'), 'a•••@gmail.com');
assert.strictEqual(maskContact('address', '12 rue Didouche'), '•••');
assert.strictEqual(maskContact('phone', ''), '');

const payload = {
  appointments: [{
    _id: '1', stylistId: { firstName: 'Amira', lastName: 'B' }, price: 2500, deposit: { required: true, amount: 500, paid: true },
    clientId: { firstName: 'Sara', phone: '0555123456', email: 'sara@x.dz' },
    clientInfo: { firstName: 'Sara', phone: '0555123456', email: 'sara@x.dz' },
    serviceId: { name: 'Coupe', price: 2500 },
  }],
  clients: [{ firstName: 'Lina', phone: '0666987654', email: 'lina@y.dz', address: 'Oran', history: { totalSpent: 9000, averageSpent: 3000, totalVisits: 3 } }],
};
const masked: any = sanitizeForStaff(payload, own.permissions);
assert.strictEqual(masked.appointments[0].clientId.phone, '•• •• •• 56');
assert.strictEqual(masked.appointments[0].clientInfo.email, 's•••@x.dz');
assert.strictEqual(masked.appointments[0].clientId.firstName, 'Sara'); // names stay
assert.strictEqual(masked.clients[0].phone, '•• •• •• 54');
assert.strictEqual(masked.clients[0].address, '•••');
assert.strictEqual(masked.appointments[0].price, undefined);
assert.strictEqual(masked.appointments[0].deposit, undefined);
assert.strictEqual(masked.appointments[0].serviceId.price, undefined);
assert.strictEqual(masked.clients[0].history.totalSpent, undefined);
assert.strictEqual(masked.clients[0].history.totalVisits, 3);
assert.strictEqual(JSON.stringify(masked).includes('0555123456'), false); // no raw number anywhere
assert.strictEqual(JSON.stringify(masked).includes('2500'), false);
assert.strictEqual(payload.clients[0].phone, '0666987654'); // input untouched

const open: any = sanitizeForStaff(payload, all.permissions);
assert.deepStrictEqual(open, payload); // contacts + revenue granted: nothing removed
const revenueOnly: any = sanitizeForStaff(payload, staff({ canViewRevenue: true }).permissions);
assert.strictEqual(revenueOnly.appointments[0].price, 2500);
assert.strictEqual(revenueOnly.clients[0].phone, '•• •• •• 54');
// Mongoose-ish values (toJSON) are serialised before filtering
const doc = { toJSON: () => ({ client: { phone: '0555000011' } }) };
assert.strictEqual((sanitizeForStaff(doc, own.permissions) as any).client.phone, '•• •• •• 11');
assert.strictEqual(sanitizeForStaff('ok', own.permissions), 'ok');
assert.strictEqual(sanitizeForStaff(null, own.permissions), null);
// Colleagues' and the salon's own phone fields outside client objects are not client contacts
assert.strictEqual((sanitizeForStaff({ user: { phone: '0555' } }, own.permissions) as any).user.phone, '0555');

console.log('permissions: all assertions passed');
