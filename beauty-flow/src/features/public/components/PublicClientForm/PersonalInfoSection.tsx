import React from 'react';
import { useTranslation } from 'react-i18next';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

interface PersonalInfoSectionProps {
  values: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  onChange: (field: string, value: string) => void;
  errors: Record<string, string>;
}

const Field: React.FC<{ id: string; label: string; error?: string; children: React.ReactNode }> = ({ id, label, error, children }) => (
  <div>
    <label htmlFor={id} className="bk-label">{label}</label>
    {children}
    {error && <p id={`${id}-error`} className="bk-error" role="alert">{error}</p>}
  </div>
);

const PersonalInfoSection: React.FC<PersonalInfoSectionProps> = ({ values, onChange, errors }) => {
  const { t } = useTranslation('public');
  const a11y = (field: string) => ({
    'aria-invalid': !!errors[field],
    'aria-describedby': errors[field] ? `bk-${field}-error` : undefined,
  });

  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-4">
      <Field id="bk-firstName" label={t('booking.form.first_name')} error={errors.firstName}>
        <input id="bk-firstName" type="text" autoComplete="given-name" className="bk-field"
          value={values.firstName} onChange={(e) => onChange('firstName', e.target.value)} {...a11y('firstName')} />
      </Field>
      <Field id="bk-lastName" label={t('booking.form.last_name')} error={errors.lastName}>
        <input id="bk-lastName" type="text" autoComplete="family-name" className="bk-field"
          value={values.lastName} onChange={(e) => onChange('lastName', e.target.value)} {...a11y('lastName')} />
      </Field>
      <div className="col-span-2">
        <Field id="bk-phone" label={t('booking.form.phone')} error={errors.phone}>
          <PhoneInput
            international
            defaultCountry="DZ"
            value={values.phone}
            onChange={(value) => onChange('phone', value || '')}
            className={`bk-field${errors.phone ? ' is-invalid' : ''}`}
            numberInputProps={{ id: 'bk-phone', autoComplete: 'tel', 'aria-describedby': errors.phone ? 'bk-phone-error' : undefined }}
          />
        </Field>
      </div>
      <div className="col-span-2">
        <Field id="bk-email" label={t('booking.form.email')} error={errors.email}>
          <input id="bk-email" type="email" inputMode="email" autoComplete="email" className="bk-field"
            placeholder={t('booking.form.email_placeholder')}
            value={values.email} onChange={(e) => onChange('email', e.target.value)} {...a11y('email')} />
        </Field>
      </div>
    </div>
  );
};

export default PersonalInfoSection;
