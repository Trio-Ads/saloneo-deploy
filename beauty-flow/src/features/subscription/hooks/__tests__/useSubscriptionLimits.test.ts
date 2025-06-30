import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useSubscriptionLimits } from '../useSubscriptionLimits';
import { useSubscriptionStore } from '../../store';
import { PlanType } from '../../types';

// Mock du store Zustand
vi.mock('../../store', () => ({
  useSubscriptionStore: vi.fn()
}));

describe('useSubscriptionLimits', () => {
  const mockCanAddMore = vi.fn();
  const mockHasAccess = vi.fn();
  const mockGetCurrentPlanLimits = vi.fn();
  
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Configuration par défaut du mock
    mockCanAddMore.mockReturnValue(true);
    mockHasAccess.mockReturnValue(true);
    mockGetCurrentPlanLimits.mockReturnValue({
      appointments: 30,
      clients: 50,
      services: 5,
      teamMembers: 1,
      stock: false,
      onlineBooking: false,
      customInterface: false
    });
    
    // Mock du store
    (useSubscriptionStore as any).mockReturnValue({
      canAddMore: mockCanAddMore,
      hasAccess: mockHasAccess,
      getCurrentPlanLimits: mockGetCurrentPlanLimits,
      currentUsage: {
        appointments: 10,
        clients: 20,
        services: 3,
        teamMembers: 1
      }
    });
  });

  it('should return the correct functions and values', () => {
    const { result } = renderHook(() => useSubscriptionLimits());
    
    expect(result.current).toHaveProperty('checkLimit');
    expect(result.current).toHaveProperty('checkFeatureAccess');
    expect(result.current).toHaveProperty('getRemainingCount');
    expect(result.current).toHaveProperty('currentUsage');
  });

  it('should check limits correctly with checkLimit', () => {
    // Cas où la limite est respectée
    mockCanAddMore.mockReturnValueOnce(true);
    
    const { result } = renderHook(() => useSubscriptionLimits());
    
    expect(result.current.checkLimit('clients', 5)).toEqual({
      allowed: true,
      message: ''
    });
    
    expect(mockCanAddMore).toHaveBeenCalledWith('clients', 5);
    
    // Cas où la limite est dépassée (limite numérique)
    mockCanAddMore.mockReturnValueOnce(false);
    
    expect(result.current.checkLimit('clients', 40)).toEqual({
      allowed: false,
      message: 'Vous avez atteint la limite de votre plan (50 clients)'
    });
    
    // Cas où la fonctionnalité n'est pas disponible (limite booléenne)
    mockCanAddMore.mockReturnValueOnce(false);
    
    expect(result.current.checkLimit('onlineBooking')).toEqual({
      allowed: false,
      message: 'Cette fonctionnalité n\'est pas disponible dans votre plan actuel'
    });
  });

  it('should check feature access correctly with checkFeatureAccess', () => {
    // Cas où la fonctionnalité est accessible
    mockHasAccess.mockReturnValueOnce(true);
    
    const { result } = renderHook(() => useSubscriptionLimits());
    
    expect(result.current.checkFeatureAccess('stock')).toEqual({
      allowed: true,
      message: ''
    });
    
    expect(mockHasAccess).toHaveBeenCalledWith('stock');
    
    // Cas où la fonctionnalité n'est pas accessible
    mockHasAccess.mockReturnValueOnce(false);
    
    expect(result.current.checkFeatureAccess('customInterface')).toEqual({
      allowed: false,
      message: 'Cette fonctionnalité n\'est pas disponible dans votre plan actuel'
    });
  });

  it('should calculate remaining count correctly with getRemainingCount', () => {
    const { result } = renderHook(() => useSubscriptionLimits());
    
    // Cas standard: limite - utilisation
    expect(result.current.getRemainingCount('clients')).toBe(30); // 50 - 20
    
    // Cas avec limite illimitée
    mockGetCurrentPlanLimits.mockReturnValueOnce({
      appointments: -1, // illimité
      clients: 50,
      services: 5,
      teamMembers: 1,
      stock: false,
      onlineBooking: false,
      customInterface: false
    });
    
    expect(result.current.getRemainingCount('appointments')).toBe(Infinity);
    
    // Cas où la limite est déjà atteinte
    mockGetCurrentPlanLimits.mockReturnValueOnce({
      appointments: 30,
      clients: 20, // Égal à l'utilisation actuelle
      services: 5,
      teamMembers: 1,
      stock: false,
      onlineBooking: false,
      customInterface: false
    });
    
    expect(result.current.getRemainingCount('clients')).toBe(0);
  });
});
