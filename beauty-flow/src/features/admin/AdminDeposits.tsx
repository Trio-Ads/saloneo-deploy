import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { ArrowDownTrayIcon, ArrowPathIcon, BanknotesIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { depositsAPI } from '../../services/api';
import { Badge, EmptyState, IconButton, Panel, StatGroup } from '../../components/ui';
import { formatPrice } from '../../utils/currency';
import { dateLocale } from '../dashboard/dateLocale';

interface Balance {
  userId: string; establishmentName: string; email: string;
  payout: { legalName?: string; method?: 'ccp' | 'bank'; rib?: string } | null;
  pending: number; available: number; paidOut: number; refundPending: number; lastPayoutAt: string | null;
}
interface Refund { id: string; salonName?: string; clientName: string; amount: number; orderNumber?: string; error?: string; updatedAt: string }

const labelClass = 'mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300';
const money = (n: number) => formatPrice(n, 'DZD');

/** Record one transfer to a salon (amount prefilled with its available balance). */
function PayoutModal({ salon, onClose, onDone }: { salon: Balance; onClose: () => void; onDone: () => void }) {
  const { t } = useTranslation('admin');
  const [amount, setAmount] = useState(String(salon.available));
  const [paidAt, setPaidAt] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [reference, setReference] = useState('');
  const [state, setState] = useState<'idle' | 'saving'>('idle');
  const [error, setError] = useState<string | null>(null);
  const value = Number(amount);
  const invalid = !(value > 0) || value > salon.available;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (invalid) return;
    setState('saving');
    setError(null);
    try {
      await depositsAPI.adminPayout({ userId: salon.userId, amount: value, paidAt, reference: reference.trim() });
      onDone();
    } catch (err: any) {
      setError(err?.response?.data?.code === 'PAYOUT_EXCEEDS_BALANCE' ? t('deposits.exceeds') : t('deposits.payout_error'));
      setState('idle');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center overflow-y-auto bg-gray-900/50 sm:items-center sm:p-4" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-labelledby="payout-title" onClick={(e) => e.stopPropagation()}
        className="animate-modal-in sheet-on-mobile w-full overflow-hidden rounded-t-2xl border border-gray-200 bg-white shadow-xl dark:border-gray-800 dark:bg-gray-900 sm:max-w-lg sm:rounded-2xl">
        <form onSubmit={submit}>
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 dark:border-gray-800">
            <div className="min-w-0">
              <h3 id="payout-title" className="text-base font-semibold text-gray-900 dark:text-gray-50">{t('deposits.payout_modal_title')}</h3>
              <p className="truncate text-sm text-gray-500 dark:text-gray-400">{salon.establishmentName} · {t('deposits.available_amount', { amount: money(salon.available) })}</p>
            </div>
            <IconButton label={t('edit_modal.cancel')} onClick={onClose}><XMarkIcon className="size-5" /></IconButton>
          </div>
          <div className="space-y-4 px-5 py-5">
            <dl className="divide-y divide-gray-100 rounded-xl border border-gray-100 text-sm dark:divide-gray-800 dark:border-gray-800">
              <div className="flex justify-between gap-4 px-3.5 py-2.5"><dt className="text-gray-500 dark:text-gray-400">{t('deposits.beneficiary')}</dt><dd className="text-end font-medium text-gray-900 dark:text-gray-50">{salon.payout?.legalName || '—'}</dd></div>
              <div className="flex justify-between gap-4 px-3.5 py-2.5">
                <dt className="text-gray-500 dark:text-gray-400">{salon.payout?.method === 'bank' ? t('deposits.rib') : t('deposits.rip')}</dt>
                <dd className="select-all font-mono text-end tabular-nums text-gray-900 dark:text-gray-50">{salon.payout?.rib || t('deposits.rib_missing')}</dd>
              </div>
            </dl>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="payout-amount" className={labelClass}>{t('deposits.amount')}</label>
                <input id="payout-amount" type="number" min={1} max={salon.available} step={1} inputMode="numeric" value={amount}
                  onChange={(e) => setAmount(e.target.value)} aria-invalid={invalid} className="field tabular-nums" />
              </div>
              <div>
                <label htmlFor="payout-date" className={labelClass}>{t('deposits.transfer_date')}</label>
                <input id="payout-date" type="date" value={paidAt} max={format(new Date(), 'yyyy-MM-dd')} onChange={(e) => setPaidAt(e.target.value)} className="field" />
              </div>
            </div>
            <div>
              <label htmlFor="payout-ref" className={labelClass}>{t('deposits.reference')}</label>
              <input id="payout-ref" type="text" maxLength={120} value={reference} onChange={(e) => setReference(e.target.value)} className="field"
                placeholder={t('deposits.reference_placeholder')} />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">{t('deposits.payout_email_note')}</p>
            {error && <p className="text-sm text-red-600 dark:text-red-400" role="alert">{error}</p>}
          </div>
          <div className="flex flex-col-reverse gap-2 border-t border-gray-100 px-5 py-4 dark:border-gray-800 sm:flex-row sm:justify-end">
            <button type="button" onClick={onClose} className="btn-secondary">{t('edit_modal.cancel')}</button>
            <button type="submit" className="btn-primary" disabled={invalid || state === 'saving'}>
              {state === 'saving' && <span className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />}
              {t('deposits.mark_paid')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/** Admin → Acomptes: what Saloneo owes each salon, the transfer file, payouts, failed refunds, commission. */
const AdminDeposits: React.FC = () => {
  const { t, i18n } = useTranslation('admin');
  const [balances, setBalances] = useState<Balance[] | null>(null);
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [commission, setCommission] = useState({ saved: 0, draft: '0' });
  const [paying, setPaying] = useState<Balance | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<{ tone: 'ok' | 'error'; text: string } | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [enabled, setEnabled] = useState(true);

  const load = useCallback(() => {
    depositsAPI.adminBalances()
      .then(({ data }) => {
        setBalances(data.balances);
        setEnabled(data.depositsEnabled !== false);
        setRefunds(data.refunds);
        setCommission({ saved: data.commissionPercent, draft: String(data.commissionPercent) });
      })
      .catch(() => setLoadError(true));
  }, []);
  useEffect(load, [load]);

  const exportCsv = async () => {
    setBusy('csv');
    try {
      const { data } = await depositsAPI.adminCsv();
      const url = URL.createObjectURL(data);
      Object.assign(document.createElement('a'), { href: url, download: `saloneo-virements-acomptes-${format(new Date(), 'yyyy-MM-dd')}.csv` }).click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } finally {
      setBusy(null);
    }
  };

  const saveCommission = async () => {
    setBusy('commission');
    try {
      const { data } = await depositsAPI.adminSettings(Number(commission.draft));
      setCommission({ saved: data.commissionPercent, draft: String(data.commissionPercent) });
      setMessage({ tone: 'ok', text: t('deposits.commission_saved') });
    } catch {
      setMessage({ tone: 'error', text: t('deposits.commission_error') });
    } finally {
      setBusy(null);
    }
  };

  const refundAction = async (r: Refund, action: 'retry' | 'mark') => {
    if (action === 'mark' && !window.confirm(t('deposits.mark_refunded_confirm', { amount: money(r.amount), client: r.clientName }))) return;
    setBusy(r.id);
    try {
      const { data } = action === 'retry' ? await depositsAPI.adminRetryRefund(r.id) : await depositsAPI.adminMarkRefunded(r.id, t('deposits.manual_note'));
      setMessage(data.status === 'refunded' ? { tone: 'ok', text: t('deposits.refund_done') } : { tone: 'error', text: t('deposits.refund_failed', { error: data.error || '' }) });
      load();
    } catch {
      setMessage({ tone: 'error', text: t('deposits.refund_failed', { error: '' }) });
    } finally {
      setBusy(null);
    }
  };

  if (loadError) return <Panel><p className="text-sm text-red-600 dark:text-red-400">{t('deposits.load_error')}</p></Panel>;
  if (!balances) {
    return <Panel><div className="flex justify-center py-14"><span className="size-6 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" /></div></Panel>;
  }

  const due = balances.filter((b) => b.available > 0);
  const total = due.reduce((s, b) => s + b.available, 0);
  const pending = balances.reduce((s, b) => s + b.pending, 0);
  const loc = dateLocale(i18n.language);
  const commissionDirty = commission.draft !== String(commission.saved);
  const commissionInvalid = !(Number(commission.draft) >= 0 && Number(commission.draft) <= 100) || commission.draft === '';

  return (
    <div className="space-y-6">
      <StatGroup
        className="!mb-0"
        items={[
          { label: t('deposits.total_due'), value: money(total), accent: true, hint: t('deposits.salons_count', { count: due.length }) },
          { label: t('deposits.pending'), value: money(pending), hint: t('deposits.pending_hint') },
          { label: t('deposits.refunds_to_handle'), value: refunds.length },
          { label: t('deposits.commission'), value: `${commission.saved} %` },
        ]}
      />

      {!enabled && (
        <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:bg-amber-500/10 dark:text-amber-300" role="status">{t('deposits.disabled_notice')}</p>
      )}

      {message && (
        <p className={`text-sm ${message.tone === 'ok' ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`} role="status">{message.text}</p>
      )}

      {refunds.length > 0 && (
        <Panel flush title={t('deposits.refunds_title')} description={t('deposits.refunds_description')}>
          <ul className="divide-y divide-gray-100 border-t border-gray-100 dark:divide-gray-800 dark:border-gray-800">
            {refunds.map((r) => (
              <li key={r.id} className="flex flex-col gap-3 px-5 py-3 sm:flex-row sm:items-center sm:gap-4">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-gray-900 dark:text-gray-50">{r.clientName} · {money(r.amount)}</p>
                  <p className="truncate text-sm text-gray-500 dark:text-gray-400">{[r.salonName, r.orderNumber, r.error].filter(Boolean).join(' · ')}</p>
                </div>
                <div className="flex gap-2">
                  <button type="button" className="btn-secondary" disabled={busy === r.id} onClick={() => refundAction(r, 'retry')}>
                    <ArrowPathIcon className="size-4" />{t('deposits.retry_refund')}
                  </button>
                  <button type="button" className="btn-ghost" disabled={busy === r.id} onClick={() => refundAction(r, 'mark')}>
                    <CheckIcon className="size-4" />{t('deposits.mark_refunded')}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </Panel>
      )}

      <Panel
        flush
        title={t('deposits.balances_title')}
        description={t('deposits.balances_description')}
        actions={
          <button type="button" className="btn-secondary" onClick={exportCsv} disabled={busy === 'csv' || due.length === 0}>
            <ArrowDownTrayIcon className="size-4" />
            <span className="hidden sm:inline">{t('deposits.export_csv')}</span>
            <span className="sm:hidden">CSV</span>
          </button>
        }
      >
        {balances.length === 0 ? (
          <EmptyState icon={BanknotesIcon} title={t('deposits.empty')} body={t('deposits.empty_body')} />
        ) : (
          <ul className="divide-y divide-gray-100 border-t border-gray-100 dark:divide-gray-800 dark:border-gray-800">
            {balances.map((b) => (
              <li key={b.userId} className="flex flex-col gap-3 px-5 py-3 sm:flex-row sm:items-center sm:gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate font-medium text-gray-900 dark:text-gray-50">{b.establishmentName}</p>
                    {!b.payout?.rib && <Badge tone="amber">{t('deposits.rib_missing')}</Badge>}
                    {b.refundPending > 0 && <Badge tone="red">{t('deposits.refund_pending_badge')}</Badge>}
                  </div>
                  <p className="truncate text-sm text-gray-500 dark:text-gray-400">
                    {[
                      b.payout?.rib && `${b.payout.method === 'ccp' ? 'CCP' : t('deposits.method_bank')} •••• ${b.payout.rib.slice(-4)}`,
                      t('deposits.pending_short', { amount: money(b.pending) }),
                      b.lastPayoutAt ? t('deposits.last_payout', { date: format(new Date(b.lastPayoutAt), 'd MMM yyyy', { locale: loc }) }) : null,
                    ].filter(Boolean).join(' · ')}
                  </p>
                </div>
                <div className="flex items-center justify-between gap-4 sm:justify-end">
                  <span className="font-display text-base font-semibold tabular-nums text-gray-900 dark:text-gray-50">{money(b.available)}</span>
                  <button type="button" className="btn-secondary" disabled={b.available <= 0} onClick={() => setPaying(b)}>
                    {t('deposits.record_payout')}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <Panel title={t('deposits.commission_title')} description={t('deposits.commission_description')}>
        <div className="flex flex-wrap items-center gap-3">
          <input type="number" min={0} max={100} step={0.5} inputMode="decimal" aria-label={t('deposits.commission')} value={commission.draft}
            onChange={(e) => setCommission((c) => ({ ...c, draft: e.target.value }))} className="field w-24 tabular-nums" aria-invalid={commissionInvalid} />
          <span className="text-sm text-gray-500 dark:text-gray-400">%</span>
          <button type="button" className="btn-primary" onClick={saveCommission} disabled={!commissionDirty || commissionInvalid || busy === 'commission'}>
            {t('deposits.save')}
          </button>
        </div>
      </Panel>

      {paying && (
        <PayoutModal salon={paying} onClose={() => setPaying(null)}
          onDone={() => { setPaying(null); setMessage({ tone: 'ok', text: t('deposits.payout_done', { salon: paying.establishmentName }) }); load(); }} />
      )}
    </div>
  );
};

export default AdminDeposits;
