import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { UserGroupIcon } from '@heroicons/react/24/outline';
import ModernCalendar from './ModernCalendar';
import { dateLocale } from './bookingTheme';
import { useTemplateStyles } from '../../../hooks/useTemplateStyles';
import { useServiceStore } from '../../services/store';
import { useTeamStore } from '../../team/store';
import { useAppointmentStore } from '../../appointments/store';
import { useProfileStore } from '../../profile/store';
import { useAuthStore } from '../../auth/store';
import { TeamMember } from '../../team/types';
import { DaySchedule } from '../../appointments/types';
import { PublicTeamMember } from '../types';
import { format } from 'date-fns';
import api from '../../../services/api';

interface DateTimeSelectionProps {
  serviceId: string;
  serviceDuration?: number;
  publicTeamMembers?: PublicTeamMember[];
  selectedDate?: string;
  selectedTime?: string;
  stylistId?: string;
  showTeamSelection?: boolean;
  /** Salon slug: when given, slots already booked on the server are shown as taken */
  slug?: string;
  onSelect: (date: string, time: string, stylistId: string) => void;
}

type Busy = { date: string; startTime: string; endTime: string };
const toMin = (t: string) => { const [h, m] = t.split(':').map(Number); return h * 60 + (m || 0); };

const DateTimeSelection: React.FC<DateTimeSelectionProps> = ({
  serviceId,
  serviceDuration,
  publicTeamMembers,
  selectedDate,
  selectedTime,
  stylistId,
  showTeamSelection = true,
  slug,
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
  
  const defaultWorkingHours: TeamMember['workingHours'] = {
    monday: { isWorking: true, start: '09:00', end: '18:00', breaks: [{ start: '12:00', end: '13:00' }] },
    tuesday: { isWorking: true, start: '09:00', end: '18:00', breaks: [{ start: '12:00', end: '13:00' }] },
    wednesday: { isWorking: true, start: '09:00', end: '18:00', breaks: [{ start: '12:00', end: '13:00' }] },
    thursday: { isWorking: true, start: '09:00', end: '18:00', breaks: [{ start: '12:00', end: '13:00' }] },
    friday: { isWorking: true, start: '09:00', end: '18:00', breaks: [{ start: '12:00', end: '13:00' }] },
    saturday: { isWorking: true, start: '09:00', end: '18:00', breaks: [{ start: '12:00', end: '13:00' }] },
    sunday: { isWorking: false }
  };

  const useStylists = () => {
    const members = useTeamStore(state => state.members);
    const profile = useProfileStore(state => state.profile);
    const user = useAuthStore(state => state.user);

    return React.useMemo(() => {
      const teamStylists = members.filter(member =>
        member.isActive &&
        (member.role === 'Coiffeur(se)' || member.role === 'Coloriste')
      );

      const ownerAlreadyInTeam = teamStylists.some(member => member.email === user?.email);

      if (!ownerAlreadyInTeam && profile.showAsTeamMember) {
        const ownerAsStylist: TeamMember = {
          id: 'owner-' + (user?.id || 'default'),
          firstName: profile.firstName || 'Propriétaire',
          lastName: profile.lastName || '',
          email: user?.email || '',
          phone: '',
          role: 'Propriétaire',
          specialties: [],
          workingHours: defaultWorkingHours,
          isActive: true,
          color: colors.primary,
        };
        return [ownerAsStylist, ...teamStylists];
      }

      // Admin stylists available — use them
      if (teamStylists.length > 0) return teamStylists;

      // No admin stylists: fall back to public team members
      if (publicTeamMembers && publicTeamMembers.length > 0) {
        return publicTeamMembers.map(m => ({
          id: m._id,
          firstName: m.firstName || '',
          lastName: m.lastName || '',
          email: '',
          phone: '',
          role: m.role || '',
          specialties: m.specialties || [],
          workingHours: (m.workingHours as TeamMember['workingHours']) ?? defaultWorkingHours,
          isActive: true,
          color: m.color || colors.primary,
          avatar: m.avatar,
        } as TeamMember));
      }

      // Last resort: synthetic stylist so slot loading always works
      return [{
        id: 'stylist-any',
        firstName: profile.firstName || 'Le salon',
        lastName: '',
        email: '',
        phone: '',
        role: 'Propriétaire',
        specialties: [],
        workingHours: defaultWorkingHours,
        isActive: true,
        color: colors.primary,
      } as TeamMember];
    }, [members, profile, user]);
    // NOTE: publicTeamMembers intentionally excluded from deps — it's stable after
    // initial load and including it causes useMemo to recreate stylists on every
    // parent re-render, destabilizing effectiveStylistId.
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
  const [isInitialized, setIsInitialized] = useState(false);
  const slotsRef = useRef<HTMLElement>(null);
  const stylistChanged = useRef(false);
  const [calendarSelectedDate, setCalendarSelectedDate] = useState<Date | undefined>(
    selectedDate ? new Date(`${selectedDate}T00:00`) : undefined
  );

  useEffect(() => {
    if (!showTeamSelection && stylists.length > 0 && !selectedStylistId && !isInitialized) {
      setSelectedStylistId(stylists[0].id);
      setIsInitialized(true);
    }
  }, [showTeamSelection, stylists, selectedStylistId, isInitialized]);

  // Server-side bookings of this stylist (the local store is empty on the public page)
  const [busy, setBusy] = useState<Busy[] | null>(slug ? null : []);
  useEffect(() => {
    if (!slug || !effectiveStylistId) return;
    let alive = true;
    setBusy(null);
    api.get<Busy[]>(`/public/busy/${slug}`, { params: { stylistId: effectiveStylistId } })
      .then((r) => alive && setBusy(r.data))
      .catch(() => alive && setBusy([])); // server still rejects conflicts on submit
    return () => { alive = false; };
  }, [slug, effectiveStylistId]);

  const loadAvailableSlots = React.useCallback(async () => {
    if (!effectiveStylistId || !service || !busy) return;

    setIsLoadingSlots(true);
    try {
      // Use getState() to avoid adding getDaySchedule as a reactive dependency.
      // getDaySchedule internally calls cleanupExpiredPreBookings() which calls set(),
      // which would trigger re-renders and cause an infinite loop if used via hook.
      const { getDaySchedule } = useAppointmentStore.getState();
      const newSlots: Record<string, DaySchedule> = {};
      const nowTime = format(new Date(), 'HH:mm');

      // Charger les créneaux pour les 6 prochains mois (180 jours)
      for (let i = 0; i < 180; i++) {
        const date = new Date();
        date.setDate(date.getDate() + i);
        const formattedDate = format(date, 'yyyy-MM-dd');

        const schedule = getDaySchedule(formattedDate, effectiveStylistId);
        const busyToday = busy.filter((b) => b.date === formattedDate);

        const filteredTimeSlots = schedule.timeSlots.map((slot, index, slots) => {
          if (!slot.available) return slot;
          // Today: times already past cannot be booked
          if (i === 0 && slot.startTime <= nowTime) return { ...slot, available: false };

          const slotsNeeded = Math.ceil(service.duration / 15);

          let canBook = true;
          for (let j = 0; j < slotsNeeded; j++) {
            if (!slots[index + j] || !slots[index + j].available) {
              canBook = false;
              break;
            }
          }

          const start = toMin(slot.startTime);
          if (canBook && busyToday.some((b) => start < toMin(b.endTime) && start + service.duration > toMin(b.startTime))) {
            canBook = false;
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
  }, [effectiveStylistId, service, busy]);

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
  // (skipped on mount so a date picked earlier survives going back a step)
  useEffect(() => {
    if (!stylistChanged.current) { stylistChanged.current = true; return; }
    setInternalSelectedDate(undefined);
    setCalendarSelectedDate(undefined);
  }, [selectedStylistId]);

  useEffect(() => {
    // Ignore our own echo: "any stylist" resolves to effectiveStylistId when a slot is picked
    if (stylistId && stylistId !== selectedStylistId && !(selectedStylistId === '' && stylistId === effectiveStylistId)) {
      setSelectedStylistId(stylistId);
    }
  }, [stylistId]);


  if (!service) {
    return <p className="bk-muted text-sm py-6 text-center">{t('booking.flow.service_not_found')}</p>;
  }

  if (showTeamSelection && stylists.length === 0) {
    return <p className="bk-muted text-sm py-6 text-center">{t('booking.flow.no_stylist')}</p>;
  }

  const daySlots = internalSelectedDate ? availableSlots[internalSelectedDate]?.timeSlots ?? [] : [];

  return (
    <div className="space-y-6">
      {showTeamSelection && stylists.length > 0 && (
        <section>
          <h3 className="bk-label">{t('booking.flow.with_who')}</h3>
          <div className="bk-scroll-x">
            <button type="button" className="bk-chip" aria-pressed={!selectedStylistId} onClick={() => setSelectedStylistId('')}>
              <span className="bk-avatar"><UserGroupIcon className="h-4 w-4" /></span>
              {t('booking.flow.any_stylist')}
            </button>
            {stylists.map((member: TeamMember) => (
              <button
                key={member.id}
                type="button"
                className="bk-chip"
                aria-pressed={selectedStylistId === member.id}
                onClick={() => setSelectedStylistId(member.id)}
              >
                <span className="bk-avatar">
                  {member.avatar
                    ? <img src={member.avatar} alt="" className="h-full w-full object-cover" />
                    : `${(member.firstName || '?')[0]}${(member.lastName || '')[0] || ''}`.toUpperCase()}
                </span>
                {member.firstName}
              </button>
            ))}
          </div>
        </section>
      )}

      {effectiveStylistId && (
        <section>
          <h3 className="bk-label">{t('booking.flow.choose_date')}</h3>
          <ModernCalendar
            selectedDate={calendarSelectedDate}
            onSelectDate={(date) => {
              const formattedDate = format(date, 'yyyy-MM-dd');
              if (availableSlots[formattedDate]?.timeSlots.some(slot => slot.available)) {
                setCalendarSelectedDate(date);
                setInternalSelectedDate(formattedDate);
                requestAnimationFrame(() => slotsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }));
              }
            }}
            availableDates={availableDatesForCalendar}
            minDate={new Date()}
            maxDate={new Date(new Date().setFullYear(new Date().getFullYear() + 1))}
            locale={i18n.language}
          />
        </section>
      )}

      {internalSelectedDate && effectiveStylistId && (
        <section ref={slotsRef} className="scroll-mt-4">
          <h3 className="bk-label first-letter:uppercase">
            {format(new Date(`${internalSelectedDate}T00:00`), 'EEEE d MMMM', { locale: dateLocale(i18n.language) })}
          </h3>
          {isLoadingSlots && daySlots.length === 0 ? (
            <div className="flex justify-center py-8 bk-muted"><span className="bk-spinner" /></div>
          ) : daySlots.length === 0 ? (
            <div className="py-6 text-center">
              <p className="text-sm font-medium">{t('booking.flow.no_slots_available')}</p>
              <p className="bk-muted text-sm mt-1">{t('booking.flow.choose_another_date')}</p>
            </div>
          ) : (
            <div className="bk-slots">
              {daySlots.map((slot) => (
                <button
                  key={slot.startTime}
                  type="button"
                  disabled={!slot.available}
                  aria-pressed={slot.startTime === selectedTime && internalSelectedDate === selectedDate}
                  onClick={() => onSelect(internalSelectedDate, slot.startTime, effectiveStylistId)}
                  className="bk-slot"
                >
                  {slot.startTime}
                </button>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
};

export default DateTimeSelection;
