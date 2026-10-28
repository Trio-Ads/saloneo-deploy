import type { Locale } from 'date-fns';
import { fr, enUS, ar, es, pt, tr } from 'date-fns/locale';

const locales: Record<string, Locale> = { fr, en: enUS, ar, es, pt, tr };

/** date-fns locale for the current UI language (fr fallback, Tamazight included). */
export const dateLocale = (lang?: string) => locales[(lang || 'fr').slice(0, 2)] || fr;
