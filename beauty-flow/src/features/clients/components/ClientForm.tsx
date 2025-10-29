import React from 'react';
import { useTranslation } from 'react-i18next';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { 
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  CalendarDaysIcon,
  MapPinIcon,
  DocumentTextIcon,
  SparklesIcon,
  HeartIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';
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
    <div className="max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl shadow-orange-md">
              <UserIcon className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
              {initialData ? t('client_form.title_edit') : t('client_form.title_new')}
            </h2>
          </div>
          <p className="text-gray-600 dark:text-gray-400">{t('client_form.subtitle')}</p>
        </div>

        {/* Informations personnelles */}
        <div className="glass-card p-6 bg-white/90 dark:bg-gray-800/70 backdrop-blur-xl border border-orange-500/20 shadow-orange-md hover:shadow-orange-lg transition-all duration-300">
          <div className="flex items-center space-x-3 mb-6">
            <UserIcon className="h-6 w-6 text-orange-600 dark:text-orange-500" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('client_form.sections.personal_info')}</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <UserIcon className="h-4 w-4 inline mr-2 text-orange-600 dark:text-orange-500" />
                {t('client_form.labels.first_name_required')}
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName || ''}
                onChange={handleChange}
                required
                className="glass-input w-full rounded-xl border-0 bg-white/70 dark:bg-gray-700 dark:text-gray-100 backdrop-blur-sm shadow-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:bg-white dark:focus:bg-gray-600 transition-all duration-200"
                placeholder={t('client_form.placeholders.enter_first_name')}
              />
            </div>

            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <UserIcon className="h-4 w-4 inline mr-2 text-orange-600 dark:text-orange-500" />
                {t('client_form.labels.last_name_required')}
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName || ''}
                onChange={handleChange}
                required
                className="glass-input w-full rounded-xl border-0 bg-white/70 dark:bg-gray-700 dark:text-gray-100 backdrop-blur-sm shadow-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:bg-white dark:focus:bg-gray-600 transition-all duration-200"
                placeholder={t('client_form.placeholders.enter_last_name')}
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <EnvelopeIcon className="h-4 w-4 inline mr-2 text-orange-600 dark:text-orange-500" />
                {t('form.email')}
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email || ''}
                onChange={handleChange}
                className="glass-input w-full rounded-xl border-0 bg-white/70 dark:bg-gray-700 dark:text-gray-100 backdrop-blur-sm shadow-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:bg-white dark:focus:bg-gray-600 transition-all duration-200"
                placeholder={t('placeholders.email')}
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <PhoneIcon className="h-4 w-4 inline mr-2 text-orange-600 dark:text-orange-500" />
                {t('client_form.labels.phone_required')}
              </label>
              <PhoneInput
                international
                defaultCountry={defaultCountry as any}
                value={formData.phone || ''}
                onChange={(value) => setFormData((prev) => ({ ...prev, phone: value || '' }))}
                className="glass-input w-full rounded-xl border-0 bg-white/70 dark:bg-gray-700 backdrop-blur-sm shadow-lg focus-within:ring-2 focus-within:ring-orange-500 focus-within:bg-white dark:focus-within:bg-gray-600 transition-all duration-200"
                numberInputProps={{
                  className: 'w-full bg-transparent border-0 focus:outline-none focus:ring-0 text-gray-900 dark:text-gray-100 px-3 py-2',
                  required: true
                }}
              />
            </div>

            <div>
              <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <CalendarDaysIcon className="h-4 w-4 inline mr-2 text-orange-600 dark:text-orange-500" />
                {t('client_form.labels.birth_date')}
              </label>
              <input
                type="date"
                id="birthDate"
                name="birthDate"
                value={formData.birthDate || ''}
                onChange={handleChange}
                className="glass-input w-full rounded-xl border-0 bg-white/70 dark:bg-gray-700 dark:text-gray-100 backdrop-blur-sm shadow-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:bg-white dark:focus:bg-gray-600 transition-all duration-200"
              />
            </div>

            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <MapPinIcon className="h-4 w-4 inline mr-2 text-orange-600 dark:text-orange-500" />
                {t('form.address')}
              </label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address || ''}
                onChange={handleChange}
                className="glass-input w-full rounded-xl border-0 bg-white/70 dark:bg-gray-700 dark:text-gray-100 backdrop-blur-sm shadow-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:bg-white dark:focus:bg-gray-600 transition-all duration-200"
                placeholder={t('client_form.placeholders.address_example')}
              />
            </div>
          </div>

          <div className="mt-6">
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <DocumentTextIcon className="h-4 w-4 inline mr-2 text-orange-600 dark:text-orange-500" />
              {t('form.notes')}
            </label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes || ''}
              onChange={handleChange}
              rows={3}
              className="glass-input w-full rounded-xl border-0 bg-white/70 dark:bg-gray-700 dark:text-gray-100 backdrop-blur-sm shadow-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:bg-white dark:focus:bg-gray-600 transition-all duration-200"
              placeholder={t('client_form.placeholders.notes_placeholder')}
            />
          </div>
        </div>

        {/* Préférences */}
        <div className="glass-card p-6 bg-white/90 dark:bg-gray-800/70 backdrop-blur-xl border border-orange-500/20 shadow-orange-md hover:shadow-orange-lg transition-all duration-300">
          <div className="flex items-center space-x-3 mb-6">
            <HeartIcon className="h-6 w-6 text-orange-600 dark:text-orange-500" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('client_form.sections.preferences')}</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="favoriteServices" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('client_form.labels.favorite_services')}
              </label>
              <select
                id="favoriteServices"
                multiple
                value={formData.preferences.favoriteServices}
                onChange={(e) => handleMultiSelect(e, 'favoriteServices')}
                className="glass-input w-full rounded-xl border-0 bg-white/70 dark:bg-gray-700 dark:text-gray-100 backdrop-blur-sm shadow-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:bg-white dark:focus:bg-gray-600 transition-all duration-200"
                size={4}
              >
                {services.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="preferredStylists" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('client_form.labels.preferred_stylists')}
              </label>
              <select
                id="preferredStylists"
                multiple
                value={formData.preferences.preferredStylists}
                onChange={(e) => handleMultiSelect(e, 'preferredStylists')}
                className="glass-input w-full rounded-xl border-0 bg-white/70 dark:bg-gray-700 dark:text-gray-100 backdrop-blur-sm shadow-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:bg-white dark:focus:bg-gray-600 transition-all duration-200"
                size={4}
              >
                {teamMembers.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.firstName} {member.lastName}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Préférences de communication */}
        <div className="glass-card p-6 bg-white/90 dark:bg-gray-800/70 backdrop-blur-xl border border-orange-500/20 shadow-orange-md hover:shadow-orange-lg transition-all duration-300">
          <div className="flex items-center space-x-3 mb-6">
            <ChatBubbleLeftRightIcon className="h-6 w-6 text-orange-600 dark:text-orange-500" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('client_form.sections.communication')}</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center p-4 glass-card bg-white/50 dark:bg-gray-700/50 rounded-xl hover:bg-white/70 dark:hover:bg-gray-700/70 transition-all duration-200">
              <input
                type="checkbox"
                id="smsReminders"
                name="smsReminders"
                checked={formData.preferences.communicationPreferences.smsReminders}
                onChange={handlePreferenceChange}
                className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-orange-600 focus:ring-orange-500"
              />
              <label htmlFor="smsReminders" className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('client_form.labels.sms_reminders')}
              </label>
            </div>

            <div className="flex items-center p-4 glass-card bg-white/50 dark:bg-gray-700/50 rounded-xl hover:bg-white/70 dark:hover:bg-gray-700/70 transition-all duration-200">
              <input
                type="checkbox"
                id="emailMarketing"
                name="emailMarketing"
                checked={formData.preferences.communicationPreferences.emailMarketing}
                onChange={handlePreferenceChange}
                className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-orange-600 focus:ring-orange-500"
              />
              <label htmlFor="emailMarketing" className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('client_form.labels.email_marketing')}
              </label>
            </div>

            <div className="flex items-center p-4 glass-card bg-white/50 dark:bg-gray-700/50 rounded-xl hover:bg-white/70 dark:hover:bg-gray-700/70 transition-all duration-200">
              <input
                type="checkbox"
                id="birthdayOffers"
                name="birthdayOffers"
                checked={formData.preferences.communicationPreferences.birthdayOffers}
                onChange={handlePreferenceChange}
                className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-orange-600 focus:ring-orange-500"
              />
              <label htmlFor="birthdayOffers" className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('client_form.labels.birthday_offers')}
              </label>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-4 pt-6">
          <button
            type="button"
            onClick={onCancel}
            className="glass-button bg-white/70 dark:bg-gray-700/70 hover:bg-white/90 dark:hover:bg-gray-700/90 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            {t('client_form.buttons.cancel')}
          </button>
          <button
            type="submit"
            className="glass-button bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white border-0 shadow-orange-md hover:shadow-orange-lg transform hover:scale-105 transition-all duration-200"
          >
            {initialData ? t('client_form.buttons.modify') : t('client_form.buttons.add')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ClientForm;
