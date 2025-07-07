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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
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
        
        {/* SPECTACULAR HERO HEADER */}
        <div className="relative mb-16">
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-12 overflow-hidden">
            {/* Floating particles */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute top-10 left-10 w-2 h-2 bg-indigo-400 rounded-full animate-pulse"></div>
              <div className="absolute top-20 right-20 w-1 h-1 bg-purple-400 rounded-full animate-bounce"></div>
              <div className="absolute bottom-20 left-20 w-1.5 h-1.5 bg-blue-400 rounded-full animate-ping"></div>
              <div className="absolute bottom-10 right-10 w-2 h-2 bg-pink-400 rounded-full animate-pulse"></div>
            </div>

            <div className="relative text-center">
              {/* Main icon with animation */}
              <div className="flex justify-center mb-8">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl blur-2xl opacity-30 animate-pulse"></div>
                  <div className="relative bg-gradient-to-r from-indigo-500 to-purple-600 p-6 rounded-3xl shadow-2xl transform hover:scale-110 transition-all duration-500">
                    <CurrencyDollarIcon className="h-12 w-12 text-white animate-bounce" />
                  </div>
                </div>
              </div>

              {/* Title with animated gradient effect */}
              <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-transparent animate-pulse">
                {t('page.title')}
              </h1>
              
              <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
                {t('page.subtitle')}
              </p>

              {/* Trust badges */}
              <div className="flex flex-wrap justify-center items-center gap-6 mb-8">
                <div className="flex items-center bg-green-50 px-4 py-2 rounded-full border border-green-200">
                  <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                  <span className="text-green-700 font-medium">{t('badges.free_trial')}</span>
                </div>
                <div className="flex items-center bg-blue-50 px-4 py-2 rounded-full border border-blue-200">
                  <ShieldCheckIcon className="h-5 w-5 text-blue-500 mr-2" />
                  <span className="text-blue-700 font-medium">{t('badges.no_commitment')}</span>
                </div>
                <div className="flex items-center bg-purple-50 px-4 py-2 rounded-full border border-purple-200">
                  <StarIcon className="h-5 w-5 text-purple-500 mr-2" />
                  <span className="text-purple-700 font-medium">{t('badges.premium_support')}</span>
                </div>
              </div>

              {/* Flash promotion */}
              <div className="inline-block bg-gradient-to-r from-red-500 to-pink-600 text-white px-8 py-3 rounded-full font-bold text-lg shadow-xl animate-pulse">
                {t('promotion.limited_offer')}
              </div>
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

        {/* WHY SALONEO SECTION */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-12 mb-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              {t('page.why_choose')}
            </h2>
            <p className="text-xl text-gray-600">
              {t('page.why_subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="group relative bg-white/50 backdrop-blur-sm rounded-2xl p-8 hover:bg-white/80 transition-all duration-300 hover:scale-105 hover:shadow-xl"
              >
                <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* TESTIMONIALS */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl shadow-2xl p-12 text-white mb-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">{t('testimonials.title')}</h2>
            <p className="text-xl opacity-90">{t('testimonials.subtitle')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: t('testimonials.marie.name'),
                salon: t('testimonials.marie.salon'),
                text: t('testimonials.marie.text'),
                rating: 5
              },
              {
                name: t('testimonials.sophie.name'),
                salon: t('testimonials.sophie.salon'),
                text: t('testimonials.sophie.text'),
                rating: 5
              },
              {
                name: t('testimonials.amelie.name'),
                salon: t('testimonials.amelie.salon'),
                text: t('testimonials.amelie.text'),
                rating: 5
              }
            ].map((testimonial, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 hover:bg-white/20 transition-all duration-300">
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <StarIcon key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-lg mb-4 italic">"{testimonial.text}"</p>
                <div>
                  <p className="font-bold">{testimonial.name}</p>
                  <p className="opacity-80">{testimonial.salon}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ SECTION */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-12">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              {t('faq.title')}
            </h2>
          </div>

          <div className="max-w-4xl mx-auto space-y-6">
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
              <div key={index} className="bg-white/50 rounded-2xl p-6 hover:bg-white/80 transition-all duration-300">
                <h3 className="text-lg font-bold text-gray-900 mb-3">{faq.q}</h3>
                <p className="text-gray-600">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* FINAL CTA */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl p-8 text-white">
            <h2 className="text-3xl font-bold mb-4">{t('cta.title')}</h2>
            <p className="text-xl mb-6 opacity-90">{t('cta.subtitle')}</p>
            <button className="bg-white text-indigo-600 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-gray-100 transform hover:scale-105 transition-all duration-300 shadow-xl">
              {t('cta.button')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
