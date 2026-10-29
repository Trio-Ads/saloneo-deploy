// Run: cd beauty-flow-backend && npx ts-node --transpile-only src/services/__tests__/accountDeletion.test.ts
// Uses the local dev Mongo (docker saloneo-dev-mongo :27019); creates throwaway accounts and removes them.
import assert from 'assert';
import crypto from 'crypto';
import fs from 'fs';
import os from 'os';
import path from 'path';
import mongoose from 'mongoose';
import { User } from '../../models/User';
import { Client } from '../../models/Client';
import { Appointment } from '../../models/Appointment';
import { Service } from '../../models/Service';
import { Product } from '../../models/Product';
import { TeamMember } from '../../models/Team';
import { LeaveRequest } from '../../models/LeaveRequest';
import { WaitlistEntry } from '../../models/Waitlist';
import { Review } from '../../models/Review';
import { Deposit, Payout } from '../../models/Deposit';
import { Transaction } from '../../models/Transaction';
import { MarketOrder, Supplier, SupplierPayout, SupplierProduct } from '../../models/Marketplace';
import { emailService } from '../emailService';
import { login } from '../../controllers/auth.controller';
import { DeletionError, purgeDueAccounts, requestDeletion } from '../accountDeletion';

const MONGO = 'mongodb://127.0.0.1:27019/saloneo_dev';
const tag = crypto.randomBytes(4).toString('hex');
const PASSWORD = 'secret-123';
const uploads = fs.mkdtempSync(path.join(os.tmpdir(), 'deltest-'));
process.env.UPLOAD_DIR = uploads;
(emailService as any).sendTemplateEmail = async () => ({});

const oid = () => new mongoose.Types.ObjectId();
const created: { model: any; filter: any }[] = [];
const track = (model: any, filter: any) => created.push({ model, filter });
const push = () => mongoose.connection.collection('pushsubscriptions');

async function tryLogin(email: string) {
  let status = 200, body: any = null;
  const res: any = { status: (s: number) => { status = s; return res; }, json: (b: any) => { body = b; return res; } };
  await login({ body: { email, password: PASSWORD }, ip: '127.0.0.1', get: () => 'test' } as any, res);
  return { status, body };
}

async function owner(name: string) {
  const u: any = await User.create({ email: `deltest-${name}-${tag}@saloneo.test`, password: PASSWORD, establishmentName: `Deltest ${name} ${tag}`, subscription: { plan: 'FREE', startDate: new Date() } });
  track(User, { _id: u._id });
  return u;
}

async function staffOf(salon: any, name: string) {
  const memberId = oid();
  await TeamMember.collection.insertOne({ _id: memberId, userId: salon._id, firstName: name, lastName: 'T', email: `m-${name}-${tag}@saloneo.test`, isActive: true } as any);
  track(TeamMember, { _id: memberId });
  const s: any = await User.create({ email: `deltest-staff-${name}-${tag}@saloneo.test`, password: PASSWORD, establishmentName: salon.establishmentName, role: 'staff', salonId: salon._id, teamMemberId: memberId, subscription: { plan: 'FREE', startDate: new Date() } });
  track(User, { _id: s._id });
  return { staff: s, memberId };
}

async function order(fields: any) {
  const _id = crypto.randomBytes(12).toString('hex');
  await MarketOrder.collection.insertOne({ _id, number: `DT-${_id}`, total: 5000, subtotal: 5000, commissionPercent: 0, commission: 0, items: [], messages: [{ from: 'salon', body: 'appelez le 0555', at: new Date() }, { from: 'supplier', body: 'ok', at: new Date() }], ...fields } as any);
  track(MarketOrder, { _id });
  return _id;
}

async function main() {
  await mongoose.connect(MONGO);
  try {
    /* 1. request: the owner is closed at once, login refused, staff locked out */
    const a = await owner('a');
    const { staff: aStaff } = await staffOf(a, 'a');
    const userId = a._id;
    for (const M of [Client, Appointment, Service, Product, LeaveRequest, WaitlistEntry, Review]) track(M, { userId }); // if a step fails
    track(push(), { accountId: aStaff._id });
    await Promise.all([
      Client.collection.insertOne({ userId, firstName: 'Lina', lastName: 'B', phone: '0555000000' } as any),
      Appointment.collection.insertOne({ userId, clientInfo: { firstName: 'Lina', lastName: 'B', phone: '0555000000' } } as any),
      Service.collection.insertOne({ userId, name: 'Coupe' } as any),
      Product.collection.insertOne({ userId, name: 'Shampoing' } as any),
      LeaveRequest.collection.insertOne({ userId, teamMemberId: oid() } as any),
      WaitlistEntry.collection.insertOne({ userId, client: { firstName: 'Lina', phone: '0555000000' } } as any),
      Review.collection.insertOne({ userId, rating: 5 } as any),
      push().insertOne({ accountId: aStaff._id, endpoint: `https://push.test/${tag}` }),
    ]);
    const depositId = `dt-${tag}`;
    await Deposit.collection.insertOne({ _id: depositId, userId, appointmentId: oid(), serviceId: 's', serviceName: 'Coupe', clientName: 'Lina B', clientEmail: 'lina@x.test', amount: 1000, commission: 0, status: 'applied' } as any);
    track(Deposit, { _id: depositId });
    const payout: any = await Payout.create({ userId, amount: 1000, paidAt: new Date() }); // deposit already paid out: nothing owed
    track(Payout, { _id: payout._id });
    const txId = oid();
    await Transaction.collection.insertOne({ _id: txId, userId, amount: 2500, satim: { cardholderName: 'LINA B', approvalCode: '123' }, metadata: { ip: '1.2.3.4' } } as any);
    track(Transaction, { _id: txId });
    const salonOrder = await order({ salonId: userId, supplierId: oid(), status: 'released', salonName: a.establishmentName, shipTo: { name: 'Salon A', phone: '0555111111', address: '1 rue X', wilaya: 'Alger' } });
    const fileDir = path.join(uploads, 'saloneo', 'logos', String(userId));
    fs.mkdirSync(fileDir, { recursive: true });
    fs.writeFileSync(path.join(fileDir, 'logo.png'), 'x');

    const { purgeAt } = await requestDeletion(a);
    assert.ok(purgeAt && purgeAt.getTime() > Date.now() + 29 * 86_400_000);
    const closed: any = await User.findById(userId).lean();
    assert.strictEqual(closed.isActive, false);
    assert.ok(closed.deletionRequestedAt);
    const refused = await tryLogin(a.email);
    assert.strictEqual(refused.status, 403);
    assert.strictEqual(refused.body.code, 'ACCOUNT_DELETION_PENDING');
    assert.strictEqual((await tryLogin(aStaff.email)).status, 403); // staff of a closed salon

    /* 2. blocked while money is in escrow */
    const b = await owner('b');
    const escrow = await order({ salonId: b._id, supplierId: oid(), status: 'shipped' });
    await assert.rejects(requestDeletion(b), (e: any) => e instanceof DeletionError && e.code === 'DELETION_BLOCKED_PENDING_MONEY');
    assert.strictEqual((await User.findById(b._id).lean() as any).isActive, true);
    await MarketOrder.updateOne({ _id: escrow }, { $set: { status: 'released' } });

    /* 3. staff deletes their own login: immediate, the team member stays with the salon */
    const { staff: bStaff, memberId } = await staffOf(b, 'b');
    assert.deepStrictEqual(await requestDeletion(bStaff), { purgeAt: null });
    assert.strictEqual(await User.countDocuments({ _id: bStaff._id }), 0);
    assert.strictEqual(await TeamMember.countDocuments({ _id: memberId }), 1);
    assert.strictEqual((await User.findById(b._id).lean() as any).isActive, true);

    /* 4. purge after 30 days: salon data gone, financial records kept without names */
    await purgeDueAccounts();
    assert.strictEqual(await User.countDocuments({ _id: userId }), 1); // not due yet
    await User.updateOne({ _id: userId }, { $set: { deletionRequestedAt: new Date(Date.now() - 31 * 86_400_000) } });
    await purgeDueAccounts();
    assert.strictEqual(await User.countDocuments({ $or: [{ _id: userId }, { salonId: userId }] }), 0);
    for (const M of [Client, Appointment, Service, Product, TeamMember, LeaveRequest, WaitlistEntry, Review]) assert.strictEqual(await (M as any).countDocuments({ userId }), 0, M.modelName);
    assert.strictEqual(await push().countDocuments({ accountId: aStaff._id }), 0);
    assert.ok(!fs.existsSync(fileDir));
    const dep: any = await Deposit.findById(depositId).lean();
    assert.strictEqual(dep.amount, 1000);
    assert.strictEqual(dep.clientName, '');
    assert.strictEqual(dep.clientEmail, undefined);
    assert.strictEqual(await Payout.countDocuments({ _id: payout._id }), 1);
    const tx: any = await Transaction.collection.findOne({ _id: txId });
    assert.strictEqual(tx.amount, 2500);
    assert.strictEqual(tx.satim.cardholderName, undefined);
    assert.strictEqual(tx.satim.approvalCode, '123');
    const so: any = await MarketOrder.findById(salonOrder).lean();
    assert.strictEqual(so.total, 5000);
    assert.strictEqual(so.salonName, 'Compte supprimé');
    assert.strictEqual(so.shipTo.phone, '');
    assert.strictEqual(so.shipTo.wilaya, 'Alger');
    assert.deepStrictEqual(so.messages.map((m: any) => m.from), ['supplier']);

    /* 5. supplier: blocked by escrow, then closed and purged; orders kept */
    const su: any = await User.create({ email: `deltest-sup-${tag}@saloneo.test`, password: PASSWORD, establishmentName: `Deltest sup ${tag}`, role: 'supplier', subscription: { plan: 'FREE', startDate: new Date() } });
    track(User, { _id: su._id });
    const supplierId = oid();
    await Supplier.collection.insertOne({ _id: supplierId, userId: su._id, companyName: 'Deltest SARL', slug: `deltest-${tag}`, email: su.email, status: 'approved' } as any);
    track(Supplier, { _id: supplierId });
    await SupplierProduct.collection.insertOne({ supplierId, name: 'Gants', price: 100 } as any);
    track(SupplierProduct, { supplierId });
    const supOrder = await order({ salonId: b._id, supplierId, status: 'paid', supplierName: 'Deltest SARL' });
    await assert.rejects(requestDeletion(su), (e: any) => e.code === 'DELETION_BLOCKED_PENDING_MONEY');
    await MarketOrder.updateOne({ _id: supOrder }, { $set: { status: 'released' } }); // settled: 5000 DA now owed to the supplier
    await assert.rejects(requestDeletion(su), (e: any) => e.code === 'DELETION_BLOCKED_PENDING_MONEY');
    const sp: any = await SupplierPayout.create({ supplierId, amount: 5000, paidAt: new Date() });
    track(SupplierPayout, { _id: sp._id });
    await requestDeletion(su);
    assert.strictEqual((await Supplier.findById(supplierId).lean() as any).status, 'suspended');
    assert.strictEqual((await tryLogin(su.email)).body.code, 'ACCOUNT_DELETION_PENDING');
    await User.updateOne({ _id: su._id }, { $set: { deletionRequestedAt: new Date(Date.now() - 31 * 86_400_000) } });
    await purgeDueAccounts();
    assert.strictEqual(await User.countDocuments({ _id: su._id }), 0);
    assert.strictEqual(await Supplier.countDocuments({ _id: supplierId }), 0);
    assert.strictEqual(await SupplierProduct.countDocuments({ supplierId }), 0);
    const kept: any = await MarketOrder.findById(supOrder).lean();
    assert.strictEqual(kept.supplierName, 'Compte supprimé');
    assert.strictEqual(kept.total, 5000);
    assert.strictEqual(await SupplierPayout.countDocuments({ _id: sp._id }), 1);

    console.log('accountDeletion: all assertions passed');
  } finally {
    for (const { model, filter } of created) await model.deleteMany(filter);
    fs.rmSync(uploads, { recursive: true, force: true });
    await mongoose.disconnect();
  }
}

main().then(() => process.exit(0), (e) => { console.error(e); process.exit(1); });
