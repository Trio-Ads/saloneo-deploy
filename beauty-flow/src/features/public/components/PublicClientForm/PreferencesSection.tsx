import React from 'react';
import { useTranslation } from 'react-i18next';
import { PublicClientFormData } from '../../types';

type Prefs = PublicClientFormData['preferences']['communicationPreferences'];

interface PreferencesSectionProps {
  values: Prefs;
  onChange: (field: keyof Prefs, value: boolean) => void;
}

const PreferencesSection: React.FC<PreferencesSectionProps> = ({ values, onChange }) => {
  const { t } = useTranslation('public');
  const rows: Array<[keyof Prefs, string]> = [
    ['smsReminders', t('booking.form.pref_sms')],
    ['emailMarketing', t('booking.form.pref_marketing')],
    ['birthdayOffers', t('booking.form.pref_birthday')],
  ];

  return (
    <div>
      {rows.map(([field, label]) => (
        <label key={field} className="bk-switch-row">
          <span>{label}</span>
          <input
            type="checkbox"
            role="switch"
            className="bk-switch"
            checked={values[field]}
            onChange={(e) => onChange(field, e.target.checked)}
          />
        </label>
      ))}
      <p className="bk-muted text-xs mt-2">{t('booking.form.privacy')}</p>
    </div>
  );
};

export default PreferencesSection;
