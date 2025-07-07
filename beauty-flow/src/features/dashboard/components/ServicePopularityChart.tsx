import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { AppointmentWithPrice } from '../types';
import { Service } from '../../services/types';

interface ServicePopularityChartProps {
  appointments: AppointmentWithPrice[];
  services: Service[];
}

const ServicePopularityChart: React.FC<ServicePopularityChartProps> = ({ appointments, services }) => {
  const { t } = useTranslation('dashboard');
  const serviceStats = useMemo(() => {
    // Créer un ensemble des IDs de services existants pour une recherche rapide
    const existingServiceIds = new Set(services.map(service => service.id));
    
    // Compter les rendez-vous par service, en ignorant les services qui n'existent plus
    const serviceCount = new Map<string, number>();
    
    appointments.forEach(apt => {
      // Vérifier si le service existe toujours
      if (existingServiceIds.has(apt.serviceId)) {
        const count = serviceCount.get(apt.serviceId) || 0;
        serviceCount.set(apt.serviceId, count + 1);
      }
    });

    // Créer les statistiques avec les noms de services
    const stats = Array.from(serviceCount.entries())
      .map(([serviceId, count]) => {
        const service = services.find(s => s.id === serviceId);
        // À ce stade, le service devrait toujours exister, mais gardons la vérification par sécurité
        return {
          id: serviceId,
          name: service?.name || t('components.service_popularity.unknown_service'),
          count,
          category: service?.category || t('components.service_popularity.other_category')
        };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 5); // Top 5 services

    return stats;
  }, [appointments, services]);

  const maxCount = Math.max(...serviceStats.map(s => s.count), 1);

  if (serviceStats.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center">
        <p className="text-gray-500 text-sm">{t('components.service_popularity.no_data')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {serviceStats.map((service, index) => {
        const percentage = (service.count / maxCount) * 100;
        const gradients = [
          'from-indigo-500 to-purple-600',
          'from-blue-500 to-cyan-600',
          'from-green-500 to-emerald-600',
          'from-orange-500 to-amber-600',
          'from-pink-500 to-rose-600'
        ];
        const gradient = gradients[index % gradients.length];

        return (
          <div key={service.id} className="group">
            <div className="flex items-center justify-between mb-1">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {service.name}
                </p>
                <p className="text-xs text-gray-500">{service.category}</p>
              </div>
              <div className="ml-2 flex items-center space-x-2">
                <span className="text-sm font-semibold text-gray-700">{service.count}</span>
                <span className="text-xs text-gray-500">({((service.count / appointments.length) * 100).toFixed(0)}%)</span>
              </div>
            </div>
            <div className="relative h-6 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`absolute inset-y-0 left-0 bg-gradient-to-r ${gradient} rounded-full transition-all duration-500 ease-out group-hover:shadow-lg`}
                style={{ width: `${percentage}%` }}
              >
                <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ServicePopularityChart;
