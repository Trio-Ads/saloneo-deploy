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
  }, [appointments, services, t]);

  const maxCount = Math.max(...serviceStats.map(s => s.count), 1);

  if (serviceStats.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">{t('components.service_popularity.no_data')}</p>
      </div>
    );
  }

  return (
    <ul className="space-y-4">
      {serviceStats.map((service) => (
        <li key={service.id}>
          <div className="mb-1.5 flex items-baseline justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-50">{service.name}</p>
              <p className="truncate text-xs text-gray-500 dark:text-gray-400">{service.category}</p>
            </div>
            <span className="shrink-0 text-sm tabular-nums text-gray-500 dark:text-gray-400">
              <span className="font-medium text-gray-900 dark:text-gray-50">{service.count}</span> · {((service.count / appointments.length) * 100).toFixed(0)}%
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
            <div className="h-full rounded-full bg-orange-500 dark:bg-orange-400" style={{ width: `${(service.count / maxCount) * 100}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
};

export default ServicePopularityChart;
