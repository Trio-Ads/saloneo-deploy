import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckIcon, DocumentDuplicateIcon, ExclamationTriangleIcon, PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { format, parseISO } from 'date-fns';
import { useAppointmentStore } from '../store';
import { useUnsavedChanges } from '../../../hooks/useUnsavedChanges';
import { Panel, IconButton } from '../../../components/ui';
import { getDateLocale } from '../utils';
import { availabilityAPI, BookingSettings, DateRange, DayHours, WEEK, WeekHours } from '../availability';

// The Algerian work week: Saturday first
const SALON_WEEK = ['saturday', 'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday'] as const;
type Section = 'hours' | 'booking' | 'closures';
type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';
const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

const NOTICE_OPTIONS = [0, 30, 60, 120, 240, 720, 1440, 2880];
const INTERVALS = [10, 15, 20, 30, 60];

const label = 'block text-sm font-medium text-gray-900 dark:text-gray-50';
const help = 'mt-1 text-xs text-gray-500 dark:text-gray-400';
const unit = 'text-sm text-gray-500 dark:text-gray-400';
const checkbox = 'size-4 rounded border-gray-300 text-orange-500 accent-orange-500 focus:ring-orange-500 dark:border-gray-600';
const timeField = 'field w-[7.5rem] py-2 tabular-nums';
const breakField = 'field w-[7rem] py-2 tabular-nums sm:w-[7.5rem]';

/** Why a day cannot be saved (null = fine). Times are 'HH:mm' so string comparison is chronological. */
const dayError = (d: DayHours): 'invalid_hours' | 'invalid_break' | null => {
  if (!d.isOpen) return null;
  if (!(d.start < d.end)) return 'invalid_hours';
  return d.breaks.some((b) => !(b.start < b.end) || b.start < d.start || b.end > d.end) ? 'invalid_break' : null;
};

/**
 * Salon hours, online booking rules and closures — the single place the availability engine reads them from.
 * Each panel saves itself (its own button, "unsaved changes" hint); leaving with unsaved edits asks first.
 */
const AppointmentSettings: React.FC = () => {
  const { t, i18n } = useTranslation(['appointments', 'team', 'common']);
  const updateAppointmentSettings = useAppointmentStore((s) => s.updateAppointmentSettings);

  const [hours, setHours] = useState<WeekHours | null>(null);
  const [configured, setConfigured] = useState(true);
  const [booking, setBooking] = useState<BookingSettings | null>(null);
  const [closures, setClosures] = useState<DateRange[]>([]);
  const [draft, setDraft] = useState<DateRange>({ from: '', to: '', reason: '' });
  const [loadError, setLoadError] = useState(false);
  // Last saved values: a panel is dirty when its values differ from these
  const [saved, setSaved] = useState<{ hours: WeekHours; booking: BookingSettings; closures: DateRange[] } | null>(null);
  const [status, setStatus] = useState<Record<Section, SaveStatus>>({ hours: 'idle', booking: 'idle', closures: 'idle' });

  useEffect(() => {
    availabilityAPI.getSettings().then(({ data }) => {
      setHours(data.hours);
      setConfigured(data.configured);
      setBooking(data.bookingSettings);
      setClosures(data.closures);
      setSaved({ hours: data.hours, booking: data.bookingSettings, closures: data.closures });
    }).catch(() => setLoadError(true));
  }, []);

  const errors = useMemo(() => (hours ? SALON_WEEK.map((d) => dayError(hours[d])) : []), [hours]);
  const invalid = errors.some(Boolean);
  const dirty: Record<Section, boolean> = {
    hours: !!saved && !same(hours, saved.hours),
    booking: !!saved && !same(booking, saved.booking),
    closures: !!saved && !same(closures, saved.closures),
  };
  useUnsavedChanges('salon-booking-settings', dirty.hours || dirty.booking || dirty.closures);

  if (loadError) {
    return <Panel><p className="text-sm text-red-600 dark:text-red-400">{t('appointment_settings.error_message')}</p></Panel>;
  }
  if (!hours || !booking || !saved) {
    return <Panel><div className="flex justify-center py-8"><span className="size-6 animate-spin rounded-full border-2 border-gray-200 border-t-orange-500" /></div></Panel>;
  }

  const setDay = (day: typeof WEEK[number], patch: Partial<DayHours>) =>
    setHours((h) => h && { ...h, [day]: { ...h[day], ...patch } });
  const setBreak = (day: typeof WEEK[number], i: number, field: 'start' | 'end', value: string) =>
    setDay(day, { breaks: hours[day].breaks.map((b, j) => (j === i ? { ...b, [field]: value } : b)) });
  const setRule = <K extends keyof BookingSettings>(key: K, value: BookingSettings[K]) =>
    setBooking((b) => b && { ...b, [key]: value });
  const num = (value: string, fallback: number) => (Number.isFinite(parseInt(value, 10)) ? parseInt(value, 10) : fallback);

  const addClosure = () => {
    if (!draft.from) return;
    const to = draft.to && draft.to >= draft.from ? draft.to : draft.from;
    setClosures((list) => [...list, { from: draft.from, to, ...(draft.reason?.trim() ? { reason: draft.reason.trim() } : {}) }]
      .sort((a, b) => a.from.localeCompare(b.from)));
    setDraft({ from: '', to: '', reason: '' });
  };

  // Saves one panel only; the other panels keep their own (possibly unsaved) edits
  const save = async (section: Section) => {
    setStatus((st) => ({ ...st, [section]: 'saving' }));
    try {
      const payload = section === 'hours' ? { hours } : section === 'booking' ? { bookingSettings: booking } : { closures };
      const { data } = await availabilityAPI.saveSettings(payload);
      if (section === 'hours') { setHours(data.hours); setConfigured(data.configured); setSaved((v) => v && { ...v, hours: data.hours }); }
      if (section === 'booking') {
        setBooking(data.bookingSettings);
        setSaved((v) => v && { ...v, booking: data.bookingSettings });
        updateAppointmentSettings({ bufferTimeBetweenAppointments: data.bookingSettings.bufferMinutes });
      }
      if (section === 'closures') { setClosures(data.closures); setSaved((v) => v && { ...v, closures: data.closures }); }
      setStatus((st) => ({ ...st, [section]: 'saved' }));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des paramètres:', error);
      setStatus((st) => ({ ...st, [section]: 'error' }));
    }
  };

  // "Copier sur tous les jours ouverts": the first open day's hours and breaks go to every other open day
  const firstOpen = SALON_WEEK.find((d) => hours[d].isOpen);
  const copyToOpenDays = (from: typeof WEEK[number]) =>
    setHours((h) => h && Object.fromEntries(Object.entries(h).map(([d, v]) => [d, v.isOpen ? { ...h[from], breaks: h[from].breaks.map((b) => ({ ...b })) } : v])) as WeekHours);

  const saveBar = (section: Section, text: string, blocked = false) => {
    const st = status[section];
    return (
      <div className="mt-5 flex flex-col-reverse items-stretch gap-3 border-t border-gray-100 pt-4 sm:flex-row sm:items-center sm:justify-end dark:border-gray-800">
        {section === 'hours' && invalid ? (
          <p className="text-sm text-red-600 dark:text-red-400">{t('appointment_settings.fix_errors')}</p>
        ) : st === 'error' ? (
          <p className="text-sm text-red-600 dark:text-red-400" role="alert">{t('appointment_settings.error_message')}</p>
        ) : dirty[section] ? (
          <p className="flex items-center gap-2 text-sm text-amber-700 dark:text-amber-400" role="status">
            <span className="size-1.5 rounded-full bg-amber-500" aria-hidden="true" />
            {t('appointment_settings.unsaved')}
          </p>
        ) : st === 'saved' ? (
          <p className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400" role="status">
            <CheckIcon className="size-4" />{t('appointment_settings.saved')}
          </p>
        ) : null}
        <button type="button" onClick={() => save(section)} disabled={st === 'saving' || !dirty[section] || blocked} className="btn-primary">
          {st === 'saving' && <span className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />}
          {st === 'saving' ? t('appointment_settings.saving') : text}
        </button>
      </div>
    );
  };

  const locale = getDateLocale(i18n.language);
  const dayLabel = (key: string) => format(parseISO(key), 'EEE d MMM yyyy', { locale });
  const today = format(new Date(), 'yyyy-MM-dd');

  const row = (id: string, title: string, description: string, control: React.ReactNode) => (
    <div className="grid gap-3 py-5 first:pt-0 last:pb-0 sm:grid-cols-[1fr_auto] sm:items-center sm:gap-6">
      <div>
        <label htmlFor={id} className={label}>{title}</label>
        <p className={help}>{description}</p>
      </div>
      <div className="flex items-center gap-3">{control}</div>
    </div>
  );

  return (
    <div className="space-y-6">
      <Panel title={t('appointment_settings.hours_title')} description={t('appointment_settings.hours_description')}>
        {!configured && (
          <div className="mb-4 flex items-start gap-3 rounded-xl bg-amber-50 px-3.5 py-3 text-sm text-amber-800 dark:bg-amber-500/10 dark:text-amber-300" role="status">
            <ExclamationTriangleIcon className="size-5 shrink-0" />
            <p>{t('appointment_settings.not_configured')}</p>
          </div>
        )}
        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {SALON_WEEK.map((day, i) => {
            const d = hours[day];
            const name = t(`team:schedule.${day}`);
            return (
              <div key={day} className="py-3 first:pt-0 last:pb-0">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                  <label className="flex min-h-[40px] w-32 cursor-pointer items-center gap-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                    <input type="checkbox" className={checkbox} checked={d.isOpen} onChange={(e) => setDay(day, { isOpen: e.target.checked })} />
                    {name}
                  </label>
                  {d.isOpen ? (
                    <div className="flex flex-wrap items-center gap-2">
                      <input type="time" aria-label={`${name} — ${t('appointment_settings.opening_time')}`} value={d.start} step={300}
                        onChange={(e) => setDay(day, { start: e.target.value })} className={timeField} />
                      <span className="text-gray-400">–</span>
                      <input type="time" aria-label={`${name} — ${t('appointment_settings.closing_time')}`} value={d.end} step={300}
                        onChange={(e) => setDay(day, { end: e.target.value })} className={timeField} />
                      <button type="button" onClick={() => setDay(day, { breaks: [...d.breaks, { start: '12:30', end: '13:30' }] })}
                        className="inline-flex min-h-[40px] items-center gap-1 px-1 text-sm font-medium text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300">
                        <PlusIcon className="size-4" />
                        {t('appointment_settings.add_break')}
                      </button>
                      {day === firstOpen && (
                        <button type="button" onClick={() => copyToOpenDays(day)}
                          className="inline-flex min-h-[40px] items-center gap-1 px-1 text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100">
                          <DocumentDuplicateIcon className="size-4" />
                          {t('appointment_settings.copy_to_open_days')}
                        </button>
                      )}
                    </div>
                  ) : (
                    <span className="text-sm text-gray-400 dark:text-gray-500">{t('appointment_settings.closed')}</span>
                  )}
                </div>
                {d.isOpen && d.breaks.map((b, j) => (
                  <div key={j} className="mt-2 flex flex-wrap items-center gap-2 sm:ps-36">
                    <span className="w-full text-sm text-gray-500 sm:w-12 dark:text-gray-400">{t('appointment_settings.break_label')}</span>
                    <input type="time" aria-label={`${name} — ${t('appointment_settings.lunch_start')}`} value={b.start} step={300}
                      onChange={(e) => setBreak(day, j, 'start', e.target.value)} className={breakField} />
                    <span className="text-gray-400">–</span>
                    <input type="time" aria-label={`${name} — ${t('appointment_settings.lunch_end')}`} value={b.end} step={300}
                      onChange={(e) => setBreak(day, j, 'end', e.target.value)} className={breakField} />
                    <IconButton label={t('appointment_settings.remove_break')} tone="danger"
                      onClick={() => setDay(day, { breaks: d.breaks.filter((_, k) => k !== j) })}>
                      <XMarkIcon className="size-4" />
                    </IconButton>
                  </div>
                ))}
                {errors[i] && <p className="mt-2 text-xs text-red-600 dark:text-red-400 sm:ps-36">{t(`appointment_settings.${errors[i]}`)}</p>}
              </div>
            );
          })}
        </div>
        {saveBar('hours', t('appointment_settings.save_hours'), invalid)}
      </Panel>

      <Panel title={t('appointment_settings.booking_title')} description={t('appointment_settings.booking_description')}>
        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {row('slotInterval', t('appointment_settings.slot_interval'), t('appointment_settings.slot_interval_description'),
            <select id="slotInterval" className="field w-auto" value={booking.slotInterval} onChange={(e) => setRule('slotInterval', +e.target.value)}>
              {INTERVALS.map((m) => <option key={m} value={m}>{m} {t('appointment_settings.units.minutes')}</option>)}
            </select>)}
          {row('minNotice', t('appointment_settings.min_notice'), t('appointment_settings.min_notice_description'),
            <select id="minNotice" className="field w-auto" value={booking.minNoticeMinutes} onChange={(e) => setRule('minNoticeMinutes', +e.target.value)}>
              {[...new Set([...NOTICE_OPTIONS, booking.minNoticeMinutes])].sort((a, b) => a - b).map((m) => (
                <option key={m} value={m}>{t(`appointment_settings.notice_options.${m}`, { defaultValue: `${m} ${t('appointment_settings.units.minutes')}` })}</option>
              ))}
            </select>)}
          {row('maxAdvance', t('appointment_settings.max_advance_booking'), t('appointment_settings.max_advance_booking_description'),
            <>
              <input type="number" id="maxAdvance" min={1} max={365} value={booking.maxAdvanceDays} className="field w-24 tabular-nums"
                onChange={(e) => setRule('maxAdvanceDays', Math.min(365, Math.max(1, num(e.target.value, 60))))} />
              <span className={unit}>{t('appointment_settings.units.days')}</span>
            </>)}
          {row('bufferTime', t('appointment_settings.buffer_time'), t('appointment_settings.buffer_time_description'),
            <>
              <input type="number" id="bufferTime" min={0} max={120} step={5} value={booking.bufferMinutes} className="field w-24 tabular-nums"
                onChange={(e) => setRule('bufferMinutes', Math.min(120, Math.max(0, num(e.target.value, 0))))} />
              <span className={unit}>{t('appointment_settings.units.minutes')}</span>
            </>)}
          <div className="py-5 last:pb-0">
            <label htmlFor="allowAnyStaff" className="flex items-start gap-3">
              <input type="checkbox" id="allowAnyStaff" className={`${checkbox} mt-0.5`} checked={booking.allowAnyStaff}
                onChange={(e) => setRule('allowAnyStaff', e.target.checked)} />
              <span>
                <span className={label}>{t('appointment_settings.allow_any_staff')}</span>
                <span className={help + ' block'}>{t('appointment_settings.allow_any_staff_description')}</span>
              </span>
            </label>
          </div>
          <div className="py-5 last:pb-0">
            <p className={label}>{t('appointment_settings.cancellation_policy')}</p>
            <label htmlFor="allowCancellation" className="mt-3 flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
              <input type="checkbox" id="allowCancellation" checked={booking.allowCancellation} className={checkbox}
                onChange={(e) => setRule('allowCancellation', e.target.checked)} />
              {t('appointment_settings.allow_cancellation')}
            </label>
            {booking.allowCancellation && (
              <div className="mt-4 flex flex-wrap items-center gap-3 ps-7">
                <label htmlFor="cancellationDeadline" className="text-sm text-gray-700 dark:text-gray-300">{t('appointment_settings.cancellation_deadline')}</label>
                <input type="number" id="cancellationDeadline" min={0} max={336} value={booking.cancellationDeadlineHours} className="field w-24 tabular-nums"
                  onChange={(e) => setRule('cancellationDeadlineHours', Math.max(0, num(e.target.value, 24)))} />
                <span className={unit}>{t('appointment_settings.units.hours_before')}</span>
              </div>
            )}
          </div>
        </div>
        {saveBar('booking', t('appointment_settings.save_booking'))}
      </Panel>

      <Panel title={t('appointment_settings.closures_title')} description={t('appointment_settings.closures_description')}>
        {closures.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">{t('appointment_settings.no_closures')}</p>
        ) : (
          <ul className="divide-y divide-gray-100 dark:divide-gray-800">
            {closures.map((c, i) => (
              <li key={`${c.from}-${i}`} className="flex items-center gap-3 py-2.5 first:pt-0">
                <div className="min-w-0 flex-1 text-sm">
                  <p className="font-medium tabular-nums text-gray-900 first-letter:uppercase dark:text-gray-50">
                    {c.from === c.to ? dayLabel(c.from) : `${dayLabel(c.from)} – ${dayLabel(c.to)}`}
                  </p>
                  {c.reason && <p className="truncate text-gray-500 dark:text-gray-400">{c.reason}</p>}
                </div>
                <IconButton label={t('appointment_settings.remove_closure')} tone="danger" onClick={() => setClosures((list) => list.filter((_, j) => j !== i))}>
                  <XMarkIcon className="size-4" />
                </IconButton>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-4 grid gap-3 border-t border-gray-100 pt-4 sm:grid-cols-[auto_auto_1fr_auto] sm:items-end dark:border-gray-800">
          <div>
            <label htmlFor="closureFrom" className="mb-1.5 block text-sm text-gray-700 dark:text-gray-300">{t('appointment_settings.closure_from')}</label>
            <input type="date" id="closureFrom" min={today} value={draft.from} className="field"
              onChange={(e) => setDraft((d) => ({ ...d, from: e.target.value }))} />
          </div>
          <div>
            <label htmlFor="closureTo" className="mb-1.5 block text-sm text-gray-700 dark:text-gray-300">{t('appointment_settings.closure_to')}</label>
            <input type="date" id="closureTo" min={draft.from || today} value={draft.to} className="field"
              onChange={(e) => setDraft((d) => ({ ...d, to: e.target.value }))} />
          </div>
          <div>
            <label htmlFor="closureReason" className="mb-1.5 block text-sm text-gray-700 dark:text-gray-300">{t('appointment_settings.closure_reason')}</label>
            <input type="text" id="closureReason" maxLength={120} value={draft.reason} className="field"
              placeholder={t('appointment_settings.closure_reason_placeholder')}
              onChange={(e) => setDraft((d) => ({ ...d, reason: e.target.value }))}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addClosure(); } }} />
          </div>
          <button type="button" onClick={addClosure} disabled={!draft.from} className="btn-secondary">
            <PlusIcon className="size-4" />
            {t('appointment_settings.add_closure')}
          </button>
        </div>
        {saveBar('closures', t('appointment_settings.save_closures'))}
      </Panel>
    </div>
  );
};

export default AppointmentSettings;
