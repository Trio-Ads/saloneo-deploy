import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  UsersIcon, 
  PlusIcon, 
  MagnifyingGlassIcon,
  UserGroupIcon,
  HeartIcon,
  StarIcon,
  SparklesIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
  FunnelIcon,
  ArrowTrendingUpIcon,
  BellIcon
} from '@heroicons/react/24/outline';
import ClientList from './components/ClientList';
import { ClientFormWithLimits } from '../subscription/components/LimitedForms';
import { useLimitedForm } from '../subscription/components/LimitedForms';
import { useClientStore } from './store';
import { Client, ClientFormData } from './types';
import { useSocket } from '../../hooks/useSocket';

const ClientsPage: React.FC = () => {
  const { t } = useTranslation();
  const [showForm, setShowForm] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Store state
  const clients = useClientStore((state) => state.clients);
  const loading = useClientStore((state) => state.loading);
  const error = useClientStore((state) => state.error);
  const fetchClients = useClientStore((state) => state.fetchClients);
  const addClient = useClientStore((state) => state.addClient);
  const updateClient = useClientStore((state) => state.updateClient);
  const deleteClient = useClientStore((state) => state.deleteClient);
  const clearError = useClientStore((state) => state.clearError);
  
  const { handleLimitExceeded } = useLimitedForm();
  
  // Enable real-time updates
  useSocket();

  // Filtrer et calculer les statistiques des clients
  const filteredClients = useMemo(() => {
    const activeClients = clients.filter(c => c.isActive);
    if (!searchTerm) return activeClients;
    
    return activeClients.filter(client =>
      client.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.phone.includes(searchTerm)
    );
  }, [clients, searchTerm]);

  const clientStats = useMemo(() => {
    const activeClients = clients.filter(c => c.isActive);
    const totalLoyaltyPoints = activeClients.reduce((sum, client) => sum + (client.loyaltyPoints || 0), 0);
    const vipClients = activeClients.filter(client => (client.loyaltyPoints || 0) >= 100);
    const recentClients = activeClients.filter(client => {
      const createdDate = new Date(client.createdAt);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return createdDate >= thirtyDaysAgo;
    });

    return {
      total: activeClients.length,
      vip: vipClients.length,
      recent: recentClients.length,
      totalLoyalty: totalLoyaltyPoints
    };
  }, [clients]);

  // Load clients on component mount
  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  // Clear error when component unmounts
  useEffect(() => {
    return () => {
      clearError();
    };
  }, [clearError]);

  const handleSubmit = async (data: ClientFormData) => {
    try {
      if (selectedClient) {
        await updateClient(selectedClient.id, data);
      } else {
        await addClient(data);
      }
      setShowForm(false);
      setSelectedClient(null);
    } catch (error) {
      console.error('Error saving client:', error);
    }
  };

  const handleEdit = (client: Client) => {
    setSelectedClient(client);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteClient(id);
    } catch (error) {
      console.error('Error deleting client:', error);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setSelectedClient(null);
  };

  const getFormData = (client: Client): ClientFormData => {
    const { id, createdAt, loyaltyPoints, lastVisit, ...formData } = client;
    return formData;
  };

  const handleAddClick = () => {
    setSelectedClient(null);
    setShowForm(true);
  };

  // Afficher un état de chargement si les données ne sont pas encore disponibles
  if (!clients && loading) {
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
                <p className="mt-8 text-xl font-semibold text-gray-800">Chargement de vos clients...</p>
                <p className="mt-3 text-sm text-gray-500">Préparation de votre base clients</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
                    <UsersIcon className="h-8 w-8 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
                    Gestion des Clients
                  </h1>
                  <p className="text-gray-600 mt-2 text-lg">Gérez votre base clients et fidélisez vos relations</p>
                  <div className="flex items-center mt-3 space-x-4">
                    <div className="flex items-center text-sm text-gray-500">
                      <ArrowTrendingUpIcon className="h-4 w-4 mr-1 text-green-500" />
                      {clientStats.total} clients au total
                    </div>
                    {clientStats.vip > 0 && (
                      <div className="flex items-center text-sm text-amber-600">
                        <BellIcon className="h-4 w-4 mr-1 animate-bounce" />
                        {clientStats.vip} clients VIP
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions principales - Design premium */}
              <div className="flex flex-wrap items-center gap-4">
                <button
                  onClick={handleAddClick}
                  className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-semibold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 relative overflow-hidden group"
                  disabled={loading}
                >
                  <div className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                  <PlusIcon className="h-5 w-5 mr-2 inline relative z-10" />
                  <span className="relative z-10">Nouveau Client</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* STATISTIQUES - Design premium avec couleurs d'AppointmentsPage */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-2xl blur-lg opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
            <div className="relative bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Total</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{clientStats.total}</p>
                  <p className="text-xs text-gray-500 mt-1">Tous les clients</p>
                </div>
                <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl shadow-lg">
                  <UserGroupIcon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* VIP */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-amber-600 rounded-2xl blur-lg opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
            <div className="relative bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Clients VIP</p>
                  <p className="text-3xl font-bold text-orange-600 mt-1">{clientStats.vip}</p>
                  <p className="text-xs text-gray-500 mt-1">100+ points fidélité</p>
                </div>
                <div className="p-3 bg-gradient-to-r from-orange-500 to-amber-600 rounded-xl shadow-lg">
                  <StarIcon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Nouveaux */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl blur-lg opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
            <div className="relative bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Nouveaux (30j)</p>
                  <p className="text-3xl font-bold text-green-600 mt-1">{clientStats.recent}</p>
                  <p className="text-xs text-gray-500 mt-1">Clients récents</p>
                </div>
                <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl shadow-lg">
                  <SparklesIcon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Points Fidélité */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-2xl blur-lg opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
            <div className="relative bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Points Fidélité</p>
                  <p className="text-3xl font-bold text-purple-600 mt-1">{clientStats.totalLoyalty}</p>
                  <p className="text-xs text-gray-500 mt-1">Points cumulés</p>
                </div>
                <div className="p-3 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl shadow-lg">
                  <HeartIcon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Message d'erreur moderne */}
        {error && (
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-4 mb-8 bg-red-50/80 border-red-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm text-red-800">{error}</p>
              </div>
              <button
                onClick={clearError}
                className="ml-4 inline-flex text-red-400 hover:text-red-600 transition-colors duration-200"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}

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
                    placeholder="Rechercher un client (nom, email, téléphone...)"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-3 w-64 bg-white/70 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-sm"
                  />
                </div>
              </div>
            </div>
            {searchTerm && (
              <p className="mt-2 text-sm text-gray-600">
                {filteredClients.length} client(s) trouvé(s) pour "{searchTerm}"
              </p>
            )}
          </div>
        )}

        {/* Contenu principal */}
        <div className="glass-card p-6 min-h-[600px]">
          {showForm ? (
            <div className="animate-fadeIn">
              <ClientFormWithLimits
                initialData={selectedClient ? getFormData(selectedClient) : undefined}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                onLimitExceeded={handleLimitExceeded}
              />
            </div>
          ) : (
            <div className="animate-fadeIn">
              {filteredClients.length === 0 ? (
                <div className="text-center py-16">
                  <UsersIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun client trouvé</h3>
                  <p className="text-gray-500 mb-6">
                    {searchTerm 
                      ? 'Essayez de modifier vos filtres de recherche'
                      : 'Commencez par créer votre premier client'
                    }
                  </p>
                  {!searchTerm && (
                    <button
                      onClick={handleAddClick}
                      className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                    >
                      <PlusIcon className="h-4 w-4 mr-2 inline" />
                      Créer un client
                    </button>
                  )}
                </div>
              ) : (
                <ClientList
                  clients={filteredClients}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientsPage;
