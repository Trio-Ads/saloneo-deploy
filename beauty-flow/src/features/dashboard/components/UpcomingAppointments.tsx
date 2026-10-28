import React from 'react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { ClockIcon } from '@heroicons/react/24/outline';
import { AppointmentWithPrice } from '../types';
import { useProfileStore } from '../../profile/store';
import { formatPrice } from '../../../utils/currency';
import { Panel, Badge, EmptyState, statusTone } from '../../../components/ui';
import { dateLocale } from '../dateLocale';

interface UpcomingAppointmentsProps {
  appointments: AppointmentWithPrice[];
}

const UpcomingAppointments: React.FC<UpcomingAppointmentsProps> = ({ appointments }) => {
  const { t, i18n } = useTranslation('dashboard');
  const { profile } = useProfileStore();

  const dayLabel = (date: Date) => {
    if (new Date().toDateString() === date.toDateString()) return t('components.upcoming_appointments.today');
    if (new Date(Date.now() + 86400000).toDateString() === date.toDateString()) return t('components.upcoming_appointments.tomorrow');
    return format(date, 'EEE d MMM', { locale: dateLocale(i18n.language) });
  };

  const statusLabels: Record<string, string> = {
    scheduled: t('components.upcoming_appointments.statuses.scheduled'),
    confirmed: t('components.upcoming_appointments.statuses.confirmed'),
    rescheduled: t('components.upcoming_appointments.statuses.rescheduled'),
  };

  return (
    <Panel title={t('components.upcoming_appointments.title')} flush>
      {appointments.length === 0 ? (
        <EmptyState icon={ClockIcon} title={t('components.upcoming_appointments.no_appointments')} />
      ) : (
        <ul className="divide-y divide-gray-100 dark:divide-gray-800 border-t border-gray-100 dark:border-gray-800">
          {appointments.map((appointment) => (
            <li key={appointment.id}>
              <Link to="/appointments" className="flex items-start gap-3 px-5 py-3 transition-colors duration-150 ease-out hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <div className="w-14 shrink-0">
                  <p className="text-sm font-semibold tabular-nums text-gray-900 dark:text-gray-50">{appointment.startTime}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 first-letter:uppercase">{dayLabel(new Date(appointment.date))}</p>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-50">
                    {appointment.clientInfo?.firstName} {appointment.clientInfo?.lastName}
                  </p>
                  <p className="truncate text-sm text-gray-500 dark:text-gray-400">{appointment.serviceName}</p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  {!!appointment.price && (
                    <span className="text-sm font-medium tabular-nums text-gray-900 dark:text-gray-50">{formatPrice(appointment.price, profile.currency)}</span>
                  )}
                  <Badge tone={statusTone(appointment.status)}>{statusLabels[appointment.status] || appointment.status}</Badge>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
};

export default UpcomingAppointments;
