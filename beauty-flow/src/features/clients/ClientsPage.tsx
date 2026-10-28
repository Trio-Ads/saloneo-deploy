import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { UsersIcon, PlusIcon, MagnifyingGlassIcon, ExclamationTriangleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import ClientList from './components/ClientList';
import { ClientFormWithLimits } from '../subscription/components/LimitedForms';
import { useLimitedForm } from '../subscription/components/LimitedForms';
import { useClientStore } from './store';
import { Client, ClientFormData } from './types';
import { useSocket } from '../../hooks/useSocket';
import { useSubscriptionLimits } from '../subscription/hooks/useSubscriptionLimits';
import { SubscriptionLimitWidget } from '../subscription/components/SubscriptionLimitWidget';
import { PageHeader, StatGroup, Panel, EmptyState, IconButton } from '../../components/ui';
import { useAccess } from '../staff/access';

const ClientsPage: React.FC = () => {
  const { t, i18n } = useTranslation(['clients', 'common']);
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
  const { checkClientLimit, currentPlan } = useSubscriptionLimits();
  // Staff: read-only list (contacts masked by the API unless allowed); a new client comes with a new appointment
  const { isStaff, can } = useAccess();
  const canAdd = can('createAppointments');
  
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

  return (
    <div className="py-6 sm:py-8">
      <PageHeader
        title={t('page_title')}
        subtitle={t('page_subtitle')}
        meta={!isStaff && (
          <SubscriptionLimitWidget
            title={t('limits.title')}
            limitCheck={checkClientLimit()}
            planName={currentPlan}
            resourceType={t('limits.resource')}
          />
        )}
        actions={
          !showForm && canAdd && (
            <button onClick={handleAddClick} className="btn-primary" disabled={loading}>
              <PlusIcon className="size-4" />
              {t('new_client')}
            </button>
          )
        }
      />

      <StatGroup
        items={[
          { label: t('stats.all_clients'), value: clientStats.total },
          { label: t('stats.vip_title'), value: clientStats.vip, hint: t('stats.vip_description') },
          { label: t('stats.recent_title'), value: clientStats.recent },
          { label: t('stats.loyalty_title'), value: clientStats.totalLoyalty.toLocaleString(i18n.language) },
        ]}
      />

      {error && (
        <div role="alert" className="mb-4 flex items-center gap-3 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800 dark:bg-red-500/10 dark:text-red-300">
          <ExclamationTriangleIcon className="size-5 shrink-0" />
          <p className="flex-1">{error}</p>
          <IconButton label={t('common:actions.close')} onClick={clearError} className="text-red-700 hover:bg-red-100 dark:text-red-300 dark:hover:bg-red-500/10">
            <XMarkIcon className="size-5" />
          </IconButton>
        </div>
      )}

      {showForm ? (
        <div ref={formRef} className="scroll-mt-6">
          <ClientFormWithLimits
            initialData={selectedClient ? getFormData(selectedClient) : undefined}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            onLimitExceeded={handleLimitExceeded}
          />
        </div>
      ) : (
        <>
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative sm:w-96">
              <MagnifyingGlassIcon className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
              <input
                type="search"
                placeholder={t('search.placeholder')}
                aria-label={t('search.placeholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="field ps-9"
              />
            </div>
            {searchTerm && (
              <p className="text-sm text-gray-500 dark:text-gray-400 sm:ms-auto">
                {t('search.results', { count: filteredClients.length, term: searchTerm })}
              </p>
            )}
          </div>

          {loading && clients.length === 0 ? (
            <Panel>
              <p className="py-10 text-center text-sm text-gray-500 dark:text-gray-400">{t('loading.clients')}</p>
            </Panel>
          ) : filteredClients.length === 0 ? (
            <Panel>
              <EmptyState
                icon={UsersIcon}
                title={t('empty_state.no_clients')}
                body={searchTerm ? t('empty_state.modify_filters') : t('empty_state.create_first')}
                action={!searchTerm && canAdd && (
                  <button onClick={handleAddClick} className="btn-primary">
                    <PlusIcon className="size-4" />
                    {t('empty_state.create_client')}
                  </button>
                )}
              />
            </Panel>
          ) : (
            <ClientList clients={filteredClients} onEdit={isStaff ? undefined : handleEdit} onDelete={isStaff ? undefined : handleDelete} />
          )}
        </>
      )}
    </div>
  );
};

export default ClientsPage;
