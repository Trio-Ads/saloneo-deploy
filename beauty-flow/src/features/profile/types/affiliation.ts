export type PayoutMethod = 'bank' | 'paypal' | 'crypto';

export interface PayoutDetails {
  bank?: {
    accountName: string;
    accountNumber: string;
    bankName: string;
    iban?: string;
    swift?: string;
  };
  paypal?: {
    email: string;
  };
  crypto?: {
    walletAddress: string;
    network: string;
  };
}

export interface AffiliationStats {
  clicksCount: number;
  conversionsCount: number;
  conversionRate: number;
  lastActivity?: Date;
  monthlyStats?: MonthlyStats[];
}

export interface MonthlyStats {
  month: string;
  year: number;
  clicks: number;
  conversions: number;
  revenue: number;
  commissions: number;
}

export interface AffiliationData {
  isAffiliate: boolean;
  affiliateCode: string;
  referralCode?: string;
  referredBy?: string;
  totalReferrals: number;
  totalCommissions: number;
  commissionRate: number;
  payoutMethod?: PayoutMethod;
  payoutDetails?: PayoutDetails;
  stats: AffiliationStats;
  isActive: boolean;
  joinedAt?: Date;
}

export interface Commission {
  id: string;
  referredUserId: string;
  referredUserName: string;
  amount: number;
  currency: string;
  status: 'pending' | 'approved' | 'paid' | 'cancelled';
  type: 'subscription' | 'renewal' | 'upgrade';
  commissionRate: number;
  originalAmount: number;
  paymentDate?: Date;
  createdAt: Date;
}

export interface AffiliationSettings {
  payoutMethod?: PayoutMethod;
  payoutDetails?: PayoutDetails;
  minimumPayout: number;
  notificationsEnabled: boolean;
  autoApprove: boolean;
}

export interface MarketingMaterial {
  id: string;
  type: 'banner' | 'email' | 'social' | 'qrcode';
  name: string;
  description: string;
  imageUrl?: string;
  content?: string;
  dimensions?: {
    width: number;
    height: number;
  };
}

export interface AffiliateLink {
  url: string;
  shortUrl?: string;
  qrCode?: string;
  clicks: number;
  conversions: number;
  conversionRate: number;
}
