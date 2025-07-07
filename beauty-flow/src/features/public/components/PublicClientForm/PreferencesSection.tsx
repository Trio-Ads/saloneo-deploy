import React from 'react';
import { useInterfaceStore } from '../../../interface/store';

import { PublicClientFormData } from '../../types';

interface PreferencesSectionProps {
  values: PublicClientFormData['preferences']['communicationPreferences'];
  onChange: (field: keyof PublicClientFormData['preferences']['communicationPreferences'], value: boolean) => void;
}

const PreferencesSection: React.FC<PreferencesSectionProps> = ({
  values,
  onChange,
}) => {
  const settings = useInterfaceStore((state) => state.settings);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold mb-6 gradient-text">
          Préférences de communication
        </h3>

        <div className="space-y-6 mb-8">
          <label className="flex items-center group hover-lift transition-all duration-300">
            <input
              type="checkbox"
              checked={values.smsReminders}
              onChange={(e) => onChange('smsReminders', e.target.checked)}
              className="rounded border-white/20 bg-white/5 text-burgundy focus:ring-burgundy transition-colors duration-300"
            />
            <span className="ml-3 text-sm text-white/80 group-hover:text-white transition-colors duration-300">
              Je souhaite recevoir des rappels de rendez-vous par SMS
            </span>
          </label>

          <label className="flex items-center group hover-lift transition-all duration-300">
            <input
              type="checkbox"
              checked={values.emailMarketing}
              onChange={(e) => onChange('emailMarketing', e.target.checked)}
              className="rounded border-white/20 bg-white/5 text-burgundy focus:ring-burgundy transition-colors duration-300"
            />
            <span className="ml-3 text-sm text-white/80 group-hover:text-white transition-colors duration-300">
              Je souhaite recevoir des offres et actualités par email
            </span>
          </label>

          <label className="flex items-center group hover-lift transition-all duration-300">
            <input
              type="checkbox"
              checked={values.birthdayOffers}
              onChange={(e) => onChange('birthdayOffers', e.target.checked)}
              className="rounded border-white/20 bg-white/5 text-burgundy focus:ring-burgundy transition-colors duration-300"
            />
            <span className="ml-3 text-sm text-white/80 group-hover:text-white transition-colors duration-300">
              Je souhaite recevoir une offre spéciale pour mon anniversaire
            </span>
          </label>
        </div>

        <div className="mt-6 text-sm text-white/60 bg-white/5 p-4 rounded-lg backdrop-blur-sm">
          <p>
            Vos préférences de communication peuvent être modifiées à tout moment.
            Nous respectons votre vie privée et ne partagerons jamais vos informations
            avec des tiers.
          </p>
        </div>
      </div>

    </div>
  );
};

export default PreferencesSection;
