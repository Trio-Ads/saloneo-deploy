import { create } from 'zustand';
import { BookingData, BookingStep, BookingError } from './types';
import { useAppointmentStore } from '../appointments/store';
import { useClientStore } from '../clients/store';
import { useServiceStore } from '../services/store';
import { Client, ClientFormData } from '../clients/types';
import { v4 as uuidv4 } from 'uuid';
import { addMinutes, format } from 'date-fns';
import { publicAPI } from '../../services/api';

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
        if (!bookingData.stylistId) {
          state.setError({ step: 'datetime', message: "Veuillez sélectionner un coiffeur" });
          return false;
        }
        if (!bookingData.date || !bookingData.startTime) {
          state.setError({ step: 'datetime', message: "Veuillez sélectionner une date et une heure" });
          return false;
        }

        // Vérifier la disponibilité du créneau
        const service = useServiceStore.getState().services.find(s => s.id === bookingData.serviceId);
        if (!service) {
          state.setError({ step: 'datetime', message: "Service non trouvé" });
          return false;
        }

        const endTime = format(
          addMinutes(
            new Date(`2000-01-01 ${bookingData.startTime}`),
            service.duration
          ),
          'HH:mm'
        );

        const isAvailable = useAppointmentStore.getState().isSlotAvailable({
          date: bookingData.date,
          startTime: bookingData.startTime,
          endTime,
          stylistId: bookingData.stylistId,
        });

        if (!isAvailable) {
          state.setError({ step: 'datetime', message: "Ce créneau n'est plus disponible" });
          return false;
        }

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
        throw new Error("Impossible de déterminer le salon");
      }

      console.log('🚀 Soumission de la réservation pour le salon:', slug);
      console.log('📋 Données de réservation:', {
        serviceId: bookingData.serviceId,
        stylistId: bookingData.stylistId,
        date: bookingData.date,
        startTime: bookingData.startTime,
        clientData: { ...bookingData.clientData, phone: '***' } // Masquer le téléphone dans les logs
      });

      // Utiliser l'API service au lieu du fetch direct
      const response = await publicAPI.createBooking(slug, {
        serviceId: bookingData.serviceId,
        stylistId: bookingData.stylistId,
        date: bookingData.date,
        startTime: bookingData.startTime,
        clientData: bookingData.clientData,
        notes: bookingData.clientData.notes || '',
      });

      console.log('✅ Réponse de l\'API:', response.data);
      
      // Mettre à jour l'état avec les informations de confirmation
      set({
        showConfirmation: true,
        lastBookingInfo: {
          date: bookingData.date,
          time: bookingData.startTime,
          modificationLink: response.data.appointment.modificationToken,
        },
      });

    } catch (error: any) {
      console.error('❌ Erreur lors de la soumission:', error);
      
      // Gestion d'erreur améliorée
      let errorMessage = 'Erreur lors de la création du rendez-vous';
      
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      throw new Error(errorMessage);
    }
  },

  closeConfirmation: () => set({
    showConfirmation: false,
    lastBookingInfo: null,
  }),
}));
