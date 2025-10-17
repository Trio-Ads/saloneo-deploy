import React from 'react';
import { useInterfaceStore } from '../../../interface/store';

interface PersonalInfoSectionProps {
  values: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    birthDate?: string;
    address?: string;
  };
  onChange: (field: string, value: string) => void;
  errors: Record<string, string>;
}

const PersonalInfoSection: React.FC<PersonalInfoSectionProps> = ({
  values,
  onChange,
  errors,
}) => {
  const settings = useInterfaceStore((state) => state.settings);

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold bg-gradient-to-r from-orange-600 to-orange-700 dark:from-orange-500 dark:to-orange-600 bg-clip-text text-transparent">
        Informations personnelles
      </h3>

      <div className="grid grid-cols-2 gap-4">
        {/* Prénom */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">
            Prénom <span className="text-orange-600 dark:text-orange-400">*</span>
          </label>
          <input
            type="text"
            value={values.firstName}
            onChange={(e) => onChange('firstName', e.target.value)}
            className={`glass-input w-full transition-all duration-300 ${
              errors.firstName ? 'border-orange-600 ring-1 ring-orange-600' : 'hover:bg-orange-50 dark:hover:bg-white/10'
            }`}
            required
          />
          {errors.firstName && (
            <div className="flex items-center space-x-1 mt-1 text-orange-600 dark:text-orange-400 animate-fade-in">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm">{errors.firstName}</p>
            </div>
          )}
        </div>

        {/* Nom */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">
            Nom <span className="text-orange-600 dark:text-orange-400">*</span>
          </label>
          <input
            type="text"
            value={values.lastName}
            onChange={(e) => onChange('lastName', e.target.value)}
            className={`glass-input w-full transition-all duration-300 ${
              errors.lastName ? 'border-orange-600 ring-1 ring-orange-600' : 'hover:bg-orange-50 dark:hover:bg-white/10'
            }`}
            required
          />
          {errors.lastName && (
            <div className="flex items-center space-x-1 mt-1 text-orange-600 dark:text-orange-400 animate-fade-in">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm">{errors.lastName}</p>
            </div>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">
            Email <span className="text-orange-600 dark:text-orange-400">*</span>
          </label>
          <input
            type="email"
            value={values.email}
            onChange={(e) => onChange('email', e.target.value)}
            className={`glass-input w-full transition-all duration-300 ${
              errors.email ? 'border-orange-600 ring-1 ring-orange-600' : 'hover:bg-orange-50 dark:hover:bg-white/10'
            }`}
            required
          />
          {errors.email && (
            <div className="flex items-center space-x-1 mt-1 text-orange-600 dark:text-orange-400 animate-fade-in">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm">{errors.email}</p>
            </div>
          )}
        </div>

        {/* Téléphone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">
            Téléphone <span className="text-orange-600 dark:text-orange-400">*</span>
          </label>
          <input
            type="tel"
            value={values.phone}
            onChange={(e) => onChange('phone', e.target.value)}
            className={`glass-input w-full transition-all duration-300 ${
              errors.phone ? 'border-orange-600 ring-1 ring-orange-600' : 'hover:bg-orange-50 dark:hover:bg-white/10'
            }`}
            required
          />
          {errors.phone && (
            <div className="flex items-center space-x-1 mt-1 text-orange-600 dark:text-orange-400 animate-fade-in">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm">{errors.phone}</p>
            </div>
          )}
        </div>

        {/* Date de naissance */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">
            Date de naissance
          </label>
          <input
            type="date"
            value={values.birthDate || ''}
            onChange={(e) => onChange('birthDate', e.target.value)}
            className="glass-input w-full transition-all duration-300 hover:bg-orange-50 dark:hover:bg-white/10"
          />
        </div>

        {/* Adresse */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">
            Adresse
          </label>
          <input
            type="text"
            value={values.address || ''}
            onChange={(e) => onChange('address', e.target.value)}
            className="glass-input w-full transition-all duration-300 hover:bg-orange-50 dark:hover:bg-white/10"
          />
        </div>
      </div>
    </div>
  );
};

export default PersonalInfoSection;
