import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  SparklesIcon,
  ClockIcon,
  CurrencyDollarIcon,
  PencilIcon,
  TrashIcon,
  PhotoIcon,
  CubeIcon,
  TagIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { Service } from '../types';
import { useServiceStore } from '../store';
import ServiceOnlineSettings from './ServiceOnlineSettings';
import { useInterfaceStore } from '../../interface/store';
import { useProfileStore } from '../../profile/store';
import { fileService } from '../../../services/fileService';
import { formatPrice } from '../../../utils/currency';

interface ServiceListProps {
  services: Service[];
  onEdit: (service: Service) => void;
  onDelete: (serviceId: string) => void;
}

const ServiceList: React.FC<ServiceListProps> = ({ services, onEdit, onDelete }) => {
  const { t } = useTranslation('services');
  const products = useServiceStore((state) => state.products);
  const { serviceSettings } = useInterfaceStore();
  const { profile } = useProfileStore();
  
  const servicesByCategory = services.reduce((acc, service) => {
    if (!acc[service.category]) {
      acc[service.category] = [];
    }
    acc[service.category].push(service);
    return acc;
  }, {} as Record<string, Service[]>);

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, React.ReactNode> = {
      'Coiffure': <SparklesIcon className="h-5 w-5" />,
      'Coloration': <TagIcon className="h-5 w-5" />,
      'Soins': <CubeIcon className="h-5 w-5" />,
      'Styling': <PhotoIcon className="h-5 w-5" />
    };
    return icons[category] || <SparklesIcon className="h-5 w-5" />;
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Coiffure': 'from-indigo-500 to-blue-500',
      'Coloration': 'from-blue-500 to-cyan-500',
      'Soins': 'from-green-500 to-emerald-500',
      'Styling': 'from-orange-500 to-amber-500'
    };
    return colors[category] || 'from-indigo-500 to-blue-500';
  };

  if (services.length === 0) {
    return (
      <div className="glass-card p-12 text-center">
        <div className="mx-auto w-24 h-24 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-full flex items-center justify-center mb-6 shadow-lg animate-pulse">
          <SparklesIcon className="h-12 w-12 text-white" />
        </div>
        <h3 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent mb-3">
          Aucun service disponible
        </h3>
        <p className="text-gray-600 text-lg">Commencez par ajouter vos premiers services</p>
        <div className="mt-6 inline-flex items-center px-4 py-2 bg-gradient-to-r from-indigo-100 to-blue-100 rounded-full text-indigo-700 text-sm font-medium">
          ✨ Créez votre premier service
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {Object.entries(servicesByCategory).map(([category, categoryServices]) => (
        <div key={category} className="animate-fadeIn">
          {/* Header de catégorie */}
          <div className="flex items-center space-x-3 mb-6">
            <div className={`p-3 bg-gradient-to-r ${getCategoryColor(category)} rounded-xl shadow-lg`}>
              <div className="text-white">
                {getCategoryIcon(category)}
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
                {category}
              </h3>
              <p className="text-sm text-gray-500">{categoryServices.length} service(s)</p>
            </div>
          </div>

          {/* Services de la catégorie */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {categoryServices.map((service) => {
              const settings = serviceSettings.find(s => s.id === service.id);
              const images = settings?.images || [];
              
              return (
                <div
                  key={service.id}
                  className="glass-card p-6 hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] group border border-white/20"
                >
                  {/* Images du service */}
                  {images.length > 0 && (
                    <div className="mb-4 relative h-48 rounded-xl overflow-hidden">
                      <img
                        src={fileService.getImageUrl(images[0].url)}
                        alt={images[0].alt}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                      
                      {images.length > 1 && (
                        <div className="absolute bottom-3 right-3 flex items-center space-x-1 bg-black/70 text-white px-2 py-1 rounded-full text-xs backdrop-blur-sm">
                          <PhotoIcon className="h-3 w-3" />
                          <span>+{images.length - 1}</span>
                        </div>
                      )}
                      
                      <div className="absolute top-3 left-3">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${getCategoryColor(service.category)} text-white shadow-lg`}>
                          {getCategoryIcon(service.category)}
                          <span className="ml-1">{service.category}</span>
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Header du service */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h4 className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                        {service.name}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                        {service.description}
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => onEdit(service)}
                        className="glass-button p-3 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 transition-all duration-200 transform hover:scale-110 shadow-lg hover:shadow-xl"
                        title="Modifier le service"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => onDelete(service.id)}
                        className="glass-button p-3 text-red-600 hover:text-red-800 hover:bg-red-50 transition-all duration-200 transform hover:scale-110 shadow-lg hover:shadow-xl"
                        title="Supprimer le service"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>

                  {/* Informations principales */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center space-x-3 p-3 glass-card bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl">
                      <ClockIcon className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="text-xs font-medium text-gray-600">Durée</p>
                        <p className="text-sm font-bold text-blue-600">{service.duration} min</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3 p-3 glass-card bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
                      <CurrencyDollarIcon className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="text-xs font-medium text-gray-600">Prix</p>
                        <p className="text-sm font-bold text-green-600">{formatPrice(service.price, profile.currency)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Produits utilisés */}
                  {service.products && service.products.length > 0 && (
                    <div className="mb-4 p-4 glass-card bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl">
                      <div className="flex items-center space-x-2 mb-3">
                        <CubeIcon className="h-5 w-5 text-indigo-600" />
                        <p className="text-sm font-medium text-gray-700">Produits utilisés</p>
                      </div>
                      <div className="space-y-2">
                        {service.products.map((serviceProduct) => {
                          const product = products.find(p => p.id === serviceProduct.productId);
                          return product ? (
                            <div key={serviceProduct.productId} className="flex items-center justify-between text-sm">
                              <span className="text-gray-900 font-medium">{product.name}</span>
                              <span className="text-indigo-600 font-medium">
                                {serviceProduct.quantity} {product.unit}
                              </span>
                            </div>
                          ) : null;
                        })}
                      </div>
                    </div>
                  )}

                  {/* Paramètres en ligne */}
                  <div className="border-t border-gray-100 pt-4">
                    <ServiceOnlineSettings service={service} />
                  </div>

                  {/* Badge de statut */}
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center space-x-2">
                      {service.isActive ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1"></span>
                          Actif
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          <span className="w-1.5 h-1.5 bg-gray-500 rounded-full mr-1"></span>
                          Inactif
                        </span>
                      )}
                    </div>
                    
                    <button className="flex items-center space-x-1 text-xs text-indigo-600 hover:text-indigo-800 transition-colors">
                      <EyeIcon className="h-3 w-3" />
                      <span>Voir détails</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ServiceList;
