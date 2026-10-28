import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { AxiosError } from 'axios';
import { authAPI } from '../../../services/api';
import { AuthLayout } from '../components/AuthLayout';
import { FormLink, FormAlert } from '../components/FormInput';

/** Target of the verification e-mail: /verify-email?token=… */
export const VerifyEmailPage: React.FC = () => {
  const { t } = useTranslation('auth');
  const [params] = useSearchParams();
  const token = params.get('token') || '';
  const [status, setStatus] = useState<'loading' | 'done' | string>(token ? 'loading' : 'verifyEmail.invalid');
  const sent = useRef(false); // the token is single-use: never call twice (StrictMode)

  useEffect(() => {
    if (!token || sent.current) return;
    sent.current = true;
    authAPI.verifyEmail(token)
      .then(() => setStatus('done'))
      .catch((err) => setStatus((err as AxiosError)?.response?.status === 400 ? 'verifyEmail.invalid' : (err as AxiosError)?.response ? 'errors.generic' : 'errors.network'));
  }, [token]);

  return (
    <AuthLayout title="verifyEmail.title">
      <div className="space-y-6">
        {status === 'loading' ? (
          <p className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden="true" />
            {t('verifyEmail.loading')}
          </p>
        ) : status === 'done' ? (
          <FormAlert tone="success">{t('verifyEmail.success')}</FormAlert>
        ) : (
          <FormAlert>{t(status)}</FormAlert>
        )}
        {status !== 'loading' && <p className="text-sm"><FormLink to="/auth/login">{t('verifyEmail.goToLogin')}</FormLink></p>}
      </div>
    </AuthLayout>
  );
};
