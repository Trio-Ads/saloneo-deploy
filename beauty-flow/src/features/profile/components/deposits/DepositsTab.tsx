import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { format, parseISO } from 'date-fns';
import { BanknotesIcon, CheckIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { depositsAPI } from '../../../../services/api';
import { Badge, BadgeTone, EmptyState, Panel, Segmented, StatGroup } from '../../../../components/ui';
import { formatPrice } from '../../../../utils/currency';
import { dateLocale } from '../../../dashboard/dateLocale';

type Method = 'ccp' | 'bank';
interface PayoutInfo { legalName: string; method: Method; rib: string; updatedAt?: string }
interface DepositRow {
  id: string; createdAt: string; appointment?: { date: string; startTime: string };
  clientName: string; serviceName: string; amount: number; commission: number; status: string; orderNumber?: string;
}
interface DepositsData {
  depositsEnabled?: boolean;
  summary: { pending: number; earned: number; commission: number; paidOut: number; available: number; refundPending: number };
  commissionPercent: number;
  deposits: DepositRow[];
  payouts: { id: string; amount: number; paidAt: string; reference?: string; method?: Method }[];
  payoutInfo: PayoutInfo | null;
}

const TONES: Record<string, BadgeTone> = {
  paid: 'blue', refund_pending: 'amber', refunded: 'neutral', retained: 'orange', applied: 'green', paid_out: 'green',
};
const labelClass = 'mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300';
/** Same check as the API: 20 digits; a CCP RIP starts with 007 99999. */
const ribError = (method: Method, rib: string) =>
  !/^\d{20}$/.test(rib) ? 'rib_length' : method === 'ccp' && !rib.startsWith('00799999') ? 'rib_ccp' : null;

/**
 * Profil → Acomptes: deposits paid online are collected by Saloneo (SATIM) and paid out to the salon.
 * Balance, payout details, every deposit with its status, and the transfers received.
 */
const DepositsTab: React.FC = () => {
  const { t, i18n } = useTranslation('profile');
  const [data, setData] = useState<DepositsData | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [form, setForm] = useState<PayoutInfo>({ legalName: '', method: 'ccp', rib: '' });
  const [touched, setTouched] = useState(false);
  const [save, setSave] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  useEffect(() => {
    depositsAPI.get()
      .then(({ data }) => {
        setData(data);
        if (data.payoutInfo) setForm({ legalName: data.payoutInfo.legalName, method: data.payoutInfo.method, rib: data.payoutInfo.rib });
      })
      .catch(() => setLoadError(true));
  }, []);

  if (loadError) return <Panel><p className="text-sm text-red-600 dark:text-red-400">{t('deposits.load_error')}</p></Panel>;
  if (!data) {
    return <Panel><div className="flex justify-center py-8"><span className="size-6 animate-spin rounded-full border-2 border-gray-200 border-t-orange-500" /></div></Panel>;
  }

  const loc = dateLocale(i18n.language);
  const money = (n: number) => formatPrice(n, 'DZD');
  const rib = form.rib.replace(/\D/g, '');
  const err = ribError(form.method, rib);
  const nameMissing = !form.legalName.trim();
  const saved = data.payoutInfo;
  const dirty = !saved || saved.legalName !== form.legalName.trim() || saved.method !== form.method || saved.rib !== rib;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (err || nameMissing) return;
    setSave('saving');
    try {
      const { data: res } = await depositsAPI.savePayoutInfo({ legalName: form.legalName.trim(), method: form.method, rib });
      setData((d) => d && { ...d, payoutInfo: res.payoutInfo });
      setForm((f) => ({ ...f, legalName: res.payoutInfo.legalName, rib: res.payoutInfo.rib }));
      setSave('saved');
    } catch {
      setSave('error');
    }
  };

  const s = data.summary;
  return (
    <div className="space-y-6">
      <StatGroup
        className="!mb-0"
        items={[
          { label: t('deposits.available'), value: money(s.available), accent: true, hint: t('deposits.available_hint') },
          { label: t('deposits.pending'), value: money(s.pending), hint: t('deposits.pending_hint') },
          { label: t('deposits.paid_out'), value: money(s.paidOut) },
          data.commissionPercent > 0 || s.commission > 0
            ? { label: t('deposits.commission'), value: money(s.commission), hint: t('deposits.commission_hint', { percent: data.commissionPercent }) }
            : { label: t('deposits.earned'), value: money(s.earned) },
        ]}
      />
      {data.depositsEnabled === false && (
        <p className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300" role="status">{t('deposits.coming_soon')}</p>
      )}
      <p className="text-sm text-gray-500 dark:text-gray-400">{t('deposits.how_it_works')}</p>

      <Panel title={t('deposits.payout_title')} description={t('deposits.payout_description')}>
        {!saved && (
          <div className="mb-4 flex items-start gap-3 rounded-xl bg-amber-50 px-3.5 py-3 text-sm text-amber-800 dark:bg-amber-500/10 dark:text-amber-300" role="status">
            <ExclamationTriangleIcon className="size-5 shrink-0" />
            <p>{t('deposits.payout_missing')}</p>
          </div>
        )}
        <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2" noValidate>
          <div className="sm:col-span-2">
            <label htmlFor="payoutName" className={labelClass}>{t('deposits.legal_name')}</label>
            <input id="payoutName" type="text" maxLength={120} autoComplete="organization" value={form.legalName}
              onChange={(e) => { setForm((f) => ({ ...f, legalName: e.target.value })); setSave('idle'); }}
              aria-invalid={touched && nameMissing} className="field" placeholder={t('deposits.legal_name_placeholder')} />
            {touched && nameMissing && <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">{t('deposits.legal_name_required')}</p>}
          </div>
          <div className="sm:col-span-2">
            <span className={labelClass}>{t('deposits.method')}</span>
            <Segmented<Method>
              value={form.method}
              onChange={(method) => { setForm((f) => ({ ...f, method })); setSave('idle'); }}
              options={[{ value: 'ccp', label: t('deposits.method_ccp') }, { value: 'bank', label: t('deposits.method_bank') }]}
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="payoutRib" className={labelClass}>{form.method === 'ccp' ? t('deposits.rip') : t('deposits.rib')}</label>
            <input id="payoutRib" type="text" inputMode="numeric" autoComplete="off" maxLength={26} value={form.rib}
              onChange={(e) => { setForm((f) => ({ ...f, rib: e.target.value.replace(/[^\d ]/g, '') })); setSave('idle'); }}
              aria-invalid={touched && !!err} aria-describedby="payoutRibHelp" className="field font-mono tabular-nums sm:max-w-sm"
              placeholder={form.method === 'ccp' ? '00799999 0012345678 12' : '001 00123 0012345678 90'} />
            <p id="payoutRibHelp" className={`mt-1.5 text-xs ${touched && err ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'}`}>
              {touched && err ? t(`deposits.${err}`) : t(form.method === 'ccp' ? 'deposits.rip_help' : 'deposits.rib_help')}
            </p>
          </div>
          <div className="flex flex-col-reverse items-stretch gap-3 border-t border-gray-100 pt-4 sm:col-span-2 sm:flex-row sm:items-center sm:justify-end dark:border-gray-800">
            {save === 'saved' && !dirty && (
              <p className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400" role="status"><CheckIcon className="size-4" />{t('deposits.saved')}</p>
            )}
            {save === 'error' && <p className="text-sm text-red-600 dark:text-red-400" role="alert">{t('deposits.save_error')}</p>}
            <button type="submit" className="btn-primary" disabled={save === 'saving' || !dirty}>
              {save === 'saving' && <span className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />}
              {t('deposits.save')}
            </button>
          </div>
        </form>
      </Panel>

      <Panel flush title={t('deposits.list_title')} description={t('deposits.list_description')}>
        {data.deposits.length === 0 ? (
          <EmptyState icon={BanknotesIcon} title={t('deposits.empty')} body={t('deposits.empty_body')} />
        ) : (
          <ul className="divide-y divide-gray-100 border-t border-gray-100 dark:divide-gray-800 dark:border-gray-800">
            {data.deposits.map((d) => (
              <li key={d.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-5 py-3">
                <div className="min-w-0 flex-1 basis-56">
                  <p className="truncate font-medium text-gray-900 dark:text-gray-50">{d.clientName || '—'}</p>
                  <p className="truncate text-sm text-gray-500 dark:text-gray-400">
                    {d.serviceName}
                    {d.appointment && <> · <span className="first-letter:uppercase">{format(parseISO(d.appointment.date), 'EEE d MMM', { locale: loc })}</span> {d.appointment.startTime}</>}
                  </p>
                </div>
                <Badge tone={TONES[d.status] || 'neutral'}>{t(`deposits.status.${d.status}`)}</Badge>
                <span className="w-24 text-end text-sm font-medium tabular-nums text-gray-900 dark:text-gray-50">{money(d.amount)}</span>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <Panel flush title={t('deposits.payouts_title')}>
        {data.payouts.length === 0 ? (
          <p className="border-t border-gray-100 px-5 py-4 text-sm text-gray-500 dark:border-gray-800 dark:text-gray-400">{t('deposits.payouts_empty')}</p>
        ) : (
          <ul className="divide-y divide-gray-100 border-t border-gray-100 dark:divide-gray-800 dark:border-gray-800">
            {data.payouts.map((p) => (
              <li key={p.id} className="flex items-center gap-4 px-5 py-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium tabular-nums text-gray-900 dark:text-gray-50">{format(new Date(p.paidAt), 'd MMMM yyyy', { locale: loc })}</p>
                  {p.reference && <p className="truncate text-sm text-gray-500 dark:text-gray-400">{t('deposits.reference', { ref: p.reference })}</p>}
                </div>
                <span className="text-sm font-medium tabular-nums text-gray-900 dark:text-gray-50">{money(p.amount)}</span>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
};

export default DepositsTab;
