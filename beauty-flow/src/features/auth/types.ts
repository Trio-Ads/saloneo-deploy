import { Profile } from '../profile/types';
import { PlanType } from '../subscription/types';

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: UserProfile | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

export interface UserProfile extends Profile {
  email: string;
  id: string;
  createdAt: string;
  role?: 'owner' | 'admin' | 'staff' | 'supplier';
  isAdmin?: boolean;
  /** Staff logins: the owner's user id, their team member and what the owner allows (enforced by the API) */
  salonId?: string;
  teamMemberId?: string;
  permissions?: StaffPermissions;
  avatar?: string;
  subscription: {
    planType: PlanType;
    expiresAt: string;
  };
}

export interface StaffPermissions {
  planning: 'own' | 'all';
  canCreateAppointments: boolean;
  canEditAppointments: 'none' | 'own' | 'all';
  canViewClients: boolean;
  canViewClientContacts: boolean;
  canViewRevenue: boolean;
  canManageServices: boolean;
  canManageProducts: boolean;
}

export interface RegisterData extends AuthCredentials {
  firstName: string;
  lastName: string;
  establishmentName: string;
  address: string;
  phone?: string;
}

export interface AuthResponse {
  user: UserProfile;
  token: string;
}

export interface ValidationErrors {
  [key: string]: string[];
}
