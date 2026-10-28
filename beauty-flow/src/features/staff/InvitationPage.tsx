import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { AxiosError } from 'axios';
import { authAPI } from '../../services/api';
import { useAuthStore } from '../auth/store';
import { AuthLayout } from '../auth/components/AuthLayout';
import { FormInput, FormButton, FormLink, FormAlert } from '../auth/components/FormInput';
import { STAFF_HOME } from './RouteGuards';

interface Invitation { email: string; firstName?: string; lastName?: string; salonName: string }

/** Target of the staff invitation e-mail: /invitation/:token → set name + password → logged in on "Mon planning". */
const InvitationPage: React.FC = () => {
  const { t } = useTranslation('team');
  const { token = '' } = useParams();
  const navigate = useNavigate();
  const acceptInvitation = useAuthStore((s) => s.acceptInvitation);
  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'invalid'>('loading');
  const [form, setForm] = useState({ firstName: '', lastName: '', password: '', confirm: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    authAPI.getInvitation(token)
      .then(({ data }) => {
        setInvitation(data);
        setForm((f) => ({ ...f, firstName: data.firstName || '', lastName: data.lastName || '' }));
        setState('ready');
      })
      .catch(() => setState('invalid'));
  }, [token]);

  const change = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setErrors({});
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!form.firstName.trim()) next.firstName = 'team:staff.invitation_page.required';
    if (form.password.length < 8) next.password = 'team:staff.invitation_page.password_short';
    if (form.confirm !== form.password) next.confirm = 'team:staff.invitation_page.password_mismatch';
    if (Object.keys(next).length) return setErrors(next);
    setSaving(true);
    try {
      await acceptInvitation(token, { firstName: form.firstName.trim(), lastName: form.lastName.trim(), password: form.password });
      navigate(STAFF_HOME, { replace: true });
    } catch (err) {
      const status = (err as AxiosError)?.response?.status;
      setErrors({ submit: status === 404 ? 'team:staff.invitation_page.invalid' : 'auth:errors.generic' });
      if (status === 404) setState('invalid');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AuthLayout title="team:staff.invitation_page.title">
      {state === 'loading' ? (
        <div className="flex justify-center py-10" role="status" aria-label={t('staff.loading')}>
          <div className="size-8 animate-spin rounded-full border-2 border-gray-200 border-t-orange-500" />
        </div>
      ) : state === 'invalid' ? (
        <div className="space-y-6">
          <FormAlert>{t('staff.invitation_page.invalid')}</FormAlert>
          <p className="text-sm text-gray-500 dark:text-gray-400">{t('staff.invitation_page.invalid_help')}</p>
          <p className="text-sm"><FormLink to="/auth/login">{t('staff.invitation_page.to_login')}</FormLink></p>
        </div>
      ) : (
        <form onSubmit={submit} noValidate className="space-y-5">
          <p className="-mt-4 text-[0.9375rem] text-gray-500 dark:text-gray-400">
            {t('staff.invitation_page.subtitle', { salon: invitation!.salonName })}
          </p>
          <div className="rounded-xl bg-gray-50 px-4 py-3 text-sm dark:bg-gray-900">
            <p className="text-gray-500 dark:text-gray-400">{t('staff.invitation_page.login_email')}</p>
            <p dir="ltr" className="font-medium text-gray-900 text-start dark:text-gray-50">{invitation!.email}</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormInput label="team:staff.invitation_page.first_name" name="firstName" autoComplete="given-name" value={form.firstName} onChange={change} error={errors.firstName} />
            <FormInput label="team:staff.invitation_page.last_name" name="lastName" autoComplete="family-name" value={form.lastName} onChange={change} />
          </div>
          <FormInput label="team:staff.invitation_page.password" type="password" name="password" autoComplete="new-password" value={form.password} onChange={change} error={errors.password} hint="team:staff.invitation_page.password_hint" />
          <FormInput label="team:staff.invitation_page.confirm" type="password" name="confirm" autoComplete="new-password" value={form.confirm} onChange={change} error={errors.confirm} />
          {errors.submit && <FormAlert>{t(errors.submit)}</FormAlert>}
          <FormButton type="submit" isLoading={saving}>{t('staff.invitation_page.submit')}</FormButton>
        </form>
      )}
    </AuthLayout>
  );
};

export default InvitationPage;
