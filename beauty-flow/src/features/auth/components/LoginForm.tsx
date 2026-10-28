import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import { AxiosError } from 'axios';
import { FormInput, FormButton, FormLink, FormAlert } from './FormInput';
import { useAuthStore } from '../store';
import { AuthCredentials } from '../types';

export const LoginForm: React.FC = () => {
  const { t } = useTranslation('auth');
  const navigate = useNavigate();
  const location = useLocation();
  const login = useAuthStore(state => state.login);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<AuthCredentials>({
    email: '',
    password: ''
  });

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = 'login.errors.required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'login.errors.invalidEmail';
    }

    if (!formData.password) {
      newErrors.password = 'login.errors.required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Effacer l'erreur du champ modifié
    if (errors[name] || errors.submit) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        delete newErrors.submit;
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await login(formData);
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from);
    } catch (error) {
      const response = (error as AxiosError)?.response;
      setErrors({
        submit: !response ? 'errors.network'
          : response.status === 403 ? 'login.errors.deactivated'
          : response.status >= 500 ? 'errors.generic'
          : 'login.errors.invalidCredentials'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <FormInput
          label="login.email"
          type="email"
          name="email"
          inputMode="email"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
          autoComplete="email"
          placeholder="nom@salon.dz"
        />
        <FormInput
          label="login.password"
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          error={errors.password}
          autoComplete="current-password"
          aside={<FormLink to="/auth/forgot-password" className="text-sm">{t('login.forgotPassword')}</FormLink>}
        />

        {errors.submit && <FormAlert>{t(errors.submit)}</FormAlert>}

        <FormButton type="submit" isLoading={loading} className="w-full">
          {t('login.submit')}
        </FormButton>
      </form>

      <p className="text-center text-sm text-gray-600 dark:text-gray-400">
        {t('login.noAccount')} <FormLink to="/auth/register">{t('login.register')}</FormLink>
      </p>

      {/* Identifiants de démo : développement local uniquement */}
      {import.meta.env.DEV && (
        <p className="rounded-xl border border-dashed border-gray-300 px-3 py-2 text-center text-xs text-gray-500 dark:border-gray-700 dark:text-gray-400">
          Dev · demo@saloneo.com / demo123
        </p>
      )}
    </div>
  );
};
