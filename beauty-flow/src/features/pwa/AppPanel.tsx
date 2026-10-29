import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowDownTrayIcon, BellIcon, BellSlashIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { Panel } from '../../components/ui';
import { isNativeApp } from '../../native';
import { canPromptInstall, disablePush, enablePush, isInstalled, isIos, nativePushAvailable, onPwaChange, promptInstall, pushEnabled, pushSupported } from './pwa';

/** "Application mobile": install Saloneo on this phone and turn its notifications on. */
const AppPanel: React.FC<{ audience: 'owner' | 'staff' | 'supplier'; className?: string }> = ({ audience, className }) => {
  const { t } = useTranslation('common');
  const [, rerender] = useState(0);
  const [push, setPush] = useState<boolean | null>(null);
  const [denied, setDenied] = useState(!isNativeApp && pushSupported() && Notification.permission === 'denied');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => onPwaChange(() => rerender((n) => n + 1)), []);
  // Store app: null while checking, false when this platform's push isn't configured yet
  const [nativeReady, setNativeReady] = useState<boolean | null>(isNativeApp ? null : true);
  useEffect(() => { pushEnabled().then(setPush).catch(() => setPush(false)); }, []);
  useEffect(() => { if (isNativeApp) nativePushAvailable().then(setNativeReady).catch(() => setNativeReady(false)); }, []);

  const installed = isInstalled();
  const ios = isIos();

  const toggle = async () => {
    setBusy(true);
    setError(false);
    try {
      if (push) {
        await disablePush();
        setPush(false);
      } else {
        const permission = await enablePush();
        setDenied(permission === 'denied');
        setPush(permission === 'granted');
      }
    } catch {
      setError(true);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Panel title={t(isNativeApp ? 'pwa.notifications' : 'pwa.title')} description={isNativeApp ? undefined : t(`pwa.description_${audience}`)} className={className}>
      <div className="space-y-5 text-sm">
        {!isNativeApp && <div>
          {installed ? (
            <p className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
              <CheckCircleIcon className="size-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
              {t('pwa.installed')}
            </p>
          ) : canPromptInstall() ? (
            <button type="button" className="btn-primary inline-flex items-center gap-2" onClick={promptInstall}>
              <ArrowDownTrayIcon className="size-4" />
              {t('pwa.install')}
            </button>
          ) : (
            <div>
              <p className="font-medium text-gray-900 dark:text-white">{t('pwa.install_how')}</p>
              <ol className="mt-2 list-decimal space-y-1 ps-5 text-gray-600 dark:text-gray-400">
                {(ios ? ['ios_step1', 'ios_step2', 'ios_step3'] : ['android_step1', 'android_step2']).map((k) => (
                  <li key={k}>{t(`pwa.${k}`)}</li>
                ))}
              </ol>
            </div>
          )}
        </div>}

        <div className={isNativeApp ? undefined : 'border-t border-gray-100 pt-5 dark:border-gray-800'}>
          {!isNativeApp && <p className="font-medium text-gray-900 dark:text-white">{t('pwa.notifications')}</p>}
          {nativeReady === false ? (
            <p className="mt-1 text-gray-600 dark:text-gray-400">{t('pwa.native_soon')}</p>
          ) : !pushSupported() ? (
            <p className="mt-1 text-gray-600 dark:text-gray-400">{t(ios && !installed ? 'pwa.ios_install_first' : 'pwa.unsupported')}</p>
          ) : denied && !push ? (
            <p className="mt-1 text-gray-600 dark:text-gray-400">{t('pwa.blocked')}</p>
          ) : (
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <button type="button" className={push ? 'btn-secondary inline-flex items-center gap-2' : 'btn-primary inline-flex items-center gap-2'} onClick={toggle} disabled={busy || push === null || nativeReady === null}>
                {push ? <BellSlashIcon className="size-4" /> : <BellIcon className="size-4" />}
                {t(push ? 'pwa.disable' : 'pwa.enable')}
              </button>
              {push && <span className="text-gray-600 dark:text-gray-400">{t('pwa.enabled')}</span>}
            </div>
          )}
          {error && <p className="mt-2 text-red-600 dark:text-red-400" role="alert">{t('pwa.error')}</p>}
        </div>
      </div>
    </Panel>
  );
};

export default AppPanel;
