import React, { useRef, useState } from 'react';
import { useServiceStore } from '../store';
import api from '../../../services/api';

interface ServiceImageUploadProps {
  serviceId: string;
}

const ServiceImageUpload: React.FC<ServiceImageUploadProps> = ({ serviceId }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { services, updateService } = useServiceStore();
  const service = services.find(s => s.id === serviceId);
  const [uploading, setUploading] = useState(false);

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

            // Activer l'indicateur de chargement
            setUploading(true);

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
          } finally {
            // Désactiver l'indicateur de chargement
            setUploading(false);
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
    if (uploading) return; // Empêcher la suppression pendant l'upload
    
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
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Photos du service
          </label>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            <span className="font-medium">Taille optimale :</span> 1200x800px (ratio 3:2)
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            <span className="font-medium">Formats :</span> JPG, PNG • <span className="font-medium">Taille max :</span> 2MB • <span className="font-medium">Maximum :</span> 5 photos
          </p>
        </div>
        <button
          type="button"
          onClick={handleClick}
          disabled={uploading}
          className={`px-3 py-1 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all duration-200 ${
            uploading 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-orange-500 hover:bg-orange-600 transform hover:scale-105 shadow-orange-md hover:shadow-orange-lg'
          }`}
        >
          {uploading ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Upload en cours...
            </span>
          ) : (
            'Ajouter une photo'
          )}
        </button>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      {uploading && (
        <div className="mt-4 p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700 rounded-lg">
          <div className="flex items-center">
            <svg className="animate-spin h-5 w-5 text-orange-500 dark:text-orange-400 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <div>
              <p className="text-sm font-medium text-orange-900 dark:text-orange-100">Upload en cours...</p>
              <p className="text-xs text-orange-700 dark:text-orange-300">Veuillez patienter pendant l'envoi de votre image</p>
            </div>
          </div>
        </div>
      )}

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
                disabled={uploading}
                className={`absolute top-2 right-2 p-1 bg-red-500 hover:bg-red-600 text-white rounded-full transition-all duration-200 shadow-lg ${
                  uploading ? 'opacity-50 cursor-not-allowed' : 'opacity-0 group-hover:opacity-100'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-6 bg-gray-50 dark:bg-gray-700/50 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Aucune photo ajoutée
          </p>
        </div>
      )}
    </div>
  );
};

export default ServiceImageUpload;
