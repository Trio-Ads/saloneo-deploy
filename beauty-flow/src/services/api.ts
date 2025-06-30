import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Handle 401 errors (unauthorized)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await api.post('/auth/refresh', { refreshToken });
          const { token, refreshToken: newRefreshToken } = response.data;
          
          localStorage.setItem('token', token);
          localStorage.setItem('refreshToken', newRefreshToken);
          
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }
          
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;

// API endpoints
export const authAPI = {
  register: (data: {
    email: string;
    password: string;
    establishmentName: string;
    phone?: string;
    address?: string;
  }) => api.post('/auth/register', data),

  login: (data: { email: string; password: string }) => 
    api.post('/auth/login', data),

  logout: () => api.post('/auth/logout'),

  getCurrentUser: () => api.get('/auth/me'),

  forgotPassword: (email: string) => 
    api.post('/auth/forgot-password', { email }),

  resetPassword: (token: string, password: string) => 
    api.post(`/auth/reset-password/${token}`, { password }),

  verifyEmail: (token: string) => 
    api.get(`/auth/verify-email/${token}`),
};

export const clientsAPI = {
  getAll: (params?: any) => api.get('/clients', { params }),
  getById: (id: string) => api.get(`/clients/${id}`),
  create: (data: any) => api.post('/clients', data),
  update: (id: string, data: any) => api.put(`/clients/${id}`, data),
  delete: (id: string) => api.delete(`/clients/${id}`),
  search: (query: string) => api.get('/clients/search', { params: { q: query } }),
};

export const servicesAPI = {
  getAll: (params?: any) => api.get('/services', { params }),
  getById: (id: string) => api.get(`/services/${id}`),
  create: (data: any) => api.post('/services', data),
  update: (id: string, data: any) => api.put(`/services/${id}`, data),
  delete: (id: string) => api.delete(`/services/${id}`),
  getCategories: () => api.get('/services/categories'),
};

export const productsAPI = {
  getAll: (params?: any) => api.get('/products', { params }),
  getById: (id: string) => api.get(`/products/${id}`),
  create: (data: any) => api.post('/products', data),
  update: (id: string, data: any) => api.put(`/products/${id}`, data),
  delete: (id: string) => api.delete(`/products/${id}`),
  updateQuantity: (id: string, quantityChange: number) => 
    api.patch(`/products/${id}/quantity`, { quantityChange }),
  getStats: () => api.get('/products/stats'),
};

export const appointmentsAPI = {
  getAll: (params?: any) => api.get('/appointments', { params }),
  getById: (id: string) => api.get(`/appointments/${id}`),
  create: (data: any) => api.post('/appointments', data),
  update: (id: string, data: any) => api.put(`/appointments/${id}`, data),
  delete: (id: string) => api.delete(`/appointments/${id}`),
  getAvailableSlots: (date: string, serviceId: string, teamMemberId?: string) => 
    api.get('/appointments/available-slots', { 
      params: { date, serviceId, teamMemberId } 
    }),
  updateStatus: (id: string, status: string) => 
    api.patch(`/appointments/${id}/status`, { status }),
};

export const teamAPI = {
  getAll: (params?: any) => api.get('/team', { params }),
  getById: (id: string) => api.get(`/team/${id}`),
  create: (data: any) => api.post('/team', data),
  update: (id: string, data: any) => api.put(`/team/${id}`, data),
  delete: (id: string) => api.delete(`/team/${id}`),
  getSchedule: (id: string, date: string) => 
    api.get(`/team/${id}/schedule`, { params: { date } }),
  updateSchedule: (id: string, schedule: any) => 
    api.put(`/team/${id}/schedule`, schedule),
};

export const profileAPI = {
  get: () => api.get('/profile'),
  update: (data: any) => api.put('/profile', data),
  updatePassword: (data: { currentPassword: string; newPassword: string }) => 
    api.put('/profile/password', data),
  uploadLogo: (file: File) => {
    const formData = new FormData();
    formData.append('logo', file);
    return api.post('/profile/logo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

export const subscriptionAPI = {
  getCurrent: () => api.get('/subscription'),
  getPlans: () => api.get('/subscription/plans'),
  subscribe: (planId: string, paymentMethod: string) => 
    api.post('/subscription/subscribe', { planId, paymentMethod }),
  cancel: () => api.post('/subscription/cancel'),
  getInvoices: () => api.get('/subscription/invoices'),
};

export const publicAPI = {
  getSalonInfo: (salonId: string) => api.get(`/public/salon/${salonId}`),
  getServices: (salonId: string) => api.get(`/public/salon/${salonId}/services`),
  getTeamMembers: (salonId: string) => api.get(`/public/salon/${salonId}/team`),
  getAvailableSlots: (salonId: string, date: string, serviceId: string) => 
    api.get(`/public/salon/${salonId}/available-slots`, { 
      params: { date, serviceId } 
    }),
  bookAppointment: (salonId: string, data: any) => 
    api.post(`/public/salon/${salonId}/book`, data),
  // Nouvelle API pour la réservation par slug
  createBooking: (slug: string, data: any) => 
    api.post(`/public/appointments/${slug}`, data),
  // Récupérer un rendez-vous par token de modification
  getAppointmentByModificationToken: (token: string) => 
    api.get(`/public/appointment/${token}`),
  getAppointment: (code: string, email: string) => 
    api.get('/public/appointment', { params: { code, email } }),
  cancelAppointment: (code: string, email: string) => 
    api.post('/public/appointment/cancel', { code, email }),
};

// File upload helper
export const uploadFile = async (file: File, endpoint: string): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await api.post(endpoint, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  
  return response.data.url;
};
