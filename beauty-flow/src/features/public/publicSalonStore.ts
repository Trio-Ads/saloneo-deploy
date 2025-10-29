import { create } from 'zustand';
import api from '../../services/api';

interface SalonData {
  id: string;
  name: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  hours: {
    [key: string]: { open: string; close: string; closed?: boolean };
  };
}

interface ServiceData {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  image?: string;
}

interface TeamMemberData {
  id: string;
  name: string;
  role: string;
  image?: string;
}

interface BookingData {
  serviceId: string;
  teamMemberId?: string;
  date: string;
  startTime: string;
  clientInfo: {
    firstName: string;
    lastName: string;
    phone: string;
    email?: string;
  };
  notes?: string;
}

interface PublicSalonStore {
  // État
  salon: SalonData | null;
  services: ServiceData[];
  team: TeamMemberData[];
  loading: boolean;
  error: string | null;
  
  // Actions
  loadSalonData: (slug: string) => Promise<void>;
  createAppointment: (slug: string, bookingData: BookingData) => Promise<any>;
  reset: () => void;
}

export const usePublicSalonStore = create<PublicSalonStore>((set, get) => ({
  // État initial
  salon: null,
  services: [],
  team: [],
  loading: false,
  error: null,

  // Actions
  loadSalonData: async (slug: string) => {
    set({ loading: true, error: null });
    
    try {
      // Charger les données du salon, services et équipe en parallèle
      const [salonResponse, servicesResponse, teamResponse] = await Promise.all([
        api.get(`/public/salon/${slug}`),
        api.get(`/public/services/${slug}`),
        api.get(`/public/team/${slug}`)
      ]);

      const salon = salonResponse.data;
      const services = servicesResponse.data;
      const team = teamResponse.data;

      // Construire les données du salon
      const salonData: SalonData = {
        id: salon.id || salon._id,
        name: salon.establishmentName || `${salon.firstName} ${salon.lastName}`,
        description: 'Bienvenue dans notre salon de beauté',
        address: salon.address || '',
        phone: salon.phone || '',
        email: salon.email || '',
        hours: salon.businessHours || {
          monday: { open: '09:00', close: '19:00' },
          tuesday: { open: '09:00', close: '19:00' },
          wednesday: { open: '09:00', close: '19:00' },
          thursday: { open: '09:00', close: '19:00' },
          friday: { open: '09:00', close: '19:00' },
          saturday: { open: '09:00', close: '17:00' },
          sunday: { closed: true, open: '', close: '' }
        }
      };

      // Formater les services
      const servicesData: ServiceData[] = services?.map((service: any) => ({
        id: service.id || service._id,
        name: service.name,
        description: service.description || '',
        price: service.price || 0,
        duration: service.duration || 60,
        image: service.images?.[0] || service.image
      })) || [];

      // Formater l'équipe
      const teamData: TeamMemberData[] = team?.map((member: any) => ({
        id: member.id || member._id,
        name: member.name,
        role: member.role || 'Membre de l\'équipe',
        image: member.image || member.avatar
      })) || [];

      set({
        salon: salonData,
        services: servicesData,
        team: teamData,
        loading: false,
        error: null
      });

    } catch (error: any) {
      console.error('Erreur lors du chargement des données du salon:', error);
      set({
        salon: null,
        services: [],
        team: [],
        loading: false,
        error: error.response?.data?.error || 'Erreur lors du chargement des données'
      });
    }
  },

  createAppointment: async (slug: string, bookingData: BookingData) => {
    set({ loading: true, error: null });
    
    try {
      // Pour l'instant, utiliser l'ancien système avec token
      // TODO: Adapter quand les nouvelles routes de réservation par slug seront prêtes
      const response = await api.post(`/public/salon-token/demo-token/appointments`, {
        serviceId: bookingData.serviceId,
        teamMemberId: bookingData.teamMemberId,
        date: bookingData.date,
        startTime: bookingData.startTime,
        clientInfo: bookingData.clientInfo,
        notes: bookingData.notes
      });

      set({ loading: false });
      return response.data;
    } catch (error: any) {
      console.error('Erreur lors de la création du rendez-vous:', error);
      set({
        loading: false,
        error: error.response?.data?.error || 'Erreur lors de la création du rendez-vous'
      });
      throw error;
    }
  },

  reset: () => set({
    salon: null,
    services: [],
    team: [],
    loading: false,
    error: null
  })
}));
