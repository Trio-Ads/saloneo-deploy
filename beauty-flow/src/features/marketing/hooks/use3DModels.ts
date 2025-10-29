import { useState, useEffect } from 'react';
import api from '../../../services/api';

interface Marketing3DModels {
  logo: { url: string; filename: string } | null;
  calendar: { url: string; filename: string } | null;
  analytics: { url: string; filename: string } | null;
  creditCard: { url: string; filename: string } | null;
  shield: { url: string; filename: string } | null;
  chair: { url: string; filename: string } | null;
  products: Array<{ url: string; filename: string }>;
}

interface Use3DModelsReturn {
  models: Marketing3DModels | null;
  loading: boolean;
  error: string | null;
  generate3DModels: () => Promise<void>;
  getModelUrl: (path: string) => string;
}

export const use3DModels = (): Use3DModelsReturn => {
  const [models, setModels] = useState<Marketing3DModels | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fonction pour obtenir l'URL complète d'un modèle 3D
  const getModelUrl = (path: string): string => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    
    // Utiliser l'URL du backend
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    return `${baseUrl}${path}`;
  };

  // Charger les modèles 3D depuis le cache ou générer de nouveaux
  const loadModels = async () => {
    try {
      setLoading(true);
      setError(null);

      // Essayer de récupérer les modèles existants
      const response = await api.get('/marketing/3d/list');
      
      if (response.data.models && response.data.models.length > 0) {
        // Organiser les modèles par type
        const organized3DModels: Marketing3DModels = {
          logo: null,
          calendar: null,
          analytics: null,
          creditCard: null,
          shield: null,
          chair: null,
          products: []
        };

        // Mapper les modèles selon leur nom
        response.data.models.forEach((model: any) => {
          const filename = model.filename.toLowerCase();
          if (filename.includes('logo')) {
            organized3DModels.logo = model;
          } else if (filename.includes('calendar')) {
            organized3DModels.calendar = model;
          } else if (filename.includes('analytics')) {
            organized3DModels.analytics = model;
          } else if (filename.includes('credit') || filename.includes('card')) {
            organized3DModels.creditCard = model;
          } else if (filename.includes('shield') || filename.includes('security')) {
            organized3DModels.shield = model;
          } else if (filename.includes('chair')) {
            organized3DModels.chair = model;
          } else if (filename.includes('product')) {
            organized3DModels.products.push(model);
          }
        });

        setModels(organized3DModels);
      } else {
        // Aucun modèle trouvé, utiliser des placeholders ou générer
        setModels(getPlaceholder3DModels());
      }
    } catch (err) {
      console.error('Erreur lors du chargement des modèles 3D:', err);
      setError('Impossible de charger les modèles 3D');
      // Utiliser les placeholders en cas d'erreur
      setModels(getPlaceholder3DModels());
    } finally {
      setLoading(false);
    }
  };

  // Générer de nouveaux modèles 3D
  const generate3DModels = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get('/marketing/3d/generate');
      
      if (response.data.success && response.data.models) {
        setModels(response.data.models);
      } else {
        throw new Error('Échec de la génération des modèles 3D');
      }
    } catch (err) {
      console.error('Erreur lors de la génération des modèles 3D:', err);
      setError('Impossible de générer les modèles 3D');
      // Utiliser les placeholders en cas d'erreur
      setModels(getPlaceholder3DModels());
    } finally {
      setLoading(false);
    }
  };

  // Obtenir des modèles placeholder (cubes colorés)
  const getPlaceholder3DModels = (): Marketing3DModels => {
    // En production, on pourrait avoir des modèles 3D de base stockés localement
    return {
      logo: null,
      calendar: null,
      analytics: null,
      creditCard: null,
      shield: null,
      chair: null,
      products: []
    };
  };

  // Charger les modèles au montage du composant
  useEffect(() => {
    loadModels();
  }, []);

  return {
    models,
    loading,
    error,
    generate3DModels,
    getModelUrl
  };
};
