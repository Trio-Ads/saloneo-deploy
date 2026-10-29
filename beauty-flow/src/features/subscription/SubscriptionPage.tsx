import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { PlanCardWithDuration, PLAN_KEY } from './components/PlanCardWithDuration';
import { isIosApp } from '../../native';
import { PaymentModal } from './components/PaymentModal';
import { PaymentSuccess } from './components/PaymentSuccess';
import { PaymentFailed } from './components/PaymentFailed';
import { useSubscriptionStore } from './store';
import { PLAN_LIMITS, PLAN_PRICES, PlanType, Plan, SubscriptionDuration, DURATION_DISCOUNTS } from './types';
import { paymentService } from '../../services/paymentService';
import { PageHeader, Panel, Segmented } from '../../components/ui';
import { useSubscriptionLimits } from './hooks/useSubscriptionLimits';

export const SubscriptionPage: React.FC = () => {
  const { t } = useTranslation('subscription');
  const { subscription, updateSubscription } = useSubscriptionStore();
  // Backend plan (falls back to the local store) — the same source the limit widgets use.
  const { currentPlan } = useSubscriptionLimits();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PlanType | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<SubscriptionDuration>(SubscriptionDuration.MONTHLY);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'success' | 'failed'>('idle');
  const [paymentError, setPaymentError] = useState<string | undefined>();
  const [paymentReturn, setPaymentReturn] = useState<ReturnType<typeof paymentService.parsePaymentReturn>>({});
  // Commitment shown on the Starter/Pro cards (page-level so every card compares the same thing)
  const [duration, setDuration] = useState<SubscriptionDuration>(SubscriptionDuration.MONTHLY);

  const plans: Plan[] = Object.values(PlanType).map((type) => ({
    type,
    limits: PLAN_LIMITS[type],
    price: PLAN_PRICES[type]
  }));

  // Check payment return parameters on load
  useEffect(() => {
    const paymentReturn = paymentService.parsePaymentReturn();
    
    console.log('Payment return parameters:', paymentReturn);
    setPaymentReturn(paymentReturn);

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

  // Show success page if payment is successful
  if (paymentStatus === 'success') {
    return (
      <PaymentSuccess
        planName={selectedPlan || undefined}
        onContinue={handleReturnToSubscriptions}
        transactionId={paymentReturn.transactionId}
        amount={paymentReturn.amount ? parseInt(paymentReturn.amount, 10) : undefined}
        paymentMethod={paymentReturn.paymentMethod}
        cardLast4={paymentReturn.cardLast4}
      />
    );
  }

  // Show failure page if payment failed
  if (paymentStatus === 'failed') {
    return (
      <PaymentFailed
        errorCode={paymentError}
        transactionId={paymentReturn.transactionId}
        onRetry={handleReturnToSubscriptions}
        onBack={handleReturnToSubscriptions}
      />
    );
  }

  // iOS app: show the current plan only (no sale outside Apple's in-app purchase)
  if (isIosApp) {
    return (
      <div className="py-6 sm:py-8">
        <PageHeader title={t('page.app_title')} />
        <Panel title={t(`plans.${PLAN_KEY[currentPlan as PlanType] || 'free'}.name`)} description={t(`plans.${PLAN_KEY[currentPlan as PlanType] || 'free'}.description`)}>
          <p className="text-sm text-gray-600 dark:text-gray-400">{t('page.app_current_plan')}</p>
        </Panel>
      </div>
    );
  }

  const durationOptions = Object.values(SubscriptionDuration).map((d) => ({
    value: d,
    label: d === SubscriptionDuration.MONTHLY
      ? t('plan_card.durations.MONTHLY')
      : <>{t(`plan_card.durations.${d}`)}<span className="hidden sm:inline"> · −{DURATION_DISCOUNTS[d.toLowerCase() as 'yearly' | 'biennial' | 'triennial']} %</span></>
  }));

  return (
    <div className="py-6 sm:py-8">
      {/* Payment modal */}
      {selectedPlan && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={handlePaymentModalClose}
          planType={selectedPlan}
          duration={selectedDuration}
        />
      )}

      <PageHeader title={t('page.title')} subtitle={t('page.subtitle')} />

      <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-gray-500 dark:text-gray-400">{t('plan_card.duration_hint')}</p>
        <Segmented value={duration} onChange={setDuration} options={durationOptions} />
      </div>

      <div className="mb-10 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {plans.map((plan) => (
          <PlanCardWithDuration
            key={plan.type}
            plan={plan}
            duration={duration}
            recommended={plan.type === PlanType.PRO}
            isCurrentPlan={plan.type === currentPlan}
            onSelect={handlePlanSelect}
          />
        ))}
      </div>

      <Panel flush title={t('faq.title')} bodyClassName="divide-y divide-gray-100 border-t border-gray-100 dark:divide-gray-800 dark:border-gray-800">
        {[
          { q: t('faq.change_plan.q'), a: t('faq.change_plan.a') },
          { q: t('faq.hidden_fees.q'), a: t('faq.hidden_fees.a') },
          { q: t('faq.cancel.q'), a: t('faq.cancel.a') }
        ].map((faq) => (
          <div key={faq.q} className="px-5 py-4">
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-50">{faq.q}</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{faq.a}</p>
          </div>
        ))}
      </Panel>
    </div>
  );
};
