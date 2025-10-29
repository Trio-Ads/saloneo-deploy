import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  CreditCardIcon,
  BanknotesIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { ServiceDepositInfo } from '../types';
import LoadingSpinner from './LoadingSpinner';

interface DepositPaymentProps {
  depositInfo: ServiceDepositInfo;
  onPayDeposit: () => void;
  onSkipDeposit: () => void;
  onBack: () => void;
  isLoading: boolean;
  currency: string;
}

const DepositPayment: React.FC<DepositPaymentProps> = ({
  depositInfo,
  onPayDeposit,
  onSkipDeposit,
  onBack,
  isLoading,
  currency
}) => {
  const { t } = useTranslation(['public', 'services']);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-DZ', {
      style: 'currency',
      currency: currency,
    }).format(amount / 100); // Convertir les centimes en unité principale
  };

  return (
    <div className="space-y-8">
      {/* En-tête */}
      <div className="text-center">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <div className="p-3 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-xl shadow-lg">
            <BanknotesIcon className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
            {t('deposit.title')}
          </h2>
        </div>
        <p className="text-gray-600">{t('deposit.subtitle')}</p>
      </div>

      {/* Informations du versement */}
      <div className="glass-card p-6">
        <div className="flex items-center space-x-3 mb-6">
          <CheckCircleIcon className="h-6 w-6 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">{t('deposit.details')}</h3>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center py-3 border-b border-gray-200">
            <span className="text-gray-700">{t('services:deposit.service_price')}:</span>
            <span className="font-semibold text-gray-900">
              {formatCurrency(depositInfo.servicePrice)}
            </span>
          </div>

          <div className="flex justify-between items-center py-3 border-b border-gray-200">
            <span className="text-gray-700">{t('services:deposit.type')}:</span>
            <span className="text-gray-600">
              {depositInfo.depositType === 'percentage' 
                ? `${depositInfo.depositPercentage}% ${t('services:deposit.percentage_desc')}`
                : t('services:deposit.fixed_desc')
              }
            </span>
          </div>

          <div className="flex justify-between items-center py-3">
            <span className="text-lg font-semibold text-gray-900">{t('services:deposit.deposit_amount')}:</span>
            <span className="text-2xl font-bold text-indigo-600">
              {formatCurrency(depositInfo.calculatedDepositAmount)}
            </span>
          </div>
        </div>
      </div>

      {/* Informations importantes */}
      <div className="glass-card bg-amber-50/70 p-6">
        <div className="flex items-start space-x-3">
          <ExclamationTriangleIcon className="h-6 w-6 text-amber-600 mt-1" />
          <div>
            <h4 className="font-semibold text-amber-900 mb-2">{t('deposit.important_info')}</h4>
            <ul className="text-sm text-amber-800 space-y-1">
              <li>• {t('deposit.info_1')}</li>
              <li>• {t('deposit.info_2')}</li>
              <li>• {t('deposit.info_3')}</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Méthode de paiement */}
      <div className="glass-card p-6">
        <div className="flex items-center space-x-3 mb-4">
          <CreditCardIcon className="h-6 w-6 text-indigo-600" />
          <h3 className="text-lg font-semibold text-gray-900">{t('deposit.payment_method')}</h3>
        </div>

        <div className="glass-card bg-white/50 p-4 rounded-xl border-2 border-indigo-200">
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <img 
                src="/images/satim-logo.png" 
                alt="Satim" 
                className="h-8 w-auto"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
            <div>
              <div className="font-semibold text-gray-900">{t('deposit.satim_payment')}</div>
              <div className="text-sm text-gray-600">{t('deposit.satim_desc')}</div>
            </div>
            <div className="flex-shrink-0">
              <CheckCircleIcon className="h-5 w-5 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 pt-6">
        <button
          type="button"
          onClick={onBack}
          disabled={isLoading}
          className="glass-button bg-white/70 hover:bg-white/90 text-gray-700 border border-gray-300 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {t('common:actions.back')}
        </button>

        <div className="flex-1 flex gap-4">
          <button
            type="button"
            onClick={onSkipDeposit}
            disabled={isLoading}
            className="flex-1 glass-button bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t('deposit.skip_deposit')}
          </button>

          <button
            type="button"
            onClick={onPayDeposit}
            disabled={isLoading}
            className="flex-1 glass-button bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed relative"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <LoadingSpinner fullScreen={false} />
                <span className="ml-2">{t('deposit.processing')}</span>
              </div>
            ) : (
              <>
                <CreditCardIcon className="h-5 w-5 mr-2" />
                {t('deposit.pay_deposit')}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DepositPayment;
