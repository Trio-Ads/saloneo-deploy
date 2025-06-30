import React from 'react';
import { useTranslation } from 'react-i18next';
import { Currency } from '../features/profile/types';

interface CurrencySelectorProps {
  value?: string;
  currencies: Currency[];
  onChange: (currency: Currency) => void;
}

const CurrencySelector: React.FC<CurrencySelectorProps> = ({
  value,
  currencies,
  onChange
}) => {
  const { t } = useTranslation('profile');
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCurrency = currencies.find(c => c.code === event.target.value);
    if (selectedCurrency) {
      onChange(selectedCurrency);
    }
  };

  return (
    <select
      value={value}
      onChange={handleChange}
      className={`mt-1 block w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm ${
        isRTL ? 'text-right' : 'text-left'
      }`}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {currencies.map((currency) => (
        <option key={currency.code} value={currency.code}>
          {isRTL ? (
            `${t(`currencies.${currency.code}`)} (${currency.symbol})`
          ) : (
            `${currency.symbol} - ${t(`currencies.${currency.code}`)}`
          )}
        </option>
      ))}
    </select>
  );
};

export default CurrencySelector;
