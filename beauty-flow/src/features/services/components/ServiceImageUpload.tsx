import React, { useRef } from 'react';
import { useServiceStore } from '../store';
import api from '../../../services/api';

interface ServiceImageUploadProps {
  serviceId: string;
}

const ServiceImageUpload: React.FC<ServiceImageUploadProps> = ({ serviceId }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { services, updateService } = useServiceStore();
  const service = services.find(s => s.id === serviceId);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        // Vérifier la taille du fichier (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          alert('L\'image ne doit pas dépasser 5MB');
          return;
        }

        // Vérifier le type de fichier
        if (!file.type.startsWith('image/')) {
          alert('Veuillez sélectionner une image');
          return;
        }

        // Vérifier les dimensions de l'image
        const img = new Image();
        const imageUrl = URL.createObjectURL(file);
        
        img.onload = async () => {
          URL.revokeObjectURL(imageUrl);
          
          // Dimensions recommandées : 1200x800px (ratio 3:2)
          const optimalWidth = 1200;
          const optimalHeight = 800;
          const tolerance = 0.1; // 10% de tolérance
          
          const widthDiff = Math.abs(img.width - optimalWidth) / optimalWidth;
          const heightDiff = Math.abs(img.height - optimalHeight) / optimalHeight;
          
          if (widthDiff > tolerance || heightDiff > tolerance) {
            const proceed = confirm(
              `Dimensions détectées: ${img.width}x${img.height}px\n` +
              `Dimensions optimales: ${optimalWidth}x${optimalHeight}px\n\n` +
              `Pour un meilleur rendu, utilisez les dimensions optimales.\n` +
              `Voulez-vous continuer quand même ?`
            );
            if (!proceed) return;
          }
          
          try {
            // Upload direct via l'API Service (plus de localStorage)
            if (!service || service.id === 'temp-service') {
              alert('Veuillez d\'abord sauvegarder le service');
              return;
            }

            // Vérifier qu'on n'a pas déjà 5 images
            if (service.images && service.images.length >= 5) {
              alert('Maximum 5 images par service');
              return;
            }

            // Upload via FormData vers l'API upload
            const formData = new FormData();
            formData.append('image', file);

            const uploadResponse = await api.post(`/upload/service/${service.id}/image`, formData, {
              headers: {
                'Content-Type': 'multipart/form-data',
              },
            });

            // Recharger le service pour avoir les données à jour
            const response = await api.get(`/services/${service.id}`);
            if (response.data.service) {
              updateService(service.id, response.data.service);
            }

            console.log('✅ Image uploadée avec succès');
          } catch (error) {
            console.error('Erreur lors du téléchargement de l\'image:', error);
            alert('Erreur lors du téléchargement de l\'image');
          }
        };
        
        img.onerror = () => {
          URL.revokeObjectURL(imageUrl);
          alert('Erreur lors de la lecture de l\'image');
        };
        
        img.src = imageUrl;
      } catch (error) {
        console.error('Erreur lors du téléchargement de l\'image:', error);
        alert('Erreur lors du téléchargement de l\'image');
      }
    }
    
    // Réinitialiser l'input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = async (imageUrl: string) => {
    try {
      if (!service || service.id === 'temp-service') {
        alert('Service non trouvé');
        return;
      }

      // Supprimer via l'API Service
      await api.delete(`/services/${service.id}/images`, {
        data: { imageUrl }
      });
      
      // Recharger le service pour avoir les données à jour
      const response = await api.get(`/services/${service.id}`);
      if (response.data.service) {
        updateService(service.id, response.data.service);
      }

      console.log('✅ Image supprimée avec succès');
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'image:', error);
      alert('Erreur lors de la suppression de l\'image');
    }
  };

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Photos du service
          </label>
          <p className="text-xs text-gray-500 mt-1">
            <span className="font-medium">Taille optimale :</span> 1200x800px (ratio 3:2)
          </p>
          <p className="text-xs text-gray-500">
            <span className="font-medium">Formats :</span> JPG, PNG • <span className="font-medium">Taille max :</span> 2MB • <span className="font-medium">Maximum :</span> 5 photos
          </p>
        </div>
        <button
          type="button"
          onClick={handleClick}
          className="px-3 py-1 text-sm font-medium text-white bg-teal-500 rounded-md hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-all duration-200 transform hover:scale-105"
        >
          Ajouter une photo
        </button>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      {service?.images && service.images.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 mt-4">
          {service.images.map((image, index) => (
            <div key={index} className="relative group">
              <img
                src={image.url}
                alt={image.alt}
                className="w-full h-32 object-cover rounded-lg"
              />
              <button
                onClick={() => handleRemoveImage(image.url)}
                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <p className="text-sm text-gray-500">
            Aucune photo ajoutée
          </p>
        </div>
      )}
    </div>
  );
};

export default ServiceImageUpload;
