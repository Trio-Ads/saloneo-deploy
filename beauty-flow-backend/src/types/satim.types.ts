// Types pour l'intégration SATIM Payment Gateway

export interface SatimConfig {
  username: string;
  password: string;
  terminalId: string;
  baseUrl: string;
  environment: 'test' | 'production';
}

export interface SatimRegisterRequest {
  userName: string;
  password: string;
  orderNumber: string;
  amount: number;
  currency: string;
  returnUrl: string;
  failUrl: string;
  description?: string;
  language: 'AR' | 'FR' | 'EN';
  jsonParams: string;
}

export interface SatimRegisterResponse {
  orderId?: string;
  formUrl?: string;
  errorCode?: string;
  errorMessage?: string;
}

export interface SatimConfirmRequest {
  userName: string;
  password: string;
  orderId: string;
  language: 'AR' | 'FR' | 'EN';
}

export interface SatimConfirmResponse {
  orderStatus?: number;
  errorCode?: string;
  errorMessage?: string;
  orderNumber?: string;
  actionCode?: number;
  actionCodeDescription?: string;
  pan?: string;
  expiration?: string;
  cardholderName?: string;
  amount?: number;
  currency?: string;
  approvalCode?: string;
  authCode?: number;
  ip?: string;
  bindingInfo?: {
    clientId?: string;
    bindingId?: string;
  };
}

export interface SatimRefundRequest {
  userName: string;
  password: string;
  orderId: string;
  amount: number;
  currency?: string;
  language?: 'AR' | 'FR' | 'EN';
}

export interface SatimRefundResponse {
  errorCode: string;
  errorMessage?: string;
}

export interface SatimJsonParams {
  force_terminal_id: string;
  udf1: string;
  udf2?: string;
  udf3?: string;
  udf4?: string;
  udf5?: string;
}

export enum SatimOrderStatus {
  REGISTERED = 0,
  PRE_AUTHORIZED = 1,
  AUTHORIZED = 2,
  AUTHORIZATION_CANCELLED = 3,
  REFUNDED = 4,
  AUTHORIZATION_THROUGH_ACS = 5,
  AUTHORIZATION_REJECTED = 6
}

export enum SatimErrorCode {
  SUCCESS = '0',
  EMPTY_ORDER_ID = '1',
  ALREADY_CONFIRMED = '2',
  ACCESS_DENIED = '3',
  UNKNOWN_ORDER = '6',
  SYSTEM_ERROR = '7'
}

// Test cards provided by SATIM
export const SATIM_TEST_CARDS = {
  VALID: {
    number: '628058061006101101',
    expiry: '01/2027',
    cvv: '992',
    password: '123456',
    description: 'Credit valide'
  },
  INSUFFICIENT_BALANCE: {
    number: '628058061006111001',
    expiry: '01/2027',
    cvv: '260',
    password: '123456',
    description: 'Solde Carte Insuffisant'
  },
  BLOCKED: {
    number: '628058111000671201',
    expiry: '01/2027',
    cvv: '897',
    password: '123456',
    description: 'TEMPORARILY BLOCKED'
  },
  EXPIRED: {
    number: '628058061005661512',
    expiry: '12/2022',
    cvv: '428',
    password: '123456',
    description: 'Carte expiré'
  }
};
