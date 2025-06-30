import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthState, AuthCredentials, RegisterData, UserProfile } from './types';
import { authAPI } from '../../services/api';
import { AxiosError } from 'axios';
import { socketService } from '../../services/socket';

interface AuthStore extends AuthState {
  login: (credentials: AuthCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  clearError: () => void;
}

const mapUserFromAPI = (apiUser: any): UserProfile => ({
  id: apiUser.id || apiUser._id,
  email: apiUser.email,
  firstName: apiUser.firstName || '',
  lastName: apiUser.lastName || '',
  establishmentName: apiUser.establishmentName,
  address: apiUser.address || '',
  language: apiUser.settings?.language || 'fr',
  currency: apiUser.settings?.currency || { code: 'EUR', symbol: '€', name: 'Euro' },
  createdAt: apiUser.createdAt,
  subscription: {
    planType: apiUser.subscription?.plan || 'FREE',
    expiresAt: apiUser.subscription?.endDate || apiUser.subscription?.expiresAt
  }
});

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      user: null,
      token: null,
      loading: false,
      error: null,

      login: async (credentials) => {
        set({ loading: true, error: null });
        try {
          const response = await authAPI.login(credentials);
          const { token, refreshToken, user } = response.data;
          
          // Save tokens
          localStorage.setItem('token', token);
          localStorage.setItem('refreshToken', refreshToken);
          
          const mappedUser = mapUserFromAPI(user);
          
          // Update profile store
          const { useProfileStore } = await import('../profile/store');
          useProfileStore.getState().updateProfile({
            firstName: mappedUser.firstName,
            lastName: mappedUser.lastName,
            establishmentName: mappedUser.establishmentName,
            address: mappedUser.address,
            language: mappedUser.language,
            currency: mappedUser.currency,
            publicLink: ''
          });
          
          set({ 
            isAuthenticated: true, 
            user: mappedUser, 
            token, 
            loading: false 
          });
          
          // Connect to WebSocket
          socketService.connect(token);
        } catch (error) {
          const message = error instanceof AxiosError 
            ? error.response?.data?.error || 'Identifiants invalides'
            : 'Une erreur est survenue';
          set({ 
            loading: false, 
            error: message
          });
          throw error;
        }
      },

      register: async (data) => {
        set({ loading: true, error: null });
        try {
          const response = await authAPI.register({
            email: data.email,
            password: data.password,
            establishmentName: data.establishmentName,
            phone: data.phone,
            address: data.address
          });
          
          const { token, refreshToken, user } = response.data;
          
          // Save tokens
          localStorage.setItem('token', token);
          localStorage.setItem('refreshToken', refreshToken);
          
          const mappedUser = mapUserFromAPI(user);
          
          // Update profile store
          const { useProfileStore } = await import('../profile/store');
          useProfileStore.getState().updateProfile({
            firstName: data.firstName || '',
            lastName: data.lastName || '',
            establishmentName: mappedUser.establishmentName,
            address: mappedUser.address,
            language: mappedUser.language,
            currency: mappedUser.currency,
            publicLink: ''
          });
          
          set({ 
            isAuthenticated: true, 
            user: mappedUser, 
            token, 
            loading: false 
          });
        } catch (error) {
          const message = error instanceof AxiosError 
            ? error.response?.data?.error || 'Erreur lors de l\'inscription'
            : 'Une erreur est survenue';
          set({ 
            loading: false, 
            error: message
          });
          throw error;
        }
      },

      logout: async () => {
        set({ loading: true });
        try {
          await authAPI.logout();
        } catch (error) {
          // Continue logout even if API call fails
          console.error('Logout API error:', error);
        }
        
        // Clear tokens
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        
        // Clear profile store
        const { useProfileStore } = await import('../profile/store');
        useProfileStore.getState().updateProfile({
          firstName: '',
          lastName: '',
          establishmentName: '',
          address: '',
          language: 'fr',
          currency: { code: 'EUR', symbol: '€', name: 'Euro' },
          publicLink: ''
        });
        
          set({ 
            isAuthenticated: false, 
            user: null, 
            token: null, 
            loading: false, 
            error: null 
          });
          
          // Disconnect from WebSocket
          socketService.disconnect();
      },

      checkAuth: async () => {
        const token = localStorage.getItem('token');
        if (!token) {
          set({ isAuthenticated: false, user: null, token: null });
          return;
        }

        set({ loading: true, error: null });
        try {
          const response = await authAPI.getCurrentUser();
          const user = response.data.user;
          const mappedUser = mapUserFromAPI(user);
          
          // Update profile store
          const { useProfileStore } = await import('../profile/store');
          useProfileStore.getState().updateProfile({
            firstName: mappedUser.firstName,
            lastName: mappedUser.lastName,
            establishmentName: mappedUser.establishmentName,
            address: mappedUser.address,
            language: mappedUser.language,
            currency: mappedUser.currency,
            publicLink: ''
          });
          
          set({ 
            isAuthenticated: true, 
            user: mappedUser, 
            token,
            loading: false 
          });
        } catch (error) {
          // Clear invalid auth
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          
          set({ 
            isAuthenticated: false, 
            user: null, 
            token: null,
            loading: false,
            error: 'Session expirée'
          });
        }
      },

      clearError: () => set({ error: null })
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        token: state.token
      })
    }
  )
);

// Check auth on app load
if (typeof window !== 'undefined') {
  const token = localStorage.getItem('token');
  if (token) {
    useAuthStore.getState().checkAuth();
  }
}
