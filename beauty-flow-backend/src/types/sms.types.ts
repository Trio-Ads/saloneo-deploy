// Types pour l'API eliteSMS
export interface EliteSMSConfig {
  apiKey: string;
  userKey: string;
  baseUrl: string;
}

// Statuts de réception SMS
export enum SMSStatus {
  SCHEDULED = 'R',           // SMS programmé pour un envoi ultérieur
  READY = 'U',              // SMS prêt à être envoyé
  QUEUED = 'Q',             // SMS en fil d'attente
  SENT = 'S',               // SMS envoyé à l'opérateur
  PENDING = 'P',            // SMS suspendu, en attente de livraison
  DELIVERED = 'D',          // SMS reçu par le destinataire
  REJECTED = 'A',           // SMS rejeté par l'opérateur
  ERROR = 'E',              // Échec au niveau du service
  INVALID = 'F',            // Numéro invalide
  INSUFFICIENT_CREDIT = 'I'  // Crédit insuffisant
}

// Réponse de l'API eliteSMS
export interface EliteSMSResponse {
  status: 'success' | 'fail';
  result?: any;
  'result-count'?: number;
  'error-id'?: number;
  'error-indicator'?: string;
}

// Réponse d'envoi SMS
export interface SMSSendResponse extends EliteSMSResponse {
  result?: string; // ID du message
}

// Statut d'un SMS
export interface SMSStatusInfo {
  to: string;
  from: string;
  status: SMSStatus;
  parts: string;
  cost: string;
  treated: string;
  received: string;
}

// Réponse de statut SMS
export interface SMSStatusResponse extends EliteSMSResponse {
  result?: SMSStatusInfo[];
}

// Templates SMS
export interface SMSTemplate {
  appointmentConfirmation: string;
  appointmentReminder: string;
  appointmentCancellation: string;
  appointmentModification: string;
}

// Résultat d'envoi SMS
export interface SMSResult {
  success: boolean;
  messageId?: string;
  error?: string;
  cost?: number;
  status?: SMSStatus;
}

// Options d'envoi SMS
export interface SMSSendOptions {
  to: string | string[];
  message: string;
  messagePriority?: string;
  contactPriority?: string;
  startDate?: Date;
  sendIfInsufCredit?: boolean;
}

// Historique SMS
export interface SMSHistory {
  id: string;
  userId: string;
  to: string;
  message: string;
  status: SMSStatus;
  cost: number;
  sentAt: Date;
  deliveredAt?: Date;
  error?: string;
  type: 'appointment_confirmation' | 'appointment_reminder' | 'appointment_cancellation' | 'appointment_modification' | 'custom';
  appointmentId?: string;
}
