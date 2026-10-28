import { Request, Response } from 'express';
import { Deposit, DepositEvent, DepositSettings } from '../models/Deposit';
import { User } from '../models/User';
import { AuthRequest } from '../middleware/auth';
import { findSalonBySlug } from '../services/salonLookup';
import { logger } from '../utils/logger';
import {
  adminBalances, adminBalancesCsv, commissionPercent, depositsEnabled, markRefundedManually, publicDepositView, recordPayout, refundDeposit,
  retryPayment, salonDepositsView, sendDepositError, syncPayment, validRib,
} from '../services/deposits';
import { Payout } from '../models/Deposit';

const fail = (res: Response, error: unknown, what: string) => {
  if (sendDepositError(res, error)) return;
  logger.error(`${what} error:`, error);
  res.status(500).json({ error: 'Server error' });
};

/* ── public (SATIM return page) ──────────────────────────────── */

/** The deposit must belong to the salon of the slug in the return URL. */
async function depositOfSlug(id: string, slug: unknown) {
  if (typeof slug !== 'string' || !slug) return null;
  const salon: any = await findSalonBySlug(slug, 'establishmentName slug address publicPhone theme settings bookingSettings');
  if (!salon) return null;
  const dep: any = await Deposit.findOne({ _id: String(id), userId: salon._id }).select('_id').lean();
  return dep ? { id: String(dep._id), salon: { ...salon.toObject(), slug: salon.slug || slug } } : null;
}

// POST /public/deposits/:id/confirm { slug } — asks SATIM (never trusts the URL), idempotent
export const confirmDeposit = async (req: Request, res: Response): Promise<void> => {
  try {
    const found = await depositOfSlug(req.params.id, req.body?.slug);
    if (!found) { res.status(404).json({ error: 'Acompte introuvable', code: 'NOT_FOUND' }); return; }
    const dep = await syncPayment(found.id, 'return');
    res.json({ deposit: await publicDepositView(dep!, found.salon) });
  } catch (error) {
    fail(res, error, 'Confirm deposit');
  }
};

// POST /public/deposits/:id/retry { slug, lang } — new SATIM order while the hold lasts
export const retryDeposit = async (req: Request, res: Response): Promise<void> => {
  try {
    const found = await depositOfSlug(req.params.id, req.body?.slug);
    if (!found) { res.status(404).json({ error: 'Acompte introuvable', code: 'NOT_FOUND' }); return; }
    res.json({ formUrl: await retryPayment(found.id, found.salon.slug, String(req.body?.lang || '').slice(0, 2)) });
  } catch (error) {
    fail(res, error, 'Retry deposit');
  }
};

/* ── salon ───────────────────────────────────────────────────── */

// GET /deposits — balance, deposits, payouts, payout details
export const getSalonDeposits = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    res.json(await salonDepositsView(req.userId!));
  } catch (error) {
    fail(res, error, 'Get salon deposits');
  }
};

// PUT /deposits/payout-info { legalName, method: 'ccp'|'bank', rib }
export const updatePayoutInfo = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const legalName = String(req.body?.legalName || '').trim().slice(0, 120);
    const method = req.body?.method;
    const rib = String(req.body?.rib || '').replace(/\D/g, '');
    if (!legalName || (method !== 'ccp' && method !== 'bank') || !validRib(method, rib)) {
      res.status(400).json({ error: 'Coordonnées de versement invalides', code: 'INVALID_PAYOUT_INFO' });
      return;
    }
    const payout = { legalName, method, rib, updatedAt: new Date() };
    await User.updateOne({ _id: req.userId }, { $set: { payout } });
    res.json({ payoutInfo: payout });
  } catch (error) {
    fail(res, error, 'Update payout info');
  }
};

/* ── admin ───────────────────────────────────────────────────── */

export const getBalances = async (_req: Request, res: Response): Promise<void> => {
  try {
    const [balances, refunds, pct]: any[] = await Promise.all([
      adminBalances(),
      Deposit.find({ status: 'refund_pending' }).sort({ updatedAt: -1 }).limit(100).lean(),
      commissionPercent(),
    ]);
    const salons: any[] = await User.find({ _id: { $in: refunds.map((d: any) => d.userId) } }).select('establishmentName').lean();
    const name = new Map(salons.map((s) => [String(s._id), s.establishmentName]));
    res.json({
      depositsEnabled: depositsEnabled(),
      balances,
      commissionPercent: pct,
      refunds: refunds.map((d: any) => ({
        id: d._id, salonName: name.get(String(d.userId)), clientName: d.clientName, amount: d.amount,
        orderNumber: d.satim?.orderNumber, error: d.refundError, updatedAt: d.updatedAt,
      })),
    });
  } catch (error) {
    fail(res, error, 'Get deposit balances');
  }
};

export const exportBalancesCsv = async (_req: Request, res: Response): Promise<void> => {
  try {
    const csv = await adminBalancesCsv();
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="saloneo-virements-acomptes-${new Date().toISOString().slice(0, 10)}.csv"`);
    res.send(csv);
  } catch (error) {
    fail(res, error, 'Export deposit balances');
  }
};

// POST /admin/deposits/payouts { userId, amount, paidAt, reference }
export const createPayout = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId, amount, paidAt, reference } = req.body || {};
    const payout = await recordPayout(String(userId), Number(amount), new Date(paidAt || Date.now()), String(reference || ''), (req.user as any)?.id);
    res.status(201).json({ success: true, payout });
  } catch (error) {
    fail(res, error, 'Create payout');
  }
};

export const listPayouts = async (req: Request, res: Response): Promise<void> => {
  try {
    const filter = req.query.userId ? { userId: String(req.query.userId) } : {};
    res.json({ payouts: await Payout.find(filter).sort({ paidAt: -1 }).limit(200).lean() });
  } catch (error) {
    fail(res, error, 'List payouts');
  }
};

// POST /admin/deposits/:id/refund — retry a failed SATIM refund
export const retryRefund = async (req: Request, res: Response): Promise<void> => {
  try {
    const dep: any = await Deposit.findById(req.params.id).select('status').lean();
    if (!dep || dep.status !== 'refund_pending') { res.status(409).json({ error: 'Aucun remboursement en attente', code: 'NOT_RETRYABLE' }); return; }
    const after = await refundDeposit(req.params.id, 'admin', 'Nouvelle tentative de remboursement');
    res.json({ success: after?.status === 'refunded', status: after?.status, error: after?.refundError });
  } catch (error) {
    fail(res, error, 'Retry refund');
  }
};

// POST /admin/deposits/:id/mark-refunded { note } — refunded by other means
export const markRefunded = async (req: Request, res: Response): Promise<void> => {
  try {
    const after = await markRefundedManually(req.params.id, String(req.body?.note || '').slice(0, 200));
    if (!after) { res.status(409).json({ error: 'Aucun remboursement en attente', code: 'NOT_RETRYABLE' }); return; }
    res.json({ success: true, status: after.status });
  } catch (error) {
    fail(res, error, 'Mark refunded');
  }
};

// GET /admin/deposits/:id/events — audit trail
export const depositEvents = async (req: Request, res: Response): Promise<void> => {
  try {
    res.json({ events: await DepositEvent.find({ depositId: req.params.id }).sort({ at: 1 }).lean() });
  } catch (error) {
    fail(res, error, 'Deposit events');
  }
};

// PUT /admin/deposits/settings { commissionPercent } — applies to deposits settled from now on
export const updateDepositSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    const pct = Number(req.body?.commissionPercent);
    if (!Number.isFinite(pct) || pct < 0 || pct > 100) { res.status(400).json({ error: 'Commission invalide' }); return; }
    const value = Math.round(pct * 10) / 10;
    await DepositSettings.updateOne({ _id: 'deposits' }, { $set: { commissionPercent: value } }, { upsert: true });
    res.json({ commissionPercent: value });
  } catch (error) {
    fail(res, error, 'Update deposit settings');
  }
};
