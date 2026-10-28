import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { WILAYAS } from '../../directory/api';
import { ALL_ZONES } from '../api';

/** Delivery zones: "toute l'Algérie" or a set of wilayas (searchable checkbox grid). */
const ZonePicker: React.FC<{ value: string[]; onChange: (v: string[]) => void; id?: string }> = ({ value, onChange, id = 'zones' }) => {
  const { t } = useTranslation('marketplace');
  const [q, setQ] = useState('');
  const all = value.includes(ALL_ZONES);
  const fold = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const shown = WILAYAS.map((w, i) => ({ w, code: i + 1 })).filter(({ w, code }) => !q || fold(w).includes(fold(q)) || String(code) === q.trim());
  const toggle = (w: string) => onChange(value.includes(w) ? value.filter((x) => x !== w) : [...value.filter((x) => x !== ALL_ZONES), w]);

  return (
    <fieldset>
      <div className="flex flex-wrap gap-2" role="radiogroup">
        {[true, false].map((v) => (
          <label key={String(v)} className={clsx('inline-flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition-colors duration-150',
            all === v ? 'border-orange-500 bg-orange-50 text-orange-800 dark:bg-orange-500/10 dark:text-orange-300' : 'border-gray-200 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800')}>
            <input type="radio" name={`${id}-mode`} className="sr-only" checked={all === v} onChange={() => onChange(v ? [ALL_ZONES] : [])} />
            {v ? t('zones.all') : t('zones.some')}
          </label>
        ))}
      </div>
      {!all && (
        <div className="mt-3 rounded-xl border border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3 border-b border-gray-100 p-2 dark:border-gray-800">
            <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('zones.search')} aria-label={t('zones.search')} className="field h-9 flex-1" />
            <span className="shrink-0 pe-2 text-xs tabular-nums text-gray-500 dark:text-gray-400">{t('zones.selected', { count: value.length })}</span>
          </div>
          <div className="grid max-h-56 grid-cols-2 gap-x-2 overflow-y-auto p-2 sm:grid-cols-3">
            {shown.map(({ w, code }) => (
              <label key={w} className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800">
                <input type="checkbox" checked={value.includes(w)} onChange={() => toggle(w)} className="size-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500" />
                <span className="truncate"><span className="tabular-nums text-gray-400">{String(code).padStart(2, '0')}</span> {w}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </fieldset>
  );
};

export default ZonePicker;
