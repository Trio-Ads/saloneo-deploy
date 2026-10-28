import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useServiceStore } from '../../../services/store';
import { PublicClientFormData, PublicService } from '../../types';
import PersonalInfoSection from './PersonalInfoSection';
import HairQuestionnaireSection from './HairQuestionnaireSection';
import SkinQuestionnaireSection from './SkinQuestionnaireSection';
import PreferencesSection from './PreferencesSection';

interface PublicClientFormProps {
  serviceId: string;
  publicService?: PublicService;
  onSubmit: (data: PublicClientFormData) => void;
  /** id of the <form>, so a submit button outside it (sheet footer) can use form={formId} */
  formId?: string;
}

const PublicClientForm: React.FC<PublicClientFormProps> = ({
  serviceId,
  publicService,
  onSubmit,
  formId = 'bk-client-form',
}) => {
  const { t } = useTranslation('public');
  const serviceFromStore = useServiceStore((state) =>
    state.services.find(s => s.id === serviceId)
  );
  // Use admin store service if available, otherwise fall back to the public service data
  const service = serviceFromStore ?? publicService;

  const [formData, setFormData] = useState<PublicClientFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    birthDate: undefined,
    address: undefined,
    hairQuestionnaire: service?.category.toLowerCase().includes('cheveux') ? {
      hairType: 'Raides',
      thickness: 'Moyens',
      scalpCondition: 'Normaux',
      porosity: 'Modérée',
      chemicalTreatments: [],
      hairProblems: []
    } : undefined,
    skinQuestionnaire: service?.category.toLowerCase().includes('soin') ? {
      skinType: 'Normale',
      sensitivity: 'Modérée',
      skinProblems: [],
      mainConcernArea: []
    } : undefined,
    preferences: {
      communicationPreferences: {
        smsReminders: true,
        emailMarketing: false,
        birthdayOffers: false,
      },
      servicePreferences: {
        preferredDays: [],
        preferredTimes: [],
      }
    },
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Validation des champs obligatoires
    if (!formData.firstName.trim()) newErrors.firstName = t('booking.form.errors.first_name');
    if (!formData.lastName.trim()) newErrors.lastName = t('booking.form.errors.last_name');
    if (!formData.email) {
      newErrors.email = t('booking.form.errors.email_required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t('booking.form.errors.email_invalid');
    }
    if (!formData.phone) {
      newErrors.phone = t('booking.form.errors.phone_required');
    } else if (formData.phone.replace(/\D/g, '').length < 8) {
      newErrors.phone = t('booking.form.errors.phone_invalid');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    } else {
      // Bring the first invalid field into view on small screens
      requestAnimationFrame(() => (e.target as HTMLFormElement).querySelector<HTMLElement>('input[aria-invalid="true"], .is-invalid input')?.focus());
    }
  };

  const handlePersonalInfoChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleHairQuestionnaireChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      hairQuestionnaire: {
        ...prev.hairQuestionnaire!,
        [field]: value,
      },
    }));
  };

  const handleSkinQuestionnaireChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      skinQuestionnaire: {
        ...prev.skinQuestionnaire!,
        [field]: value,
      },
    }));
  };

  const handlePreferencesChange = (field: string, value: boolean) => {
    setFormData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        communicationPreferences: {
          ...prev.preferences.communicationPreferences,
          [field]: value,
        }
      }
    }));
  };

  if (!service) return null;

  const chevron = (
    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
    </svg>
  );

  return (
    <form id={formId} onSubmit={handleSubmit} noValidate className="space-y-6">
      <PersonalInfoSection
        values={{
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
        }}
        onChange={handlePersonalInfoChange}
        errors={errors}
      />

      <div className="space-y-3">
        <details className="bk-details">
          <summary>{t('booking.form.more_info')}{chevron}</summary>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="bk-birthDate" className="bk-label">{t('booking.form.birth_date')}</label>
              <input id="bk-birthDate" type="date" className="bk-field" value={formData.birthDate || ''}
                onChange={(e) => handlePersonalInfoChange('birthDate', e.target.value)} />
            </div>
            <div>
              <label htmlFor="bk-address" className="bk-label">{t('booking.form.address')}</label>
              <input id="bk-address" type="text" autoComplete="street-address" className="bk-field" value={formData.address || ''}
                onChange={(e) => handlePersonalInfoChange('address', e.target.value)} />
            </div>
          </div>
        </details>

        {service.category.toLowerCase().includes('cheveux') && formData.hairQuestionnaire && (
          <details className="bk-details">
            <summary>{t('booking.form.hair_questionnaire')}{chevron}</summary>
            <div>
              <HairQuestionnaireSection values={formData.hairQuestionnaire as any} onChange={handleHairQuestionnaireChange} />
            </div>
          </details>
        )}

        {service.category.toLowerCase().includes('soin') && formData.skinQuestionnaire && (
          <details className="bk-details">
            <summary>{t('booking.form.skin_questionnaire')}{chevron}</summary>
            <div>
              <SkinQuestionnaireSection values={formData.skinQuestionnaire as any} onChange={handleSkinQuestionnaireChange} />
            </div>
          </details>
        )}

        <details className="bk-details">
          <summary>{t('booking.form.preferences')}{chevron}</summary>
          <div>
            <PreferencesSection values={formData.preferences.communicationPreferences} onChange={handlePreferencesChange} />
          </div>
        </details>
      </div>

      <div>
        <label htmlFor="bk-notes" className="bk-label">{t('booking.form.notes')}</label>
        <textarea id="bk-notes" rows={3} maxLength={500} className="bk-field resize-none"
          placeholder={t('booking.form.notes_placeholder')}
          value={formData.notes || ''} onChange={(e) => handlePersonalInfoChange('notes', e.target.value)} />
      </div>
    </form>
  );
};

export default PublicClientForm;
