import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AxiosError } from 'axios';
import { format, parseISO } from 'date-fns';
import { ClipboardDocumentIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';
import { teamAccessAPI } from '../../../services/api';
import { StaffPermissions } from '../../auth/types';
import { DEFAULT_STAFF_PERMISSIONS } from '../../staff/access';
import { Badge, BadgeTone, Segmented } from '../../../components/ui';
import { useToastStore } from '../../../components/Toast';
import { getDateLocale } from '../../appointments/utils';
import { StaffAccess } from '../types';
import { useTeamStore } from '../store';

const tones: Record<StaffAccess['status'], BadgeTone> = { none: 'neutral', invited: 'orange', expired: 'amber', active: 'green', revoked: 'red' };
export const AccessBadge: React.FC<{ access?: StaffAccess }> = ({ access }) => {
  const { t } = useTranslation('team');
  if (!access || access.status === 'none') return null;
  return <Badge tone={tones[access.status]}>{t(`staff.access_status.${access.status}`)}</Badge>;
};

const BOOLEAN_PERMS: Array<keyof StaffPermissions> = ['canCreateAppointments', 'canViewClients', 'canViewClientContacts', 'canViewRevenue', 'canManageServices', 'canManageProducts'];

/**
 * "Accès & permissions" of the team member form: invite to log in (e-mail, or a link to share by WhatsApp/SMS),
 * resend, revoke; permission checkboxes saved with the form. The API enforces every one of them.
 */
const AccessSection: React.FC<{
  memberId?: string;
  email: string;
  phone?: string;
  access?: StaffAccess;
  permissions?: StaffPermissions;
  onPermissionsChange: (p: StaffPermissions) => void;
}> = ({ memberId, email, phone, access, permissions, onPermissionsChange }) => {
  const { t, i18n } = useTranslation('team');
  const setAccess = useTeamStore((s) => s.setAccess);
  const showToast = useToastStore((s) => s.showToast);
  const [link, setLink] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const p = { ...DEFAULT_STAFF_PERMISSIONS, ...permissions };
  const status = access?.status || 'none';
  const set = (patch: Partial<StaffPermissions>) => onPermissionsChange({ ...p, ...patch });
  const day = (iso?: string) => (iso ? format(parseISO(iso), 'd MMM yyyy, HH:mm', { locale: getDateLocale(i18n.language) }) : '');

  const invite = async () => {
    if (!memberId) return;
    setBusy(true);
    setError('');
    try {
      const { data } = await teamAccessAPI.invite(memberId, email);
      setAccess(memberId, data.access);
      setLink(data.link);
      showToast(t('staff.access.sent', { email: data.access.email }), 'success');
    } catch (err) {
      const code = ((err as AxiosError)?.response?.data as any)?.code;
      setError(code === 'EMAIL_TAKEN' ? 'staff.access.email_taken' : code === 'INVALID_EMAIL' ? 'staff.access.email_invalid' : 'staff.access.error');
    } finally {
      setBusy(false);
    }
  };

  const revoke = async () => {
    if (!memberId || !window.confirm(t('staff.access.revoke_confirm'))) return;
    setBusy(true);
    try {
      const { data } = await teamAccessAPI.revoke(memberId);
      setAccess(memberId, data.access);
      setLink('');
    } finally {
      setBusy(false);
    }
  };

  const copy = async () => {
    try { await navigator.clipboard.writeText(link); showToast(t('staff.access.copied'), 'success'); } catch { /* the link stays selectable */ }
  };
  const digits = (phone || '').replace(/\D/g, '');
  const message = encodeURIComponent(t('staff.access.share_message', { link }));

  const check = (key: keyof StaffPermissions, disabled = false) => (
    <label key={key} className={`flex min-h-[44px] items-start gap-3 py-2 text-sm ${disabled ? 'text-gray-400 dark:text-gray-500' : 'cursor-pointer text-gray-700 dark:text-gray-300'}`}>
      <input type="checkbox" checked={!!p[key] && !disabled} disabled={disabled} onChange={(e) => set({ [key]: e.target.checked })}
        className="mt-0.5 size-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500 dark:border-gray-600 dark:bg-gray-800" />
      <span>
        <span className="block font-medium">{t(`staff.permission_labels.${key}`)}</span>
        <span className="block text-xs text-gray-500 dark:text-gray-400">{t(`staff.permission_help.${key}`)}</span>
      </span>
    </label>
  );

  return (
    <div className="space-y-6">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-50">{t('staff.access.login')}</p>
          <AccessBadge access={access} />
        </div>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {status === 'active' ? t('staff.access.active_help', { email: access?.email, date: day(access?.lastLogin) })
            : status === 'invited' ? t('staff.access.invited_help', { email: access?.email, date: day(access?.expiresAt) })
            : status === 'expired' ? t('staff.access.expired_help')
            : status === 'revoked' ? t('staff.access.revoked_help')
            : t('staff.access.none_help')}
        </p>
        {!memberId ? (
          <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">{t('staff.access.save_first')}</p>
        ) : (
          <div className="mt-3 flex flex-wrap gap-2">
            {status !== 'active' && (
              <button type="button" className="btn-primary" disabled={busy || !email} onClick={invite}>
                <PaperAirplaneIcon className="size-4 rtl:-scale-x-100" />
                {t(status === 'none' ? 'staff.access.invite' : 'staff.access.resend')}
              </button>
            )}
            {(status === 'active' || status === 'invited') && (
              <button type="button" className="btn-secondary text-red-600 dark:text-red-400" disabled={busy} onClick={revoke}>{t('staff.access.revoke')}</button>
            )}
          </div>
        )}
        {error && <p role="alert" className="mt-2 text-sm text-red-600 dark:text-red-400">{t(error)}</p>}
        {link && (
          <div className="mt-3 rounded-xl border border-gray-200 p-3 dark:border-gray-700">
            <p className="text-sm text-gray-700 dark:text-gray-300">{t('staff.access.share_help')}</p>
            <div className="mt-2 flex gap-2">
              <input readOnly value={link} dir="ltr" className="field min-w-0 flex-1 text-xs" onFocus={(e) => e.target.select()} aria-label={t('staff.access.link')} />
              <button type="button" className="btn-secondary shrink-0" onClick={copy}><ClipboardDocumentIcon className="size-4" />{t('staff.access.copy')}</button>
            </div>
            {digits && (
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm">
                <span dir="ltr" className="tabular-nums text-gray-500 dark:text-gray-400">{phone}</span>
                <a className="font-medium text-orange-600 hover:text-orange-700 dark:text-orange-400" href={`https://wa.me/${digits}?text=${message}`} target="_blank" rel="noreferrer">{t('staff.access.whatsapp')}</a>
                <a className="font-medium text-orange-600 hover:text-orange-700 dark:text-orange-400" href={`sms:${phone}?body=${message}`}>{t('staff.access.sms')}</a>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="border-t border-gray-100 pt-5 dark:border-gray-800">
        <p className="text-sm font-medium text-gray-900 dark:text-gray-50">{t('staff.permissions_title')}</p>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{t('staff.permissions_help')}</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <p className="mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">{t('staff.permission_labels.planning')}</p>
            <Segmented value={p.planning} onChange={(planning) => set({ planning, ...(planning === 'own' && p.canEditAppointments === 'all' ? { canEditAppointments: 'own' as const } : {}) })} options={[
              { value: 'own', label: t('staff.perms.planning_own_short') },
              { value: 'all', label: t('staff.perms.planning_all_short') },
            ]} />
          </div>
          <div>
            <p className="mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">{t('staff.permission_labels.canEditAppointments')}</p>
            <Segmented value={p.canEditAppointments} onChange={(canEditAppointments) => set({ canEditAppointments })} options={[
              { value: 'none', label: t('staff.perms.edit_none_short') },
              { value: 'own', label: t('staff.perms.edit_own_short') },
              ...(p.planning === 'all' ? [{ value: 'all' as const, label: t('staff.perms.edit_all_short') }] : []),
            ]} />
          </div>
        </div>
        <div className="mt-3 grid divide-y divide-gray-100 sm:grid-cols-2 sm:gap-x-6 sm:divide-y-0 dark:divide-gray-800">
          {BOOLEAN_PERMS.map((k) => check(k, k === 'canViewClientContacts' && !p.canViewClients))}
        </div>
        <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">{t('staff.owner_only_note')}</p>
      </div>
    </div>
  );
};

export default AccessSection;
