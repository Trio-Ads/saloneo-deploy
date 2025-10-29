import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameDay,
  parseISO,
  addWeeks,
  subWeeks,
  isToday,
  isPast,
} from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  CalendarDaysIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ClockIcon,
  UserIcon,
  SparklesIcon,
  CheckCircleIcon,
  XMarkIcon,
  EyeSlashIcon,
  CheckIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { Appointment } from '../types';
import { useClientStore } from '../../clients/store';
import { useServiceStore } from '../../services/store';
import { useTeamStore } from '../../team/store';

interface CalendarViewProps {
  appointments: Appointment[];
  onEdit: (appointment: Appointment) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ appointments, onEdit }) => {
  const { t } = useTranslation('appointments');
  const [currentDate, setCurrentDate] = React.useState(new Date());
  const clients = useClientStore((state) => state.clients);
  const services = useServiceStore((state) => state.services);
  const stylists = useTeamStore((state) => state.members);

  const weekDays = useMemo(() => {
    const start = startOfWeek(currentDate, { locale: fr });
    const end = endOfWeek(currentDate, { locale: fr });
    return eachDayOfInterval({ start, end });
  }, [currentDate]);

  const getClientName = (clientId: string) => {
    const client = clients.find((c) => c.id === clientId);
    return client ? `${client.firstName} ${client.lastName}` : t('appointment_form.unknown.client');
  };

  const getServiceName = (serviceId: string) => {
    const service = services.find((s) => s.id === serviceId);
    return service ? service.name : t('appointment_form.unknown.service');
  };

  const getStylistName = (stylistId: string) => {
    const stylist = stylists.find((s) => s.id === stylistId);
    return stylist ? `${stylist.firstName} ${stylist.lastName}` : t('appointment_form.unknown.stylist');
  };

  const getStatusConfig = (status: Appointment['status']) => {
    switch (status) {
      case 'scheduled':
        return {
          color: 'from-orange-500 to-orange-600 dark:from-orange-400 dark:to-orange-500',
          bgColor: 'bg-orange-50 dark:bg-orange-900/20',
          textColor: 'text-orange-800 dark:text-orange-300',
          borderColor: 'border-orange-300 dark:border-orange-500',
          icon: CalendarDaysIcon,
          label: t('appointment_list.status_labels.scheduled')
        };
      case 'confirmed':
        return {
          color: 'from-orange-600 to-orange-700 dark:from-orange-500 dark:to-orange-600',
          bgColor: 'bg-orange-50 dark:bg-orange-900/20',
          textColor: 'text-orange-800 dark:text-orange-300',
          borderColor: 'border-orange-400 dark:border-orange-500',
          icon: CheckCircleIcon,
          label: t('appointment_list.status_labels.confirmed')
        };
      case 'completed':
        return {
          color: 'from-orange-400 to-orange-500 dark:from-orange-300 dark:to-orange-400',
          bgColor: 'bg-orange-50 dark:bg-orange-900/20',
          textColor: 'text-orange-700 dark:text-orange-300',
          borderColor: 'border-orange-300 dark:border-orange-500',
          icon: CheckIcon,
          label: t('appointment_list.status_labels.completed')
        };
      case 'cancelled':
        return {
          color: 'from-gray-500 to-gray-600 dark:from-gray-600 dark:to-gray-700',
          bgColor: 'bg-gray-50 dark:bg-gray-800/50',
          textColor: 'text-gray-800 dark:text-gray-300',
          borderColor: 'border-gray-300 dark:border-gray-600',
          icon: XMarkIcon,
          label: t('appointment_list.status_labels.cancelled')
        };
      case 'noShow':
        return {
          color: 'from-gray-500 to-gray-600 dark:from-gray-600 dark:to-gray-700',
          bgColor: 'bg-gray-50 dark:bg-gray-800/50',
          textColor: 'text-gray-800 dark:text-gray-300',
          borderColor: 'border-gray-300 dark:border-gray-600',
          icon: EyeSlashIcon,
          label: t('appointment_list.status_labels.no_show')
        };
      default:
        return {
          color: 'from-gray-500 to-gray-600 dark:from-gray-600 dark:to-gray-700',
          bgColor: 'bg-gray-50 dark:bg-gray-800/50',
          textColor: 'text-gray-800 dark:text-gray-300',
          borderColor: 'border-gray-300 dark:border-gray-600',
          icon: CalendarDaysIcon,
          label: status
        };
    }
  };

  const getDayAppointments = (date: Date) => {
    return appointments.filter((appointment) => {
      try {
        let appointmentDate: Date;
        if (appointment.date.includes('T')) {
          appointmentDate = parseISO(appointment.date);
        } else {
          appointmentDate = parseISO(appointment.date + 'T00:00:00');
        }
        return isSameDay(appointmentDate, date);
      } catch (error) {
        console.error('Erreur lors du parsing de la date:', error, appointment.date);
        return false;
      }
    }).sort((a, b) => {
      // Trier par heure
      const timeA = a.startTime.split(':').map(Number);
      const timeB = b.startTime.split(':').map(Number);
      return (timeA[0] * 60 + timeA[1]) - (timeB[0] * 60 + timeB[1]);
    });
  };

  const handlePreviousWeek = () => {
    setCurrentDate((date) => subWeeks(date, 1));
  };

  const handleNextWeek = () => {
    setCurrentDate((date) => addWeeks(date, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const getTotalAppointments = () => {
    return weekDays.reduce((total, day) => total + getDayAppointments(day).length, 0);
  };

  return (
    <div className="space-y-6">
      {/* Header avec navigation */}
      <div className="bg-white/90 dark:bg-gray-900/70 backdrop-blur-xl rounded-2xl shadow-orange-md dark:shadow-gray-md border border-orange-500/20 dark:border-orange-500/20 p-6 transition-colors duration-300">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-r from-orange-500 to-orange-600 dark:from-orange-400 dark:to-orange-500 rounded-xl shadow-orange-lg">
              <CalendarDaysIcon className="h-6 w-6 text-white dark:text-gray-900" />
            </div>
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-orange-600 dark:from-orange-400 dark:to-orange-500 bg-clip-text text-transparent capitalize">
                {format(weekDays[0], 'MMMM yyyy', { locale: fr })}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('calendar_view.week_from')} {format(weekDays[0], 'd', { locale: fr })} {t('calendar_view.week_to')} {format(weekDays[6], 'd MMMM', { locale: fr })}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleToday}
              className="px-4 py-2 text-sm rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 dark:from-orange-400 dark:to-orange-500 hover:from-orange-600 hover:to-orange-700 dark:hover:from-orange-500 dark:hover:to-orange-600 text-white dark:text-gray-900 border-0 shadow-orange-lg hover:shadow-orange-xl transform hover:scale-105 transition-all duration-200 font-semibold"
            >
              {t('calendar_view.today')}
            </button>
            
            <div className="flex items-center space-x-1">
              <button
                onClick={handlePreviousWeek}
                className="p-3 rounded-xl bg-white/70 dark:bg-gray-800/70 text-orange-600 dark:text-orange-400 hover:text-orange-800 dark:hover:text-orange-300 hover:bg-orange-50 dark:hover:bg-orange-900/30 transition-all duration-200 transform hover:scale-110 shadow-lg hover:shadow-xl"
                title={t('calendar_view.previous_week')}
              >
                <ChevronLeftIcon className="h-5 w-5" />
              </button>
              <button
                onClick={handleNextWeek}
                className="p-3 rounded-xl bg-white/70 dark:bg-gray-800/70 text-orange-600 dark:text-orange-400 hover:text-orange-800 dark:hover:text-orange-300 hover:bg-orange-50 dark:hover:bg-orange-900/30 transition-all duration-200 transform hover:scale-110 shadow-lg hover:shadow-xl"
                title={t('calendar_view.next_week')}
              >
                <ChevronRightIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Statistiques de la semaine */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-500/20">
            <CalendarDaysIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('calendar_view.stats.total')}</p>
              <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{getTotalAppointments()}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-3 bg-orange-50 dark:bg-orange-900/20 backdrop-blur-sm rounded-xl border border-orange-500/20">
            <CheckCircleIcon className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('calendar_view.stats.confirmed')}</p>
              <p className="text-lg font-bold text-orange-600 dark:text-orange-400">
                {appointments.filter(a => a.status === 'confirmed').length}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-3 bg-orange-50 dark:bg-orange-900/20 backdrop-blur-sm rounded-xl border border-orange-500/20">
            <CheckIcon className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('calendar_view.stats.completed')}</p>
              <p className="text-lg font-bold text-orange-600 dark:text-orange-400">
                {appointments.filter(a => a.status === 'completed').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Grille du calendrier */}
      <div className="bg-white/90 dark:bg-gray-900/70 backdrop-blur-xl rounded-2xl shadow-orange-md dark:shadow-gray-md border border-orange-500/20 dark:border-orange-500/20 p-6 transition-colors duration-300">
        <div className="grid grid-cols-7 gap-4">
          {weekDays.map((day, dayIndex) => {
            const dayAppointments = getDayAppointments(day);
            const isCurrentDay = isToday(day);
            const isPastDay = isPast(day) && !isToday(day);
            
            return (
              <div 
                key={day.toISOString()} 
                className={`space-y-3 ${isCurrentDay ? 'ring-2 ring-orange-500 dark:ring-orange-400 ring-opacity-50 rounded-xl p-2' : ''}`}
              >
                {/* Header du jour */}
                <div className={`text-center p-3 rounded-xl transition-all duration-200 ${
                  isCurrentDay 
                    ? 'bg-gradient-to-r from-orange-500 to-orange-600 dark:from-orange-400 dark:to-orange-500 text-white dark:text-gray-900 shadow-orange-lg' 
                    : isPastDay
                    ? 'bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 text-gray-600 dark:text-gray-400'
                    : 'bg-gradient-to-r from-white to-gray-50 dark:from-gray-800 dark:to-gray-700 text-gray-900 dark:text-gray-100'
                }`}>
                  <div className={`text-xs font-medium uppercase tracking-wide ${
                    isCurrentDay ? 'text-white dark:text-gray-900' : isPastDay ? 'text-gray-500 dark:text-gray-500' : 'text-gray-600 dark:text-gray-400'
                  }`}>
                    {format(day, 'EEEE', { locale: fr })}
                  </div>
                  <div className={`text-xl font-bold mt-1 ${
                    isCurrentDay ? 'text-white dark:text-gray-900' : isPastDay ? 'text-gray-600 dark:text-gray-500' : 'text-gray-900 dark:text-gray-100'
                  }`}>
                    {format(day, 'd', { locale: fr })}
                  </div>
                  {dayAppointments.length > 0 && (
                    <div className={`text-xs mt-1 ${
                      isCurrentDay ? 'text-orange-100 dark:text-gray-800' : isPastDay ? 'text-gray-500 dark:text-gray-500' : 'text-gray-600 dark:text-gray-400'
                    }`}>
                      {dayAppointments.length} {t('calendar_view.appointments_abbr')}
                    </div>
                  )}
                </div>

                {/* Liste des rendez-vous */}
                <div className="space-y-2 min-h-[200px]">
                  {dayAppointments.length === 0 ? (
                    <div className={`p-3 rounded-xl text-center ${
                      isPastDay 
                        ? 'bg-gray-50 dark:bg-gray-800/50 text-gray-400 dark:text-gray-500' 
                        : 'bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 text-gray-500 dark:text-gray-400'
                    }`}>
                      <div className="text-xs">
                        {isPastDay ? t('calendar_view.no_appointments') : t('calendar_view.free')}
                      </div>
                    </div>
                  ) : (
                    dayAppointments.map((appointment, index) => {
                      const statusConfig = getStatusConfig(appointment.status);
                      const StatusIcon = statusConfig.icon;
                      const isOverdue = isPastDay && (appointment.status === 'scheduled' || appointment.status === 'confirmed');
                      
                      return (
                        <div
                          key={`${appointment.id}-${index}`}
                          onClick={() => onEdit(appointment)}
                          className={`p-3 rounded-xl cursor-pointer transition-all duration-200 transform hover:scale-105 hover:shadow-lg border-l-4 ${statusConfig.borderColor} ${statusConfig.bgColor} group relative`}
                        >
                          {/* Heure et statut */}
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <ClockIcon className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                              <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                                {appointment.startTime}
                              </span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <StatusIcon className={`h-3 w-3 ${statusConfig.textColor}`} />
                              {isOverdue && (
                                <ExclamationTriangleIcon className="h-3 w-3 text-red-500" />
                              )}
                            </div>
                          </div>

                          {/* Client */}
                          <div className="flex items-center space-x-2 mb-2">
                            <UserIcon className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                            <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                              {getClientName(appointment.clientId)}
                            </span>
                          </div>

                          {/* Service */}
                          <div className="flex items-center space-x-2 mb-2">
                            <SparklesIcon className="h-4 w-4 text-orange-500 dark:text-orange-400" />
                            <span className="text-xs text-gray-700 dark:text-gray-300 truncate">
                              {getServiceName(appointment.serviceId)}
                            </span>
                          </div>

                          {/* Coiffeur */}
                          <div className="flex items-center space-x-2">
                            <UserIcon className="h-3 w-3 text-orange-600 dark:text-orange-400" />
                            <span className="text-xs text-gray-600 dark:text-gray-400 truncate">
                              {getStylistName(appointment.stylistId)}
                            </span>
                          </div>

                          {/* Badge de statut */}
                          <div className="mt-2 flex items-center justify-between">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusConfig.bgColor} ${statusConfig.textColor}`}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {statusConfig.label}
                            </span>
                            {isOverdue && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300">
                                {t('calendar_view.overdue')}
                              </span>
                            )}
                          </div>

                          {/* Effet hover */}
                          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-orange-600/10 dark:from-orange-400/10 dark:to-orange-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Légende */}
      <div className="bg-white/90 dark:bg-gray-900/70 backdrop-blur-xl rounded-2xl shadow-orange-md dark:shadow-gray-md border border-orange-500/20 dark:border-orange-500/20 p-4 transition-colors duration-300">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">{t('calendar_view.legend.title')}</h3>
        <div className="flex flex-wrap gap-3">
          {[
            { status: 'scheduled' },
            { status: 'confirmed' },
            { status: 'completed' },
            { status: 'cancelled' },
            { status: 'noShow' }
          ].map(({ status }) => {
            const config = getStatusConfig(status as Appointment['status']);
            const StatusIcon = config.icon;
            return (
              <div key={status} className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${config.color}`} />
                <StatusIcon className={`h-4 w-4 ${config.textColor}`} />
                <span className="text-xs text-gray-600 dark:text-gray-400">{config.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CalendarView;
