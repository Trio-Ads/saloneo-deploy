import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { FormInput, FormButton, FormLink } from './FormInput';
import { useAuthStore } from '../store';
import { RegisterData } from '../types';

type Step = 'credentials' | 'profile' | 'establishment';

export const RegisterForm: React.FC = () => {
  const [t] = useTranslation(['auth', 'common']);
  const navigate = useNavigate();
  const register = useAuthStore(state => state.register);
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<Step>('credentials');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<RegisterData>({
    email: '',
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

  const handleNext = () => {
    if (validateStep(currentStep)) {
      switch (currentStep) {
        case 'credentials':
          setCurrentStep('profile');
          break;
        case 'profile':
          setCurrentStep('establishment');
          break;
      }
    }
  };

  const handleBack = () => {
    switch (currentStep) {
      case 'profile':
        setCurrentStep('credentials');
        break;
      case 'establishment':
        setCurrentStep('profile');
        break;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateStep(currentStep)) {
      return;
    }

    setLoading(true);
    try {
      await register(formData);
      navigate('/dashboard');
    } catch (error) {
      setErrors({
        submit: 'register.errors.emailExists'
      });
    } finally {
      setLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="flex justify-center items-center mb-10">
      {(['credentials', 'profile', 'establishment'] as Step[]).map((step, index) => {
        const isActive = currentStep === step;
        const isCompleted = ['credentials', 'profile', 'establishment'].indexOf(currentStep) > index;
        
        return (
          <React.Fragment key={step}>
            <div className="flex flex-col items-center">
              <div
                className={`
                  w-12 h-12 rounded-2xl flex items-center justify-center 
                  transition-all duration-500 font-display font-bold text-sm
                  ${isActive 
                    ? 'bg-gradient-to-br from-indigo-500 to-blue-600 text-white shadow-lg scale-110' 
                    : isCompleted
                    ? 'bg-gradient-to-br from-blue-500 to-cyan-600 text-white shadow-md'
                    : 'bg-white/10 text-white/60 backdrop-blur-sm border border-white/20'
                  }
                `}
              >
                {isCompleted ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  index + 1
                )}
              </div>
              <div className={`
                text-xs font-medium font-body mt-3 text-center max-w-20
                transition-all duration-300
                ${isActive ? 'text-white' : 'text-white/70'}
              `}>
                {t(`register.steps.${step}`, { ns: 'auth' })}
              </div>
            </div>
            {index < 2 && (
              <div className={`
                w-16 h-1 mx-4 rounded-full transition-all duration-500
                ${isCompleted 
                  ? 'bg-gradient-to-r from-blue-500 to-cyan-600' 
                  : 'bg-white/20'
                }
              `} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'credentials':
        return (
          <>
            <FormInput
              label="register.email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              autoComplete="email"
            />
            <FormInput
              label="register.password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              autoComplete="new-password"
            />
          </>
        );

      case 'profile':
        return (
          <>
            <FormInput
              label="register.firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              error={errors.firstName}
              autoComplete="given-name"
            />
            <FormInput
              label="register.lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              error={errors.lastName}
              autoComplete="family-name"
            />
          </>
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
    <form onSubmit={handleSubmit} className="space-y-6">
      {renderStepIndicator()}
      {renderCurrentStep()}

      {errors.submit && (
        <div className="text-red-400 text-sm text-center">
          {t(errors.submit, { ns: 'auth' })}
        </div>
      )}

      <div className="flex gap-4">
        {currentStep !== 'credentials' && (
          <FormButton type="button" onClick={handleBack}>
            {t('back', { ns: 'common' })}
          </FormButton>
        )}
        {currentStep === 'establishment' ? (
          <FormButton type="submit" isLoading={loading}>
            {t('register.submit', { ns: 'auth' })}
          </FormButton>
        ) : (
          <FormButton type="button" onClick={handleNext}>
            {t('next', { ns: 'common' })}
          </FormButton>
        )}
      </div>

      <div className="text-center mt-4">
        <FormLink href="/auth/login">
          {t('register.hasAccount', { ns: 'auth' })} {t('register.login', { ns: 'auth' })}
        </FormLink>
      </div>
    </form>
  );
};
