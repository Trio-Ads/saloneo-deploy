import React from 'react';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import {
  CurrencyDollarIcon,
  Squares2X2Icon,
  ClockIcon,
  ChartBarIcon,
  FireIcon,
  EyeSlashIcon,
  ArrowsRightLeftIcon
} from '@heroicons/react/24/outline';
import { InterfaceSettings } from '../types';

interface DisplaySettingsProps {
  settings: InterfaceSettings['serviceDisplay'];
  onChange: (settings: InterfaceSettings['serviceDisplay']) => void;
}

type Option = { value: string; icon: React.ComponentType<{ className?: string }> };

const viewOptions: Option[] = [
  { value: 'category', icon: Squares2X2Icon },
  { value: 'price', icon: CurrencyDollarIcon },
  { value: 'duration', icon: ClockIcon },
  { value: 'popularity', icon: FireIcon }
];

const priceOptions: Option[] = [
  { value: 'fixed', icon: CurrencyDollarIcon },
  { value: 'from', icon: ChartBarIcon },
  { value: 'range', icon: ArrowsRightLeftIcon },
  { value: 'hidden', icon: EyeSlashIcon }
];

const DisplaySettings: React.FC<DisplaySettingsProps> = ({ settings, onChange }) => {
  const { t } = useTranslation('interface');

  const group = (key: 'view' | 'price', options: Option[], current: string, pick: (v: string) => void) => (
    <fieldset>
      <legend className="text-sm font-medium text-gray-700 dark:text-gray-300">{t(`display_settings.${key}.title`)}</legend>
      <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{t(`display_settings.${key}.description`)}</p>
      <div role="radiogroup" className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {options.map(({ value, icon: Icon }) => {
          const selected = current === value;
          return (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => pick(value)}
              className={clsx(
                'flex items-start gap-3 rounded-xl border px-3.5 py-3 text-start transition-colors duration-150 ease-out',
                selected
                  ? 'border-orange-500 bg-orange-50 dark:border-orange-400 dark:bg-orange-500/10'
                  : 'border-gray-200 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800/60'
              )}
            >
              <Icon className={clsx('mt-0.5 size-5 shrink-0', selected ? 'text-orange-600 dark:text-orange-400' : 'text-gray-400')} />
              <span className="min-w-0">
                <span className="block text-sm font-medium text-gray-900 dark:text-gray-50">{t(`display_settings.${key}.options.${value}.label`)}</span>
                <span className="block text-xs text-gray-500 dark:text-gray-400">{t(`display_settings.${key}.options.${value}.description`)}</span>
              </span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );

  return (
    <div className="space-y-6">
      {group('view', viewOptions, settings.defaultView, (v) => onChange({ ...settings, defaultView: v as any }))}
      {group('price', priceOptions, settings.priceDisplay, (v) => onChange({ ...settings, priceDisplay: v as any }))}
    </div>
  );
};

export default DisplaySettings;
