import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useNavigate, useLocation } from 'react-router-dom';
import { paymentService } from '../../../services/paymentService';

interface PaymentFailedProps {
  errorCode?: string;
  errorMessage?: string;
  transactionId?: string;
  onRetry?: () => void;
  onBack?: () => void;
}

export const PaymentFailed: React.FC<PaymentFailedProps> = ({
  errorCode: initialErrorCode = 'unknown_error',
  errorMessage: propErrorMessage,
  transactionId: initialTransactionId,
  onRetry,
  onBack
}) => {
  const { t, i18n } = useTranslation('subscription');
  const navigate = useNavigate();
  const location = useLocation();

  // Use state variables instead of trying to reassign constants
  const [errorCode, setErrorCode] = useState(initialErrorCode);
  const [transactionId, setTransactionId] = useState(initialTransactionId);
  const [errorMessage, setErrorMessage] = useState(propErrorMessage || paymentService.getErrorMessage(initialErrorCode));

  // Extract query parameters if available
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const txId = params.get('transaction_id');
    const errCode = params.get('error_code');
    const errMsg = params.get('error_message');

    if (txId) {
      setTransactionId(txId);
    }

    if (errCode) {
      setErrorCode(errCode);
      // Update error message if error code changes
      if (!errMsg) {
        setErrorMessage(paymentService.getErrorMessage(errCode));
      }
    }

    if (errMsg) {
      setErrorMessage(errMsg);
    }
  }, [location]);

  // Format current date for receipt
  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString(i18n.language);
  const formattedTime = currentDate.toLocaleTimeString(i18n.language);

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      navigate('/subscription');
    }
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate('/subscription');
    }
  };

  const getDetailedMessage = () => {
    switch (errorCode) {
      case 'payment_failed':
        return t('failed.help.check_info');
      case 'processing_error':
        return t('failed.help.try_another');
      default:
        return t('failed.help.check_card');
    }
  };

  // Details required by SATIM — only values we actually have.
  const rows: [string, string][] = [
    ...(transactionId ? [[t('failed.transaction.id'), transactionId] as [string, string]] : []),
    [t('failed.transaction.error_code'), errorCode],
    [t('failed.transaction.date'), `${formattedDate} ${formattedTime}`]
  ];

  return (
    <div className="flex justify-center py-8 sm:py-12">
      <div className="panel w-full max-w-md p-6 text-center dark:border-gray-800 dark:bg-gray-900 sm:p-8">
        <span className="mx-auto mb-5 grid size-12 place-items-center rounded-full bg-red-50 text-red-600 dark:bg-red-500/15 dark:text-red-400">
          <XMarkIcon className="size-6" />
        </span>

        <h1 className="font-display text-2xl font-semibold text-gray-900 dark:text-gray-50">{t('failed.title')}</h1>
        <p className="mt-2 text-[0.9375rem] text-gray-700 dark:text-gray-300">{errorMessage}</p>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{getDetailedMessage()}</p>

        <div className="mt-6 text-start">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-50">{t('failed.transaction.title')}</h2>
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
          </dl>

          <h2 className="mt-6 text-sm font-semibold text-gray-900 dark:text-gray-50">{t('failed.help.title')}</h2>
          <ul className="mt-2 list-disc space-y-1 ps-5 text-sm text-gray-600 dark:text-gray-400">
            <li>{t('failed.help.check_card')}</li>
            <li>{t('failed.help.check_info')}</li>
            <li>{t('failed.help.try_another')}</li>
          </ul>
        </div>

        <div className="mt-6 flex flex-col gap-2">
          <button onClick={handleRetry} className="btn-primary w-full">{t('failed.retry')}</button>
          <button onClick={handleBack} className="btn-secondary w-full">{t('failed.back')}</button>
        </div>

        <div className="mt-6 border-t border-gray-100 pt-4 text-sm dark:border-gray-800">
          <p className="text-gray-500 dark:text-gray-400">
            {t('failed.support')}{' '}
            <a href="mailto:support@saloneo.com" className="font-medium text-orange-600 underline-offset-2 hover:underline dark:text-orange-400">
              support@saloneo.com
            </a>
          </p>
          <div className="mt-3 text-xs text-gray-400 dark:text-gray-500">
            <p>{t('failed.transaction.disclaimer')}</p>
            <p className="mt-1">{t('failed.transaction.support')}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
