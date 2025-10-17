import React, { useState } from 'react';
import { 
  ChevronLeftIcon,
  ChevronRightIcon,
  PhotoIcon
} from '@heroicons/react/24/outline';
import { useInterfaceStore } from '../../../features/interface/store';
import { fileService } from '../../../services/fileService';

interface ServiceGalleryProps {
  serviceId: string;
}

const ServiceGallery: React.FC<ServiceGalleryProps> = ({ serviceId }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { serviceSettings } = useInterfaceStore();
  const settings = serviceSettings.find(s => s.id === serviceId);
  const images = settings?.images || [];

  if (images.length === 0) {
    return null;
  }

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const previousImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="relative w-full h-64 mb-6 group overflow-hidden rounded-xl">
      {/* Overlay complexe avec plusieurs gradients */}
      <div className="absolute inset-0 z-10">
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-orange-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>
      
      {/* Image avec effet de zoom et transition fluide */}
      <div className="absolute inset-0 transform transition-transform duration-[1.5s] ease-out group-hover:scale-110">
        <img
          src={fileService.getImageUrl(images[currentImageIndex].url)}
          alt={images[currentImageIndex].alt}
          className="w-full h-full object-cover animate-fade-in"
        />
      </div>
      
      {images.length > 1 && (
        <>
          {/* Boutons de navigation avec effets améliorés */}
          <div className="absolute inset-0 flex items-center justify-between px-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
            <button
              onClick={previousImage}
              className="glass-button p-3 rounded-full transform -translate-x-10 group-hover:translate-x-0
                       transition-all duration-500 hover:scale-110 shadow-lg hover:shadow-xl
                       bg-gradient-to-br from-orange-500/30 to-orange-600/30 backdrop-blur-xl border border-white/20"
              aria-label="Image précédente"
            >
              <ChevronLeftIcon className="w-6 h-6 text-white" />
            </button>
            <button
              onClick={nextImage}
              className="glass-button p-3 rounded-full transform translate-x-10 group-hover:translate-x-0
                       transition-all duration-500 hover:scale-110 shadow-lg hover:shadow-xl
                       bg-gradient-to-br from-orange-500/30 to-orange-600/30 backdrop-blur-xl border border-white/20"
              aria-label="Image suivante"
            >
              <ChevronRightIcon className="w-6 h-6 text-white" />
            </button>
          </div>

          {/* Indicateurs améliorés avec effets glassmorphism */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-4 z-20">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`group relative transition-all duration-500 ${
                  index === currentImageIndex ? 'scale-125' : 'hover:scale-110'
                }`}
                aria-label={`Image ${index + 1}`}
              >
                <span className={`block w-2 h-2 rounded-full transition-all duration-300
                  ${index === currentImageIndex 
                    ? 'bg-white shadow-neon scale-125' 
                    : 'bg-white/30 group-hover:bg-white/50'}`}
                />
                <span className={`absolute inset-0 -z-10 rounded-full blur-sm transition-all duration-300
                  ${index === currentImageIndex
                    ? 'bg-white/30 scale-150'
                    : 'bg-transparent scale-100 group-hover:bg-white/20 group-hover:scale-125'}`}
                />
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default ServiceGallery;
