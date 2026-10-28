import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  ArrowTrendingUpIcon, 
  ArrowTrendingDownIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { subDays, startOfMonth, endOfMonth } from 'date-fns';
import { Panel } from '../../../components/ui';
import { AppointmentWithPrice } from '../types';
import { Client } from '../../clients/types';
import { Service } from '../../services/types';
import { useProfileStore } from '../../profile/store';
import { formatPrice } from '../../../utils/currency';

interface BusinessInsightsProps {
  appointments: AppointmentWithPrice[];
  clients: Client[];
  services: Service[];
}

const BusinessInsights: React.FC<BusinessInsightsProps> = ({ appointments, clients, services }) => {
  const { t } = useTranslation('dashboard');
  const { profile } = useProfileStore();

  const insights = useMemo(() => {
    const insightsList = [];
    const today = new Date();
    const lastWeek = subDays(today, 7);
    const monthStart = startOfMonth(today);
    const monthEnd = endOfMonth(today);

    // Analyse des rendez-vous annulés
    const cancelledThisMonth = appointments.filter(apt => {
      const aptDate = new Date(apt.date);
      return aptDate >= monthStart && aptDate <= monthEnd && apt.status === 'cancelled';
    });
    
    const cancellationRate = appointments.length > 0 
      ? (cancelledThisMonth.length / appointments.length) * 100 
      : 0;

    if (cancellationRate > 15) {
      insightsList.push({
        type: 'warning',
        title: t('components.business_insights.insights.high_cancellation_title'),
        description: t('components.business_insights.insights.high_cancellation_desc', { 
          rate: cancellationRate.toFixed(0) 
        }),
        icon: ExclamationTriangleIcon
      });
    }

    // Analyse des services les plus rentables
    // Créer un ensemble des IDs de services existants pour une recherche rapide
    const existingServiceIds = new Set(services.map(service => service.id));
    
    const serviceRevenue = new Map<string, number>();
    appointments
      .filter(apt => apt.status === 'completed' && existingServiceIds.has(apt.serviceId))
      .forEach(apt => {
        const current = serviceRevenue.get(apt.serviceId) || 0;
        serviceRevenue.set(apt.serviceId, current + (apt.price || 0));
      });

    const topService = Array.from(serviceRevenue.entries())
      .sort((a, b) => b[1] - a[1])[0];

    if (topService) {
      const service = services.find(s => s.id === topService[0]);
      if (service) {
        insightsList.push({
          type: 'success',
          title: t('components.business_insights.insights.top_service_title'),
          description: t('components.business_insights.insights.top_service_desc', {
            service: service.name,
            revenue: formatPrice(topService[1], profile.currency)
          }),
          icon: ArrowTrendingUpIcon
        });
      }
    }

    // Analyse de la fidélité client (basé sur les points de fidélité)
    const loyalClients = clients.filter(client => 
      client.loyaltyPoints >= 50
    );

    if (loyalClients.length > 0) {
      const loyaltyRate = (loyalClients.length / clients.length) * 100;
      insightsList.push({
        type: 'info',
        title: t('components.business_insights.insights.loyal_clients_title'),
        description: t('components.business_insights.insights.loyal_clients_desc', {
          rate: loyaltyRate.toFixed(0)
        }),
        icon: CheckCircleIcon
      });
    }

    // Analyse des créneaux populaires
    const timeSlots = new Map<string, number>();
    appointments.forEach(apt => {
      const hour = parseInt(apt.startTime.split(':')[0]);
      const slot = `${hour}h-${hour + 1}h`;
      timeSlots.set(slot, (timeSlots.get(slot) || 0) + 1);
    });

    const popularSlot = Array.from(timeSlots.entries())
      .sort((a, b) => b[1] - a[1])[0];

    if (popularSlot) {
      insightsList.push({
        type: 'info',
        title: t('components.business_insights.insights.popular_slot_title'),
        description: t('components.business_insights.insights.popular_slot_desc', {
          slot: popularSlot[0]
        }),
        icon: InformationCircleIcon
      });
    }

    // Analyse des nouveaux clients
    const newClientsLastWeek = clients.filter(client => {
      const createdDate = new Date(client.createdAt);
      return createdDate >= lastWeek;
    });

    if (newClientsLastWeek.length === 0) {
      insightsList.push({
        type: 'warning',
        title: t('components.business_insights.insights.low_acquisition_title'),
        description: t('components.business_insights.insights.low_acquisition_desc'),
        icon: ArrowTrendingDownIcon
      });
    }

    return insightsList.slice(0, 4); // Limiter à 4 insights
  }, [appointments, clients, services, t, profile.currency]);

  if (insights.length === 0) {
    return null;
  }

  const iconColor: Record<string, string> = {
    success: 'text-emerald-600 dark:text-emerald-400',
    warning: 'text-amber-600 dark:text-amber-400',
    info: 'text-gray-400',
  };

  return (
    <Panel title={t('components.business_insights.title')} flush>
      <ul className="divide-y divide-gray-100 dark:divide-gray-800 border-t border-gray-100 dark:border-gray-800">
        {insights.map((insight, index) => {
          const Icon = insight.icon;
          return (
            <li key={index} className="flex items-start gap-3 px-5 py-3">
              <Icon className={`mt-0.5 size-5 shrink-0 ${iconColor[insight.type] || iconColor.info}`} />
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-50">{insight.title}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{insight.description}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </Panel>
  );
};

export default BusinessInsights;
