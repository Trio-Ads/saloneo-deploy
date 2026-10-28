import React from 'react';
import { useTranslation } from 'react-i18next';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { ClientFormData, UIHairQuestionnaire, UISkinQuestionnaire } from '../types';
import {
  HAIR_TYPES,
  HAIR_THICKNESS,
  HAIR_POROSITY,
  CHEMICAL_TREATMENTS,
  HAIR_PROBLEMS,
  SKIN_TYPES,
  SKIN_PROBLEMS,
  SKIN_AREAS,
  UI_SCALP_CONDITIONS,
  UI_SKIN_SENSITIVITY
} from '../store';
import { useServiceStore } from '../../services/store';
import { useTeamStore } from '../../team/store';

const labelClass = 'mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300';

interface ClientFormProps {
  initialData?: ClientFormData;
  onSubmit: (data: ClientFormData) => void;
  onCancel: () => void;
}

const ClientForm: React.FC<ClientFormProps> = ({
  initialData,
  onSubmit,
  onCancel
}) => {
  const { t } = useTranslation('clients');
  const services = useServiceStore((state) => state.services);
  const allTeamMembers = useTeamStore((state) => state.members);
  
  const teamMembers = React.useMemo(
    () => allTeamMembers.filter((m) => m.isActive),
    [allTeamMembers]
  );

  const defaultFormData: ClientFormData = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    birthDate: '',
    address: '',
    notes: '',
    preferences: {
      favoriteServices: [],
      preferredStylists: [],
      hairQuestionnaire: {
        hairType: 'Raides',
        thickness: 'Moyens',
        scalpCondition: 'Normal',
        porosity: 'Moyenne',
        chemicalTreatments: [],
        hairProblems: [],
        currentProducts: '',
        allergies: ''
      },
      skinQuestionnaire: {
        skinType: 'Normale',
        sensitivity: 'Pas sensible',
        skinProblems: [],
        mainConcernArea: [],
        currentProducts: '',
        allergies: '',
        pastReactions: ''
      },
      communicationPreferences: {
        smsReminders: true,
        emailMarketing: false,
        birthdayOffers: true
      }
    },
    isActive: true
  };

  const getInitialFormData = (): ClientFormData => {
    const defaultHairQuestionnaire: UIHairQuestionnaire = {
      hairType: 'Raides',
      thickness: 'Moyens',
      scalpCondition: 'Normal',
      porosity: 'Moyenne',
      chemicalTreatments: [],
      hairProblems: [],
      currentProducts: '',
      allergies: ''
    };

    const defaultSkinQuestionnaire: UISkinQuestionnaire = {
      skinType: 'Normale',
      sensitivity: 'Pas sensible',
      skinProblems: [],
      mainConcernArea: [],
      currentProducts: '',
      allergies: '',
      pastReactions: ''
    };

    if (initialData) {
      return {
        ...initialData,
        preferences: {
          ...initialData.preferences,
          hairQuestionnaire: {
            ...defaultHairQuestionnaire,
            ...initialData.preferences.hairQuestionnaire
          },
          skinQuestionnaire: {
            ...defaultSkinQuestionnaire,
            ...initialData.preferences.skinQuestionnaire
          }
        }
      };
    }

    return {
      ...defaultFormData,
      preferences: {
        ...defaultFormData.preferences,
        hairQuestionnaire: defaultHairQuestionnaire,
        skinQuestionnaire: defaultSkinQuestionnaire
      }
    };
  };

  const [formData, setFormData] = React.useState<ClientFormData>(getInitialFormData);
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
        // Garde DZ par défaut en cas d'erreur
      }
    };
    detectCountry();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error(t('client_form.error_message'), error);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePreferenceChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const isCheckbox = type === 'checkbox';
    
    setFormData((prev) => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        communicationPreferences: {
          ...prev.preferences.communicationPreferences,
          [name]: isCheckbox ? (e.target as HTMLInputElement).checked : value
        }
      }
    }));
  };

  const handleMultiSelect = (e: React.ChangeEvent<HTMLSelectElement>, field: string) => {
    const selectedOptions = Array.from(e.target.selectedOptions).map(
      (option) => option.value
    );
    setFormData((prev) => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [field]: selectedOptions
      }
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="panel max-w-3xl dark:bg-gray-900 dark:border-gray-800">
      <div className="px-5 pt-5 pb-4">
        <h2 className="text-base font-semibold text-gray-900 dark:text-gray-50">
          {initialData ? t('client_form.title_edit') : t('client_form.title_new')}
        </h2>
        <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">{t('client_form.subtitle')}</p>
      </div>

      <div className="divide-y divide-gray-100 border-t border-gray-100 dark:divide-gray-800 dark:border-gray-800">
        <section className="space-y-4 p-5">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-50">{t('client_form.sections.personal_info')}</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="firstName" className={labelClass}>{t('client_form.labels.first_name_required')}</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName || ''}
                onChange={handleChange}
                required
                className="field"
                placeholder={t('client_form.placeholders.enter_first_name')}
              />
            </div>
            <div>
              <label htmlFor="lastName" className={labelClass}>{t('client_form.labels.last_name_required')}</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName || ''}
                onChange={handleChange}
                required
                className="field"
                placeholder={t('client_form.placeholders.enter_last_name')}
              />
            </div>
            <div>
              <label htmlFor="email" className={labelClass}>{t('form.email')}</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email || ''}
                onChange={handleChange}
                className="field"
                placeholder={t('placeholders.email')}
              />
            </div>
            <div>
              <label htmlFor="phone" className={labelClass}>{t('client_form.labels.phone_required')}</label>
              <PhoneInput
                id="phone"
                international
                defaultCountry={defaultCountry as any}
                value={formData.phone || ''}
                onChange={(value) => setFormData((prev) => ({ ...prev, phone: value || '' }))}
                className="field flex items-center gap-2 focus-within:border-orange-500 focus-within:ring-[3px] focus-within:ring-orange-500/15"
                numberInputProps={{
                  className: 'w-full min-w-0 border-0 bg-transparent p-0 text-base text-gray-900 outline-none focus:ring-0 sm:text-sm dark:text-gray-100',
                  required: true
                }}
              />
            </div>
            <div>
              <label htmlFor="birthDate" className={labelClass}>{t('client_form.labels.birth_date')}</label>
              <input
                type="date"
                id="birthDate"
                name="birthDate"
                value={formData.birthDate || ''}
                onChange={handleChange}
                className="field"
              />
            </div>
            <div>
              <label htmlFor="address" className={labelClass}>{t('form.address')}</label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address || ''}
                onChange={handleChange}
                className="field"
                placeholder={t('client_form.placeholders.address_example')}
              />
            </div>
          </div>
          <div>
            <label htmlFor="notes" className={labelClass}>{t('form.notes')}</label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes || ''}
              onChange={handleChange}
              rows={3}
              className="field"
              placeholder={t('client_form.placeholders.notes_placeholder')}
            />
          </div>
        </section>

        <section className="space-y-4 p-5">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-50">{t('client_form.sections.preferences')}</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="favoriteServices" className={labelClass}>{t('client_form.labels.favorite_services')}</label>
              <select
                id="favoriteServices"
                multiple
                value={formData.preferences.favoriteServices}
                onChange={(e) => handleMultiSelect(e, 'favoriteServices')}
                className="field"
                size={4}
              >
                {services.map((service) => (
                  <option key={service.id} value={service.id}>{service.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="preferredStylists" className={labelClass}>{t('client_form.labels.preferred_stylists')}</label>
              <select
                id="preferredStylists"
                multiple
                value={formData.preferences.preferredStylists}
                onChange={(e) => handleMultiSelect(e, 'preferredStylists')}
                className="field"
                size={4}
              >
                {teamMembers.map((member) => (
                  <option key={member.id} value={member.id}>{member.firstName} {member.lastName}</option>
                ))}
              </select>
            </div>
          </div>
        </section>

        <section className="space-y-2 p-5">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-50">{t('client_form.sections.communication')}</h3>
          <div className="grid grid-cols-1 gap-x-6 sm:grid-cols-3">
            <label className="flex items-center gap-3 min-h-10">
              <input
                type="checkbox"
                id="smsReminders"
                name="smsReminders"
                checked={formData.preferences.communicationPreferences.smsReminders}
                onChange={handlePreferenceChange}
                className="size-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500 dark:border-gray-600 dark:bg-gray-800"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">{t('client_form.labels.sms_reminders')}</span>
            </label>
            <label className="flex items-center gap-3 min-h-10">
              <input
                type="checkbox"
                id="emailMarketing"
                name="emailMarketing"
                checked={formData.preferences.communicationPreferences.emailMarketing}
                onChange={handlePreferenceChange}
                className="size-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500 dark:border-gray-600 dark:bg-gray-800"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">{t('client_form.labels.email_marketing')}</span>
            </label>
            <label className="flex items-center gap-3 min-h-10">
              <input
                type="checkbox"
                id="birthdayOffers"
                name="birthdayOffers"
                checked={formData.preferences.communicationPreferences.birthdayOffers}
                onChange={handlePreferenceChange}
                className="size-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500 dark:border-gray-600 dark:bg-gray-800"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">{t('client_form.labels.birthday_offers')}</span>
            </label>
          </div>
        </section>
      </div>

      <div className="flex flex-col-reverse gap-2 border-t border-gray-100 px-5 py-4 dark:border-gray-800 sm:flex-row sm:justify-end">
        <button type="button" onClick={onCancel} className="btn-secondary">
          {t('client_form.buttons.cancel')}
        </button>
        <button type="submit" className="btn-primary">
          {initialData ? t('client_form.buttons.modify') : t('client_form.buttons.add')}
        </button>
      </div>
    </form>
  );
};

export default ClientForm;
