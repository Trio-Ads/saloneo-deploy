export interface Appointment {
  id: string;
  clientId: string;
  serviceId: string;
  serviceName: string;
  stylistId: string;
  date: string; // Format ISO
  startTime: string; // Format HH:mm
  endTime: string; // Format HH:mm
  status: AppointmentStatus;
  notes?: string;
  publicToken?: string; // Token unique pour l'accès public
  modificationToken?: string; // Token pour la modification/annulation
  lastModified?: string; // Date de dernière modification
  cancellationReason?: string; // Raison de l'annulation
  clientInfo?: {
    firstName: string;
    lastName: string;
    phone: string;
  };
}

export interface ClientSearchInfo {
  firstName: string;
  lastName: string;
  phone: string;
}

export type AppointmentStatus = 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'noShow' | 'rescheduled';

export interface AppointmentFormData {
  clientId: string;
  serviceId: string;
  stylistId: string;
  date: string;
  startTime: string;
  serviceDuration: number; // Durée en minutes
  notes?: string;
  clientInfo?: {
    firstName: string;
    lastName: string;
    phone: string;
  };
}

export interface TimeSlot {
  startTime: string;
  endTime: string;
  available: boolean;
}

export interface DaySchedule {
  date: string;
  timeSlots: TimeSlot[];
}

export interface AppointmentModification {
  appointmentId: string;
  modificationToken: string;
  newDate?: string;
  newStartTime?: string;
  newStylistId?: string;
  cancellationReason?: string;
  modifiedAt: string;
}

export interface PublicAppointmentAccess {
  appointmentId: string;
  publicToken: string;
  clientEmail: string;
  expiresAt: string;
}

export interface CancellationPolicy {
  minHoursBeforeAppointment: number; // Minimum d'heures avant le RDV pour pouvoir annuler
  maxReschedulesAllowed: number; // Nombre maximum de modifications autorisées
  cancellationFee?: number; // Frais d'annulation éventuels
}

export interface AppointmentNotification {
  type: 'confirmation' | 'modification' | 'cancellation' | 'reminder';
  appointmentId: string;
  recipientEmail: string;
  sentAt: string;
  status: 'pending' | 'sent' | 'failed';
  content: {
    subject: string;
    body: string;
    data: any;
  };
}

// Paramètres de configuration des rendez-vous
export interface AppointmentSettings {
  bufferTimeBetweenAppointments: number; // minutes
}

// Statistiques des rendez-vous
export interface AppointmentStats {
  totalAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  noShowAppointments: number;
  averageDuration: number;
  mostBookedService: string;
  mostBookedStylist: string;
  busyDays: { day: string; count: number }[];
  busyHours: { hour: string; count: number }[];
}

// Historique client
export interface ClientHistory {
  clientId: string;
  stats: AppointmentStats;
  lastAppointment: string; // ISO date
  totalSpent: number;
  loyaltyPoints: number;
  visitFrequency: number; // jours moyens entre visites
}

// Filtres pour l'historique des rendez-vous
export interface AppointmentHistoryFilters {
  startDate?: string;
  endDate?: string;
  clientId?: string;
  stylistId?: string;
  serviceId?: string;
  status?: AppointmentStatus[];
}
