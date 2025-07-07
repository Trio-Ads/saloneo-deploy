import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { XCircleIcon, ArrowPathIcon, ArrowLeftIcon, ExclamationTriangleIcon, ShieldExclamationIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
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
  transactionId: initialTransactionId = 'TX-' + Math.floor(Math.random() * 1000000),
  onRetry,
  onBack
}) => {
  const { t } = useTranslation('subscription');
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
  const formattedDate = currentDate.toLocaleDateString('fr-DZ');
  const formattedTime = currentDate.toLocaleTimeString('fr-DZ');

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
      case 'payment_cancelled':
        return t('failed.help.check_card');
      case 'payment_failed':
        return t('failed.help.check_info');
      case 'processing_error':
        return t('failed.help.try_another');
      default:
        return t('failed.help.check_card');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-3xl shadow-2xl p-8 text-center">
          {/* Error Icon */}
          <div className="mb-6 flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-red-500 rounded-full blur-2xl opacity-30 animate-pulse"></div>
              <div className="relative bg-gradient-to-r from-red-500 to-orange-600 p-6 rounded-full shadow-xl">
                <XCircleIcon className="h-16 w-16 text-white" />
              </div>
            </div>
          </div>

          {/* Error Message */}
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {t('failed.title')}
          </h1>
          
          <div className="flex justify-between items-center mb-4">
            <p className="text-lg text-gray-600">
              {errorMessage}
            </p>
            <img 
              src="/images/cib-logo.webp" 
              alt="CIB" 
              className="h-8"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
          
          <p className="text-sm text-gray-500 mb-4">
            {getDetailedMessage()}
          </p>
          
          {/* Transaction Details - Required by SATIM */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-gray-900 flex items-center">
                <ShieldExclamationIcon className="h-5 w-5 mr-2 text-red-500" />
                {t('failed.transaction.title')}
              </h3>
            </div>
            
            <div className="space-y-4 text-left">
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <div className="flex items-center text-gray-700">
                  <DocumentTextIcon className="h-5 w-5 mr-2 text-gray-500" />
                  <span>{t('failed.transaction.id')}</span>
                </div>
                <span className="font-medium text-gray-900">{transactionId}</span>
              </div>
              
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <div className="flex items-center text-gray-700">
                  <ExclamationTriangleIcon className="h-5 w-5 mr-2 text-red-500" />
                  <span>{t('failed.transaction.error_code')}</span>
                </div>
                <span className="font-medium text-red-600">{errorCode}</span>
              </div>
              
              <div className="flex justify-between pt-2">
                <div className="flex items-center text-gray-700">
                  <span>{t('failed.transaction.date')}</span>
                </div>
                <span className="font-medium text-gray-900">{formattedDate} {formattedTime}</span>
              </div>
            </div>
          </div>

          {/* Help Section */}
          <div className="bg-orange-50 rounded-2xl p-6 mb-8">
            <h3 className="font-semibold text-orange-900 mb-3">
              {t('failed.help.title')}
            </h3>
            <ul className="space-y-2 text-left text-orange-800 text-sm">
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>{t('failed.help.check_card')}</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>{t('failed.help.check_info')}</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>{t('failed.help.try_another')}</span>
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleRetry}
              className="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white py-4 px-6 rounded-xl font-semibold hover:from-orange-700 hover:to-red-700 transition-all transform hover:scale-105 flex items-center justify-center gap-2 group"
            >
              <ArrowPathIcon className="h-5 w-5 group-hover:rotate-180 transition-transform duration-500" />
              <span>{t('failed.retry')}</span>
            </button>
            
            <button
              onClick={handleBack}
              className="w-full bg-gray-100 text-gray-700 py-4 px-6 rounded-xl font-semibold hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
            >
              <ArrowLeftIcon className="h-5 w-5" />
              <span>{t('failed.back')}</span>
            </button>
          </div>

          {/* Support Info */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500 mb-2">
              {t('failed.support')}
            </p>
            <a
              href="mailto:support@saloneo.com"
              className="text-sm text-orange-600 hover:text-orange-700 font-medium"
            >
              {t('common.contact_support')}
            </a>
            
            {/* SATIM Required Disclaimer */}
            <div className="mt-4 text-xs text-gray-400 pt-4">
              <p>{t('failed.transaction.disclaimer')}</p>
              <p className="mt-1">{t('failed.transaction.support')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
