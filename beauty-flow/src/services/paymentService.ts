import api from './api';
import i18n from 'i18next';
import { PlanType, SubscriptionDuration } from '../features/subscription/types';

export interface PaymentInitiationResponse {
  success: boolean;
  transactionId: string;
  formUrl: string;
  amount: number;
  amountFormatted: string;
  isTestMode: boolean;
  testAmount?: string;
}

export interface TransactionStatus {
  transactionId: string;
  status: string;
  planType: PlanType;
  amount: number;
  createdAt: string;
  completedAt?: string;
  environment: 'test' | 'production';
}

export interface Transaction {
  id: string;
  planType: PlanType;
  amount: number;
  status: string;
  paymentMethod: string;
  environment: 'test' | 'production';
  createdAt: string;
  completedAt?: string;
  canRefund: boolean;
}

export interface TransactionHistory {
  transactions: Transaction[];
  total: number;
  limit: number;
  skip: number;
}

class PaymentService {
  /**
   * Initie un paiement SATIM pour un plan d'abonnement avec une durée spécifique
   */
  async initiateSatimPayment(
    planType: PlanType, 
    duration: SubscriptionDuration = SubscriptionDuration.MONTHLY
  ): Promise<PaymentInitiationResponse> {
    try {
      const response = await api.post('/payment/satim/initiate', { planType, duration });
      return response.data;
    } catch (error: any) {
      console.error('Failed to initiate SATIM payment:', error);
      throw new Error(
        error.response?.data?.error || i18n.t('subscription:payment_errors.init')
      );
    }
  }

  /**
   * Vérifie le statut d'une transaction
   */
  async checkTransactionStatus(transactionId: string): Promise<TransactionStatus> {
    try {
      const response = await api.get(`/payment/transaction/${transactionId}/status`);
      return response.data;
    } catch (error: any) {
      console.error('Failed to check transaction status:', error);
      throw new Error(
        error.response?.data?.error || i18n.t('subscription:payment_errors.status')
      );
    }
  }

  /**
   * Récupère l'historique des transactions
   */
  async getTransactionHistory(params?: {
    status?: string;
    limit?: number;
    skip?: number;
  }): Promise<TransactionHistory> {
    try {
      const response = await api.get('/payment/transactions', { params });
      return response.data;
    } catch (error: any) {
      console.error('Failed to get transaction history:', error);
      throw new Error(
        error.response?.data?.error || i18n.t('subscription:payment_errors.history')
      );
    }
  }

  /**
   * Redirige vers le formulaire de paiement SATIM
   * Méthode simple et directe
   */
  redirectToSatimPayment(formUrl: string): void {
    console.log('Redirection vers SATIM:', formUrl);
    
    try {
      // Utiliser la méthode originale qui fonctionnait
      console.log('Utilisation de window.location.href pour la redirection');
      window.location.href = formUrl;
      
      // Ajouter un lien de secours après un court délai
      setTimeout(() => {
        // Si la redirection n'a pas fonctionné, afficher un lien
        console.log('Ajout d\'un lien de secours en cas d\'échec de la redirection');
        
        const link = document.createElement('a');
        link.href = formUrl;
        link.target = '_self';
        link.textContent = i18n.t('subscription:payment_errors.fallback_link');
        link.style.display = 'block';
        link.style.margin = '20px auto';
        link.style.padding = '15px 20px';
        link.style.backgroundColor = '#4CAF50';
        link.style.color = 'white';
        link.style.textAlign = 'center';
        link.style.textDecoration = 'none';
        link.style.fontSize = '16px';
        link.style.fontWeight = 'bold';
        link.style.borderRadius = '8px';
        link.style.maxWidth = '400px';
        link.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
        
        const container = document.createElement('div');
        container.style.textAlign = 'center';
        container.style.padding = '30px';
        container.style.backgroundColor = '#f8f9fa';
        container.style.borderRadius = '10px';
        container.style.margin = '30px auto';
        container.style.maxWidth = '500px';
        
        const message = document.createElement('p');
        message.textContent = i18n.t('subscription:payment_errors.fallback_message');
        message.style.marginBottom = '20px';
        message.style.fontSize = '14px';
        
        container.appendChild(message);
        container.appendChild(link);
        document.body.appendChild(container);
      }, 2000);
      
    } catch (error) {
      console.error('Erreur lors de la redirection vers SATIM:', error);
      alert(i18n.t('subscription:payment_errors.redirect'));
    }
  }

  /**
   * Parse les paramètres de retour de paiement depuis l'URL
   */
  parsePaymentReturn(): {
    success?: boolean;
    error?: string;
    plan?: string;
    transactionId?: string;
    amount?: string;
    paymentMethod?: string;
    cardLast4?: string;
  } {
    const params = new URLSearchParams(window.location.search);
    
    // Log pour débogage
    console.log('Paramètres de retour de paiement:', Object.fromEntries(params.entries()));
    
    return {
      success: params.get('success') === 'true',
      error: params.get('error') || undefined,
      plan: params.get('plan') || undefined,
      transactionId: params.get('transaction_id') || undefined,
      amount: params.get('amount') || undefined,
      paymentMethod: params.get('payment_method') || undefined,
      cardLast4: params.get('card_last4') || undefined
    };
  }

  /**
   * Nettoie les paramètres de paiement de l'URL
   */
  clearPaymentParams(): void {
    const url = new URL(window.location.href);
    url.searchParams.delete('success');
    url.searchParams.delete('error');
    url.searchParams.delete('plan');
    url.searchParams.delete('transaction_id');
    url.searchParams.delete('amount');
    url.searchParams.delete('payment_method');
    url.searchParams.delete('card_last4');
    window.history.replaceState({}, document.title, url.pathname);
  }

  /**
   * Formate un montant en DZD
   */
  formatAmount(amount: number): string {
    return new Intl.NumberFormat('fr-DZ', {
      style: 'currency',
      currency: 'DZD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  /**
   * Obtient le message d'erreur approprié selon le code
   */
  getErrorMessage(errorCode?: string): string {
    const known = ['missing_transaction', 'transaction_not_found', 'payment_failed', 'payment_cancelled', 'processing_error', 'invalid_transaction'];
    return known.includes(errorCode || '') ? i18n.t(`subscription:payment_errors.codes.${errorCode}`) : i18n.t('errors:general.generic');
  }

  /**
   * Vérifie si l'environnement est en mode test
   */
  isTestMode(): boolean {
    return import.meta.env.MODE === 'development' || 
           import.meta.env.VITE_SATIM_TEST_MODE === 'true';
  }
}

export const paymentService = new PaymentService();
