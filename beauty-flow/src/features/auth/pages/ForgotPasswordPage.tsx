import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AxiosError } from 'axios';
import { authAPI } from '../../../services/api';
import { AuthLayout } from '../components/AuthLayout';
import { FormInput, FormButton, FormLink, FormAlert } from '../components/FormInput';

export const ForgotPasswordPage: React.FC = () => {
  const { t } = useTranslation('auth');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return setError('forgotPassword.errors.required');
    if (!/\S+@\S+\.\S+/.test(email)) return setError('forgotPassword.errors.invalidEmail');
    setLoading(true);
    setSubmitError('');
    try {
      await authAPI.forgotPassword(email);
      setSent(true);
    } catch (err) {
      setSubmitError((err as AxiosError)?.response ? 'errors.generic' : 'errors.network');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="forgotPassword.title" subtitle="forgotPassword.subtitle">
      {sent ? (
        <div className="space-y-6">
          <FormAlert tone="success">{t('forgotPassword.sent', { email })}</FormAlert>
          <p className="text-sm"><FormLink to="/auth/login">{t('forgotPassword.backToLogin')}</FormLink></p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          <FormInput
            label="forgotPassword.email"
            type="email"
            name="email"
            inputMode="email"
            autoComplete="email"
            placeholder="nom@salon.dz"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(''); }}
            error={error}
          />
          {submitError && <FormAlert>{t(submitError)}</FormAlert>}
          <FormButton type="submit" isLoading={loading} className="w-full">{t('forgotPassword.submit')}</FormButton>
          <p className="text-center text-sm"><FormLink to="/auth/login">{t('forgotPassword.backToLogin')}</FormLink></p>
        </form>
      )}
    </AuthLayout>
  );
};
