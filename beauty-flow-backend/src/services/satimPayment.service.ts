import axios from 'axios';
import {
  SatimConfig,
  SatimConfirmResponse,
  SatimJsonParams,
  SatimOrderStatus,
  SatimErrorCode
} from '../types/satim.types';
import { PlanType, PriceCalculator, SubscriptionDuration } from '../utils/priceCalculator';
import { logger } from '../utils/logger';

export class SatimPaymentService {
  private config: SatimConfig;
  private axiosInstance: any;

  constructor() {
    const environment = process.env.NODE_ENV === 'production' ? 'production' : 'test';
    
    this.config = {
      username: environment === 'production' 
        ? process.env.SATIM_PROD_USERNAME || ''
        : process.env.SATIM_TEST_USERNAME || 'SAT2507010254',
      password: environment === 'production'
        ? process.env.SATIM_PROD_PASSWORD || ''
        : process.env.SATIM_TEST_PASSWORD || 'satim120',
      terminalId: environment === 'production'
        ? process.env.SATIM_PROD_TERMINAL_ID || ''
        : process.env.SATIM_TEST_TERMINAL_ID || 'E010901571',
      baseUrl: environment === 'production'
        ? process.env.SATIM_PROD_URL || 'https://satim.dz'
        : process.env.SATIM_TEST_URL || 'https://test.satim.dz',
      environment
    };

    this.axiosInstance = axios.create({
      baseURL: this.config.baseUrl,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    // Log configuration (sans les mots de passe)
    logger.info('SATIM Payment Service initialized', {
      environment: this.config.environment,
      baseUrl: this.config.baseUrl,
      terminalId: this.config.terminalId
    });
  }

  /**
   * Enregistre une commande auprès de SATIM
   */
  async registerOrder(
    userId: string,
    planType: PlanType,
    returnUrl: string,
    failUrl: string,
    duration: SubscriptionDuration = SubscriptionDuration.MONTHLY
  ): Promise<{ orderId: string; formUrl: string; orderNumber: string }> {
    try {
      // Vérifier si le plan nécessite un paiement
      if (!PriceCalculator.requiresPayment(planType)) {
        throw new Error(`Le plan ${planType} ne nécessite pas de paiement`);
      }

      // Obtenir le montant selon l'environnement et la durée
      const amount = PriceCalculator.getSatimAmount(planType, duration, this.config.environment);
      if (!amount) {
        throw new Error(`Impossible de déterminer le montant pour le plan ${planType} et la durée ${duration}`);
      }

      // Générer un numéro de commande unique (max 10 caractères)
      const timestamp = Date.now().toString().slice(-6); // 6 derniers chiffres
      const random = Math.floor(Math.random() * 100).toString().padStart(2, '0'); // 2 chiffres
      const orderNumber = `BF${timestamp}${random}`; // BF + 6 + 2 = 10 caractères

      // Préparer les paramètres JSON
      const jsonParams: SatimJsonParams = {
        force_terminal_id: this.config.terminalId,
        udf1: userId, // ID utilisateur pour référence
        udf2: planType, // Type de plan
        udf3: duration, // Durée d'abonnement
        udf4: this.config.environment, // Environnement
        udf5: new Date().toISOString() // Date de création
      };

      // Préparer la requête
      const params = new URLSearchParams({
        userName: this.config.username,
        password: this.config.password,
        orderNumber,
        amount: amount.toString(),
        currency: '012', // DZD
        returnUrl,
        failUrl,
        description: `Abonnement Saloneo - Plan ${planType} - ${duration}`,
        language: 'FR',
        jsonParams: JSON.stringify(jsonParams)
      });

      logger.info('Registering SATIM order', {
        orderNumber,
        planType,
        amount,
        environment: this.config.environment
      });

      // Envoyer la requête
      const response = await this.axiosInstance.get(
        '/payment/rest/register.do',
        { params }
      );

      // Vérifier la réponse
      if (response.data.errorCode && response.data.errorCode !== '0' && response.data.errorCode !== 0) {
        logger.error('SATIM registration error', {
          errorCode: response.data.errorCode,
          errorMessage: response.data.errorMessage
        });
        throw new Error(`Erreur SATIM: ${response.data.errorMessage || 'Erreur inconnue'}`);
      }

      if (!response.data.orderId || !response.data.formUrl) {
        throw new Error('Réponse SATIM invalide: orderId ou formUrl manquant');
      }

      logger.info('SATIM order registered successfully', {
        orderId: response.data.orderId,
        orderNumber
      });

      return {
        orderId: response.data.orderId,
        formUrl: response.data.formUrl,
        orderNumber
      };
    } catch (error) {
      logger.error('Failed to register SATIM order', error);
      throw error;
    }
  }

  /**
   * Confirme une commande après le retour du client
   */
  async confirmOrder(orderId: string): Promise<{
    status: SatimOrderStatus;
    success: boolean;
    details?: SatimConfirmResponse;
  }> {
    try {
      const params = new URLSearchParams({
        userName: this.config.username,
        password: this.config.password,
        orderId,
        language: 'FR'
      });

      logger.info('Confirming SATIM order', { orderId });

      const response = await this.axiosInstance.get(
        '/payment/rest/confirmOrder.do',
        { params }
      );

      // Vérifier les erreurs
      if (response.data.errorCode && response.data.errorCode !== SatimErrorCode.SUCCESS) {
        logger.error('SATIM confirmation error', {
          errorCode: response.data.errorCode,
          errorMessage: response.data.errorMessage
        });
        
        return {
          status: SatimOrderStatus.AUTHORIZATION_REJECTED,
          success: false,
          details: response.data
        };
      }

      // Vérifier le statut de la commande
      const status = response.data.orderStatus || SatimOrderStatus.AUTHORIZATION_REJECTED;
      const success = status === SatimOrderStatus.AUTHORIZED || status === SatimOrderStatus.PRE_AUTHORIZED;

      logger.info('SATIM order confirmation result', {
        orderId,
        status,
        success,
        actionCode: response.data.actionCode
      });

      return {
        status,
        success,
        details: response.data
      };
    } catch (error) {
      logger.error('Failed to confirm SATIM order', error);
      throw error;
    }
  }

  /**
   * Effectue un remboursement
   */
  async refundOrder(orderId: string, amount: number): Promise<boolean> {
    try {
      const params = new URLSearchParams({
        userName: this.config.username,
        password: this.config.password,
        orderId,
        amount: amount.toString(),
        currency: '012',
        language: 'FR'
      });

      logger.info('Refunding SATIM order', { orderId, amount });

      const response = await this.axiosInstance.get(
        '/payment/rest/refund.do',
        { params }
      );

      const success = response.data.errorCode === SatimErrorCode.SUCCESS;

      if (!success) {
        logger.error('SATIM refund error', {
          errorCode: response.data.errorCode,
          errorMessage: response.data.errorMessage
        });
      } else {
        logger.info('SATIM order refunded successfully', { orderId });
      }

      return success;
    } catch (error) {
      logger.error('Failed to refund SATIM order', error);
      throw error;
    }
  }

  /**
   * Vérifie si le service est correctement configuré
   */
  isConfigured(): boolean {
    return !!(
      this.config.username &&
      this.config.password &&
      this.config.terminalId &&
      this.config.baseUrl
    );
  }

  /**
   * Obtient l'environnement actuel
   */
  getEnvironment(): 'test' | 'production' {
    return this.config.environment;
  }

  /**
   * Génère les URLs de retour pour une commande
   */
  generateReturnUrls(baseUrl: string, transactionId: string): {
    returnUrl: string;
    failUrl: string;
  } {
    return {
      returnUrl: `${baseUrl}/api/payment/satim/return?transactionId=${transactionId}`,
      failUrl: `${baseUrl}/api/payment/satim/fail?transactionId=${transactionId}`
    };
  }
}

// Export une instance singleton
export const satimPaymentService = new SatimPaymentService();
