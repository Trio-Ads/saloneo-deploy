import React, { useCallback, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { CheckCircleIcon, ClockIcon, ExclamationCircleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { publicAPI } from '../../../services/api';
import { formatPrice } from '../../../utils/currency';
import { salonTemplate } from '../../templates';
import { bookingVars, dateLocale } from './bookingTheme';
import { BookingConfirmation } from './BookingConfirmation';
import { CancellationPolicy, PaymentBrands } from './DepositPayment';

interface DepositView {
  id: string;
  status: 'pending' | 'paid' | 'failed' | 'expired' | 'refund_pending' | 'refunded' | 'retained' | 'applied';
  amount: number;
  orderNumber?: string;
  paidAt?: string;
  cardLast4?: string;
  approvalCode?: string;
  message?: string;
  holdExpiresAt: string;
  canRetry: boolean;
  appointment?: { date: string; startTime: string; duration: number; price: number; serviceName: string; stylistName?: string; modificationToken?: string };
  policy?: { allowCancellation: boolean; freeCancellationHours: number; lateReschedule: boolean; policyText: string };
  salon: { establishmentName?: string; slug: string; address?: string; publicPhone?: string; theme?: any; settings?: { currency?: string } };
}

const minutesLeft = (iso: string) => Math.max(0, Math.ceil((new Date(iso).getTime() - Date.now()) / 60000));

/**
 * /booking/payment-return?d=<depositId>&s=<slug> — where SATIM sends the client back (success or failure).
 * The server re-checks the order with SATIM; nothing in the URL is trusted. Themed with the salon's template.
 */
const DepositReturn: React.FC = () => {
  const [params] = useSearchParams();
  const id = params.get('d') || '';
  const slug = params.get('s') || '';
  const { t, i18n } = useTranslation('public');
  const [deposit, setDeposit] = useState<DepositView | null>(null);
  const [error, setError] = useState<'not_found' | 'verify' | null>(null);
  const [loading, setLoading] = useState(true);
  const [retrying, setRetrying] = useState(false);
  const [retryError, setRetryError] = useState<string | null>(null);
  const [, tick] = useState(0);

  const verify = useCallback(() => {
    if (!id || !slug) { setError('not_found'); setLoading(false); return; }
    setLoading(true);
    setError(null);
    publicAPI.confirmDeposit(id, slug)
      .then(({ data }) => setDeposit(data.deposit))
      .catch((err) => setError(err?.response?.status === 404 ? 'not_found' : 'verify'))
      .finally(() => setLoading(false));
  }, [id, slug]);

  useEffect(verify, [verify]);

  // Hold countdown while a retry is possible
  const waiting = deposit && (deposit.status === 'failed' || deposit.status === 'pending');
  useEffect(() => {
    if (!waiting) return;
    const timer = setInterval(() => tick((n) => n + 1), 15000);
    return () => clearInterval(timer);
  }, [waiting]);

  const retry = async () => {
    setRetrying(true);
    setRetryError(null);
    try {
      const { data } = await publicAPI.retryDeposit(id, slug, i18n.language);
      window.location.assign(data.formUrl);
    } catch (err: any) {
      setRetrying(false);
      const code = err?.response?.data?.code;
      if (code === 'HOLD_EXPIRED' || code === 'NOT_RETRYABLE') verify();
      else setRetryError(code === 'TOO_MANY_ATTEMPTS' ? t('deposit.return.too_many') : t('deposit.unavailable'));
    }
  };

  if (loading && !deposit) {
    return (
      <div className="min-h-screen grid place-items-center px-4 text-center" role="status">
        <div className="space-y-3">
          <span className="mx-auto block h-6 w-6 rounded-full border-2 border-gray-300 border-t-gray-600 animate-spin" />
          <p className="text-sm text-gray-600">{t('deposit.return.checking')}</p>
        </div>
      </div>
    );
  }

  const template = salonTemplate(deposit?.salon?.theme);
  const currency = deposit?.salon?.settings?.currency || 'DZD';
  const salonHref = `/salon/${deposit?.salon?.slug || slug}`;
  const loc = dateLocale(i18n.language);
  const left = deposit ? minutesLeft(deposit.holdExpiresAt) : 0;
  const status = deposit && waiting && left === 0 ? 'expired' : deposit?.status;

  const shell = (children: React.ReactNode) => (
    <div className="bk min-h-screen" style={{ ...bookingVars(template), background: 'var(--bk-bg)' }}>
      {template.fonts && <link rel="stylesheet" href={template.fonts} />}
      <div className="mx-auto max-w-lg px-4 pt-6 pb-[calc(2rem+env(safe-area-inset-bottom))] space-y-4">{children}</div>
    </div>
  );
  const header = (title: string) => (
    <header className="pb-2">
      {deposit?.salon?.establishmentName && <p className="bk-muted text-sm truncate">{deposit.salon.establishmentName}</p>}
      <h1 className="bk-h text-2xl">{title}</h1>
    </header>
  );
  const notice = (tone: 'success' | 'error' | 'info', text: React.ReactNode, Icon = tone === 'success' ? CheckCircleIcon : tone === 'error' ? ExclamationCircleIcon : ClockIcon) => (
    <div className={`bk-notice ${tone === 'info' ? '' : `is-${tone}`}`} role={tone === 'error' ? 'alert' : 'status'}
      style={tone === 'info' ? { background: 'var(--bk-surface)', boxShadow: 'inset 0 0 0 1px var(--bk-border)' } : undefined}>
      <Icon className="h-5 w-5 shrink-0" /><span>{text}</span>
    </div>
  );
  const salonLink = (label: string, primary = false) => <Link to={salonHref} className={`${primary ? 'bk-btn' : 'bk-btn-ghost'} w-full`}>{label}</Link>;
  const satimFooter = (
    <div className="bk-muted text-xs space-y-1 pt-2">
      <p>{t('deposit.return.disclaimer')}</p>
      <p>{t('deposit.support')}</p>
    </div>
  );

  if (!deposit) {
    return shell(
      <>
        {header(t('deposit.return.title_error'))}
        {notice('error', error === 'not_found' ? t('deposit.return.not_found') : t('deposit.return.verify_error'))}
        {error === 'verify' && (
          <button type="button" className="bk-btn w-full" onClick={verify} disabled={loading}>
            <ArrowPathIcon className="h-5 w-5" />{t('deposit.return.verify_again')}
          </button>
        )}
        {slug && salonLink(t('deposit.return.back_to_salon'))}
      </>
    );
  }

  const appt = deposit.appointment;
  const slotLine = appt && `${format(new Date(`${appt.date}T00:00`), 'EEEE d MMMM', { locale: loc })} · ${appt.startTime}`;

  if (status === 'paid' || status === 'retained' || status === 'applied') {
    const paidAt = deposit.paidAt ? new Date(deposit.paidAt) : null;
    // Receipt rows required by SATIM: order number, amount, date/time, card, authorization
    const rows: [string, React.ReactNode][] = [
      [t('deposit.return.order'), deposit.orderNumber],
      [t('deposit.return.date'), paidAt && format(paidAt, 'dd/MM/yyyy HH:mm')],
      [t('deposit.return.card'), deposit.cardLast4 && `•••• ${deposit.cardLast4}`],
      [t('deposit.return.authorization'), deposit.approvalCode],
    ];
    return shell(
      <>
        {header(t('deposit.return.title_paid'))}
        {notice('success', t('deposit.return.paid'))}
        {appt?.modificationToken && (
          <BookingConfirmation bookingInfo={{
            date: appt.date,
            time: appt.startTime,
            duration: appt.duration,
            serviceName: appt.serviceName,
            stylistName: appt.stylistName,
            priceLabel: formatPrice(appt.price, currency),
            salonName: deposit.salon.establishmentName,
            address: deposit.salon.address,
            modificationUrl: `${window.location.origin}/appointment/${appt.modificationToken}`,
          }} />
        )}
        <section className="bk-card" aria-labelledby="bk-receipt">
          <div className="flex items-center justify-between gap-3 px-5 pt-4 pb-2">
            <h2 id="bk-receipt" className="font-medium">{t('deposit.return.receipt')}</h2>
            <PaymentBrands />
          </div>
          {rows.filter(([, v]) => v).map(([label, value]) => (
            <div key={label} className="bk-row"><span>{label}</span><span className="bk-num">{value}</span></div>
          ))}
          <div className="bk-row items-center">
            <span>{t('deposit.return.amount')}</span>
            <span className="bk-num text-lg font-semibold">{formatPrice(deposit.amount, currency)}</span>
          </div>
          {appt && (
            <div className="bk-row"><span>{t('deposit.remaining')}</span><span className="bk-num">{formatPrice(Math.max(0, appt.price - deposit.amount), currency)}</span></div>
          )}
        </section>
        <CancellationPolicy policy={deposit.policy} deposit date={appt?.date} time={appt?.startTime} />
        {satimFooter}
      </>
    );
  }

  if (status === 'refund_pending' || status === 'refunded') {
    return shell(
      <>
        {header(t('deposit.return.title_refunded'))}
        {notice('info', t('deposit.return.refunded', { amount: formatPrice(deposit.amount, currency) }))}
        {salonLink(t('deposit.return.other_slot'), true)}
        {satimFooter}
      </>
    );
  }

  if (status === 'expired') {
    return shell(
      <>
        {header(t('deposit.return.title_expired'))}
        {notice('info', t('deposit.return.expired'))}
        {salonLink(t('deposit.return.other_slot'), true)}
        {satimFooter}
      </>
    );
  }

  // failed / pending: the slot is still held — explain, show the bank's message, offer a retry
  return shell(
    <>
      {header(t('deposit.return.title_failed'))}
      {notice('error', (
        <span>
          {t('deposit.return.failed')}
          {deposit.message && <span className="block mt-1 opacity-90">{t('deposit.return.satim_message', { message: deposit.message })}</span>}
        </span>
      ))}
      <div className="bk-card">
        {appt && <div className="bk-row"><span>{appt.serviceName}</span><span className="first-letter:uppercase">{slotLine}</span></div>}
        <div className="bk-row"><span>{t('deposit.pay_now')}</span><span className="bk-num font-semibold">{formatPrice(deposit.amount, currency)}</span></div>
        {deposit.orderNumber && <div className="bk-row"><span>{t('deposit.return.order')}</span><span className="bk-num">{deposit.orderNumber}</span></div>}
      </div>
      {deposit.canRetry && notice('info', t('deposit.return.hold_left', { count: left }))}
      {retryError && notice('error', retryError)}
      {deposit.canRetry && (
        <button type="button" className="bk-btn w-full" onClick={retry} disabled={retrying}>
          {retrying && <span className="bk-spinner" aria-hidden="true" />}
          {retrying ? t('deposit.redirecting') : t('deposit.return.retry')}
        </button>
      )}
      {salonLink(t('deposit.return.other_slot'))}
      <div className="flex items-center justify-between gap-3 pt-1">
        <p className="bk-muted text-sm">{t('deposit.secure')}</p>
        <PaymentBrands />
      </div>
      {satimFooter}
    </>
  );
};

export default DepositReturn;
