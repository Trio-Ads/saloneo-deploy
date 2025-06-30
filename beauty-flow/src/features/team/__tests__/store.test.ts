// @ts-nocheck
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useTeamStore, TEAM_ROLES } from '../store';
import { TimeOffStatus } from '../types';

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

describe('Team Store', () => {
  let store;
  
  beforeEach(() => {
    // Réinitialiser les mocks
    vi.clearAllMocks();
    
    // Obtenir le store
    store = useTeamStore.getState();
  });

  it('should initialize with default values', () => {
    // Vérifier que le store est initialisé avec des membres de test
    expect(store.members).toHaveLength(2);
    expect(store.members[0].firstName).toBe('Sophie');
    expect(store.members[0].lastName).toBe('Martin');
    expect(store.members[1].firstName).toBe('Lucas');
    expect(store.members[1].lastName).toBe('Bernard');
    
    // Vérifier que les congés sont initialisés comme un tableau vide
    expect(store.timeOffs).toEqual([]);
  });

  it('should add a new team member', () => {
    const memberData = {
      firstName: 'Emma',
      lastName: 'Dubois',
      email: 'emma.dubois@example.com',
      phone: '0634567890',
      role: 'Assistant(e)',
      specialties: [
        { serviceId: '3', proficiencyLevel: 3 } // Brushing
      ],
      schedule: {
        monday: { isWorking: true, start: '09:00', end: '17:00', breaks: [] },
        tuesday: { isWorking: true, start: '09:00', end: '17:00', breaks: [] },
        wednesday: { isWorking: true, start: '09:00', end: '17:00', breaks: [] },
        thursday: { isWorking: true, start: '09:00', end: '17:00', breaks: [] },
        friday: { isWorking: true, start: '09:00', end: '17:00', breaks: [] },
        saturday: { isWorking: false },
        sunday: { isWorking: false }
      }
    };
    
    store.addMember(memberData);
    
    // Vérifier que le membre a été ajouté
    expect(store.members).toHaveLength(3);
    
    // Vérifier les propriétés du nouveau membre
    const newMember = store.members[2];
    expect(newMember.id).toBe('test-uuid');
    expect(newMember.firstName).toBe('Emma');
    expect(newMember.lastName).toBe('Dubois');
    expect(newMember.role).toBe('Assistant(e)');
    expect(newMember.isActive).toBe(true);
    expect(newMember.specialties).toHaveLength(1);
    expect(newMember.specialties[0].serviceId).toBe('3');
  });

  it('should update an existing team member', () => {
    const memberId = store.members[0].id;
    const updateData = {
      firstName: 'Sophie-Anne',
      role: 'Manager',
      specialties: [
        { serviceId: '1', proficiencyLevel: 5 }, // Coupe Femme
        { serviceId: '2', proficiencyLevel: 5 }, // Coloration
        { serviceId: '3', proficiencyLevel: 5 }  // Brushing
      ]
    };
    
    store.updateMember(memberId, updateData);
    
    // Vérifier que le membre a été mis à jour
    const updatedMember = store.members.find(m => m.id === memberId);
    expect(updatedMember.firstName).toBe('Sophie-Anne');
    expect(updatedMember.role).toBe('Manager');
    expect(updatedMember.specialties).toHaveLength(3);
    expect(updatedMember.specialties[1].proficiencyLevel).toBe(5);
    
    // Vérifier que les autres propriétés n'ont pas changé
    expect(updatedMember.lastName).toBe('Martin');
    expect(updatedMember.email).toBe('sophie.martin@example.com');
  });

  it('should mark a team member as inactive when deleted', () => {
    const memberId = store.members[0].id;
    
    store.deleteMember(memberId);
    
    // Vérifier que le membre est marqué comme inactif
    const deletedMember = store.members.find(m => m.id === memberId);
    expect(deletedMember.isActive).toBe(false);
    
    // Vérifier que le membre existe toujours dans la liste
    expect(store.members).toHaveLength(2);
  });

  it('should add a new time off request', () => {
    const timeOffData = {
      memberId: store.members[0].id,
      startDate: '2024-07-01',
      endDate: '2024-07-05',
      reason: 'Vacances d\'été',
      type: 'vacation'
    };
    
    store.addTimeOff(timeOffData);
    
    // Vérifier que la demande de congé a été ajoutée
    expect(store.timeOffs).toHaveLength(1);
    
    // Vérifier les propriétés de la nouvelle demande de congé
    const newTimeOff = store.timeOffs[0];
    expect(newTimeOff.id).toBe('test-uuid');
    expect(newTimeOff.memberId).toBe(store.members[0].id);
    expect(newTimeOff.startDate).toBe('2024-07-01');
    expect(newTimeOff.endDate).toBe('2024-07-05');
    expect(newTimeOff.reason).toBe('Vacances d\'été');
    expect(newTimeOff.type).toBe('vacation');
    expect(newTimeOff.status).toBe(TimeOffStatus.PENDING);
  });

  it('should update the status of a time off request', () => {
    // Ajouter une demande de congé
    const timeOffData = {
      memberId: store.members[0].id,
      startDate: '2024-07-01',
      endDate: '2024-07-05',
      reason: 'Vacances d\'été',
      type: 'vacation'
    };
    
    store.addTimeOff(timeOffData);
    const timeOffId = store.timeOffs[0].id;
    
    // Approuver la demande de congé
    store.updateTimeOffStatus(timeOffId, TimeOffStatus.APPROVED);
    
    // Vérifier que le statut a été mis à jour
    expect(store.timeOffs[0].status).toBe(TimeOffStatus.APPROVED);
    
    // Refuser la demande de congé
    store.updateTimeOffStatus(timeOffId, TimeOffStatus.REJECTED);
    
    // Vérifier que le statut a été mis à jour
    expect(store.timeOffs[0].status).toBe(TimeOffStatus.REJECTED);
  });

  it('should delete a time off request', () => {
    // Ajouter une demande de congé
    const timeOffData = {
      memberId: store.members[0].id,
      startDate: '2024-07-01',
      endDate: '2024-07-05',
      reason: 'Vacances d\'été',
      type: 'vacation'
    };
    
    store.addTimeOff(timeOffData);
    const timeOffId = store.timeOffs[0].id;
    
    // Supprimer la demande de congé
    store.deleteTimeOff(timeOffId);
    
    // Vérifier que la demande de congé a été supprimée
    expect(store.timeOffs).toHaveLength(0);
  });

  it('should have the correct team roles defined', () => {
    // Vérifier que les rôles d'équipe sont correctement définis
    expect(TEAM_ROLES).toContain('Coiffeur(se)');
    expect(TEAM_ROLES).toContain('Coloriste');
    expect(TEAM_ROLES).toContain('Assistant(e)');
    expect(TEAM_ROLES).toContain('Réceptionniste');
    expect(TEAM_ROLES).toContain('Manager');
    expect(TEAM_ROLES).toHaveLength(5);
  });
});
