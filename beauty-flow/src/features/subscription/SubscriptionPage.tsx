import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  SparklesIcon, 
  RocketLaunchIcon, 
  BuildingOfficeIcon,
  StarIcon,
  CheckCircleIcon,
  ArrowTrendingUpIcon,
  ShieldCheckIcon,
  HeartIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import { PlanCardWithDuration } from './components/PlanCardWithDuration';
import { PaymentModal } from './components/PaymentModal';
import { PaymentSuccess } from './components/PaymentSuccess';
import { PaymentFailed } from './components/PaymentFailed';
import { useSubscriptionStore } from './store';
import { PLAN_LIMITS, PLAN_PRICES, PlanType, Plan, SubscriptionDuration } from './types';
import { paymentService } from '../../services/paymentService';

export const SubscriptionPage: React.FC = () => {
  const { t } = useTranslation('subscription');
  const { subscription, updateSubscription } = useSubscriptionStore();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PlanType | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<SubscriptionDuration>(SubscriptionDuration.MONTHLY);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'success' | 'failed'>('idle');
  const [paymentError, setPaymentError] = useState<string | undefined>();

  const plans: Plan[] = Object.values(PlanType).map((type) => ({
    type,
    limits: PLAN_LIMITS[type],
    price: PLAN_PRICES[type]
  }));

  // Check payment return parameters on load
  useEffect(() => {
    const paymentReturn = paymentService.parsePaymentReturn();
    
    console.log('Payment return parameters:', paymentReturn);
    
    if (paymentReturn.success) {
      setPaymentStatus('success');
      setSelectedPlan(paymentReturn.plan as PlanType || null);
      // Update local subscription
      if (paymentReturn.plan) {
        updateSubscription({
          ...subscription,
          currentPlan: paymentReturn.plan as PlanType,
          startDate: new Date().toISOString(),
          lastTransactionId: paymentReturn.transactionId
        });
      }
      paymentService.clearPaymentParams();
    } else if (paymentReturn.error) {
      setPaymentStatus('failed');
      setPaymentError(paymentReturn.error);
      paymentService.clearPaymentParams();
    }
  }, []);

  const handlePlanSelect = (planType: PlanType, duration: SubscriptionDuration) => {
    // Free plan: immediate activation
    if (planType === PlanType.FREE) {
      updateSubscription({
        ...subscription,
        currentPlan: planType,
        duration: duration,
        startDate: new Date().toISOString()
      });
      return;
    }

    // Paid plans: open payment modal
    if (planType === PlanType.STARTER || planType === PlanType.PRO) {
      setSelectedPlan(planType);
      setSelectedDuration(duration);
      setShowPaymentModal(true);
      return;
    }

    // Enterprise plan: commercial contact
    if (planType === PlanType.ENTERPRISE) {
      window.location.href = 'mailto:enterprise@saloneo.com?subject=Enterprise plan request';
    }
  };

  const handlePaymentModalClose = () => {
    setShowPaymentModal(false);
    setSelectedPlan(null);
  };

  const handleReturnToSubscriptions = () => {
    setPaymentStatus('idle');
    setPaymentError(undefined);
    setSelectedPlan(null);
  };

  const features = [
    {
      icon: ShieldCheckIcon,
      title: t('features.security.title'),
      description: t('features.security.description')
    },
    {
      icon: ArrowTrendingUpIcon,
      title: t('features.growth.title'),
      description: t('features.growth.description')
    },
    {
      icon: HeartIcon,
      title: t('features.support.title'),
      description: t('features.support.description')
    }
  ];

  // Show success page if payment is successful
  if (paymentStatus === 'success') {
    return (
      <PaymentSuccess
        planName={selectedPlan || undefined}
        onContinue={handleReturnToSubscriptions}
      />
    );
  }

  // Show failure page if payment failed
  if (paymentStatus === 'failed') {
    return (
      <PaymentFailed
        errorCode={paymentError}
        onRetry={handleReturnToSubscriptions}
        onBack={handleReturnToSubscriptions}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-orange-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Payment modal */}
      {selectedPlan && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={handlePaymentModalClose}
          planType={selectedPlan}
          duration={selectedDuration}
        />
      )}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* HEADER SIMPLIFIÉ */}
        <div className="relative mb-12">
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl shadow-orange-lg dark:shadow-gray-lg border border-orange-500/20 dark:border-orange-500/20 p-8">
            <div className="text-center">
              {/* Icône simple */}
              <div className="flex justify-center mb-6">
                <div className="bg-gradient-to-r from-orange-500 to-orange-600 dark:from-orange-400 dark:to-orange-500 p-4 rounded-2xl shadow-orange-lg">
                  <CurrencyDollarIcon className="h-10 w-10 text-white dark:text-gray-900" />
                </div>
              </div>

              {/* Titre simple */}
              <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-orange-500 to-orange-600 dark:from-orange-400 dark:to-orange-500 bg-clip-text text-transparent">
                {t('page.title')}
              </h1>
              
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                {t('page.subtitle')}
              </p>
            </div>
          </div>
        </div>

        {/* PLANS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {plans.map((plan, index) => (
            <div 
              key={plan.type}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <PlanCardWithDuration
                plan={plan}
                isCurrentPlan={plan.type === subscription.currentPlan}
                onSelect={handlePlanSelect}
              />
            </div>
          ))}
        </div>

        {/* FAQ SECTION */}
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl shadow-orange-lg dark:shadow-gray-lg border border-orange-500/20 dark:border-orange-500/20 p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-orange-500 to-orange-600 dark:from-orange-400 dark:to-orange-500 bg-clip-text text-transparent">
              {t('faq.title')}
            </h2>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            {[
              {
                q: t('faq.change_plan.q'),
                a: t('faq.change_plan.a')
              },
              {
                q: t('faq.hidden_fees.q'),
                a: t('faq.hidden_fees.a')
              },
              {
                q: t('faq.cancel.q'),
                a: t('faq.cancel.a')
              }
            ].map((faq, index) => (
              <div key={index} className="bg-white/70 dark:bg-gray-700/70 rounded-xl p-5 hover:bg-white/90 dark:hover:bg-gray-700/90 transition-all duration-200 border border-gray-200 dark:border-gray-600">
                <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-2">{faq.q}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
