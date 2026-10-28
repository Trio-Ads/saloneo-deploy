import React from 'react';
import { useTranslation } from 'react-i18next';
import { CreditCardIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { ServiceDepositInfo } from '../types';

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

  // Rendered inside a `.bk` root (booking sheet), styled from the salon template
  return (
    <div className="space-y-5">
      <div>
        <h2 className="bk-h text-lg">{t('deposit.title')}</h2>
        <p className="bk-muted text-sm mt-1">{t('deposit.subtitle')}</p>
      </div>

      <div className="bk-card">
        <div className="bk-row"><span>{t('services:deposit.service_price')}</span><span className="bk-num">{formatCurrency(depositInfo.servicePrice)}</span></div>
        <div className="bk-row">
          <span>{t('services:deposit.type')}</span>
          <span>
            {depositInfo.depositType === 'percentage'
              ? `${depositInfo.depositPercentage}% ${t('services:deposit.percentage_desc')}`
              : t('services:deposit.fixed_desc')}
          </span>
        </div>
        <div className="bk-row items-center">
          <span>{t('services:deposit.deposit_amount')}</span>
          <span className="bk-num text-xl font-semibold">{formatCurrency(depositInfo.calculatedDepositAmount)}</span>
        </div>
      </div>

      <div className="bk-notice" style={{ background: 'var(--bk-surface)', boxShadow: 'inset 0 0 0 1px var(--bk-border)' }}>
        <ExclamationTriangleIcon className="h-5 w-5 shrink-0 bk-muted" />
        <div>
          <p className="font-medium">{t('deposit.important_info')}</p>
          <ul className="bk-muted mt-1 space-y-1 list-disc ps-4">
            <li>{t('deposit.info_1')}</li>
            <li>{t('deposit.info_2')}</li>
            <li>{t('deposit.info_3')}</li>
          </ul>
        </div>
      </div>

      <div className="bk-card flex items-center gap-4 p-4">
        <img src="/images/satim-logo.png" alt="Satim" className="h-8 w-auto"
          onError={(e) => { e.currentTarget.style.display = 'none'; }} />
        <div className="min-w-0">
          <p className="font-medium">{t('deposit.satim_payment')}</p>
          <p className="bk-muted text-sm">{t('deposit.satim_desc')}</p>
        </div>
        <CreditCardIcon className="h-5 w-5 ms-auto shrink-0 bk-muted" />
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <button type="button" onClick={onBack} disabled={isLoading} className="bk-btn-ghost">
          {t('common:actions.back')}
        </button>
        <button type="button" onClick={onSkipDeposit} disabled={isLoading} className="bk-btn-ghost sm:flex-1">
          {t('deposit.skip_deposit')}
        </button>
        <button type="button" onClick={onPayDeposit} disabled={isLoading} className="bk-btn sm:flex-1">
          {isLoading ? <span className="bk-spinner" aria-hidden="true" /> : <CreditCardIcon className="h-5 w-5" />}
          {isLoading ? t('deposit.processing') : t('deposit.pay_deposit')}
        </button>
      </div>
    </div>
  );
};

export default DepositPayment;
