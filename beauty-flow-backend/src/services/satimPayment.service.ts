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

  /* ── Generic payments (online deposits) ─────────────────────────────────────
   * Amounts in centimes (DA × 100). With SATIM_MOCK=1 outside production, a local mock gateway
   * (see satimMock below and /api/payment/satim-mock) stands in for SATIM so the flow runs end to end.
   */

  /** register.do for any payment; returns the SATIM order and the payment page URL. */
  async registerPayment(p: {
    orderNumber: string; amount: number; returnUrl: string; failUrl: string;
    description: string; udf1: string; udf2?: string; language?: string;
  }): Promise<{ orderId: string; formUrl: string }> {
    const language = ['AR', 'FR', 'EN'].includes(String(p.language).toUpperCase()) ? String(p.language).toUpperCase() : 'FR';
    if (satimMockEnabled()) return satimMock.register(p);
    const params = new URLSearchParams({
      userName: this.config.username,
      password: this.config.password,
      orderNumber: p.orderNumber,
      amount: String(Math.round(p.amount)),
      currency: '012',
      returnUrl: p.returnUrl,
      failUrl: p.failUrl,
      description: p.description.slice(0, 99),
      language,
      jsonParams: JSON.stringify({ force_terminal_id: this.config.terminalId, udf1: p.udf1, ...(p.udf2 ? { udf2: p.udf2 } : {}) }),
    });
    const { data } = await this.axiosInstance.get('/payment/rest/register.do', { params });
    const code = String(data?.errorCode ?? data?.ErrorCode ?? '0');
    if (code !== '0' || !data?.orderId || !data?.formUrl) {
      logger.error('SATIM register error', { orderNumber: p.orderNumber, errorCode: code, errorMessage: data?.errorMessage ?? data?.ErrorMessage });
      throw new Error(`SATIM register failed (${code})`);
    }
    logger.info('SATIM payment registered', { orderNumber: p.orderNumber, orderId: data.orderId });
    return { orderId: data.orderId, formUrl: data.formUrl };
  }

  /**
   * confirmOrder.do, normalized. Safe to call repeatedly: an already-confirmed order (ErrorCode 2)
   * still reports OrderStatus 2. Only the last 4 card digits are kept; nothing card-related is logged.
   */
  async checkPayment(orderId: string): Promise<{ paid: boolean; status: number; message?: string; cardLast4?: string; approvalCode?: string }> {
    if (satimMockEnabled()) return satimMock.check(orderId);
    const params = new URLSearchParams({ userName: this.config.username, password: this.config.password, orderId, language: 'FR' });
    const { data } = await this.axiosInstance.get('/payment/rest/confirmOrder.do', { params });
    const status = Number(data?.OrderStatus ?? data?.orderStatus ?? -1);
    const paid = status === SatimOrderStatus.AUTHORIZED || status === SatimOrderStatus.PRE_AUTHORIZED;
    const pan = String(data?.Pan ?? data?.pan ?? '');
    logger.info('SATIM payment checked', { orderId, status, paid, errorCode: data?.ErrorCode ?? data?.errorCode, actionCode: data?.actionCode });
    return {
      paid,
      status,
      message: data?.params?.respCode_desc || data?.actionCodeDescription || data?.ErrorMessage || data?.errorMessage,
      cardLast4: pan.length >= 4 ? pan.slice(-4) : undefined,
      approvalCode: data?.approvalCode,
    };
  }

  /** refund.do, normalized (never throws on a gateway refusal; network errors do throw). */
  async refundPayment(orderId: string, amount: number): Promise<{ ok: boolean; message?: string }> {
    if (satimMockEnabled()) return satimMock.refund(orderId, amount);
    const params = new URLSearchParams({
      userName: this.config.username, password: this.config.password, orderId,
      amount: String(Math.round(amount)), currency: '012', language: 'FR',
    });
    const { data } = await this.axiosInstance.get('/payment/rest/refund.do', { params });
    const code = String(data?.errorCode ?? data?.ErrorCode ?? '');
    const ok = code === SatimErrorCode.SUCCESS;
    logger[ok ? 'info' : 'error']('SATIM refund', { orderId, errorCode: code, errorMessage: data?.errorMessage ?? data?.ErrorMessage });
    return { ok, message: data?.errorMessage ?? data?.ErrorMessage };
  }

  /**
   * Vérifie si le service est correctement configuré
   */
  isConfigured(): boolean {
    if (satimMockEnabled()) return true;
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

/* ── Dev-only mock gateway ─────────────────────────────────────────────────── */

/** Read at call time (dotenv may load after imports). Never active in production. */
export const satimMockEnabled = () => process.env.SATIM_MOCK === '1' && process.env.NODE_ENV !== 'production';

type MockOrder = { amount: number; orderNumber: string; description: string; returnUrl: string; failUrl: string; status: number; refundFails?: boolean; refunded?: boolean };
// ponytail: in-memory, orders vanish on API restart (a pending payment then reads as unpaid) — fine for local testing
const mockOrders = new Map<string, MockOrder>();

export const satimMock = {
  register(p: { orderNumber: string; amount: number; returnUrl: string; failUrl: string; description: string }) {
    const orderId = `mock-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
    mockOrders.set(orderId, { amount: p.amount, orderNumber: p.orderNumber, description: p.description, returnUrl: p.returnUrl, failUrl: p.failUrl, status: SatimOrderStatus.REGISTERED });
    const base = process.env.API_PUBLIC_URL || `http://localhost:${process.env.PORT || 5000}`;
    return { orderId, formUrl: `${base}/api/payment/satim-mock/pay?orderId=${orderId}` };
  },
  check(orderId: string) {
    const o = mockOrders.get(orderId);
    const status = o ? (o.refunded ? SatimOrderStatus.REFUNDED : o.status) : SatimOrderStatus.REGISTERED;
    const paid = status === SatimOrderStatus.AUTHORIZED;
    return {
      paid, status,
      message: status === SatimOrderStatus.AUTHORIZATION_REJECTED ? 'Solde carte insuffisant' : paid ? 'Votre paiement a été accepté' : undefined,
      cardLast4: paid ? '1011' : undefined,
      approvalCode: paid ? '123456' : undefined,
    };
  },
  refund(orderId: string, _amount: number) {
    const o = mockOrders.get(orderId);
    if (!o || o.status !== SatimOrderStatus.AUTHORIZED || o.refundFails) return { ok: false, message: 'Remboursement refusé (simulation)' };
    o.refunded = true;
    return { ok: true };
  },
  get: (orderId: string) => mockOrders.get(orderId),
  /** success | success_refund_fails | declined | cancel → where the browser goes next (like SATIM). */
  act(orderId: string, action: string): string | null {
    const o = mockOrders.get(orderId);
    if (!o) return null;
    o.status = action.startsWith('success') ? SatimOrderStatus.AUTHORIZED : action === 'declined' ? SatimOrderStatus.AUTHORIZATION_REJECTED : SatimOrderStatus.REGISTERED;
    o.refundFails = action === 'success_refund_fails';
    const url = action.startsWith('success') ? o.returnUrl : o.failUrl;
    return `${url}${url.includes('?') ? '&' : '?'}orderId=${encodeURIComponent(orderId)}`;
  },
};

// Export une instance singleton
export const satimPaymentService = new SatimPaymentService();
