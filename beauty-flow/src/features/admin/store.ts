import { create } from 'zustand';
import api from '../../services/api';
import {
  AdminUser,
  AdminUserDetails,
  PlatformStats,
  UsersListResponse,
  UpdateSubscriptionData,
  PlanType,
  SubscriptionDuration
} from './types';

interface AdminState {
  users: AdminUser[];
  selectedUser: AdminUserDetails | null;
  platformStats: PlatformStats | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filters: {
    search: string;
    planFilter: string;
    statusFilter: string;
  };
  loading: boolean;
  error: string | null;

  // Actions
  fetchUsers: (page?: number) => Promise<void>;
  fetchUserById: (id: string) => Promise<void>;
  fetchPlatformStats: () => Promise<void>;
  updateUserSubscription: (userId: string, data: UpdateSubscriptionData) => Promise<void>;
  setFilters: (filters: Partial<AdminState['filters']>) => void;
  clearError: () => void;
  reset: () => void;
}

const initialState = {
  users: [],
  selectedUser: null,
  platformStats: null,
  pagination: {
    page: 1,
    limit: 25,
    total: 0,
    totalPages: 0
  },
  filters: {
    search: '',
    planFilter: '',
    statusFilter: ''
  },
  loading: false,
  error: null
};

export const useAdminStore = create<AdminState>((set, get) => ({
  ...initialState,

  fetchUsers: async (page = 1) => {
    set({ loading: true, error: null });
    try {
      const { filters } = get();
      const response = await api.get<{ success: boolean; data: UsersListResponse }>(
        '/admin/users',
        {
          params: {
            page,
            limit: 25,
            search: filters.search,
            planFilter: filters.planFilter,
            statusFilter: filters.statusFilter
          }
        }
      );

      if (response.data.success) {
        set({
          users: response.data.data.users,
          pagination: response.data.data.pagination,
          loading: false
        });
      }
    } catch (error: any) {
      set({
        error: error.response?.data?.error || 'Failed to fetch users',
        loading: false
      });
    }
  },

  fetchUserById: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const response = await api.get<{
        success: boolean;
        data: { user: AdminUserDetails; stats: any };
      }>(`/admin/users/${id}`);

      if (response.data.success) {
        set({
          selectedUser: {
            ...response.data.data.user,
            stats: response.data.data.stats
          },
          loading: false
        });
      }
    } catch (error: any) {
      set({
        error: error.response?.data?.error || 'Failed to fetch user details',
        loading: false
      });
    }
  },

  fetchPlatformStats: async () => {
    set({ loading: true, error: null });
    try {
      const response = await api.get<{ success: boolean; data: PlatformStats }>(
        '/admin/stats'
      );

      if (response.data.success) {
        set({
          platformStats: response.data.data,
          loading: false
        });
      }
    } catch (error: any) {
      set({
        error: error.response?.data?.error || 'Failed to fetch platform stats',
        loading: false
      });
    }
  },

  updateUserSubscription: async (userId: string, data: UpdateSubscriptionData) => {
    set({ loading: true, error: null });
    try {
      const response = await api.patch<{
        success: boolean;
        message: string;
        data: { subscription: any };
      }>(`/admin/users/${userId}/subscription`, data);

      if (response.data.success) {
        // Update the user in the list
        set((state) => ({
          users: state.users.map((user) =>
            user._id === userId
              ? { ...user, subscription: response.data.data.subscription }
              : user
          ),
          selectedUser: state.selectedUser?._id === userId
            ? { ...state.selectedUser, subscription: response.data.data.subscription }
            : state.selectedUser,
          loading: false
        }));

        // Refresh the user list to get updated data
        get().fetchUsers(get().pagination.page);
      }
    } catch (error: any) {
      set({
        error: error.response?.data?.error || 'Failed to update subscription',
        loading: false
      });
      throw error;
    }
  },

  setFilters: (filters) => {
    set((state) => ({
      filters: { ...state.filters, ...filters },
      pagination: { ...state.pagination, page: 1 } // Reset to page 1 when filters change
    }));
    // Fetch users with new filters
    get().fetchUsers(1);
  },

  clearError: () => set({ error: null }),

  reset: () => set(initialState)
}));
