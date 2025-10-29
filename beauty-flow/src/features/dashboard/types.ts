import { Appointment } from '../appointments/types';
import { Service } from '../services/types';

// Type étendu pour les rendez-vous avec informations de prix
export interface AppointmentWithPrice extends Appointment {
  price?: number;
  service?: Service;
}

// Type pour les statistiques du dashboard
export interface DashboardStats {
  todayAppointments: number;
  todayRevenue: number;
  monthRevenue: number;
  revenueGrowth: number;
  newClients: number;
  totalClients: number;
  occupancyRate: number;
  upcomingAppointments: number;
}

// Type pour les alertes
export interface DashboardAlert {
  type: 'warning' | 'info' | 'success' | 'error';
  message: string;
  action?: {
    label: string;
    link: string;
  };
}

// Type pour les données de graphique
export interface ChartDataPoint {
  label: string;
  value: number;
}
