import React, { useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useInterfaceStore } from '../../interface/store';
import './AdaptiveModal.css';

interface AdaptiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  showCloseButton?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closeOnOverlayClick?: boolean;
}

const AdaptiveModal: React.FC<AdaptiveModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  showCloseButton = true,
  size = 'lg',
  closeOnOverlayClick = true,
}) => {
  const settings = useInterfaceStore((state) => state.settings);

  // Bloquer le scroll du body quand le modal est ouvert
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Gérer la touche Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-7xl',
  };

  return (
    <div className="adaptive-modal-overlay" onClick={handleOverlayClick}>
      <div className={`adaptive-modal-container ${sizeClasses[size]}`}>
        <div className="adaptive-modal-content">
          {/* Header */}
          <div className="adaptive-modal-header">
            <h2 className="adaptive-modal-title">{title}</h2>
            {showCloseButton && (
              <button
                onClick={onClose}
                className="adaptive-modal-close"
                aria-label="Fermer"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            )}
          </div>

          {/* Body */}
          <div className="adaptive-modal-body">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdaptiveModal;
