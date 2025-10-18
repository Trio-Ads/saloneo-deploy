import React, { useRef, useState } from 'react';
import { fileService } from '../../../services/fileService';
import { ImageOptimizer, ImageDimensions } from '../../../services/imageOptimizer';

interface ImageUploadProps {
  label: string;
  imageUrl?: string;
  alt: string;
  onUpload: (file: File) => Promise<void>;
  dimensions?: {
    width: number;
    height: number;
  };
  type?: 'logo' | 'banner' | 'image';
}

const ImageUpload: React.FC<ImageUploadProps> = ({ label, imageUrl, alt, onUpload, dimensions, type = 'image' }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [validationMessage, setValidationMessage] = useState<string>('');

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsProcessing(true);
      setValidationMessage('');
      
      try {
        // Vérifier la taille du fichier (max 10MB pour permettre l'optimisation)
        if (file.size > 10 * 1024 * 1024) {
          alert('L\'image ne doit pas dépasser 10MB');
          return;
        }

        // Vérifier le type de fichier
        if (!file.type.startsWith('image/')) {
          alert('Veuillez sélectionner une image');
          return;
        }

        let processedFile = file;

        // Si des dimensions sont spécifiées, valider et optimiser
        if (dimensions) {
          const validation = await ImageOptimizer.validateImageDimensions(
            file, 
            dimensions as ImageDimensions,
            0.2 // Tolérance de 20%
          );

          if (!validation.isValid) {
            // Proposer de redimensionner automatiquement
            const shouldResize = confirm(
              `${validation.message}\n\nVoulez-vous redimensionner automatiquement l'image aux dimensions recommandées ?`
            );

            if (shouldResize) {
              const optimized = await ImageOptimizer.resizeToExactDimensions(
                file,
                dimensions as ImageDimensions,
                0.98 // Qualité très élevée
              );
              
              // Créer un nouveau fichier à partir du blob optimisé
              processedFile = new File([optimized.blob], file.name, {
                type: 'image/png',
                lastModified: Date.now()
              });
              
              setValidationMessage(
                `Image redimensionnée automatiquement à ${dimensions.width}x${dimensions.height}px avec qualité maximale`
              );
            } else {
              setValidationMessage(validation.message || '');
              return;
            }
          } else {
            setValidationMessage('✓ Dimensions parfaites !');
          }
        }

        console.log('🔍 ImageUpload: Appel de onUpload avec le fichier:', processedFile.name);
        await onUpload(processedFile);
        console.log('✅ ImageUpload: onUpload terminé avec succès');
      } catch (error) {
        console.error('❌ ImageUpload: Erreur lors du traitement de l\'image:', error);
        alert('Erreur lors du traitement de l\'image');
      } finally {
        setIsProcessing(false);
      }
    }
    
    // Réinitialiser l'input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/20 p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <label className="text-lg font-medium text-gray-900 dark:text-gray-200">{label}</label>
          {dimensions && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Taille recommandée : {dimensions.width}x{dimensions.height}px
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="px-6 py-3 text-white font-medium rounded-xl
                   bg-gradient-to-r from-orange-500 to-orange-600
                   hover:from-orange-600 hover:to-orange-700
                   transform transition-all duration-300 hover:scale-[1.02]
                   shadow-lg hover:shadow-xl"
        >
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>Choisir une image</span>
          </div>
        </button>
      </div>
      
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
      
      {/* Messages de validation */}
      {validationMessage && (
        <div className={`bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl border p-3 text-sm ${
          validationMessage.includes('✓') 
            ? 'text-green-700 dark:text-green-300 border-green-500/30 dark:border-green-700/30' 
            : validationMessage.includes('redimensionnée')
            ? 'text-orange-700 dark:text-orange-300 border-orange-500/30 dark:border-orange-700/30'
            : 'text-yellow-700 dark:text-yellow-300 border-yellow-500/30 dark:border-yellow-700/30'
        }`}>
          {validationMessage}
        </div>
      )}

      <div 
        className={`relative w-full h-48 rounded-xl overflow-hidden transition-all duration-300
                    ${imageUrl ? 'shadow-xl' : 'bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-dashed border-2 border-gray-300 dark:border-gray-600'}`}
      >
        {/* Indicateur de traitement */}
        {isProcessing && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-10 flex items-center justify-center">
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-xl shadow-xl border border-white/20 dark:border-gray-700/20 p-4 text-center">
              <div className="w-8 h-8 border-2 border-orange-500/20 border-t-orange-500 rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-gray-900 dark:text-gray-200 text-sm">Optimisation en cours...</p>
            </div>
          </div>
        )}

        {imageUrl ? (
          <div className="group relative w-full h-full">
            {type === 'logo' ? (
              // Affichage spécial pour le logo avec fond et centrage
              <div className="w-full h-full bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
                <img
                  src={fileService.getImageUrl(imageUrl)}
                  alt={alt}
                  className="max-w-full max-h-full object-contain transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                  style={{
                    filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))'
                  }}
                />
              </div>
            ) : (
              // Affichage normal pour bannière et autres images
              <img
                src={fileService.getImageUrl(imageUrl)}
                alt={alt}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                loading="lazy"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <button
              onClick={handleClick}
              disabled={isProcessing}
              className="absolute bottom-4 right-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-lg shadow-lg border border-white/20 dark:border-gray-700/20 px-4 py-2 text-gray-900 dark:text-gray-200 font-medium opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-105 disabled:opacity-50"
            >
              Modifier
            </button>
          </div>
        ) : dimensions ? (
          <div 
            className="flex flex-col items-center justify-center h-full text-gray-600 dark:text-gray-400 cursor-pointer hover:text-gray-800 dark:hover:text-gray-200 transition-colors duration-300"
            onClick={handleClick}
          >
            <div className="text-center">
              <svg className="w-12 h-12 mb-3 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-sm mb-2">Glissez une image ou cliquez pour parcourir</p>
              <div className="text-xs text-gray-600 dark:text-gray-400 bg-white/70 dark:bg-gray-800/70 border border-gray-300 dark:border-gray-600 rounded px-2 py-1 inline-block">
                {dimensions.width}×{dimensions.height}px
              </div>
            </div>
          </div>
        ) : (
          <div 
            className="flex flex-col items-center justify-center h-full text-gray-600 dark:text-gray-400 cursor-pointer hover:text-gray-800 dark:hover:text-gray-200 transition-colors duration-300"
            onClick={handleClick}
          >
            <svg className="w-12 h-12 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-sm">Glissez une image ou cliquez pour parcourir</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUpload;
