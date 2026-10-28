import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { create } from 'zustand';
import { CheckCircleIcon, XCircleIcon, ExclamationTriangleIcon, InformationCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';

const toastIcons = { success: CheckCircleIcon, error: XCircleIcon, warning: ExclamationTriangleIcon, info: InformationCircleIcon };
const toastIconColors = {
  success: 'text-emerald-600 dark:text-emerald-400',
  error: 'text-red-600 dark:text-red-400',
  warning: 'text-amber-600 dark:text-amber-400',
  info: 'text-gray-500 dark:text-gray-400',
};

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
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [isVisible, hideToast]);

  if (!shouldRender) return null;

  const Icon = toastIcons[type] || toastIcons.success;

  return (
    <div
      role={type === 'error' ? 'alert' : 'status'}
      className={`toast-2025 z-100 w-[calc(100%-2rem)] sm:w-full flex items-start gap-3 transition-[opacity,transform] duration-200 ease-out ${
        isVisible ? 'opacity-100 translate-y-0 animate-[toast-in_200ms_ease-out]' : 'opacity-0 -translate-y-1'
      }`}
    >
      <Icon className={`size-5 shrink-0 mt-px ${toastIconColors[type] || toastIconColors.success}`} />
      <p className="flex-1 min-w-0 text-sm font-medium leading-relaxed text-gray-900 dark:text-gray-50">{message}</p>
      <button
        onClick={hideToast}
        className="-m-1 shrink-0 grid place-items-center size-7 rounded-md text-gray-400 transition-colors duration-150 ease-out hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-200"
        aria-label={t('toast.close')}
      >
        <XMarkIcon className="size-4" />
      </button>
      <style>{'@keyframes toast-in{from{opacity:0;transform:translateY(-8px)}}'}</style>
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
