import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { XMarkIcon, ShieldCheckIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { IconButton } from '../../../components/ui';
import { formatPrice } from '../../../utils/currency';
import { PlanType, SubscriptionDuration, DURATION_PRICES, DURATION_DISCOUNTS } from '../types';
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
  
  // Reset states when modal is opened/closed
  useEffect(() => {
    if (isOpen) {
      setTermsAccepted(false);
      setError(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || isLoading) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, isLoading, onClose]);

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

  const getDurationLabel = () => t(`plan_card.durations.${duration}`);

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

  const total = 'total' in displayPrice ? displayPrice.total : displayPrice.amount;
  const promoPercent = planPrice.isPromo && planPrice.regularAmount ? Math.round((1 - planPrice.amount / planPrice.regularAmount) * 100) : 0;
  const row = 'flex items-baseline justify-between gap-4 py-2.5 text-sm';

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center overflow-y-auto bg-gray-900/50 sm:items-center sm:p-4" onClick={() => !isLoading && onClose()}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="payment-title"
        onClick={(e) => e.stopPropagation()}
        className="animate-modal-in sheet-on-mobile flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-2xl border border-gray-200 bg-white shadow-xl dark:border-gray-800 dark:bg-gray-900 sm:max-w-md sm:rounded-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 dark:border-gray-800">
          <h2 id="payment-title" className="text-base font-semibold text-gray-900 dark:text-gray-50">
            {t('payment.secure_payment')}
          </h2>
          <IconButton label={t('payment.cancel')} onClick={onClose} disabled={isLoading}>
            <XMarkIcon className="size-5" />
          </IconButton>
        </div>

        {/* Content */}
        <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5">
          {/* Récapitulatif — montant total mis en évidence (exigence SATIM) */}
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">{t('payment.total_amount')}</p>
            <p className="mt-1 font-display text-3xl font-semibold tabular-nums text-gray-900 dark:text-gray-50">{formatPrice(total, 'DZD')}</p>
            <dl className="mt-3 divide-y divide-gray-100 border-y border-gray-100 dark:divide-gray-800 dark:border-gray-800">
              <div className={row}>
                <dt className="text-gray-500 dark:text-gray-400">{t('payment.plan')}</dt>
                <dd className="font-medium text-gray-900 dark:text-gray-50">{planType}</dd>
              </div>
              <div className={row}>
                <dt className="text-gray-500 dark:text-gray-400">{t('payment.duration')}</dt>
                <dd className="font-medium text-gray-900 dark:text-gray-50">{getDurationLabel()}</dd>
              </div>
              {duration === SubscriptionDuration.MONTHLY ? (
                promoPercent > 0 && (
                  <div className={row}>
                    <dt className="text-gray-500 dark:text-gray-400">{t('payment.regular_price')}</dt>
                    <dd className="tabular-nums">
                      <span className="text-gray-400 line-through">{formatPrice(planPrice.regularAmount!, 'DZD')}</span>
                      <span className="ms-2 font-medium text-emerald-700 dark:text-emerald-400">−{promoPercent} %</span>
                    </dd>
                  </div>
                )
              ) : (
                <div className={row}>
                  <dt className="text-gray-500 dark:text-gray-400">{t('payment.per_month_equivalent')}</dt>
                  <dd className="tabular-nums text-gray-900 dark:text-gray-50">
                    {formatPrice('monthly' in displayPrice ? displayPrice.monthly : total, 'DZD')}
                    <span className="ms-2 font-medium text-emerald-700 dark:text-emerald-400">−{DURATION_DISCOUNTS[duration.toLowerCase() as 'yearly' | 'biennial' | 'triennial']} %</span>
                  </dd>
                </div>
              )}
            </dl>
          </div>

          {/* Test Mode Warning */}
          {isTestMode && (
            <div className="flex items-start gap-3 rounded-xl bg-amber-50 p-3 text-sm text-amber-900 dark:bg-amber-500/10 dark:text-amber-200">
              <ExclamationTriangleIcon className="mt-0.5 size-5 shrink-0" />
              <div>
                <p className="font-medium">{t('payment.test_mode.title')}</p>
                <p className="mt-0.5">{t('payment.test_mode.description')}</p>
              </div>
            </div>
          )}

          {/* Security */}
          <div className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-400">
            <ShieldCheckIcon className="mt-0.5 size-5 shrink-0 text-gray-400" />
            <p>{t('payment.security_features.satim')} · {t('payment.security_features.cards')}</p>
            <img
              src="/images/cib-logo.webp"
              alt="CIB"
              className="ms-auto h-6 shrink-0"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>

          {/* Terms and Conditions */}
          <div>
            <label htmlFor="terms" className="flex cursor-pointer items-start gap-3 text-sm text-gray-700 dark:text-gray-300">
              <input
                type="checkbox"
                id="terms"
                checked={termsAccepted}
                onChange={(e) => { setTermsAccepted(e.target.checked); setError(null); }}
                className="mt-0.5 size-4 shrink-0 rounded border-gray-300 text-orange-500 focus:ring-orange-500 dark:border-gray-600 dark:bg-gray-800"
              />
              <span>{t('payment.accept_terms')}</span>
            </label>
            <button type="button" onClick={toggleTerms} aria-expanded={showTerms} className="ms-7 mt-1 text-sm font-medium text-orange-600 underline-offset-2 hover:underline dark:text-orange-400">
              {t('payment.read_terms')}
            </button>
            {showTerms && (
              <div className="mt-2 max-h-40 overflow-y-auto rounded-xl bg-gray-50 p-3 text-sm text-gray-600 dark:bg-gray-800/60 dark:text-gray-400">
                <h4 className="mb-1 font-medium text-gray-900 dark:text-gray-200">{t('payment.terms_title')}</h4>
                <p className="mb-2">{t('payment.terms_content')}</p>
                <p>{t('payment.terms_content2')}</p>
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-300">{error}</p>
          )}

          <p className="text-xs text-gray-500 dark:text-gray-400">{t('payment.info')}</p>
        </div>

        {/* Footer */}
        <div className="flex flex-col-reverse gap-2 border-t border-gray-100 px-5 py-4 dark:border-gray-800 sm:flex-row" style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}>
          <button onClick={onClose} disabled={isLoading} className="btn-secondary flex-1">
            {t('payment.cancel')}
          </button>
          <button onClick={handlePayment} disabled={isLoading} className="btn-primary flex-1">
            {isLoading ? (
              <>
                <span className="size-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                {t('payment.processing')}
              </>
            ) : (
              t('payment.proceed')
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
