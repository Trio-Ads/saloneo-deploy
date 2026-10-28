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
      className={`field mt-1 block w-full ${
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
