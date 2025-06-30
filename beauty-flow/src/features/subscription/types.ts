export enum PlanType {
  FREE = 'FREE',
  STARTER = 'STARTER',
  PRO = 'PRO',
  ENTERPRISE = 'ENTERPRISE'
}

export interface PlanLimits {
  appointments: number;
  clients: number;
  services: number;
  teamMembers: number;
  stock: boolean;
  onlineBooking: boolean;
  customInterface: boolean;
}

export interface PlanPrice {
  amount: number;
  currency: string;
  isPromo: boolean;
  regularAmount?: number;
  customQuote?: boolean;
}

export interface Plan {
  type: PlanType;
  price: PlanPrice;
  limits: PlanLimits;
}

export interface Subscription {
  currentPlan: PlanType;
  startDate: string;
  endDate?: string;
  isActive: boolean;
}

export const PLAN_LIMITS: Record<PlanType, PlanLimits> = {
  [PlanType.FREE]: {
    appointments: 30,
    clients: 50,
    services: 5,
    teamMembers: 1,
    stock: false,
    onlineBooking: false,
    customInterface: false
  },
  [PlanType.STARTER]: {
    appointments: 100,
    clients: 200,
    services: 15,
    teamMembers: 3,
    stock: true,
    onlineBooking: true,
    customInterface: true
  },
  [PlanType.PRO]: {
    appointments: -1, // illimité
    clients: -1, // illimité
    services: -1, // illimité
    teamMembers: 8,
    stock: true,
    onlineBooking: true,
    customInterface: true
  },
  [PlanType.ENTERPRISE]: {
    appointments: -1, // illimité
    clients: -1, // illimité
    services: -1, // illimité
    teamMembers: -1, // illimité
    stock: true,
    onlineBooking: true,
    customInterface: true
  }
};

export const PLAN_PRICES: Record<PlanType, PlanPrice> = {
  [PlanType.FREE]: {
    amount: 0,
    currency: 'DZD',
    isPromo: false
  },
  [PlanType.STARTER]: {
    amount: 1900,
    currency: 'DZD',
    isPromo: true,
    regularAmount: 3167
  },
  [PlanType.PRO]: {
    amount: 2400,
    currency: 'DZD',
    isPromo: true,
    regularAmount: 4000
  },
  [PlanType.ENTERPRISE]: {
    amount: 0,
    currency: 'DZD',
    isPromo: false,
    customQuote: true
  }
};
