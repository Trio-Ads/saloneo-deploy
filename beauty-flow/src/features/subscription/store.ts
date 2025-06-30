import { create } from 'zustand';
import { PlanType, Subscription, PLAN_LIMITS, Plan, PlanLimits } from './types';

interface SubscriptionStore {
  subscription: Subscription;
  currentUsage: {
    appointments: number;
    clients: number;
    services: number;
    teamMembers: number;
  };
  updateSubscription: (subscription: Subscription) => void;
  updateUsage: (usage: Partial<SubscriptionStore['currentUsage']>) => void;
  canAddMore: (type: keyof PlanLimits, count?: number) => boolean;
  getCurrentPlanLimits: () => PlanLimits;
  hasAccess: (feature: keyof PlanLimits) => boolean;
}

const defaultSubscription: Subscription = {
  currentPlan: PlanType.FREE,
  startDate: new Date().toISOString(),
  isActive: true
};

const defaultUsage = {
  appointments: 0,
  clients: 0,
  services: 0,
  teamMembers: 0
};

const useSubscriptionStore = create<SubscriptionStore>((set, get) => ({
  subscription: defaultSubscription,
  currentUsage: defaultUsage,

  updateSubscription: (subscription) => set({ subscription }),

  updateUsage: (usage) =>
    set((state) => ({
      currentUsage: {
        ...state.currentUsage,
        ...usage
      }
    })),

  getCurrentPlanLimits: () => {
    const { currentPlan } = get().subscription;
    return PLAN_LIMITS[currentPlan];
  },

  canAddMore: (type: keyof PlanLimits, count = 1) => {
    const { currentUsage } = get();
    const limits = get().getCurrentPlanLimits();
    
    // Si la limite est -1, c'est illimité
    if (limits[type] === -1) return true;
    
    // Pour les booléens (fonctionnalités)
    if (typeof limits[type] === 'boolean') {
      return limits[type] as boolean;
    }
    
    // Pour les limites numériques
    const currentCount = currentUsage[type as keyof typeof currentUsage] || 0;
    return currentCount + count <= (limits[type] as number);
  },

  hasAccess: (feature: keyof PlanLimits) => {
    const limits = get().getCurrentPlanLimits();
    if (typeof limits[feature] === 'boolean') {
      return limits[feature] as boolean;
    }
    return true;
  }
}));

export { useSubscriptionStore };
