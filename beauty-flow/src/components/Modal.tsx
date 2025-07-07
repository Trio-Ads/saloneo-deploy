import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showCloseButton?: boolean;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'lg',
  showCloseButton = true,
}) => {
  const { t } = useTranslation('common');
  // Fermer avec Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Empêcher le scroll du body
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-7xl'
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop avec blur */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Container centré */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div 
          className={`relative bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 w-full ${sizeClasses[size]} transform transition-all duration-300 animate-slideUp`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header avec gradient */}
          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 rounded-t-3xl p-6 relative overflow-hidden">
            {/* Effet de brillance */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 animate-shimmer"></div>
            
            <div className="relative flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">{title}</h2>
              {showCloseButton && (
                <button
                  onClick={onClose}
                  className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-xl transition-all duration-200 transform hover:scale-110"
                  aria-label={t('modal.close')}
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              )}
            </div>
          </div>
          
          {/* Contenu du modal */}
          <div className="p-6 max-h-[70vh] overflow-y-auto">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
