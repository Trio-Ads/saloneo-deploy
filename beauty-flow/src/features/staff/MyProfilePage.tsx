import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AxiosError } from 'axios';
import { CheckIcon, MinusIcon } from '@heroicons/react/24/outline';
import { staffAPI } from '../../services/api';
import { useAuthStore } from '../auth/store';
import { ImageOptimizer } from '../../services/imageOptimizer';
import { PageHeader, Panel } from '../../components/ui';
import { useToastStore } from '../../components/Toast';
import { StaffAvatar } from '../team/StaffAvatar';
import AppPanel from '../pwa/AppPanel';
import DeleteAccountPanel from '../auth/components/DeleteAccountPanel';
import { DEFAULT_STAFF_PERMISSIONS } from './access';

const labelClass = 'mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300';

/** "Mon profil" for staff: photo, name, phone, password — and what the owner lets them do. */
const MyProfilePage: React.FC = () => {
  const { t } = useTranslation('team');
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const showToast = useToastStore((s) => s.showToast);
  const [form, setForm] = useState({ firstName: user?.firstName || '', lastName: user?.lastName || '', phone: '' });
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [photo, setPhoto] = useState<'idle' | 'uploading' | 'error'>('idle');
  const [pw, setPw] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [pwError, setPwError] = useState('');
  const [saving, setSaving] = useState(false);
  const photoInput = React.useRef<HTMLInputElement>(null);

  // Fresh copy (phone, photo, permissions the owner may have changed)
  useEffect(() => {
    staffAPI.me().then(({ data }) => {
      setUser(data.user);
      setForm({ firstName: data.user.firstName || '', lastName: data.user.lastName || '', phone: data.user.phone || '' });
      setAvatar(data.user.avatar || '');
    }).catch(() => undefined);
  }, [setUser]);

  const handlePhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !user?.teamMemberId) return;
    if (!/^image\/(jpeg|png|webp)$/.test(file.type)) { setPhoto('error'); return; }
    setPhoto('uploading');
    try {
      const { blob } = await ImageOptimizer.resizeToExactDimensions(file, { width: 600, height: 600 }, 0.88, 'image/jpeg');
      const { data } = await staffAPI.uploadAvatar(user.teamMemberId, new File([blob], 'avatar.jpg', { type: 'image/jpeg' }));
      setAvatar(data.avatar);
      setPhoto('idle');
    } catch {
      setPhoto('error');
    }
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await staffAPI.updateMe(form);
      setUser(data.user);
      showToast(t('staff.profile.saved'), 'success');
    } catch {
      showToast(t('staff.profile.save_error'), 'error');
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pw.newPassword.length < 8) return setPwError('staff.invitation_page.password_short');
    if (pw.newPassword !== pw.confirm) return setPwError('staff.invitation_page.password_mismatch');
    setPwError('');
    try {
      await staffAPI.updatePassword({ currentPassword: pw.currentPassword, newPassword: pw.newPassword });
      setPw({ currentPassword: '', newPassword: '', confirm: '' });
      showToast(t('staff.profile.password_saved'), 'success');
    } catch (err) {
      setPwError(((err as AxiosError)?.response?.data as any)?.code === 'WRONG_PASSWORD' ? 'staff.profile.wrong_password' : 'staff.profile.save_error');
    }
  };

  const p = { ...DEFAULT_STAFF_PERMISSIONS, ...user?.permissions };
  const rights: Array<[string, boolean]> = [
    [p.planning === 'all' ? 'staff.perms.planning_all' : 'staff.perms.planning_own', true],
    ['staff.perms.create', p.canCreateAppointments],
    [p.canEditAppointments === 'all' ? 'staff.perms.edit_all' : 'staff.perms.edit_own', p.canEditAppointments !== 'none'],
    ['staff.perms.clients', p.canViewClients],
    ['staff.perms.contacts', p.canViewClients && p.canViewClientContacts],
    ['staff.perms.revenue', p.canViewRevenue],
    ['staff.perms.services', p.canManageServices],
    ['staff.perms.products', p.canManageProducts],
  ];

  return (
    <div className="py-6 sm:py-8">
      <PageHeader title={t('staff.profile.title')} subtitle={t('staff.profile.subtitle', { salon: user?.establishmentName })} />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Panel title={t('staff.profile.identity')}>
            <form onSubmit={save} className="space-y-5">
              <div className="flex items-center gap-4">
                <StaffAvatar member={{ ...form, avatar }} className="size-20 text-xl" />
                <div>
                  <button type="button" className="btn-secondary" disabled={photo === 'uploading'} onClick={() => photoInput.current?.click()}>
                    {photo === 'uploading' && <span className="size-4 animate-spin rounded-full border-2 border-gray-300 border-t-orange-500" />}
                    {t(avatar ? 'team_member_form.photo.change' : 'team_member_form.photo.add')}
                  </button>
                  <p className={photo === 'error' ? 'mt-1.5 text-xs text-red-600 dark:text-red-400' : 'mt-1.5 text-xs text-gray-500 dark:text-gray-400'}>
                    {t(photo === 'error' ? 'team_member_form.photo.error' : 'team_member_form.photo.help')}
                  </p>
                  <input ref={photoInput} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handlePhoto} aria-label={t('team_member_form.photo.add')} />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="pFirst" className={labelClass}>{t('staff.invitation_page.first_name')}</label>
                  <input id="pFirst" className="field" required value={form.firstName} onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))} />
                </div>
                <div>
                  <label htmlFor="pLast" className={labelClass}>{t('staff.invitation_page.last_name')}</label>
                  <input id="pLast" className="field" value={form.lastName} onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))} />
                </div>
                <div>
                  <label htmlFor="pPhone" className={labelClass}>{t('staff.profile.phone')}</label>
                  <input id="pPhone" type="tel" dir="ltr" className="field text-start" value={form.phone} placeholder="0555 12 34 56" onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
                </div>
                <div>
                  <p className={labelClass}>{t('staff.invitation_page.login_email')}</p>
                  <p dir="ltr" className="py-2.5 text-sm text-gray-700 text-start dark:text-gray-300">{user?.email}</p>
                </div>
              </div>
              <div className="flex justify-end">
                <button type="submit" className="btn-primary" disabled={saving}>{t('staff.profile.save')}</button>
              </div>
            </form>
          </Panel>

          <Panel title={t('staff.profile.password')}>
            <form onSubmit={changePassword} className="grid gap-4 sm:grid-cols-3">
              {(['currentPassword', 'newPassword', 'confirm'] as const).map((k) => (
                <div key={k}>
                  <label htmlFor={k} className={labelClass}>{t(`staff.profile.${k}`)}</label>
                  <input id={k} type="password" className="field" required autoComplete={k === 'currentPassword' ? 'current-password' : 'new-password'}
                    value={pw[k]} onChange={(e) => setPw((x) => ({ ...x, [k]: e.target.value }))} />
                </div>
              ))}
              {pwError && <p role="alert" className="text-sm text-red-600 sm:col-span-3 dark:text-red-400">{t(pwError)}</p>}
              <div className="flex justify-end sm:col-span-3">
                <button type="submit" className="btn-secondary">{t('staff.profile.change_password')}</button>
              </div>
            </form>
          </Panel>
        </div>

        <div className="space-y-6 lg:self-start">
          <Panel title={t('staff.profile.rights')} description={t('staff.profile.rights_help')}>
            <ul className="space-y-2.5 text-sm">
              {rights.map(([key, on]) => (
                <li key={key} className={on ? 'flex items-start gap-2 text-gray-700 dark:text-gray-300' : 'flex items-start gap-2 text-gray-400 dark:text-gray-500'}>
                  {on ? <CheckIcon className="mt-0.5 size-4 shrink-0 text-emerald-600 dark:text-emerald-400" /> : <MinusIcon className="mt-0.5 size-4 shrink-0" />}
                  {t(key)}
                </li>
              ))}
            </ul>
          </Panel>
          <AppPanel audience="staff" />
          <DeleteAccountPanel audience="staff" />
        </div>
      </div>
    </div>
  );
};

export default MyProfilePage;
