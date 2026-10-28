import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { IconButton } from './ui';

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

  // Phone: bottom sheet. sm+: centered dialog. Enter only; exit is instant.
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="absolute inset-0 bg-gray-900/45 animate-[modal-fade_200ms_ease-out]" onClick={onClose} />
      <div
        className={`relative flex w-full ${sizeClasses[size]} max-h-[92dvh] sm:max-h-[90vh] flex-col overflow-hidden rounded-t-2xl sm:rounded-2xl border border-gray-200 bg-white shadow-[0_24px_48px_-12px_rgb(24_24_27/0.25)] animate-[modal-sheet_240ms_cubic-bezier(0.32,0.72,0,1)] sm:animate-[modal-in_200ms_ease-out] dark:border-gray-800 dark:bg-gray-900`}
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="flex items-center justify-between gap-4 px-5 sm:px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <h2 id="modal-title" className="text-lg font-semibold text-gray-900 dark:text-gray-50">{title}</h2>
          {showCloseButton && (
            <IconButton label={t('modal.close')} onClick={onClose} className="-me-2">
              <XMarkIcon className="size-5" />
            </IconButton>
          )}
        </div>
        <div className="flex-1 overflow-y-auto overscroll-contain p-5 sm:p-6 text-gray-900 dark:text-gray-100">
          {children}
        </div>
      </div>
      <style>{'@keyframes modal-fade{from{opacity:0}}@keyframes modal-in{from{opacity:0;transform:scale(.97)}}@keyframes modal-sheet{from{transform:translateY(100%)}}'}</style>
    </div>
  );
};

export default Modal;
