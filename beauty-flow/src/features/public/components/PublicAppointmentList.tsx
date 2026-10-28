import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams, useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';
import { ChevronRightIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { Badge, statusTone } from '../../../components/ui';
import { useSalonPublicData } from '../hooks/useSalonPublicData';
import { bookingVars, dateLocale } from './bookingTheme';
import { salonTemplate } from '../../templates';
import { PageSpinner } from './PublicAppointmentManager';

const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/api\/?$/, '');

interface FoundAppointment {
  id: string;
  date: string;
  startTime: string;
  status: string;
  serviceName?: string;
  modificationToken?: string;
}

/** Appointments found by email / phone / name; each one opens the token manager page. */
const PublicAppointmentList: React.FC = () => {
  const { t, i18n } = useTranslation('public');
  const [searchParams] = useSearchParams();
  const { slug = '' } = useParams<{ slug: string }>();
  const { data: salon, loading: salonLoading } = useSalonPublicData(slug);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [appointments, setAppointments] = useState<FoundAppointment[]>([]);

  useEffect(() => {
    const query = new URLSearchParams();
    ['email', 'phone', 'firstName', 'lastName'].forEach((k) => searchParams.get(k) && query.set(k, searchParams.get(k)!));
    if (!slug || (!query.has('email') && !query.has('phone') && !(query.has('firstName') && query.has('lastName')))) {
      setError(t('list.invalid_search'));
      setLoading(false);
      return;
    }
    axios.get<FoundAppointment[]>(`${API_BASE}/api/public/appointments/search/${slug}?${query}`)
      .then((res) => setAppointments(res.data))
      .catch(() => setError(t('list.search_error')))
      .finally(() => setLoading(false));
  }, [searchParams, slug, t]);

  if (loading || salonLoading) return <PageSpinner />;

  const template = salonTemplate(salon?.profile.theme);
  const loc = dateLocale(i18n.language);
  const salonHref = slug ? `/salon/${slug}` : '/';

  return (
    <div className="bk min-h-screen" style={{ ...bookingVars(template), background: 'var(--bk-bg)' }}>
      {template.fonts && <link rel="stylesheet" href={template.fonts} />}
      <div className="mx-auto max-w-lg px-4 pt-6 pb-[calc(2rem+env(safe-area-inset-bottom))] space-y-5">
        <header>
          {salon?.profile.establishmentName && <p className="bk-muted text-sm">{salon.profile.establishmentName}</p>}
          <h1 className="bk-h text-2xl">{t('appointments.your_appointments')}</h1>
        </header>

        {error ? (
          <div className="bk-notice is-error" role="alert">
            <ExclamationCircleIcon className="h-5 w-5 shrink-0" /><span>{error}</span>
          </div>
        ) : appointments.length === 0 ? (
          <div className="bk-card p-6 text-center">
            <p className="font-medium">{t('appointments.no_appointments')}</p>
            <p className="bk-muted text-sm mt-1">{t('list.empty_body')}</p>
          </div>
        ) : (
          <ul className="bk-card divide-y divide-[var(--bk-border)]">
            {appointments.map((a) => {
              const row = (
                <>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium truncate">{a.serviceName}</p>
                    <p className="bk-muted text-sm first-letter:uppercase">
                      {format(new Date(`${String(a.date).slice(0, 10)}T00:00`), 'EEEE d MMMM', { locale: loc })} · <span className="bk-num">{a.startTime}</span>
                    </p>
                  </div>
                  <Badge tone={statusTone(a.status)}>{t(`manage.status.${a.status}`, { defaultValue: a.status })}</Badge>
                  {a.modificationToken && <ChevronRightIcon className="h-5 w-5 bk-muted shrink-0 rtl:rotate-180" />}
                </>
              );
              return (
                <li key={a.id}>
                  {a.modificationToken
                    ? <Link to={`/appointment/${a.modificationToken}`} className="flex items-center gap-3 w-full px-5 py-4 hover:bg-[var(--bk-hover)]">{row}</Link>
                    : <div className="flex items-center gap-3 w-full px-5 py-4">{row}</div>}
                </li>
              );
            })}
          </ul>
        )}

        <Link to={salonHref} className="bk-btn w-full">{t('list.book_new')}</Link>
      </div>
    </div>
  );
};

export default PublicAppointmentList;
