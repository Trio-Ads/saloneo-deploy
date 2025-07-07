import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { fr, enUS, ar } from 'date-fns/locale';
import {
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  CalendarIcon,
  UserPlusIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { AppointmentWithPrice } from '../types';

interface RecentActivityProps {
  appointments: AppointmentWithPrice[];
}

const RecentActivity: React.FC<RecentActivityProps> = ({ appointments }) => {
  const { t, i18n } = useTranslation('dashboard');

  // Sélectionner la locale appropriée pour date-fns
  const getDateLocale = () => {
    switch (i18n.language) {
      case 'fr':
        return fr;
      case 'ar':
        return ar;
      case 'en':
      default:
        return enUS;
    }
  };

  const recentActivities = useMemo(() => {
    // Trier les rendez-vous par date de modification ou création
    const sortedAppointments = [...appointments]
      .sort((a, b) => {
        const dateA = new Date(a.lastModified || a.date);
        const dateB = new Date(b.lastModified || b.date);
        return dateB.getTime() - dateA.getTime();
      })
      .slice(0, 10); // Dernières 10 activités

    return sortedAppointments.map(appointment => {
      const date = new Date(appointment.lastModified || appointment.date);
      let icon = CalendarIcon;
      let color = 'text-blue-600 bg-blue-100';
      let actionKey = 'created';

      switch (appointment.status) {
        case 'confirmed':
          icon = CheckCircleIcon;
          color = 'text-green-600 bg-green-100';
          actionKey = 'confirmed';
          break;
        case 'completed':
          icon = CheckCircleIcon;
          color = 'text-emerald-600 bg-emerald-100';
          actionKey = 'completed';
          break;
        case 'cancelled':
          icon = XCircleIcon;
          color = 'text-red-600 bg-red-100';
          actionKey = 'cancelled';
          break;
        case 'rescheduled':
          icon = ArrowPathIcon;
          color = 'text-purple-600 bg-purple-100';
          actionKey = 'rescheduled';
          break;
        case 'noShow':
          icon = XCircleIcon;
          color = 'text-orange-600 bg-orange-100';
          actionKey = 'no_show';
          break;
      }

      return {
        id: appointment.id,
        icon,
        color,
        action: t(`recent_activity.actions.${actionKey}`),
        client: appointment.clientInfo 
          ? `${appointment.clientInfo.firstName} ${appointment.clientInfo.lastName}`
          : t('recent_activity.unknown_client'),
        service: appointment.serviceName,
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

  if (recentActivities.length === 0) {
    return (
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <ClockIcon className="h-5 w-5 mr-2 text-indigo-600" />
          {t('recent_activity.title')}
        </h3>
        <div className="text-center py-8">
          <ClockIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">{t('recent_activity.no_activity')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <ClockIcon className="h-5 w-5 mr-2 text-indigo-600" />
        {t('recent_activity.title')}
      </h3>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {recentActivities.map((activity) => {
          const Icon = activity.icon;
          const timeAgo = getTimeAgo(activity.date);

          return (
            <div
              key={activity.id}
              className="group flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200"
            >
              {/* Icône */}
              <div className={`p-2 rounded-lg ${activity.color}`}>
                <Icon className="h-4 w-4" />
              </div>

              {/* Contenu */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">
                  {activity.action}
                </p>
                <p className="text-sm text-gray-600 truncate">
                  {activity.client} - {activity.service}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {format(new Date(activity.appointmentDate), 'd MMM', { locale: getDateLocale() })} à {activity.time}
                </p>
              </div>

              {/* Temps écoulé */}
              <div className="text-xs text-gray-500 whitespace-nowrap">
                {timeAgo}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RecentActivity;
