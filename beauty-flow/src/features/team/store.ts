import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { TeamMember, TeamMemberFormData, TimeOff, TimeOffStatus, Schedule, WorkingHours } from './types';
import { teamAPI } from '../../services/api';
import { AxiosError } from 'axios';

interface TeamStore {
  members: TeamMember[];
  timeOffs: TimeOff[];
  loading: boolean;
  error: string | null;
  // API methods
  fetchMembers: () => Promise<void>;
  addMember: (memberData: TeamMemberFormData) => Promise<TeamMember>;
  updateMember: (id: string, memberData: Partial<TeamMemberFormData>) => Promise<void>;
  deleteMember: (id: string) => Promise<void>;
  addTimeOff: (timeOff: Omit<TimeOff, 'id' | 'status'>) => void;
  updateTimeOffStatus: (id: string, status: TimeOffStatus) => void;
  deleteTimeOff: (id: string) => void;
  /** After an invitation or a revocation */
  setAccess: (id: string, access: TeamMember['access']) => void;
  clearError: () => void;
}

// Horaires par défaut
const DEFAULT_WORKING_HOURS = {
  isWorking: true,
  start: '09:00',
  end: '18:00',
  breaks: [
    {
      start: '12:00',
      end: '13:00'
    }
  ]
};

const DEFAULT_NON_WORKING_HOURS = {
  isWorking: false
};

// Fonction pour mapper les données du backend vers le frontend
const mapTeamMemberFromAPI = (apiMember: any): TeamMember => ({
  id: apiMember._id || apiMember.id,
  firstName: apiMember.firstName,
  lastName: apiMember.lastName,
  email: apiMember.email || '',
  phone: apiMember.phone || '',
  role: apiMember.role,
  specialties: apiMember.specialties || [],
  workingHours: apiMember.workingHours || {
    monday: { isWorking: true, start: '09:00', end: '18:00', breaks: [{ start: '12:00', end: '13:00' }] },
    tuesday: { isWorking: true, start: '09:00', end: '18:00', breaks: [{ start: '12:00', end: '13:00' }] },
    wednesday: { isWorking: true, start: '09:00', end: '18:00', breaks: [{ start: '12:00', end: '13:00' }] },
    thursday: { isWorking: true, start: '09:00', end: '18:00', breaks: [{ start: '12:00', end: '13:00' }] },
    friday: { isWorking: true, start: '09:00', end: '18:00', breaks: [{ start: '12:00', end: '13:00' }] },
    saturday: { isWorking: true, start: '09:00', end: '18:00', breaks: [{ start: '12:00', end: '13:00' }] },
    sunday: { isWorking: false }
  },
  absences: apiMember.absences || [],
  isActive: apiMember.isActive !== false,
  avatar: apiMember.avatar,
  color: apiMember.color || '#3B82F6',
  permissions: apiMember.permissions,
  access: apiMember.access
});

// Fonction pour mapper les données du frontend vers le backend
const mapTeamMemberToAPI = (member: TeamMemberFormData) => ({
  firstName: member.firstName,
  lastName: member.lastName,
  email: member.email || '',
  phone: member.phone || '',
  role: member.role,
  specialties: member.specialties || [],
  services: member.services || member.specialties || [],
  workingHours: member.workingHours || {
    monday: { isWorking: true, start: '09:00', end: '18:00', breaks: [{ start: '12:00', end: '13:00' }] },
    tuesday: { isWorking: true, start: '09:00', end: '18:00', breaks: [{ start: '12:00', end: '13:00' }] },
    wednesday: { isWorking: true, start: '09:00', end: '18:00', breaks: [{ start: '12:00', end: '13:00' }] },
    thursday: { isWorking: true, start: '09:00', end: '18:00', breaks: [{ start: '12:00', end: '13:00' }] },
    friday: { isWorking: true, start: '09:00', end: '18:00', breaks: [{ start: '12:00', end: '13:00' }] },
    saturday: { isWorking: true, start: '09:00', end: '18:00', breaks: [{ start: '12:00', end: '13:00' }] },
    sunday: { isWorking: false }
  },
  ...(member.absences && { absences: member.absences }),
  avatar: member.avatar,
  color: member.color || '#3B82F6',
  ...(member.permissions && { permissions: member.permissions })
});

const initialState = {
  members: [],
  timeOffs: [],
  loading: false,
  error: null
};

export const useTeamStore = create<TeamStore>()((set, get) => ({
  ...initialState,

  clearError: () => set({ error: null }),

  setAccess: (id, access) => set((state) => ({ members: state.members.map((m) => (m.id === id ? { ...m, access } : m)) })),

  fetchMembers: async () => {
    set({ loading: true, error: null });
    try {
      const response = await teamAPI.getAll();
      let membersData = [];
      
      if (response.data && typeof response.data === 'object') {
        if (Array.isArray(response.data)) {
          membersData = response.data;
        } else if (response.data.members && Array.isArray(response.data.members)) {
          membersData = response.data.members;
        } else if (response.data.teamMembers && Array.isArray(response.data.teamMembers)) {
          membersData = response.data.teamMembers;
        } else {
          console.warn('⚠️ Team members data is not an array:', response.data);
          membersData = [];
        }
      }

      const members = membersData.map(mapTeamMemberFromAPI);
      console.log('👥 Membres d\'équipe chargés:', members.length);
      console.log('🔍 Premier membre:', members[0]);
      
      set({ members, loading: false });
    } catch (error) {
      const message = error instanceof AxiosError 
        ? error.response?.data?.error || 'Erreur lors du chargement des membres'
        : 'Une erreur est survenue';
      set({ loading: false, error: message });
    }
  },

  addMember: async (memberData) => {
    set({ loading: true, error: null });
    try {
      const apiData = mapTeamMemberToAPI(memberData);
      const response = await teamAPI.create(apiData);
      const newMember = mapTeamMemberFromAPI(response.data.teamMember || response.data.member || response.data);
      
      set((state) => ({
        members: [...state.members, newMember],
        loading: false
      }));

      return newMember;
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 403) {
        const errorData = error.response.data;
        if (errorData.error === 'Limit reached') {
          // Gestion spéciale pour les limites d'abonnement
          const limitError = new Error('SUBSCRIPTION_LIMIT');
          (limitError as any).limitData = {
            resource: 'teamMembers',
            current: errorData.current,
            limit: errorData.limit,
            plan: errorData.plan,
            message: `Vous avez atteint la limite de ${errorData.limit} membre(s) d'équipe pour votre plan ${errorData.plan}.`
          };
          set({ loading: false, error: null });
          throw limitError;
        }
      }
      
      const message = error instanceof AxiosError 
        ? error.response?.data?.error || 'Erreur lors de la création du membre'
        : 'Une erreur est survenue';
      set({ loading: false, error: message });
      throw error;
    }
  },

  updateMember: async (id, memberData) => {
    set({ loading: true, error: null });
    try {
      const apiData = mapTeamMemberToAPI(memberData as TeamMemberFormData);
      const response = await teamAPI.update(id, apiData);
      const updatedMember = mapTeamMemberFromAPI(response.data.teamMember || response.data.member || response.data);
      
      set((state) => ({
        // The update answer has no login status: keep the one we know
        members: state.members.map((member) =>
          member.id === id ? { ...updatedMember, access: updatedMember.access ?? member.access } : member
        ),
        loading: false
      }));
    } catch (error) {
      const message = error instanceof AxiosError 
        ? error.response?.data?.error || 'Erreur lors de la mise à jour du membre'
        : 'Une erreur est survenue';
      set({ loading: false, error: message });
      throw error;
    }
  },

  deleteMember: async (id) => {
    set({ loading: true, error: null });
    try {
      await teamAPI.delete(id);
      set((state) => ({
        members: state.members.filter((member) => member.id !== id),
        loading: false
      }));
    } catch (error) {
      const message = error instanceof AxiosError 
        ? error.response?.data?.error || 'Erreur lors de la suppression du membre'
        : 'Une erreur est survenue';
      set({ loading: false, error: message });
      throw error;
    }
  },

  addTimeOff: (timeOffData: Omit<TimeOff, 'id' | 'status'>) => set((state) => ({
    ...state,
    timeOffs: [...state.timeOffs, {
      ...timeOffData,
      id: uuidv4(),
      status: TimeOffStatus.PENDING
    }]
  })),

  updateTimeOffStatus: (id: string, status: TimeOffStatus) => set((state) => ({
    ...state,
    timeOffs: state.timeOffs.map((timeOff) =>
      timeOff.id === id ? { ...timeOff, status } : timeOff
    )
  })),

  deleteTimeOff: (id: string) => set((state) => ({
    ...state,
    timeOffs: state.timeOffs.filter((timeOff) => timeOff.id !== id)
  }))
}));

// Rôles disponibles dans l'équipe
export const TEAM_ROLES = [
  'Coiffeur(se)',
  'Coloriste',
  'Assistant(e)',
  'Réceptionniste',
  'Manager'
] as const;
