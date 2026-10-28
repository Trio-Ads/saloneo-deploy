import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  CalendarDaysIcon,
  PlusIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ListBulletIcon,
  CalendarIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import { Appointment, AppointmentStatus, AppointmentFormData } from './types';
import { useAppointmentStore } from './store';
import { useServiceStore } from '../services/store';
import { useClientStore } from '../clients/store';
import { useTeamStore } from '../team/store';
import AppointmentList from './components/AppointmentList';
import AppointmentForm from './components/AppointmentForm';
import CalendarView from './components/CalendarView';
import { useSocket } from '../../hooks/useSocket';
import { useSubscriptionLimits } from '../subscription/hooks/useSubscriptionLimits';
import { SubscriptionLimitWidget } from '../subscription/components/SubscriptionLimitWidget';
import { PageHeader, Panel, StatGroup, EmptyState, Segmented } from '../../components/ui';

const AppointmentsPage: React.FC = () => {
  const { t } = useTranslation('appointments');
  const {
    appointments,
    addAppointment,
    updateAppointment,
    cancelAppointment,
    completeAppointment,
    markAsNoShow,
    confirmAppointment,
    getPastAppointments,
    processPastAppointments,
    loadAppointments,
    isLoading,
    error
  } = useAppointmentStore();

  const services = useServiceStore((state) => state.services);
  const fetchClients = useClientStore((state) => state.fetchClients);
  const { checkAppointmentLimit, currentPlan, usageStats } = useSubscriptionLimits();
  
  // Enable real-time updates
  useSocket();

  const [showForm, setShowForm] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<AppointmentStatus | 'all'>('all');
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [pastAppointmentsCount, setPastAppointmentsCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const formRef = React.useRef<HTMLDivElement>(null);
  
  // Charger toutes les données nécessaires au démarrage
  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([
          loadAppointments?.(),
          fetchClients()
        ]);
      } catch (error) {
        console.error('❌ Erreur lors du chargement des données:', error);
      }
    };

    loadData();
  }, [loadAppointments, fetchClients]);

  
  // Vérifier les rendez-vous passés au chargement
  useEffect(() => {
    const pastAppointments = getPastAppointments();
    setPastAppointmentsCount(pastAppointments.length);
  }, [appointments, getPastAppointments]);

  const filteredAppointments = useMemo(() => {
    if (!appointments || !Array.isArray(appointments)) {
      console.warn('⚠️ Appointments data is not an array:', appointments);
      return [];
    }
    
    let filtered = appointments;
    
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(appointment => appointment.status === selectedStatus);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(appointment => {
        const clientName = appointment.clientInfo 
          ? `${appointment.clientInfo.firstName} ${appointment.clientInfo.lastName}`.toLowerCase()
          : '';
        const serviceName = appointment.serviceName?.toLowerCase() || '';
        const searchLower = searchTerm.toLowerCase();
        
        return clientName.includes(searchLower) || serviceName.includes(searchLower);
      });
    }
    
    return filtered;
  }, [appointments, selectedStatus, searchTerm]);

  // Calculer les statistiques des rendez-vous
  const appointmentStats = useMemo(() => {
    if (!appointments || !Array.isArray(appointments)) return { total: 0, scheduled: 0, confirmed: 0, completed: 0 };
    
    return {
      total: appointments.length,
      scheduled: appointments.filter(a => a.status === 'scheduled').length,
      confirmed: appointments.filter(a => a.status === 'confirmed').length,
      completed: appointments.filter(a => a.status === 'completed').length,
    };
  }, [appointments]);

  // Afficher un état de chargement si les données ne sont pas encore disponibles
  if (!appointments && isLoading) {
    return (
      <div className="py-6 sm:py-8">
        <Panel>
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="size-8 animate-spin rounded-full border-2 border-gray-200 border-t-orange-500 dark:border-gray-700 dark:border-t-orange-400" />
            <p className="mt-4 text-sm font-medium text-gray-900 dark:text-gray-50">{t('loading.planning')}</p>
          </div>
        </Panel>
      </div>
    );
  }

  const handleAddClick = () => {
    setEditingAppointment(null);
    setShowForm(true);
  };

  const handleEditClick = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    setShowForm(true);
  };

  const handleFormSubmit = async (data: AppointmentFormData) => {
    try {
      if (editingAppointment) {
        updateAppointment(editingAppointment.id, data);
      } else {
        await addAppointment(data);
        alert(t('success_messages.appointment_created'));
      }
      setShowForm(false);
      setEditingAppointment(null);
    } catch (error) {
      console.error(t('errors.form_submission'), error);
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingAppointment(null);
  };

  // Auto-scroll vers le formulaire quand il s'ouvre
  React.useEffect(() => {
    if (showForm && formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [showForm]);

  const handleCancelAppointment = (appointmentId: string) => {
    if (window.confirm(t('messages.confirm_cancel'))) {
      cancelAppointment(appointmentId);
    }
  };

  const handleCompleteAppointment = (appointmentId: string) => {
    completeAppointment(appointmentId);
  };

  const handleNoShowAppointment = (appointmentId: string) => {
    if (window.confirm(t('messages.confirm_no_show'))) {
      markAsNoShow(appointmentId);
    }
  };

  const handleConfirmAppointment = (appointmentId: string) => {
    confirmAppointment(appointmentId);
  };
  
  const handleProcessPastAppointments = async (action: 'noShow' | 'completed') => {
    if (pastAppointmentsCount === 0) {
      alert(t('past_appointments.none_to_process'));
      return;
    }
    
    const actionText = action === 'noShow' ? t('past_appointments.no_show_status') : t('past_appointments.completed_status');
    
    if (window.confirm(`${pastAppointmentsCount} ${t('past_appointments.found_message')} "${actionText}" ?`)) {
      try {
        const processed = await processPastAppointments(action);
        alert(`${processed} ${t('past_appointments.processed_message')}`);
        setPastAppointmentsCount(0);
      } catch (error) {
        console.error('Erreur lors du traitement des rendez-vous passés:', error);
        alert(t('past_appointments.processing_error'));
      }
    }
  };

  return (
    <div className="py-6 sm:py-8">
      <PageHeader
        title={t('title')}
        subtitle={t('page_subtitle')}
        meta={
          <>
            <span className="tabular-nums">{appointmentStats.total} {t('stats.total_appointments_badge')}</span>
            {usageStats && (
              <SubscriptionLimitWidget
                title={t('limits.title')}
                limitCheck={checkAppointmentLimit()}
                planName={currentPlan}
                resourceType={t('limits.resource')}
              />
            )}
          </>
        }
        actions={
          <>
            <Link to="/appointments/history" className="btn-secondary">
              <ClockIcon className="size-4" />
              {t('history_link')}
            </Link>
            <button type="button" onClick={handleAddClick} className="btn-primary" disabled={isLoading}>
              <PlusIcon className="size-4" />
              {t('new_appointment')}
            </button>
          </>
        }
      />

      {pastAppointmentsCount > 0 && (
        <div className="panel mb-6 flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center dark:bg-gray-900 dark:border-gray-800">
          <div className="flex flex-1 items-start gap-3 text-sm">
            <ExclamationTriangleIcon className="size-5 shrink-0 text-amber-500" />
            <p className="text-gray-700 dark:text-gray-300">{t('past_appointments.notice', { count: pastAppointmentsCount })}</p>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => handleProcessPastAppointments('completed')} className="btn-secondary flex-1 sm:flex-none">
              <CheckCircleIcon className="size-4" />
              {t('past_appointments.mark_completed')}
            </button>
            <button type="button" onClick={() => handleProcessPastAppointments('noShow')} className="btn-ghost flex-1 sm:flex-none">
              {t('past_appointments.mark_no_show')}
            </button>
          </div>
        </div>
      )}

      <StatGroup
        items={[
          { label: t('stats.total'), value: appointmentStats.total, hint: t('stats.all_appointments') },
          { label: t('stats.scheduled'), value: appointmentStats.scheduled, hint: t('stats.awaiting_confirmation'), accent: appointmentStats.scheduled > 0 },
          { label: t('stats.confirmed'), value: appointmentStats.confirmed, hint: t('stats.ready_to_perform') },
          { label: t('stats.completed'), value: appointmentStats.completed, hint: t('stats.services_performed') },
        ]}
      />

      {!showForm && (
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div className="relative w-full sm:w-72">
            <MagnifyingGlassIcon className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              aria-label={t('search.placeholder')}
              placeholder={t('search.placeholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="field ps-9"
            />
          </div>
          <select
            aria-label={t('filters.all_status')}
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as AppointmentStatus | 'all')}
            className="field w-auto min-w-0 flex-1 sm:flex-none"
          >
            <option value="all">{t('filters.all_status')}</option>
            <option value="scheduled">{t('status.scheduled')}</option>
            <option value="confirmed">{t('status.confirmed')}</option>
            <option value="completed">{t('status.completed')}</option>
            <option value="cancelled">{t('status.cancelled')}</option>
            <option value="noShow">{t('status.no_show')}</option>
          </select>
          <Segmented
            className="sm:ms-auto"
            value={viewMode}
            onChange={setViewMode}
            options={[
              { value: 'list', label: <span className="max-sm:sr-only">{t('view_modes.list')}</span>, icon: ListBulletIcon },
              { value: 'calendar', label: <span className="max-sm:sr-only">{t('view_modes.calendar')}</span>, icon: CalendarIcon },
            ]}
          />
        </div>
      )}

      <div ref={formRef} className="scroll-mt-24">
        {showForm ? (
          <AppointmentForm
            initialData={editingAppointment ? {
              clientId: editingAppointment.clientId,
              serviceId: editingAppointment.serviceId,
              stylistId: editingAppointment.stylistId,
              date: editingAppointment.date,
              startTime: editingAppointment.startTime,
              serviceDuration: services.find(s => s.id === editingAppointment.serviceId)?.duration || 0,
              notes: editingAppointment.notes
            } : undefined}
            onSubmit={handleFormSubmit}
            onCancel={handleFormCancel}
          />
        ) : viewMode === 'list' ? (
          filteredAppointments.length === 0 ? (
            <Panel>
              <EmptyState
                icon={CalendarDaysIcon}
                title={t('empty_state.no_appointments')}
                body={searchTerm || selectedStatus !== 'all' ? t('empty_state.modify_filters') : t('empty_state.create_first')}
                action={!searchTerm && selectedStatus === 'all' && (
                  <button type="button" onClick={handleAddClick} className="btn-primary">
                    <PlusIcon className="size-4" />
                    {t('empty_state.create_appointment')}
                  </button>
                )}
              />
            </Panel>
          ) : (
            <AppointmentList
              appointments={filteredAppointments}
              onEdit={handleEditClick}
              onCancel={handleCancelAppointment}
              onComplete={handleCompleteAppointment}
              onNoShow={handleNoShowAppointment}
              onConfirm={handleConfirmAppointment}
            />
          )
        ) : (
          <CalendarView
            appointments={filteredAppointments}
            onEdit={handleEditClick}
          />
        )}
      </div>
    </div>
  );
};

export default AppointmentsPage;
