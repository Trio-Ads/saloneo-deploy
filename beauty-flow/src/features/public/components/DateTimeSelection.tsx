import React, { useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  UserIcon,
  CalendarDaysIcon,
  ClockIcon,
  SparklesIcon,
  CheckCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import ModernCalendar from './ModernCalendar';
import AdaptiveModal from './AdaptiveModal';
import { useInterfaceStore } from '../../interface/store';
import { useTemplateStyles } from '../../../hooks/useTemplateStyles';
import { useServiceStore } from '../../services/store';
import { useTeamStore } from '../../team/store';
import { useAppointmentStore } from '../../appointments/store';
import { useProfileStore } from '../../profile/store';
import { useAuthStore } from '../../auth/store';
import { TeamMember } from '../../team/types';
import { DaySchedule, TimeSlot } from '../../appointments/types';
import { format, addMinutes } from 'date-fns';
import { fr } from 'date-fns/locale';
import LoadingSpinner from '../components/LoadingSpinner';

interface DateTimeSelectionProps {
  serviceId: string;
  selectedDate?: string;
  selectedTime?: string;
  stylistId?: string;
  showTeamSelection?: boolean;
  onSelect: (date: string, time: string, stylistId: string) => void;
}

const DateTimeSelection: React.FC<DateTimeSelectionProps> = ({
  serviceId,
  selectedDate,
  selectedTime,
  stylistId,
  showTeamSelection = true,
  onSelect,
}) => {
  const { t, i18n } = useTranslation('public');
  const settings = useInterfaceStore(state => state.settings);
  const { colors } = useTemplateStyles();
  const service = useServiceStore(state => state.services.find(s => s.id === serviceId));
  const { getDaySchedule, addPreBooking, removePreBooking } = useAppointmentStore();
  
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
    if (!selectedStylistId || !service) return;

    setIsLoadingSlots(true);
    try {
      const newSlots: Record<string, DaySchedule> = {};
      
      for (let i = 0; i < 30; i++) {
        const date = new Date();
        date.setDate(date.getDate() + i);
        const formattedDate = format(date, 'yyyy-MM-dd');
        
        const schedule = getDaySchedule(formattedDate, selectedStylistId);
        
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
  }, [selectedStylistId, service, getDaySchedule]);

  useEffect(() => {
    if (selectedStylistId && service) {
      loadAvailableSlots();
      const interval = setInterval(loadAvailableSlots, 60000);
      return () => clearInterval(interval);
    }
  }, [selectedStylistId, service, loadAvailableSlots]);

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
      {showTeamSelection && (
        <div className="glass-card p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-3 rounded-xl shadow-lg" style={{ background: `linear-gradient(to right, ${colors.primary}, ${colors.primaryDark})` }}>
              <UserIcon className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-bold bg-clip-text text-transparent" style={{ backgroundImage: `linear-gradient(to right, ${colors.primary}, ${colors.primaryDark})` }}>
              {t('booking.flow.choose_stylist')}
            </h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stylists.map((stylist: TeamMember) => (
              <button
                key={stylist.id}
                onClick={() => setSelectedStylistId(stylist.id)}
                className={`glass-card p-6 transition-all duration-300 transform hover:scale-105 border border-white/20 ${
                  selectedStylistId === stylist.id
                    ? 'shadow-lg ring-2'
                    : 'hover:bg-white/5 hover:shadow-lg'
                }`}
                style={selectedStylistId === stylist.id ? {
                  background: `linear-gradient(to right, ${colors.primary}20, ${colors.primaryDark}20)`,
                  '--tw-ring-color': `${colors.primary}80`
                } as any : {}}
              >
                <div className="flex items-center space-x-4">
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{
                      background: selectedStylistId === stylist.id
                        ? `linear-gradient(to right, ${colors.primary}, ${colors.primaryDark})`
                        : 'linear-gradient(to right, #9CA3AF, #6B7280)'
                    }}
                  >
                    <UserIcon className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-left">
                    <div className="text-gray-900 font-bold text-lg">
                      {stylist.firstName} {stylist.lastName}
                    </div>
                    <div className="text-gray-600 text-sm">
                      {stylist.role === 'Propriétaire' ? (
                        <span className="flex items-center space-x-1">
                          <SparklesIcon className="h-3 w-3" style={{ color: colors.primary }} />
                          <span>{stylist.role}</span>
                        </span>
                      ) : (
                        stylist.role
                      )}
                    </div>
                    {selectedStylistId === stylist.id && (
                      <div className="flex items-center space-x-1 mt-1">
                        <CheckCircleIcon className="h-4 w-4 text-green-600" />
                        <span className="text-green-600 text-xs font-medium">{t('booking.flow.selected')}</span>
                      </div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {selectedStylistId && (
        <>
          {/* Modal avec calendrier complet - Affiché par défaut */}
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
        </>
      )}

      {internalSelectedDate && selectedStylistId && (
        <div className="glass-card p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-3 rounded-xl shadow-lg" style={{ background: `linear-gradient(to right, ${colors.accent}, ${colors.accentLight})` }}>
              <ClockIcon className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-bold bg-clip-text text-transparent" style={{ backgroundImage: `linear-gradient(to right, ${colors.accent}, ${colors.accentLight})` }}>
              {t('booking.flow.choose_time')}
            </h3>
          </div>
          
          {isLoadingSlots ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner fullScreen={false} />
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {availableSlots[internalSelectedDate]?.timeSlots.map((slot) => (
                <button
                  key={slot.startTime}
                  onClick={() => {
                    if (slot.available) {
                      onSelect(internalSelectedDate, slot.startTime, selectedStylistId);
                    }
                  }}
                  disabled={!slot.available}
                  className={`
                    glass-card p-4 text-center transition-all duration-300 transform hover:scale-105 border border-white/20
                    ${!slot.available 
                      ? 'opacity-50 cursor-not-allowed bg-gray-50'
                      : selectedTime === slot.startTime
                        ? 'shadow-lg ring-2'
                        : 'hover:bg-white/5 hover:shadow-lg'
                    }
                  `}
                  style={selectedTime === slot.startTime ? {
                    background: `linear-gradient(to right, ${colors.accent}20, ${colors.accentLight}20)`,
                    '--tw-ring-color': `${colors.accent}80`
                  } as any : {}}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <ClockIcon className={`h-4 w-4 ${
                      !slot.available 
                        ? 'text-gray-400'
                        : selectedTime === slot.startTime
                          ? ''
                          : 'text-gray-600'
                    }`} style={selectedTime === slot.startTime ? { color: colors.accent } : {}} />
                    <span className={`font-medium ${
                      !slot.available 
                        ? 'text-gray-400'
                        : selectedTime === slot.startTime
                          ? ''
                          : 'text-gray-900'
                    }`} style={selectedTime === slot.startTime ? { color: colors.accent } : {}}>
                      {slot.startTime}
                    </span>
                  </div>
                  {selectedTime === slot.startTime && (
                    <div className="flex items-center justify-center space-x-1 mt-2">
                      <CheckCircleIcon className="h-3 w-3 text-green-600" />
                      <span className="text-green-600 text-xs font-medium">{t('booking.flow.chosen')}</span>
                    </div>
                  )}
                </button>
              ))}
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

      {selectedStylistId && internalSelectedDate && selectedTime && (
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
                  {stylists.find(s => s.id === selectedStylistId)?.firstName} {stylists.find(s => s.id === selectedStylistId)?.lastName}
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
