import React from 'react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ClockIcon, UserIcon, ScissorsIcon } from '@heroicons/react/24/outline';
import { AppointmentWithPrice } from '../types';
import { useProfileStore } from '../../profile/store';
import { formatPrice } from '../../../utils/currency';

interface UpcomingAppointmentsProps {
  appointments: AppointmentWithPrice[];
}

const UpcomingAppointments: React.FC<UpcomingAppointmentsProps> = ({ appointments }) => {
  const { t } = useTranslation('dashboard');
  const { profile } = useProfileStore();

  if (appointments.length === 0) {
    return (
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/20 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <ClockIcon className="h-5 w-5 mr-2 text-orange-600 dark:text-orange-400" />
          {t('components.upcoming_appointments.title')}
        </h3>
        <div className="text-center py-8">
          <ClockIcon className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400">{t('components.upcoming_appointments.no_appointments')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/20 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
        <ClockIcon className="h-5 w-5 mr-2 text-orange-600 dark:text-orange-400" />
        {t('components.upcoming_appointments.title')}
      </h3>
      
      <div className="space-y-3">
        {appointments.map((appointment) => {
          const appointmentDate = new Date(appointment.date);
          const isToday = new Date().toDateString() === appointmentDate.toDateString();
          const isTomorrow = new Date(Date.now() + 86400000).toDateString() === appointmentDate.toDateString();
          
          let dateLabel = format(appointmentDate, 'EEEE d MMMM', { locale: fr });
          if (isToday) dateLabel = t('components.upcoming_appointments.today');
          if (isTomorrow) dateLabel = t('components.upcoming_appointments.tomorrow');

          const statusColors = {
            scheduled: 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 border-orange-200 dark:border-orange-700',
            confirmed: 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 border-orange-200 dark:border-orange-700',
            rescheduled: 'bg-gray-100 dark:bg-gray-700/50 text-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-600'
          };

          const statusLabels = {
            scheduled: t('components.upcoming_appointments.statuses.scheduled'),
            confirmed: t('components.upcoming_appointments.statuses.confirmed'),
            rescheduled: t('components.upcoming_appointments.statuses.rescheduled')
          };

          return (
            <div
              key={appointment.id}
              className="group relative bg-gradient-to-r from-gray-50 to-white dark:from-gray-700/50 dark:to-gray-800/50 rounded-xl p-4 border border-gray-100 dark:border-gray-700 hover:shadow-md hover:border-orange-500/20 dark:hover:border-orange-400/20 transition-all duration-200"
            >
              {/* Heure */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    {appointment.startTime}
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">-</span>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    {appointment.endTime}
                  </div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full border ${statusColors[appointment.status as keyof typeof statusColors] || statusColors.scheduled}`}>
                  {statusLabels[appointment.status as keyof typeof statusLabels] || appointment.status}
                </span>
              </div>

              {/* Client et service */}
              <div className="space-y-1">
                <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                  <UserIcon className="h-4 w-4 mr-2 text-gray-400 dark:text-gray-500" />
                  <span className="font-medium">
                    {appointment.clientInfo?.firstName} {appointment.clientInfo?.lastName}
                  </span>
                </div>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <ScissorsIcon className="h-4 w-4 mr-2 text-gray-400 dark:text-gray-500" />
                  <span>{appointment.serviceName}</span>
                  {appointment.price && (
                    <span className="ml-auto font-medium text-gray-900 dark:text-white">
                      {formatPrice(appointment.price, profile.currency)}
                    </span>
                  )}
                </div>
              </div>

              {/* Date si pas aujourd'hui */}
              {!isToday && (
                <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                  <p className="text-xs text-gray-500 dark:text-gray-400">{dateLabel}</p>
                </div>
              )}

              {/* Indicateur de temps restant */}
              {isToday && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-orange-500 to-orange-600 rounded-l-xl"></div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default UpcomingAppointments;
