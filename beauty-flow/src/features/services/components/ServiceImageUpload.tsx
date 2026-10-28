import React, { useRef, useState } from 'react';
import { useServiceStore } from '../store';
import api from '../../../services/api';
import { useTranslation } from 'react-i18next';
import { PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { fileService } from '../../../services/fileService';

interface ServiceImageUploadProps {
  serviceId: string;
}

const ServiceImageUpload: React.FC<ServiceImageUploadProps> = ({ serviceId }) => {
  const { t } = useTranslation('services');
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
          alert(t('photos.err_size'));
          return;
        }

        // Vérifier le type de fichier
        if (!file.type.startsWith('image/')) {
          alert(t('photos.err_type'));
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
            const proceed = confirm(t('photos.confirm_dimensions', { width: img.width, height: img.height, optimalWidth, optimalHeight }));
            if (!proceed) return;
          }
          
          try {
            // Upload direct via l'API Service (plus de localStorage)
            if (!service || service.id === 'temp-service') {
              alert(t('photos.err_save_first'));
              return;
            }

            // Vérifier qu'on n'a pas déjà 5 images
            if (service.images && service.images.length >= 5) {
              alert(t('photos.err_max'));
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
            alert(t('messages.image_upload_failed'));
          } finally {
            // Désactiver l'indicateur de chargement
            setUploading(false);
          }
        };
        
        img.onerror = () => {
          URL.revokeObjectURL(imageUrl);
          alert(t('photos.err_read'));
        };
        
        img.src = imageUrl;
      } catch (error) {
        console.error('Erreur lors du téléchargement de l\'image:', error);
        alert(t('messages.image_upload_failed'));
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
        alert(t('photos.err_save_first'));
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
      alert(t('photos.err_remove'));
    }
  };

  return (
    <div className="mt-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <p className="text-xs text-gray-500 dark:text-gray-400">{t('photos.hint')}</p>
        <button type="button" onClick={handleClick} disabled={uploading} className="btn-secondary">
          <PhotoIcon className="size-4" />
          {uploading ? t('photos.uploading') : t('photos.add')}
        </button>
      </div>

      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />

      {service?.images && service.images.length > 0 ? (
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {service.images.map((image, index) => (
            <div key={index} className="relative">
              <img
                src={fileService.getImageUrl(image.url)}
                alt={image.alt}
                className="aspect-[3/2] w-full rounded-xl object-cover bg-gray-100 dark:bg-gray-800"
              />
              <button
                type="button"
                onClick={() => handleRemoveImage(image.url)}
                disabled={uploading}
                aria-label={t('photos.remove')}
                title={t('photos.remove')}
                className="absolute top-2 end-2 grid size-8 place-items-center rounded-lg bg-white/90 text-gray-700 shadow-sm transition-colors duration-150 ease-out hover:text-red-600 disabled:opacity-50 dark:bg-gray-900/90 dark:text-gray-200"
              >
                <XMarkIcon className="size-4" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-3 rounded-xl border border-dashed border-gray-200 py-6 text-center text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
          {t('photos.none')}
        </p>
      )}
    </div>
  );
};

export default ServiceImageUpload;
