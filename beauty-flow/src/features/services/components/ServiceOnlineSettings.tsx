import React from 'react';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { Service } from '../types';
import { useServiceStore } from '../store';

/** Interrupteur "réservable en ligne", lu et enregistré dans settings.isOnline du service. */
const ServiceOnlineSettings: React.FC<{ service: Service }> = ({ service }) => {
  const { t } = useTranslation('services');
  const updateService = useServiceStore((state) => state.updateService);
  const [saving, setSaving] = React.useState(false);
  const on = !!service.isOnline;

  const toggle = async () => {
    setSaving(true);
    try {
      await updateService(service.id, { ...service, isOnline: !on });
    } finally {
      setSaving(false);
    }
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={t('form.online_settings.available_online')}
      title={t('form.online_settings.available_online')}
      onClick={toggle}
      disabled={saving}
      className="group inline-flex items-center gap-2 min-h-10 text-sm text-gray-600 dark:text-gray-400 disabled:opacity-60"
    >
      <span
        className={clsx(
          'relative inline-flex h-5 w-9 shrink-0 rounded-full transition-colors duration-150 ease-out group-focus-visible:ring-2 group-focus-visible:ring-orange-500 group-focus-visible:ring-offset-2 dark:group-focus-visible:ring-offset-gray-900',
          on ? 'bg-orange-500' : 'bg-gray-200 dark:bg-gray-700'
        )}
      >
        <span
          className={clsx(
            'absolute top-0.5 start-0.5 size-4 rounded-full bg-white shadow-sm transition-transform duration-150 ease-out',
            on && 'translate-x-4 rtl:-translate-x-4'
          )}
        />
      </span>
      <span className="hidden md:inline">{t('list.online')}</span>
    </button>
  );
};

export default ServiceOnlineSettings;
