import React from 'react';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { useTemplateStyles } from '../../../../hooks/useTemplateStyles';

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
  const { colors } = useTemplateStyles();
  const [defaultCountry, setDefaultCountry] = React.useState<string>('DZ');

  // Détecter le pays basé sur l'IP de l'utilisateur
  React.useEffect(() => {
    const detectCountry = async () => {
      try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        if (data.country_code) {
          setDefaultCountry(data.country_code);
        }
      } catch (error) {
        console.log('Impossible de détecter le pays, utilisation de DZ par défaut');
      }
    };
    detectCountry();
  }, []);

  return (
    <div className="space-y-6">
      <h3 
        className="text-xl font-bold bg-clip-text text-transparent"
        style={{
          backgroundImage: `linear-gradient(to right, ${colors.primary}, ${colors.primaryDark})`
        }}
      >
        Informations personnelles
      </h3>

      <div className="grid grid-cols-2 gap-4">
        {/* Prénom */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">
            Prénom <span style={{ color: colors.primary }}>*</span>
          </label>
          <input
            type="text"
            value={values.firstName}
            onChange={(e) => onChange('firstName', e.target.value)}
            className={`glass-input w-full transition-all duration-300 ${
              errors.firstName ? 'ring-1' : ''
            }`}
            style={errors.firstName ? {
              borderColor: colors.primary,
              '--tw-ring-color': colors.primary
            } as any : {}}
            required
          />
          {errors.firstName && (
            <div className="flex items-center space-x-1 mt-1 animate-fade-in" style={{ color: colors.primary }}>
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
            Nom <span style={{ color: colors.primary }}>*</span>
          </label>
          <input
            type="text"
            value={values.lastName}
            onChange={(e) => onChange('lastName', e.target.value)}
            className={`glass-input w-full transition-all duration-300 ${
              errors.lastName ? 'ring-1' : ''
            }`}
            style={errors.lastName ? {
              borderColor: colors.primary,
              '--tw-ring-color': colors.primary
            } as any : {}}
            required
          />
          {errors.lastName && (
            <div className="flex items-center space-x-1 mt-1 animate-fade-in" style={{ color: colors.primary }}>
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
            Email <span style={{ color: colors.primary }}>*</span>
          </label>
          <input
            type="email"
            value={values.email}
            onChange={(e) => onChange('email', e.target.value)}
            className={`glass-input w-full transition-all duration-300 ${
              errors.email ? 'ring-1' : ''
            }`}
            style={errors.email ? {
              borderColor: colors.primary,
              '--tw-ring-color': colors.primary
            } as any : {}}
            required
          />
          {errors.email && (
            <div className="flex items-center space-x-1 mt-1 animate-fade-in" style={{ color: colors.primary }}>
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
            Téléphone <span style={{ color: colors.primary }}>*</span>
          </label>
          <PhoneInput
            international
            defaultCountry={defaultCountry as any}
            value={values.phone}
            onChange={(value) => onChange('phone', value || '')}
            className={`glass-input w-full rounded-xl border-0 bg-white/70 dark:bg-gray-700 backdrop-blur-sm shadow-lg transition-all duration-200 ${
              errors.phone ? 'ring-2' : 'focus-within:ring-2'
            }`}
            style={{
              '--tw-ring-color': colors.primary
            } as any}
            numberInputProps={{
              className: 'w-full bg-transparent border-0 focus:outline-none focus:ring-0 text-gray-900 dark:text-gray-100 px-3 py-2',
              required: false // Retirer required pour éviter les problèmes de validation
            }}
          />
          {errors.phone && (
            <div className="flex items-center space-x-1 mt-1 animate-fade-in" style={{ color: colors.primary }}>
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
            className="glass-input w-full transition-all duration-300"
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
            className="glass-input w-full transition-all duration-300"
          />
        </div>
      </div>
    </div>
  );
};

export default PersonalInfoSection;
