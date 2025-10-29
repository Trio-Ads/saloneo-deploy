// @ts-nocheck
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useClientStore } from '../store';

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

describe('Client Store', () => {
  let store;
  
  beforeEach(() => {
    // Réinitialiser les mocks
    vi.clearAllMocks();
    
    // Obtenir le store
    store = useClientStore.getState();
  });

  it('should initialize with default values', () => {
    // Vérifier que le store est initialisé avec un client de test
    expect(store.clients).toHaveLength(1);
    expect(store.clients[0].firstName).toBe('Marie');
    expect(store.clients[0].lastName).toBe('Dupont');
    
    // Vérifier que l'historique du client est initialisé
    expect(store.clientsHistory).toHaveProperty('1');
    expect(store.clientsHistory['1'].clientId).toBe('1');
  });

  it('should add a new client', () => {
    const clientData = {
      firstName: 'Jean',
      lastName: 'Martin',
      email: 'jean.martin@example.com',
      phone: '0687654321',
      birthDate: '1985-05-15',
      notes: 'Nouveau client',
      preferences: {
        favoriteServices: [],
        preferredStylists: [],
        hairQuestionnaire: {
          hairType: 'Raides',
          thickness: 'Fins',
          scalpCondition: 'Normal',
          porosity: 'Faible',
          chemicalTreatments: ['Aucun'],
          hairProblems: [],
          currentProducts: '',
          allergies: ''
        },
        skinQuestionnaire: {
          skinType: 'Normale',
          sensitivity: 'Pas sensible',
          skinProblems: [],
          mainConcernArea: [],
          currentProducts: '',
          allergies: '',
          pastReactions: ''
        },
        communicationPreferences: {
          smsReminders: true,
          emailMarketing: false,
          birthdayOffers: true
        }
      }
    };
    
    const newClient = store.addClient(clientData);
    
    // Vérifier que le client a été ajouté
    expect(store.clients).toHaveLength(2);
    
    // Vérifier les propriétés du nouveau client
    expect(newClient.id).toBe('test-uuid');
    expect(newClient.firstName).toBe('Jean');
    expect(newClient.lastName).toBe('Martin');
    expect(newClient.loyaltyPoints).toBe(0);
    expect(newClient.isActive).toBe(true);
    expect(newClient.createdAt).toBeDefined();
    
    // Vérifier que l'historique du client a été créé
    expect(store.clientsHistory).toHaveProperty('test-uuid');
    expect(store.clientsHistory['test-uuid'].clientId).toBe('test-uuid');
    expect(store.clientsHistory['test-uuid'].appointments).toEqual([]);
    expect(store.clientsHistory['test-uuid'].purchases).toEqual([]);
    expect(store.clientsHistory['test-uuid'].loyaltyHistory).toEqual([]);
    
    // Vérifier que localStorage.setItem a été appelé
    expect(localStorageMock.setItem).toHaveBeenCalledWith('beauty-flow-clients', expect.any(String));
  });

  it('should update an existing client', () => {
    const clientId = store.clients[0].id;
    const updateData = {
      firstName: 'Marie-Anne',
      notes: 'Notes mises à jour'
    };
    
    store.updateClient(clientId, updateData);
    
    // Vérifier que le client a été mis à jour
    const updatedClient = store.clients.find(c => c.id === clientId);
    expect(updatedClient.firstName).toBe('Marie-Anne');
    expect(updatedClient.notes).toBe('Notes mises à jour');
    
    // Vérifier que les autres propriétés n'ont pas changé
    expect(updatedClient.lastName).toBe('Dupont');
    expect(updatedClient.email).toBe('marie.dupont@example.com');
  });

  it('should mark a client as inactive when deleted', () => {
    const clientId = store.clients[0].id;
    
    store.deleteClient(clientId);
    
    // Vérifier que le client est marqué comme inactif
    const deletedClient = store.clients.find(c => c.id === clientId);
    expect(deletedClient.isActive).toBe(false);
    
    // Vérifier que le client existe toujours dans la liste
    expect(store.clients).toHaveLength(1);
  });

  it('should add loyalty points to a client', () => {
    const clientId = store.clients[0].id;
    const initialPoints = store.clients[0].loyaltyPoints;
    const pointsToAdd = 50;
    const reason = 'Achat de produits';
    
    store.addLoyaltyPoints(clientId, pointsToAdd, reason);
    
    // Vérifier que les points ont été ajoutés
    const updatedClient = store.clients.find(c => c.id === clientId);
    expect(updatedClient.loyaltyPoints).toBe(initialPoints + pointsToAdd);
    
    // Vérifier que la transaction a été ajoutée à l'historique
    const clientHistory = store.clientsHistory[clientId];
    expect(clientHistory.loyaltyHistory).toHaveLength(1);
    expect(clientHistory.loyaltyHistory[0].type).toBe('earn');
    expect(clientHistory.loyaltyHistory[0].points).toBe(pointsToAdd);
    expect(clientHistory.loyaltyHistory[0].reason).toBe(reason);
  });

  it('should redeem loyalty points from a client', () => {
    const clientId = store.clients[0].id;
    const initialPoints = store.clients[0].loyaltyPoints;
    const pointsToRedeem = 30;
    const reason = 'Réduction sur service';
    
    store.redeemLoyaltyPoints(clientId, pointsToRedeem, reason);
    
    // Vérifier que les points ont été déduits
    const updatedClient = store.clients.find(c => c.id === clientId);
    expect(updatedClient.loyaltyPoints).toBe(initialPoints - pointsToRedeem);
    
    // Vérifier que la transaction a été ajoutée à l'historique
    const clientHistory = store.clientsHistory[clientId];
    expect(clientHistory.loyaltyHistory).toHaveLength(1);
    expect(clientHistory.loyaltyHistory[0].type).toBe('redeem');
    expect(clientHistory.loyaltyHistory[0].points).toBe(-pointsToRedeem);
    expect(clientHistory.loyaltyHistory[0].reason).toBe(reason);
  });

  it('should not redeem points if client does not have enough', () => {
    const clientId = store.clients[0].id;
    const initialPoints = store.clients[0].loyaltyPoints;
    const pointsToRedeem = initialPoints + 50; // Plus que le solde disponible
    const reason = 'Réduction sur service';
    
    store.redeemLoyaltyPoints(clientId, pointsToRedeem, reason);
    
    // Vérifier que les points n'ont pas été déduits
    const updatedClient = store.clients.find(c => c.id === clientId);
    expect(updatedClient.loyaltyPoints).toBe(initialPoints);
    
    // Vérifier qu'aucune transaction n'a été ajoutée à l'historique
    const clientHistory = store.clientsHistory[clientId];
    expect(clientHistory.loyaltyHistory).toHaveLength(0);
  });

  it('should update the last visit date of a client', () => {
    const clientId = store.clients[0].id;
    const newDate = '2024-06-01T10:00:00.000Z';
    
    store.updateLastVisit(clientId, newDate);
    
    // Vérifier que la date de dernière visite a été mise à jour
    const updatedClient = store.clients.find(c => c.id === clientId);
    expect(updatedClient.lastVisit).toBe(newDate);
  });

  it('should find a client by personal information', () => {
    // Cas où le client existe
    const existingClient = store.findClientByInfo('Marie', 'Dupont', '0612345678');
    expect(existingClient).toBeDefined();
    expect(existingClient.id).toBe('1');
    
    // Cas où le client n'existe pas
    const nonExistingClient = store.findClientByInfo('Jean', 'Dupont', '0612345678');
    expect(nonExistingClient).toBeUndefined();
    
    // Cas avec des variations de casse et d'espaces
    const clientWithVariations = store.findClientByInfo('marie', 'DUPONT', '06 12 34 56 78');
    expect(clientWithVariations).toBeDefined();
    expect(clientWithVariations.id).toBe('1');
    
    // Cas avec des accents
    const clientWithAccents = store.findClientByInfo('Marié', 'Dûpont', '0612345678');
    expect(clientWithAccents).toBeDefined();
    expect(clientWithAccents.id).toBe('1');
  });
});
