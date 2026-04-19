import { useState, useEffect } from 'react';
import axios from 'axios';
import { SalonPublicData, PublicSalonProfile, PublicService, PublicTeamMember, PublicReview } from '../types';

const API_BASE = import.meta.env.VITE_API_URL || '';

export function useSalonPublicData(slug: string) {
  const [data, setData] = useState<SalonPublicData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setError(null);

    Promise.all([
      axios.get<PublicSalonProfile>(`${API_BASE}/api/public/salon/${slug}`),
      axios.get<PublicService[]>(`${API_BASE}/api/public/services/${slug}`),
      axios.get<PublicTeamMember[]>(`${API_BASE}/api/public/team/${slug}`),
      axios.get<PublicReview[]>(`${API_BASE}/api/public/reviews/${slug}`).catch(() => ({ data: [] })),
    ])
      .then(([profileRes, servicesRes, teamRes, reviewsRes]) => {
        setData({
          profile: profileRes.data,
          services: servicesRes.data,
          team: teamRes.data,
          reviews: reviewsRes.data,
        });
      })
      .catch(() => setError('Impossible de charger la page du salon.'))
      .finally(() => setLoading(false));
  }, [slug]);

  return { data, loading, error };
}
