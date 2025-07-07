// @ts-nocheck
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { usePublicBookingStore } from '../store';
import { useAppointmentStore } from '../../appointments/store';
import { useClientStore } from '../../clients/store';
import { useServiceStore } from '../../services/store';

// Mock pour les stores dépendants
vi.mock('../../appointments/store', () => ({
  useAppointmentStore: {
    getState: vi.fn(() => ({
      isSlotAvailable: vi.fn(() => true),
      addAppointment: vi.fn(() => ({
        appointment: {
          id: 'appointment-1',
          clientId: 'client-1',
          serviceId: 'service-1',
          stylistId: 'stylist-1',
          date: '2024-06-10',
          startTime: '10:00',
          endTime: '11:00',
          status: 'scheduled'
        },
        publicToken: 'public-token',
        modificationToken: 'modification-token'
      }))
    }))
  }
}));

vi.mock('../../clients/store', () => ({
  useClientStore: {
    getState: vi.fn(() => ({
      findClientByInfo: vi.fn(() => null),
      addClient: vi.fn(() => ({ id: 'client-1' })),
      updateClient: vi.fn(),
      addLoyaltyPoints: vi.fn(),
      updateLastVisit: vi.fn()
    }))
  }
}));

vi.mock('../../services/store', () => ({
  useServiceStore: {
    getState: vi.fn(() => ({
      services: [
        {
          id: 'service-1',
          name: 'Coupe Femme',
          duration: 60,
          price: 45
        }
      ]
    }))
  }
}));

// Mock pour uuid
vi.mock('uuid', () => ({
  v4: vi.fn(() => 'test-uuid')
}));

describe('Public Booking Store', () => {
  let store;
  
  beforeEach(() => {
    // Réinitialiser les mocks
    vi.clearAllMocks();
    
    // Obtenir le store
    store = usePublicBookingStore.getState();
    
    // Réinitialiser l'état du store pour les tests
    store.isOpen = false;
    store.currentStep = 'service';
    store.bookingData = {
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
      }
    };
    store.error = null;
    store.isLoading = false;
    store.showConfirmation = false;
    store.lastBookingInfo = null;
  });

  it('should initialize with default values', () => {
    // Vérifier que le store est initialisé avec les valeurs par défaut
    expect(store.isOpen).toBe(false);
    expect(store.currentStep).toBe('service');
    expect(store.bookingData.serviceId).toBe('');
    expect(store.bookingData.stylistId).toBe('');
    expect(store.bookingData.date).toBe('');
    expect(store.bookingData.startTime).toBe('');
    expect(store.error).toBeNull();
    expect(store.isLoading).toBe(false);
    expect(store.showConfirmation).toBe(false);
    expect(store.lastBookingInfo).toBeNull();
  });

  it('should open booking with a service ID', () => {
    store.openBooking('service-1');
    
    // Vérifier que la réservation est ouverte
    expect(store.isOpen).toBe(true);
    expect(store.currentStep).toBe('datetime');
    expect(store.bookingData.serviceId).toBe('service-1');
    expect(store.error).toBeNull();
    expect(store.isLoading).toBe(false);
    expect(store.showConfirmation).toBe(false);
    expect(store.lastBookingInfo).toBeNull();
  });

  it('should close booking', () => {
    // D'abord ouvrir la réservation
    store.openBooking('service-1');
    
    // Puis la fermer
    store.closeBooking();
    
    // Vérifier que la réservation est fermée
    expect(store.isOpen).toBe(false);
    expect(store.currentStep).toBe('service');
    expect(store.bookingData.serviceId).toBe('');
    expect(store.error).toBeNull();
  });

  it('should update booking data', () => {
    // D'abord ouvrir la réservation
    store.openBooking('service-1');
    
    // Mettre à jour les données de réservation
    store.updateBookingData({
      stylistId: 'stylist-1',
      date: '2024-06-10',
      startTime: '10:00'
    });
    
    // Vérifier que les données ont été mises à jour
    expect(store.bookingData.serviceId).toBe('service-1');
    expect(store.bookingData.stylistId).toBe('stylist-1');
    expect(store.bookingData.date).toBe('2024-06-10');
    expect(store.bookingData.startTime).toBe('10:00');
    
    // Mettre à jour les données du client
    store.updateBookingData({
      clientData: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '0612345678'
      }
    });
    
    // Vérifier que les données du client ont été mises à jour
    expect(store.bookingData.clientData.firstName).toBe('John');
    expect(store.bookingData.clientData.lastName).toBe('Doe');
    expect(store.bookingData.clientData.email).toBe('john.doe@example.com');
    expect(store.bookingData.clientData.phone).toBe('0612345678');
    
    // Vérifier que les autres données n'ont pas été modifiées
    expect(store.bookingData.serviceId).toBe('service-1');
    expect(store.bookingData.stylistId).toBe('stylist-1');
    expect(store.bookingData.date).toBe('2024-06-10');
    expect(store.bookingData.startTime).toBe('10:00');
  });

  it('should set error', () => {
    const error = {
      step: 'datetime',
      message: 'Veuillez sélectionner une date et une heure'
    };
    
    store.setError(error);
    
    // Vérifier que l'erreur a été définie
    expect(store.error).toEqual(error);
    
    // Effacer l'erreur
    store.setError(null);
    
    // Vérifier que l'erreur a été effacée
    expect(store.error).toBeNull();
  });

  it('should set loading state', () => {
    store.setLoading(true);
    
    // Vérifier que l'état de chargement a été défini
    expect(store.isLoading).toBe(true);
    
    store.setLoading(false);
    
    // Vérifier que l'état de chargement a été désactivé
    expect(store.isLoading).toBe(false);
  });

  it('should reset booking', () => {
    // D'abord ouvrir la réservation et mettre à jour les données
    store.openBooking('service-1');
    store.updateBookingData({
      stylistId: 'stylist-1',
      date: '2024-06-10',
      startTime: '10:00',
      clientData: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '0612345678'
      }
    });
    
    // Puis réinitialiser la réservation
    store.resetBooking();
    
    // Vérifier que la réservation a été réinitialisée
    expect(store.currentStep).toBe('service');
    expect(store.bookingData.serviceId).toBe('');
    expect(store.bookingData.stylistId).toBe('');
    expect(store.bookingData.date).toBe('');
    expect(store.bookingData.startTime).toBe('');
    expect(store.bookingData.clientData.firstName).toBe('');
    expect(store.error).toBeNull();
    expect(store.showConfirmation).toBe(false);
    expect(store.lastBookingInfo).toBeNull();
  });

  it('should validate datetime step with valid data', () => {
    // Configurer le store avec des données valides
    store.openBooking('service-1');
    store.updateBookingData({
      stylistId: 'stylist-1',
      date: '2024-06-10',
      startTime: '10:00'
    });
    
    // Mock isSlotAvailable pour retourner true
    useAppointmentStore.getState().isSlotAvailable.mockReturnValue(true);
    
    // Valider l'étape datetime
    const isValid = store.validateCurrentStep();
    
    // Vérifier que la validation a réussi
    expect(isValid).toBe(true);
    expect(store.error).toBeNull();
    
    // Vérifier que isSlotAvailable a été appelé avec les bons paramètres
    expect(useAppointmentStore.getState().isSlotAvailable).toHaveBeenCalledWith({
      date: '2024-06-10',
      startTime: '10:00',
      endTime: '11:00',
      stylistId: 'stylist-1'
    });
  });

  it('should fail validation of datetime step with missing stylist', () => {
    // Configurer le store avec des données incomplètes
    store.openBooking('service-1');
    store.updateBookingData({
      date: '2024-06-10',
      startTime: '10:00'
    });
    
    // Valider l'étape datetime
    const isValid = store.validateCurrentStep();
    
    // Vérifier que la validation a échoué
    expect(isValid).toBe(false);
    expect(store.error).toEqual({
      step: 'datetime',
      message: 'Veuillez sélectionner un coiffeur'
    });
  });

  it('should fail validation of datetime step with missing date or time', () => {
    // Configurer le store avec des données incomplètes
    store.openBooking('service-1');
    store.updateBookingData({
      stylistId: 'stylist-1'
    });
    
    // Valider l'étape datetime
    const isValid = store.validateCurrentStep();
    
    // Vérifier que la validation a échoué
    expect(isValid).toBe(false);
    expect(store.error).toEqual({
      step: 'datetime',
      message: 'Veuillez sélectionner une date et une heure'
    });
  });

  it('should fail validation of datetime step with unavailable slot', () => {
    // Configurer le store avec des données valides
    store.openBooking('service-1');
    store.updateBookingData({
      stylistId: 'stylist-1',
      date: '2024-06-10',
      startTime: '10:00'
    });
    
    // Mock isSlotAvailable pour retourner false
    useAppointmentStore.getState().isSlotAvailable.mockReturnValue(false);
    
    // Valider l'étape datetime
    const isValid = store.validateCurrentStep();
    
    // Vérifier que la validation a échoué
    expect(isValid).toBe(false);
    expect(store.error).toEqual({
      step: 'datetime',
      message: "Ce créneau n'est plus disponible"
    });
  });

  it('should submit booking with new client', async () => {
    // Configurer le store avec des données valides
    store.openBooking('service-1');
    store.updateBookingData({
      stylistId: 'stylist-1',
      date: '2024-06-10',
      startTime: '10:00',
      clientData: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '0612345678',
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
      }
    });
    
    // Mock isSlotAvailable pour retourner true
    useAppointmentStore.getState().isSlotAvailable.mockReturnValue(true);
    
    // Mock findClientByInfo pour retourner null (nouveau client)
    useClientStore.getState().findClientByInfo.mockReturnValue(null);
    
    // Soumettre la réservation
    await store.submitBooking();
    
    // Vérifier que le client a été créé
    expect(useClientStore.getState().addClient).toHaveBeenCalled();
    
    // Vérifier que le rendez-vous a été créé
    expect(useAppointmentStore.getState().addAppointment).toHaveBeenCalledWith({
      clientId: 'client-1',
      serviceId: 'service-1',
      stylistId: 'stylist-1',
      date: '2024-06-10',
      startTime: '10:00',
      serviceDuration: 60,
      notes: '',
      clientInfo: {
        firstName: 'John',
        lastName: 'Doe',
        phone: '0612345678'
      }
    });
    
    // Vérifier que la confirmation est affichée
    expect(store.showConfirmation).toBe(true);
    expect(store.lastBookingInfo).toEqual({
      date: '2024-06-10',
      time: '10:00',
      modificationLink: 'modification-token'
    });
  });

  it('should submit booking with existing client', async () => {
    // Configurer le store avec des données valides
    store.openBooking('service-1');
    store.updateBookingData({
      stylistId: 'stylist-1',
      date: '2024-06-10',
      startTime: '10:00',
      clientData: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '0612345678',
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
      }
    });
    
    // Mock isSlotAvailable pour retourner true
    useAppointmentStore.getState().isSlotAvailable.mockReturnValue(true);
    
    // Mock findClientByInfo pour retourner un client existant
    useClientStore.getState().findClientByInfo.mockReturnValue({
      id: 'client-1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '0612345678',
      preferences: {
        favoriteServices: [],
        preferredStylists: [],
        communicationPreferences: {
          smsReminders: true,
          emailMarketing: true,
          birthdayOffers: true
        }
      }
    });
    
    // Soumettre la réservation
    await store.submitBooking();
    
    // Vérifier que le client a été mis à jour
    expect(useClientStore.getState().updateClient).toHaveBeenCalled();
    
    // Vérifier que des points de fidélité ont été ajoutés
    expect(useClientStore.getState().addLoyaltyPoints).toHaveBeenCalled();
    
    // Vérifier que la date de dernière visite a été mise à jour
    expect(useClientStore.getState().updateLastVisit).toHaveBeenCalled();
    
    // Vérifier que le rendez-vous a été créé
    expect(useAppointmentStore.getState().addAppointment).toHaveBeenCalled();
    
    // Vérifier que la confirmation est affichée
    expect(store.showConfirmation).toBe(true);
    expect(store.lastBookingInfo).toEqual({
      date: '2024-06-10',
      time: '10:00',
      modificationLink: 'modification-token'
    });
  });

  it('should throw error when submitting booking with unavailable slot', async () => {
    // Configurer le store avec des données valides
    store.openBooking('service-1');
    store.updateBookingData({
      stylistId: 'stylist-1',
      date: '2024-06-10',
      startTime: '10:00',
      clientData: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '0612345678'
      }
    });
    
    // Mock isSlotAvailable pour retourner false
    useAppointmentStore.getState().isSlotAvailable.mockReturnValue(false);
    
    // Soumettre la réservation doit lancer une erreur
    await expect(store.submitBooking()).rejects.toThrow("Ce créneau n'est plus disponible");
    
    // Vérifier que la confirmation n'est pas affichée
    expect(store.showConfirmation).toBe(false);
    expect(store.lastBookingInfo).toBeNull();
  });

  it('should close confirmation', () => {
    // Configurer le store avec une confirmation
    store.showConfirmation = true;
    store.lastBookingInfo = {
      date: '2024-06-10',
      time: '10:00',
      modificationLink: 'modification-token'
    };
    
    // Fermer la confirmation
    store.closeConfirmation();
    
    // Vérifier que la confirmation est fermée
    expect(store.showConfirmation).toBe(false);
    expect(store.lastBookingInfo).toBeNull();
  });
});
