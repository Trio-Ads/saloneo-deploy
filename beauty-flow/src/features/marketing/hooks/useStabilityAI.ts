import { useState, useEffect } from 'react';
import api from '../../../services/api';

interface MarketingImages {
  hero: { url: string; filename: string } | null;
  dashboard: { url: string; filename: string } | null;
  transformation: { url: string; filename: string } | null;
  roi: { url: string; filename: string } | null;
  security: { url: string; filename: string } | null;
  testimonials: Array<{ url: string; filename: string }>;
}

interface UseStabilityAIReturn {
  images: MarketingImages | null;
  loading: boolean;
  error: string | null;
  generateImages: () => Promise<void>;
  getImageUrl: (path: string) => string;
}

export const useStabilityAI = (): UseStabilityAIReturn => {
  const [images, setImages] = useState<MarketingImages | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fonction pour obtenir l'URL complète d'une image
  const getImageUrl = (path: string): string => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    
    // Utiliser l'URL du backend
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    return `${baseUrl}${path}`;
  };

  // Charger les images depuis le cache ou générer de nouvelles
  const loadImages = async () => {
    try {
      setLoading(true);
      setError(null);

      // Essayer de récupérer les images existantes
      const response = await api.get('/marketing/images/list');
      
      if (response.data.images && response.data.images.length > 0) {
        // Organiser les images par type
        const organizedImages: MarketingImages = {
          hero: null,
          dashboard: null,
          transformation: null,
          roi: null,
          security: null,
          testimonials: []
        };

        // Mapper les images selon leur nom
        response.data.images.forEach((img: any) => {
          if (img.filename.includes('hero')) {
            organizedImages.hero = img;
          } else if (img.filename.includes('dashboard')) {
            organizedImages.dashboard = img;
          } else if (img.filename.includes('transformation')) {
            organizedImages.transformation = img;
          } else if (img.filename.includes('roi')) {
            organizedImages.roi = img;
          } else if (img.filename.includes('security')) {
            organizedImages.security = img;
          } else if (img.filename.includes('testimonial')) {
            organizedImages.testimonials.push(img);
          }
        });

        setImages(organizedImages);
      } else {
        // Aucune image trouvée, utiliser les placeholders
        setImages(getPlaceholderImages());
      }
    } catch (err) {
      console.error('Erreur lors du chargement des images:', err);
      setError('Impossible de charger les images');
      // Utiliser les placeholders en cas d'erreur
      setImages(getPlaceholderImages());
    } finally {
      setLoading(false);
    }
  };

  // Générer de nouvelles images avec Stability AI
  const generateImages = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get('/marketing/images/generate');
      
      if (response.data.success && response.data.images) {
        setImages(response.data.images);
      } else {
        throw new Error('Échec de la génération des images');
      }
    } catch (err) {
      console.error('Erreur lors de la génération des images:', err);
      setError('Impossible de générer les images');
      // Utiliser les placeholders en cas d'erreur
      setImages(getPlaceholderImages());
    } finally {
      setLoading(false);
    }
  };

  // Obtenir des images placeholder
  const getPlaceholderImages = (): MarketingImages => {
    return {
      hero: {
        url: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1200&h=800&fit=crop',
        filename: 'placeholder-hero.jpg'
      },
      dashboard: {
        url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=800&fit=crop',
        filename: 'placeholder-dashboard.jpg'
      },
      transformation: {
        url: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=1200&h=800&fit=crop',
        filename: 'placeholder-transformation.jpg'
      },
      roi: {
        url: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800&h=800&fit=crop',
        filename: 'placeholder-roi.jpg'
      },
      security: {
        url: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&h=600&fit=crop',
        filename: 'placeholder-security.jpg'
      },
      testimonials: [
        {
          url: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=400&h=400&fit=crop',
          filename: 'placeholder-testimonial-1.jpg'
        },
        {
          url: 'https://images.unsplash.com/photo-1595152452543-e5fc28ebc2b8?w=400&h=400&fit=crop',
          filename: 'placeholder-testimonial-2.jpg'
        },
        {
          url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
          filename: 'placeholder-testimonial-3.jpg'
        }
      ]
    };
  };

  // Charger les images au montage du composant
  useEffect(() => {
    loadImages();
  }, []);

  return {
    images,
    loading,
    error,
    generateImages,
    getImageUrl
  };
};
