import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { XMarkIcon, CreditCardIcon, ShieldCheckIcon, ExclamationTriangleIcon, ClockIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import { PlanType, SubscriptionDuration, DURATION_PRICES } from '../types';
import { paymentService } from '../../../services/paymentService';
import { PLAN_PRICES } from '../types';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  planType: PlanType;
  duration?: SubscriptionDuration;
  onSuccess?: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  planType,
  duration = SubscriptionDuration.MONTHLY,
  onSuccess
}) => {
  const { t } = useTranslation('subscription');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  
  // Reset states when modal is opened/closed
  useEffect(() => {
    if (isOpen) {
      setTermsAccepted(false);
      setError(null);
      
      // Scroll to modal when it opens
      setTimeout(() => {
        if (modalRef.current) {
          // Scroll to the modal with smooth behavior
          modalRef.current.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
          });
        }
      }, 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const planPrice = PLAN_PRICES[planType];
  const durationPrices = DURATION_PRICES[planType];
  const isTestMode = paymentService.isTestMode();

  // Calculate price according to duration
  const getDisplayPrice = () => {
    if (!durationPrices) return planPrice;
    
    const durationKey = duration.toLowerCase() as 'monthly' | 'yearly' | 'biennial' | 'triennial';
    const totalPrice = durationPrices[durationKey];
    const monthlyEquivalent = totalPrice / {
      [SubscriptionDuration.MONTHLY]: 1,
      [SubscriptionDuration.YEARLY]: 12,
      [SubscriptionDuration.BIENNIAL]: 24,
      [SubscriptionDuration.TRIENNIAL]: 36
    }[duration];

    return {
      total: totalPrice,
      monthly: Math.round(monthlyEquivalent),
      currency: durationPrices.currency
    };
  };

  const getDurationLabel = () => {
    switch (duration) {
      case SubscriptionDuration.MONTHLY:
        return t('billing.monthly');
      case SubscriptionDuration.YEARLY:
        return t('billing.yearly');
      case SubscriptionDuration.BIENNIAL:
        return t('billing.yearly') + ' (2 ans)';
      case SubscriptionDuration.TRIENNIAL:
        return t('billing.yearly') + ' (3 ans)';
    }
  };

  const displayPrice = getDisplayPrice();

  const handlePayment = async () => {
    console.log('Début du processus de paiement pour le plan:', planType, 'avec durée:', duration);
    
    // Vérifier que les conditions sont acceptées
    if (!termsAccepted) {
      console.log('Erreur: Conditions non acceptées');
      setError(t('payment.terms_required'));
      return;
    }
    
    console.log('Conditions acceptées, initialisation du paiement...');
    setIsLoading(true);
    setError(null);

    try {
      console.log('Appel API pour initier le paiement SATIM...');
      const response = await paymentService.initiateSatimPayment(planType, duration);
      
      console.log('Réponse API reçue:', response);
      console.log('URL de formulaire SATIM:', response.formUrl);
      
      // Ajouter un petit délai avant la redirection pour s'assurer que l'état est bien mis à jour
      console.log('Redirection vers SATIM dans 500ms...');
      
      setTimeout(() => {
        console.log('Tentative de redirection vers SATIM...');
        // Redirect to SATIM
        paymentService.redirectToSatimPayment(response.formUrl);
      }, 500);
      
      // The onSuccess callback will be called after returning from SATIM
    } catch (err: any) {
      console.error('Erreur lors de l\'initialisation du paiement:', err);
      setError(err.message || t('payment.processing'));
      setIsLoading(false);
    }
  };
  
  const toggleTerms = () => {
    setShowTerms(!showTerms);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 p-4 overflow-y-auto" style={{ paddingTop: '10vh' }}>
      <div ref={modalRef} className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-y-auto my-8">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">
              {t('payment.secure_payment')}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 transition-colors"
              disabled={isLoading}
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Plan Details */}
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {t('payment.plan')} {planType}
            </h3>
            
            {/* Selected duration */}
            <div className="flex items-center gap-2 mb-3">
              <ClockIcon className="h-5 w-5 text-indigo-600" />
              <span className="text-sm font-medium text-gray-700">
                {t('payment.duration')}: {getDurationLabel()}
              </span>
            </div>

            {/* Price according to duration - Mise en évidence selon exigences SATIM */}
            {duration === SubscriptionDuration.MONTHLY ? (
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    {planPrice.amount.toLocaleString('fr-DZ')}
                  </span>
                  <span className="text-gray-600">DZD/{t('payment.monthly')}</span>
                </div>
                <div className="mt-2 text-lg font-semibold text-gray-800">
                  {t('payment.total_amount')}: <span className="text-indigo-700">{planPrice.amount.toLocaleString('fr-DZ')} DZD</span>
                </div>
                {planPrice.isPromo && planPrice.regularAmount && (
                  <div className="mt-2">
                    <span className="text-sm text-gray-500 line-through">
                      {planPrice.regularAmount.toLocaleString('fr-DZ')} DZD
                    </span>
                    <span className="ml-2 text-sm font-semibold text-green-600">
                      -40% {t('payment.discount')}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    {'total' in displayPrice ? displayPrice.total.toLocaleString('fr-DZ') : displayPrice.amount.toLocaleString('fr-DZ')}
                  </span>
                  <span className="text-gray-600">DZD</span>
                </div>
                <div className="mt-2 text-lg font-semibold text-gray-800">
                  {t('payment.total_amount')}: <span className="text-indigo-700">{'total' in displayPrice ? displayPrice.total.toLocaleString('fr-DZ') : displayPrice.amount.toLocaleString('fr-DZ')} DZD</span>
                </div>
                <div className="mt-1 text-sm text-gray-600">
                  {t('payment.economy')} {'monthly' in displayPrice ? displayPrice.monthly.toLocaleString('fr-DZ') : displayPrice.amount.toLocaleString('fr-DZ')} DZD/{t('payment.monthly')}
                </div>
                <div className="mt-2 bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded-lg inline-block">
                  {t('payment.economy')} {duration === SubscriptionDuration.YEARLY ? '25%' : 
                             duration === SubscriptionDuration.BIENNIAL ? '35%' : '50%'}
                </div>
              </div>
            )}
          </div>

          {/* Test Mode Warning */}
          {isTestMode && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start">
                <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-semibold text-yellow-800 mb-1">
                    {t('payment.test_mode.title')}
                  </p>
                  <p className="text-yellow-700">
                    {t('payment.test_mode.description')}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Security Features */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <ShieldCheckIcon className="h-5 w-5 text-green-600" />
              <span className="text-sm text-gray-700">
                {t('payment.security_features.satim')}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <CreditCardIcon className="h-5 w-5 text-green-600" />
              <span className="text-sm text-gray-700">
                {t('payment.security_features.cards')}
              </span>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Security Notice */}
          <div className="flex items-center gap-2 my-4 p-3 bg-blue-50 rounded-lg text-sm text-blue-700">
            <ShieldCheckIcon className="h-5 w-5 text-blue-500" />
            <span>{t('payment.security_notice')}</span>
          </div>
          
          {/* Terms and Conditions */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-start mb-2">
              <input
                type="checkbox"
                id="terms"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="mt-1 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
                {t('payment.accept_terms')} <button type="button" onClick={toggleTerms} className="text-indigo-600 hover:text-indigo-800 underline">{t('payment.read_terms')}</button>
              </label>
            </div>
            
            {showTerms && (
              <div className="mt-2 p-3 bg-white rounded-lg border border-gray-200 max-h-40 overflow-y-auto text-sm text-gray-600">
                <h4 className="font-semibold mb-1">{t('payment.terms_title')}</h4>
                <p className="mb-2">{t('payment.terms_content')}</p>
                <p>{t('payment.terms_content2')}</p>
              </div>
            )}
          </div>
          
          {/* Payment Info */}
          <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600 mt-4">
            <p>
              {t('payment.info')}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t('actions.cancel')}
            </button>
            <button
              onClick={handlePayment}
              disabled={isLoading}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:from-indigo-700 hover:to-purple-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>{t('payment.processing')}</span>
                </>
              ) : (
                <>
              <div className="flex items-center">
                <CreditCardIcon className="h-5 w-5 mr-2" />
                <span>{t('payment.proceed')}</span>
                <img 
                  src="/images/cib-logo.webp" 
                  alt="CIB" 
                  className="h-5 ml-2"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
