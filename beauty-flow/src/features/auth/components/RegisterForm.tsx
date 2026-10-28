import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import { AxiosError } from 'axios';
import clsx from 'clsx';
import { FormInput, FormButton, FormLink, FormAlert } from './FormInput';
import { useAuthStore } from '../store';
import { RegisterData } from '../types';

type Step = 'credentials' | 'profile' | 'establishment';
const STEPS: Step[] = ['credentials', 'profile', 'establishment'];

export const RegisterForm: React.FC = () => {
  const [t] = useTranslation(['auth', 'common']);
  const navigate = useNavigate();
  const location = useLocation();
  const register = useAuthStore(state => state.register);
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<Step>('credentials');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<RegisterData>({
    // E-mail saisi sur la landing page
    email: (location.state as { email?: string } | null)?.email || '',
    password: '',
    firstName: '',
    lastName: '',
    establishmentName: '',
    address: ''
  });

  const validateStep = (step: Step): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 'credentials':
        if (!formData.email) {
          newErrors.email = 'register.errors.required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
          newErrors.email = 'register.errors.invalidEmail';
        }

        if (!formData.password) {
          newErrors.password = 'register.errors.required';
        } else if (formData.password.length < 8) {
          newErrors.password = 'register.errors.passwordTooShort';
        }
        break;

      case 'profile':
        if (!formData.firstName) newErrors.firstName = 'register.errors.required';
        if (!formData.lastName) newErrors.lastName = 'register.errors.required';
        break;

      case 'establishment':
        if (!formData.establishmentName) {
          newErrors.establishmentName = 'register.errors.required';
        }
        if (!formData.address) newErrors.address = 'register.errors.required';
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const stepIndex = STEPS.indexOf(currentStep);

  const handleNext = () => {
    if (validateStep(currentStep)) setCurrentStep(STEPS[stepIndex + 1]);
  };

  const handleBack = () => {
    setErrors({});
    setCurrentStep(STEPS[stepIndex - 1]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Entrée sur les étapes 1 et 2 : passer à l'étape suivante, ne pas inscrire
    if (currentStep !== 'establishment') {
      handleNext();
      return;
    }

    if (!validateStep(currentStep)) {
      return;
    }

    setLoading(true);
    try {
      await register(formData);
      navigate('/dashboard');
    } catch (error) {
      const response = (error as AxiosError<{ error?: string }>)?.response;
      if (response?.data?.error === 'User already exists') {
        // L'e-mail est à l'étape 1 : y revenir pour le corriger
        setCurrentStep('credentials');
        setErrors({ email: 'register.errors.emailExists' });
      } else {
        setErrors({ submit: response ? 'errors.generic' : 'errors.network' });
      }
    } finally {
      setLoading(false);
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'credentials':
        return (
          <>
            <FormInput
              label="register.email"
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
              label="register.password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              hint="register.passwordHint"
              autoComplete="new-password"
            />
          </>
        );

      case 'profile':
        return (
          <div className="grid gap-5 sm:grid-cols-2">
            <FormInput
              label="register.firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              error={errors.firstName}
              autoComplete="given-name"
              autoFocus
            />
            <FormInput
              label="register.lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              error={errors.lastName}
              autoComplete="family-name"
            />
          </div>
        );

      case 'establishment':
        return (
          <>
            <FormInput
              label="register.establishmentName"
              name="establishmentName"
              value={formData.establishmentName}
              onChange={handleChange}
              error={errors.establishmentName}
              autoComplete="organization"
              autoFocus
            />
            <FormInput
              label="register.address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              error={errors.address}
              autoComplete="street-address"
            />
          </>
        );
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {/* Progression */}
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {t('register.stepOf', { ns: 'auth', current: stepIndex + 1, total: STEPS.length })}
          {' · '}
          <span className="font-medium text-gray-900 dark:text-gray-50">{t(`register.steps.${currentStep}`, { ns: 'auth' })}</span>
        </p>
        <div className="mt-2 grid grid-cols-3 gap-1.5" aria-hidden="true">
          {STEPS.map((step, i) => (
            <span key={step} className={clsx('h-1 rounded-full transition-colors duration-200 ease-out', i <= stepIndex ? 'bg-orange-500' : 'bg-gray-200 dark:bg-gray-800')} />
          ))}
        </div>
      </div>

      {renderCurrentStep()}

      {errors.submit && <FormAlert>{t(errors.submit, { ns: 'auth' })}</FormAlert>}

      <div className="flex gap-3 pt-1">
        {currentStep !== 'credentials' && (
          <FormButton type="button" variant="secondary" onClick={handleBack} className="px-5">
            {t('actions.back', { ns: 'common' })}
          </FormButton>
        )}
        <FormButton type="submit" isLoading={loading} className="flex-1">
          {currentStep === 'establishment' ? t('register.submit', { ns: 'auth' }) : t('actions.next', { ns: 'common' })}
        </FormButton>
      </div>

      <p className="text-center text-sm text-gray-600 dark:text-gray-400">
        {t('register.hasAccount', { ns: 'auth' })} <FormLink to="/auth/login">{t('register.login', { ns: 'auth' })}</FormLink>
      </p>
    </form>
  );
};
