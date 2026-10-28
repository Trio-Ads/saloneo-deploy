import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowTopRightOnSquareIcon, CheckIcon } from '@heroicons/react/24/outline';
import api from '../../services/api';
import { Panel } from '../../components/ui';
import { Toggle } from '../interface/components/Toggle';
import { WILAYAS, directoryPath, fetchCard, toSlug } from './api';

type Form = { listed: boolean; city: string; wilaya: string };

/** Mon interface → Paramètres: appear in the Saloneo directory, and where. Saves on its own, like the booking settings. */
export default function DirectorySettings() {
  const { t } = useTranslation('interface', { keyPrefix: 'directory' });
  const [form, setForm] = useState<Form | null>(null);
  const [profile, setProfile] = useState<{ slug?: string; name?: string }>({});
  // false = no service bookable online, so the salon cannot be listed yet
  const [eligible, setEligible] = useState<boolean | null>(null);
  const [state, setState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  useEffect(() => {
    api.get('/profile').then(async ({ data: u }) => {
      setProfile({ slug: u.slug, name: u.establishmentName });
      // The card carries the city/wilaya read from the address when none was chosen yet.
      const card = u.slug ? await fetchCard(u.slug).catch(() => null) : null;
      setEligible(!!card);
      setForm({
        listed: u.directory?.listed !== false,
        city: u.directory?.city || card?.city || '',
        wilaya: u.directory?.wilaya || card?.wilaya || '',
      });
    }).catch(() => setState('error'));
  }, []);

  const save = async () => {
    if (!form) return;
    setState('saving');
    try {
      await api.put('/profile', { directory: form });
      setState('saved');
      setTimeout(() => setState('idle'), 2500);
    } catch {
      setState('error');
    }
  };

  const set = (patch: Partial<Form>) => { setForm((f) => f && { ...f, ...patch }); setState('idle'); };
  const cardUrl = form && profile.name
    ? `${directoryPath(form.wilaya ? toSlug(form.wilaya) : undefined)}?q=${encodeURIComponent(profile.name)}`
    : '/salons';
  const label = 'block text-sm font-medium text-gray-700 dark:text-gray-300';
  const input = 'field mt-1.5 w-full text-base sm:text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100';

  return (
    <Panel title={t('title')} description={t('description')}>
      {!form ? (
        state === 'error'
          ? <p role="alert" className="text-sm text-red-600 dark:text-red-400">{t('load_error')}</p>
          : <div className="h-24 animate-pulse rounded-xl bg-gray-100 motion-reduce:animate-none dark:bg-gray-800" />
      ) : (
        <div className="space-y-5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('listed')}</p>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{form.listed ? t('listed_on') : t('listed_off')}</p>
            </div>
            <Toggle checked={form.listed} onChange={(listed) => set({ listed })} label={t('listed')} />
          </div>

          {form.listed && eligible === false && (
            <p className="rounded-xl bg-amber-50 px-3.5 py-3 text-sm text-amber-800 dark:bg-amber-500/10 dark:text-amber-300">{t('not_eligible')}</p>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <label className={label}>
              {t('wilaya')}
              <select value={form.wilaya} onChange={(e) => set({ wilaya: e.target.value })} className={input}>
                <option value="">{t('wilaya_none')}</option>
                {WILAYAS.map((w, i) => <option key={w} value={w}>{`${String(i + 1).padStart(2, '0')} · ${w}`}</option>)}
              </select>
            </label>
            <label className={label}>
              {t('city')}
              <input value={form.city} maxLength={60} onChange={(e) => set({ city: e.target.value })} placeholder={t('city_placeholder')} className={input} />
            </label>
          </div>
          <p className="-mt-2 text-xs text-gray-500 dark:text-gray-400">{t('location_help')}</p>

          <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-4 sm:flex-row sm:items-center sm:justify-between dark:border-gray-800">
            {form.listed && eligible ? (
              <a href={cardUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm font-medium text-orange-600 hover:text-orange-700 dark:text-orange-400">
                {t('see_card')} <ArrowTopRightOnSquareIcon className="size-4" />
              </a>
            ) : <span />}
            <div className="flex items-center gap-3">
              {state === 'error' && <p role="alert" className="text-sm text-red-600 dark:text-red-400">{t('save_error')}</p>}
              <button type="button" onClick={save} disabled={state === 'saving'} className="btn-primary min-w-[8.5rem]">
                {state === 'saving' ? t('saving') : state === 'saved' ? <><CheckIcon className="size-4" />{t('saved')}</> : t('save')}
              </button>
            </div>
          </div>
        </div>
      )}
    </Panel>
  );
}
