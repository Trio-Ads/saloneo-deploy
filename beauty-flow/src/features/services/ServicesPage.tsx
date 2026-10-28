import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { SparklesIcon, PlusIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { Service, ServiceFormData } from './types';
import { useServiceStore } from './store';
import ServiceList from './components/ServiceList';
import { ServiceFormWithLimits } from '../subscription/components/LimitedForms';
import { useLimitedForm } from '../subscription/components/LimitedForms';
import { useSubscriptionLimits } from '../subscription/hooks/useSubscriptionLimits';
import { SubscriptionLimitWidget } from '../subscription/components/SubscriptionLimitWidget';
import { PageHeader, StatGroup, Panel, EmptyState } from '../../components/ui';
import { useProfileStore } from '../profile/store';
import { formatPrice } from '../../utils/currency';

const ServicesPage: React.FC = () => {
  const { t } = useTranslation('services');
  const services = useServiceStore((state) => state.services);
  const addService = useServiceStore((state) => state.addService);
  const updateService = useServiceStore((state) => state.updateService);
  const deleteService = useServiceStore((state) => state.deleteService);
  const storeCategories = useServiceStore((state) => state.categories);
  const activeProducts = useServiceStore((state) => state.activeProducts);
  const { handleLimitExceeded } = useLimitedForm();
  const { checkServiceLimit, currentPlan } = useSubscriptionLimits();
  const { profile } = useProfileStore();

  const formattedProducts = useMemo(() => 
    activeProducts.map((p) => ({
      id: p.id,
      name: p.name,
      quantity: p.quantity,
      unit: p.unit
    })), [activeProducts]
  );
  // Catégories par défaut + celles réellement utilisées par les services
  const categories = useMemo(
    () => Array.from(new Set([...storeCategories, ...services.map((s) => s.category).filter(Boolean)])),
    [storeCategories, services]
  );
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const formRef = React.useRef<HTMLDivElement>(null);

  // Filtrer les services et calculer les statistiques
  const filteredServices = useMemo(() => {
    let filtered = services;
    
    if (searchTerm) {
      filtered = filtered.filter(service =>
        service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(service => service.category === selectedCategory);
    }
    
    return filtered;
  }, [services, searchTerm, selectedCategory]);

  const serviceStats = useMemo(() => {
    const totalRevenue = services.reduce((sum, service) => sum + service.price, 0);
    const avgDuration = services.length > 0 ? services.reduce((sum, service) => sum + service.duration, 0) / services.length : 0;
    const avgPrice = services.length > 0 ? totalRevenue / services.length : 0;
    const categoriesCount = new Set(services.map(s => s.category)).size;

    return {
      total: services.length,
      categories: categoriesCount,
      avgDuration: Math.round(avgDuration),
      avgPrice: Math.round(avgPrice * 100) / 100
    };
  }, [services]);

  const handleAddClick = () => {
    setEditingService(null);
    setIsFormOpen(true);
  };

  const handleEditClick = (service: Service) => {
    setEditingService(service);
    setIsFormOpen(true);
  };

  const handleFormSubmit = (data: ServiceFormData) => {
    if (editingService) {
      updateService(editingService.id, {
        ...data,
        products: data.products || []
      });
    } else {
      addService({
        ...data,
        products: data.products || []
      });
    }
    setIsFormOpen(false);
    setEditingService(null);
  };

  const handleFormCancel = () => {
    setIsFormOpen(false);
    setEditingService(null);
  };

  // Auto-scroll vers le formulaire quand il s'ouvre
  React.useEffect(() => {
    if (isFormOpen && formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [isFormOpen]);

  const handleDeleteClick = (serviceId: string) => {
    if (window.confirm(t('messages.delete_confirmation'))) {
      deleteService(serviceId);
    }
  };

  const isFiltering = !!searchTerm || selectedCategory !== 'all';

  return (
    <div className="py-6 sm:py-8">
      <PageHeader
        title={t('title')}
        subtitle={t('subtitle')}
        meta={
          <SubscriptionLimitWidget
            title={t('limits.title')}
            limitCheck={checkServiceLimit()}
            planName={currentPlan}
            resourceType={t('limits.resource')}
          />
        }
        actions={
          !isFormOpen && (
            <button onClick={handleAddClick} className="btn-primary">
              <PlusIcon className="size-4" />
              {t('actions.new_service')}
            </button>
          )
        }
      />

      <StatGroup
        items={[
          { label: t('stats.all_services'), value: serviceStats.total },
          { label: t('stats.categories'), value: serviceStats.categories },
          { label: t('stats.avg_duration'), value: `${serviceStats.avgDuration} ${t('duration.min')}` },
          { label: t('stats.avg_price'), value: formatPrice(serviceStats.avgPrice, profile.currency) },
        ]}
      />

      {isFormOpen ? (
        <div ref={formRef} className="scroll-mt-6">
          <ServiceFormWithLimits
            initialData={editingService ?? undefined}
            onSubmit={handleFormSubmit}
            onCancel={handleFormCancel}
            onLimitExceeded={handleLimitExceeded}
            categories={categories}
            products={formattedProducts}
          />
        </div>
      ) : (
        <>
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative sm:w-80">
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
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              aria-label={t('form.category')}
              className="field sm:w-56"
            >
              <option value="all">{t('filters.all_categories')}</option>
              {categories.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            {isFiltering && (
              <p className="text-sm text-gray-500 dark:text-gray-400 sm:ms-auto">
                {t('search.results', { count: filteredServices.length })}
              </p>
            )}
          </div>

          {filteredServices.length === 0 ? (
            <Panel>
              <EmptyState
                icon={SparklesIcon}
                title={t('messages.no_services')}
                body={isFiltering ? t('messages.try_filters') : t('messages.create_first')}
                action={!isFiltering && (
                  <button onClick={handleAddClick} className="btn-primary">
                    <PlusIcon className="size-4" />
                    {t('actions.create_service')}
                  </button>
                )}
              />
            </Panel>
          ) : (
            <ServiceList services={filteredServices} onEdit={handleEditClick} onDelete={handleDeleteClick} />
          )}
        </>
      )}
    </div>
  );
};

export default ServicesPage;
