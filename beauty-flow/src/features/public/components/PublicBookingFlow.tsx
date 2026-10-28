import React from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { CheckIcon, XMarkIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { useInterfaceStore } from '../../interface/store';
import { usePublicBookingStore } from '../store';
import { PublicClientFormData, PublicService, PublicTeamMember, PublicSalonProfile } from '../types';
import DateTimeSelection from './DateTimeSelection';
import PublicClientForm from './PublicClientForm';
import { BookingConfirmation } from './BookingConfirmation';
import { DesignTemplate } from '../../templates/types';
import { formatPrice } from '../../../utils/currency';
import { availabilityCode } from '../../appointments/availability';
import { bookingVars, dateLocale, formatDuration } from './bookingTheme';

interface PublicBookingFlowProps {
  template: DesignTemplate;
  serviceId: string;
  slug: string;
  services?: PublicService[];
  team?: PublicTeamMember[];
  /** Salon profile: currency, address, name and team visibility for the summary/confirmation */
  profile?: PublicSalonProfile;
  onClose: () => void;
}

function BookingStepper({ step }: { step: 1 | 2 | 3 }) {
  const { t } = useTranslation('public');
  const labels = [t('booking.stepper.slot'), t('booking.stepper.info'), t('booking.stepper.done')];
  return (
    <ol className="bk-steps" aria-label={t('booking.stepper.label')}>
      {labels.map((label, i) => {
        const n = i + 1;
        const state = step > n || step === 3 ? 'is-done' : step === n ? 'is-current' : '';
        return (
          <React.Fragment key={n}>
            {i > 0 && <li aria-hidden="true" className={`bk-step-line ${step >= n ? 'is-done' : ''}`} />}
            <li className={`bk-step ${state}`} aria-current={step === n ? 'step' : undefined}>
              <span className="bk-step-dot">{state === 'is-done' ? <CheckIcon className="h-3.5 w-3.5" strokeWidth={2.5} /> : n}</span>
              <span>{label}</span>
            </li>
          </React.Fragment>
        );
      })}
    </ol>
  );
}

const PublicBookingFlow: React.FC<PublicBookingFlowProps> = ({
  template,
  serviceId,
  slug,
  services,
  team,
  profile,
  onClose,
}) => {
  const { t, i18n } = useTranslation('public');
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

  const currentService = services?.find((s) => s._id === serviceId);
  const currency = profile?.settings?.currency || 'DZD';
  const priceLabel = currentService?.price ? formatPrice(currentService.price, currency) : undefined;
  // Name of the picked staff (from the availability staff list); after "peu importe" the server tells who got it
  const [pickedName, setPickedName] = React.useState<string | undefined>();
  const [refreshKey, setRefreshKey] = React.useState(0);
  const stylistName = lastBookingInfo?.stylistName || (bookingData.stylistId ? pickedName : undefined);

  // Initialise the store with the serviceId on mount (parent conditionally renders this)
  React.useEffect(() => {
    if (serviceId) openBooking(serviceId);
  }, [serviceId, openBooking]);

  const close = React.useCallback(() => {
    closeConfirmation();
    onClose();
    resetBooking();
  }, [closeConfirmation, onClose, resetBooking]);

  // Escape closes, page behind does not scroll
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close();
    document.addEventListener('keydown', onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
    };
  }, [close]);

  const handleDateTimeSelect = React.useCallback(
    (date: string, time: string, stylistId: string, name?: string) => {
      setPickedName(name);
      updateBookingData({ date, startTime: time, stylistId });
    },
    [updateBookingData]
  );

  const handleClientSubmit = React.useCallback(
    async (clientData: PublicClientFormData) => {
      updateBookingData({ clientData });
      setLoading(true);
      try {
        await submitBooking();
      } catch (err: any) {
        const code = availabilityCode(err);
        if (code) {
          // The slot went in the meantime: back to the slots (fresh), the client's details are kept
          updateBookingData({ startTime: '' });
          setStep('datetime');
          setRefreshKey((k) => k + 1);
          setError({ step: 'datetime', message: t(`errors:availability.${code}`) });
        } else {
          setError({ step: 'client', message: err?.message || t('errors:booking.error') });
        }
      } finally {
        setLoading(false);
      }
    },
    [updateBookingData, setError, setLoading, setStep, submitBooking, t]
  );

  const step: 1 | 2 | 3 = showConfirmation && lastBookingInfo ? 3 : currentStep === 'client' ? 2 : 1;

  // Direction-aware step transition, decided only when the step changes (none on first open)
  const nav = React.useRef({ step, dir: '' });
  if (nav.current.step !== step) nav.current = { step, dir: step > nav.current.step ? 'bk-step-fwd' : 'bk-step-back' };

  // Body scrolls back to top on every step change
  const bodyRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => { bodyRef.current?.scrollTo({ top: 0 }); }, [step]);

  const titles = { 1: t('booking.flow.choose_slot'), 2: t('booking.flow.your_info'), 3: t('booking.confirm.title') };
  const slotLabel = bookingData.date && bookingData.startTime
    ? `${format(new Date(`${bookingData.date}T00:00`), 'EEE d MMM', { locale: dateLocale(i18n.language) })} · ${bookingData.startTime}`
    : null;

  // Portal: keeps the salon page's own CSS (.sp headings, focus rings) out of the sheet
  return createPortal(
    <div className={`bk bk-overlay bk-v-${template.booking?.variant ?? 'sheet'}`} style={bookingVars(template)} onClick={(e) => e.target === e.currentTarget && close()}>
      <div className="bk-sheet" role="dialog" aria-modal="true" aria-labelledby="bk-title">
        <div className="bk-handle" aria-hidden="true" />

        <header className="px-5 pt-3 md:pt-5 pb-4 space-y-4" style={{ borderBottom: '1px solid var(--bk-border)' }}>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              {profile?.establishmentName && <p className="bk-muted text-sm truncate">{profile.establishmentName}</p>}
              <h2 id="bk-title" className="bk-h text-xl">{titles[step]}</h2>
            </div>
            <button type="button" className="bk-icon-btn -me-2" onClick={close} aria-label={t('modal.close')}>
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
          <BookingStepper step={step} />
          {currentService && step < 3 && (
            <div className="flex items-center gap-3 px-4 py-2.5 text-sm" style={{ background: 'var(--bk-surface)', boxShadow: 'inset 0 0 0 1px var(--bk-border)', borderRadius: 'min(var(--bk-radius-card), 14px)' }}>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">
                  {currentService.name}
                  <span className="bk-muted font-normal"> · {formatDuration(currentService.duration)}</span>
                </p>
                {slotLabel && (
                  <p className="truncate bk-muted first-letter:uppercase">{slotLabel}{stylistName ? ` · ${stylistName}` : ''}</p>
                )}
              </div>
              {priceLabel && <span className="bk-num shrink-0 font-semibold">{priceLabel}</span>}
            </div>
          )}
        </header>

        <div ref={bodyRef} className="bk-body">
          <div key={step} className={`px-5 py-5 space-y-4 ${nav.current.dir}`}>
            {error && (
              <div className="bk-notice is-error" role="alert">
                <ExclamationCircleIcon className="h-5 w-5 shrink-0" />
                <span>{error.message}</span>
              </div>
            )}

            {step === 1 && (
              <DateTimeSelection
                serviceId={bookingData.serviceId}
                selectedDate={bookingData.date}
                selectedTime={bookingData.startTime}
                stylistId={bookingData.stylistId}
                showTeamSelection={profile?.showTeamOnPublicPage ?? settings.showTeamOnPublicPage}
                slug={slug}
                refreshKey={refreshKey}
                onSelect={handleDateTimeSelect}
              />
            )}

            {step === 2 && (
              <PublicClientForm
                serviceId={bookingData.serviceId}
                publicService={currentService}
                initialData={bookingData.clientData.firstName ? bookingData.clientData : undefined}
                onSubmit={handleClientSubmit}
              />
            )}

            {step === 3 && lastBookingInfo && (
              <BookingConfirmation
                bookingInfo={{
                  date: lastBookingInfo.date,
                  time: lastBookingInfo.time,
                  duration: currentService?.duration,
                  serviceName: currentService?.name || '',
                  stylistName,
                  priceLabel,
                  salonName: profile?.establishmentName,
                  address: profile?.address,
                  modificationUrl: `${window.location.origin}/appointment/${lastBookingInfo.modificationLink}`,
                }}
              />
            )}
          </div>
        </div>

        <footer className="bk-footer">
          {step === 1 && (
            <button type="button" className="bk-btn" disabled={!bookingData.date || !bookingData.startTime} onClick={() => setStep('client')}>
              {t('booking.flow.continue')}
            </button>
          )}
          {step === 2 && (
            <>
              <button type="button" className="bk-btn-ghost !flex-none" onClick={() => setStep('datetime')} disabled={isLoading}>
                {t('booking.flow.back')}
              </button>
              <button type="submit" form="bk-client-form" className="bk-btn" disabled={isLoading}>
                {isLoading && <span className="bk-spinner" aria-hidden="true" />}
                {isLoading ? t('booking.flow.sending') : t('booking.flow.confirm_booking')}
              </button>
            </>
          )}
          {step === 3 && (
            <button type="button" className="bk-btn" onClick={close}>{t('booking.confirm.close')}</button>
          )}
        </footer>
      </div>
    </div>,
    document.body
  );
};

export { PublicBookingFlow };
export default PublicBookingFlow;
