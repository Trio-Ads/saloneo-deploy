import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { ArrowLeftIcon, ExclamationCircleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { publicAPI } from '../../../services/api';
import { Badge, statusTone } from '../../../components/ui';
import { formatPrice } from '../../../utils/currency';
import DateTimeSelection from './DateTimeSelection';
import { availabilityCode } from '../../appointments/availability';
import { bookingVars, dateLocale, formatDuration } from './bookingTheme';
import { salonTemplate } from '../../templates';

export const PageSpinner = () => (
  <div className="min-h-screen grid place-items-center" role="status">
    <span className="h-6 w-6 rounded-full border-2 border-gray-300 border-t-gray-600 animate-spin" />
  </div>
);

const apiError = (err: any, fallback: string) => err?.response?.data?.error || fallback;
/** Salon-policy refusals the page explains itself (see policyView in the API) */
const POLICY_CODES = ['CANCELLATION_DISABLED', 'CANCELLATION_DEADLINE_PASSED', 'RESCHEDULE_DEADLINE_PASSED'];

export const PublicAppointmentManager: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const { t, i18n } = useTranslation('public');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [appointment, setAppointment] = useState<any>(null);
  const [mode, setMode] = useState<'view' | 'modify' | 'cancel'>('view');
  const [cancellationReason, setCancellationReason] = useState('');
  const [newDate, setNewDate] = useState<string | null>(null);
  const [newTime, setNewTime] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!token) {
      setError(t('manage.invalid_link_body'));
      setLoading(false);
      return;
    }
    publicAPI.getAppointmentByModificationToken(token)
      .then((response) => setAppointment(response.data.appointment))
      .catch((err) => setError(apiError(err, t('manage.invalid_link_body'))))
      .finally(() => setLoading(false));
  }, [token, t]);

  const salon = appointment?.salon;
  const template = salonTemplate(salon?.theme);
  const policy = appointment?.policy;
  const currency = salon?.settings?.currency || 'DZD';

  const switchMode = (next: typeof mode) => {
    setMode(next);
    setError(null);
    setNotice(null);
  };

  const handleModify = async () => {
    if (!newDate || !newTime || !token) return;
    try {
      setActionLoading(true);
      const response = await publicAPI.modifyAppointmentByModificationToken(token, { date: newDate, startTime: newTime });
      setAppointment(response.data.appointment);
      switchMode('view');
      setNotice(t('manage.modified'));
    } catch (err) {
      const code = availabilityCode(err);
      if (code) {
        // Slot taken meanwhile: say so and show fresh slots
        setNewTime(null);
        setRefreshKey((k) => k + 1);
      }
      const policyCode = (err as any)?.response?.data?.code;
      setError(code ? t(`errors:availability.${code}`)
        : POLICY_CODES.includes(policyCode) ? t(`manage.blocked.${policyCode}`) : apiError(err, t('manage.modify_error')));
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!token) return;
    try {
      setActionLoading(true);
      // A late cancellation keeps the deposit: the client saw it on the button, so it is acknowledged
      const { data } = await publicAPI.cancelAppointmentByModificationToken(token, {
        reason: cancellationReason.trim() || undefined,
        ...(policy?.cancelOutcome === 'retain' ? { acknowledgeRetention: true } : {}),
      });
      setAppointment({ ...appointment, status: 'cancelled', canModify: false, deposit: data.deposit ? { ...appointment.deposit, ...data.deposit } : appointment.deposit });
      switchMode('view');
      const dep = data.deposit?.status;
      setNotice(dep === 'refunded' || dep === 'refund_pending' || dep === 'retained'
        ? t(`manage.cancelled_${dep}`, { amount: formatPrice(data.deposit.amount, currency) })
        : t('manage.cancelled'));
    } catch (err: any) {
      const policyCode = err?.response?.data?.code;
      setError(POLICY_CODES.includes(policyCode) ? t(`manage.blocked.${policyCode}`) : apiError(err, t('manage.cancel_error')));
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <PageSpinner />;

  const shell = (children: React.ReactNode) => (
    <div className="bk min-h-screen" style={{ ...bookingVars(template), background: 'var(--bk-bg)' }}>
      {template.fonts && <link rel="stylesheet" href={template.fonts} />}
      <div className="mx-auto max-w-lg px-4 pb-[calc(2rem+env(safe-area-inset-bottom))]">{children}</div>
    </div>
  );

  if (!appointment) {
    return shell(
      <div className="min-h-screen flex flex-col items-center justify-center text-center gap-3">
        <ExclamationCircleIcon className="h-10 w-10 bk-muted" />
        <h1 className="bk-h text-xl">{t('manage.invalid_link')}</h1>
        <p className="bk-muted text-sm max-w-xs">{error}</p>
      </div>
    );
  }

  const day = new Date(`${String(appointment.date).slice(0, 10)}T00:00`);
  const loc = dateLocale(i18n.language);
  const canModify = appointment.canModify !== false && appointment.status !== 'cancelled';
  const salonHref = salon?.slug ? `/salon/${salon.slug}` : null;
  // Salon policy (free-cancellation deadline, late reschedule once); older API responses have none → allowed
  const canCancel = canModify && policy?.canCancel !== false;
  const canReschedule = canModify && policy?.canReschedule !== false;
  const deposit = appointment.deposit;
  const depositAmount = deposit ? formatPrice(deposit.amount, currency) : '';
  const freeUntil = policy?.freeUntil
    ? { date: format(new Date(`${policy.freeUntil.date}T00:00`), 'EEEE d MMMM', { locale: loc }), time: policy.freeUntil.time }
    : null;
  const blocked = canModify && policy && (!policy.canCancel || !policy.canReschedule)
    ? [policy.cancelBlocked, policy.rescheduleBlocked].filter(Boolean) as string[] : [];

  return shell(
    <>
      <header className="flex items-center gap-2 pt-4 pb-6">
        {salonHref && (
          <Link to={salonHref} className="bk-icon-btn -ms-2" aria-label={t('manage.back_to_salon')}>
            <ArrowLeftIcon className="h-5 w-5 rtl:rotate-180" />
          </Link>
        )}
        <div className="min-w-0">
          {salon?.establishmentName && <p className="bk-muted text-sm truncate">{salon.establishmentName}</p>}
          <h1 className="bk-h text-2xl">{t('manage.title')}</h1>
        </div>
      </header>

      <div className="space-y-4">
        {notice && (
          <div className="bk-notice is-success" role="status">
            <CheckCircleIcon className="h-5 w-5 shrink-0" /><span>{notice}</span>
          </div>
        )}
        {error && (
          <div className="bk-notice is-error" role="alert">
            <ExclamationCircleIcon className="h-5 w-5 shrink-0" /><span>{error}</span>
          </div>
        )}

        <article className="bk-card">
          <div className="bk-card-head">
            <p className="text-sm opacity-80 first-letter:uppercase">{format(day, 'EEEE d MMMM yyyy', { locale: loc })}</p>
            <p className="bk-num text-4xl font-semibold leading-tight mt-1" style={{ fontFamily: 'var(--bk-heading)' }}>
              {appointment.startTime}
              {appointment.endTime && <span className="text-lg font-normal opacity-80"> – {appointment.endTime}</span>}
            </p>
          </div>
          <div className="bk-row items-center">
            <span>{t('manage.status_label')}</span>
            <span><Badge tone={statusTone(appointment.status)}>{t(`manage.status.${appointment.status}`, { defaultValue: String(appointment.status) })}</Badge></span>
          </div>
          {appointment.serviceName && (
            <div className="bk-row"><span>{t('booking.summary.service')}</span><span>{appointment.serviceName}</span></div>
          )}
          {appointment.stylistName && (
            <div className="bk-row"><span>{t('booking.summary.with')}</span><span>{appointment.stylistName}</span></div>
          )}
          {appointment.duration > 0 && (
            <div className="bk-row"><span>{t('booking.summary.duration')}</span><span>{formatDuration(appointment.duration)}</span></div>
          )}
          {appointment.price > 0 && (
            <div className="bk-row"><span>{t('booking.summary.price')}</span><span className="bk-num">{formatPrice(appointment.price, currency)}</span></div>
          )}
          {deposit && (
            <div className="bk-row items-center">
              <span>{t('manage.deposit')}</span>
              <span className="inline-flex flex-wrap items-center justify-end gap-2">
                <span className="bk-num">{depositAmount}</span>
                {deposit.status !== 'paid' && <Badge tone={deposit.status === 'retained' ? 'amber' : 'neutral'}>{t(`manage.deposit_status.${deposit.status}`)}</Badge>}
              </span>
            </div>
          )}
          {deposit?.status === 'paid' && appointment.price > deposit.amount && (
            <div className="bk-row"><span>{t('deposit.remaining')}</span><span className="bk-num">{formatPrice(appointment.price - deposit.amount, currency)}</span></div>
          )}
          {salon?.address && (
            <div className="bk-row"><span>{t('booking.summary.where')}</span><span>{salon.address}</span></div>
          )}
        </article>

        {canModify && mode === 'view' && policy?.isFree && policy.allowCancellation && freeUntil && (
          <p className="bk-muted text-sm">
            {t(deposit?.status === 'paid' ? 'manage.free_until_deposit' : 'manage.free_until', freeUntil)}
          </p>
        )}
        {mode === 'view' && blocked.length > 0 && (
          <div className="bk-notice" role="status" style={{ background: 'var(--bk-surface)', boxShadow: 'inset 0 0 0 1px var(--bk-border)' }}>
            <ExclamationCircleIcon className="h-5 w-5 shrink-0 bk-muted" />
            <div className="space-y-1">
              {blocked.map((code) => <p key={code}>{t(`manage.blocked.${code}`)}</p>)}
              {salon?.publicPhone && <a href={`tel:${salon.publicPhone}`} className="font-medium underline underline-offset-2">{t('manage.call_salon', { phone: salon.publicPhone })}</a>}
            </div>
          </div>
        )}
        {canModify && mode === 'view' && (canReschedule || canCancel) && (
          <div className="grid gap-3">
            {canReschedule && <button type="button" className="bk-btn" onClick={() => switchMode('modify')}>{t('manage.modify')}</button>}
            {canCancel && <button type="button" className="bk-btn-danger" onClick={() => switchMode('cancel')}>{t('manage.cancel')}</button>}
          </div>
        )}

        {canReschedule && mode === 'modify' && (
          <section className="bk-card p-4 sm:p-5 space-y-5 bk-step-fwd" aria-labelledby="bk-modify-title">
            <h2 id="bk-modify-title" className="bk-h text-lg">{t('manage.new_slot')}</h2>
            {(policy?.lateRescheduleNext || deposit?.status === 'paid') && (
              <p className="bk-muted text-sm">
                {[policy?.lateRescheduleNext ? t('manage.reschedule_late') : '', deposit?.status === 'paid' ? t('manage.deposit_carries') : ''].filter(Boolean).join(' ')}
              </p>
            )}
            <DateTimeSelection
              serviceId={String(appointment.serviceId)}
              selectedDate={newDate || undefined}
              selectedTime={newTime || undefined}
              stylistId={appointment.stylistId}
              showTeamSelection={false}
              slug={salon?.slug}
              token={token}
              refreshKey={refreshKey}
              onSelect={(date, time) => {
                setNewDate(date || null);
                setNewTime(time || null);
              }}
            />
            <div className="flex gap-3">
              <button type="button" className="bk-btn-ghost" onClick={() => switchMode('view')} disabled={actionLoading}>
                {t('booking.flow.back')}
              </button>
              <button type="button" className="bk-btn flex-1" onClick={handleModify} disabled={actionLoading || !newDate || !newTime}>
                {actionLoading && <span className="bk-spinner" aria-hidden="true" />}
                {t('manage.confirm_new_slot')}
              </button>
            </div>
          </section>
        )}

        {canCancel && mode === 'cancel' && (
          <section className="bk-card p-4 sm:p-5 space-y-4 bk-step-fwd" aria-labelledby="bk-cancel-title">
            <div>
              <h2 id="bk-cancel-title" className="bk-h text-lg">{t('manage.cancel_title')}</h2>
              <p className="bk-muted text-sm mt-1">{t('manage.cancel_body')}</p>
            </div>
            {/* What happens to the deposit, said before the client confirms */}
            {policy?.cancelOutcome === 'refund' && (
              <div className="bk-notice is-success" role="status"><CheckCircleIcon className="h-5 w-5 shrink-0" /><span>{t('manage.cancel_refund', { amount: depositAmount })}</span></div>
            )}
            {policy?.cancelOutcome === 'retain' && (
              <div className="bk-notice is-error" role="alert">
                <ExclamationCircleIcon className="h-5 w-5 shrink-0" />
                <span>{t('manage.cancel_retain', { amount: depositAmount, ...(freeUntil || { date: '', time: '' }) })}</span>
              </div>
            )}
            <div>
              <label htmlFor="bk-cancel-reason" className="bk-label">{t('manage.cancel_reason')}</label>
              <textarea id="bk-cancel-reason" rows={3} maxLength={500} className="bk-field resize-none"
                placeholder={t('manage.cancel_reason_placeholder')}
                value={cancellationReason} onChange={(e) => setCancellationReason(e.target.value)} />
            </div>
            <div className="flex flex-col-reverse sm:flex-row gap-3">
              <button type="button" className="bk-btn-ghost sm:flex-1" onClick={() => switchMode('view')} disabled={actionLoading}>
                {t('manage.keep')}
              </button>
              <button type="button" className="bk-btn-danger is-solid sm:flex-1" onClick={handleCancel} disabled={actionLoading}>
                {actionLoading && <span className="bk-spinner" aria-hidden="true" />}
                {policy?.cancelOutcome === 'retain' ? t('manage.confirm_cancel_retain') : t('manage.confirm_cancel')}
              </button>
            </div>
          </section>
        )}

        {!canModify && salonHref && (
          <Link to={salonHref} className="bk-btn w-full">{t('manage.book_again')}</Link>
        )}
      </div>
    </>
  );
};
