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
  role?: 'owner' | 'admin';
  isAdmin?: boolean;
  subscription: {
    planType: PlanType;
    expiresAt: string;
  };
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
