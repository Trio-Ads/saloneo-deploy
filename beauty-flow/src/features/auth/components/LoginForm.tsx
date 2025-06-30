import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  EnvelopeIcon, 
  LockClosedIcon, 
  EyeIcon, 
  EyeSlashIcon,
  ArrowRightIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { FormInput, FormButton, FormLink } from './FormInput';
import { useAuthStore } from '../store';
import { AuthCredentials } from '../types';

export const LoginForm: React.FC = () => {
  const { t } = useTranslation('auth');
  const navigate = useNavigate();
  const location = useLocation();
  const login = useAuthStore(state => state.login);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);

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
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
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
      const from = location.state?.from?.pathname || '/';
      navigate(from);
    } catch (error) {
      setErrors({
        submit: 'login.errors.invalidCredentials'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Email Field */}
        <div className="relative">
          <label className="block text-white text-sm font-medium font-display mb-3 transition-all duration-300">
            <EnvelopeIcon className="h-4 w-4 inline mr-2 text-white/70" />
            {t('login.email')}
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <EnvelopeIcon className="h-5 w-5 text-white/50" />
            </div>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
              placeholder="exemple@email.com"
              className={`
                w-full pl-12 pr-4 py-3 rounded-xl transition-all duration-300 font-body
                glass-input text-white placeholder-white/50
                focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20
                hover:bg-white/10
                ${errors.email ? 'border-red-400 focus:border-red-400 focus:ring-red-400/20' : ''}
              `}
            />
          </div>
          {errors.email && (
            <p className="mt-2 text-red-400 text-sm font-medium animate-slide-down flex items-center">
              <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
              {t(errors.email)}
            </p>
          )}
        </div>

        {/* Password Field */}
        <div className="relative">
          <label className="block text-white text-sm font-medium font-display mb-3 transition-all duration-300">
            <LockClosedIcon className="h-4 w-4 inline mr-2 text-white/70" />
            {t('login.password')}
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <LockClosedIcon className="h-5 w-5 text-white/50" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              autoComplete="current-password"
              placeholder="••••••••"
              className={`
                w-full pl-12 pr-12 py-3 rounded-xl transition-all duration-300 font-body
                glass-input text-white placeholder-white/50
                focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20
                hover:bg-white/10
                ${errors.password ? 'border-red-400 focus:border-red-400 focus:ring-red-400/20' : ''}
              `}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-white/50 hover:text-white/80 transition-colors duration-200"
            >
              {showPassword ? (
                <EyeSlashIcon className="h-5 w-5" />
              ) : (
                <EyeIcon className="h-5 w-5" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="mt-2 text-red-400 text-sm font-medium animate-slide-down flex items-center">
              <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
              {t(errors.password)}
            </p>
          )}
        </div>

        {/* Submit Error */}
        {errors.submit && (
          <div className="glass-card p-4 bg-red-500/20 border border-red-400/30 rounded-xl animate-slide-down">
            <div className="flex items-center text-red-300">
              <ExclamationTriangleIcon className="h-5 w-5 mr-2 flex-shrink-0" />
              <span className="text-sm font-medium">{t(errors.submit)}</span>
            </div>
          </div>
        )}

        {/* Forgot Password Link */}
        <div className="flex justify-end">
          <FormLink href="/auth/forgot-password" variant="accent">
            {t('login.forgotPassword')}
          </FormLink>
        </div>

        {/* Submit Button */}
        <FormButton type="submit" isLoading={loading} size="lg">
          <div className="flex items-center justify-center">
            {!loading && <ArrowRightIcon className="h-5 w-5 mr-2" />}
            {t('login.submit')}
          </div>
        </FormButton>
      </form>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/20"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-transparent text-white/60 font-medium">
            {t('login.or')}
          </span>
        </div>
      </div>

      {/* Register Link */}
      <div className="text-center">
        <p className="text-white/70 text-sm mb-3">
          {t('login.noAccount')}
        </p>
        <FormLink href="/auth/register" variant="accent">
          <div className="flex items-center justify-center">
            <span className="text-base font-semibold">{t('login.register')}</span>
            <ArrowRightIcon className="h-4 w-4 ml-2" />
          </div>
        </FormLink>
      </div>

      {/* Demo Credentials (Development only) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="glass-card p-4 bg-blue-500/10 border border-blue-400/20 rounded-xl">
          <p className="text-blue-300 text-xs font-medium mb-2 text-center">
            🚀 Démo - Identifiants de test
          </p>
          <div className="grid grid-cols-1 gap-2 text-xs">
            <div className="flex justify-between text-blue-200">
              <span>Email:</span>
              <span className="font-mono">demo@saloneo.com</span>
            </div>
            <div className="flex justify-between text-blue-200">
              <span>Mot de passe:</span>
              <span className="font-mono">demo123</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
