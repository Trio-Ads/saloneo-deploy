import { fr, enUS, es, pt, tr, arDZ } from 'date-fns/locale';
import { Appointment } from './types';

/** date-fns locale for the current UI language (fr by default). */
export const getDateLocale = (lang?: string) =>
  ({ fr, en: enUS, es, pt, tr, ar: arDZ } as Record<string, typeof fr>)[(lang || 'fr').slice(0, 2)] || fr;

/** Appointment dates come as "YYYY-MM-DD" or full ISO; keep the calendar day only. */
export const dayKey = (date: string) => (date || '').slice(0, 10);

const toMinutes = (time?: string) => {
  const [h, m] = (time || '').split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
};

/** Sortable string: day + start time (works with unpadded "9:00"). */
export const sortKey = (a: Appointment) => `${dayKey(a.date)} ${String(toMinutes(a.startTime)).padStart(4, '0')}`;

export const durationMinutes = (a: Pick<Appointment, 'startTime' | 'endTime'>) =>
  a.endTime ? Math.max(0, toMinutes(a.endTime) - toMinutes(a.startTime)) : 0;

/** i18n key under `appointments:status.*` (store uses camelCase "noShow"). */
export const statusKey = (status: string) => (status === 'noShow' ? 'no_show' : status);
