import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { format, parseISO } from 'date-fns';
import { ArrowLeftIcon, CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { bookingVars, dateLocale } from './components/bookingTheme';
import { PageSpinner } from './components/PublicAppointmentManager';
import { salonTemplate } from '../templates';
import { WaitlistPublicEntry, waitlistAPI } from './waitlist';

/** /waitlist/:token — the client sees their waitlist request, books a running offer, or leaves the list. */
export default function WaitlistManagePage() {
  const { token = '' } = useParams<{ token: string }>();
  const { t, i18n } = useTranslation('public');
  const [entry, setEntry] = useState<(WaitlistPublicEntry & { theme?: any }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [leaving, setLeaving] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    waitlistAPI.entry(token).then(({ data }) => setEntry(data.entry)).catch(() => setError(true)).finally(() => setLoading(false));
  }, [token]);

  if (loading) return <PageSpinner />;
  const template = salonTemplate(entry?.theme);
  const loc = dateLocale(i18n.language);
  const day = (d: string) => format(parseISO(d), 'EEE d MMM', { locale: loc });

  const leave = async () => {
    if (!window.confirm(t('waitlist.manage.leave_confirm'))) return;
    setLeaving(true);
    try {
      const { data } = await waitlistAPI.leave(token);
      setEntry((e) => e && { ...e, ...data.entry });
    } catch {
      setError(true);
    } finally {
      setLeaving(false);
    }
  };

  return (
    <div className="bk min-h-screen" style={{ ...bookingVars(template), background: 'var(--bk-bg)' }}>
      {template.fonts && <link rel="stylesheet" href={template.fonts} />}
      <div className="mx-auto max-w-lg px-4 pb-[calc(2rem+env(safe-area-inset-bottom))]">
        {!entry ? (
          <div className="min-h-screen flex flex-col items-center justify-center text-center gap-3">
            <ExclamationCircleIcon className="h-10 w-10 bk-muted" />
            <h1 className="bk-h text-xl">{t('manage.invalid_link')}</h1>
          </div>
        ) : (
          <>
            <header className="flex items-center gap-2 pt-4 pb-6">
              {entry.slug && (
                <Link to={`/salon/${entry.slug}`} className="bk-icon-btn -ms-2" aria-label={t('manage.back_to_salon')}>
                  <ArrowLeftIcon className="h-5 w-5 rtl:rotate-180" />
                </Link>
              )}
              <div className="min-w-0">
                {entry.salonName && <p className="bk-muted text-sm truncate">{entry.salonName}</p>}
                <h1 className="bk-h text-2xl">{t('waitlist.manage.title')}</h1>
              </div>
            </header>

            <div className="space-y-4">
              {error && (
                <div className="bk-notice is-error" role="alert">
                  <ExclamationCircleIcon className="h-5 w-5 shrink-0" /><span>{t('waitlist.errors.generic')}</span>
                </div>
              )}
              <div className={`bk-notice ${entry.status === 'cancelled' || entry.status === 'expired' ? 'is-error' : 'is-success'}`} role="status">
                {entry.status === 'cancelled' || entry.status === 'expired'
                  ? <ExclamationCircleIcon className="h-5 w-5 shrink-0" />
                  : <CheckCircleIcon className="h-5 w-5 shrink-0" />}
                <span>{t(`waitlist.manage.status.${entry.status}`)}</span>
              </div>

              {entry.offer && (
                <div className="bk-card">
                  <div className="bk-card-head">
                    <p className="text-sm opacity-80">{t('waitlist.manage.offer_title')}</p>
                    <p className="bk-num text-2xl font-semibold mt-1 first-letter:uppercase" style={{ fontFamily: 'var(--bk-heading)' }}>
                      {day(entry.offer.date)} · {entry.offer.time}
                    </p>
                  </div>
                  <div className="p-4 space-y-3">
                    <p className="bk-muted text-sm">{t('waitlist.manage.offer_until', { time: format(new Date(entry.offer.expiresAt), 'HH:mm') })}</p>
                    <a href={entry.offer.url} className="bk-btn w-full">{t('waitlist.offer.book')}</a>
                  </div>
                </div>
              )}

              <div className="bk-card">
                <div className="bk-row"><span>{t('booking.summary.service')}</span><span>{entry.serviceName}</span></div>
                <div className="bk-row"><span>{t('booking.summary.with')}</span><span>{entry.stylistName || t('booking.flow.any_stylist')}</span></div>
                <div className="bk-row"><span>{t('waitlist.form.dates')}</span><span className="first-letter:uppercase">{day(entry.from)} – {day(entry.to)}</span></div>
                <div className="bk-row"><span>{t('waitlist.form.when')}</span><span>{t(`waitlist.time.${entry.timeOfDay}`)}</span></div>
              </div>

              {(entry.status === 'active' || entry.status === 'offered') && (
                <button type="button" className="bk-btn-danger w-full" onClick={leave} disabled={leaving}>
                  {leaving && <span className="bk-spinner" aria-hidden="true" />}
                  {t('waitlist.manage.leave')}
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
