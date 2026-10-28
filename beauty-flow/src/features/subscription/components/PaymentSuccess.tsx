import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckIcon } from '@heroicons/react/24/outline';
import { useNavigate, useLocation } from 'react-router-dom';
import { formatPrice } from '../../../utils/currency';

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
  transactionId: propTransactionId,
  amount: propAmount,
  paymentMethod: propPaymentMethod = 'CIB',
  cardLast4: propCardLast4
}) => {
  const { t, i18n } = useTranslation('subscription');
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

    if (txId) setTransactionId(txId);
    if (txAmount) setAmount(parseInt(txAmount, 10));
    if (txPlan) setPlanName(txPlan);
    if (txPaymentMethod) setPaymentMethod(txPaymentMethod);
    if (txCardLast4) setCardLast4(txCardLast4);
  }, [location]);

  // Format current date for receipt
  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString(i18n.language);
  const formattedTime = currentDate.toLocaleTimeString(i18n.language);

  const handleContinue = () => {
    if (onContinue) {
      onContinue();
    } else {
      navigate('/dashboard');
    }
  };

  // Receipt rows (SATIM requirement) — only values we actually received are shown.
  const rows: [string, React.ReactNode][] = [
    ...(transactionId ? [[t('success.transaction.id'), transactionId] as [string, React.ReactNode]] : []),
    [t('success.transaction.date'), formattedDate],
    [t('success.transaction.time'), formattedTime],
    [t('success.transaction.method'), [paymentMethod, cardLast4 && `•••• ${cardLast4}`].filter(Boolean).join(' ')]
  ];

  return (
    <div className="flex justify-center py-8 sm:py-12">
      <div className="panel w-full max-w-md p-6 text-center dark:border-gray-800 dark:bg-gray-900 sm:p-8">
        <span className="mx-auto mb-5 grid size-12 place-items-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400">
          <CheckIcon className="size-6" />
        </span>

        <h1 className="font-display text-2xl font-semibold text-gray-900 dark:text-gray-50">{t('success.title')}</h1>
        <p className="mt-2 text-[0.9375rem] text-gray-500 dark:text-gray-400">{t('success.message', { planName: planName || '' })}</p>

        <div className="mt-6 text-start">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-50">{t('success.transaction.title')}</h2>
            <img
              src="/images/cib-logo.webp"
              alt="CIB"
              className="h-6"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
          <dl className="mt-2 divide-y divide-gray-100 border-y border-gray-100 text-sm dark:divide-gray-800 dark:border-gray-800">
            {rows.map(([label, value]) => (
              <div key={label} className="flex justify-between gap-4 py-2.5">
                <dt className="text-gray-500 dark:text-gray-400">{label}</dt>
                <dd className="font-medium tabular-nums text-gray-900 dark:text-gray-50">{value}</dd>
              </div>
            ))}
            {amount !== undefined && (
              <div className="flex justify-between gap-4 py-2.5">
                <dt className="font-medium text-gray-700 dark:text-gray-300">{t('success.transaction.amount')}</dt>
                <dd className="font-semibold tabular-nums text-gray-900 dark:text-gray-50">{formatPrice(amount, 'DZD')}</dd>
              </div>
            )}
          </dl>
        </div>

        <button onClick={handleContinue} className="btn-primary mt-6 w-full">
          {t('success.continue')}
        </button>

        <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">{t('success.email_sent')}</p>

        <div className="mt-4 border-t border-gray-100 pt-4 text-xs text-gray-400 dark:border-gray-800 dark:text-gray-500">
          <p>{t('success.transaction.disclaimer')}</p>
          <p className="mt-1">{t('success.transaction.support')}</p>
        </div>
      </div>
    </div>
  );
};
