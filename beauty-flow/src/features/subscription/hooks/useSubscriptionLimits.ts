import { useEffect, useState } from 'react';
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
        setError('Impossible de charger les statistiques d\'utilisation');
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
      message: !canAdd ? `Limite de ${limit} clients atteinte. Passez à un plan supérieur pour continuer.` : undefined
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
      message: !canAdd ? `Limite de ${limit} services atteinte. Passez à un plan supérieur pour continuer.` : undefined
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
      message: !canAdd ? `Limite de ${limit} membres d'équipe atteinte. Passez à un plan supérieur pour continuer.` : undefined
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
      message: !canAdd ? `Limite de ${limit} rendez-vous atteinte. Passez à un plan supérieur pour continuer.` : undefined
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
        ? `Vous pouvez créer ${remaining === -1 ? 'un nombre illimité de' : remaining} produits`
        : `Limite de ${limit} produits atteinte pour le plan ${currentPlan}`
    };
  };

  const checkFeatureAccess = (feature: 'stock' | 'onlineBooking' | 'customInterface'): boolean => {
    if (!usageStats) {
      return limits[feature];
    }
    return usageStats.features[feature];
  };

  const getUpgradeMessage = (): string => {
    switch (subscription.currentPlan) {
      case 'FREE':
        return 'Passez au plan STARTER pour débloquer plus de fonctionnalités !';
      case 'STARTER':
        return 'Passez au plan PRO pour augmenter vos limites !';
      case 'PRO':
        return 'Passez au plan ENTERPRISE pour un usage illimité !';
      default:
        return 'Contactez-nous pour un plan personnalisé.';
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
    currentPlan: subscription.currentPlan,
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
        setError('Impossible de charger les statistiques d\'utilisation');
      } finally {
        setLoading(false);
      }
    }
  };
};
