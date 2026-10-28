import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckIcon } from '@heroicons/react/24/outline';
import { Panel } from '../../../components/ui';
import { OFFER_MINUTES, WaitlistSettings as Settings, waitlistAPI } from '../../public/waitlist';

const label = 'block text-sm font-medium text-gray-900 dark:text-gray-50';
const help = 'mt-1 block text-xs text-gray-500 dark:text-gray-400';
const checkbox = 'mt-0.5 size-4 rounded border-gray-300 text-orange-500 accent-orange-500 focus:ring-orange-500 dark:border-gray-600';

/** Waitlist on/off, how long an offer stays valid, and whether the offered slot is held meanwhile. */
export default function WaitlistSettings() {
  const { t } = useTranslation('appointments');
  const [value, setValue] = useState<Settings | null>(null);
  const [saved, setSaved] = useState<Settings | null>(null);
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  useEffect(() => {
    waitlistAPI.getSettings().then(({ data }) => { setValue(data); setSaved(data); }).catch(() => setStatus('error'));
  }, []);
  if (!value || !saved) return null;

  const dirty = JSON.stringify(value) !== JSON.stringify(saved);
  const set = <K extends keyof Settings>(k: K, v: Settings[K]) => { setValue({ ...value, [k]: v }); setStatus('idle'); };
  const save = async () => {
    setStatus('saving');
    try {
      const { data } = await waitlistAPI.saveSettings(value);
      setValue(data);
      setSaved(data);
      setStatus('saved');
    } catch {
      setStatus('error');
    }
  };

  return (
    <Panel title={t('waitlist.settings.title')} description={t('waitlist.settings.description')}>
      <div className="divide-y divide-gray-100 dark:divide-gray-800">
        <div className="pb-5">
          <label htmlFor="wlEnabled" className="flex items-start gap-3">
            <input type="checkbox" id="wlEnabled" className={checkbox} checked={value.enabled} onChange={(e) => set('enabled', e.target.checked)} />
            <span>
              <span className={label}>{t('waitlist.settings.enabled')}</span>
              <span className={help}>{t('waitlist.settings.enabled_description')}</span>
            </span>
          </label>
        </div>
        {value.enabled && (
          <>
            <div className="grid gap-3 py-5 sm:grid-cols-[1fr_auto] sm:items-center sm:gap-6">
              <div>
                <label htmlFor="wlOfferMinutes" className={label}>{t('waitlist.settings.offer_minutes')}</label>
                <p className={help}>{t('waitlist.settings.offer_minutes_description')}</p>
              </div>
              <select id="wlOfferMinutes" className="field w-auto" value={value.offerMinutes} onChange={(e) => set('offerMinutes', +e.target.value)}>
                {OFFER_MINUTES.map((m) => <option key={m} value={m}>{m} {t('appointment_settings.units.minutes')}</option>)}
              </select>
            </div>
            <div className="pt-5">
              <label htmlFor="wlHold" className="flex items-start gap-3">
                <input type="checkbox" id="wlHold" className={checkbox} checked={value.holdSlot} onChange={(e) => set('holdSlot', e.target.checked)} />
                <span>
                  <span className={label}>{t('waitlist.settings.hold')}</span>
                  <span className={help}>{t('waitlist.settings.hold_description')}</span>
                </span>
              </label>
            </div>
          </>
        )}
      </div>
      <div className="mt-5 flex flex-col-reverse items-stretch gap-3 border-t border-gray-100 pt-4 sm:flex-row sm:items-center sm:justify-end dark:border-gray-800">
        {status === 'error' ? (
          <p className="text-sm text-red-600 dark:text-red-400" role="alert">{t('appointment_settings.error_message')}</p>
        ) : dirty ? (
          <p className="flex items-center gap-2 text-sm text-amber-700 dark:text-amber-400" role="status">
            <span className="size-1.5 rounded-full bg-amber-500" aria-hidden="true" />
            {t('appointment_settings.unsaved')}
          </p>
        ) : status === 'saved' ? (
          <p className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400" role="status">
            <CheckIcon className="size-4" />{t('appointment_settings.saved')}
          </p>
        ) : null}
        <button type="button" onClick={save} disabled={status === 'saving' || !dirty} className="btn-primary">
          {status === 'saving' && <span className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />}
          {status === 'saving' ? t('appointment_settings.saving') : t('waitlist.settings.save')}
        </button>
      </div>
    </Panel>
  );
}
