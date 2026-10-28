import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { BanknotesIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import { Badge, EmptyState, PageHeader, Panel, Segmented, StatGroup } from '../../../components/ui';
import { Ledger, OrderRow, PayoutInfo, supplierAPI } from '../api';
import { Notice, Spinner, labelClass, money, ribError, useDates } from '../shared';
import { useSupplier } from './SupplierLayout';

type Data = { balance: Ledger; payouts: { id: string; amount: number; paidAt: string; reference?: string; method?: string }[]; settled: OrderRow[]; payoutInfo: PayoutInfo | null };

/** Bank details: same rules as the salon deposit payouts (CCP RIP or bank RIB, 20 digits). */
function PayoutForm({ initial, onSaved }: { initial: PayoutInfo | null; onSaved: () => void }) {
  const { t } = useTranslation('marketplace');
  const [form, setForm] = useState<PayoutInfo>(initial || { legalName: '', method: 'bank', rib: '' });
  const [touched, setTouched] = useState(false);
  const [state, setState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const rib = form.rib.replace(/\D/g, '');
  const err = ribError(form.method, rib);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (err || !form.legalName.trim()) return;
    setState('saving');
    try {
      await supplierAPI.savePayout({ legalName: form.legalName.trim(), method: form.method, rib });
      setState('saved');
      onSaved();
    } catch {
      setState('error');
    }
  };
  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label htmlFor="legalName" className={labelClass}>{t('payments.legal_name')}</label>
        <input id="legalName" maxLength={120} value={form.legalName} onChange={(e) => { setForm({ ...form, legalName: e.target.value }); setState('idle'); }} className="field sm:max-w-sm" />
      </div>
      <div>
        <p className={labelClass}>{t('payments.method')}</p>
        <Segmented value={form.method} onChange={(m) => { setForm({ ...form, method: m }); setState('idle'); }}
          options={[{ value: 'bank', label: t('payments.method_bank') }, { value: 'ccp', label: t('payments.method_ccp') }]} />
      </div>
      <div>
        <label htmlFor="rib" className={labelClass}>{form.method === 'ccp' ? t('payments.rip') : t('payments.rib')}</label>
        <input id="rib" inputMode="numeric" autoComplete="off" maxLength={26} value={form.rib} aria-invalid={touched && !!err}
          onChange={(e) => { setForm({ ...form, rib: e.target.value.replace(/[^\d ]/g, '') }); setState('idle'); }}
          className="field font-mono tabular-nums sm:max-w-sm" placeholder={form.method === 'ccp' ? '00799999 0012345678 12' : '001 00123 0012345678 90'} />
        <p className={`mt-1 text-xs ${touched && err ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'}`}>
          {touched && err ? t(`payments.${err}`) : t('payments.rib_help')}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <button type="submit" className="btn-primary" disabled={state === 'saving'}>{t('common.save')}</button>
        {state === 'saved' && <span className="text-sm text-emerald-700 dark:text-emerald-400" role="status">{t('payments.saved')}</span>}
        {state === 'error' && <span className="text-sm text-red-600 dark:text-red-400" role="alert">{t('payments.save_error')}</span>}
      </div>
    </form>
  );
}

const SupplierPayments: React.FC = () => {
  const { t } = useTranslation('marketplace');
  const { profile, reload } = useSupplier();
  const { day } = useDates();
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState(false);
  const load = () => supplierAPI.payments().then((r) => setData(r.data)).catch(() => setError(true));
  useEffect(() => { load(); }, []);

  return (
    <div className="py-6 sm:py-8">
      <PageHeader title={t('payments.title')} subtitle={t('payments.subtitle', { commission: profile.commissionPercent })} />
      {error && <Notice tone="red">{t('common.load_error')}</Notice>}
      {!data && !error && <Spinner />}
      {data && (
        <div className="space-y-6">
          <StatGroup className="!mb-0" items={[
            { label: t('balance.pending'), value: money(data.balance.pending), hint: t('balance.pending_hint') },
            { label: t('balance.available'), value: money(data.balance.available), accent: data.balance.available > 0, hint: t('balance.available_hint') },
            { label: t('balance.paid_out'), value: money(data.balance.paidOut) },
            { label: t('balance.commission'), value: money(data.balance.commission), hint: t('balance.commission_hint', { percent: profile.commissionPercent }) },
          ]} />

          <Panel title={t('payments.payout_title')} description={t('payments.payout_description')}>
            {!data.payoutInfo && <div className="mb-4"><Notice>{t('payments.rib_missing')}</Notice></div>}
            <PayoutForm initial={data.payoutInfo} onSaved={() => { load(); reload(); }} />
          </Panel>

          <Panel flush title={t('payments.history')}>
            {data.payouts.length === 0 ? (
              <EmptyState icon={BanknotesIcon} title={t('payments.no_payouts')} body={t('payments.no_payouts_body')} />
            ) : (
              <ul className="divide-y divide-gray-100 border-t border-gray-100 dark:divide-gray-800 dark:border-gray-800">
                {data.payouts.map((p) => (
                  <li key={p.id} className="flex items-center justify-between gap-4 px-5 py-3">
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 dark:text-gray-50">{day(p.paidAt)}</p>
                      <p className="truncate text-sm text-gray-500 dark:text-gray-400">{[p.method === 'ccp' ? 'CCP' : p.method === 'bank' ? t('payments.method_bank') : '', p.reference].filter(Boolean).join(' · ')}</p>
                    </div>
                    <span className="font-display font-semibold tabular-nums text-gray-900 dark:text-gray-50">{money(p.amount)}</span>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel flush title={t('payments.invoices')} description={t('payments.invoices_description')}>
            {data.settled.length === 0 ? (
              <EmptyState icon={DocumentTextIcon} title={t('payments.no_invoices')} />
            ) : (
              <ul className="divide-y divide-gray-100 border-t border-gray-100 dark:divide-gray-800 dark:border-gray-800">
                {data.settled.map((o) => {
                  const kept = o.total - (o.status === 'partially_refunded' ? o.refundAmount : 0);
                  return (
                    <li key={o.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-5 py-3">
                      <div className="min-w-0 flex-1 basis-56">
                        <div className="flex flex-wrap items-center gap-2">
                          <Link to={`/fournisseur/commandes/${o.id}`} className="font-medium text-gray-900 hover:text-orange-700 dark:text-gray-50">{o.number} · {o.salonName}</Link>
                          {o.paidOut ? <Badge tone="green">{t('payments.paid_out_badge')}</Badge> : <Badge tone="orange">{t('payments.available_badge')}</Badge>}
                        </div>
                        <p className="text-sm tabular-nums text-gray-500 dark:text-gray-400">{t('payments.invoice_line', { total: money(kept), commission: money(o.commission || 0), net: money(kept - (o.commission || 0)) })}</p>
                      </div>
                      <Link to={`/fournisseur/factures/${o.id}`} target="_blank" className="btn-ghost"><DocumentTextIcon className="size-4" />{t('order.invoice')}</Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </Panel>
        </div>
      )}
    </div>
  );
};

export default SupplierPayments;
