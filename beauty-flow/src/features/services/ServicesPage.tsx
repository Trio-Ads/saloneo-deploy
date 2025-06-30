import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  SparklesIcon, 
  PlusIcon, 
  MagnifyingGlassIcon,
  TagIcon,
  ClockIcon,
  CurrencyEuroIcon,
  BeakerIcon,
  StarIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  BellIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import { Service, ServiceFormData, Product } from './types';
import { useServiceStore } from './store';
import type { ServiceStore } from './store';
import ServiceList from './components/ServiceList';
import { ServiceFormWithLimits } from '../subscription/components/LimitedForms';
import { useLimitedForm } from '../subscription/components/LimitedForms';

const ServicesPage: React.FC = () => {
  const { t } = useTranslation('services');
  const services = useServiceStore((state) => state.services);
  const addService = useServiceStore((state) => state.addService);
  const updateService = useServiceStore((state) => state.updateService);
  const deleteService = useServiceStore((state) => state.deleteService);
  const categories = useServiceStore((state) => state.categories);
  const activeProducts = useServiceStore((state) => state.activeProducts);
  const { handleLimitExceeded } = useLimitedForm();

  const formattedProducts = useMemo(() => 
    activeProducts.map((p) => ({
      id: p.id,
      name: p.name,
      quantity: p.quantity,
      unit: p.unit
    })), [activeProducts]
  );
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

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
    const serviceFormData: ServiceFormData = {
      name: service.name,
      description: service.description,
      duration: service.duration,
      price: service.price,
      category: service.category,
      products: service.products
    };
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

  const handleDeleteClick = (serviceId: string) => {
    if (window.confirm(t('messages.delete_confirmation'))) {
      deleteService(serviceId);
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
                    <SparklesIcon className="h-8 w-8 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
                    Gestion des Services
                  </h1>
                  <p className="text-gray-600 mt-2 text-lg">Créez et gérez vos services de beauté</p>
                  <div className="flex items-center mt-3 space-x-4">
                    <div className="flex items-center text-sm text-gray-500">
                      <ArrowTrendingUpIcon className="h-4 w-4 mr-1 text-green-500" />
                      {serviceStats.total} services au total
                    </div>
                    {serviceStats.categories > 0 && (
                      <div className="flex items-center text-sm text-indigo-600">
                        <BellIcon className="h-4 w-4 mr-1 animate-bounce" />
                        {serviceStats.categories} catégories
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
                >
                  <div className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                  <PlusIcon className="h-5 w-5 mr-2 inline relative z-10" />
                  <span className="relative z-10">Nouveau Service</span>
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
                  <p className="text-3xl font-bold text-gray-900 mt-1">{serviceStats.total}</p>
                  <p className="text-xs text-gray-500 mt-1">Tous les services</p>
                </div>
                <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl shadow-lg">
                  <BeakerIcon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Catégories */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-2xl blur-lg opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
            <div className="relative bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Catégories</p>
                  <p className="text-3xl font-bold text-purple-600 mt-1">{serviceStats.categories}</p>
                  <p className="text-xs text-gray-500 mt-1">Types de services</p>
                </div>
                <div className="p-3 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl shadow-lg">
                  <TagIcon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Durée Moyenne */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-amber-600 rounded-2xl blur-lg opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
            <div className="relative bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Durée Moy.</p>
                  <p className="text-3xl font-bold text-orange-600 mt-1">{serviceStats.avgDuration}min</p>
                  <p className="text-xs text-gray-500 mt-1">Temps moyen</p>
                </div>
                <div className="p-3 bg-gradient-to-r from-orange-500 to-amber-600 rounded-xl shadow-lg">
                  <ClockIcon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Prix Moyen */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl blur-lg opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
            <div className="relative bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Prix Moyen</p>
                  <p className="text-3xl font-bold text-green-600 mt-1">{serviceStats.avgPrice}€</p>
                  <p className="text-xs text-gray-500 mt-1">Tarif moyen</p>
                </div>
                <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl shadow-lg">
                  <CurrencyEuroIcon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FILTRES ET CONTRÔLES - Design sophistiqué */}
        {!isFormOpen && (
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6 mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              
              {/* Recherche et filtres */}
              <div className="flex flex-wrap items-center gap-4">
                {/* Barre de recherche */}
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Rechercher un service..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-3 w-64 bg-white/70 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-sm"
                  />
                </div>

                {/* Filtre par catégorie */}
                <div className="relative">
                  <FunnelIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="pl-10 pr-8 py-3 bg-white/70 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-sm appearance-none cursor-pointer"
                  >
                    <option value="all">Toutes les catégories</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            
            {(searchTerm || selectedCategory !== 'all') && (
              <p className="mt-2 text-sm text-gray-600">
                {filteredServices.length} service(s) trouvé(s)
                {searchTerm && ` pour "${searchTerm}"`}
                {selectedCategory !== 'all' && ` dans "${selectedCategory}"`}
              </p>
            )}
          </div>
        )}

        {/* Contenu principal */}
        <div className="glass-card p-6 min-h-[600px]">
          {isFormOpen ? (
            <div className="animate-fadeIn">
              <ServiceFormWithLimits
                initialData={editingService ? {
                  name: editingService.name,
                  description: editingService.description,
                  duration: editingService.duration,
                  price: editingService.price,
                  category: editingService.category,
                  products: editingService.products
                } : undefined}
                onSubmit={handleFormSubmit}
                onCancel={handleFormCancel}
                onLimitExceeded={handleLimitExceeded}
                categories={categories}
                products={formattedProducts}
              />
            </div>
          ) : (
            <div className="animate-fadeIn">
              {filteredServices.length === 0 ? (
                <div className="text-center py-16">
                  <SparklesIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun service trouvé</h3>
                  <p className="text-gray-500 mb-6">
                    {searchTerm || selectedCategory !== 'all' 
                      ? 'Essayez de modifier vos filtres de recherche'
                      : 'Commencez par créer votre premier service'
                    }
                  </p>
                  {!searchTerm && selectedCategory === 'all' && (
                    <button
                      onClick={handleAddClick}
                      className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                    >
                      <PlusIcon className="h-4 w-4 mr-2 inline" />
                      Créer un service
                    </button>
                  )}
                </div>
              ) : (
                <ServiceList
                  services={filteredServices}
                  onEdit={handleEditClick}
                  onDelete={handleDeleteClick}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ServicesPage;
