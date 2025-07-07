import React from 'react';
import { useTranslation } from 'react-i18next';
import { useInterfaceStore } from '../../interface/store';
import { usePublicBookingStore } from '../store';
import { PublicClientFormData } from '../types';
import Modal from './Modal';
import BookingProgressBar from './BookingProgressBar';
import DateTimeSelection from './DateTimeSelection';
import PublicClientForm from './PublicClientForm';
import LoadingSpinner from './LoadingSpinner';
import BookingConfirmation from './BookingConfirmation';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface PublicBookingFlowProps {
  isOpen: boolean;
  serviceId: string;
  onClose: () => void;
}

const PublicBookingFlow: React.FC<PublicBookingFlowProps> = ({
  isOpen,
  serviceId,
  onClose,
}) => {
  const { t } = useTranslation('public');
  const settings = useInterfaceStore((state) => state.settings);
  const {
    currentStep,
    bookingData,
    openBooking,
    setStep,
    updateBookingData,
    error,
    resetBooking,
    validateCurrentStep,
    setError,
    setLoading,
    isLoading,
    submitBooking,
    showConfirmation,
    lastBookingInfo,
    closeConfirmation
  } = usePublicBookingStore();

  // Initialiser le store avec le serviceId quand le modal s'ouvre
  React.useEffect(() => {
    if (isOpen && serviceId) {
      console.log('🚀 Initializing booking with serviceId:', serviceId);
      openBooking(serviceId);
    }
  }, [isOpen, serviceId, openBooking]);

  // Debug: afficher l'état actuel
  React.useEffect(() => {
    console.log('📊 PublicBookingFlow state:', {
      currentStep,
      serviceId: bookingData.serviceId,
      isOpen,
      error
    });
  }, [currentStep, bookingData.serviceId, isOpen, error]);

  const handleDateTimeSelect = React.useCallback((date: string, time: string, stylistId: string) => {
    updateBookingData({
      date,
      startTime: time,
      stylistId,
    });
    setStep('client');
  }, [updateBookingData, setStep]);

  const handleClientSubmit = React.useCallback(async (clientData: PublicClientFormData) => {
    updateBookingData({ clientData });
    setLoading(true);
    
    try {
      await submitBooking();
    } catch (error) {
      setError({ 
        step: 'client',
        message: t('errors:booking.error')
      });
      setLoading(false);
    }
  }, [updateBookingData, setError, setLoading, submitBooking, t]);

  const handleBack = React.useCallback(() => {
    if (currentStep === 'datetime') {
      onClose();
      resetBooking();
    } else if (currentStep === 'client') {
      setStep('datetime');
    }
  }, [currentStep, onClose, resetBooking, setStep]);

  const handleCloseConfirmation = React.useCallback(() => {
    closeConfirmation();
    onClose();
    resetBooking();
  }, [closeConfirmation, onClose, resetBooking]);

  const getStepTitle = () => {
    switch (currentStep) {
      case 'datetime':
        return t('booking.flow.choose_slot');
      case 'client':
        return t('booking.flow.your_info');
      default:
        return '';
    }
  };

  // Afficher la confirmation si disponible
  if (showConfirmation && lastBookingInfo) {
    return (
      <BookingConfirmation
        isOpen={true}
        onClose={handleCloseConfirmation}
        appointmentDate={format(new Date(lastBookingInfo.date), 'EEEE d MMMM yyyy', { locale: fr })}
        appointmentTime={lastBookingInfo.time}
        modificationLink={lastBookingInfo.modificationLink}
      />
    );
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        onClose();
        resetBooking();
      }}
      title={getStepTitle()}
    >
      <div className="space-y-8">
        <BookingProgressBar currentStep={currentStep} />

        {error && (
          <div className="glass-card bg-burgundy/10 p-6 mb-6 animate-fade-in">
            <div className="flex items-center space-x-3">
              <svg className="w-6 h-6 text-burgundy" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-white/90">{error.message}</span>
            </div>
          </div>
        )}

        {isLoading && (
          <div className="absolute inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50">
            <LoadingSpinner fullScreen={false} />
          </div>
        )}

        <div className="animate-fade-in">
          {currentStep === 'datetime' && (
            <DateTimeSelection
              serviceId={bookingData.serviceId}
              selectedDate={bookingData.date}
              selectedTime={bookingData.startTime}
              stylistId={bookingData.stylistId}
              showTeamSelection={settings.showTeamOnPublicPage}
              onSelect={handleDateTimeSelect}
            />
          )}

          {currentStep === 'client' && (
            <PublicClientForm
              serviceId={bookingData.serviceId}
              onSubmit={handleClientSubmit}
              onBack={handleBack}
            />
          )}
        </div>
      </div>
    </Modal>
  );
};

export default PublicBookingFlow;
