import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';
import { InitOptions } from 'i18next';

export type Language = 'fr' | 'en' | 'ar' | 'es' | 'tr' | 'pt' | 'ber';

const i18nConfig: InitOptions = {
  fallbackLng: 'fr',
  supportedLngs: ['fr', 'en', 'ar', 'es', 'tr', 'pt', 'ber'],
  debug: process.env.NODE_ENV === 'development',
  
  interpolation: {
    escapeValue: false,
  },

  detection: {
    order: ['localStorage', 'navigator'],
    caches: ['localStorage'],
    lookupLocalStorage: 'beauty-flow-language',
  },

  backend: {
    loadPath: '/locales/{{lng}}/{{ns}}.json',
    addPath: '/locales/add/{{lng}}/{{ns}}',
  },

  react: {
    useSuspense: false,
  },
  
  defaultNS: 'common',
  ns: ['common', 'clients', 'appointments', 'services', 'team', 'interface', 'public', 'profile', 'auth', 'subscription', 'marketing', 'dashboard', 'errors'],
};

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init(i18nConfig);

export default i18n;
