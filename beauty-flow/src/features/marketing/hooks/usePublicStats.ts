import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '');

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
        // Pas de chiffres inventés : sans réponse de l'API, la page n'affiche aucune statistique
        setError('Statistiques indisponibles');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return { stats, loading, error };
};
