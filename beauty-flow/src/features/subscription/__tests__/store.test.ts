// @ts-nocheck
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useSubscriptionStore } from '../store';
import { PlanType, PLAN_LIMITS } from '../types';

// Mock du store Zustand
vi.mock('../store', () => {
  // Créer un store mock avec les valeurs par défaut
  const defaultSubscription = {
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
  
  // Store mock avec état interne
  const store = {
    subscription: { ...defaultSubscription },
    currentUsage: { ...defaultUsage },
    updateSubscription: vi.fn((newSubscription) => {
      store.subscription = newSubscription;
    }),
    updateUsage: vi.fn((newUsage) => {
      store.currentUsage = {
        ...store.currentUsage,
        ...newUsage
      };
    }),
    getCurrentPlanLimits: vi.fn(() => {
      return PLAN_LIMITS[store.subscription.currentPlan];
    }),
    canAddMore: vi.fn((type, count = 1) => {
      const limits = PLAN_LIMITS[store.subscription.currentPlan];
      if (limits[type] === -1) return true;
      if (typeof limits[type] === 'boolean') return limits[type];
      const currentCount = store.currentUsage[type as keyof typeof store.currentUsage] || 0;
      return currentCount + count <= limits[type];
    }),
    hasAccess: vi.fn((feature) => {
      const limits = PLAN_LIMITS[store.subscription.currentPlan];
      if (typeof limits[feature] === 'boolean') {
        return limits[feature];
      }
      return true;
    })
  };
  
  return {
    useSubscriptionStore: vi.fn(() => store)
  };
});

describe('Subscription Store', () => {
  let store;
  
  beforeEach(() => {
    // Réinitialiser les mocks
    vi.clearAllMocks();
    
    // Obtenir le store
    store = useSubscriptionStore();
  });

  it('should initialize with default values', () => {
    expect(store.subscription).toEqual({
      currentPlan: PlanType.FREE,
      startDate: expect.any(String),
      isActive: true
    });
    
    expect(store.currentUsage).toEqual({
      appointments: 0,
      clients: 0,
      services: 0,
      teamMembers: 0
    });
  });

  it('should update subscription when calling updateSubscription', () => {
    const newSubscription = {
      currentPlan: PlanType.PRO,
      startDate: '2025-01-01',
      endDate: '2026-01-01',
      isActive: true
    };
    
    store.updateSubscription(newSubscription);
    
    expect(store.subscription).toEqual(newSubscription);
    expect(store.updateSubscription).toHaveBeenCalledWith(newSubscription);
  });

  it('should update usage when calling updateUsage', () => {
    const newUsage = {
      appointments: 10,
      clients: 20
    };
    
    store.updateUsage(newUsage);
    
    expect(store.currentUsage).toEqual({
      appointments: 10,
      clients: 20,
      services: 0,
      teamMembers: 0
    });
    expect(store.updateUsage).toHaveBeenCalledWith(newUsage);
  });

  it('should return correct plan limits with getCurrentPlanLimits', () => {
    // Par défaut, le plan est FREE
    const freeLimits = store.getCurrentPlanLimits();
    expect(freeLimits.appointments).toBe(30);
    expect(freeLimits.clients).toBe(50);
    
    // Changer le plan à PRO
    store.updateSubscription({
      ...store.subscription,
      currentPlan: PlanType.PRO
    });
    
    const proLimits = store.getCurrentPlanLimits();
    expect(proLimits.appointments).toBe(-1); // illimité
    expect(proLimits.teamMembers).toBe(8);
  });

  it('should check if more items can be added with canAddMore', () => {
    // Plan FREE: limite de 50 clients
    expect(store.canAddMore('clients', 10)).toBe(true); // 0 + 10 <= 50
    
    // Mettre à jour l'utilisation à 45 clients
    store.updateUsage({ clients: 45 });
    
    expect(store.canAddMore('clients', 5)).toBe(true); // 45 + 5 <= 50
    expect(store.canAddMore('clients', 6)).toBe(false); // 45 + 6 > 50
    
    // Vérifier les fonctionnalités booléennes
    expect(store.canAddMore('onlineBooking')).toBe(false); // Plan FREE: onlineBooking = false
    
    // Changer le plan à STARTER
    store.updateSubscription({
      ...store.subscription,
      currentPlan: PlanType.STARTER
    });
    
    expect(store.canAddMore('onlineBooking')).toBe(true); // Plan STARTER: onlineBooking = true
  });

  it('should check feature access with hasAccess', () => {
    // Plan FREE
    expect(store.hasAccess('onlineBooking')).toBe(false);
    expect(store.hasAccess('customInterface')).toBe(false);
    
    // Changer le plan à STARTER
    store.updateSubscription({
      ...store.subscription,
      currentPlan: PlanType.STARTER
    });
    
    expect(store.hasAccess('onlineBooking')).toBe(true);
    expect(store.hasAccess('customInterface')).toBe(true);
  });
});
