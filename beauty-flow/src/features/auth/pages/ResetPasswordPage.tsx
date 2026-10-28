import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { AxiosError } from 'axios';
import { authAPI } from '../../../services/api';
import { AuthLayout } from '../components/AuthLayout';
import { FormInput, FormButton, FormLink, FormAlert } from '../components/FormInput';

/** Target of the password-reset e-mail: /reset-password?token=… */
export const ResetPasswordPage: React.FC = () => {
  const { t } = useTranslation('auth');
  const [params] = useSearchParams();
  const token = params.get('token') || '';
  const [form, setForm] = useState({ password: '', confirmPassword: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!form.password) next.password = 'resetPassword.errors.required';
    else if (form.password.length < 8) next.password = 'resetPassword.errors.passwordTooShort';
    if (form.confirmPassword !== form.password) next.confirmPassword = 'resetPassword.errors.passwordMismatch';
    if (Object.keys(next).length) return setErrors(next);

    setLoading(true);
    try {
      await authAPI.resetPassword(token, form.password);
      setDone(true);
    } catch (err) {
      const response = (err as AxiosError)?.response;
      setErrors({ submit: !response ? 'errors.network' : response.status === 400 ? 'resetPassword.errors.invalidToken' : 'errors.generic' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="resetPassword.title" subtitle={token && !done ? 'resetPassword.subtitle' : undefined}>
      {!token ? (
        <div className="space-y-6">
          <FormAlert>{t('resetPassword.errors.invalidToken')}</FormAlert>
          <p className="text-sm"><FormLink to="/auth/forgot-password">{t('resetPassword.requestNew')}</FormLink></p>
        </div>
      ) : done ? (
        <div className="space-y-6">
          <FormAlert tone="success">{t('resetPassword.success')}</FormAlert>
          <p className="text-sm"><FormLink to="/auth/login">{t('forgotPassword.backToLogin')}</FormLink></p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          <FormInput label="resetPassword.password" type="password" name="password" autoComplete="new-password" value={form.password} onChange={handleChange} error={errors.password} hint="register.passwordHint" />
          <FormInput label="resetPassword.confirmPassword" type="password" name="confirmPassword" autoComplete="new-password" value={form.confirmPassword} onChange={handleChange} error={errors.confirmPassword} />
          {errors.submit && (
            <FormAlert>
              {t(errors.submit)}{' '}
              {errors.submit === 'resetPassword.errors.invalidToken' && <FormLink to="/auth/forgot-password">{t('resetPassword.requestNew')}</FormLink>}
            </FormAlert>
          )}
          <FormButton type="submit" isLoading={loading} className="w-full">{t('resetPassword.submit')}</FormButton>
        </form>
      )}
    </AuthLayout>
  );
};
