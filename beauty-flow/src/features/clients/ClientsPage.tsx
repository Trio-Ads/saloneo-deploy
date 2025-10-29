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
  const { t } = useTranslation('clients');
  const [showForm, setShowForm] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const formRef = React.useRef<HTMLDivElement>(null);
  
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
      console.error(t('errors.saving'), error);
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
      console.error(t('errors.deleting'), error);
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

  // Auto-scroll vers le formulaire quand il s'ouvre
  React.useEffect(() => {
    if (showForm && formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [showForm]);

  // Afficher un état de chargement si les données ne sont pas encore disponibles
  if (!clients && loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50 to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white/90 dark:bg-gray-900/70 backdrop-blur-xl rounded-3xl shadow-orange-lg dark:shadow-gray-lg border border-orange-500/20 dark:border-orange-500/20 p-12 animate-pulse">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="relative">
                  <div className="animate-spin rounded-full h-20 w-20 border-4 border-orange-100 dark:border-orange-900/30 border-t-orange-600 dark:border-t-orange-400 mx-auto"></div>
                  <SparklesIcon className="h-8 w-8 text-orange-600 dark:text-orange-400 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                </div>
                <p className="mt-8 text-xl font-semibold text-gray-800 dark:text-gray-100">{t('loading.clients')}</p>
                <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">{t('loading.preparing')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50 to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* HERO HEADER - Design spectaculaire */}
        <div className="relative mb-12">
          <div className="bg-white/90 dark:bg-gray-900/70 backdrop-blur-xl rounded-3xl shadow-orange-lg dark:shadow-gray-lg border border-orange-500/20 dark:border-orange-500/20 p-8 overflow-hidden transition-colors duration-300">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
              
              {/* Titre avec icône spectaculaire */}
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-orange-600 dark:from-orange-400 dark:to-orange-500 rounded-2xl blur-lg opacity-30 animate-pulse"></div>
                  <div className="relative bg-gradient-to-r from-orange-500 to-orange-600 dark:from-orange-400 dark:to-orange-500 p-4 rounded-2xl shadow-orange-xl transform hover:scale-110 transition-all duration-300">
                    <UsersIcon className="h-8 w-8 text-white dark:text-gray-900" />
                  </div>
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 dark:from-orange-400 dark:via-orange-500 dark:to-orange-600 bg-clip-text text-transparent">
                    {t('page_title')}
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400 mt-2 text-lg">{t('page_subtitle')}</p>
                  <div className="flex items-center mt-3 space-x-4">
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <ArrowTrendingUpIcon className="h-4 w-4 mr-1 text-green-500 dark:text-green-400" />
                      {clientStats.total} {t('stats.clients_total_badge')}
                    </div>
                    {clientStats.vip > 0 && (
                      <div className="flex items-center text-sm text-orange-600 dark:text-orange-400">
                        <BellIcon className="h-4 w-4 mr-1 animate-bounce" />
                        {clientStats.vip} {t('stats.vip_clients_badge')}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions principales - Design premium */}
              <div className="flex flex-wrap items-center gap-4">
                <button
                  onClick={handleAddClick}
                  className="px-8 py-3 bg-gradient-to-r from-orange-500 to-orange-600 dark:from-orange-400 dark:to-orange-500 hover:from-orange-600 hover:to-orange-700 dark:hover:from-orange-500 dark:hover:to-orange-600 text-white dark:text-gray-900 rounded-xl font-semibold shadow-orange-xl hover:shadow-orange-2xl transform hover:scale-105 transition-all duration-300 relative overflow-hidden group"
                  disabled={loading}
                >
                  <div className="absolute inset-0 bg-white/20 dark:bg-gray-900/20 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                  <PlusIcon className="h-5 w-5 mr-2 inline relative z-10" />
                  <span className="relative z-10">{t('new_client')}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* STATISTIQUES - Design premium avec couleurs orange */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-gray-500 to-gray-600 dark:from-gray-600 dark:to-gray-700 rounded-2xl blur-lg opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
            <div className="relative bg-white/90 dark:bg-gray-900/70 backdrop-blur-xl rounded-2xl shadow-orange-md dark:shadow-gray-md border border-orange-500/20 dark:border-orange-500/20 p-6 hover:shadow-orange-lg dark:hover:shadow-gray-lg transform hover:scale-105 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">{t('stats.total')}</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">{clientStats.total}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t('stats.all_clients')}</p>
                </div>
                <div className="p-3 bg-gradient-to-r from-gray-500 to-gray-600 dark:from-gray-600 dark:to-gray-700 rounded-xl shadow-lg">
                  <UserGroupIcon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* VIP */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-orange-600 dark:from-orange-400 dark:to-orange-500 rounded-2xl blur-lg opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
            <div className="relative bg-white/90 dark:bg-gray-900/70 backdrop-blur-xl rounded-2xl shadow-orange-md dark:shadow-gray-md border border-orange-500/20 dark:border-orange-500/20 p-6 hover:shadow-orange-lg dark:hover:shadow-gray-lg transform hover:scale-105 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">{t('stats.vip_title')}</p>
                  <p className="text-3xl font-bold text-orange-600 dark:text-orange-400 mt-1">{clientStats.vip}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t('stats.vip_description')}</p>
                </div>
                <div className="p-3 bg-gradient-to-r from-orange-500 to-orange-600 dark:from-orange-400 dark:to-orange-500 rounded-xl shadow-lg">
                  <StarIcon className="h-6 w-6 text-white dark:text-gray-900" />
                </div>
              </div>
            </div>
          </div>

          {/* Nouveaux */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-600 dark:from-green-400 dark:to-emerald-500 rounded-2xl blur-lg opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
            <div className="relative bg-white/90 dark:bg-gray-900/70 backdrop-blur-xl rounded-2xl shadow-orange-md dark:shadow-gray-md border border-orange-500/20 dark:border-orange-500/20 p-6 hover:shadow-orange-lg dark:hover:shadow-gray-lg transform hover:scale-105 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">{t('stats.recent_title')}</p>
                  <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-1">{clientStats.recent}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t('stats.recent_description')}</p>
                </div>
                <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-600 dark:from-green-400 dark:to-emerald-500 rounded-xl shadow-lg">
                  <SparklesIcon className="h-6 w-6 text-white dark:text-gray-900" />
                </div>
              </div>
            </div>
          </div>

          {/* Points Fidélité */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-orange-500 dark:from-orange-300 dark:to-orange-400 rounded-2xl blur-lg opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
            <div className="relative bg-white/90 dark:bg-gray-900/70 backdrop-blur-xl rounded-2xl shadow-orange-md dark:shadow-gray-md border border-orange-500/20 dark:border-orange-500/20 p-6 hover:shadow-orange-lg dark:hover:shadow-gray-lg transform hover:scale-105 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">{t('stats.loyalty_title')}</p>
                  <p className="text-3xl font-bold text-orange-600 dark:text-orange-400 mt-1">{clientStats.totalLoyalty}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t('stats.loyalty_description')}</p>
                </div>
                <div className="p-3 bg-gradient-to-r from-orange-400 to-orange-500 dark:from-orange-300 dark:to-orange-400 rounded-xl shadow-lg">
                  <HeartIcon className="h-6 w-6 text-white dark:text-gray-900" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Message d'erreur moderne */}
        {error && (
          <div className="bg-white/90 dark:bg-gray-900/70 backdrop-blur-xl rounded-2xl shadow-orange-md dark:shadow-gray-md border border-red-500/20 dark:border-red-500/20 p-4 mb-8 bg-red-50/80 dark:bg-red-900/20">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-400 dark:text-red-300" />
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
              </div>
              <button
                onClick={clearError}
                className="ml-4 inline-flex text-red-400 dark:text-red-300 hover:text-red-600 dark:hover:text-red-200 transition-colors duration-200"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}

        {/* FILTRES ET CONTRÔLES - Design sophistiqué */}
        {!showForm && (
          <div className="bg-white/90 dark:bg-gray-900/70 backdrop-blur-xl rounded-2xl shadow-orange-md dark:shadow-gray-md border border-orange-500/20 dark:border-orange-500/20 p-6 mb-8 transition-colors duration-300">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              
              {/* Recherche et filtres */}
              <div className="flex flex-wrap items-center gap-4">
                {/* Barre de recherche */}
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                  <input
                    type="text"
                    placeholder={t('search.placeholder')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-3 w-64 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-400 focus:border-transparent transition-all duration-200 text-sm text-gray-900 dark:text-gray-100"
                  />
                </div>
              </div>
            </div>
            {searchTerm && (
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                {filteredClients.length} {t('search.results')} "{searchTerm}"
              </p>
            )}
          </div>
        )}

        {/* Contenu principal */}
        <div ref={formRef} className="bg-white/90 dark:bg-gray-900/70 backdrop-blur-xl rounded-2xl shadow-orange-md dark:shadow-gray-md border border-orange-500/20 dark:border-orange-500/20 p-6 min-h-[600px] transition-colors duration-300">
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
                  <UsersIcon className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">{t('empty_state.no_clients')}</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-6">
                    {searchTerm 
                      ? t('empty_state.modify_filters')
                      : t('empty_state.create_first')
                    }
                  </p>
                  {!searchTerm && (
                    <button
                      onClick={handleAddClick}
                      className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 dark:from-orange-400 dark:to-orange-500 hover:from-orange-600 hover:to-orange-700 dark:hover:from-orange-500 dark:hover:to-orange-600 text-white dark:text-gray-900 rounded-xl font-medium shadow-orange-lg hover:shadow-orange-xl transform hover:scale-105 transition-all duration-200"
                    >
                      <PlusIcon className="h-4 w-4 mr-2 inline" />
                      {t('empty_state.create_client')}
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
