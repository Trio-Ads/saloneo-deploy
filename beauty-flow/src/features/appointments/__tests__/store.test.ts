// @ts-nocheck
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAppointmentStore } from '../store';
import { useServiceStore } from '../../services/store';
import { addMinutes, format } from 'date-fns';

// Mock pour localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: vi.fn((key) => store[key] || null),
    setItem: vi.fn((key, value) => {
      store[key] = value.toString();
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    removeItem: vi.fn((key) => {
      delete store[key];
    })
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Mock pour uuid
vi.mock('uuid', () => ({
  v4: vi.fn(() => 'test-uuid')
}));

// Mock pour le store des services
vi.mock('../../services/store', () => ({
  useServiceStore: {
    getState: vi.fn(() => ({
      services: [
        {
          id: '1',
          name: 'Coupe Femme',
          duration: 60,
          price: 45
        },
        {
          id: '2',
          name: 'Coloration complète',
          duration: 120,
          price: 80
        }
      ]
    }))
  }
}));

describe('Appointment Store', () => {
  let store;
  
  beforeEach(() => {
    // Réinitialiser les mocks
    vi.clearAllMocks();
    
    // Obtenir le store
    store = useAppointmentStore.getState();
    
    // Réinitialiser l'état du store pour les tests
    store.appointments = [];
    store.preBookings = [];
    store.modifications = [];
    store.publicAccess = [];
  });

  it('should initialize with default values', () => {
    // Vérifier que le store est initialisé avec des tableaux vides
    expect(store.appointments).toEqual([]);
    expect(store.preBookings).toEqual([]);
    expect(store.modifications).toEqual([]);
    expect(store.publicAccess).toEqual([]);
    
    // Vérifier que la politique d'annulation est initialisée
    expect(store.cancellationPolicy).toHaveProperty('minHoursBeforeAppointment');
    expect(store.cancellationPolicy).toHaveProperty('maxReschedulesAllowed');
    expect(store.cancellationPolicy).toHaveProperty('cancellationFee');
  });

  it('should generate time slots correctly', () => {
    const slots = store.generateTimeSlots();
    
    // Vérifier que les créneaux sont générés
    expect(slots.length).toBeGreaterThan(0);
    
    // Vérifier le format des créneaux
    expect(slots[0]).toHaveProperty('startTime');
    expect(slots[0]).toHaveProperty('endTime');
    expect(slots[0]).toHaveProperty('available');
    
    // Vérifier que les créneaux sont espacés de 15 minutes
    const firstSlotStart = slots[0].startTime;
    const firstSlotEnd = slots[0].endTime;
    const startDate = new Date();
    startDate.setHours(parseInt(firstSlotStart.split(':')[0]), parseInt(firstSlotStart.split(':')[1]), 0, 0);
    const endDate = new Date();
    endDate.setHours(parseInt(firstSlotEnd.split(':')[0]), parseInt(firstSlotEnd.split(':')[1]), 0, 0);
    
    const diffInMinutes = (endDate.getTime() - startDate.getTime()) / (1000 * 60);
    expect(diffInMinutes).toBe(15);
  });

  it('should add a pre-booking', () => {
    const bookingData = {
      date: '2024-06-10',
      startTime: '10:00',
      endTime: '11:00',
      stylistId: '1'
    };
    
    const bookingId = store.addPreBooking(bookingData);
    
    // Vérifier que la pré-réservation a été ajoutée
    expect(store.preBookings).toHaveLength(1);
    expect(store.preBookings[0].id).toBe('test-uuid');
    expect(store.preBookings[0].date).toBe('2024-06-10');
    expect(store.preBookings[0].startTime).toBe('10:00');
    expect(store.preBookings[0].endTime).toBe('11:00');
    expect(store.preBookings[0].stylistId).toBe('1');
    expect(store.preBookings[0].timestamp).toBeDefined();
  });

  it('should remove a pre-booking', () => {
    // Ajouter une pré-réservation
    const bookingData = {
      date: '2024-06-10',
      startTime: '10:00',
      endTime: '11:00',
      stylistId: '1'
    };
    
    const bookingId = store.addPreBooking(bookingData);
    
    // Supprimer la pré-réservation
    store.removePreBooking('test-uuid');
    
    // Vérifier que la pré-réservation a été supprimée
    expect(store.preBookings).toHaveLength(0);
  });

  it('should add an appointment', async () => {
    const appointmentData = {
      clientId: 'client-1',
      serviceId: '1',
      stylistId: '1',
      date: '2024-06-10',
      startTime: '10:00',
      serviceDuration: 60,
      notes: 'Test appointment',
      clientInfo: {
        firstName: 'Marie',
        lastName: 'Dupont',
        phone: '0612345678'
      }
    };
    
    // Mock isSlotAvailable pour retourner true
    const isSlotAvailableSpy = vi.spyOn(store, 'isSlotAvailable').mockReturnValue(true);
    
    const result = await store.addAppointment(appointmentData);
    
    // Vérifier que l'appointment a été ajouté
    expect(store.appointments).toHaveLength(1);
    expect(store.appointments[0].id).toBe('test-uuid');
    expect(store.appointments[0].clientId).toBe('client-1');
    expect(store.appointments[0].serviceId).toBe('1');
    expect(store.appointments[0].serviceName).toBe('Coupe Femme');
    expect(store.appointments[0].stylistId).toBe('1');
    expect(store.appointments[0].date).toBe('2024-06-10');
    expect(store.appointments[0].startTime).toBe('10:00');
    expect(store.appointments[0].endTime).toBe('11:00');
    expect(store.appointments[0].status).toBe('scheduled');
    expect(store.appointments[0].notes).toBe('Test appointment');
    expect(store.appointments[0].publicToken).toBeDefined();
    expect(store.appointments[0].modificationToken).toBeDefined();
    expect(store.appointments[0].lastModified).toBeDefined();
    expect(store.appointments[0].clientInfo).toEqual({
      firstName: 'Marie',
      lastName: 'Dupont',
      phone: '0612345678'
    });
    
    // Vérifier que les tokens sont retournés
    expect(result).toHaveProperty('appointment');
    expect(result).toHaveProperty('publicToken');
    expect(result).toHaveProperty('modificationToken');
    
    // Restaurer le mock
    isSlotAvailableSpy.mockRestore();
  });

  it('should throw an error when adding an appointment to an unavailable slot', async () => {
    const appointmentData = {
      clientId: 'client-1',
      serviceId: '1',
      stylistId: '1',
      date: '2024-06-10',
      startTime: '10:00',
      serviceDuration: 60,
      notes: 'Test appointment',
      clientInfo: {
        firstName: 'Marie',
        lastName: 'Dupont',
        phone: '0612345678'
      }
    };
    
    // Mock isSlotAvailable pour retourner false
    const isSlotAvailableSpy = vi.spyOn(store, 'isSlotAvailable').mockReturnValue(false);
    
    // Vérifier que l'ajout d'un rendez-vous dans un créneau non disponible lance une erreur
    await expect(store.addAppointment(appointmentData)).rejects.toThrow("Ce créneau n'est plus disponible");
    
    // Vérifier qu'aucun rendez-vous n'a été ajouté
    expect(store.appointments).toHaveLength(0);
    
    // Restaurer le mock
    isSlotAvailableSpy.mockRestore();
  });

  it('should update an appointment', async () => {
    // Ajouter un rendez-vous
    const appointmentData = {
      clientId: 'client-1',
      serviceId: '1',
      stylistId: '1',
      date: '2024-06-10',
      startTime: '10:00',
      serviceDuration: 60,
      notes: 'Test appointment',
      clientInfo: {
        firstName: 'Marie',
        lastName: 'Dupont',
        phone: '0612345678'
      }
    };
    
    // Mock isSlotAvailable pour retourner true
    const isSlotAvailableSpy = vi.spyOn(store, 'isSlotAvailable').mockReturnValue(true);
    
    const result = await store.addAppointment(appointmentData);
    const appointmentId = result.appointment.id;
    
    // Mettre à jour le rendez-vous
    const updateData = {
      startTime: '11:00',
      serviceDuration: 90,
      notes: 'Updated appointment'
    };
    
    store.updateAppointment(appointmentId, updateData);
    
    // Vérifier que le rendez-vous a été mis à jour
    const updatedAppointment = store.appointments[0];
    expect(updatedAppointment.startTime).toBe('11:00');
    expect(updatedAppointment.endTime).toBe('12:30'); // 11:00 + 90 minutes
    expect(updatedAppointment.notes).toBe('Updated appointment');
    expect(updatedAppointment.status).toBe('rescheduled');
    
    // Restaurer le mock
    isSlotAvailableSpy.mockRestore();
  });

  it('should cancel an appointment', async () => {
    // Ajouter un rendez-vous
    const appointmentData = {
      clientId: 'client-1',
      serviceId: '1',
      stylistId: '1',
      date: '2024-06-10',
      startTime: '10:00',
      serviceDuration: 60,
      notes: 'Test appointment',
      clientInfo: {
        firstName: 'Marie',
        lastName: 'Dupont',
        phone: '0612345678'
      }
    };
    
    // Mock isSlotAvailable pour retourner true
    const isSlotAvailableSpy = vi.spyOn(store, 'isSlotAvailable').mockReturnValue(true);
    
    const result = await store.addAppointment(appointmentData);
    const appointmentId = result.appointment.id;
    
    // Annuler le rendez-vous
    store.cancelAppointment(appointmentId, 'Client unavailable');
    
    // Vérifier que le rendez-vous a été annulé
    const cancelledAppointment = store.appointments[0];
    expect(cancelledAppointment.status).toBe('cancelled');
    expect(cancelledAppointment.cancellationReason).toBe('Client unavailable');
    
    // Restaurer le mock
    isSlotAvailableSpy.mockRestore();
  });

  it('should mark an appointment as completed', async () => {
    // Ajouter un rendez-vous
    const appointmentData = {
      clientId: 'client-1',
      serviceId: '1',
      stylistId: '1',
      date: '2024-06-10',
      startTime: '10:00',
      serviceDuration: 60,
      notes: 'Test appointment',
      clientInfo: {
        firstName: 'Marie',
        lastName: 'Dupont',
        phone: '0612345678'
      }
    };
    
    // Mock isSlotAvailable pour retourner true
    const isSlotAvailableSpy = vi.spyOn(store, 'isSlotAvailable').mockReturnValue(true);
    
    const result = await store.addAppointment(appointmentData);
    const appointmentId = result.appointment.id;
    
    // Marquer le rendez-vous comme terminé
    store.completeAppointment(appointmentId);
    
    // Vérifier que le rendez-vous a été marqué comme terminé
    const completedAppointment = store.appointments[0];
    expect(completedAppointment.status).toBe('completed');
    
    // Restaurer le mock
    isSlotAvailableSpy.mockRestore();
  });

  it('should mark an appointment as no-show', async () => {
    // Ajouter un rendez-vous
    const appointmentData = {
      clientId: 'client-1',
      serviceId: '1',
      stylistId: '1',
      date: '2024-06-10',
      startTime: '10:00',
      serviceDuration: 60,
      notes: 'Test appointment',
      clientInfo: {
        firstName: 'Marie',
        lastName: 'Dupont',
        phone: '0612345678'
      }
    };
    
    // Mock isSlotAvailable pour retourner true
    const isSlotAvailableSpy = vi.spyOn(store, 'isSlotAvailable').mockReturnValue(true);
    
    const result = await store.addAppointment(appointmentData);
    const appointmentId = result.appointment.id;
    
    // Marquer le rendez-vous comme absence
    store.markAsNoShow(appointmentId);
    
    // Vérifier que le rendez-vous a été marqué comme absence
    const noShowAppointment = store.appointments[0];
    expect(noShowAppointment.status).toBe('noShow');
    
    // Restaurer le mock
    isSlotAvailableSpy.mockRestore();
  });

  it('should confirm an appointment', async () => {
    // Ajouter un rendez-vous
    const appointmentData = {
      clientId: 'client-1',
      serviceId: '1',
      stylistId: '1',
      date: '2024-06-10',
      startTime: '10:00',
      serviceDuration: 60,
      notes: 'Test appointment',
      clientInfo: {
        firstName: 'Marie',
        lastName: 'Dupont',
        phone: '0612345678'
      }
    };
    
    // Mock isSlotAvailable pour retourner true
    const isSlotAvailableSpy = vi.spyOn(store, 'isSlotAvailable').mockReturnValue(true);
    
    const result = await store.addAppointment(appointmentData);
    const appointmentId = result.appointment.id;
    
    // Confirmer le rendez-vous
    store.confirmAppointment(appointmentId);
    
    // Vérifier que le rendez-vous a été confirmé
    const confirmedAppointment = store.appointments[0];
    expect(confirmedAppointment.status).toBe('confirmed');
    
    // Restaurer le mock
    isSlotAvailableSpy.mockRestore();
  });

  it('should find appointments by client info', async () => {
    // Ajouter un rendez-vous
    const appointmentData = {
      clientId: 'client-1',
      serviceId: '1',
      stylistId: '1',
      date: '2024-06-10',
      startTime: '10:00',
      serviceDuration: 60,
      notes: 'Test appointment',
      clientInfo: {
        firstName: 'Marie',
        lastName: 'Dupont',
        phone: '0612345678'
      }
    };
    
    // Mock isSlotAvailable pour retourner true
    const isSlotAvailableSpy = vi.spyOn(store, 'isSlotAvailable').mockReturnValue(true);
    
    await store.addAppointment(appointmentData);
    
    // Rechercher les rendez-vous par info client
    const clientInfo = {
      firstName: 'Marie',
      lastName: 'Dupont',
      phone: '0612345678'
    };
    
    const appointments = await store.getAppointmentsByClientInfo(clientInfo);
    
    // Vérifier que le rendez-vous a été trouvé
    expect(appointments).toHaveLength(1);
    expect(appointments[0].clientInfo.firstName).toBe('Marie');
    expect(appointments[0].clientInfo.lastName).toBe('Dupont');
    expect(appointments[0].clientInfo.phone).toBe('0612345678');
    
    // Rechercher avec des infos qui ne correspondent pas
    const wrongClientInfo = {
      firstName: 'Jean',
      lastName: 'Dupont',
      phone: '0612345678'
    };
    
    const noAppointments = await store.getAppointmentsByClientInfo(wrongClientInfo);
    
    // Vérifier qu'aucun rendez-vous n'a été trouvé
    expect(noAppointments).toHaveLength(0);
    
    // Restaurer le mock
    isSlotAvailableSpy.mockRestore();
  });
});
