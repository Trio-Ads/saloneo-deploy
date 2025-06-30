import { useCallback } from 'react';
import { useSubscriptionStore } from '../store';
import { PlanLimits } from '../types';

export const useSubscriptionLimits = () => {
  const { canAddMore, hasAccess, getCurrentPlanLimits, currentUsage } = useSubscriptionStore();

  const checkLimit = useCallback((type: keyof PlanLimits, count = 1) => {
    const canAdd = canAddMore(type, count);
    if (!canAdd) {
      const limits = getCurrentPlanLimits();
      return {
        allowed: false,
        message: typeof limits[type] === 'boolean'
          ? 'Cette fonctionnalité n\'est pas disponible dans votre plan actuel'
          : `Vous avez atteint la limite de votre plan (${limits[type]} ${type})`
      };
    }
    return { allowed: true, message: '' };
  }, [canAddMore, getCurrentPlanLimits]);

  const checkFeatureAccess = useCallback((feature: keyof PlanLimits) => {
    const hasFeatureAccess = hasAccess(feature);
    return {
      allowed: hasFeatureAccess,
      message: hasFeatureAccess ? '' : 'Cette fonctionnalité n\'est pas disponible dans votre plan actuel'
    };
  }, [hasAccess]);

  const getRemainingCount = useCallback((type: keyof typeof currentUsage) => {
    const limits = getCurrentPlanLimits();
    const limit = limits[type] as number;
    if (limit === -1) return Infinity;
    return Math.max(0, limit - (currentUsage[type] || 0));
  }, [getCurrentPlanLimits, currentUsage]);

  return {
    checkLimit,
    checkFeatureAccess,
    getRemainingCount,
    currentUsage
  };
};
