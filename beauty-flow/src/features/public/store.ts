import { create } from 'zustand';
import { BookingData, BookingStep, BookingError } from './types';
import { useClientStore } from '../clients/store';
import { Client, ClientFormData } from '../clients/types';
import { v4 as uuidv4 } from 'uuid';
import { publicAPI } from '../../services/api';
import i18n from 'i18next';

interface PublicBookingStore {
  // État
  isOpen: boolean;
  currentStep: BookingStep;
  bookingData: BookingData;
  error: BookingError | null;
  isLoading: boolean;
  showConfirmation: boolean;
  lastBookingInfo: {
    date: string;
    time: string;
    modificationLink: string;
    stylistName?: string;
  } | null;
  
  // Actions
  openBooking: (serviceId: string) => void;
  closeBooking: () => void;
  setStep: (step: BookingStep) => void;
  updateBookingData: (data: Partial<BookingData>) => void;
  setError: (error: BookingError | null) => void;
  resetBooking: () => void;
  setLoading: (isLoading: boolean) => void;
  validateCurrentStep: () => boolean;
  submitBooking: () => Promise<void>;
  closeConfirmation: () => void;
}

const initialBookingData: BookingData = {
  serviceId: '',
  stylistId: '',
  date: '',
  startTime: '',
  clientData: {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    preferences: {
      communicationPreferences: {
        smsReminders: true,
        emailMarketing: false,
        birthdayOffers: false
      },
      servicePreferences: {
        preferredDays: [],
        preferredTimes: []
      }
    }
  },
};

const createInitialBookingData = (serviceId: string): BookingData => ({
  ...initialBookingData,
  serviceId,
});

export const usePublicBookingStore = create<PublicBookingStore>((set, get) => ({
  // État initial
  isOpen: false,
  currentStep: 'service',
  bookingData: initialBookingData,
  error: null,
  isLoading: false,
  showConfirmation: false,
  lastBookingInfo: null,

  // Actions
  openBooking: (serviceId: string) => set({
    isOpen: true,
    currentStep: 'datetime',
    bookingData: createInitialBookingData(serviceId),
    error: null,
    isLoading: false,
    showConfirmation: false,
    lastBookingInfo: null,
  }),

  closeBooking: () => set({
    isOpen: false,
    currentStep: 'service',
    bookingData: initialBookingData,
    error: null,
  }),

  setStep: (step: BookingStep) => {
    const state = get();
    // Ne valider que si on avance dans le processus
    if (step === 'client' && state.currentStep === 'datetime') {
      if (!state.validateCurrentStep()) return;
    }
    set({ 
      currentStep: step, 
      error: null,
      isLoading: false 
    });
  },

  updateBookingData: (data: Partial<BookingData>) => {
    set((state) => {
      const newBookingData = { ...state.bookingData };
      
      if (data.clientData) {
        newBookingData.clientData = {
          ...newBookingData.clientData,
          ...data.clientData,
        };
      } else {
        Object.assign(newBookingData, data);
      }

      return {
        bookingData: newBookingData,
        error: null,
      };
    });
  },

  setError: (error: BookingError | null) => set({ error }),

  setLoading: (isLoading: boolean) => set({ isLoading }),

  resetBooking: () => set({
    currentStep: 'service',
    bookingData: initialBookingData,
    error: null,
    showConfirmation: false,
    lastBookingInfo: null,
  }),

  validateCurrentStep: () => {
    const state = get();
    const { currentStep, bookingData } = state;

    switch (currentStep) {
      case 'datetime':
        // stylistId is optional — if showTeamOnPublicPage is false the client doesn't pick one
        if (!bookingData.date || !bookingData.startTime) {
          state.setError({ step: 'datetime', message: i18n.t('errors:booking.select_datetime') });
          return false;
        }

        // Availability itself is decided (and re-checked under a lock) by the server on submit
        return true;

      case 'client':
        // La validation du formulaire client est gérée par le composant PublicClientForm
        return true;

      default:
        return true;
    }
  },

  submitBooking: async () => {
    const state = get();
    const { bookingData } = state;
    
    try {
      // Récupérer le slug depuis l'URL actuelle
      const currentPath = window.location.pathname;
      const slug = currentPath.split('/').pop(); // Récupère le dernier segment de l'URL
      
      if (!slug) {
        throw new Error(i18n.t('errors:booking.no_salon'));
      }

      console.log('🚀 Soumission de la réservation pour le salon:', slug);
      console.log('📋 Données de réservation:', {
        serviceId: bookingData.serviceId,
        stylistId: bookingData.stylistId,
        date: bookingData.date,
        startTime: bookingData.startTime,
        clientData: { ...bookingData.clientData, phone: '***' } // Masquer le téléphone dans les logs
      });

      // Sanitize optional fields — strip falsy values so backend optional() validators
      // don't reject empty strings (e.g. birthDate: '' would fail isISO8601())
      const { birthDate, address, notes, ...requiredClientData } = bookingData.clientData as any;
      const clientData: any = { ...requiredClientData };
      if (birthDate) clientData.birthDate = birthDate;
      if (address) clientData.address = address;

      // Utiliser l'API service au lieu du fetch direct
      const response = await publicAPI.createBooking(slug, {
        serviceId: bookingData.serviceId,
        stylistId: bookingData.stylistId,
        date: bookingData.date,
        startTime: bookingData.startTime,
        clientData,
        ...(notes?.trim() ? { notes: notes.trim() } : {}),
      });

      console.log('✅ Réponse de l\'API:', response.data);
      
      // Confirmation shows who got the appointment (assigned by the server after "peu importe")
      set({
        showConfirmation: true,
        lastBookingInfo: {
          date: bookingData.date,
          time: bookingData.startTime,
          modificationLink: response.data.appointment.modificationToken,
          stylistName: response.data.appointment.stylistName || undefined,
        },
      });

    } catch (error: any) {
      console.error('❌ Erreur lors de la soumission:', error);
      console.error('❌ Réponse backend:', error.response?.data);

      // Gestion d'erreur améliorée
      let errorMessage = i18n.t('errors:booking.error');

      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.data?.errors?.length) {
        // Validation errors array from express-validator
        const firstError = error.response.data.errors[0];
        errorMessage = firstError.msg || firstError.message || errorMessage;
        console.error('❌ Erreurs de validation:', error.response.data.errors);
      } else if (error.message) {
        errorMessage = error.message;
      }

      // code (SLOT_TAKEN, OUTSIDE_HOURS, …) lets the flow translate and send the client back to the slots
      throw Object.assign(new Error(errorMessage), { code: error.response?.data?.code });
    }
  },

  closeConfirmation: () => set({
    showConfirmation: false,
    lastBookingInfo: null,
  }),
}));
