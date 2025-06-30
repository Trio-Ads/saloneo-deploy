import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  ClockIcon,
  CalendarDaysIcon,
  UserIcon,
  ChartBarIcon,
  FunnelIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
  DocumentChartBarIcon,
  StarIcon,
  TrophyIcon,
  HeartIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { useAppointmentStore } from './store';
import { AppointmentHistoryFilters, AppointmentStatus, ClientHistory, Appointment, AppointmentStats } from './types';
import { useClientStore } from '../clients/store';
import { useTeamStore } from '../team/store';
import { useServiceStore } from '../services/store';
import { TeamMember } from '../team/types';

const AppointmentHistoryPage: React.FC = () => {
  const { t } = useTranslation(['appointments', 'common']);
  const [filters, setFilters] = useState<AppointmentHistoryFilters>({
    startDate: undefined,
    endDate: undefined,
    clientId: undefined,
    stylistId: undefined,
    serviceId: undefined,
    status: undefined
  });
  
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [clientStats, setClientStats] = useState<ClientHistory | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  
  const appointmentStore = useAppointmentStore();
  const { clients } = useClientStore();
  const teamStore = useTeamStore();
  const { services } = useServiceStore();
  
  // Créer des références locales aux fonctions qui n'existent pas encore dans le store
  const getAppointmentHistory = (filters?: AppointmentHistoryFilters) => {
    return appointmentStore.appointments.filter(apt => {
      if (filters?.clientId && apt.clientId !== filters.clientId) return false;
      if (filters?.stylistId && apt.stylistId !== filters.stylistId) return false;
      if (filters?.serviceId && apt.serviceId !== filters.serviceId) return false;
      if (filters?.status && !filters.status.includes(apt.status)) return false;
      if (filters?.startDate && apt.date < filters.startDate) return false;
      if (filters?.endDate && apt.date > filters.endDate) return false;
      return true;
    }).sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.startTime}`);
      const dateB = new Date(`${b.date}T${b.startTime}`);
      return dateB.getTime() - dateA.getTime();
    });
  };
  
  const getClientStats = (clientId: string): ClientHistory => {
    const clientAppointments = appointmentStore.appointments.filter(apt => apt.clientId === clientId);
    
    return {
      clientId,
      stats: {
        totalAppointments: clientAppointments.length,
        completedAppointments: clientAppointments.filter(apt => apt.status === 'completed').length,
        cancelledAppointments: clientAppointments.filter(apt => apt.status === 'cancelled').length,
        noShowAppointments: clientAppointments.filter(apt => apt.status === 'noShow').length,
        averageDuration: 60,
        mostBookedService: '',
        mostBookedStylist: '',
        busyDays: [],
        busyHours: []
      },
      lastAppointment: clientAppointments.length > 0 ? clientAppointments[0].date : '',
      totalSpent: 0,
      loyaltyPoints: 0,
      visitFrequency: 0
    };
  };
  
  const teamMembers: { id: string; name: string }[] = (teamStore.members || []).map(member => ({
    id: member.id,
    name: member.firstName + ' ' + member.lastName
  }));
  
  const appointments = getAppointmentHistory(filters);

  // Calculer les statistiques globales
  const globalStats = useMemo(() => {
    const total = appointments.length;
    const completed = appointments.filter(apt => apt.status === 'completed').length;
    const cancelled = appointments.filter(apt => apt.status === 'cancelled').length;
    const noShow = appointments.filter(apt => apt.status === 'noShow').length;
    const completionRate = total > 0 ? (completed / total) * 100 : 0;

    return {
      total,
      completed,
      cancelled,
      noShow,
      completionRate: Math.round(completionRate)
    };
  }, [appointments]);
  
  useEffect(() => {
    if (selectedClientId) {
      const stats = getClientStats(selectedClientId);
      setClientStats(stats);
    } else {
      setClientStats(null);
    }
  }, [selectedClientId]);
  
  const handleFilterChange = (name: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleStatusChange = (status: AppointmentStatus, checked: boolean) => {
    setFilters(prev => {
      const currentStatus = prev.status || [];
      if (checked) {
        return {
          ...prev,
          status: [...currentStatus, status]
        };
      } else {
        return {
          ...prev,
          status: currentStatus.filter(s => s !== status)
        };
      }
    });
  };
  
  const handleClientChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const clientId = e.target.value;
    setSelectedClientId(clientId);
    handleFilterChange('clientId', clientId || undefined);
  };
  
  const resetFilters = () => {
    setFilters({
      startDate: undefined,
      endDate: undefined,
      clientId: undefined,
      stylistId: undefined,
      serviceId: undefined,
      status: undefined
    });
    setSelectedClientId('');
    setClientStats(null);
  };
  
  const getStatusColor = (status: AppointmentStatus) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'noShow':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'confirmed':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'rescheduled':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };
  
  const getStatusLabel = (status: AppointmentStatus): string => {
    switch (status) {
      case 'completed':
        return t('appointments:status.completed');
      case 'cancelled':
        return t('appointments:status.cancelled');
      case 'noShow':
        return t('appointments:status.noShow');
      case 'scheduled':
        return t('appointments:status.scheduled');
      case 'confirmed':
        return t('appointments:status.confirmed');
      case 'rescheduled':
        return t('appointments:status.rescheduled');
      default:
        return status;
    }
  };
  
  const getClientName = (clientId: string): string => {
    const client = clients.find(c => c.id === clientId);
    return client ? `${client.firstName} ${client.lastName}` : t('common:unknown');
  };
  
  const getStylistName = (stylistId: string): string => {
    const stylist = teamMembers.find(t => t.id === stylistId);
    return stylist ? stylist.name : t('common:unknown');
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-6">
            <div className="p-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl shadow-lg">
              <DocumentChartBarIcon className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {t('appointments:history.title')}
              </h1>
              <p className="text-gray-600 mt-1">Analysez l'historique de vos rendez-vous</p>
            </div>
          </div>

          {/* Statistiques globales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="glass-card p-6 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total RDV</p>
                  <p className="text-3xl font-bold text-gray-900">{globalStats.total}</p>
                </div>
                <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl">
                  <CalendarDaysIcon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>

            <div className="glass-card p-6 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Terminés</p>
                  <p className="text-3xl font-bold text-green-600">{globalStats.completed}</p>
                </div>
                <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl">
                  <SparklesIcon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>

            <div className="glass-card p-6 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Annulés</p>
                  <p className="text-3xl font-bold text-red-600">{globalStats.cancelled}</p>
                </div>
                <div className="p-3 bg-gradient-to-r from-red-500 to-pink-600 rounded-xl">
                  <ClockIcon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>

            <div className="glass-card p-6 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Taux Réussite</p>
                  <p className="text-3xl font-bold text-purple-600">{globalStats.completionRate}%</p>
                </div>
                <div className="p-3 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl">
                  <ChartBarIcon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filtres */}
        <div className="glass-card p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center">
              <FunnelIcon className="h-5 w-5 mr-2 text-purple-600" />
              {t('appointments:history.filters')}
            </h2>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="glass-button text-purple-600 border-purple-200 hover:bg-purple-50"
            >
              {showFilters ? 'Masquer' : 'Afficher'} les filtres
            </button>
          </div>
          
          {showFilters && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Date range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('appointments:history.startDate')}
                  </label>
                  <input
                    type="date"
                    className="glass-input w-full rounded-xl border-0 bg-white/70 backdrop-blur-sm shadow-lg focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all duration-200"
                    value={filters.startDate || ''}
                    onChange={(e) => handleFilterChange('startDate', e.target.value || undefined)}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('appointments:history.endDate')}
                  </label>
                  <input
                    type="date"
                    className="glass-input w-full rounded-xl border-0 bg-white/70 backdrop-blur-sm shadow-lg focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all duration-200"
                    value={filters.endDate || ''}
                    onChange={(e) => handleFilterChange('endDate', e.target.value || undefined)}
                  />
                </div>
                
                {/* Client */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('appointments:history.client')}
                  </label>
                  <select
                    className="glass-input w-full rounded-xl border-0 bg-white/70 backdrop-blur-sm shadow-lg focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all duration-200"
                    value={selectedClientId}
                    onChange={handleClientChange}
                  >
                    <option value="">{t('common:all')}</option>
                    {clients.map(client => (
                      <option key={client.id} value={client.id}>
                        {client.firstName} {client.lastName}
                      </option>
                    ))}
                  </select>
                </div>
                
                {/* Stylist */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('appointments:history.stylist')}
                  </label>
                  <select
                    className="glass-input w-full rounded-xl border-0 bg-white/70 backdrop-blur-sm shadow-lg focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all duration-200"
                    value={filters.stylistId || ''}
                    onChange={(e) => handleFilterChange('stylistId', e.target.value || undefined)}
                  >
                    <option value="">{t('common:all')}</option>
                    {teamMembers.map(member => (
                      <option key={member.id} value={member.id}>
                        {member.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                {/* Service */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('appointments:history.service')}
                  </label>
                  <select
                    className="glass-input w-full rounded-xl border-0 bg-white/70 backdrop-blur-sm shadow-lg focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all duration-200"
                    value={filters.serviceId || ''}
                    onChange={(e) => handleFilterChange('serviceId', e.target.value || undefined)}
                  >
                    <option value="">{t('common:all')}</option>
                    {services.map(service => (
                      <option key={service.id} value={service.id}>
                        {service.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              {/* Status checkboxes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  {t('appointments:history.status')}
                </label>
                <div className="flex flex-wrap gap-3">
                  {(['scheduled', 'confirmed', 'completed', 'cancelled', 'noShow', 'rescheduled'] as AppointmentStatus[]).map(status => (
                    <label key={status} className="inline-flex items-center glass-card p-3 cursor-pointer hover:shadow-md transition-all duration-200">
                      <input
                        type="checkbox"
                        className="form-checkbox h-4 w-4 text-purple-600 rounded focus:ring-purple-500"
                        checked={filters.status?.includes(status) || false}
                        onChange={(e) => handleStatusChange(status, e.target.checked)}
                      />
                      <span className="ml-2 text-sm text-gray-700">{getStatusLabel(status)}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-end">
                <button
                  onClick={resetFilters}
                  className="glass-button bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white border-0 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                >
                  <ArrowPathIcon className="h-4 w-4 mr-2" />
                  {t('common:reset')}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Client statistics */}
        {clientStats && (
          <div className="glass-card p-6 mb-8">
            <h2 className="text-lg font-semibold mb-6 flex items-center">
              <UserIcon className="h-5 w-5 mr-2 text-purple-600" />
              {t('appointments:history.clientStats', { client: getClientName(clientStats.clientId) })}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <div className="glass-card p-4 bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-purple-600 font-medium">{t('appointments:history.totalAppointments')}</div>
                    <div className="text-2xl font-bold text-purple-900">{clientStats.stats.totalAppointments}</div>
                  </div>
                  <TrophyIcon className="h-8 w-8 text-purple-600" />
                </div>
              </div>
              
              <div className="glass-card p-4 bg-gradient-to-br from-green-50 to-green-100 border border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-green-600 font-medium">{t('appointments:history.completedAppointments')}</div>
                    <div className="text-2xl font-bold text-green-900">{clientStats.stats.completedAppointments}</div>
                  </div>
                  <SparklesIcon className="h-8 w-8 text-green-600" />
                </div>
              </div>
              
              <div className="glass-card p-4 bg-gradient-to-br from-red-50 to-red-100 border border-red-200">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-red-600 font-medium">{t('appointments:history.cancelledAppointments')}</div>
                    <div className="text-2xl font-bold text-red-900">{clientStats.stats.cancelledAppointments}</div>
                  </div>
                  <ClockIcon className="h-8 w-8 text-red-600" />
                </div>
              </div>
              
              <div className="glass-card p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-yellow-600 font-medium">{t('appointments:history.noShowAppointments')}</div>
                    <div className="text-2xl font-bold text-yellow-900">{clientStats.stats.noShowAppointments}</div>
                  </div>
                  <HeartIcon className="h-8 w-8 text-yellow-600" />
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="glass-card p-4">
                <h3 className="text-md font-semibold mb-4 flex items-center">
                  <StarIcon className="h-5 w-5 mr-2 text-purple-600" />
                  {t('appointments:history.preferences')}
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">{t('appointments:history.averageDuration')}:</span>
                    <span className="font-medium bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-sm">
                      {Math.round(clientStats.stats.averageDuration)} min
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">{t('appointments:history.visitFrequency')}:</span>
                    <span className="font-medium bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
                      {clientStats.visitFrequency > 0 
                        ? t('appointments:history.daysInterval', { days: Math.round(clientStats.visitFrequency) })
                        : t('appointments:history.notEnoughData')}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">{t('appointments:history.favoriteService')}:</span>
                    <span className="font-medium bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm">
                      {clientStats.stats.mostBookedService 
                        ? services.find(s => s.id === clientStats.stats.mostBookedService)?.name || t('common:unknown')
                        : t('appointments:history.notEnoughData')}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">{t('appointments:history.favoriteStylist')}:</span>
                    <span className="font-medium bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-sm">
                      {clientStats.stats.mostBookedStylist
                        ? teamMembers.find(t => t.id === clientStats.stats.mostBookedStylist)?.name || t('common:unknown')
                        : t('appointments:history.notEnoughData')}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="glass-card p-4">
                <h3 className="text-md font-semibold mb-4 flex items-center">
                  <ChartBarIcon className="h-5 w-5 mr-2 text-purple-600" />
                  {t('appointments:history.busyTimes')}
                </h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm text-gray-600 mb-2">{t('appointments:history.busyDays')}</h4>
                    <div className="flex flex-wrap gap-2">
                      {clientStats.stats.busyDays.slice(0, 3).map((day: { day: string; count: number }) => (
                        <span key={day.day} className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                          {day.day} ({day.count})
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm text-gray-600 mb-2">{t('appointments:history.busyHours')}</h4>
                    <div className="flex flex-wrap gap-2">
                      {clientStats.stats.busyHours.slice(0, 3).map((hour: { hour: string; count: number }) => (
                        <span key={hour.hour} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                          {hour.hour}h ({hour.count})
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Appointments list */}
        <div className="glass-card overflow-hidden">
          <div className="p-6 border-b border-gray-200/50">
            <h2 className="text-lg font-semibold flex items-center">
              <CalendarDaysIcon className="h-5 w-5 mr-2 text-purple-600" />
              {t('appointments:history.results', { count: appointments.length })}
            </h2>
          </div>
          
          {appointments.length === 0 ? (
            <div className="p-12 text-center">
              <div className="mx-auto w-24 h-24 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full flex items-center justify-center mb-4">
                <MagnifyingGlassIcon className="h-12 w-12 text-purple-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun résultat trouvé</h3>
              <p className="text-gray-500">{t('appointments:history.noResults')}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200/50">
                <thead className="bg-gradient-to-r from-purple-50 to-pink-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('appointments:date')}
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('appointments:time')}
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('appointments:client')}
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('appointments:service')}
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('appointments:stylist')}
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('appointments:status')}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white/50 backdrop-blur-sm divide-y divide-gray-200/50">
                  {appointments.map((appointment, index) => (
                    <tr key={appointment.id} className={`hover:bg-white/70 transition-all duration-200 ${index % 2 === 0 ? 'bg-white/30' : 'bg-white/20'}`}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {format(parseISO(appointment.date), 'EEEE d MMMM yyyy', { locale: fr })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        <div className="flex items-center">
                          <ClockIcon className="h-4 w-4 mr-1 text-gray-400" />
                          {appointment.startTime} - {appointment.endTime}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center">
                          <UserIcon className="h-4 w-4 mr-1 text-gray-400" />
                          {getClientName(appointment.clientId)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {appointment.serviceName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {getStylistName(appointment.stylistId)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(appointment.status)}`}>
                          {getStatusLabel(appointment.status)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AppointmentHistoryPage;
