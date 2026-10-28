import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { dateLocale } from '../dateLocale';
import { Panel, EmptyState } from '../../../components/ui';
import {
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  CalendarIcon,
  UserPlusIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { AppointmentWithPrice } from '../types';

// When the appointment was last touched (API timestamps), not when it takes place
const activityDate = (apt: AppointmentWithPrice & { updatedAt?: string; createdAt?: string }) =>
  apt.lastModified || apt.updatedAt || apt.createdAt || apt.date;

interface RecentActivityProps {
  appointments: AppointmentWithPrice[];
}

const RecentActivity: React.FC<RecentActivityProps> = ({ appointments }) => {
  const { t, i18n } = useTranslation('dashboard');

  const getDateLocale = () => dateLocale(i18n.language);

  const recentActivities = useMemo(() => {
    // Trier les rendez-vous par date de modification ou création
    const sortedAppointments = [...appointments]
      .sort((a, b) => {
        const dateA = new Date(activityDate(a));
        const dateB = new Date(activityDate(b));
        return dateB.getTime() - dateA.getTime();
      })
      .slice(0, 10); // Dernières 10 activités

    return sortedAppointments.map(appointment => {
      const date = new Date(activityDate(appointment));
      let icon = CalendarIcon;
      let actionKey = 'created';

      switch (appointment.status) {
        case 'confirmed':
          icon = CheckCircleIcon;
          actionKey = 'confirmed';
          break;
        case 'completed':
          icon = CheckCircleIcon;
          actionKey = 'completed';
          break;
        case 'cancelled':
          icon = XCircleIcon;
          actionKey = 'cancelled';
          break;
        case 'rescheduled':
          icon = ArrowPathIcon;
          actionKey = 'rescheduled';
          break;
        case 'noShow':
          icon = XCircleIcon;
          actionKey = 'no_show';
          break;
      }

      return {
        id: appointment.id,
        icon,
        action: t(`recent_activity.actions.${actionKey}`),
        client: appointment.clientInfo 
          ? `${appointment.clientInfo.firstName} ${appointment.clientInfo.lastName}`
          : t('recent_activity.unknown_client'),
        service: appointment.serviceName,
        status: appointment.status,
        date,
        appointmentDate: appointment.date,
        time: appointment.startTime
      };
    });
  }, [appointments, t]);

  // Fonction utilitaire pour calculer le temps écoulé
  const getTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return t('recent_activity.time.just_now');
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return t('recent_activity.time.minutes_ago', { minutes });
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return t('recent_activity.time.hours_ago', { hours });
    } else if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return t('recent_activity.time.days_ago', { days });
    } else {
      return format(date, 'd MMM', { locale: getDateLocale() });
    }
  };

  const iconColor: Record<string, string> = {
    confirmed: 'text-blue-500',
    completed: 'text-emerald-500',
    cancelled: 'text-red-500',
    noShow: 'text-amber-500',
  };

  return (
    <Panel title={t('recent_activity.title')} flush>
      {recentActivities.length === 0 ? (
        <EmptyState icon={ClockIcon} title={t('recent_activity.no_activity')} />
      ) : (
        <ul className="divide-y divide-gray-100 dark:divide-gray-800 border-t border-gray-100 dark:border-gray-800">
          {recentActivities.map((activity) => {
            const Icon = activity.icon;
            return (
              <li key={activity.id} className="flex items-start gap-3 px-5 py-3">
                <Icon className={`mt-0.5 size-5 shrink-0 ${iconColor[activity.status] || 'text-gray-400'}`} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-50">{activity.action}</p>
                  <p className="truncate text-sm text-gray-500 dark:text-gray-400">
                    {[activity.client, activity.service].filter(Boolean).join(' · ')}
                  </p>
                  <p className="mt-0.5 text-xs tabular-nums text-gray-500 dark:text-gray-400">
                    {format(new Date(activity.appointmentDate), 'd MMM', { locale: getDateLocale() })} · {activity.time}
                  </p>
                </div>
                <span className="shrink-0 whitespace-nowrap text-xs text-gray-500 dark:text-gray-400">{getTimeAgo(activity.date)}</span>
              </li>
            );
          })}
        </ul>
      )}
    </Panel>
  );
};

export default RecentActivity;
