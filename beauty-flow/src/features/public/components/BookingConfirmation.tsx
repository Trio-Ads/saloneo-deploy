import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  CheckCircleIcon,
  CalendarDaysIcon,
  ClockIcon,
  LinkIcon,
  ClipboardDocumentIcon,
  CheckIcon,
  SparklesIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import Modal from './Modal';

interface BookingConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  appointmentDate: string;
  appointmentTime: string;
  modificationLink: string;
}

const BookingConfirmation: React.FC<BookingConfirmationProps> = ({
  isOpen,
  onClose,
  appointmentDate,
  appointmentTime,
  modificationLink
}) => {
  const { t } = useTranslation(['appointments', 'common']);
  const [linkCopied, setLinkCopied] = useState(false);

  const fullModificationLink = `${window.location.origin}/appointment/${modificationLink}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(fullModificationLink);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 3000);
    } catch (error) {
      console.error('Erreur lors de la copie:', error);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title=""
    >
      <div className="space-y-8 p-2">
        {/* Header avec animation de succès */}
        <div className="text-center space-y-4">
          <div className="mx-auto w-20 h-20 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center shadow-lg animate-bounce">
            <CheckCircleIcon className="h-12 w-12 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-orange-700 dark:from-orange-500 dark:to-orange-600 bg-clip-text text-transparent mb-2">
              {t('appointments:bookingConfirmed')}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-lg">
              {t('appointments:bookingSuccessMessage')}
            </p>
          </div>
        </div>

        {/* Message de succès avec glassmorphism */}
        <div className="glass-card p-6 bg-gradient-to-r from-orange-50/50 to-orange-100/50 dark:from-orange-900/20 dark:to-orange-800/20 border border-orange-200/50 dark:border-orange-700/50 animate-fadeIn">
          <div className="flex items-center space-x-3">
            <SparklesIcon className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            <div>
              <p className="text-orange-800 dark:text-orange-300 font-medium">Réservation confirmée avec succès !</p>
              <p className="text-orange-700 dark:text-orange-400 text-sm">Vous recevrez un email de confirmation sous peu.</p>
            </div>
          </div>
        </div>

        {/* Détails du rendez-vous */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center space-x-2">
            <CalendarDaysIcon className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            <span>{t('appointments:appointmentDetails')}</span>
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-3 p-4 glass-card bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-xl">
              <CalendarDaysIcon className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('appointments:date')}</p>
                <p className="text-lg font-bold text-orange-600 dark:text-orange-400">{appointmentDate}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-4 glass-card bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-700/50 rounded-xl">
              <ClockIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('appointments:time')}</p>
                <p className="text-lg font-bold text-gray-600 dark:text-gray-300">{appointmentTime}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Lien de modification */}
        <div className="glass-card p-6 bg-gradient-to-r from-orange-50/50 to-orange-100/50 dark:from-orange-900/20 dark:to-orange-800/20 border border-orange-200/50 dark:border-orange-700/50">
          <div className="flex items-center space-x-3 mb-4">
            <LinkIcon className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Lien de modification</h3>
          </div>
          
          <div className="space-y-4">
            <p className="text-gray-700 dark:text-gray-300">
              {t('appointments:modificationLinkInfo')}
            </p>
            
            <div className="glass-card bg-white/70 dark:bg-gray-800/70 p-4 rounded-xl">
              <div className="flex items-center justify-between">
                <div className="flex-1 mr-3">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Votre lien personnel</p>
                  <code className="text-sm text-orange-600 dark:text-orange-400 font-mono bg-orange-50 dark:bg-orange-900/30 px-2 py-1 rounded break-all">
                    {fullModificationLink}
                  </code>
                </div>
                <button
                  onClick={handleCopyLink}
                  className={`glass-button p-3 transition-all duration-200 transform hover:scale-110 shadow-lg hover:shadow-xl ${
                    linkCopied 
                      ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400' 
                      : 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 hover:bg-orange-200 dark:hover:bg-orange-800/30'
                  }`}
                  title="Copier le lien"
                >
                  {linkCopied ? (
                    <CheckIcon className="h-5 w-5" />
                  ) : (
                    <ClipboardDocumentIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
            
            <div className="p-3 glass-card bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-xl border-l-4 border-orange-400 dark:border-orange-600">
              <p className="text-sm text-orange-800 dark:text-orange-300">
                <span className="font-medium">⚠️ Important :</span> {t('appointments:modificationLinkWarning')}
              </p>
            </div>
          </div>
        </div>

        {/* Prochaines étapes */}
        <div className="glass-card p-6 bg-gradient-to-r from-gray-50/50 to-gray-100/50 dark:from-gray-800/50 dark:to-gray-700/50">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">Prochaines étapes</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">1</span>
              </div>
              <p className="text-gray-700 dark:text-gray-300">Vous recevrez un email de confirmation</p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-gradient-to-r from-gray-500 to-gray-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">2</span>
              </div>
              <p className="text-gray-700 dark:text-gray-300">Conservez votre lien de modification en lieu sûr</p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-gradient-to-r from-orange-400 to-orange-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">3</span>
              </div>
              <p className="text-gray-700 dark:text-gray-300">Rendez-vous au salon à l'heure prévue</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-4">
          <button
            onClick={onClose}
            className="glass-button bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white border-0 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 px-8 py-3"
          >
            <div className="flex items-center space-x-2">
              <CheckCircleIcon className="h-5 w-5" />
              <span>Parfait !</span>
            </div>
          </button>
        </div>

        {/* Animation de confettis (effet visuel) */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-1/4 w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
          <div className="absolute top-0 right-1/4 w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
          <div className="absolute top-0 left-1/2 w-2 h-2 bg-orange-600 rounded-full animate-bounce" style={{ animationDelay: '0.5s' }} />
        </div>
      </div>
    </Modal>
  );
};

export default BookingConfirmation;
