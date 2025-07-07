import React, { useState } from 'react';
import { useInterfaceStore } from '../../../interface/store';
import { useServiceStore } from '../../../services/store';
import { PublicClientFormData } from '../../types';
import { HairQuestionnaire, SkinQuestionnaire } from '../../../clients/types';
import PersonalInfoSection from './PersonalInfoSection';
import HairQuestionnaireSection from './HairQuestionnaireSection';
import SkinQuestionnaireSection from './SkinQuestionnaireSection';
import PreferencesSection from './PreferencesSection';

interface PublicClientFormProps {
  serviceId: string;
  onSubmit: (data: PublicClientFormData) => void;
  onBack: () => void;
}

const PublicClientForm: React.FC<PublicClientFormProps> = ({
  serviceId,
  onSubmit,
  onBack,
}) => {
  const settings = useInterfaceStore((state) => state.settings);
  const service = useServiceStore((state) => 
    state.services.find(s => s.id === serviceId)
  );

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
      scalpCondition: 'Normal',
      porosity: 'Moyenne',
      chemicalTreatments: [],
      hairProblems: [],
    } : undefined,
    skinQuestionnaire: service?.category.toLowerCase().includes('soin') ? {
      skinType: 'Normale',
      sensitivity: 'Pas sensible',
      skinProblems: [],
      mainConcernArea: [],
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
    if (!formData.firstName) newErrors.firstName = 'Le prénom est requis';
    if (!formData.lastName) newErrors.lastName = 'Le nom est requis';
    if (!formData.email) {
      newErrors.email = 'L\'email est requis';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'L\'email n\'est pas valide';
    }
    if (!formData.phone) {
      newErrors.phone = 'Le téléphone est requis';
    } else if (!/^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/.test(formData.phone)) {
      newErrors.phone = 'Le numéro de téléphone n\'est pas valide';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
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

  const handleHairQuestionnaireChange = (field: keyof HairQuestionnaire, value: any) => {
    setFormData(prev => ({
      ...prev,
      hairQuestionnaire: {
        ...prev.hairQuestionnaire!,
        [field]: value,
      },
    }));
  };

  const handleSkinQuestionnaireChange = (field: keyof SkinQuestionnaire, value: any) => {
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

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="glass-card p-6 animate-fade-in">
        <PersonalInfoSection
          values={{
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            phone: formData.phone,
            birthDate: formData.birthDate,
            address: formData.address,
          }}
          onChange={handlePersonalInfoChange}
          errors={errors}
        />
      </div>

      {service.category.toLowerCase().includes('cheveux') && formData.hairQuestionnaire && (
        <div className="glass-card p-6 animate-fade-in">
          <HairQuestionnaireSection
            values={formData.hairQuestionnaire}
            onChange={handleHairQuestionnaireChange}
          />
        </div>
      )}

      {service.category.toLowerCase().includes('soin') && formData.skinQuestionnaire && (
        <div className="glass-card p-6 animate-fade-in">
          <SkinQuestionnaireSection
            values={formData.skinQuestionnaire}
            onChange={handleSkinQuestionnaireChange}
          />
        </div>
      )}

      <div className="glass-card p-6 animate-fade-in">
        <PreferencesSection
          values={formData.preferences.communicationPreferences}
          onChange={handlePreferencesChange}
        />
      </div>

      <div className="flex justify-between pt-6">
        <button
          type="button"
          onClick={onBack}
          className="glass-button px-6 py-3 text-white/80 hover:text-white transition-all duration-300"
        >
          Retour
        </button>

        <button
          type="submit"
          className="glass-button px-8 py-3 text-white font-medium
                   bg-gradient-to-r from-burgundy to-purple
                   hover:from-burgundy-light hover:to-purple-light
                   transform transition-all duration-300 hover:scale-[1.02]
                   shadow-neon hover:shadow-glass-lg"
        >
          Continuer
        </button>
      </div>
    </form>
  );
};

export default PublicClientForm;
