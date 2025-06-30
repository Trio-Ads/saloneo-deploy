import React, { useRef } from 'react';
import { useInterfaceStore } from '../../interface/store';
import { fileService } from '../../../services/fileService';

interface ServiceImageUploadProps {
  serviceId: string;
}

const ServiceImageUpload: React.FC<ServiceImageUploadProps> = ({ serviceId }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { serviceSettings, updateServiceSettings } = useInterfaceStore();
  const settings = serviceSettings.find(s => s.id === serviceId);

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

        // Upload de l'image
        const url = await fileService.uploadImage(file, 'service', serviceId);
        
        if (settings) {
          // Mettre à jour les paramètres du service
          const newImages = [...(settings.images || [])];
          
          // Limiter à 5 images par service
          if (newImages.length >= 5) {
            alert('Maximum 5 images par service');
            return;
          }
          
          newImages.push({ url, alt: file.name });
          
          updateServiceSettings(serviceId, {
            images: newImages
          });
        }
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

  const handleRemoveImage = (imageUrl: string) => {
    if (settings) {
      updateServiceSettings(serviceId, {
        images: settings.images.filter(img => img.url !== imageUrl)
      });
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
            Taille recommandée : 800x600px
          </p>
          <p className="text-xs text-gray-500">
            Maximum 5 photos par service
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

      {settings?.images && settings.images.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 mt-4">
          {settings.images.map((image, index) => (
            <div key={index} className="relative group">
              <img
                src={fileService.getImageUrl(image.url)}
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
