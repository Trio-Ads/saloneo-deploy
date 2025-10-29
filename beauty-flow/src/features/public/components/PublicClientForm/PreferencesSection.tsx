import React from 'react';
import { useTemplateStyles } from '../../../../hooks/useTemplateStyles';
import { PublicClientFormData } from '../../types';

interface PreferencesSectionProps {
  values: PublicClientFormData['preferences']['communicationPreferences'];
  onChange: (field: keyof PublicClientFormData['preferences']['communicationPreferences'], value: boolean) => void;
}

const PreferencesSection: React.FC<PreferencesSectionProps> = ({
  values,
  onChange,
}) => {
  const { colors } = useTemplateStyles();

  return (
    <div className="space-y-6">
      <div>
        <h3 
          className="text-xl font-bold mb-6 bg-clip-text text-transparent"
          style={{
            backgroundImage: `linear-gradient(to right, ${colors.primary}, ${colors.primaryDark})`
          }}
        >
          Préférences de communication
        </h3>

        <div className="space-y-4 mb-8">
          <label 
            className="flex items-center p-4 rounded-lg group transition-all duration-300 cursor-pointer hover:scale-[1.02]"
            style={{
              backgroundColor: `${colors.surface}`,
              border: `2px solid ${colors.primary}20`,
              boxShadow: `0 2px 8px ${colors.primary}10`
            }}
          >
            <input
              type="checkbox"
              checked={values.smsReminders}
              onChange={(e) => onChange('smsReminders', e.target.checked)}
              className="w-5 h-5 rounded border-2 transition-all duration-300 cursor-pointer flex-shrink-0"
              style={{
                borderColor: colors.primary,
                accentColor: colors.primary,
                '--tw-ring-color': colors.primary
              } as any}
            />
            <span 
              className="ml-4 text-sm font-medium transition-colors duration-300"
              style={{ color: colors.textPrimary }}
            >
              Je souhaite recevoir des rappels de rendez-vous par SMS
            </span>
          </label>

          <label 
            className="flex items-center p-4 rounded-lg group transition-all duration-300 cursor-pointer hover:scale-[1.02]"
            style={{
              backgroundColor: `${colors.surface}`,
              border: `2px solid ${colors.primary}20`,
              boxShadow: `0 2px 8px ${colors.primary}10`
            }}
          >
            <input
              type="checkbox"
              checked={values.emailMarketing}
              onChange={(e) => onChange('emailMarketing', e.target.checked)}
              className="w-5 h-5 rounded border-2 transition-all duration-300 cursor-pointer flex-shrink-0"
              style={{
                borderColor: colors.primary,
                accentColor: colors.primary,
                '--tw-ring-color': colors.primary
              } as any}
            />
            <span 
              className="ml-4 text-sm font-medium transition-colors duration-300"
              style={{ color: colors.textPrimary }}
            >
              Je souhaite recevoir des offres et actualités par email
            </span>
          </label>

          <label 
            className="flex items-center p-4 rounded-lg group transition-all duration-300 cursor-pointer hover:scale-[1.02]"
            style={{
              backgroundColor: `${colors.surface}`,
              border: `2px solid ${colors.primary}20`,
              boxShadow: `0 2px 8px ${colors.primary}10`
            }}
          >
            <input
              type="checkbox"
              checked={values.birthdayOffers}
              onChange={(e) => onChange('birthdayOffers', e.target.checked)}
              className="w-5 h-5 rounded border-2 transition-all duration-300 cursor-pointer flex-shrink-0"
              style={{
                borderColor: colors.primary,
                accentColor: colors.primary,
                '--tw-ring-color': colors.primary
              } as any}
            />
            <span 
              className="ml-4 text-sm font-medium transition-colors duration-300"
              style={{ color: colors.textPrimary }}
            >
              Je souhaite recevoir une offre spéciale pour mon anniversaire
            </span>
          </label>
        </div>

        <div 
          className="mt-6 text-sm p-4 rounded-lg"
          style={{
            backgroundColor: `${colors.primary}10`,
            color: colors.textSecondary
          }}
        >
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
