import { Currency } from '../features/profile/types';

// Mapping des codes de devise vers leurs symboles
export const getCurrencySymbol = (currency: Currency | string): string => {
  const currencyCode = typeof currency === 'string' ? currency : currency?.code || 'EUR';
  
  const symbols: Record<string, string> = {
    'EUR': '€',
    'USD': '$',
    'GBP': '£',
    'JPY': '¥',
    'CAD': 'C$',
    'AUD': 'A$',
    'CHF': 'CHF',
    'CNY': '¥',
    'SEK': 'kr',
    'NOK': 'kr',
    'DKK': 'kr',
    'PLN': 'zł',
    'CZK': 'Kč',
    'HUF': 'Ft',
    'RUB': '₽',
    'BRL': 'R$',
    'INR': '₹',
    'KRW': '₩',
    'SGD': 'S$',
    'HKD': 'HK$',
    'NZD': 'NZ$',
    'MXN': '$',
    'ZAR': 'R',
    'TRY': '₺',
    'AED': 'د.إ',
    'SAR': '﷼',
    'QAR': 'ر.ق',
    'KWD': 'د.ك',
    'BHD': '.د.ب',
    'OMR': 'ر.ع.',
    'JOD': 'د.ا',
    'LBP': 'ل.ل',
    'EGP': 'ج.م',
    'MAD': 'د.م.',
    'TND': 'د.ت',
    'DZD': 'DA',
    'LYD': 'ل.د'
  };

  return symbols[currencyCode] || currencyCode;
};

// Formatage des prix avec la devise appropriée
export const formatPrice = (price: number | undefined, currency: Currency | string): string => {
  // No price at all: hidden from this login (staff without revenue access) — show a dash, not "0 DA"
  if (price === undefined || price === null) return '—';
  const symbol = getCurrencySymbol(currency);
  const amount = Number(price) || 0;
  return `${amount.toLocaleString('fr-FR', { maximumFractionDigits: Number.isInteger(amount) ? 0 : 2 })} ${symbol}`;
};

// Obtenir l'icône appropriée pour la devise
export const getCurrencyIcon = (currency: Currency | string): string => {
  const currencyCode = typeof currency === 'string' ? currency : currency?.code || 'EUR';
  
  // Pour la plupart des devises, on utilise une icône générique
  // Seules quelques devises ont des icônes spécifiques
  const specificIcons: Record<string, string> = {
    'EUR': 'CurrencyEuroIcon',
    'USD': 'CurrencyDollarIcon',
    'GBP': 'CurrencyPoundIcon',
    'JPY': 'CurrencyYenIcon'
  };

  return specificIcons[currencyCode] || 'CurrencyDollarIcon';
};
