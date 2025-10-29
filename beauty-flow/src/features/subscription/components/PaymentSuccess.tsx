import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircleIcon, ArrowRightIcon, DocumentTextIcon, CreditCardIcon, CalendarIcon, ClockIcon } from '@heroicons/react/24/outline';
import { useNavigate, useLocation } from 'react-router-dom';
import confetti from 'canvas-confetti';

interface PaymentSuccessProps {
  planName?: string;
  onContinue?: () => void;
  transactionId?: string;
  amount?: number;
  paymentMethod?: string;
  cardLast4?: string;
}

export const PaymentSuccess: React.FC<PaymentSuccessProps> = ({
  planName: propPlanName,
  onContinue,
  transactionId: propTransactionId = 'TX-' + Math.floor(Math.random() * 1000000),
  amount: propAmount = 5000,
  paymentMethod: propPaymentMethod = 'CIB',
  cardLast4: propCardLast4 = '****'
}) => {
  const { t } = useTranslation('subscription');
  const navigate = useNavigate();
  const location = useLocation();
  
  // Use state to store and update values
  const [transactionId, setTransactionId] = useState(propTransactionId);
  const [amount, setAmount] = useState(propAmount);
  const [planName, setPlanName] = useState(propPlanName);
  const [paymentMethod, setPaymentMethod] = useState(propPaymentMethod);
  const [cardLast4, setCardLast4] = useState(propCardLast4);
  
  // Extract query parameters if available
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const txId = params.get('transaction_id');
    const txAmount = params.get('amount');
    const txPlan = params.get('plan');
    const txPaymentMethod = params.get('payment_method');
    const txCardLast4 = params.get('card_last4');
    
    // Log parameters for debugging
    console.log('Payment success parameters:', {
      txId, txAmount, txPlan, txPaymentMethod, txCardLast4
    });
    
    if (txId) {
      setTransactionId(txId);
    }
    
    if (txAmount) {
      setAmount(parseInt(txAmount, 10));
    }
    
    if (txPlan) {
      setPlanName(txPlan);
    }
    
    if (txPaymentMethod) {
      setPaymentMethod(txPaymentMethod);
    }
    
    if (txCardLast4) {
      setCardLast4(txCardLast4);
    }
  }, [location]);
  
  // Format current date for receipt
  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString('fr-DZ');
  const formattedTime = currentDate.toLocaleTimeString('fr-DZ');

  useEffect(() => {
    // Launch confetti
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      });
    }, 250);

    return () => clearInterval(interval);
  }, []);

  const handleContinue = () => {
    if (onContinue) {
      onContinue();
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-gray-900 dark:via-green-900/20 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 text-center">
          {/* Success Icon */}
          <div className="mb-6 flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-green-500 rounded-full blur-2xl opacity-30 animate-pulse"></div>
              <div className="relative bg-gradient-to-r from-green-500 to-emerald-600 p-6 rounded-full shadow-xl">
                <CheckCircleIcon className="h-16 w-16 text-white" />
              </div>
            </div>
          </div>

          {/* Success Message */}
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            {t('success.title')}
          </h1>
          
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
            {t('success.message', { planName: planName || '' })}
          </p>

          {/* Transaction Details - Required by SATIM */}
          <div className="bg-white dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-2xl p-6 mb-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                {t('success.transaction.title')}
              </h3>
              <img 
                src="/images/cib-logo.webp" 
                alt="CIB" 
                className="h-8"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
            
            <div className="space-y-4 text-left">
              <div className="flex justify-between border-b border-gray-100 dark:border-gray-600 pb-2">
                <div className="flex items-center text-gray-700 dark:text-gray-300">
                  <DocumentTextIcon className="h-5 w-5 mr-2 text-gray-500" />
                  <span>{t('success.transaction.id')}</span>
                </div>
                <span className="font-medium text-gray-900 dark:text-gray-100">{transactionId}</span>
              </div>
              
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <div className="flex items-center text-gray-700">
                  <CalendarIcon className="h-5 w-5 mr-2 text-gray-500" />
                  <span>{t('success.transaction.date')}</span>
                </div>
                <span className="font-medium text-gray-900 dark:text-gray-100">{formattedDate}</span>
              </div>
              
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <div className="flex items-center text-gray-700">
                  <ClockIcon className="h-5 w-5 mr-2 text-gray-500" />
                  <span>{t('success.transaction.time')}</span>
                </div>
                <span className="font-medium text-gray-900 dark:text-gray-100">{formattedTime}</span>
              </div>
              
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <div className="flex items-center text-gray-700">
                  <CreditCardIcon className="h-5 w-5 mr-2 text-gray-500" />
                  <span>{t('success.transaction.method')}</span>
                </div>
                <span className="font-medium text-gray-900 dark:text-gray-100">{paymentMethod} {cardLast4}</span>
              </div>
              
              <div className="flex justify-between pt-2">
                <div className="flex items-center text-gray-700 dark:text-gray-300 font-semibold">
                  <span>{t('success.transaction.amount')}</span>
                </div>
                <span className="font-bold text-green-600 dark:text-green-400 text-lg">{amount.toLocaleString('fr-DZ')} DZD</span>
              </div>
            </div>
          </div>
          
          {/* Benefits */}
          <div className="bg-green-50 dark:bg-green-900/20 rounded-2xl p-6 mb-8">
            <h3 className="font-semibold text-green-900 dark:text-green-300 mb-3">
              {t('success.benefits.title')}
            </h3>
            <ul className="space-y-2 text-left text-green-800 dark:text-green-300">
              <li className="flex items-start">
                <CheckCircleIcon className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                <span>{t('success.benefits.premium')}</span>
              </li>
              <li className="flex items-start">
                <CheckCircleIcon className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                <span>{t('success.benefits.unlimited')}</span>
              </li>
              <li className="flex items-start">
                <CheckCircleIcon className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                <span>{t('success.benefits.support')}</span>
              </li>
            </ul>
          </div>

          {/* CTA Button */}
          <button
            onClick={handleContinue}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 px-6 rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all transform hover:scale-105 flex items-center justify-center gap-2 group"
          >
            <span>{t('success.continue')}</span>
            <ArrowRightIcon className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </button>

          {/* Additional Info */}
          <p className="mt-6 text-sm text-gray-500 dark:text-gray-400">
            {t('success.email_sent')}
          </p>
          
          {/* SATIM Required Disclaimer */}
          <div className="mt-4 text-xs text-gray-400 dark:text-gray-500 border-t border-gray-100 dark:border-gray-700 pt-4">
            <p>{t('success.transaction.disclaimer')}</p>
            <p className="mt-1">{t('success.transaction.support')}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
