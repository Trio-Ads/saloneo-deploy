import React from 'react';
import { useInterfaceStore } from '../../interface/store';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  showCloseButton?: boolean;
}

const Modal: React.FC<ModalProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  showCloseButton = true 
}) => {
  const settings = useInterfaceStore((state) => state.settings);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Overlay with blur effect */}
        <div 
          className="fixed inset-0 backdrop-blur-sm bg-black/30 transition-all duration-300"
          onClick={onClose}
        />
        
        {/* Modal */}
        <div 
          className="relative w-full max-w-2xl animate-fade-in"
        >
          {/* Glass card effect */}
          <div className="glass-card shadow-glass-lg">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h2 className="text-2xl font-bold text-white">
                {title}
              </h2>
              {showCloseButton && (
                <button
                  onClick={onClose}
                  className="text-white/70 hover:text-white transition-colors duration-200 hover:scale-110 transform"
                >
                  <span className="sr-only">Fermer</span>
                  <svg 
                    className="h-6 w-6" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M6 18L18 6M6 6l12 12" 
                    />
                  </svg>
                </button>
              )}
            </div>

            {/* Content with custom scrollbar */}
            <div className="p-6 text-white/90 max-h-[70vh] overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent relative z-10">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
