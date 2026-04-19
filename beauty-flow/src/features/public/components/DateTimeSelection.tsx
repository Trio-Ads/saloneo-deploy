import React, { useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  UserIcon,
  CalendarDaysIcon,
  ClockIcon,
  SparklesIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import ModernCalendar from './ModernCalendar';
import AdaptiveModal from './AdaptiveModal';
import { useTemplateStyles } from '../../../hooks/useTemplateStyles';
import { useServiceStore } from '../../services/store';
import { useTeamStore } from '../../team/store';
import { useAppointmentStore } from '../../appointments/store';
import { useProfileStore } from '../../profile/store';
import { useAuthStore } from '../../auth/store';
import { TeamMember } from '../../team/types';
import { DaySchedule } from '../../appointments/types';
import { format, addMinutes } from 'date-fns';
import { fr } from 'date-fns/locale';
import LoadingSpinner from '../components/LoadingSpinner';

interface DateTimeSelectionProps {
  serviceId: string;
  serviceDuration?: number;
  selectedDate?: string;
  selectedTime?: string;
  stylistId?: string;
  showTeamSelection?: boolean;
  onSelect: (date: string, time: string, stylistId: string) => void;
}

const DateTimeSelection: React.FC<DateTimeSelectionProps> = ({
  serviceId,
  serviceDuration,
  selectedDate,
  selectedTime,
  stylistId,
  showTeamSelection = true,
  onSelect,
}) => {
  const { t, i18n } = useTranslation('public');
  const { colors } = useTemplateStyles();
  const serviceFromStore = useServiceStore(state => state.services.find(s => s.id === serviceId));
  // Stabilize reference — creating a new object inline every render causes infinite loops
  // because loadAvailableSlots depends on this value via useCallback.
  const service: { duration: number } | undefined = useMemo(() => {
    return serviceFromStore ?? (serviceDuration !== undefined ? { duration: serviceDuration } : undefined);
  }, [serviceFromStore, serviceDuration]);
  // Use selectors to avoid subscribing to entire store (prevents re-renders on every store update)
  const addPreBooking = useAppointmentStore(state => state.addPreBooking);
  const removePreBooking = useAppointmentStore(state => state.removePreBooking);
  
  const useStylists = () => {
    const members = useTeamStore(state => state.members);
    const profile = useProfileStore(state => state.profile);
    const user = useAuthStore(state => state.user);
    
    return React.useMemo(() => {
      const teamStylists = members.filter(member => 
        member.isActive && 
        (member.role === 'Coiffeur(se)' || member.role === 'Coloriste')
      );
      
      const ownerAlreadyInTeam = teamStylists.some(member => 
        member.email === user?.email
      );
      
      if (!ownerAlreadyInTeam && profile.showAsTeamMember) {
        const ownerAsStylist: TeamMember = {
          id: 'owner-' + (user?.id || 'default'),
          firstName: profile.firstName || 'Propriétaire',
          lastName: profile.lastName || (user?.establishmentName ? 'de ' + user?.establishmentName : 'du Salon'),
          email: user?.email || '',
          phone: '',
          role: 'Propriétaire',
          specialties: [],
          workingHours: {
            monday: { isWorking: true, start: '09:00', end: '18:00', breaks: [{ start: '12:00', end: '13:00' }] },
            tuesday: { isWorking: true, start: '09:00', end: '18:00', breaks: [{ start: '12:00', end: '13:00' }] },
            wednesday: { isWorking: true, start: '09:00', end: '18:00', breaks: [{ start: '12:00', end: '13:00' }] },
            thursday: { isWorking: true, start: '09:00', end: '18:00', breaks: [{ start: '12:00', end: '13:00' }] },
            friday: { isWorking: true, start: '09:00', end: '18:00', breaks: [{ start: '12:00', end: '13:00' }] },
            saturday: { isWorking: true, start: '09:00', end: '18:00', breaks: [{ start: '12:00', end: '13:00' }] },
            sunday: { isWorking: false }
          },
          isActive: true,
          color: colors.primary
        };
        
        return [ownerAsStylist, ...teamStylists];
      }
      
      return teamStylists;
    }, [members, profile, user]);
  };
  
  const stylists = useStylists();

  const [availableSlots, setAvailableSlots] = useState<Record<string, DaySchedule>>({});

  // Calculer les dates disponibles pour le calendrier
  const availableDatesForCalendar = useMemo(() => {
    return Object.keys(availableSlots)
      .filter(date => availableSlots[date]?.timeSlots.some(slot => slot.available))
      .map(date => new Date(date));
  }, [availableSlots]);

  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [selectedStylistId, setSelectedStylistId] = useState(stylistId || '');

  // When "Tous" is selected (empty string), fall back to first available stylist for slot loading
  const effectiveStylistId = selectedStylistId || stylists[0]?.id || '';
  const [internalSelectedDate, setInternalSelectedDate] = useState(selectedDate);
  const [preBookingId, setPreBookingId] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [showCalendarModal, setShowCalendarModal] = useState(true); // Afficher le calendrier par défaut
  const [calendarSelectedDate, setCalendarSelectedDate] = useState<Date | undefined>(
    selectedDate ? new Date(selectedDate) : undefined
  );

  useEffect(() => {
    if (!showTeamSelection && stylists.length > 0 && !selectedStylistId && !isInitialized) {
      setSelectedStylistId(stylists[0].id);
      setIsInitialized(true);
    }
  }, [showTeamSelection, stylists, selectedStylistId, isInitialized]);

  const loadAvailableSlots = React.useCallback(async () => {
    if (!effectiveStylistId || !service) return;

    setIsLoadingSlots(true);
    try {
      // Use getState() to avoid adding getDaySchedule as a reactive dependency.
      // getDaySchedule internally calls cleanupExpiredPreBookings() which calls set(),
      // which would trigger re-renders and cause an infinite loop if used via hook.
      const { getDaySchedule } = useAppointmentStore.getState();
      const newSlots: Record<string, DaySchedule> = {};

      // Charger les créneaux pour les 6 prochains mois (180 jours)
      for (let i = 0; i < 180; i++) {
        const date = new Date();
        date.setDate(date.getDate() + i);
        const formattedDate = format(date, 'yyyy-MM-dd');

        const schedule = getDaySchedule(formattedDate, effectiveStylistId);

        const filteredTimeSlots = schedule.timeSlots.map((slot, index, slots) => {
          if (!slot.available) return slot;

          const slotsNeeded = Math.ceil(service.duration / 15);

          let canBook = true;
          for (let j = 0; j < slotsNeeded; j++) {
            if (!slots[index + j] || !slots[index + j].available) {
              canBook = false;
              break;
            }
          }

          return { ...slot, available: canBook };
        });

        newSlots[formattedDate] = {
          ...schedule,
          timeSlots: filteredTimeSlots
        };
      }

      setAvailableSlots(newSlots);
    } catch (error) {
      console.error('Error loading available slots:', error);
    } finally {
      setIsLoadingSlots(false);
    }
  }, [effectiveStylistId, service]);

  useEffect(() => {
    if (effectiveStylistId && service) {
      loadAvailableSlots();
      const interval = setInterval(loadAvailableSlots, 60000);
      return () => clearInterval(interval);
    }
  // loadAvailableSlots already closes over effectiveStylistId and service
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadAvailableSlots]);

  // Reset calendar and date when stylist changes so user sees fresh availability
  useEffect(() => {
    setInternalSelectedDate(undefined);
    setCalendarSelectedDate(undefined);
    setShowCalendarModal(true);
  }, [selectedStylistId]);

  useEffect(() => {
    if (stylistId && stylistId !== selectedStylistId) {
      setSelectedStylistId(stylistId);
    }
  }, [stylistId]);

  useEffect(() => {
    if (selectedDate && selectedTime && selectedStylistId && service) {
      if (preBookingId) {
        removePreBooking(preBookingId);
      }

      const endTime = format(
        addMinutes(
          new Date(`2000-01-01 ${selectedTime}`),
          service.duration
        ),
        'HH:mm'
      );

      const newPreBookingId = addPreBooking({
        date: selectedDate,
        startTime: selectedTime,
        endTime,
        stylistId: selectedStylistId,
      });

      setPreBookingId(newPreBookingId);
    }

    return () => {
      if (preBookingId) {
        removePreBooking(preBookingId);
      }
    };
  }, [selectedDate, selectedTime, selectedStylistId, service, addPreBooking, removePreBooking, preBookingId]);

  if (!service) {
    return <div className="text-center p-4">Service non trouvé</div>;
  }

  if (stylists.length === 0) {
    return (
      <div className="glass-card p-6 text-center">
        <p className="text-gray-600">Aucun coiffeur disponible pour le moment.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {showTeamSelection && stylists.length > 0 && (
        <div className="px-5 mb-3">
          <p className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: colors.textSecondary }}>
            {t('booking.flow.with_who', 'Avec qui ?')}
          </p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setSelectedStylistId('')}
              className={`flex-shrink-0 flex flex-col items-center gap-1 p-2 rounded-lg transition-all ${!selectedStylistId ? '' : 'opacity-60'}`}
              style={!selectedStylistId ? { outline: `2px solid ${colors.primary}`, outlineOffset: '1px' } : {}}
            >
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm" style={{ background: colors.surface, color: colors.textSecondary }}>
                👤
              </div>
              <span className="text-[9px] font-semibold" style={{ color: colors.textPrimary }}>{t('booking.flow.any_stylist', 'Tous')}</span>
            </button>
            {stylists.map((member: TeamMember) => (
              <button
                key={member.id}
                onClick={() => setSelectedStylistId(member.id)}
                className={`flex-shrink-0 flex flex-col items-center gap-1 p-2 rounded-lg transition-all ${selectedStylistId === member.id ? '' : 'opacity-60'}`}
                style={selectedStylistId === member.id ? { outline: `2px solid ${colors.primary}`, outlineOffset: '1px' } : {}}
              >
                {member.avatar
                  ? <img src={member.avatar} alt="" className="w-9 h-9 rounded-full object-cover" />
                  : <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: member.color || colors.primary }}>{member.firstName[0]}{member.lastName[0]}</div>
                }
                <span className="text-[9px] font-semibold" style={{ color: colors.textPrimary }}>{member.firstName}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {effectiveStylistId && (
        <>
          {/* Modal avec calendrier complet */}
          <AdaptiveModal
            isOpen={showCalendarModal}
            onClose={() => setShowCalendarModal(false)}
            title={t('booking.flow.choose_date')}
            size="xl"
          >
            <ModernCalendar
              selectedDate={calendarSelectedDate}
              onSelectDate={(date) => {
                const formattedDate = format(date, 'yyyy-MM-dd');
                const hasAvailableSlots = availableSlots[formattedDate]?.timeSlots.some(
                  slot => slot.available
                );

                if (hasAvailableSlots) {
                  setCalendarSelectedDate(date);
                  setInternalSelectedDate(formattedDate);
                  setShowCalendarModal(false);
                }
              }}
              availableDates={availableDatesForCalendar}
              minDate={new Date()}
              maxDate={new Date(new Date().setFullYear(new Date().getFullYear() + 1))}
              locale={i18n.language}
            />
          </AdaptiveModal>

          {/* Show selected date with option to change */}
          {internalSelectedDate && !showCalendarModal && (
            <div className="px-5 mb-2 flex items-center justify-between">
              <span className="text-sm font-semibold" style={{ color: colors.textPrimary }}>
                {format(new Date(internalSelectedDate), 'EEEE d MMMM', { locale: fr })}
              </span>
              <button
                onClick={() => setShowCalendarModal(true)}
                className="text-xs underline"
                style={{ color: colors.primary }}
              >
                {t('booking.flow.change_date', 'Changer')}
              </button>
            </div>
          )}
        </>
      )}

      {internalSelectedDate && effectiveStylistId && (
        <div className="px-5 mb-4">
          <p className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: colors.textSecondary }}>
            {t('booking.flow.choose_time', 'Choisir un horaire')}
          </p>

          {isLoadingSlots ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner fullScreen={false} />
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-2">
              {availableSlots[internalSelectedDate]?.timeSlots.map((slot) => {
                const isSelected = slot.startTime === selectedTime;
                const isFull = !slot.available;
                return (
                  <button
                    key={slot.startTime}
                    disabled={isFull}
                    onClick={() => onSelect(internalSelectedDate, slot.startTime, effectiveStylistId)}
                    className={`py-2 rounded-lg text-xs font-bold transition-all${isFull ? ' cursor-not-allowed' : ''}`}
                    style={{
                      background: isSelected ? colors.textPrimary : isFull ? 'transparent' : colors.surface,
                      color: isSelected ? '#fff' : isFull ? colors.textSecondary : colors.textPrimary,
                      textDecoration: isFull ? 'line-through' : 'none',
                      opacity: isFull ? 0.4 : 1,
                    }}
                  >
                    {slot.startTime}
                  </button>
                );
              })}
            </div>
          )}

          {availableSlots[internalSelectedDate]?.timeSlots.length === 0 && !isLoadingSlots && (
            <div className="text-center py-8">
              <div className="mx-auto w-16 h-16 bg-gradient-to-r from-gray-400 to-gray-600 rounded-full flex items-center justify-center mb-4">
                <XMarkIcon className="h-8 w-8 text-white" />
              </div>
              <p className="text-gray-600 text-lg">{t('booking.flow.no_slots_available')}</p>
              <p className="text-gray-500 text-sm mt-1">{t('booking.flow.choose_another_date')}</p>
            </div>
          )}
        </div>
      )}

      {effectiveStylistId && internalSelectedDate && selectedTime && (
        <div className="glass-card p-6 bg-gradient-to-r from-green-50/50 to-emerald-50/50 border border-green-200/50">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl shadow-lg">
              <SparklesIcon className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-lg font-bold text-green-800">{t('booking.flow.your_selection')}</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3">
              <UserIcon className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-700">{t('booking.flow.stylist')}</p>
                <p className="text-green-800 font-bold">
                  {stylists.find(s => s.id === effectiveStylistId)?.firstName} {stylists.find(s => s.id === effectiveStylistId)?.lastName}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <CalendarDaysIcon className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-700">{t('booking.flow.date')}</p>
                <p className="text-green-800 font-bold">
                  {format(new Date(internalSelectedDate), 'EEEE d MMMM', { locale: fr })}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <ClockIcon className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-700">{t('booking.flow.time')}</p>
                <p className="text-green-800 font-bold">{selectedTime}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DateTimeSelection;
