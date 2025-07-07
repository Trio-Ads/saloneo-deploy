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
          color: 'from-blue-500 to-cyan-500',
          bgColor: 'bg-blue-50',
          textColor: 'text-blue-800',
          borderColor: 'border-blue-300',
          icon: CalendarDaysIcon,
          label: t('appointment_list.status_labels.scheduled')
        };
      case 'confirmed':
        return {
          color: 'from-green-500 to-emerald-500',
          bgColor: 'bg-green-50',
          textColor: 'text-green-800',
          borderColor: 'border-green-300',
          icon: CheckCircleIcon,
          label: t('appointment_list.status_labels.confirmed')
        };
      case 'completed':
        return {
          color: 'from-purple-500 to-pink-500',
          bgColor: 'bg-purple-50',
          textColor: 'text-purple-800',
          borderColor: 'border-purple-300',
          icon: CheckIcon,
          label: t('appointment_list.status_labels.completed')
        };
      case 'cancelled':
        return {
          color: 'from-red-500 to-orange-500',
          bgColor: 'bg-red-50',
          textColor: 'text-red-800',
          borderColor: 'border-red-300',
          icon: XMarkIcon,
          label: t('appointment_list.status_labels.cancelled')
        };
      case 'noShow':
        return {
          color: 'from-gray-500 to-slate-500',
          bgColor: 'bg-gray-50',
          textColor: 'text-gray-800',
          borderColor: 'border-gray-300',
          icon: EyeSlashIcon,
          label: t('appointment_list.status_labels.no_show')
        };
      default:
        return {
          color: 'from-gray-500 to-slate-500',
          bgColor: 'bg-gray-50',
          textColor: 'text-gray-800',
          borderColor: 'border-gray-300',
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
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl shadow-lg">
              <CalendarDaysIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent capitalize">
                {format(weekDays[0], 'MMMM yyyy', { locale: fr })}
              </h2>
              <p className="text-sm text-gray-600">
                {t('calendar_view.week_from')} {format(weekDays[0], 'd', { locale: fr })} {t('calendar_view.week_to')} {format(weekDays[6], 'd MMMM', { locale: fr })}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleToday}
              className="glass-button bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 px-4 py-2 text-sm"
            >
              {t('calendar_view.today')}
            </button>
            
            <div className="flex items-center space-x-1">
              <button
                onClick={handlePreviousWeek}
                className="glass-button p-3 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 transition-all duration-200 transform hover:scale-110 shadow-lg hover:shadow-xl"
                title={t('calendar_view.previous_week')}
              >
                <ChevronLeftIcon className="h-5 w-5" />
              </button>
              <button
                onClick={handleNextWeek}
                className="glass-button p-3 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 transition-all duration-200 transform hover:scale-110 shadow-lg hover:shadow-xl"
                title={t('calendar_view.next_week')}
              >
                <ChevronRightIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Statistiques de la semaine */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-3 p-3 glass-card bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl">
            <CalendarDaysIcon className="h-5 w-5 text-blue-600" />
            <div>
              <p className="text-sm font-medium text-gray-700">{t('calendar_view.stats.total')}</p>
              <p className="text-lg font-bold text-blue-600">{getTotalAppointments()}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-3 glass-card bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
            <CheckCircleIcon className="h-5 w-5 text-green-600" />
            <div>
              <p className="text-sm font-medium text-gray-700">{t('calendar_view.stats.confirmed')}</p>
              <p className="text-lg font-bold text-green-600">
                {appointments.filter(a => a.status === 'confirmed').length}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-3 glass-card bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
            <CheckIcon className="h-5 w-5 text-purple-600" />
            <div>
              <p className="text-sm font-medium text-gray-700">{t('calendar_view.stats.completed')}</p>
              <p className="text-lg font-bold text-purple-600">
                {appointments.filter(a => a.status === 'completed').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Grille du calendrier */}
      <div className="glass-card p-6">
        <div className="grid grid-cols-7 gap-4">
          {weekDays.map((day, dayIndex) => {
            const dayAppointments = getDayAppointments(day);
            const isCurrentDay = isToday(day);
            const isPastDay = isPast(day) && !isToday(day);
            
            return (
              <div 
                key={day.toISOString()} 
                className={`space-y-3 ${isCurrentDay ? 'ring-2 ring-indigo-500 ring-opacity-50 rounded-xl p-2' : ''}`}
              >
                {/* Header du jour */}
                <div className={`text-center p-3 rounded-xl transition-all duration-200 ${
                  isCurrentDay 
                    ? 'glass-card bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg' 
                    : isPastDay
                    ? 'glass-card bg-gradient-to-r from-gray-100 to-slate-100 text-gray-600'
                    : 'glass-card bg-gradient-to-r from-white to-gray-50 text-gray-900'
                }`}>
                  <div className={`text-xs font-medium uppercase tracking-wide ${
                    isCurrentDay ? 'text-white' : isPastDay ? 'text-gray-500' : 'text-gray-600'
                  }`}>
                    {format(day, 'EEEE', { locale: fr })}
                  </div>
                  <div className={`text-xl font-bold mt-1 ${
                    isCurrentDay ? 'text-white' : isPastDay ? 'text-gray-600' : 'text-gray-900'
                  }`}>
                    {format(day, 'd', { locale: fr })}
                  </div>
                  {dayAppointments.length > 0 && (
                    <div className={`text-xs mt-1 ${
                      isCurrentDay ? 'text-indigo-100' : isPastDay ? 'text-gray-500' : 'text-gray-600'
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
                        ? 'glass-card bg-gray-50 text-gray-400' 
                        : 'glass-card bg-gradient-to-r from-gray-50 to-slate-50 text-gray-500'
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
                          className={`glass-card p-3 rounded-xl cursor-pointer transition-all duration-200 transform hover:scale-105 hover:shadow-lg border-l-4 ${statusConfig.borderColor} ${statusConfig.bgColor} group`}
                        >
                          {/* Heure et statut */}
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <ClockIcon className="h-4 w-4 text-indigo-600" />
                              <span className="text-sm font-bold text-gray-900">
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
                            <UserIcon className="h-4 w-4 text-purple-600" />
                            <span className="text-sm font-medium text-gray-900 truncate">
                              {getClientName(appointment.clientId)}
                            </span>
                          </div>

                          {/* Service */}
                          <div className="flex items-center space-x-2 mb-2">
                            <SparklesIcon className="h-4 w-4 text-blue-600" />
                            <span className="text-xs text-gray-700 truncate">
                              {getServiceName(appointment.serviceId)}
                            </span>
                          </div>

                          {/* Coiffeur */}
                          <div className="flex items-center space-x-2">
                            <UserIcon className="h-3 w-3 text-green-600" />
                            <span className="text-xs text-gray-600 truncate">
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
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                {t('calendar_view.overdue')}
                              </span>
                            )}
                          </div>

                          {/* Effet hover */}
                          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />
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
      <div className="glass-card p-4">
        <h3 className="text-sm font-medium text-gray-700 mb-3">{t('calendar_view.legend.title')}</h3>
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
                <span className="text-xs text-gray-600">{config.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CalendarView;
