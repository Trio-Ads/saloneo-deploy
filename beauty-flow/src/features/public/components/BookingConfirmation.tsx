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
import { useTemplateStyles } from '../../../hooks/useTemplateStyles';
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
  const { colors } = useTemplateStyles();
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
          <div 
            className="mx-auto w-20 h-20 rounded-full flex items-center justify-center shadow-lg animate-bounce"
            style={{
              background: `linear-gradient(to right, ${colors.primary}, ${colors.primaryDark})`
            }}
          >
            <CheckCircleIcon className="h-12 w-12 text-white" />
          </div>
          <div>
            <h2 
              className="text-2xl font-bold mb-2 bg-clip-text text-transparent"
              style={{
                backgroundImage: `linear-gradient(to right, ${colors.primary}, ${colors.primaryDark})`
              }}
            >
              {t('appointments:bookingConfirmed')}
            </h2>
            <p className="text-lg" style={{ color: colors.textSecondary }}>
              {t('appointments:bookingSuccessMessage')}
            </p>
          </div>
        </div>

        {/* Message de succès avec glassmorphism */}
        <div 
          className="glass-card p-6 animate-fadeIn rounded-xl"
          style={{
            backgroundColor: `${colors.primary}10`,
            border: `1px solid ${colors.primary}30`
          }}
        >
          <div className="flex items-center space-x-3">
            <SparklesIcon className="h-6 w-6" style={{ color: colors.primary }} />
            <div>
              <p className="font-medium" style={{ color: colors.textPrimary }}>
                Réservation confirmée avec succès !
              </p>
              <p className="text-sm" style={{ color: colors.textSecondary }}>
                Vous recevrez un email de confirmation sous peu.
              </p>
            </div>
          </div>
        </div>

        {/* Détails du rendez-vous */}
        <div 
          className="glass-card p-6 rounded-xl"
          style={{
            backgroundColor: colors.surface,
            border: `2px solid ${colors.primary}20`
          }}
        >
          <h3 
            className="text-lg font-bold mb-4 flex items-center space-x-2"
            style={{ color: colors.textPrimary }}
          >
            <CalendarDaysIcon className="h-6 w-6" style={{ color: colors.primary }} />
            <span>{t('appointments:appointment_details')}</span>
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div 
              className="flex items-center space-x-3 p-4 rounded-xl"
              style={{
                backgroundColor: `${colors.primary}10`,
                border: `1px solid ${colors.primary}20`
              }}
            >
              <CalendarDaysIcon className="h-5 w-5" style={{ color: colors.primary }} />
              <div>
                <p className="text-sm font-medium" style={{ color: colors.textSecondary }}>
                  {t('appointments:form.date')}
                </p>
                <p className="text-lg font-bold" style={{ color: colors.primary }}>
                  {appointmentDate}
                </p>
              </div>
            </div>
            
            <div 
              className="flex items-center space-x-3 p-4 rounded-xl"
              style={{
                backgroundColor: `${colors.accent}10`,
                border: `1px solid ${colors.accent}20`
              }}
            >
              <ClockIcon className="h-5 w-5" style={{ color: colors.accent }} />
              <div>
                <p className="text-sm font-medium" style={{ color: colors.textSecondary }}>
                  {t('appointments:form.time')}
                </p>
                <p className="text-lg font-bold" style={{ color: colors.textPrimary }}>
                  {appointmentTime}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Lien de modification */}
        <div 
          className="glass-card p-6 rounded-xl"
          style={{
            backgroundColor: `${colors.primary}10`,
            border: `1px solid ${colors.primary}30`
          }}
        >
          <div className="flex items-center space-x-3 mb-4">
            <LinkIcon className="h-6 w-6" style={{ color: colors.primary }} />
            <h3 className="text-lg font-bold" style={{ color: colors.textPrimary }}>
              Lien de modification
            </h3>
          </div>
          
          <div className="space-y-4">
            <p style={{ color: colors.textSecondary }}>
              {t('appointments:modificationLinkInfo')}
            </p>
            
            <div 
              className="p-4 rounded-xl"
              style={{
                backgroundColor: colors.surface,
                border: `2px solid ${colors.primary}20`
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 mr-3">
                  <p className="text-sm font-medium mb-1" style={{ color: colors.textSecondary }}>
                    Votre lien personnel
                  </p>
                  <code 
                    className="text-sm font-mono px-2 py-1 rounded break-all"
                    style={{
                      color: colors.primary,
                      backgroundColor: `${colors.primary}10`
                    }}
                  >
                    {fullModificationLink}
                  </code>
                </div>
                <button
                  onClick={handleCopyLink}
                  className="p-3 transition-all duration-200 transform hover:scale-110 shadow-lg hover:shadow-xl rounded-lg"
                  style={{
                    backgroundColor: linkCopied ? `${colors.primary}20` : `${colors.primary}10`,
                    color: colors.primary
                  }}
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
            
            <div 
              className="p-3 rounded-xl border-l-4"
              style={{
                backgroundColor: `${colors.primary}10`,
                borderColor: colors.primary
              }}
            >
              <p className="text-sm" style={{ color: colors.textPrimary }}>
                <span className="font-medium">⚠️ Important :</span> {t('appointments:modificationLinkWarning')}
              </p>
            </div>
          </div>
        </div>

        {/* Prochaines étapes */}
        <div 
          className="glass-card p-6 rounded-xl"
          style={{
            backgroundColor: colors.surface,
            border: `2px solid ${colors.primary}20`
          }}
        >
          <h3 className="text-lg font-bold mb-4" style={{ color: colors.textPrimary }}>
            Prochaines étapes
          </h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div 
                className="w-6 h-6 rounded-full flex items-center justify-center"
                style={{
                  background: `linear-gradient(to right, ${colors.primary}, ${colors.primaryDark})`
                }}
              >
                <span className="text-white text-xs font-bold">1</span>
              </div>
              <p style={{ color: colors.textSecondary }}>
                Vous recevrez un email de confirmation
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <div 
                className="w-6 h-6 rounded-full flex items-center justify-center"
                style={{
                  backgroundColor: colors.accent
                }}
              >
                <span className="text-white text-xs font-bold">2</span>
              </div>
              <p style={{ color: colors.textSecondary }}>
                Conservez votre lien de modification en lieu sûr
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <div 
                className="w-6 h-6 rounded-full flex items-center justify-center"
                style={{
                  background: `linear-gradient(to right, ${colors.primary}cc, ${colors.primaryDark}cc)`
                }}
              >
                <span className="text-white text-xs font-bold">3</span>
              </div>
              <p style={{ color: colors.textSecondary }}>
                Rendez-vous au salon à l'heure prévue
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-4">
          <button
            onClick={onClose}
            className="transform hover:scale-105 transition-all duration-200 px-8 py-3 rounded-lg shadow-lg hover:shadow-xl"
            style={{
              background: `linear-gradient(to right, ${colors.primary}, ${colors.primaryDark})`,
              color: '#FFFFFF'
            }}
          >
            <div className="flex items-center space-x-2">
              <CheckCircleIcon className="h-5 w-5" />
              <span>Parfait !</span>
            </div>
          </button>
        </div>

        {/* Animation de confettis (effet visuel) */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div 
            className="absolute top-0 left-1/4 w-2 h-2 rounded-full animate-bounce" 
            style={{ backgroundColor: colors.primary, animationDelay: '0.1s' }} 
          />
          <div 
            className="absolute top-0 right-1/4 w-2 h-2 rounded-full animate-bounce" 
            style={{ backgroundColor: colors.primaryDark, animationDelay: '0.3s' }} 
          />
          <div 
            className="absolute top-0 left-1/2 w-2 h-2 rounded-full animate-bounce" 
            style={{ backgroundColor: colors.accent, animationDelay: '0.5s' }} 
          />
        </div>
      </div>
    </Modal>
  );
};

export default BookingConfirmation;
