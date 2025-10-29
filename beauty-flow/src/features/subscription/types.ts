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

export interface DurationPrice {
  monthly: number;
  yearly: number;
  biennial: number;
  triennial: number;
  currency: string;
}

export interface DurationDiscount {
  yearly: number;    // 25%
  biennial: number;  // 35%
  triennial: number; // 50%
}

export interface Plan {
  type: PlanType;
  price: PlanPrice;
  limits: PlanLimits;
}

export interface Subscription {
  currentPlan: PlanType;
  duration: SubscriptionDuration;
  startDate: string;
  endDate?: string;
  isActive: boolean;
  autoRenew?: boolean;
  paidAmount?: number;
  remainingMonths?: number;
  lastTransactionId?: string;
}

export const PLAN_LIMITS: Record<PlanType, PlanLimits> = {
  [PlanType.FREE]: {
    appointments: 20,
    clients: 10,
    services: 5,
    teamMembers: 1,
    stock: false,
    onlineBooking: true, // Toujours activé pour la pub
    customInterface: false
  },
  [PlanType.STARTER]: {
    appointments: 60,
    clients: 200,
    services: 20,
    teamMembers: 5,
    stock: true,
    onlineBooking: true,
    customInterface: true
  },
  [PlanType.PRO]: {
    appointments: 200,
    clients: 1000,
    services: 50,
    teamMembers: 10,
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
    amount: 3500,
    currency: 'DZD',
    isPromo: true,
    regularAmount: 5000
  },
  [PlanType.ENTERPRISE]: {
    amount: 0,
    currency: 'DZD',
    isPromo: false,
    customQuote: true
  }
};

// Prix par durée avec réductions généreuses
export const DURATION_PRICES: Record<PlanType, DurationPrice | null> = {
  [PlanType.FREE]: null,
  [PlanType.STARTER]: {
    monthly: 1900,
    yearly: 14250,    // -25% (9 mois payés pour 12)
    biennial: 24700,  // -35% (13 mois payés pour 24)
    triennial: 34200, // -50% (18 mois payés pour 36)
    currency: 'DZD'
  },
  [PlanType.PRO]: {
    monthly: 3500,
    yearly: 26250,    // -25% (9 mois payés pour 12)
    biennial: 45500,  // -35% (13 mois payés pour 24)
    triennial: 63000, // -50% (18 mois payés pour 36)
    currency: 'DZD'
  },
  [PlanType.ENTERPRISE]: null
};

// Pourcentages de réduction
export const DURATION_DISCOUNTS: DurationDiscount = {
  yearly: 25,
  biennial: 35,
  triennial: 50
};
