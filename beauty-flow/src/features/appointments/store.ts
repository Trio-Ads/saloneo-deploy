import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { addMinutes, format, parse, isWithinInterval, differenceInHours } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  Appointment, 
  AppointmentFormData, 
  TimeSlot, 
  DaySchedule, 
  AppointmentStatus,
  AppointmentModification,
  PublicAppointmentAccess,
  CancellationPolicy,
  ClientSearchInfo,
  AppointmentSettings,
  AppointmentHistoryFilters,
  ClientHistory,
  AppointmentStats
} from './types';
import { appointmentsAPI } from '../../services/api';

interface PreBooking {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  stylistId: string;
  timestamp: string;
}

interface AppointmentStore {
  appointments: Appointment[];
  preBookings: PreBooking[];
  modifications: AppointmentModification[];
  publicAccess: PublicAppointmentAccess[];
  cancellationPolicy: CancellationPolicy;
  appointmentSettings: AppointmentSettings;
  isLoading: boolean;
  error: string | null;
  // API functions
  loadAppointments: () => Promise<void>;
  syncWithBackend: () => Promise<void>;
  clearLocalData: () => void;
  addAppointment: (appointmentData: AppointmentFormData) => Promise<{ appointment: Appointment; publicToken: string; modificationToken: string }>;
  updateAppointment: (id: string, appointmentData: Partial<AppointmentFormData>) => void;
  cancelAppointment: (id: string, reason?: string) => void;
  completeAppointment: (id: string) => void;
  markAsNoShow: (id: string) => void;
  confirmAppointment: (id: string) => void;
  addPreBooking: (bookingData: Omit<PreBooking, 'id' | 'timestamp'>) => string;
  removePreBooking: (id: string) => void;
  cleanupExpiredPreBookings: () => void;
  generateTimeSlots: () => TimeSlot[];
  isSlotAvailable: (params: { date: string; startTime: string; endTime: string; stylistId: string }) => boolean;
  getDaySchedule: (date: string, stylistId: string) => DaySchedule;
  // Public management functions
  getAppointmentByPublicToken: (token: string) => Appointment | undefined;
  getAppointmentsByClientInfo: (clientInfo: ClientSearchInfo) => Promise<Appointment[]>;
  modifyAppointment: (modificationToken: string, changes: Partial<AppointmentFormData>) => Promise<Appointment>;
  cancelAppointmentPublic: (modificationToken: string, reason: string) => Promise<Appointment>;
  validateModificationToken: (token: string) => boolean;
  canModifyAppointment: (appointmentId: string) => boolean;
  // Past appointments functions
  isPastAppointment: (appointment: Appointment) => boolean;
  getPastAppointments: () => Appointment[];
  processPastAppointments: (action: 'noShow' | 'completed') => Promise<number>;
  // History and stats functions
  getAppointmentHistory: (filters?: AppointmentHistoryFilters) => Appointment[];
  getClientStats: (clientId: string) => ClientHistory;
  // Settings update function
  updateAppointmentSettings: (settings: Partial<AppointmentSettings>) => void;
  // Overlap check function
  hasOverlap: (appointment1: Appointment, appointment2: Appointment) => boolean;
}

// Business hours configuration
const BUSINESS_HOURS = {
  start: '09:00',
  end: '19:00',
  slotDuration: 15, // in minutes
};

const PRE_BOOKING_EXPIRY = 15 * 60 * 1000; // 15 minutes in milliseconds

// Default cancellation policy configuration
const DEFAULT_CANCELLATION_POLICY: CancellationPolicy = {
  minHoursBeforeAppointment: 24,
  maxReschedulesAllowed: 2,
  cancellationFee: 0
};

export const useAppointmentStore = create<AppointmentStore>()((set, get) => ({
  appointments: [],
  preBookings: [],
  modifications: [],
  publicAccess: [],
  cancellationPolicy: DEFAULT_CANCELLATION_POLICY,
  appointmentSettings: {
    bufferTimeBetweenAppointments: 0
  },
  isLoading: false,
  error: null,

  // Check if an appointment is past
  isPastAppointment: (appointment: Appointment) => {
    if (!appointment || !appointment.date || typeof appointment.date !== 'string') {
      console.warn('⚠️ Invalid appointment or missing date:', appointment);
      return false;
    }

    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      let appointmentDate: Date;
      
      if (appointment.date.includes('T')) {
        appointmentDate = new Date(appointment.date);
      } else {
        const [year, month, day] = appointment.date.split('-').map(Number);
        
        if (isNaN(year) || isNaN(month) || isNaN(day)) {
          console.warn('⚠️ Invalid date in appointment:', appointment.date);
          return false;
        }
        
        appointmentDate = new Date(year, month - 1, day);
      }
      
      if (isNaN(appointmentDate.getTime())) {
        console.warn('⚠️ Invalid date created:', appointmentDate);
        return false;
      }
      
      appointmentDate.setHours(0, 0, 0, 0);
      
      return appointmentDate < today;
    } catch (error) {
      console.error('❌ Error in isPastAppointment:', error, appointment);
      return false;
    }
  },
  
  // Get all past appointments with scheduled or confirmed status
  getPastAppointments: () => {
    const appointments = get().appointments;
    
    if (!Array.isArray(appointments)) {
      console.warn('⚠️ Appointments data is not an array in getPastAppointments:', appointments);
      return [];
    }
    
    return appointments.filter(appointment => 
      get().isPastAppointment(appointment) && 
      (appointment.status === 'scheduled' || appointment.status === 'confirmed')
    );
  },
  
  // Process all past appointments
  processPastAppointments: async (action: 'noShow' | 'completed') => {
    const pastAppointments = get().getPastAppointments();
    
    if (pastAppointments.length === 0) {
      return 0;
    }
    
    console.log('🔄 Traitement des rendez-vous passés:', {
      count: pastAppointments.length,
      action,
      appointments: pastAppointments.map(apt => ({ id: apt.id, date: apt.date, status: apt.status }))
    });
    
    try {
      // Mettre à jour chaque rendez-vous passé dans le backend
      const updatePromises = pastAppointments.map(appointment => {
        console.log('📤 Mise à jour rendez-vous:', { id: appointment.id, action });
        return appointmentsAPI.updateStatus(appointment.id, action);
      });
      
      await Promise.all(updatePromises);
      
      // Mettre à jour le state local après succès backend
      set((state) => ({
        appointments: state.appointments.map((appointment) => {
          if (get().isPastAppointment(appointment) && 
              (appointment.status === 'scheduled' || appointment.status === 'confirmed')) {
            return { 
              ...appointment, 
              status: action,
              lastModified: new Date().toISOString()
            };
          }
          return appointment;
        }),
      }));
      
      return pastAppointments.length;
    } catch (error) {
      console.error('Erreur lors du traitement des rendez-vous passés:', error);
      set({ error: 'Erreur lors du traitement des rendez-vous passés' });
      return 0;
    }
  },

  getAppointmentsByClientInfo: async (clientInfo: ClientSearchInfo) => {
    const { appointments } = get();
    return appointments.filter(appointment => {
      if (!appointment.clientInfo) return false;
      
      return (
        appointment.clientInfo.firstName.toLowerCase() === clientInfo.firstName.toLowerCase() &&
        appointment.clientInfo.lastName.toLowerCase() === clientInfo.lastName.toLowerCase() &&
        appointment.clientInfo.phone === clientInfo.phone
      );
    });
  },

  // API functions
  loadAppointments: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await appointmentsAPI.getAll();
      
      let appointmentsData = [];
      if (response.data && typeof response.data === 'object') {
        if (Array.isArray(response.data)) {
          appointmentsData = response.data;
        } else if (response.data.appointments && Array.isArray(response.data.appointments)) {
          appointmentsData = response.data.appointments;
        } else {
          console.warn('⚠️ Appointments data is not an array:', response.data);
          appointmentsData = [];
        }
      }
      
      // Normaliser les IDs pour s'assurer qu'ils sont corrects
      const normalizedAppointments = appointmentsData.map((appointment: any) => ({
        ...appointment,
        id: appointment._id || appointment.id, // Utiliser _id de MongoDB si disponible
      }));
      
      console.log('📋 Rendez-vous chargés:', normalizedAppointments.length);
      console.log('🔍 Premier rendez-vous:', normalizedAppointments[0]);
      
      set({ 
        appointments: normalizedAppointments,
        isLoading: false 
      });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Erreur lors du chargement des rendez-vous',
        isLoading: false 
      });
    }
  },

  syncWithBackend: async () => {
    try {
      await get().loadAppointments();
    } catch (error) {
      console.error('Erreur lors de la synchronisation:', error);
    }
  },

  clearLocalData: () => {
    set({
      appointments: [],
      preBookings: [],
      modifications: [],
      publicAccess: [],
      error: null
    });
  },

  addAppointment: async (appointmentData: AppointmentFormData) => {
    set({ isLoading: true, error: null });
    
    try {
      const apiData = {
        clientId: appointmentData.clientId,
        serviceId: appointmentData.serviceId,
        teamMemberId: appointmentData.stylistId,
        date: appointmentData.date,
        startTime: appointmentData.startTime,
        notes: appointmentData.notes || ''
      };
      
      console.log('🔍 Données envoyées à l\'API:', apiData);
      
      const response = await appointmentsAPI.create(apiData);
      const newAppointment = response.data;

      await get().loadAppointments();

      set({ isLoading: false });

      return { 
        appointment: newAppointment, 
        publicToken: newAppointment.publicToken, 
        modificationToken: newAppointment.modificationToken 
      };
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Erreur lors de la création du rendez-vous',
        isLoading: false 
      });
      throw error;
    }
  },

  updateAppointment: (id: string, appointmentData: Partial<AppointmentFormData>) => {
    set((state) => {
      const appointments = state.appointments.map((appointment) => {
        if (appointment.id !== id) return appointment;

        let endTime = appointment.endTime;
        if (appointmentData.startTime || appointmentData.serviceDuration) {
          const startTime = parse(
            appointmentData.startTime || appointment.startTime,
            'HH:mm',
            new Date()
          );
          const duration = appointmentData.serviceDuration || 
            (parse(appointment.endTime, 'HH:mm', new Date()).getTime() - 
             parse(appointment.startTime, 'HH:mm', new Date()).getTime()) / 60000;
          
          endTime = format(addMinutes(startTime, duration), 'HH:mm');
        }

        return {
          ...appointment,
          ...appointmentData,
          endTime,
          lastModified: new Date().toISOString(),
          status: appointment.status === 'scheduled' ? 'rescheduled' : appointment.status
        };
      });

      return { appointments };
    });
  },

  cancelAppointment: async (id: string, reason?: string) => {
    try {
      await appointmentsAPI.updateStatus(id, 'cancelled');
      set((state) => ({
        appointments: state.appointments.map((appointment) =>
          appointment.id === id
            ? { 
                ...appointment, 
                status: 'cancelled', 
                cancellationReason: reason,
                lastModified: new Date().toISOString()
              }
            : appointment
        ),
      }));
    } catch (error) {
      console.error('Erreur lors de l\'annulation du rendez-vous:', error);
      set({ error: 'Erreur lors de l\'annulation du rendez-vous' });
    }
  },

  completeAppointment: async (id: string) => {
    try {
      await appointmentsAPI.updateStatus(id, 'completed');
      set((state) => ({
        appointments: state.appointments.map((appointment) =>
          appointment.id === id
            ? { ...appointment, status: 'completed' }
            : appointment
        ),
      }));
    } catch (error) {
      console.error('Erreur lors de la finalisation du rendez-vous:', error);
      set({ error: 'Erreur lors de la finalisation du rendez-vous' });
    }
  },

  markAsNoShow: async (id: string) => {
    try {
      await appointmentsAPI.updateStatus(id, 'noShow');
      set((state) => ({
        appointments: state.appointments.map((appointment) =>
          appointment.id === id
            ? { ...appointment, status: 'noShow' }
            : appointment
        ),
      }));
    } catch (error) {
      console.error('Erreur lors du marquage comme non présenté:', error);
      set({ error: 'Erreur lors du marquage comme non présenté' });
    }
  },

  confirmAppointment: async (id: string) => {
    try {
      await appointmentsAPI.updateStatus(id, 'confirmed');
      set((state) => ({
        appointments: state.appointments.map((appointment) =>
          appointment.id === id && appointment.status === 'scheduled'
            ? { ...appointment, status: 'confirmed' }
            : appointment
        ),
      }));
    } catch (error) {
      console.error('Erreur lors de la confirmation du rendez-vous:', error);
      set({ error: 'Erreur lors de la confirmation du rendez-vous' });
    }
  },

  addPreBooking: (bookingData: Omit<PreBooking, 'id' | 'timestamp'>) => {
    const id = uuidv4();
    set((state) => ({
      preBookings: [
        ...state.preBookings,
        {
          ...bookingData,
          id,
          timestamp: new Date().toISOString(),
        },
      ],
    }));
    return id;
  },

  removePreBooking: (id: string) => {
    set((state) => ({
      preBookings: state.preBookings.filter((booking) => booking.id !== id),
    }));
  },

  cleanupExpiredPreBookings: () => {
    const now = new Date().getTime();
    set((state) => ({
      preBookings: state.preBookings.filter((booking) => {
        const bookingTime = new Date(booking.timestamp).getTime();
        return now - bookingTime < PRE_BOOKING_EXPIRY;
      }),
    }));
  },

  generateTimeSlots: () => {
    const slots: TimeSlot[] = [];
    const startTime = parse(BUSINESS_HOURS.start, 'HH:mm', new Date());
    const endTime = parse(BUSINESS_HOURS.end, 'HH:mm', new Date());
    let currentTime = startTime;

    while (currentTime < endTime) {
      const nextTime = addMinutes(currentTime, BUSINESS_HOURS.slotDuration);
      slots.push({
        startTime: format(currentTime, 'HH:mm'),
        endTime: format(nextTime, 'HH:mm'),
        available: true,
      });
      currentTime = nextTime;
    }

    return slots;
  },

  isSlotAvailable: ({ date, startTime, endTime, stylistId }: { date: string; startTime: string; endTime: string; stylistId: string }) => {
    const state = get();
    state.cleanupExpiredPreBookings();

    const stylistAppointments = state.appointments.filter(
      (appointment) =>
        appointment.date === date &&
        appointment.stylistId === stylistId &&
        (appointment.status === 'scheduled' || 
         appointment.status === 'confirmed' ||
         appointment.status === 'rescheduled')
    );

    const bufferTime = state.appointmentSettings.bufferTimeBetweenAppointments;
    const slotStart = parse(startTime, 'HH:mm', new Date());
    const slotEnd = parse(endTime, 'HH:mm', new Date());
    const slotStartWithBuffer = addMinutes(slotStart, -bufferTime);
    const slotEndWithBuffer = addMinutes(slotEnd, bufferTime);

    const hasPreBookingConflict = state.preBookings.some((booking) => {
      if (booking.date !== date || booking.stylistId !== stylistId) return false;

      const bookingStart = parse(booking.startTime, 'HH:mm', new Date());
      const bookingEnd = parse(booking.endTime, 'HH:mm', new Date());

      return (
        isWithinInterval(slotStart, {
          start: bookingStart,
          end: bookingEnd,
        }) ||
        isWithinInterval(slotEnd, {
          start: bookingStart,
          end: bookingEnd,
        })
      );
    });

    if (hasPreBookingConflict) return false;

    const hasAppointmentConflict = stylistAppointments.some((appointment) => {
      if (appointment.modificationToken && 
          appointment.modificationToken === get().appointments.find(
            a => a.startTime === startTime && a.date === date
          )?.modificationToken) {
        return false;
      }

      const appointmentStart = parse(appointment.startTime, 'HH:mm', new Date());
      const appointmentEnd = parse(appointment.endTime, 'HH:mm', new Date());

      const hasOverlap = (
        (slotStartWithBuffer <= appointmentEnd && slotEndWithBuffer > appointmentStart) ||
        (appointmentStart <= slotEndWithBuffer && appointmentEnd > slotStartWithBuffer)
      );

      return hasOverlap;
    });

    return !hasAppointmentConflict;
  },

  getDaySchedule: (date: string, stylistId: string) => {
    const state = get();
    state.cleanupExpiredPreBookings();

    const slots = state.generateTimeSlots();
    const appointments = state.appointments.filter(
      (appointment) =>
        appointment.date === date &&
        appointment.stylistId === stylistId &&
        (appointment.status === 'scheduled' || 
         appointment.status === 'confirmed' ||
         appointment.status === 'rescheduled')
    );

    const preBookings = state.preBookings.filter(
      (booking) => booking.date === date && booking.stylistId === stylistId
    );

    const timeSlots = slots.map((slot) => {
      const isBookedByAppointment = appointments.some(
        (appointment) =>
          appointment.startTime <= slot.startTime &&
          appointment.endTime > slot.startTime
      );

      const isBookedByPreBooking = preBookings.some(
        (booking) =>
          booking.startTime <= slot.startTime &&
          booking.endTime > slot.startTime
      );

      return {
        ...slot,
        available: !isBookedByAppointment && !isBookedByPreBooking,
      };
    });

    return {
      date,
      timeSlots,
    };
  },

  // Public management functions
  getAppointmentByPublicToken: (token: string) => {
    return get().appointments.find(
      (appointment) => appointment.publicToken === token
    );
  },

  modifyAppointment: async (modificationToken: string, changes: Partial<AppointmentFormData>) => {
    const appointment = get().appointments.find(
      (a) => a.modificationToken === modificationToken
    );

    if (!appointment) {
      throw new Error("Rendez-vous non trouvé");
    }

    if (!get().canModifyAppointment(appointment.id)) {
      throw new Error("La modification n'est plus possible");
    }

    if (changes.date || changes.startTime) {
      const isAvailable = get().isSlotAvailable({
        date: changes.date || appointment.date,
        startTime: changes.startTime || appointment.startTime,
        endTime: appointment.endTime,
        stylistId: changes.stylistId || appointment.stylistId,
      });

      if (!isAvailable) {
        throw new Error("Ce créneau n'est pas disponible");
      }
    }

    const modification: AppointmentModification = {
      appointmentId: appointment.id,
      modificationToken,
      newDate: changes.date,
      newStartTime: changes.startTime,
      newStylistId: changes.stylistId,
      modifiedAt: new Date().toISOString()
    };

    set((state) => ({
      modifications: [...state.modifications, modification]
    }));

    get().updateAppointment(appointment.id, changes);

    const updatedAppointment = get().appointments.find((a) => a.id === appointment.id)!;
    return updatedAppointment;
  },

  cancelAppointmentPublic: async (modificationToken: string, reason: string) => {
    const appointment = get().appointments.find(
      (a) => a.modificationToken === modificationToken
    );

    if (!appointment) {
      throw new Error("Rendez-vous non trouvé");
    }

    if (!get().canModifyAppointment(appointment.id)) {
      throw new Error("L'annulation n'est plus possible");
    }

    get().cancelAppointment(appointment.id, reason);

    return get().appointments.find((a) => a.id === appointment.id)!;
  },

  validateModificationToken: (token: string) => {
    return get().appointments.some(
      (a) => a.modificationToken === token && 
             (a.status === 'scheduled' || a.status === 'confirmed' || a.status === 'rescheduled')
    );
  },

  canModifyAppointment: (appointmentId: string) => {
    const appointment = get().appointments.find((a) => a.id === appointmentId);
    if (!appointment) return false;

    if (!['scheduled', 'confirmed', 'rescheduled'].includes(appointment.status)) {
      return false;
    }

    const [year, month, day] = appointment.date.split('-').map(Number);
    const [hours, minutes] = appointment.startTime.split(':').map(Number);
    const appointmentDate = new Date(year, month - 1, day, hours, minutes);
    const hoursUntilAppointment = differenceInHours(appointmentDate, new Date());
    
    if (hoursUntilAppointment < get().cancellationPolicy.minHoursBeforeAppointment) {
      return false;
    }

    const modificationsCount = get().modifications.filter(
      (m) => m.appointmentId === appointmentId
    ).length;

    return modificationsCount < get().cancellationPolicy.maxReschedulesAllowed;
  },

  updateAppointmentSettings: (settings: Partial<AppointmentSettings>) => {
    set(state => ({
      appointmentSettings: {
        ...state.appointmentSettings,
        ...settings
      }
    }));
  },

  getAppointmentHistory: (filters?: AppointmentHistoryFilters) => {
    const { appointments } = get();
    let filteredAppointments = [...appointments];
    
    if (filters) {
      if (filters.startDate !== undefined) {
        filteredAppointments = filteredAppointments.filter(
          apt => apt.date >= filters.startDate!
        );
      }
      
      if (filters.endDate !== undefined) {
        filteredAppointments = filteredAppointments.filter(
          apt => apt.date <= filters.endDate!
        );
      }
      
      if (filters.clientId !== undefined) {
        filteredAppointments = filteredAppointments.filter(
          apt => apt.clientId === filters.clientId
        );
      }
      
      if (filters.stylistId !== undefined) {
        filteredAppointments = filteredAppointments.filter(
          apt => apt.stylistId === filters.stylistId
        );
      }
      
      if (filters.serviceId !== undefined) {
        filteredAppointments = filteredAppointments.filter(
          apt => apt.serviceId === filters.serviceId
        );
      }
      
      if (filters.status !== undefined && filters.status.length > 0) {
        filteredAppointments = filteredAppointments.filter(
          apt => filters.status!.includes(apt.status)
        );
      }
    }
    
    return filteredAppointments.sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.startTime}`);
      const dateB = new Date(`${b.date}T${b.startTime}`);
      return dateB.getTime() - dateA.getTime();
    });
  },

  getClientStats: (clientId: string): ClientHistory => {
    const { appointments } = get();
    const clientAppointments = appointments.filter(apt => apt.clientId === clientId);
    
    if (clientAppointments.length === 0) {
      return {
        clientId,
        stats: {
          totalAppointments: 0,
          completedAppointments: 0,
          cancelledAppointments: 0,
          noShowAppointments: 0,
          averageDuration: 0,
          mostBookedService: '',
          mostBookedStylist: '',
          busyDays: [],
          busyHours: []
        },
        lastAppointment: '',
        totalSpent: 0,
        loyaltyPoints: 0,
        visitFrequency: 0
      };
    }
    
    const completedAppointments = clientAppointments.filter(
      apt => apt.status === 'completed'
    );
    
    const cancelledAppointments = clientAppointments.filter(
      apt => apt.status === 'cancelled'
    );
    
    const noShowAppointments = clientAppointments.filter(
      apt => apt.status === 'noShow'
    );
    
    const durations = completedAppointments.map(apt => {
      const startTime = parse(apt.startTime, 'HH:mm', new Date());
      const endTime = parse(apt.endTime, 'HH:mm', new Date());
      return differenceInHours(endTime, startTime) * 60;
    });
    
    const averageDuration = durations.length > 0
      ? durations.reduce((sum, duration) => sum + duration, 0) / durations.length
      : 0;
    
    const serviceCount: Record<string, number> = {};
    clientAppointments.forEach(apt => {
      serviceCount[apt.serviceId] = (serviceCount[apt.serviceId] || 0) + 1;
    });
    
    const mostBookedService = Object.entries(serviceCount).sort(
      (a, b) => b[1] - a[1]
    )[0]?.[0] || '';
    
    const stylistCount: Record<string, number> = {};
    clientAppointments.forEach(apt => {
      stylistCount[apt.stylistId] = (stylistCount[apt.stylistId] || 0) + 1;
    });
    
    const mostBookedStylist = Object.entries(stylistCount).sort(
      (a, b) => b[1] - a[1]
    )[0]?.[0] || '';
    
    const dayCount: Record<string, number> = {};
    const hourCount: Record<string, number> = {};
    
    clientAppointments.forEach(apt => {
      const [year, month, day] = apt.date.split('-').map(Number);
      const date = new Date(year, month - 1, day);
      const dayName = format(date, 'EEEE', { locale: fr });
      const hour = apt.startTime.split(':')[0];
      
      dayCount[dayName] = (dayCount[dayName] || 0) + 1;
      hourCount[hour] = (hourCount[hour] || 0) + 1;
    });
    
    const busyDays = Object.entries(dayCount)
      .map(([day, count]) => ({ day, count: count as number }))
      .sort((a, b) => b.count - a.count);
    
    const busyHours = Object.entries(hourCount)
      .map(([hour, count]) => ({ hour, count: count as number }))
      .sort((a, b) => b.count - a.count);
    
    const sortedAppointments = [...clientAppointments].sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.startTime}`);
      const dateB = new Date(`${b.date}T${b.startTime}`);
      return dateB.getTime() - dateA.getTime();
    });
    
    const lastAppointment = sortedAppointments[0]?.date || '';
    
    let visitFrequency = 0;
    if (completedAppointments.length > 1) {
      const dates = completedAppointments
        .map(apt => {
          const [year, month, day] = apt.date.split('-').map(Number);
          return new Date(year, month - 1, day);
        })
        .sort((a, b) => a.getTime() - b.getTime());
      
      const intervals = [];
      for (let i = 1; i < dates.length; i++) {
        intervals.push(differenceInHours(dates[i], dates[i-1]) / 24);
      }
      
      visitFrequency = intervals.reduce((sum, days) => sum + days, 0) / intervals.length;
    }
    
    return {
      clientId,
      stats: {
        totalAppointments: clientAppointments.length,
        completedAppointments: completedAppointments.length,
        cancelledAppointments: cancelledAppointments.length,
        noShowAppointments: noShowAppointments.length,
        averageDuration,
        mostBookedService,
        mostBookedStylist,
        busyDays,
        busyHours
      },
      lastAppointment,
      totalSpent: 0,
      loyaltyPoints: 0,
      visitFrequency
    };
  },

  hasOverlap: (appointment1: Appointment, appointment2: Appointment) => {
    if (!['scheduled', 'confirmed', 'rescheduled'].includes(appointment1.status) ||
        !['scheduled', 'confirmed', 'rescheduled'].includes(appointment2.status)) {
      return false;
    }
    
    if (appointment1.date !== appointment2.date || 
        appointment1.stylistId !== appointment2.stylistId ||
        appointment1.id === appointment2.id) {
      return false;
    }
    
    const start1 = parse(`${appointment1.date}T${appointment1.startTime}`, "yyyy-MM-dd'T'HH:mm", new Date());
    const end1 = parse(`${appointment1.date}T${appointment1.endTime}`, "yyyy-MM-dd'T'HH:mm", new Date());
    const start2 = parse(`${appointment2.date}T${appointment2.startTime}`, "yyyy-MM-dd'T'HH:mm", new Date());
    const end2 = parse(`${appointment2.date}T${appointment2.endTime}`, "yyyy-MM-dd'T'HH:mm", new Date());
    
    return (
      (start1 < end2 && end1 > start2) ||
      (start2 < end1 && end2 > start1)
    );
  }
}));
