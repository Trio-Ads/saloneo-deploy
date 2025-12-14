export enum PlanType {
  FREE = 'FREE',
  STARTER = 'STARTER',
  PRO = 'PRO',
  ENTERPRISE = 'ENTERPRISE'
}

export enum SubscriptionDuration {
  MONTHLY = 'MONTHLY',
  YEARLY = 'YEARLY',
  BIENNIAL = 'BIENNIAL',
  TRIENNIAL = 'TRIENNIAL'
}

export interface AdminUser {
  _id: string;
  email: string;
  establishmentName: string;
  subscription?: {
    plan: PlanType;
    duration: SubscriptionDuration;
    startDate: string;
    expiresAt?: string;
    isActive: boolean;
  };
  createdAt: string;
  isActive: boolean;
}

export interface AdminUserDetails extends AdminUser {
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
  stats: {
    appointmentsCount: number;
    clientsCount: number;
    servicesCount: number;
  };
}

export interface PlatformStats {
  users: {
    total: number;
    active: number;
    recent: number;
    byPlan: {
      free: number;
      starter: number;
      pro: number;
      enterprise: number;
    };
  };
  platform: {
    totalAppointments: number;
    totalClients: number;
    totalServices: number;
  };
}

export interface UsersListResponse {
  users: AdminUser[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface UpdateSubscriptionData {
  plan?: PlanType;
  duration?: SubscriptionDuration;
  expiresAt?: string;
  isActive?: boolean;
}
