import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAffiliationStore } from '../../store/affiliationStore';
import { useToastStore } from '../../../../components/Toast';
import { PayoutMethod, PayoutDetails } from '../../types/affiliation';
import { Panel, Segmented } from '../../../../components/ui';
import { formatPrice } from '../../../../utils/currency';

const PayoutSettings: React.FC = () => {
  const { t } = useTranslation('profile');
  const k = 'affiliation_components.payout';
  const { affiliation, updateAffiliationSettings, requestPayout } = useAffiliationStore();
  const { showToast } = useToastStore();
  
  const [payoutMethod, setPayoutMethod] = useState<PayoutMethod>('bank');
  const [payoutDetails, setPayoutDetails] = useState<PayoutDetails>({
    bank: {
      accountName: '',
      accountNumber: '',
      bankName: '',
      iban: '',
      swift: ''
    },
    paypal: {
      email: ''
    },
    crypto: {
      walletAddress: '',
      network: 'ETH'
    }
  });
  const [minimumPayout, setMinimumPayout] = useState(50);
  const [isSaving, setIsSaving] = useState(false);
  const [requestAmount, setRequestAmount] = useState('');

  useEffect(() => {
    if (affiliation) {
      setPayoutMethod(affiliation.payoutMethod || 'bank');
      if (affiliation.payoutDetails) {
        setPayoutDetails(affiliation.payoutDetails);
      }
    }
  }, [affiliation]);

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      await updateAffiliationSettings({
        payoutMethod,
        payoutDetails,
        minimumPayout,
        notificationsEnabled: true,
        autoApprove: false
      });
      showToast(t(`${k}.messages.settings_updated`), 'success');
    } catch (error) {
      showToast(t(`${k}.messages.save_error`), 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePayoutRequest = async () => {
    const amount = parseFloat(requestAmount);
    if (isNaN(amount) || amount < minimumPayout) {
      showToast(t(`${k}.messages.minimum_error`, { amount: minimumPayout }), 'error');
      return;
    }

    try {
      await requestPayout(amount);
      showToast(t(`${k}.messages.payout_requested`), 'success');
      setRequestAmount('');
    } catch (error) {
      showToast(t(`${k}.messages.request_error`), 'error');
    }
  };

  const availableBalance = affiliation?.totalCommissions || 0;

  const label = 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5';
  const setBank = (field: keyof NonNullable<PayoutDetails['bank']>, value: string) =>
    setPayoutDetails({ ...payoutDetails, bank: { ...payoutDetails.bank!, [field]: value } });
  const bankFields: { field: keyof NonNullable<PayoutDetails['bank']>; label: string }[] = [
    { field: 'accountName', label: t(`${k}.bank_info.account_name`) },
    { field: 'bankName', label: t(`${k}.bank_info.bank_name`) },
    { field: 'iban', label: t(`${k}.bank_info.iban`) },
    { field: 'swift', label: t(`${k}.bank_info.swift`) }
  ];

  return (
    <div className="space-y-6">
      <Panel>
        <p className="text-[0.8125rem] font-medium text-gray-500 dark:text-gray-400">{t(`${k}.available_balance`)}</p>
        <p className="mt-1 font-display text-3xl font-semibold tabular-nums text-gray-900 dark:text-gray-50">{formatPrice(availableBalance, 'EUR')}</p>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{t(`${k}.minimum_threshold`)} : {formatPrice(minimumPayout, 'EUR')}</p>

        {availableBalance >= minimumPayout && (
          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1">
              <label className={label} htmlFor="payout-amount">{t(`${k}.withdraw_amount`)}</label>
              <input
                id="payout-amount"
                type="number"
                inputMode="decimal"
                value={requestAmount}
                onChange={(e) => setRequestAmount(e.target.value)}
                placeholder={`Min. ${minimumPayout}`}
                className="field"
              />
            </div>
            <button
              onClick={handlePayoutRequest}
              disabled={!requestAmount || parseFloat(requestAmount) < minimumPayout}
              className="btn-primary"
            >
              {t(`${k}.request_payout`)}
            </button>
          </div>
        )}
      </Panel>

      <Panel title={t(`${k}.payment_method`)} description={t(`${k}.description`)}>
        <Segmented
          value={payoutMethod}
          onChange={setPayoutMethod}
          options={[
            { value: 'bank', label: t(`${k}.methods.bank`) },
            { value: 'paypal', label: t(`${k}.methods.paypal`) },
            { value: 'crypto', label: t(`${k}.methods.crypto`) }
          ]}
        />

        <div className="mt-5">
          {payoutMethod === 'bank' && (
            <div className="grid gap-4 sm:grid-cols-2">
              {bankFields.map(({ field, label: fieldLabel }) => (
                <div key={field}>
                  <label className={label} htmlFor={`bank-${field}`}>{fieldLabel}</label>
                  <input
                    id={`bank-${field}`}
                    type="text"
                    value={payoutDetails.bank?.[field] || ''}
                    onChange={(e) => setBank(field, e.target.value)}
                    className="field"
                  />
                </div>
              ))}
            </div>
          )}

          {payoutMethod === 'paypal' && (
            <div>
              <label className={label} htmlFor="paypal-email">{t(`${k}.paypal_info.email`)}</label>
              <input
                id="paypal-email"
                type="email"
                value={payoutDetails.paypal?.email || ''}
                onChange={(e) => setPayoutDetails({ ...payoutDetails, paypal: { email: e.target.value } })}
                className="field"
                placeholder="votre@email.com"
              />
            </div>
          )}

          {payoutMethod === 'crypto' && (
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className={label} htmlFor="crypto-network">{t(`${k}.crypto_info.network`)}</label>
                <select
                  id="crypto-network"
                  value={payoutDetails.crypto?.network || 'ETH'}
                  onChange={(e) => setPayoutDetails({ ...payoutDetails, crypto: { ...payoutDetails.crypto!, network: e.target.value } })}
                  className="field"
                >
                  {['ETH', 'BTC', 'USDT'].map(n => <option key={n} value={n}>{t(`${k}.networks.${n}`)}</option>)}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className={label} htmlFor="crypto-wallet">{t(`${k}.crypto_info.wallet_address`)}</label>
                <input
                  id="crypto-wallet"
                  type="text"
                  dir="ltr"
                  value={payoutDetails.crypto?.walletAddress || ''}
                  onChange={(e) => setPayoutDetails({ ...payoutDetails, crypto: { ...payoutDetails.crypto!, walletAddress: e.target.value } })}
                  className="field"
                  placeholder="0x..."
                />
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 border-t border-gray-100 pt-5 dark:border-gray-800">
          <label className={label} htmlFor="minimum-payout">{t(`${k}.minimum_threshold`)}</label>
          <select
            id="minimum-payout"
            value={minimumPayout}
            onChange={(e) => setMinimumPayout(parseInt(e.target.value))}
            className="field sm:w-48"
          >
            {[50, 100, 200, 500].map(v => <option key={v} value={v}>{formatPrice(v, 'EUR')}</option>)}
          </select>
          <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">{t(`${k}.minimum_help`)}</p>
        </div>

        <div className="mt-6 flex justify-end">
          <button onClick={handleSaveSettings} disabled={isSaving} className="btn-primary w-full sm:w-auto">
            {isSaving ? t(`${k}.saving`) : t(`${k}.save_settings`)}
          </button>
        </div>
      </Panel>

      <div className="text-sm text-gray-500 dark:text-gray-400">
        <p className="font-medium text-gray-700 dark:text-gray-300">{t(`${k}.warning.title`)}</p>
        <ul className="mt-1.5 list-disc space-y-1 ps-5">
          <li>{t(`${k}.warning.payment_schedule`)}</li>
          <li>{t(`${k}.warning.processing_time`)}</li>
          <li>{t(`${k}.warning.transaction_fees`)}</li>
        </ul>
      </div>
    </div>
  );
};

export default PayoutSettings;
