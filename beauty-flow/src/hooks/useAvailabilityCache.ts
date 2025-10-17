import { useState, useEffect, useCallback, useRef } from 'react';
import { useAppointmentStore } from '../features/appointments/store';
import { format, addDays, startOfDay } from 'date-fns';

interface AvailabilityCache {
  [key: string]: {
    data: any;
    timestamp: number;
  };
}

const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes en millisecondes

/**
 * Hook pour gérer le cache des disponibilités
 * Met à jour automatiquement toutes les 2 minutes
 */
export const useAvailabilityCache = (stylistId: string, daysToLoad: number = 90) => {
  const [cache, setCache] = useState<AvailabilityCache>({});
  const [isLoading, setIsLoading] = useState(false);
  const getDaySchedule = useAppointmentStore((state) => state.getDaySchedule);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Générer la clé de cache
  const getCacheKey = useCallback((date: string, stylistId: string) => {
    return `${date}-${stylistId}`;
  }, []);

  // Vérifier si le cache est valide
  const isCacheValid = useCallback((key: string) => {
    const cached = cache[key];
    if (!cached) return false;
    
    const now = Date.now();
    return (now - cached.timestamp) < CACHE_DURATION;
  }, [cache]);

  // Charger les disponibilités pour une période
  const loadAvailabilities = useCallback(async () => {
    if (!stylistId) return;
    
    setIsLoading(true);
    const newCache: AvailabilityCache = { ...cache };
    const today = startOfDay(new Date());
    
    // Charger les disponibilités pour les X prochains jours
    for (let i = 0; i < daysToLoad; i++) {
      const date = addDays(today, i);
      const dateStr = format(date, 'yyyy-MM-dd');
      const key = getCacheKey(dateStr, stylistId);
      
      // Ne recharger que si le cache est invalide
      if (!isCacheValid(key)) {
        const schedule = getDaySchedule(dateStr, stylistId);
        newCache[key] = {
          data: schedule,
          timestamp: Date.now(),
        };
      }
    }
    
    setCache(newCache);
    setIsLoading(false);
  }, [stylistId, daysToLoad, cache, getCacheKey, isCacheValid, getDaySchedule]);

  // Obtenir les disponibilités depuis le cache
  const getAvailability = useCallback((date: string) => {
    const key = getCacheKey(date, stylistId);
    const cached = cache[key];
    
    if (cached && isCacheValid(key)) {
      return cached.data;
    }
    
    // Si pas en cache ou expiré, charger directement
    return getDaySchedule(date, stylistId);
  }, [cache, getCacheKey, isCacheValid, stylistId, getDaySchedule]);

  // Invalider le cache pour une date spécifique
  const invalidateCache = useCallback((date?: string) => {
    if (date) {
      const key = getCacheKey(date, stylistId);
      setCache(prev => {
        const newCache = { ...prev };
        delete newCache[key];
        return newCache;
      });
    } else {
      // Invalider tout le cache
      setCache({});
    }
  }, [getCacheKey, stylistId]);

  // Charger initialement et configurer le rafraîchissement automatique
  useEffect(() => {
    loadAvailabilities();
    
    // Rafraîchir automatiquement toutes les 2 minutes
    intervalRef.current = setInterval(() => {
      loadAvailabilities();
    }, CACHE_DURATION);
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [loadAvailabilities]);

  return {
    getAvailability,
    invalidateCache,
    isLoading,
    refreshCache: loadAvailabilities,
  };
};
