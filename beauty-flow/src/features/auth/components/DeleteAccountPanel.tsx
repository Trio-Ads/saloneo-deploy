import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { IconButton, Panel } from '../../../components/ui';
import { useToastStore } from '../../../components/Toast';
import { authAPI } from '../../../services/api';
import { useAuthStore } from '../store';

const SUPPORT_EMAIL = 'contact@saloneo.app';
const POINTS = { owner: ['now', 'later', 'kept', 'undo'], supplier: ['now', 'later', 'kept', 'undo'], staff: ['now', 'team', 'again'] } as const;

/** Danger zone at the bottom of a profile page: password-confirmed account deletion (App Store 5.1.1(v)). */
const DeleteAccountPanel: React.FC<{ audience: 'owner' | 'staff' | 'supplier'; className?: string }> = ({ audience, className }) => {
  const { t } = useTranslation('auth');
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);
  const showToast = useToastStore((s) => s.showToast);
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const k = (key: string) => `account_deletion.${audience}.${key}`;

  const close = () => { if (!busy) { setOpen(false); setPassword(''); setError(null); } };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await authAPI.deleteAccount(password);
      // The session is already closed server-side: drop the tokens first so logout does not try to refresh them
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      await logout();
      showToast(t(k('done')), 'success');
      navigate('/', { replace: true });
    } catch (err: any) {
      const code = err?.response?.data?.code;
      setError(code === 'PASSWORD_INCORRECT' ? 'account_deletion.errors.password'
        : code === 'DELETION_BLOCKED_PENDING_MONEY' ? 'account_deletion.errors.money'
        : 'account_deletion.errors.generic');
      setBusy(false);
    }
  };

  return (
    <>
      <Panel title={t(k('title'))} description={t(k('description'))} className={className}>
        <button type="button" className="btn-secondary !text-red-600 dark:!text-red-400" onClick={() => setOpen(true)}>{t(k('title'))}</button>
      </Panel>

      {open && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center overflow-y-auto bg-gray-900/50 sm:items-center sm:p-4" onClick={close} onKeyDown={(e) => e.key === 'Escape' && close()}>
          <div role="dialog" aria-modal="true" aria-labelledby="delete-account-title" onClick={(e) => e.stopPropagation()}
            className="animate-modal-in sheet-on-mobile w-full overflow-hidden rounded-t-2xl border border-gray-200 bg-white shadow-xl dark:border-gray-800 dark:bg-gray-900 sm:max-w-md sm:rounded-2xl">
            <form onSubmit={submit}>
              <div className="flex items-center justify-between gap-4 border-b border-gray-100 px-5 py-4 dark:border-gray-800">
                <h3 id="delete-account-title" className="text-base font-semibold text-gray-900 dark:text-gray-50">{t(k('title'))}</h3>
                <IconButton label={t('account_deletion.cancel')} onClick={close}><XMarkIcon className="size-5" /></IconButton>
              </div>
              <div className="space-y-4 px-5 py-5">
                <ul className="list-disc space-y-2 ps-5 text-sm text-gray-700 marker:text-gray-400 dark:text-gray-300">
                  {POINTS[audience].map((p) => <li key={p}>{t(k(`points.${p}`), { email: SUPPORT_EMAIL })}</li>)}
                </ul>
                <div>
                  <label htmlFor="delete-account-password" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">{t('account_deletion.password')}</label>
                  <input id="delete-account-password" type="password" autoComplete="current-password" required autoFocus className="field"
                    value={password} onChange={(e) => setPassword(e.target.value)} aria-invalid={!!error} />
                </div>
                {error && <p role="alert" className="text-sm text-red-600 dark:text-red-400">{t(error, { email: SUPPORT_EMAIL })}</p>}
              </div>
              <div className="flex flex-col-reverse gap-2 border-t border-gray-100 px-5 py-4 dark:border-gray-800 pb-[max(1rem,env(safe-area-inset-bottom))] sm:flex-row sm:justify-end sm:pb-4">
                <button type="button" className="btn-secondary" onClick={close} disabled={busy}>{t('account_deletion.cancel')}</button>
                <button type="submit" className="btn-primary !bg-red-600 hover:!bg-red-700" disabled={busy || !password}>
                  {busy && <span className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />}
                  {t(k('confirm'))}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default DeleteAccountPanel;
