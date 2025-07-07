import React from 'react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { fr, enUS, es, pt, tr } from 'date-fns/locale';
import { 
  CalendarDaysIcon,
  ClockIcon,
  UserIcon,
  SparklesIcon,
  CheckCircleIcon,
  XMarkIcon,
  PencilIcon,
  ExclamationTriangleIcon,
  EyeSlashIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import { Appointment } from '../types';
import { useClientStore } from '../../clients/store';
import { useServiceStore } from '../../services/store';
import { useTeamStore } from '../../team/store';
import { useAppointmentStore } from '../store';

interface AppointmentListProps {
  appointments: Appointment[];
  onEdit: (appointment: Appointment) => void;
  onCancel: (appointmentId: string) => void;
  onComplete: (appointmentId: string) => void;
  onNoShow: (appointmentId: string) => void;
  onConfirm?: (appointmentId: string) => void;
}

const AppointmentList: React.FC<AppointmentListProps> = ({
  appointments,
  onEdit,
  onCancel,
  onComplete,
  onNoShow,
  onConfirm,
}) => {
  const { t, i18n } = useTranslation('appointments');

  // Fonction pour obtenir la locale date-fns basée sur la langue actuelle
  const getDateLocale = () => {
    switch (i18n.language) {
      case 'fr': return fr;
      case 'en': return enUS;
      case 'es': return es;
      case 'pt': return pt;
      case 'tr': return tr;
      case 'ar': return enUS; // Fallback pour l'arabe
      default: return fr; // Fallback par défaut
    }
  };
  const clients = useClientStore((state) => state.clients);
  const services = useServiceStore((state) => state.services);
  const stylists = useTeamStore((state) => state.members);

  const getClientName = (appointment: Appointment) => {
    // Si les informations client sont directement disponibles dans le rendez-vous, les utiliser
    if (appointment.clientInfo && appointment.clientInfo.firstName && appointment.clientInfo.lastName) {
      return `${appointment.clientInfo.firstName} ${appointment.clientInfo.lastName}`;
    }
    
    // Sinon, chercher dans le store
    const client = clients.find((c) => c.id === appointment.clientId);
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
          bgColor: 'bg-blue-100',
          textColor: 'text-blue-800',
          icon: CalendarDaysIcon,
          label: t('appointment_list.status_labels.scheduled')
        };
      case 'confirmed':
        return {
          color: 'from-green-500 to-emerald-500',
          bgColor: 'bg-green-100',
          textColor: 'text-green-800',
          icon: CheckCircleIcon,
          label: t('appointment_list.status_labels.confirmed')
        };
      case 'completed':
        return {
          color: 'from-indigo-500 to-purple-600',
          bgColor: 'bg-purple-100',
          textColor: 'text-purple-800',
          icon: CheckIcon,
          label: t('appointment_list.status_labels.completed')
        };
      case 'cancelled':
        return {
          color: 'from-red-500 to-orange-500',
          bgColor: 'bg-red-100',
          textColor: 'text-red-800',
          icon: XMarkIcon,
          label: t('appointment_list.status_labels.cancelled')
        };
      case 'noShow':
        return {
          color: 'from-gray-500 to-slate-500',
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-800',
          icon: EyeSlashIcon,
          label: t('appointment_list.status_labels.no_show')
        };
      default:
        return {
          color: 'from-gray-500 to-slate-500',
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-800',
          icon: CalendarDaysIcon,
          label: status
        };
    }
  };

  const formatDate = (date: string | Date) => {
    try {
      let dateObj: Date;
      
      if (typeof date === 'string') {
        // Gérer les deux formats : ISO (2025-07-06T00:00:00.000Z) et simple (2025-07-06)
        if (date.includes('T')) {
          // Format ISO du backend
          dateObj = new Date(date);
        } else {
          // Format simple YYYY-MM-DD
          dateObj = new Date(date + 'T00:00:00');
        }
      } else {
        dateObj = date;
      }
      
      // Vérifier si la date est valide
      if (isNaN(dateObj.getTime())) {
        return t('appointment_list.invalid_date');
      }
      return format(dateObj, 'EEEE d MMMM yyyy', { locale: getDateLocale() });
    } catch (error) {
      console.error('Erreur de formatage de date:', error, date);
      return t('appointment_list.invalid_date');
    }
  };

  // Trier les rendez-vous par date et heure
  const appointmentsList = Array.isArray(appointments) ? appointments : [];
  
  // Filtrer les rendez-vous invalides (sans date ou avec date invalide)
  const validAppointments = appointmentsList.filter(appointment => {
    if (!appointment || !appointment.date || typeof appointment.date !== 'string') {
      console.warn('⚠️ Rendez-vous invalide filtré:', appointment);
      return false;
    }
    return true;
  });
  
  const sortedAppointments = [...validAppointments].sort((a, b) => {
    try {
      let dateA: Date, dateB: Date;
      
      // Gérer les deux formats de dates pour le tri
      if (a.date.includes('T')) {
        // Format ISO du backend
        dateA = new Date(a.date);
        dateA.setHours(parseInt(a.startTime.split(':')[0]), parseInt(a.startTime.split(':')[1]));
      } else {
        // Format simple YYYY-MM-DD
        dateA = new Date(`${a.date}T${a.startTime}`);
      }
      
      if (b.date.includes('T')) {
        // Format ISO du backend
        dateB = new Date(b.date);
        dateB.setHours(parseInt(b.startTime.split(':')[0]), parseInt(b.startTime.split(':')[1]));
      } else {
        // Format simple YYYY-MM-DD
        dateB = new Date(`${b.date}T${b.startTime}`);
      }
      
      // Vérifier que les dates sont valides
      if (isNaN(dateA.getTime()) || isNaN(dateB.getTime())) {
        console.warn('⚠️ Date invalide lors du tri:', { a: a.date, b: b.date });
        return 0;
      }
      
      return dateA.getTime() - dateB.getTime();
    } catch (error) {
      console.error('❌ Erreur lors du tri des rendez-vous:', error);
      return 0;
    }
  });

  // Grouper les rendez-vous par date
  const appointmentsByDate = sortedAppointments.reduce((acc, appointment) => {
    // Normaliser la date pour le groupement (extraire seulement la partie date)
    let normalizedDate = appointment.date;
    if (appointment.date.includes('T')) {
      normalizedDate = appointment.date.split('T')[0];
    }
    
    if (!acc[normalizedDate]) {
      acc[normalizedDate] = [];
    }
    acc[normalizedDate].push(appointment);
    return acc;
  }, {} as Record<string, Appointment[]>);

  if (sortedAppointments.length === 0) {
    return (
      <div className="glass-card p-12 text-center">
        <div className="mx-auto w-24 h-24 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mb-6 shadow-lg animate-pulse">
          <CalendarDaysIcon className="h-12 w-12 text-white" />
        </div>
        <h3 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-3">
          {t('appointment_list.no_appointments')}
        </h3>
        <p className="text-gray-600 text-lg">{t('appointment_list.no_appointments_period')}</p>
        <div className="mt-6 inline-flex items-center px-4 py-2 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full text-indigo-700 text-sm font-medium">
          📅 {t('appointment_list.schedule_first')}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {Object.entries(appointmentsByDate).map(([date, dayAppointments], index) => (
        <div key={`date-${date}-${index}`} className="animate-fadeIn">
          {/* Header de date */}
          <div className="flex items-center space-x-3 mb-4">
            <div className="relative p-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg shadow-md shadow-purple-500/25 transform hover:scale-105 transition-all duration-300">
              <CalendarDaysIcon className="h-4 w-4 text-white" />
              <div className="absolute inset-0 bg-white/20 rounded-lg opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            <div>
              <h3 className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent capitalize">
                {formatDate(date)}
              </h3>
              <p className="text-xs text-gray-500">{dayAppointments.length} {t('appointment_list.appointments_count')}</p>
            </div>
          </div>

          {/* Liste des rendez-vous du jour */}
          <div className="space-y-4">
            {dayAppointments.map((appointment, appointmentIndex) => {
              const statusConfig = getStatusConfig(appointment.status);
              const StatusIcon = statusConfig.icon;
              const isPastAppointment = useAppointmentStore.getState().isPastAppointment(appointment);
              const isOverdue = isPastAppointment && (appointment.status === 'scheduled' || appointment.status === 'confirmed');
              
              return (
                <div
                  key={`appointment-${appointment.id || `${date}-${appointmentIndex}`}`}
                  className="glass-card p-4 hover:shadow-xl transition-all duration-300 transform hover:scale-[1.01] group border border-white/20"
                >
                  {/* Header du rendez-vous */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 bg-gradient-to-r ${statusConfig.color} rounded-full flex items-center justify-center shadow-lg`}>
                        <StatusIcon className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <div className="flex items-center space-x-1">
                            <ClockIcon className="h-4 w-4 text-purple-600" />
                            <span className="text-base font-bold text-gray-900">
                              {appointment.startTime}
                            </span>
                          </div>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusConfig.bgColor} ${statusConfig.textColor} shadow-sm`}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {statusConfig.label}
                          </span>
                          {isOverdue && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 animate-pulse">
                              <ExclamationTriangleIcon className="h-3 w-3 mr-1" />
                              Date passée
                            </span>
                          )}
                        </div>
                        <h4 className="text-base font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                          {getClientName(appointment)}
                        </h4>
                      </div>
                    </div>

                    {/* Actions */}
                    {(appointment.status === 'scheduled' || appointment.status === 'confirmed') && (
                      <div className="flex items-center space-x-2">
                        {appointment.status === 'scheduled' && onConfirm && (
                          <button
                            onClick={() => onConfirm(appointment.id)}
                            className="glass-button p-3 text-blue-600 hover:text-blue-800 hover:bg-blue-50 transition-all duration-200 transform hover:scale-110 shadow-lg hover:shadow-xl"
                            title={t('appointment_list.tooltips.confirm')}
                          >
                            <CheckCircleIcon className="h-5 w-5" />
                          </button>
                        )}
                        <button
                          onClick={() => onEdit(appointment)}
                          className="glass-button p-3 text-purple-600 hover:text-purple-800 hover:bg-purple-50 transition-all duration-200 transform hover:scale-110 shadow-lg hover:shadow-xl"
                          title={t('appointment_list.tooltips.edit')}
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => onComplete(appointment.id)}
                          className="glass-button p-3 text-green-600 hover:text-green-800 hover:bg-green-50 transition-all duration-200 transform hover:scale-110 shadow-lg hover:shadow-xl"
                          title={t('appointment_list.tooltips.complete')}
                        >
                          <CheckIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => onNoShow(appointment.id)}
                          className="glass-button p-3 text-gray-600 hover:text-gray-800 hover:bg-gray-50 transition-all duration-200 transform hover:scale-110 shadow-lg hover:shadow-xl"
                          title={t('appointment_list.tooltips.no_show')}
                        >
                          <EyeSlashIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => onCancel(appointment.id)}
                          className="glass-button p-3 text-red-600 hover:text-red-800 hover:bg-red-50 transition-all duration-200 transform hover:scale-110 shadow-lg hover:shadow-xl"
                          title={t('appointment_list.tooltips.cancel')}
                        >
                          <XMarkIcon className="h-5 w-5" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Détails du rendez-vous */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center space-x-3 p-3 glass-card bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl">
                      <SparklesIcon className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">{t('appointment_list.details.service')}</p>
                        <p className="text-sm text-gray-900 font-medium">{getServiceName(appointment.serviceId)}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3 p-3 glass-card bg-gradient-to-r from-teal-50 to-emerald-50 rounded-xl">
                      <UserIcon className="h-5 w-5 text-teal-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">{t('appointment_list.details.stylist')}</p>
                        <p className="text-sm text-gray-900 font-medium">{getStylistName(appointment.stylistId)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  {appointment.notes && (
                    <div className="p-4 glass-card bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl border-l-4 border-purple-500">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-sm font-medium text-gray-700">{t('appointment_list.details.notes')}</span>
                      </div>
                      <p className="text-sm text-gray-900 leading-relaxed italic">"{appointment.notes}"</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default AppointmentList;
