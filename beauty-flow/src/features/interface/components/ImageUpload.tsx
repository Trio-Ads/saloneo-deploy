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
}

const ImageUpload: React.FC<ImageUploadProps> = ({ label, imageUrl, alt, onUpload, dimensions }) => {
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

        await onUpload(processedFile);
      } catch (error) {
        console.error('Erreur lors du traitement de l\'image:', error);
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
    <div className="glass-card p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <label className="text-lg font-medium text-gray-800">{label}</label>
          {dimensions && (
            <p className="text-sm text-gray-600 mt-1">
              Taille recommandée : {dimensions.width}x{dimensions.height}px
            </p>
          )}
        </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="glass-button px-6 py-3 text-white font-medium
                       bg-gradient-to-r from-indigo-600 to-purple-600
                       hover:from-indigo-700 hover:to-purple-700
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
        <div className={`glass-card p-3 text-sm ${
          validationMessage.includes('✓') 
            ? 'text-green-300 border-green-500/30' 
            : validationMessage.includes('redimensionnée')
            ? 'text-blue-300 border-blue-500/30'
            : 'text-yellow-300 border-yellow-500/30'
        }`}>
          {validationMessage}
        </div>
      )}

      <div 
        className={`relative w-full h-48 rounded-xl overflow-hidden transition-all duration-300
                    ${imageUrl ? 'shadow-neon' : 'glass-card border-dashed border-2 border-white/30'}`}
      >
        {/* Indicateur de traitement */}
        {isProcessing && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-10 flex items-center justify-center">
            <div className="glass-card p-4 text-center">
              <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-white text-sm">Optimisation en cours...</p>
            </div>
          </div>
        )}

        {imageUrl ? (
          <div className="group relative w-full h-full">
            <img
              src={imageUrl ? fileService.getImageUrl(imageUrl) : ''}
              alt={alt}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              loading="lazy"
              style={{
                objectFit: 'cover'
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <button
              onClick={handleClick}
              disabled={isProcessing}
              className="absolute bottom-4 right-4 glass-button px-4 py-2 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-105 disabled:opacity-50"
            >
              Modifier
            </button>
          </div>
        ) : dimensions ? (
          <div 
            className="flex flex-col items-center justify-center h-full text-gray-600 cursor-pointer hover:text-gray-800 transition-colors duration-300"
            onClick={handleClick}
          >
            <div className="text-center">
              <svg className="w-12 h-12 mb-3 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-sm mb-2">Glissez une image ou cliquez pour parcourir</p>
              <div className="text-xs text-gray-500 border border-gray-300 rounded px-2 py-1 inline-block">
                {dimensions.width}×{dimensions.height}px
              </div>
            </div>
          </div>
        ) : (
          <div 
            className="flex flex-col items-center justify-center h-full text-gray-600 cursor-pointer hover:text-gray-800 transition-colors duration-300"
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
