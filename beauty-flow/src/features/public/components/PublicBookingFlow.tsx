import React from 'react';
import { useTranslation } from 'react-i18next';
import { useInterfaceStore } from '../../interface/store';
import { usePublicBookingStore } from '../store';
import { PublicClientFormData } from '../types';
import DateTimeSelection from './DateTimeSelection';
import PublicClientForm from './PublicClientForm';
import LoadingSpinner from './LoadingSpinner';
import BookingConfirmation from './BookingConfirmation';
import { DesignTemplate } from '../../templates/types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface PublicBookingFlowProps {
  template: DesignTemplate;
  serviceId: string;
  slug: string;
  onClose: () => void;
}

// ---------------------------------------------------------------------------
// BookingStepper
// ---------------------------------------------------------------------------

interface BookingStepperProps {
  currentStep: 1 | 2 | 3;
  template: DesignTemplate;
}

function BookingStepper({ currentStep, template }: BookingStepperProps) {
  const { colors } = template.theme;
  const steps = [
    { num: 1, label: 'Créneau' },
    { num: 2, label: 'Vous' },
    { num: 3, label: 'Confirmé' },
  ];

  return (
    <div className="flex items-center px-5 py-3">
      {steps.map((step, i) => (
        <div key={step.num} className="flex items-center flex-1">
          <div className="flex flex-col items-center gap-0.5">
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
              style={{
                background:
                  currentStep > step.num
                    ? colors.primary
                    : currentStep === step.num
                    ? colors.text
                    : colors.surface,
                color: currentStep >= step.num ? '#fff' : colors.textSecondary,
              }}
            >
              {currentStep > step.num ? '✓' : step.num}
            </div>
            <span
              className="text-[9px] font-semibold uppercase tracking-wide"
              style={{
                color:
                  currentStep === step.num ? colors.text : colors.textSecondary,
              }}
            >
              {step.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div
              className="flex-1 h-0.5 mx-2 mb-3"
              style={{
                background:
                  currentStep > step.num + 1 ? colors.primary : colors.surface,
              }}
            />
          )}
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// ServiceChip
// ---------------------------------------------------------------------------

interface ServiceChipProps {
  service: { name: string; duration: number; price: number };
  slot?: { date: string; time: string; stylistName?: string };
  template: DesignTemplate;
}

function ServiceChip({ service, slot, template }: ServiceChipProps) {
  const { colors } = template.theme;
  const content = slot
    ? `${slot.date} · ${slot.time}${slot.stylistName ? ` · ${slot.stylistName}` : ''}`
    : `${service.name} · ${service.duration} min`;

  return (
    <div
      className="mx-4 mb-2 flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold"
      style={{ background: colors.surface, color: colors.textSecondary }}
    >
      <div
        className="w-2 h-2 rounded-full flex-shrink-0"
        style={{ background: colors.primary }}
      />
      <span className="truncate">{content}</span>
      <span className="font-bold ml-auto" style={{ color: colors.text }}>
        {service.price}€
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

const PublicBookingFlow: React.FC<PublicBookingFlowProps> = ({
  template,
  serviceId,
  slug: _slug,
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
    setError,
    setLoading,
    isLoading,
    submitBooking,
    showConfirmation,
    lastBookingInfo,
    closeConfirmation,
  } = usePublicBookingStore();

  const { colors } = template.theme;

  // Initialise the store with the serviceId on mount (parent conditionally renders this)
  React.useEffect(() => {
    if (serviceId) {
      console.log('🚀 Initializing booking with serviceId:', serviceId);
      openBooking(serviceId);
    }
  }, [serviceId, openBooking]);

  // Debug
  React.useEffect(() => {
    console.log('📊 PublicBookingFlow state:', {
      currentStep,
      serviceId: bookingData.serviceId,
      error,
    });
  }, [currentStep, bookingData.serviceId, error]);

  const handleDateTimeSelect = React.useCallback(
    (date: string, time: string, stylistId: string) => {
      updateBookingData({ date, startTime: time, stylistId });
      setStep('client');
    },
    [updateBookingData, setStep]
  );

  const handleClientSubmit = React.useCallback(
    async (clientData: PublicClientFormData) => {
      updateBookingData({ clientData });
      setLoading(true);
      try {
        await submitBooking();
      } catch (err) {
        setError({ step: 'client', message: t('errors:booking.error') });
        setLoading(false);
      }
    },
    [updateBookingData, setError, setLoading, submitBooking, t]
  );

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

  // Map store steps (strings) → stepper numeric step
  const numericStep: 1 | 2 | 3 =
    showConfirmation ? 3 : currentStep === 'client' ? 2 : 1;

  // Show confirmation screen
  if (showConfirmation && lastBookingInfo) {
    return (
      <BookingConfirmation
        isOpen={true}
        onClose={handleCloseConfirmation}
        appointmentDate={format(
          new Date(lastBookingInfo.date),
          'EEEE d MMMM yyyy',
          { locale: fr }
        )}
        appointmentTime={lastBookingInfo.time}
        modificationLink={lastBookingInfo.modificationLink}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={() => {
          onClose();
          resetBooking();
        }}
      />

      {/* Modal sheet */}
      <div
        className="relative w-full max-w-lg md:rounded-2xl rounded-t-2xl overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto"
        style={{
          background: colors.background,
          color: colors.text,
          fontFamily: template.theme.typography.bodyFont,
        }}
      >
        {template.customCSS && (
          <style dangerouslySetInnerHTML={{ __html: template.customCSS }} />
        )}

        {/* Drag handle (mobile) */}
        <div
          className="w-10 h-1.5 rounded-full mx-auto mt-3 mb-1"
          style={{ background: colors.surface }}
        />

        {/* Stepper */}
        <BookingStepper currentStep={numericStep} template={template} />

        {/* Service chip */}
        {bookingData.serviceId && (
          <ServiceChip
            service={{
              name: bookingData.serviceId,
              duration: 0,
              price: 0,
            }}
            slot={
              bookingData.date && bookingData.startTime
                ? { date: bookingData.date, time: bookingData.startTime }
                : undefined
            }
            template={template}
          />
        )}

        {/* Header row */}
        <div
          className="flex items-center justify-between px-5 pb-2 border-b"
          style={{ borderColor: colors.surface }}
        >
          <h2 className="text-base font-bold" style={{ color: colors.text }}>
            {currentStep === 'datetime'
              ? t('booking.flow.choose_slot')
              : t('booking.flow.your_info')}
          </h2>
          <button
            onClick={() => {
              onClose();
              resetBooking();
            }}
            className="w-7 h-7 flex items-center justify-center rounded-full transition-opacity hover:opacity-70"
            style={{ background: colors.surface, color: colors.textSecondary }}
            aria-label="Fermer"
          >
            <svg
              className="w-3.5 h-3.5"
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
        </div>

        {/* Body */}
        <div className="px-5 pb-6 pt-4 space-y-4 relative">
          {/* Error banner */}
          {error && (
            <div
              className="flex items-center gap-3 p-4 rounded-xl text-sm"
              style={{
                backgroundColor: `${colors.primary}15`,
                color: colors.text,
                border: `1px solid ${colors.primary}30`,
              }}
            >
              <svg
                className="w-5 h-5 flex-shrink-0"
                style={{ color: colors.primary }}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>{error.message}</span>
            </div>
          )}

          {/* Loading overlay */}
          {isLoading && (
            <div className="absolute inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 rounded-b-2xl">
              <LoadingSpinner fullScreen={false} />
            </div>
          )}

          {/* Step: DateTime */}
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

          {/* Step: Client form */}
          {currentStep === 'client' && (
            <>
              <PublicClientForm
                serviceId={bookingData.serviceId}
                onSubmit={handleClientSubmit}
                onBack={handleBack}
              />

              {/* Template-styled CTA (replaces the default button inside PublicClientForm
                  if needed; kept here as a supplementary submit trigger if the form
                  exposes a submit reference — otherwise the form's own button is used) */}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export { PublicBookingFlow };
export default PublicBookingFlow;
