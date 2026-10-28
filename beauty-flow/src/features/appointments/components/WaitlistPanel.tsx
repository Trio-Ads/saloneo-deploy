import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { format, parseISO } from 'date-fns';
import { PhoneIcon, QueueListIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Panel, Badge, BadgeTone, IconButton, EmptyState } from '../../../components/ui';
import { getDateLocale } from '../utils';
import { WaitlistEntryRow, WaitlistStatus, waitlistAPI, waitlistCode } from '../../public/waitlist';

const TONES: Record<WaitlistStatus, BadgeTone> = { active: 'orange', offered: 'blue', booked: 'green', expired: 'amber', cancelled: 'red' };
const isOpen = (e: WaitlistEntryRow) => e.status === 'active' || e.status === 'offered';

/** "Liste d'attente" tab of the appointments page: who waits for what, offers sent, manual offer / call / remove. */
export default function WaitlistPanel({ onCount }: { onCount?: (count: number) => void }) {
  const { t, i18n } = useTranslation('appointments');
  const [entries, setEntries] = useState<WaitlistEntryRow[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [offering, setOffering] = useState<string | null>(null);
  const locale = getDateLocale(i18n.language);
  const day = (d: string) => format(parseISO(d), 'EEE d MMM', { locale });
  const at = (iso: string) => format(new Date(iso), 'd MMM HH:mm', { locale });

  const load = useCallback(() => {
    waitlistAPI.list().then(({ data }) => {
      setEntries(data.entries);
      onCount?.(data.count);
    }).catch(() => setFailed(true));
  }, [onCount]);
  useEffect(load, [load]);

  const remove = async (e: WaitlistEntryRow) => {
    if (!window.confirm(t('waitlist.remove_confirm', { name: e.client.firstName }))) return;
    await waitlistAPI.remove(e.id).catch(() => undefined);
    load();
  };

  if (failed) return <Panel><p className="text-sm text-red-600 dark:text-red-400">{t('waitlist.load_error')}</p></Panel>;
  if (!entries) {
    return <Panel><div className="flex justify-center py-8"><span className="size-6 animate-spin rounded-full border-2 border-gray-200 border-t-orange-500" /></div></Panel>;
  }

  const open = entries.filter(isOpen), closed = entries.filter((e) => !isOpen(e)).reverse();
  const row = (e: WaitlistEntryRow) => {
    const last = e.offers[e.offers.length - 1];
    return (
      <li key={e.id} className="px-5 py-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <p className="truncate font-medium text-gray-900 dark:text-gray-50">{`${e.client.firstName} ${e.client.lastName || ''}`.trim()}</p>
              <Badge tone={TONES[e.status]}>{t(`waitlist.status.${e.status}`)}</Badge>
            </div>
            <p className="mt-0.5 truncate text-sm text-gray-500 dark:text-gray-400">
              {e.serviceName || t('appointment_form.unknown.service')} · {e.stylistName || t('waitlist.any_staff')}
            </p>
            <p className="mt-0.5 text-sm tabular-nums text-gray-500 first-letter:uppercase dark:text-gray-400">
              {e.from === e.to ? day(e.from) : `${day(e.from)} – ${day(e.to)}`} · {t(`waitlist.time.${e.timeOfDay}`)}
            </p>
            {last && (
              <p className="mt-1 text-xs tabular-nums text-gray-500 dark:text-gray-400">
                {t('waitlist.offers_sent', { count: e.offers.length })} · {t('waitlist.last_offer', { slot: `${day(last.date)} ${last.time}`, sent: at(last.sentAt) })}
                {e.status === 'offered' && !last.outcome && ` · ${t('waitlist.expires_at', { time: format(new Date(last.expiresAt), 'HH:mm') })}`}
                {last.outcome && ` · ${t(`waitlist.outcome.${last.outcome}`)}`}
              </p>
            )}
          </div>
          <div className="flex items-center justify-end gap-1 shrink-0">
            {isOpen(e) && (
              <button type="button" className="btn-secondary me-1" aria-expanded={offering === e.id} onClick={() => setOffering(offering === e.id ? null : e.id)}>
                {t('waitlist.offer_slot')}
              </button>
            )}
            <a href={`tel:${e.client.phone}`} aria-label={t('waitlist.call', { phone: e.client.phone })} title={e.client.phone}
              className="grid size-10 place-items-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 sm:size-9 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-50">
              <PhoneIcon className="size-5" />
            </a>
            {isOpen(e) && (
              <IconButton tone="danger" label={t('waitlist.remove')} onClick={() => remove(e)}>
                <TrashIcon className="size-5" />
              </IconButton>
            )}
          </div>
        </div>
        {offering === e.id && <OfferForm entry={e} onDone={() => { setOffering(null); load(); }} />}
      </li>
    );
  };

  return (
    <div className="space-y-4">
      <Panel flush title={t('waitlist.title')} description={t('waitlist.description')}>
        {open.length === 0 ? (
          <EmptyState icon={QueueListIcon} title={t('waitlist.empty_title')} body={t('waitlist.empty_body')} />
        ) : (
          <ul className="divide-y divide-gray-100 border-t border-gray-100 dark:divide-gray-800 dark:border-gray-800">{open.map(row)}</ul>
        )}
      </Panel>
      {closed.length > 0 && (
        <Panel flush title={t('waitlist.history')}>
          <ul className="divide-y divide-gray-100 border-t border-gray-100 dark:divide-gray-800 dark:border-gray-800">{closed.map(row)}</ul>
        </Panel>
      )}
    </div>
  );
}

/** Pick a day and a free time (public rules), send that exact slot to the client. */
function OfferForm({ entry, onDone }: { entry: WaitlistEntryRow; onDone: () => void }) {
  const { t } = useTranslation('appointments');
  const today = format(new Date(), 'yyyy-MM-dd');
  const [date, setDate] = useState(entry.from < today ? today : entry.from);
  const [times, setTimes] = useState<string[] | null>(null);
  const [time, setTime] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setTimes(null);
    setTime('');
    if (!date) return;
    waitlistAPI.slots(entry.id, date).then(({ data }) => { setTimes(data.times); setTime(data.times[0] || ''); }).catch(() => setTimes([]));
  }, [entry.id, date]);

  const send = async () => {
    setSending(true);
    setError('');
    try {
      await waitlistAPI.offerSlot(entry.id, { date, time });
      onDone();
    } catch (err) {
      const code = waitlistCode(err);
      setError(code ? t(`errors:availability.${code}`, { defaultValue: t('waitlist.offer_error') }) : t('waitlist.offer_error'));
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="mt-4 grid gap-3 rounded-xl bg-gray-50 p-4 sm:grid-cols-[auto_auto_1fr] sm:items-end dark:bg-gray-800/50">
      <div>
        <label htmlFor={`wl-date-${entry.id}`} className="mb-1.5 block text-sm text-gray-700 dark:text-gray-300">{t('waitlist.offer_date')}</label>
        <input id={`wl-date-${entry.id}`} type="date" min={today} value={date} className="field" onChange={(e) => setDate(e.target.value)} />
      </div>
      <div>
        <label htmlFor={`wl-time-${entry.id}`} className="mb-1.5 block text-sm text-gray-700 dark:text-gray-300">{t('waitlist.offer_time')}</label>
        <select id={`wl-time-${entry.id}`} className="field w-full sm:w-32 tabular-nums" value={time} disabled={!times?.length} onChange={(e) => setTime(e.target.value)}>
          {times === null ? <option>…</option> : times.length === 0 ? <option value="">{t('waitlist.no_free_time')}</option> : times.map((x) => <option key={x} value={x}>{x}</option>)}
        </select>
      </div>
      <div className="flex flex-wrap items-center gap-3 sm:justify-end">
        {error && <p className="text-sm text-red-600 dark:text-red-400" role="alert">{error}</p>}
        <button type="button" className="btn-primary w-full sm:w-auto" disabled={!time || sending} onClick={send}>
          {sending && <span className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />}
          {t('waitlist.send_offer')}
        </button>
      </div>
    </div>
  );
}
