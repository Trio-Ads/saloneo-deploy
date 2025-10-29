import { create } from 'zustand';
import { Client, ClientFormData, ClientHistory, LoyaltyTransaction } from './types';
import { clientsAPI } from '../../services/api';
import { AxiosError } from 'axios';

interface ClientStore {
  clients: Client[];
  clientsHistory: { [clientId: string]: ClientHistory };
  loading: boolean;
  error: string | null;
  
  // API methods
  fetchClients: () => Promise<void>;
  addClient: (clientData: ClientFormData) => Promise<Client>;
  updateClient: (id: string, clientData: Partial<ClientFormData>) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;
  searchClients: (query: string) => Promise<Client[]>;
  
  // Local methods
  addLoyaltyPoints: (clientId: string, points: number, reason: string) => void;
  redeemLoyaltyPoints: (clientId: string, points: number, reason: string) => void;
  updateLastVisit: (clientId: string, date: string) => void;
  findClientByInfo: (firstName: string, lastName: string, phone: string) => Client | undefined;
  clearError: () => void;
}

// Configuration du système de fidélité
const LOYALTY_CONFIG = {
  POINTS_PER_VISIT: 10,
  POINTS_PER_EURO: 1,
  POINTS_FOR_BIRTHDAY: 50,
  REDEMPTION_RATE: 0.1 // 10 points = 1€
};

// Fonction pour mapper les données du backend vers le frontend
const mapClientFromAPI = (apiClient: any): Client => ({
  id: apiClient._id || apiClient.id,
  firstName: apiClient.firstName,
  lastName: apiClient.lastName,
  email: apiClient.email || '',
  phone: apiClient.phone,
  birthDate: apiClient.dateOfBirth ? new Date(apiClient.dateOfBirth).toISOString().split('T')[0] : undefined,
  address: apiClient.address,
  notes: apiClient.notes,
  preferences: {
    favoriteServices: apiClient.preferences?.favoriteServices || [],
    preferredStylists: apiClient.preferences?.preferredStylists || [],
    hairQuestionnaire: apiClient.preferences?.hairQuestionnaire ? {
      hairType: apiClient.preferences.hairQuestionnaire.type as any,
      thickness: apiClient.preferences.hairQuestionnaire.thickness as any,
      scalpCondition: apiClient.preferences.hairQuestionnaire.condition === 'Normaux' ? 'Normal' : apiClient.preferences.hairQuestionnaire.condition as any,
      porosity: 'Moyenne' as any, // Valeur par défaut car pas dans le backend
      chemicalTreatments: apiClient.preferences.hairQuestionnaire.chemicalTreatments || [],
      lastTreatmentDate: undefined,
      hairProblems: apiClient.preferences.hairQuestionnaire.concerns || [],
      currentProducts: apiClient.preferences.hairQuestionnaire.currentProducts || '',
      allergies: apiClient.preferences.hairQuestionnaire.allergies || ''
    } : undefined,
    skinQuestionnaire: apiClient.preferences?.skinQuestionnaire ? {
      skinType: apiClient.preferences.skinQuestionnaire.type as any,
      sensitivity: apiClient.preferences.skinQuestionnaire.sensitivity === 'Faible' ? 'Pas sensible' :
                   apiClient.preferences.skinQuestionnaire.sensitivity === 'Modérée' ? 'Légèrement sensible' :
                   apiClient.preferences.skinQuestionnaire.sensitivity === 'Élevée' ? 'Très sensible' : 'Pas sensible' as any,
      skinProblems: apiClient.preferences.skinQuestionnaire.concerns || [],
      mainConcernArea: [],
      currentProducts: apiClient.preferences.skinQuestionnaire.currentProducts?.join(', ') || '',
      allergies: apiClient.preferences.skinQuestionnaire.allergies?.join(', ') || '',
      pastReactions: ''
    } : undefined,
    communicationPreferences: apiClient.preferences?.communicationPreferences || {
      smsReminders: true,
      emailMarketing: false,
      birthdayOffers: false
    }
  },
  loyaltyPoints: apiClient.loyaltyPoints || 0,
  isActive: apiClient.isActive !== false,
  createdAt: apiClient.createdAt,
  lastVisit: apiClient.history?.lastVisit ? new Date(apiClient.history.lastVisit).toISOString() : undefined
});

// Fonction pour mapper les données du frontend vers le backend
const mapClientToAPI = (client: ClientFormData) => ({
  firstName: client.firstName,
  lastName: client.lastName,
  email: client.email || undefined,
  phone: client.phone,
  dateOfBirth: client.birthDate ? new Date(client.birthDate) : undefined,
  address: client.address,
  notes: client.notes,
  preferences: {
    favoriteServices: client.preferences?.favoriteServices || [],
    preferredStylists: client.preferences?.preferredStylists || [],
    communicationPreferences: client.preferences?.communicationPreferences || {
      smsReminders: true,
      emailMarketing: false,
      birthdayOffers: false
    },
    hairQuestionnaire: client.preferences?.hairQuestionnaire ? {
      type: client.preferences.hairQuestionnaire.hairType,
      thickness: client.preferences.hairQuestionnaire.thickness,
      condition: client.preferences.hairQuestionnaire.scalpCondition === 'Normal' ? 'Normaux' : client.preferences.hairQuestionnaire.scalpCondition,
      chemicalTreatments: client.preferences.hairQuestionnaire.chemicalTreatments,
      concerns: client.preferences.hairQuestionnaire.hairProblems,
      washFrequency: '',
      preferredStyles: []
    } : undefined,
    skinQuestionnaire: client.preferences?.skinQuestionnaire ? {
      type: client.preferences.skinQuestionnaire.skinType,
      sensitivity: client.preferences.skinQuestionnaire.sensitivity === 'Pas sensible' ? 'Faible' :
                   client.preferences.skinQuestionnaire.sensitivity === 'Légèrement sensible' ? 'Modérée' :
                   client.preferences.skinQuestionnaire.sensitivity === 'Très sensible' ? 'Élevée' : 'Faible',
      concerns: client.preferences.skinQuestionnaire.skinProblems,
      allergies: client.preferences.skinQuestionnaire.allergies ? [client.preferences.skinQuestionnaire.allergies] : [],
      currentProducts: client.preferences.skinQuestionnaire.currentProducts ? [client.preferences.skinQuestionnaire.currentProducts] : [],
      goals: []
    } : undefined
  }
});

const initialState = {
  clients: [],
  clientsHistory: {},
  loading: false,
  error: null
};

export const useClientStore = create<ClientStore>()((set, get) => ({
  ...initialState,

  clearError: () => set({ error: null }),

  fetchClients: async () => {
    set({ loading: true, error: null });
    try {
      const response = await clientsAPI.getAll();
      const clients = response.data.clients.map(mapClientFromAPI);
      set({ clients, loading: false });
    } catch (error) {
      const message = error instanceof AxiosError 
        ? error.response?.data?.error || 'Erreur lors du chargement des clients'
        : 'Une erreur est survenue';
      set({ loading: false, error: message });
    }
  },

  searchClients: async (query: string) => {
    try {
      const response = await clientsAPI.search(query);
      return response.data.clients.map(mapClientFromAPI);
    } catch (error) {
      console.error('Erreur lors de la recherche:', error);
      return [];
    }
  },

  findClientByInfo: (firstName, lastName, phone) => {
    const normalizeString = (str: string) => 
      str.toLowerCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    const normalizedFirstName = normalizeString(firstName);
    const normalizedLastName = normalizeString(lastName);
    const normalizedPhone = phone.replace(/\s/g, '');

    return get().clients.find(client => 
      normalizeString(client.firstName) === normalizedFirstName &&
      normalizeString(client.lastName) === normalizedLastName &&
      client.phone.replace(/\s/g, '') === normalizedPhone &&
      client.isActive
    );
  },

  addClient: async (clientData) => {
    set({ loading: true, error: null });
    try {
      const apiData = mapClientToAPI(clientData);
      const response = await clientsAPI.create(apiData);
      const newClient = mapClientFromAPI(response.data.client);
      
      set((state) => ({
        clients: [...state.clients, newClient],
        loading: false
      }));

      return newClient;
    } catch (error) {
      const message = error instanceof AxiosError 
        ? error.response?.data?.error || 'Erreur lors de la création du client'
        : 'Une erreur est survenue';
      set({ loading: false, error: message });
      throw error;
    }
  },

  updateClient: async (id, clientData) => {
    set({ loading: true, error: null });
    try {
      const apiData = mapClientToAPI(clientData as ClientFormData);
      const response = await clientsAPI.update(id, apiData);
      const updatedClient = mapClientFromAPI(response.data.client);
      
      set((state) => ({
        clients: state.clients.map((client) =>
          client.id === id ? updatedClient : client
        ),
        loading: false
      }));
    } catch (error) {
      const message = error instanceof AxiosError 
        ? error.response?.data?.error || 'Erreur lors de la mise à jour du client'
        : 'Une erreur est survenue';
      set({ loading: false, error: message });
      throw error;
    }
  },

  deleteClient: async (id) => {
    set({ loading: true, error: null });
    try {
      await clientsAPI.delete(id);
      set((state) => ({
        clients: state.clients.filter((client) => client.id !== id),
        loading: false
      }));
    } catch (error) {
      const message = error instanceof AxiosError 
        ? error.response?.data?.error || 'Erreur lors de la suppression du client'
        : 'Une erreur est survenue';
      set({ loading: false, error: message });
      throw error;
    }
  },

  addLoyaltyPoints: (clientId, points, reason) => {
    const transaction: LoyaltyTransaction = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      type: 'earn',
      points,
      reason
    };

    set((state) => {
      const updatedClients = state.clients.map((client) =>
        client.id === clientId
          ? { ...client, loyaltyPoints: client.loyaltyPoints + points }
          : client
      );

      const clientHistory = state.clientsHistory[clientId];
      if (!clientHistory) return { clients: updatedClients };

      return {
        clients: updatedClients,
        clientsHistory: {
          ...state.clientsHistory,
          [clientId]: {
            ...clientHistory,
            loyaltyHistory: [...clientHistory.loyaltyHistory, transaction]
          }
        }
      };
    });
  },

  redeemLoyaltyPoints: (clientId, points, reason) => {
    const client = get().clients.find((c) => c.id === clientId);
    if (!client || client.loyaltyPoints < points) return;

    const transaction: LoyaltyTransaction = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      type: 'redeem',
      points: -points,
      reason
    };

    set((state) => {
      const updatedClients = state.clients.map((client) =>
        client.id === clientId
          ? { ...client, loyaltyPoints: client.loyaltyPoints - points }
          : client
      );

      const clientHistory = state.clientsHistory[clientId];
      if (!clientHistory) return { clients: updatedClients };

      return {
        clients: updatedClients,
        clientsHistory: {
          ...state.clientsHistory,
          [clientId]: {
            ...clientHistory,
            loyaltyHistory: [...clientHistory.loyaltyHistory, transaction]
          }
        }
      };
    });
  },

  updateLastVisit: (clientId, date) => set((state) => ({
    clients: state.clients.map((client) =>
      client.id === clientId ? { ...client, lastVisit: date } : client
    )
  }))
}));

// Constantes pour le questionnaire cheveux (conformes au modèle backend)
export const HAIR_TYPES = ['Raides', 'Ondulés', 'Bouclés', 'Crépus'] as const;
export const HAIR_THICKNESS = ['Fins', 'Moyens', 'Épais'] as const;
export const SCALP_CONDITIONS = ['Secs', 'Normaux', 'Gras', 'Mixtes'] as const; // Conformes au backend
export const HAIR_POROSITY = ['Faible', 'Moyenne', 'Élevée'] as const;
export const CHEMICAL_TREATMENTS = ['Aucun', 'Coloration', 'Mèches', 'Défrisage', 'Permanente'] as const;
export const HAIR_PROBLEMS = ['Pointes fourchues', 'Cassure', 'Frisottis', 'Sécheresse', 'Excès de sébum'] as const;

// Constantes pour le questionnaire peau (conformes au modèle backend)
export const SKIN_TYPES = ['Sèche', 'Normale', 'Grasse', 'Mixte', 'Sensible'] as const; // Conformes au backend
export const SKIN_SENSITIVITY = ['Faible', 'Modérée', 'Élevée'] as const; // Conformes au backend
export const SKIN_PROBLEMS = ['Acné', 'Vieillissement', 'Taches pigmentaires', 'Rougeurs', 'Sécheresse'] as const;
export const SKIN_AREAS = ['Front', 'Joues', 'Menton', 'Nez', 'Contour des yeux'] as const;

// Constantes pour l'interface utilisateur (affichage frontend)
export const UI_SCALP_CONDITIONS = ['Normal', 'Sec', 'Gras', 'Sensible', 'Pellicules'] as const;
export const UI_SKIN_SENSITIVITY = ['Pas sensible', 'Légèrement sensible', 'Très sensible'] as const;
