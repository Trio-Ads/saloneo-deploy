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
          <div className="mx-auto w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg animate-bounce">
            <CheckCircleIcon className="h-12 w-12 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
              {t('appointments:bookingConfirmed')}
            </h2>
            <p className="text-gray-600 text-lg">
              {t('appointments:bookingSuccessMessage')}
            </p>
          </div>
        </div>

        {/* Message de succès avec glassmorphism */}
        <div className="glass-card p-6 bg-gradient-to-r from-green-50/50 to-emerald-50/50 border border-green-200/50 animate-fadeIn">
          <div className="flex items-center space-x-3">
            <SparklesIcon className="h-6 w-6 text-green-600" />
            <div>
              <p className="text-green-800 font-medium">Réservation confirmée avec succès !</p>
              <p className="text-green-700 text-sm">Vous recevrez un email de confirmation sous peu.</p>
            </div>
          </div>
        </div>

        {/* Détails du rendez-vous */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
            <CalendarDaysIcon className="h-6 w-6 text-indigo-600" />
            <span>{t('appointments:appointmentDetails')}</span>
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-3 p-4 glass-card bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl">
              <CalendarDaysIcon className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-700">{t('appointments:date')}</p>
                <p className="text-lg font-bold text-blue-600">{appointmentDate}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-4 glass-card bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
              <ClockIcon className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-gray-700">{t('appointments:time')}</p>
                <p className="text-lg font-bold text-purple-600">{appointmentTime}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Lien de modification */}
        <div className="glass-card p-6 bg-gradient-to-r from-indigo-50/50 to-purple-50/50 border border-indigo-200/50">
          <div className="flex items-center space-x-3 mb-4">
            <LinkIcon className="h-6 w-6 text-indigo-600" />
            <h3 className="text-lg font-bold text-gray-900">Lien de modification</h3>
          </div>
          
          <div className="space-y-4">
            <p className="text-gray-700">
              {t('appointments:modificationLinkInfo')}
            </p>
            
            <div className="glass-card bg-white/70 p-4 rounded-xl">
              <div className="flex items-center justify-between">
                <div className="flex-1 mr-3">
                  <p className="text-sm font-medium text-gray-700 mb-1">Votre lien personnel</p>
                  <code className="text-sm text-indigo-600 font-mono bg-indigo-50 px-2 py-1 rounded break-all">
                    {fullModificationLink}
                  </code>
                </div>
                <button
                  onClick={handleCopyLink}
                  className={`glass-button p-3 transition-all duration-200 transform hover:scale-110 shadow-lg hover:shadow-xl ${
                    linkCopied 
                      ? 'bg-green-100 text-green-600' 
                      : 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200'
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
            
            <div className="p-3 glass-card bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border-l-4 border-yellow-400">
              <p className="text-sm text-yellow-800">
                <span className="font-medium">⚠️ Important :</span> {t('appointments:modificationLinkWarning')}
              </p>
            </div>
          </div>
        </div>

        {/* Prochaines étapes */}
        <div className="glass-card p-6 bg-gradient-to-r from-gray-50/50 to-slate-50/50">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Prochaines étapes</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">1</span>
              </div>
              <p className="text-gray-700">Vous recevrez un email de confirmation</p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">2</span>
              </div>
              <p className="text-gray-700">Conservez votre lien de modification en lieu sûr</p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">3</span>
              </div>
              <p className="text-gray-700">Rendez-vous au salon à l'heure prévue</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-4">
          <button
            onClick={onClose}
            className="glass-button bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white border-0 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 px-8 py-3"
          >
            <div className="flex items-center space-x-2">
              <CheckCircleIcon className="h-5 w-5" />
              <span>Parfait !</span>
            </div>
          </button>
        </div>

        {/* Animation de confettis (effet visuel) */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-1/4 w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
          <div className="absolute top-0 right-1/4 w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
          <div className="absolute top-0 left-1/2 w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.5s' }} />
        </div>
      </div>
    </Modal>
  );
};

export default BookingConfirmation;
