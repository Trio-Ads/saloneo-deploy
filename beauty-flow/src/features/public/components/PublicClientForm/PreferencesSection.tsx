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
        <h3 className="text-xl font-bold mb-6 bg-gradient-to-r from-orange-600 to-orange-700 dark:from-orange-500 dark:to-orange-600 bg-clip-text text-transparent">
          Préférences de communication
        </h3>

        <div className="space-y-6 mb-8">
          <label className="flex items-center group hover-lift transition-all duration-300">
            <input
              type="checkbox"
              checked={values.smsReminders}
              onChange={(e) => onChange('smsReminders', e.target.checked)}
              className="rounded border-gray-300 dark:border-white/20 bg-white dark:bg-white/5 text-orange-600 focus:ring-orange-500 transition-colors duration-300"
            />
            <span className="ml-3 text-sm text-gray-700 dark:text-white/80 group-hover:text-gray-900 dark:group-hover:text-white transition-colors duration-300">
              Je souhaite recevoir des rappels de rendez-vous par SMS
            </span>
          </label>

          <label className="flex items-center group hover-lift transition-all duration-300">
            <input
              type="checkbox"
              checked={values.emailMarketing}
              onChange={(e) => onChange('emailMarketing', e.target.checked)}
              className="rounded border-gray-300 dark:border-white/20 bg-white dark:bg-white/5 text-orange-600 focus:ring-orange-500 transition-colors duration-300"
            />
            <span className="ml-3 text-sm text-gray-700 dark:text-white/80 group-hover:text-gray-900 dark:group-hover:text-white transition-colors duration-300">
              Je souhaite recevoir des offres et actualités par email
            </span>
          </label>

          <label className="flex items-center group hover-lift transition-all duration-300">
            <input
              type="checkbox"
              checked={values.birthdayOffers}
              onChange={(e) => onChange('birthdayOffers', e.target.checked)}
              className="rounded border-gray-300 dark:border-white/20 bg-white dark:bg-white/5 text-orange-600 focus:ring-orange-500 transition-colors duration-300"
            />
            <span className="ml-3 text-sm text-gray-700 dark:text-white/80 group-hover:text-gray-900 dark:group-hover:text-white transition-colors duration-300">
              Je souhaite recevoir une offre spéciale pour mon anniversaire
            </span>
          </label>
        </div>

        <div className="mt-6 text-sm text-gray-600 dark:text-white/60 bg-orange-50 dark:bg-white/5 p-4 rounded-lg backdrop-blur-sm">
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
