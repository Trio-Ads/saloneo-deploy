/**
 * In-app account deletion (App Store 5.1.1(v)).
 * Owner / supplier: closed at once (no login, salon page, directory and catalogue gone, staff locked out),
 * then purged by the daily job PURGE_AFTER_DAYS later. Staff: their own login is deleted at once.
 * Financial records (deposits, payouts, marketplace orders, subscription payments) are kept for the law,
 * detached from the purged account and stripped of names / contacts.
 */
import fs from 'fs/promises';
import path from 'path';
import mongoose, { Types } from 'mongoose';
import * as cron from 'node-cron';
import { User, UserRole } from '../models/User';
import { Client } from '../models/Client';
import { Appointment } from '../models/Appointment';
import { Service } from '../models/Service';
import { Product } from '../models/Product';
import { TeamMember } from '../models/Team';
import { LeaveRequest, LeaveAttachment } from '../models/LeaveRequest';
import { WaitlistEntry } from '../models/Waitlist';
import { Review } from '../models/Review';
import { Deposit, Payout } from '../models/Deposit';
import { Transaction } from '../models/Transaction';
import { MarketOrder, Supplier, SupplierPayout, SupplierProduct } from '../models/Marketplace';
import { ledger } from './deposits';
import { ESCROW, supplierLedger } from './marketplace';
import { emailService } from './emailService';
import { logger } from '../utils/logger';

export const PURGE_AFTER_DAYS = 30;
export const SUPPORT_EMAIL = 'contact@saloneo.app';
const DELETED = 'Compte supprimé';
const DAY_MS = 86_400_000;
/** Money still moving through Saloneo for an order (escrow, or a refund on its way to the salon). */
const OPEN_ORDER = [...ESCROW, 'refund_pending'];

export class DeletionError extends Error {
  constructor(public code: 'DELETION_BLOCKED_PENDING_MONEY', message: string) { super(message); }
}

/** True while Saloneo still holds or owes money for this account: deletion waits for support to settle it. */
export async function moneyPending(account: { _id: any; role?: string }): Promise<boolean> {
  if (account.role === UserRole.SUPPLIER) {
    const supplier = await Supplier.findOne({ userId: account._id }).select('_id').lean();
    if (!supplier) return false;
    const [orders, payouts] = await Promise.all([
      MarketOrder.find({ supplierId: supplier._id }).select('status total refundAmount commission commissionPercent').lean(),
      SupplierPayout.find({ supplierId: supplier._id }).select('amount').lean(),
    ]);
    return orders.some((o) => OPEN_ORDER.includes(o.status)) || supplierLedger(orders, payouts).available > 0;
  }
  const [deposits, payouts, openOrder] = await Promise.all([
    Deposit.find({ userId: account._id }).select('status amount commission').lean(),
    Payout.find({ userId: account._id }).select('amount').lean(),
    MarketOrder.exists({ salonId: account._id, status: { $in: OPEN_ORDER } }),
  ]);
  const l = ledger(deposits, payouts);
  return !!openOrder || l.pending > 0 || l.refundPending > 0 || l.available > 0 || deposits.some((d) => d.status === 'pending');
}

const pushSubscriptions = () => mongoose.connection.collection('pushsubscriptions');

/** Password already checked by the caller. Returns when the data goes for good (null: already gone, staff). */
export async function requestDeletion(account: any, now = new Date()): Promise<{ purgeAt: Date | null }> {
  if (account.role === UserRole.STAFF) {
    await Promise.all([User.deleteOne({ _id: account._id }), pushSubscriptions().deleteMany({ accountId: account._id })]);
    return { purgeAt: null };
  }
  if (await moneyPending(account)) {
    throw new DeletionError('DELETION_BLOCKED_PENDING_MONEY', `Des paiements sont encore en cours sur ce compte. Écrivez à ${SUPPORT_EMAIL} pour le clôturer.`);
  }
  await User.updateOne({ _id: account._id }, { $set: { isActive: false, deletionRequestedAt: now }, $unset: { refreshToken: 1 } });
  if (account.role === UserRole.SUPPLIER) {
    await Supplier.updateOne({ userId: account._id }, { $set: { status: 'suspended', statusReason: 'Suppression du compte demandée' } });
  }
  const purgeAt = new Date(now.getTime() + PURGE_AFTER_DAYS * DAY_MS);
  emailService.sendTemplateEmail('account-deletion', account.email, {
    userName: account.firstName || account.establishmentName || '',
    purgeDate: purgeAt.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Africa/Algiers' }),
    supportEmail: SUPPORT_EMAIL,
  } as any).catch((e) => logger.error('Account deletion email failed', e));
  return { purgeAt };
}

/** Local uploads of that salon / supplier (saloneo/<kind>/<id>). */
// ponytail: local storage only; Cloudinary/S3 files of purged accounts stay until a provider-side cleanup exists
async function removeLocalFiles(id: string, kinds?: string[]): Promise<void> {
  const root = path.resolve(process.env.UPLOAD_DIR || 'uploads', 'saloneo');
  const dirs = kinds || (await fs.readdir(root).catch(() => [] as string[]));
  await Promise.all(dirs.map((kind) => fs.rm(path.join(root, kind, id), { recursive: true, force: true })));
}

async function purgeSalon(ownerId: Types.ObjectId): Promise<void> {
  const staffIds = await User.find({ salonId: ownerId, role: UserRole.STAFF }).distinct('_id');
  const userId = ownerId;
  await Promise.all([
    Client.deleteMany({ userId }), Appointment.deleteMany({ userId }), Service.deleteMany({ userId }), Product.deleteMany({ userId }),
    TeamMember.deleteMany({ userId }), LeaveRequest.deleteMany({ userId }), LeaveAttachment.deleteMany({ userId }),
    WaitlistEntry.deleteMany({ userId }), Review.deleteMany({ userId }),
    User.deleteMany({ _id: { $in: staffIds } }),
    pushSubscriptions().deleteMany({ accountId: { $in: [ownerId, ...staffIds] } }),
    // Kept for accounting, without the people in them
    Deposit.updateMany({ userId }, { $set: { clientName: '' }, $unset: { clientEmail: 1 } }),
    Transaction.updateMany({ userId }, { $unset: { 'satim.cardholderName': 1, metadata: 1 } }),
    MarketOrder.updateMany({ salonId: ownerId }, {
      $set: { salonName: DELETED, 'shipTo.name': DELETED, 'shipTo.contact': '', 'shipTo.phone': '', 'shipTo.address': '' },
      $pull: { messages: { from: 'salon' } },
    }),
    removeLocalFiles(String(ownerId)),
  ]);
}

async function purgeSupplier(userId: Types.ObjectId): Promise<void> {
  const supplier = await Supplier.findOne({ userId }).select('_id').lean();
  if (!supplier) return;
  await Promise.all([
    SupplierProduct.deleteMany({ supplierId: supplier._id }),
    MarketOrder.updateMany({ supplierId: supplier._id }, { $set: { supplierName: DELETED }, $pull: { messages: { from: 'supplier' } } }),
    pushSubscriptions().deleteMany({ accountId: userId }),
    removeLocalFiles(String(supplier._id), ['suppliers']),
  ]);
  await Supplier.deleteOne({ _id: supplier._id });
}

/** Daily: accounts whose deletion was asked PURGE_AFTER_DAYS ago are erased. */
export async function purgeDueAccounts(now = new Date()): Promise<number> {
  const due = await User.find({ isActive: false, deletionRequestedAt: { $lte: new Date(now.getTime() - PURGE_AFTER_DAYS * DAY_MS) } }).select('_id role').lean();
  for (const u of due) {
    try {
      if (u.role === UserRole.SUPPLIER) await purgeSupplier(u._id as any);
      else await purgeSalon(u._id as any);
      await User.deleteOne({ _id: u._id });
      logger.info(`Account purged: ${u._id}`);
    } catch (e) {
      logger.error(`Account purge failed: ${u._id}`, e);
    }
  }
  return due.length;
}

let started = false;
export function startAccountDeletionCron() {
  if (started) return;
  started = true;
  cron.schedule('30 3 * * *', () => { purgeDueAccounts().catch((e) => logger.error('Account purge error:', e)); }, { timezone: 'Africa/Algiers' });
}
