import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  CalendarDaysIcon, 
  PlusIcon, 
  ClockIcon, 
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  ListBulletIcon,
  CalendarIcon,
  ChartBarIcon,
  SparklesIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  ArrowTrendingUpIcon,
  BellIcon
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

const AppointmentsPage: React.FC = () => {
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
  
  // Enable real-time updates
  useSocket();

  const [showForm, setShowForm] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<AppointmentStatus | 'all'>('all');
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [pastAppointmentsCount, setPastAppointmentsCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Charger toutes les données nécessaires au démarrage
  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('🔄 Chargement des données...');
        await Promise.all([
          loadAppointments?.(),
          fetchClients()
        ]);
        console.log('✅ Données chargées:', {
          appointments: appointments?.length || 0,
          services: services?.length || 0
        });
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

  // Afficher un état de chargement si les données ne sont pas encore disponibles
  if (!appointments && isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-12 animate-pulse">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="relative">
                  <div className="animate-spin rounded-full h-20 w-20 border-4 border-indigo-100 border-t-indigo-600 mx-auto"></div>
                  <SparklesIcon className="h-8 w-8 text-indigo-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                </div>
                <p className="mt-8 text-xl font-semibold text-gray-800">Chargement de votre planning...</p>
                <p className="mt-3 text-sm text-gray-500">Préparation de l'interface</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
        alert('Rendez-vous créé avec succès !');
      }
      setShowForm(false);
      setEditingAppointment(null);
    } catch (error) {
      console.error('Erreur lors de la soumission du formulaire:', error);
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingAppointment(null);
  };

  const handleCancelAppointment = (appointmentId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir annuler ce rendez-vous ?')) {
      cancelAppointment(appointmentId);
    }
  };

  const handleCompleteAppointment = (appointmentId: string) => {
    completeAppointment(appointmentId);
  };

  const handleNoShowAppointment = (appointmentId: string) => {
    if (window.confirm('Marquer ce client comme non présenté ?')) {
      markAsNoShow(appointmentId);
    }
  };

  const handleConfirmAppointment = (appointmentId: string) => {
    confirmAppointment(appointmentId);
  };
  
  const handleProcessPastAppointments = async (action: 'noShow' | 'completed') => {
    if (pastAppointmentsCount === 0) {
      alert('Aucun rendez-vous passé à traiter.');
      return;
    }
    
    const actionText = action === 'noShow' ? 'Non présentés' : 'Terminés';
    
    if (window.confirm(`${pastAppointmentsCount} rendez-vous passés trouvés. Souhaitez-vous les marquer comme "${actionText}" ?`)) {
      try {
        const processed = await processPastAppointments(action);
        alert(`${processed} rendez-vous ont été traités.`);
        setPastAppointmentsCount(0);
      } catch (error) {
        console.error('Erreur lors du traitement des rendez-vous passés:', error);
        alert('Erreur lors du traitement des rendez-vous passés.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* HERO HEADER - Design spectaculaire */}
        <div className="relative mb-12">
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 overflow-hidden">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
              
              {/* Titre avec icône spectaculaire */}
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl blur-lg opacity-30 animate-pulse"></div>
                  <div className="relative bg-gradient-to-r from-indigo-500 to-purple-600 p-4 rounded-2xl shadow-xl transform hover:scale-110 transition-all duration-300">
                    <CalendarDaysIcon className="h-8 w-8 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
                    Gestion des Rendez-vous
                  </h1>
                  <p className="text-gray-600 mt-2 text-lg">Planifiez et gérez vos rendez-vous avec élégance</p>
                  <div className="flex items-center mt-3 space-x-4">
                    <div className="flex items-center text-sm text-gray-500">
                      <ArrowTrendingUpIcon className="h-4 w-4 mr-1 text-green-500" />
                      {appointmentStats.total} rendez-vous au total
                    </div>
                    {pastAppointmentsCount > 0 && (
                      <div className="flex items-center text-sm text-amber-600">
                        <BellIcon className="h-4 w-4 mr-1 animate-bounce" />
                        {pastAppointmentsCount} en attente
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions principales - Design premium */}
              <div className="flex flex-wrap items-center gap-4">
                {pastAppointmentsCount > 0 && (
                  <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-2xl border border-amber-200">
                    <button
                      onClick={() => handleProcessPastAppointments('completed')}
                      className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                    >
                      <CheckCircleIcon className="h-4 w-4 mr-2 inline" />
                      Terminer ({pastAppointmentsCount})
                    </button>
                    <button
                      onClick={() => handleProcessPastAppointments('noShow')}
                      className="px-4 py-2 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                    >
                      <ExclamationTriangleIcon className="h-4 w-4 mr-2 inline" />
                      Non présentés
                    </button>
                  </div>
                )}
                
                <Link
                  to="/appointments/history"
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                >
                  <ChartBarIcon className="h-4 w-4 mr-2 inline" />
                  Historique
                </Link>
                
                <button
                  onClick={handleAddClick}
                  className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-semibold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 relative overflow-hidden group"
                  disabled={isLoading}
                >
                  <div className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                  <PlusIcon className="h-5 w-5 mr-2 inline relative z-10" />
                  <span className="relative z-10">Nouveau Rendez-vous</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* STATISTIQUES - Design premium avec vos couleurs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-2xl blur-lg opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
            <div className="relative bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Total</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{appointmentStats.total}</p>
                  <p className="text-xs text-gray-500 mt-1">Tous les rendez-vous</p>
                </div>
                <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl shadow-lg">
                  <CalendarIcon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Planifiés */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-amber-600 rounded-2xl blur-lg opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
            <div className="relative bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Planifiés</p>
                  <p className="text-3xl font-bold text-orange-600 mt-1">{appointmentStats.scheduled}</p>
                  <p className="text-xs text-gray-500 mt-1">En attente de confirmation</p>
                </div>
                <div className="p-3 bg-gradient-to-r from-orange-500 to-amber-600 rounded-xl shadow-lg">
                  <ClockIcon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Confirmés */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl blur-lg opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
            <div className="relative bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Confirmés</p>
                  <p className="text-3xl font-bold text-green-600 mt-1">{appointmentStats.confirmed}</p>
                  <p className="text-xs text-gray-500 mt-1">Prêts à être réalisés</p>
                </div>
                <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl shadow-lg">
                  <CheckCircleIcon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Terminés */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-2xl blur-lg opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
            <div className="relative bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Terminés</p>
                  <p className="text-3xl font-bold text-purple-600 mt-1">{appointmentStats.completed}</p>
                  <p className="text-xs text-gray-500 mt-1">Services réalisés</p>
                </div>
                <div className="p-3 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl shadow-lg">
                  <SparklesIcon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FILTRES ET CONTRÔLES - Design sophistiqué */}
        {!showForm && (
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6 mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              
              {/* Recherche et filtres */}
              <div className="flex flex-wrap items-center gap-4">
                {/* Barre de recherche */}
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Rechercher un client ou service..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-3 w-64 bg-white/70 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-sm"
                  />
                </div>

                {/* Filtre par statut */}
                <div className="relative">
                  <FunnelIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value as AppointmentStatus | 'all')}
                    className="pl-10 pr-8 py-3 bg-white/70 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-sm appearance-none cursor-pointer"
                  >
                    <option value="all">Tous les statuts</option>
                    <option value="scheduled">Planifiés</option>
                    <option value="confirmed">Confirmés</option>
                    <option value="completed">Terminés</option>
                    <option value="cancelled">Annulés</option>
                    <option value="noShow">Non présentés</option>
                  </select>
                </div>
              </div>

              {/* Sélecteur de vue */}
              <div className="flex items-center bg-gray-100 rounded-xl p-1 shadow-inner">
                <button
                  onClick={() => setViewMode('list')}
                  className={`flex items-center px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    viewMode === 'list'
                      ? 'bg-white text-indigo-600 shadow-md'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <ListBulletIcon className="h-4 w-4 mr-2" />
                  Liste
                </button>
                <button
                  onClick={() => setViewMode('calendar')}
                  className={`flex items-center px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    viewMode === 'calendar'
                      ? 'bg-white text-indigo-600 shadow-md'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  Calendrier
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Contenu principal */}
        <div className="glass-card p-6 min-h-[600px]">
          {showForm ? (
            <div className="animate-fadeIn">
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
            </div>
          ) : (
            <div className="animate-fadeIn">
              {viewMode === 'list' ? (
                filteredAppointments.length === 0 ? (
                  <div className="text-center py-16">
                    <CalendarDaysIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun rendez-vous trouvé</h3>
                    <p className="text-gray-500 mb-6">
                      {searchTerm || selectedStatus !== 'all' 
                        ? 'Essayez de modifier vos filtres de recherche'
                        : 'Commencez par créer votre premier rendez-vous'
                      }
                    </p>
                    {!searchTerm && selectedStatus === 'all' && (
                      <button
                        onClick={handleAddClick}
                        className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                      >
                        <PlusIcon className="h-4 w-4 mr-2 inline" />
                        Créer un rendez-vous
                      </button>
                    )}
                  </div>
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
          )}
        </div>
      </div>
    </div>
  );
};

export default AppointmentsPage;
