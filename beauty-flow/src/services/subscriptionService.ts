import api from './api';

export interface UsageStats {
  plan: string;
  limits: {
    appointments: number;
    clients: number;
    services: number;
    teamMembers: number;
    stock: boolean;
    onlineBooking: boolean;
    customInterface: boolean;
  };
  usage: {
    appointments: {
      current: number;
      limit: number;
      remaining: number;
      percentage: number;
    };
    clients: {
      current: number;
      limit: number;
      remaining: number;
      percentage: number;
    };
    services: {
      current: number;
      limit: number;
      remaining: number;
      percentage: number;
    };
    teamMembers: {
      current: number;
      limit: number;
      remaining: number;
      percentage: number;
    };
  };
  features: {
    stock: boolean;
    onlineBooking: boolean;
    customInterface: boolean;
  };
}

export const subscriptionService = {
  // Récupérer les statistiques d'utilisation
  getUsageStats: async (): Promise<UsageStats> => {
    const response = await api.get('/subscription/usage-stats');
    return response.data;
  },
};

export default subscriptionService;
