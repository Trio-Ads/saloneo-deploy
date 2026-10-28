import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { addDays, format, parseISO } from 'date-fns';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { CheckCircleIcon, CheckIcon, ClipboardDocumentIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { dateLocale } from './bookingTheme';
import { StaffOption } from '../../appointments/availability';
import { TIMES_OF_DAY, TimeOfDay, WaitlistPublicEntry, waitlistAPI, waitlistCode } from '../waitlist';

interface WaitlistFormProps {
  slug: string;
  serviceId: string;
  /** '' = peu importe */
  stylistId: string;
  staff: StaffOption[];
  allowAnyStaff: boolean;
  showTeamSelection: boolean;
  /** First day offered (the day the client was looking at) */
  initialDay: string;
  today: string;
  horizon: string;
  onBack: () => void;
}

const MAX_DAYS = 14;
const key = (d: Date) => format(d, 'yyyy-MM-dd');

/** "Rejoindre la liste d'attente": inside the booking sheet, step 1. Confirmation with the manage link once sent. */
export default function WaitlistForm({ slug, serviceId, stylistId, staff, allowAnyStaff, showTeamSelection, initialDay, today, horizon, onBack }: WaitlistFormProps) {
  const { t, i18n } = useTranslation('public');
  const start = initialDay < today ? today : initialDay;
  const [form, setForm] = useState({
    stylistId: stylistId || (allowAnyStaff ? '' : staff[0]?.id || ''),
    from: start,
    to: [key(addDays(parseISO(start), 6)), horizon].sort()[0],
    timeOfDay: 'any' as TimeOfDay,
    firstName: '', lastName: '', phone: '', email: '',
    consent: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);
  const [failure, setFailure] = useState('');
  const [done, setDone] = useState<{ entry: WaitlistPublicEntry; manageUrl: string; merged: boolean } | null>(null);
  const [copied, setCopied] = useState(false);
  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => setForm((f) => ({ ...f, [k]: v }));

  const lastAllowed = [key(addDays(parseISO(form.from), MAX_DAYS - 1)), horizon].sort()[0];
  const dayLabel = (d: string) => format(parseISO(d), 'EEE d MMM', { locale: dateLocale(i18n.language) });
  const longDay = (d: string) => format(parseISO(d), 'EEEE d MMMM', { locale: dateLocale(i18n.language) });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err: Record<string, string> = {};
    if (!form.firstName.trim()) err.firstName = t('booking.form.errors.first_name');
    if (!form.phone) err.phone = t('booking.form.errors.phone_required');
    else if (form.phone.replace(/\D/g, '').length < 9) err.phone = t('booking.form.errors.phone_invalid');
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) err.email = t('booking.form.errors.email_invalid');
    if (!form.from || !form.to || form.to < form.from || form.to > lastAllowed) err.range = t('waitlist.errors.INVALID_RANGE');
    if (!form.consent) err.consent = t('waitlist.errors.consent');
    setErrors(err);
    setFailure('');
    if (Object.keys(err).length) return;
    setSending(true);
    try {
      const { data } = await waitlistAPI.join(slug, {
        serviceId,
        stylistId: form.stylistId || undefined,
        from: form.from,
        to: form.to,
        timeOfDay: form.timeOfDay,
        client: { firstName: form.firstName.trim(), lastName: form.lastName.trim(), phone: form.phone, email: form.email.trim() || undefined },
        consent: true,
        lang: i18n.language,
      });
      setDone(data);
    } catch (error: any) {
      const code = waitlistCode(error);
      setFailure(t(`waitlist.errors.${code}`, { defaultValue: t('waitlist.errors.generic') }));
    } finally {
      setSending(false);
    }
  };

  if (done) {
    const { entry, manageUrl } = done;
    const copy = async () => {
      try {
        await navigator.clipboard.writeText(manageUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        // Clipboard unavailable: the link stays selectable
      }
    };
    return (
      <div className="bk-waitlist space-y-5" aria-live="polite">
        <div className="bk-notice is-success">
          <CheckCircleIcon className="h-5 w-5 shrink-0" />
          <div>
            <p className="font-semibold">{done.merged ? t('waitlist.done.updated') : t('waitlist.done.title')}</p>
            <p className="mt-0.5">{t('waitlist.done.body', { from: longDay(entry.from), to: longDay(entry.to) })}</p>
          </div>
        </div>
        {entry.offer && (
          <div className="bk-card">
            <div className="bk-row">
              <span>{t('waitlist.done.offer_now')}</span>
              <span className="first-letter:uppercase">{dayLabel(entry.offer.date)} · {entry.offer.time}</span>
            </div>
            <div className="p-4 pt-0">
              <a className="bk-btn w-full" href={entry.offer.url}>{t('waitlist.offer.book')}</a>
            </div>
          </div>
        )}
        <div className="bk-card">
          <div className="bk-row"><span>{t('waitlist.form.when')}</span><span>{t(`waitlist.time.${entry.timeOfDay}`)}</span></div>
          <div className="bk-row"><span>{t('booking.summary.with')}</span><span>{entry.stylistName || t('booking.flow.any_stylist')}</span></div>
        </div>
        <div>
          <p className="bk-label">{t('waitlist.done.manage_link')}</p>
          <div className="bk-field flex items-center gap-2 !py-0 !pe-1">
            <span className="flex-1 min-w-0 truncate text-sm select-all">{manageUrl}</span>
            <button type="button" className="bk-icon-btn" onClick={copy} aria-label={copied ? t('booking.confirm.copied') : t('booking.confirm.copy')}>
              {copied ? <CheckIcon className="h-5 w-5" /> : <ClipboardDocumentIcon className="h-5 w-5" />}
            </button>
          </div>
          <p className="bk-muted text-xs mt-2">{t('waitlist.done.manage_hint')}</p>
        </div>
        <button type="button" className="bk-btn-ghost w-full" onClick={onBack}>{t('waitlist.form.back_to_slots')}</button>
      </div>
    );
  }

  const a11y = (field: string) => ({ 'aria-invalid': !!errors[field], 'aria-describedby': errors[field] ? `wl-${field}-error` : undefined });
  const error = (field: string) => errors[field] && <p id={`wl-${field}-error`} className="bk-error" role="alert">{errors[field]}</p>;

  return (
    <form className="bk-waitlist space-y-5" onSubmit={submit} noValidate>
      <div>
        <h3 className="bk-h text-lg">{t('waitlist.form.title')}</h3>
        <p className="bk-muted text-sm mt-1">{t('waitlist.form.intro')}</p>
      </div>

      {failure && (
        <div className="bk-notice is-error" role="alert">
          <ExclamationCircleIcon className="h-5 w-5 shrink-0" />
          <span>{failure}</span>
        </div>
      )}

      {showTeamSelection && staff.length > 1 && (
        <div>
          <label htmlFor="wl-staff" className="bk-label">{t('booking.flow.with_who')}</label>
          <select id="wl-staff" className="bk-field" value={form.stylistId} onChange={(e) => set('stylistId', e.target.value)}>
            {allowAnyStaff && <option value="">{t('booking.flow.any_stylist')}</option>}
            {staff.map((m) => <option key={m.id} value={m.id}>{`${m.firstName} ${m.lastName || ''}`.trim()}</option>)}
          </select>
        </div>
      )}

      <fieldset>
        <legend className="bk-label">{t('waitlist.form.dates')}</legend>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="wl-from" className="bk-muted text-xs">{t('waitlist.form.from')}</label>
            <input id="wl-from" type="date" className="bk-field" min={today} max={horizon} value={form.from} {...a11y('range')}
              onChange={(e) => {
                const from = e.target.value;
                setForm((f) => ({ ...f, from, to: f.to < from || f.to > key(addDays(parseISO(from), MAX_DAYS - 1)) ? [key(addDays(parseISO(from), 6)), horizon].sort()[0] : f.to }));
              }} />
          </div>
          <div>
            <label htmlFor="wl-to" className="bk-muted text-xs">{t('waitlist.form.to')}</label>
            <input id="wl-to" type="date" className="bk-field" min={form.from} max={lastAllowed} value={form.to} {...a11y('range')}
              onChange={(e) => set('to', e.target.value)} />
          </div>
        </div>
        <p className="bk-muted text-xs mt-2">{t('waitlist.form.dates_hint', { count: MAX_DAYS })}</p>
        {error('range')}
      </fieldset>

      <fieldset>
        <legend className="bk-label">{t('waitlist.form.when')}</legend>
        <div className="grid grid-cols-2 gap-2">
          {TIMES_OF_DAY.map((tod) => (
            <button key={tod} type="button" className="bk-option" aria-pressed={form.timeOfDay === tod} onClick={() => set('timeOfDay', tod)}>
              {t(`waitlist.time.${tod}`)}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="grid grid-cols-2 gap-x-3 gap-y-4">
        <div>
          <label htmlFor="wl-firstName" className="bk-label">{t('booking.form.first_name')}</label>
          <input id="wl-firstName" type="text" autoComplete="given-name" className="bk-field" value={form.firstName}
            onChange={(e) => set('firstName', e.target.value)} {...a11y('firstName')} />
          {error('firstName')}
        </div>
        <div>
          <label htmlFor="wl-lastName" className="bk-label">{t('booking.form.last_name')}</label>
          <input id="wl-lastName" type="text" autoComplete="family-name" className="bk-field" value={form.lastName}
            onChange={(e) => set('lastName', e.target.value)} />
        </div>
        <div className="col-span-2">
          <label htmlFor="wl-phone" className="bk-label">{t('booking.form.phone')}</label>
          <PhoneInput international defaultCountry="DZ" value={form.phone} onChange={(v) => set('phone', v || '')}
            className={`bk-field${errors.phone ? ' is-invalid' : ''}`}
            numberInputProps={{ id: 'wl-phone', autoComplete: 'tel', 'aria-describedby': errors.phone ? 'wl-phone-error' : undefined }} />
          {error('phone')}
        </div>
        <div className="col-span-2">
          <label htmlFor="wl-email" className="bk-label">{t('waitlist.form.email')}</label>
          <input id="wl-email" type="email" inputMode="email" autoComplete="email" className="bk-field" value={form.email}
            placeholder={t('booking.form.email_placeholder')} onChange={(e) => set('email', e.target.value)} {...a11y('email')} />
          {error('email')}
        </div>
      </div>

      <div>
        <label className="bk-switch-row">
          <span className="text-sm">{t('waitlist.form.consent')}</span>
          <input type="checkbox" role="switch" className="bk-switch" checked={form.consent}
            onChange={(e) => set('consent', e.target.checked)} {...a11y('consent')} />
        </label>
        {error('consent')}
      </div>

      <div className="flex gap-3">
        <button type="button" className="bk-btn-ghost !flex-none" onClick={onBack} disabled={sending}>{t('booking.flow.back')}</button>
        <button type="submit" className="bk-btn flex-1" disabled={sending}>
          {sending && <span className="bk-spinner" aria-hidden="true" />}
          {sending ? t('booking.flow.sending') : t('waitlist.form.submit')}
        </button>
      </div>
    </form>
  );
}
