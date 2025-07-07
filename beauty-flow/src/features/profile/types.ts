import { AffiliationData } from './types/affiliation';

export type Language = 'fr' | 'en' | 'ar' | 'es' | 'tr' | 'pt';

export interface Currency {
  code: string;
  symbol: string;
  name: string;
}

export interface Profile {
  firstName: string;
  lastName: string;
  establishmentName: string;
  address: string;
  language: Language;
  currency: Currency;
  publicLink?: string;
  showAsTeamMember?: boolean;
  affiliation?: AffiliationData;
}

export const CURRENCIES: Record<string, Currency> = {
  EUR: { code: 'EUR', symbol: '€', name: 'Euro' },
  USD: { code: 'USD', symbol: '$', name: 'Dollar US' },
  GBP: { code: 'GBP', symbol: '£', name: 'Livre Sterling' },
  AED: { code: 'AED', symbol: 'د.إ', name: 'Dirham' },
  DZD: { code: 'DZD', symbol: 'د.ج', name: 'Dinar Algérien' },
  TRY: { code: 'TRY', symbol: '₺', name: 'Lire turque' },
  BRL: { code: 'BRL', symbol: 'R$', name: 'Real brésilien' }
};

export const getAllCurrencies = (): Currency[] => {
  return Object.values(CURRENCIES);
};
