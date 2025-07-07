import axios from 'axios';
import { logger } from '../utils/logger';
import {
  EliteSMSConfig,
  SMSStatus,
  SMSResult,
  SMSSendOptions,
  SMSTemplate
} from '../types/sms.types';

export class SMSService {
  private config: EliteSMSConfig;
  private axiosInstance: any;
  private templates: SMSTemplate;

  constructor() {
    this.config = {
      apiKey: process.env.ELITESMS_API_KEY || '',
      userKey: process.env.ELITESMS_USER_KEY || '',
      baseUrl: process.env.ELITESMS_BASE_URL || 'https://wsp.sms-algerie.com/api'
    };

    this.axiosInstance = axios.create({
      baseURL: this.config.baseUrl,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    // Templates par défaut
    this.templates = {
      appointmentConfirmation: 'Votre RDV chez {salonName} est confirmé le {date} à {time} pour {service}. Token de modification: {token}',
      appointmentReminder: 'Rappel: Votre RDV chez {salonName} est demain à {time} pour {service}.',
      appointmentCancellation: 'Votre RDV du {date} à {time} chez {salonName} a été annulé.',
      appointmentModification: 'Votre RDV chez {salonName} a été modifié. Nouvelle date: {date} à {time}.'
    };

    logger.info('SMS Service initialized', {
      baseUrl: this.config.baseUrl,
      hasApiKey: !!this.config.apiKey,
      hasUserKey: !!this.config.userKey
    });
  }

  /**
   * Vérifie si le service est configuré
   */
  isConfigured(): boolean {
    return !!(this.config.apiKey && this.config.userKey);
  }

  /**
   * Formate un numéro de téléphone au format international
   */
  private formatPhoneNumber(phone: string): string {
    // Supprimer tous les espaces et caractères spéciaux
    let cleaned = phone.replace(/[\s\-\(\)\.]/g, '');
    
    // Si le numéro commence par 0, le remplacer par 213
    if (cleaned.startsWith('0')) {
      cleaned = '213' + cleaned.substring(1);
    }
    
    // Si le numéro commence par +, le supprimer
    if (cleaned.startsWith('+')) {
      cleaned = cleaned.substring(1);
    }
    
    return cleaned;
  }

  /**
   * Envoie un SMS simple
   */
  async sendSMS(options: SMSSendOptions): Promise<SMSResult> {
    try {
      if (!this.isConfigured()) {
        throw new Error('Service SMS non configuré');
      }

      // Préparer les numéros
      const numbers = Array.isArray(options.to) ? options.to : [options.to];
      const formattedNumbers = numbers.map(num => this.formatPhoneNumber(num));

      // Préparer les paramètres
      const params: Record<string, any> = {
        apikey: this.config.apiKey,
        userkey: this.config.userKey,
        function: 'sms_send',
        message: options.message,
        to: formattedNumbers.join(',')
      };

      if (options.messagePriority) {
        params.message_priority = options.messagePriority;
      }

      if (options.startDate) {
        params.start_date = options.startDate.toISOString().slice(0, 19).replace('T', ' ');
      }

      if (options.sendIfInsufCredit !== undefined) {
        params.send_if_insuf_credit = options.sendIfInsufCredit ? '1' : '0';
      }

      logger.info('Sending SMS', {
        to: formattedNumbers,
        messageLength: options.message.length
      });

      // Envoyer la requête
      const response = await this.axiosInstance.get('/json', {
        params
      });

      if (response.data.status === 'success' && response.data.result) {
        logger.info('SMS sent successfully', {
          messageId: response.data.result,
          to: formattedNumbers
        });

        return {
          success: true,
          messageId: response.data.result,
          status: SMSStatus.SENT
        };
      } else {
        const error = response.data['error-indicator'] || 'Erreur inconnue';
        logger.error('SMS send failed', {
          error,
          errorId: response.data['error-id']
        });

        return {
          success: false,
          error
        };
      }
    } catch (error) {
      logger.error('SMS send error', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur lors de l\'envoi du SMS'
      };
    }
  }

  /**
   * Récupère le statut d'un SMS
   */
  async getSMSStatus(messageId: string): Promise<SMSResult> {
    try {
      if (!this.isConfigured()) {
        throw new Error('Service SMS non configuré');
      }

      const params = {
        apikey: this.config.apiKey,
        userkey: this.config.userKey,
        function: 'sms_status',
        id: messageId
      };

      const response = await this.axiosInstance.get('/json', {
        params
      });

      if (response.data.status === 'success' && response.data.result) {
        const statuses = response.data.result;
        const firstStatus = statuses[0];

        if (firstStatus) {
          return {
            success: true,
            messageId,
            status: firstStatus.status as SMSStatus,
            cost: parseFloat(firstStatus.cost)
          };
        }
      }

      return {
        success: false,
        error: 'Statut non trouvé'
      };
    } catch (error) {
      logger.error('SMS status error', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur lors de la récupération du statut'
      };
    }
  }

  /**
   * Envoie un SMS de confirmation de rendez-vous
   */
  async sendAppointmentConfirmation(data: {
    to: string;
    salonName: string;
    date: string;
    time: string;
    service: string;
    token: string;
  }): Promise<SMSResult> {
    const message = this.templates.appointmentConfirmation
      .replace('{salonName}', data.salonName)
      .replace('{date}', data.date)
      .replace('{time}', data.time)
      .replace('{service}', data.service)
      .replace('{token}', data.token);

    return this.sendSMS({
      to: data.to,
      message,
      messagePriority: 'Normal'
    });
  }

  /**
   * Envoie un rappel de rendez-vous
   */
  async sendAppointmentReminder(data: {
    to: string;
    salonName: string;
    time: string;
    service: string;
  }): Promise<SMSResult> {
    const message = this.templates.appointmentReminder
      .replace('{salonName}', data.salonName)
      .replace('{time}', data.time)
      .replace('{service}', data.service);

    return this.sendSMS({
      to: data.to,
      message,
      messagePriority: 'Normal'
    });
  }

  /**
   * Envoie une notification d'annulation
   */
  async sendAppointmentCancellation(data: {
    to: string;
    salonName: string;
    date: string;
    time: string;
  }): Promise<SMSResult> {
    const message = this.templates.appointmentCancellation
      .replace('{salonName}', data.salonName)
      .replace('{date}', data.date)
      .replace('{time}', data.time);

    return this.sendSMS({
      to: data.to,
      message,
      messagePriority: 'Urgent'
    });
  }

  /**
   * Envoie une notification de modification
   */
  async sendAppointmentModification(data: {
    to: string;
    salonName: string;
    date: string;
    time: string;
  }): Promise<SMSResult> {
    const message = this.templates.appointmentModification
      .replace('{salonName}', data.salonName)
      .replace('{date}', data.date)
      .replace('{time}', data.time);

    return this.sendSMS({
      to: data.to,
      message,
      messagePriority: 'Urgent'
    });
  }

  /**
   * Met à jour les templates de messages
   */
  updateTemplates(templates: Partial<SMSTemplate>): void {
    this.templates = {
      ...this.templates,
      ...templates
    };
  }

  /**
   * Récupère les templates actuels
   */
  getTemplates(): SMSTemplate {
    return { ...this.templates };
  }
}

// Export une instance singleton
export const smsService = new SMSService();
