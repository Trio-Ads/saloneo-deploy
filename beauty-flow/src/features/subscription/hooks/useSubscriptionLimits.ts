import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSubscriptionStore } from '../store';
import { PLAN_LIMITS } from '../types';
import subscriptionService, { UsageStats } from '../../../services/subscriptionService';
import { useClientStore } from '../../clients/store';
import { useServiceStore } from '../../services/store';
import { useTeamStore } from '../../team/store';
import { useAppointmentStore } from '../../appointments/store';

export interface LimitCheck {
  canAdd: boolean;
  remaining: number;
  limit: number;
  current: number;
  message?: string;
}

export const useSubscriptionLimits = () => {
  const { t } = useTranslation('subscription');
  const { subscription } = useSubscriptionStore();
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Récupérer les données des stores
  const clients = useClientStore((state) => state.clients);
  const services = useServiceStore((state) => state.services);
  const teamMembers = useTeamStore((state) => state.members);
  const appointments = useAppointmentStore((state) => state.appointments);
  const products = useServiceStore((state) => state.products);

  // Utiliser le plan depuis usageStats (backend) si disponible, sinon fallback sur le store
  const currentPlan = (usageStats?.plan as keyof typeof PLAN_LIMITS) || subscription.currentPlan;
  const limits = PLAN_LIMITS[currentPlan];

  // Charger les statistiques d'utilisation depuis le backend
  useEffect(() => {
    const fetchUsageStats = async () => {
      try {
        setLoading(true);
        const stats = await subscriptionService.getUsageStats();
        setUsageStats(stats);
        setError(null);
      } catch (err) {
        console.error('Erreur lors du chargement des statistiques:', err);
        setError(t('limits.messages.usage_error'));
      } finally {
        setLoading(false);
      }
    };

    fetchUsageStats();
    
    // Rafraîchir toutes les 30 secondes
    const interval = setInterval(fetchUsageStats, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const checkClientLimit = (): LimitCheck => {
    if (!usageStats) {
      return { canAdd: true, remaining: 0, limit: limits.clients, current: 0 };
    }
    
    const { current, limit, remaining } = usageStats.usage.clients;
    const canAdd = limit === -1 || current < limit;
    
    return {
      canAdd,
      remaining: limit === -1 ? Infinity : remaining,
      limit,
      current,
      message: !canAdd ? t('limits.messages.clients', { count: limit }) : undefined
    };
  };

  const checkServiceLimit = (): LimitCheck => {
    if (!usageStats) {
      return { canAdd: true, remaining: 0, limit: limits.services, current: 0 };
    }
    
    const { current, limit, remaining } = usageStats.usage.services;
    const canAdd = limit === -1 || current < limit;
    
    return {
      canAdd,
      remaining: limit === -1 ? Infinity : remaining,
      limit,
      current,
      message: !canAdd ? t('limits.messages.services', { count: limit }) : undefined
    };
  };

  const checkTeamMemberLimit = (): LimitCheck => {
    if (!usageStats) {
      return { canAdd: true, remaining: 0, limit: limits.teamMembers, current: 0 };
    }
    
    const { current, limit, remaining } = usageStats.usage.teamMembers;
    const canAdd = limit === -1 || current < limit;
    
    return {
      canAdd,
      remaining: limit === -1 ? Infinity : remaining,
      limit,
      current,
      message: !canAdd ? t('limits.messages.team', { count: limit }) : undefined
    };
  };

  const checkAppointmentLimit = (): LimitCheck => {
    if (!usageStats) {
      return { canAdd: true, remaining: 0, limit: limits.appointments, current: 0 };
    }
    
    const { current, limit, remaining } = usageStats.usage.appointments;
    const canAdd = limit === -1 || current < limit;
    
    return {
      canAdd,
      remaining: limit === -1 ? Infinity : remaining,
      limit,
      current,
      message: !canAdd ? t('limits.messages.appointments', { count: limit }) : undefined
    };
  };

  const checkProductLimit = (): LimitCheck => {
    // Définir les limites pour les produits
    const productLimits = {
      FREE: 10,
      STARTER: 50,
      PRO: 200,
      ENTERPRISE: -1
    };
    
    const limit = productLimits[currentPlan as keyof typeof productLimits];
    const current = products?.length || 0;
    const remaining = limit === -1 ? -1 : Math.max(0, limit - current);
    const canAdd = limit === -1 || current < limit;
    
    return {
      current,
      limit,
      remaining,
      canAdd,
      message: canAdd 
        ? (remaining === -1 ? t('limits.messages.products_unlimited') : t('limits.messages.products_remaining', { count: remaining }))
        : t('limits.messages.products', { count: limit, plan: currentPlan })
    };
  };

  const checkFeatureAccess = (feature: 'stock' | 'onlineBooking' | 'customInterface'): boolean => {
    if (!usageStats) {
      return limits[feature];
    }
    return usageStats.features[feature];
  };

  const getUpgradeMessage = (): string => {
    switch (currentPlan) {
      case 'FREE':
        return t('limits.upgrade.FREE');
      case 'STARTER':
        return t('limits.upgrade.STARTER');
      case 'PRO':
        return t('limits.upgrade.PRO');
      default:
        return t('limits.upgrade.ENTERPRISE');
    }
  };

  return {
    limits,
    checkAppointmentLimit,
    checkClientLimit,
    checkServiceLimit,
    checkTeamMemberLimit,
    checkProductLimit,
    checkFeatureAccess,
    getUpgradeMessage,
    // Plan réel renvoyé par le backend (le store local reste sur FREE par défaut)
    currentPlan,
    loading,
    error,
    usageStats,
    refetch: async () => {
      try {
        setLoading(true);
        const stats = await subscriptionService.getUsageStats();
        setUsageStats(stats);
        setError(null);
      } catch (err) {
        console.error('Erreur lors du chargement des statistiques:', err);
        setError(t('limits.messages.usage_error'));
      } finally {
        setLoading(false);
      }
    }
  };
};
