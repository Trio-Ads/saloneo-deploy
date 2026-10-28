import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthState, AuthCredentials, RegisterData, UserProfile } from './types';
import { authAPI } from '../../services/api';
import { AxiosError } from 'axios';
import { socketService } from '../../services/socket';

interface AuthStore extends AuthState {
  login: (credentials: AuthCredentials) => Promise<void>;
  /** Staff invitation accepted: the API answers like a login */
  acceptInvitation: (token: string, data: { firstName: string; lastName: string; password: string }) => Promise<void>;
  /** Refresh the user (staff: permissions the owner may have changed) */
  setUser: (apiUser: any) => void;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  clearError: () => void;
}

const mapUserFromAPI = (apiUser: any): UserProfile => {
  // Helper function to convert currency string to object
  const getCurrencyObject = (currencyCode: string) => {
    const currencies: Record<string, { code: string; symbol: string; name: string }> = {
      'EUR': { code: 'EUR', symbol: '€', name: 'Euro' },
      'USD': { code: 'USD', symbol: '$', name: 'US Dollar' },
      'GBP': { code: 'GBP', symbol: '£', name: 'British Pound' },
      'JPY': { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
      'CAD': { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
      'AUD': { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
      'CHF': { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc' },
      'CNY': { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
      'SEK': { code: 'SEK', symbol: 'kr', name: 'Swedish Krona' },
      'NOK': { code: 'NOK', symbol: 'kr', name: 'Norwegian Krone' },
      'DKK': { code: 'DKK', symbol: 'kr', name: 'Danish Krone' },
      'PLN': { code: 'PLN', symbol: 'zł', name: 'Polish Zloty' },
      'CZK': { code: 'CZK', symbol: 'Kč', name: 'Czech Koruna' },
      'HUF': { code: 'HUF', symbol: 'Ft', name: 'Hungarian Forint' },
      'RUB': { code: 'RUB', symbol: '₽', name: 'Russian Ruble' },
      'BRL': { code: 'BRL', symbol: 'R$', name: 'Brazilian Real' },
      'INR': { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
      'KRW': { code: 'KRW', symbol: '₩', name: 'South Korean Won' },
      'SGD': { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
      'HKD': { code: 'HKD', symbol: 'HK$', name: 'Hong Kong Dollar' },
      'NZD': { code: 'NZD', symbol: 'NZ$', name: 'New Zealand Dollar' },
      'MXN': { code: 'MXN', symbol: '$', name: 'Mexican Peso' },
      'ZAR': { code: 'ZAR', symbol: 'R', name: 'South African Rand' },
      'TRY': { code: 'TRY', symbol: '₺', name: 'Turkish Lira' },
      'AED': { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham' },
      'SAR': { code: 'SAR', symbol: '﷼', name: 'Saudi Riyal' },
      'QAR': { code: 'QAR', symbol: 'ر.ق', name: 'Qatari Riyal' },
      'KWD': { code: 'KWD', symbol: 'د.ك', name: 'Kuwaiti Dinar' },
      'BHD': { code: 'BHD', symbol: '.د.ب', name: 'Bahraini Dinar' },
      'OMR': { code: 'OMR', symbol: 'ر.ع.', name: 'Omani Rial' },
      'JOD': { code: 'JOD', symbol: 'د.ا', name: 'Jordanian Dinar' },
      'LBP': { code: 'LBP', symbol: 'ل.ل', name: 'Lebanese Pound' },
      'EGP': { code: 'EGP', symbol: 'ج.م', name: 'Egyptian Pound' },
      'MAD': { code: 'MAD', symbol: 'د.م.', name: 'Moroccan Dirham' },
      'TND': { code: 'TND', symbol: 'د.ت', name: 'Tunisian Dinar' },
      'DZD': { code: 'DZD', symbol: 'DA', name: 'Algerian Dinar' },
      'LYD': { code: 'LYD', symbol: 'ل.د', name: 'Libyan Dinar' },
    };
    return currencies[currencyCode] || currencies['DZD'];
  };

  const currencyCode = apiUser.settings?.currency || 'DZD';
  const currencyObject = typeof currencyCode === 'string' 
    ? getCurrencyObject(currencyCode)
    : currencyCode;

  return {
    id: apiUser.id || apiUser._id,
    email: apiUser.email,
    firstName: apiUser.firstName || '',
    lastName: apiUser.lastName || '',
    establishmentName: apiUser.establishmentName,
    address: apiUser.address || '',
    language: apiUser.settings?.language || 'fr',
    currency: currencyObject,
    role: apiUser.role,
    isAdmin: apiUser.isAdmin,
    salonId: apiUser.salonId,
    teamMemberId: apiUser.teamMemberId,
    permissions: apiUser.permissions,
    avatar: apiUser.avatar,
    createdAt: apiUser.createdAt,
    subscription: {
      planType: apiUser.subscription?.plan || 'FREE',
      expiresAt: apiUser.subscription?.endDate || apiUser.subscription?.expiresAt
    }
  };
};

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
          // Staff: the profile store holds their salon (read from GET /profile), not their own name
          if (mappedUser.role === 'staff') useProfileStore.getState().loadProfile().catch(() => undefined);
          else useProfileStore.getState().updateProfile({
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

      acceptInvitation: async (inviteToken, data) => {
        const response = await authAPI.acceptInvitation(inviteToken, data);
        const { token, refreshToken, user } = response.data;
        localStorage.setItem('token', token);
        localStorage.setItem('refreshToken', refreshToken);
        set({ isAuthenticated: true, user: mapUserFromAPI(user), token, error: null });
        socketService.connect(token);
        const { useProfileStore } = await import('../profile/store');
        useProfileStore.getState().loadProfile().catch(() => undefined);
      },

      setUser: (apiUser) => set({ user: mapUserFromAPI(apiUser) }),

      register: async (data) => {
        set({ loading: true, error: null });
        try {
          const response = await authAPI.register({
            email: data.email,
            password: data.password,
            firstName: data.firstName,
            lastName: data.lastName,
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
          currency: { code: 'DZD', symbol: 'DA', name: 'Dinar algérien' },
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
          // Staff: the profile store holds their salon (read from GET /profile), not their own name
          if (mappedUser.role === 'staff') useProfileStore.getState().loadProfile().catch(() => undefined);
          else useProfileStore.getState().updateProfile({
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
