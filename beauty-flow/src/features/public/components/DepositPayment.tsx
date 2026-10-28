import React from 'react';
import { useTranslation } from 'react-i18next';
import { format, parseISO, subHours } from 'date-fns';
import { LockClosedIcon } from '@heroicons/react/24/outline';
import { formatPrice } from '../../../utils/currency';
import { BookingPolicy } from '../types';
import { dateLocale } from './bookingTheme';

/** Minutes the slot stays held while the client pays (server: HOLD_MINUTES in services/deposits.ts). */
export const HOLD_MINUTES = 15;

/** Card networks accepted through SATIM (required on every payment screen). */
export function PaymentBrands({ className = '' }: { className?: string }) {
  const [edahabiaLogo, setEdahabiaLogo] = React.useState(true);
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <img src="/images/cib-logo.webp" alt="CIB" className="h-6 w-auto" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
      {edahabiaLogo
        ? <img src="/images/edahabia-logo.webp" alt="Edahabia" className="h-6 w-auto" onError={() => setEdahabiaLogo(false)} />
        : <span className="text-xs font-semibold tracking-tight">Edahabia</span>}
    </span>
  );
}

/** "Paiement sécurisé par SATIM" + accepted cards + SATIM support number. */
export function SatimNotice() {
  const { t } = useTranslation('public');
  return (
    <div className="bk-card flex items-start gap-3 p-4">
      <LockClosedIcon className="h-5 w-5 shrink-0 bk-muted mt-0.5" />
      <div className="min-w-0 flex-1">
        <p className="font-medium">{t('deposit.secure')}</p>
        <p className="bk-muted text-sm">{t('deposit.cards')}</p>
        <p className="bk-muted text-xs mt-1">{t('deposit.support')}</p>
      </div>
      <PaymentBrands className="shrink-0" />
    </div>
  );
}

/**
 * The salon's cancellation rules in plain sentences. With a slot (date + time) the free-cancellation
 * deadline is shown as a date; `deposit` switches between the deposit and the no-deposit wording.
 */
export function CancellationPolicy({ policy, deposit, date, time, compact }: {
  policy?: BookingPolicy;
  deposit: boolean;
  date?: string;
  time?: string;
  compact?: boolean;
}) {
  const { t, i18n } = useTranslation('public');
  if (!policy) return null;
  const hours = policy.freeCancellationHours;
  const deadline = date && time ? subHours(parseISO(`${date}T${time}`), hours) : null;
  const lines = !policy.allowCancellation
    ? [t('deposit.policy.no_online_cancel')]
    : [
        deadline && deadline > new Date()
          ? t(deposit ? 'deposit.policy.free_until' : 'deposit.policy.free_until_no_deposit', {
              date: format(deadline, 'EEEE d MMMM', { locale: dateLocale(i18n.language) }),
              time: format(deadline, 'HH:mm'),
            })
          : t(deposit ? 'deposit.policy.free_hours' : 'deposit.policy.free_hours_no_deposit', { count: hours }),
        t(deposit ? 'deposit.policy.late' : 'deposit.policy.late_no_deposit'),
        policy.lateReschedule ? t(deposit ? 'deposit.policy.reschedule_once' : 'deposit.policy.reschedule_once_no_deposit') : '',
      ].filter(Boolean);

  if (compact) {
    return <p className="bk-muted text-sm">{lines[0]}</p>;
  }
  return (
    <section className="bk-card p-4 space-y-2" aria-labelledby="bk-policy-title">
      <h3 id="bk-policy-title" className="font-medium">{t('deposit.policy.title')}</h3>
      <ul className="bk-muted text-sm space-y-1.5 list-disc ps-4">
        {lines.map((l) => <li key={l}>{l}</li>)}
      </ul>
      {policy.policyText && (
        <p className="text-sm pt-2" style={{ borderTop: '1px solid var(--bk-border)' }}>
          <span className="bk-muted">{t('deposit.policy.salon_note')} · </span>{policy.policyText}
        </p>
      )}
    </section>
  );
}

/** Booking step "Acompte" (inside the `.bk` sheet): what is paid now, what is left, the rules, SATIM. */
const DepositPayment: React.FC<{
  price: number;
  amount: number;
  currency: string;
  policy?: BookingPolicy;
  date?: string;
  time?: string;
}> = ({ price, amount, currency, policy, date, time }) => {
  const { t } = useTranslation('public');
  return (
    <div className="space-y-4">
      <p className="bk-muted text-sm">{t('deposit.subtitle', { minutes: HOLD_MINUTES })}</p>

      <div className="bk-card">
        <div className="bk-row"><span>{t('deposit.service_price')}</span><span className="bk-num">{formatPrice(price, currency)}</span></div>
        <div className="bk-row items-center">
          <span>{t('deposit.pay_now')}</span>
          <span className="bk-num text-xl font-semibold">{formatPrice(amount, currency)}</span>
        </div>
        <div className="bk-row"><span>{t('deposit.remaining')}</span><span className="bk-num">{formatPrice(Math.max(0, price - amount), currency)}</span></div>
      </div>

      <CancellationPolicy policy={policy} deposit date={date} time={time} />
      <SatimNotice />
    </div>
  );
};

export default DepositPayment;
