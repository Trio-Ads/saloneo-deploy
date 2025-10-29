export interface EmailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  attachments?: EmailAttachment[];
  cc?: string | string[];
  bcc?: string | string[];
  replyTo?: string;
  headers?: Record<string, string>;
}

export interface EmailAttachment {
  filename: string;
  content?: string | Buffer;
  path?: string;
  contentType?: string;
}

export interface EmailTemplate {
  name: string;
  subject: string;
  html: string;
  text?: string;
}

export interface EmailLog {
  id: string;
  userId?: string;
  to: string | string[];
  subject: string;
  template?: string;
  status: 'pending' | 'sent' | 'failed' | 'bounced';
  sentAt?: Date;
  error?: string;
  messageId?: string;
  opens?: number;
  clicks?: number;
  metadata?: Record<string, any>;
}

export interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
  from: string;
  replyTo?: string;
}

export interface EmailTemplateData {
  // Common
  userName?: string;
  salonName?: string;
  salonLogo?: string;
  salonAddress?: string;
  salonPhone?: string;
  salonEmail?: string;
  currentYear?: number;
  
  // Appointment
  appointmentDate?: string;
  appointmentTime?: string;
  serviceName?: string;
  servicePrice?: string;
  serviceDuration?: string;
  staffName?: string;
  clientName?: string;
  clientPhone?: string;
  appointmentId?: string;
  
  // Subscription
  planName?: string;
  planPrice?: string;
  planDuration?: string;
  expiryDate?: string;
  daysRemaining?: number;
  currentUsage?: {
    appointments?: { used: number; limit: number };
    clients?: { used: number; limit: number };
    services?: { used: number; limit: number };
  };
  
  // Payment
  amount?: string;
  currency?: string;
  transactionId?: string;
  paymentMethod?: string;
  invoiceNumber?: string;
  
  // Auth
  verificationLink?: string;
  resetPasswordLink?: string;
  temporaryPassword?: string;
  
  // Marketing
  promotionTitle?: string;
  promotionDescription?: string;
  promotionDiscount?: string;
  promotionCode?: string;
  promotionExpiry?: string;
  
  // Affiliation
  commissionAmount?: string;
  referralName?: string;
  totalEarnings?: string;
  
  // Custom
  [key: string]: any;
}

export interface EmailNotificationSettings {
  appointments: {
    confirmation: boolean;
    reminder24h: boolean;
    reminder2h: boolean;
    cancellation: boolean;
    modification: boolean;
  };
  subscription: {
    welcome: boolean;
    expiry7days: boolean;
    expiry3days: boolean;
    expiry1day: boolean;
    expired: boolean;
    renewed: boolean;
    limitReached: boolean;
  };
  marketing: {
    newsletter: boolean;
    promotions: boolean;
    birthday: boolean;
  };
}

export interface EmailCampaign {
  id: string;
  name: string;
  subject: string;
  template: string;
  recipients: string[];
  scheduledAt?: Date;
  sentAt?: Date;
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'cancelled';
  stats: {
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    bounced: number;
    unsubscribed: number;
  };
}

export interface EmailQueueJob {
  id: string;
  type: 'transactional' | 'marketing' | 'reminder';
  template: string;
  to: string | string[];
  data: EmailTemplateData;
  scheduledFor?: Date;
  attempts: number;
  maxAttempts: number;
  lastError?: string;
  priority: 'high' | 'normal' | 'low';
}
