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
  const service = useServiceStore(state => state.services.find(s => s.id === serviceId));
  const { getDaySchedule, addPreBooking, removePreBooking } = useAppointmentStore();
  
  const useStylists = () => {
    const members = useTeamStore(state => state.members);
    const profile = useProfileStore(state => state.profile);
    const user = useAuthStore(state => state.user);
    
    return React.useMemo(() => {
      // Filtrer les membres actifs qui sont coiffeurs ou coloristes
      const teamStylists = members.filter(member => 
        member.isActive && 
        (member.role === 'Coiffeur(se)' || member.role === 'Coloriste')
      );
      
      // Vérifier si le propriétaire est déjà dans la liste
      const ownerAlreadyInTeam = teamStylists.some(member => 
        member.email === user?.email
      );
      
      // Si le propriétaire n'est pas dans l'équipe et a activé l'option "Apparaître comme membre de l'équipe"
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
          color: '#9333EA' // Couleur violette pour le propriétaire
        };
        
        return [ownerAsStylist, ...teamStylists];
      }
      
      return teamStylists;
    }, [members, profile, user]);
  };
  
  const stylists = useStylists();

  // Debug: afficher les données reçues
  React.useEffect(() => {
    console.log('🎯 DateTimeSelection props:', {
      serviceId,
      selectedDate,
      selectedTime,
      stylistId
    });
    console.log('📋 Service found:', service);
    console.log('👥 Stylists available:', stylists);
  }, [serviceId, selectedDate, selectedTime, stylistId, service, stylists]);

  const [availableSlots, setAvailableSlots] = useState<Record<string, DaySchedule>>({});
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [selectedStylistId, setSelectedStylistId] = useState(stylistId || '');
  const [internalSelectedDate, setInternalSelectedDate] = useState(selectedDate);
  const [preBookingId, setPreBookingId] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [calendarSelectedDate, setCalendarSelectedDate] = useState<Date | undefined>(
    selectedDate ? new Date(selectedDate) : undefined
  );

  // Auto-sélectionner le premier coiffeur si l'équipe n'est pas affichée
  useEffect(() => {
    if (!showTeamSelection && stylists.length > 0 && !selectedStylistId && !isInitialized) {
      console.log('🎯 Auto-sélection du premier coiffeur:', stylists[0]);
      setSelectedStylistId(stylists[0].id);
      setIsInitialized(true);
    }
  }, [showTeamSelection, stylists, selectedStylistId, isInitialized]);

  const loadAvailableSlots = React.useCallback(async () => {
    if (!selectedStylistId || !service) {
      console.log('⚠️ Cannot load slots - missing data:', { selectedStylistId, service });
      return;
    }

    console.log('📅 Loading available slots for:', { 
      stylistId: selectedStylistId, 
      serviceDuration: service.duration 
    });

    setIsLoadingSlots(true);
    try {
      const newSlots: Record<string, DaySchedule> = {};
      
      // Charger les créneaux pour les 30 prochains jours (au lieu de 3)
      for (let i = 0; i < 30; i++) {
        const date = new Date();
        date.setDate(date.getDate() + i);
        const formattedDate = format(date, 'yyyy-MM-dd');
        
        // Récupérer le planning du jour
        const schedule = getDaySchedule(formattedDate, selectedStylistId);
        console.log(`📊 Schedule for ${formattedDate}:`, {
          totalSlots: schedule.timeSlots.length,
          availableSlots: schedule.timeSlots.filter(s => s.available).length
        });
        
        // Filtrer les créneaux en fonction de la durée du service
        const filteredTimeSlots = schedule.timeSlots.map((slot, index, slots) => {
          if (!slot.available) return slot;

          // Calculer le nombre de créneaux nécessaires (15 min par créneau)
          const slotsNeeded = Math.ceil(service.duration / 15);
          
          // Vérifier si on a assez de créneaux consécutifs disponibles
          let canBook = true;
          for (let j = 0; j < slotsNeeded; j++) {
            if (!slots[index + j] || !slots[index + j].available) {
              canBook = false;
              break;
            }
          }

          return { ...slot, available: canBook };
        });

        const availableCount = filteredTimeSlots.filter(s => s.available).length;
        console.log(`✅ Available slots after filtering for ${formattedDate}: ${availableCount}`);

        newSlots[formattedDate] = {
          ...schedule,
          timeSlots: filteredTimeSlots
        };
      }
      
      setAvailableSlots(newSlots);
      console.log('📋 All slots loaded:', newSlots);
    } catch (error) {
      console.error('❌ Error loading available slots:', error);
    } finally {
      setIsLoadingSlots(false);
    }
  }, [selectedStylistId, service, getDaySchedule]);

  useEffect(() => {
    if (selectedStylistId && service) {
      console.log('🔄 Triggering slot load for stylist:', selectedStylistId);
      loadAvailableSlots();
      // Rafraîchir les créneaux toutes les minutes pour maintenir la disponibilité à jour
      const interval = setInterval(loadAvailableSlots, 60000);
      return () => clearInterval(interval);
    }
  }, [selectedStylistId, service, loadAvailableSlots]);

  useEffect(() => {
    if (stylistId && stylistId !== selectedStylistId) {
      setSelectedStylistId(stylistId);
    }
  }, [stylistId]);

  // Gérer la pré-réservation
  useEffect(() => {
    if (selectedDate && selectedTime && selectedStylistId && service) {
      // Supprimer l'ancienne pré-réservation si elle existe
      if (preBookingId) {
        removePreBooking(preBookingId);
      }

      // Calculer l'heure de fin basée sur la durée du service
      const endTime = format(
        addMinutes(
          new Date(`2000-01-01 ${selectedTime}`),
          service.duration
        ),
        'HH:mm'
      );

      // Créer une nouvelle pré-réservation
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
    console.log('⚠️ No service found for ID:', serviceId);
    return <div className="text-center p-4">Service non trouvé</div>;
  }

  // Si pas de coiffeurs disponibles
  if (stylists.length === 0) {
    console.log('⚠️ No stylists available');
    return (
      <div className="glass-card p-6 text-center">
        <p className="text-gray-600">Aucun coiffeur disponible pour le moment.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Sélection du coiffeur - Affichage conditionnel */}
      {showTeamSelection && (
        <div className="glass-card p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl shadow-lg">
              <UserIcon className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
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
                    ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 shadow-lg ring-2 ring-purple-500/50'
                    : 'hover:bg-white/5 hover:shadow-lg'
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    selectedStylistId === stylist.id
                      ? 'bg-gradient-to-r from-purple-500 to-pink-600'
                      : 'bg-gradient-to-r from-gray-400 to-gray-600'
                  }`}>
                    <UserIcon className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-left">
                    <div className="text-gray-900 font-bold text-lg">
                      {stylist.firstName} {stylist.lastName}
                    </div>
                    <div className="text-gray-600 text-sm">
                      {stylist.role === 'Propriétaire' ? (
                        <span className="flex items-center space-x-1">
                          <SparklesIcon className="h-3 w-3 text-purple-600" />
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
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl shadow-lg">
                <CalendarDaysIcon className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                {t('booking.flow.choose_date')}
              </h3>
            </div>
            <button
              onClick={() => setShowCalendarModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-xl font-medium hover:shadow-lg transition-all duration-300 transform hover:scale-105"
            >
              <CalendarDaysIcon className="h-5 w-5 inline mr-2" />
              Voir le calendrier complet
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[0, 1, 2].map((offset) => {
              const date = new Date();
              date.setDate(date.getDate() + offset);
              const formattedDate = format(date, 'yyyy-MM-dd');
              const hasAvailableSlots = availableSlots[formattedDate]?.timeSlots.some(
                slot => slot.available
              );

              return (
                <button
                  key={offset}
                  onClick={() => {
                    if (hasAvailableSlots) {
                      setInternalSelectedDate(formattedDate);
                    }
                  }}
                  disabled={!hasAvailableSlots || isLoadingSlots}
                  className={`glass-card p-6 transition-all duration-300 transform hover:scale-105 border border-white/20 ${
                    internalSelectedDate === formattedDate
                      ? 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 shadow-lg ring-2 ring-blue-500/50'
                      : hasAvailableSlots
                        ? 'hover:bg-white/5 hover:shadow-lg'
                        : 'opacity-50 cursor-not-allowed'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-gray-900 font-bold text-lg capitalize">
                      {format(date, 'EEEE', { locale: fr })}
                    </div>
                    <div className="text-gray-600 mt-1">
                      {format(date, 'd MMMM', { locale: fr })}
                    </div>
                    {internalSelectedDate === formattedDate && (
                      <div className="flex items-center justify-center space-x-1 mt-2">
                        <CheckCircleIcon className="h-4 w-4 text-green-600" />
                        <span className="text-green-600 text-xs font-medium">{t('booking.flow.selected')}</span>
                      </div>
                    )}
                    {!hasAvailableSlots && !isLoadingSlots && (
                      <div className="flex items-center justify-center space-x-1 mt-2">
                        <XMarkIcon className="h-4 w-4 text-red-500" />
                        <span className="text-xs text-red-500">{t('booking.flow.no_slots')}</span>
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

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
          availableDates={useMemo(() => {
            return Object.keys(availableSlots)
              .filter(date => availableSlots[date]?.timeSlots.some(slot => slot.available))
              .map(date => new Date(date));
          }, [availableSlots])}
          minDate={new Date()}
          maxDate={new Date(new Date().setFullYear(new Date().getFullYear() + 1))}
          locale={i18n.language}
        />
      </AdaptiveModal>

      {/* Sélection de l'heure */}
      {internalSelectedDate && selectedStylistId && (
        <div className="glass-card p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl shadow-lg">
              <ClockIcon className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
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
                        ? 'bg-gradient-to-r from-indigo-500/20 to-purple-500/20 shadow-lg ring-2 ring-indigo-500/50'
                        : 'hover:bg-white/5 hover:shadow-lg'
                    }
                  `}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <ClockIcon className={`h-4 w-4 ${
                      !slot.available 
                        ? 'text-gray-400'
                        : selectedTime === slot.startTime
                          ? 'text-indigo-600'
                          : 'text-gray-600'
                    }`} />
                    <span className={`font-medium ${
                      !slot.available 
                        ? 'text-gray-400'
                        : selectedTime === slot.startTime
                          ? 'text-indigo-600'
                          : 'text-gray-900'
                    }`}>
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

      {/* Résumé de la sélection */}
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
