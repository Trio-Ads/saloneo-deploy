import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { create } from 'zustand';

interface ToastState {
  message: string;
  isVisible: boolean;
  type: 'success' | 'error' | 'warning' | 'info';
  showToast: (message: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
  hideToast: () => void;
}

export const useToastStore = create<ToastState>((set) => ({
  message: '',
  isVisible: false,
  type: 'success',
  showToast: (message: string, type = 'success') => set({ message, isVisible: true, type }),
  hideToast: () => set({ isVisible: false })
}));

export const Toast: React.FC = () => {
  const { t } = useTranslation('common');
  const { message, isVisible, hideToast, type } = useToastStore();
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShouldRender(true);
      const timer = setTimeout(() => {
        hideToast();
      }, 4000); // Durée augmentée pour Saloneo

      return () => clearTimeout(timer);
    } else {
      // Délai pour l'animation de sortie
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isVisible, hideToast]);

  if (!shouldRender) return null;

  const getToastStyles = () => {
    switch (type) {
      case 'success':
        return 'toast-success bg-success-500 border-success-400';
      case 'error':
        return 'toast-error bg-error-500 border-error-400';
      case 'warning':
        return 'toast-warning bg-warning-500 border-warning-400';
      case 'info':
        return 'toast-info bg-info-500 border-info-400';
      default:
        return 'toast-success bg-success-500 border-success-400';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return (
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'error':
        return (
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
      case 'info':
        return (
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed top-4 right-4 z-100 pointer-events-none">
      <div
        className={`
          toast-2025 ${getToastStyles()}
          text-white font-body
          transform transition-all duration-300 ease-smooth
          ${isVisible 
            ? 'translate-x-0 opacity-100 scale-100' 
            : 'translate-x-full opacity-0 scale-95'
          }
          pointer-events-auto
          max-w-sm w-full
          animate-slide-down
        `}
      >
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0 mt-0.5">
            {getIcon()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white leading-relaxed">
              {message}
            </p>
          </div>
          <button
            onClick={hideToast}
            className="
              flex-shrink-0 ml-2 p-1 rounded-lg
              hover:bg-white/20 active:bg-white/30
              transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-white/30
              click-effect
            "
            aria-label={t('toast.close')}
          >
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Barre de progression */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 rounded-b-2xl overflow-hidden">
          <div 
            className="h-full bg-white/40 rounded-b-2xl animate-pulse"
            style={{
              animation: 'toastProgress 4s linear forwards'
            }}
          />
        </div>
      </div>
    </div>
  );
};

// Hook amélioré pour gérer les toasts avec plus d'options
export const useToast = () => {
  const { showToast } = useToastStore();

  const showSuccess = (message: string) => {
    showToast(message, 'success');
  };

  const showError = (message: string) => {
    showToast(message, 'error');
  };

  const showWarning = (message: string) => {
    showToast(message, 'warning');
  };

  const showInfo = (message: string) => {
    showToast(message, 'info');
  };

  return {
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };
};

// Styles CSS à ajouter (normalement dans index.css)
const toastStyles = `
@keyframes toastProgress {
  from {
    width: 100%;
  }
  to {
    width: 0%;
  }
}
`;

// Injecter les styles si pas déjà présents
if (typeof document !== 'undefined') {
  const styleId = 'saloneo-toast-styles';
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = toastStyles;
    document.head.appendChild(style);
  }
}
