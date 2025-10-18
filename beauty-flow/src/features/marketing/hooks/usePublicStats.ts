import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface PublicStats {
  salonsCount: number;
  appointmentsCount: number;
  clientsCount: number;
  servicesCount: number;
  hoursSaved: number;
  satisfactionRate: number;
  timestamp: string;
}

interface UsePublicStatsReturn {
  stats: PublicStats | null;
  loading: boolean;
  error: string | null;
}

/**
 * Hook pour récupérer les statistiques publiques de la landing page
 * Les statistiques sont mises en cache côté serveur (1 heure)
 */
export const usePublicStats = (): UsePublicStatsReturn => {
  const [stats, setStats] = useState<PublicStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await axios.get(`${API_URL}/api/stats/public`);

        if (response.data.success) {
          setStats(response.data.data);
        } else {
          setError('Erreur lors de la récupération des statistiques');
        }
      } catch (err) {
        console.error('Erreur lors de la récupération des statistiques:', err);
        // En cas d'erreur, utiliser des valeurs par défaut
        setStats({
          salonsCount: 150,
          appointmentsCount: 5000,
          clientsCount: 3000,
          servicesCount: 500,
          hoursSaved: 15600,
          satisfactionRate: 98,
          timestamp: new Date().toISOString()
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return { stats, loading, error };
};
