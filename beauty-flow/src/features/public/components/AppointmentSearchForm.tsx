import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useTemplateStyles } from '../../../hooks/useTemplateStyles';
import Modal from './Modal';

type SearchMode = 'email' | 'phone' | 'name';

interface AppointmentSearchFormData {
  searchMode: SearchMode;
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
}

interface AppointmentSearchFormProps {
  isOpen: boolean;
  onClose: () => void;
}

const AppointmentSearchForm: React.FC<AppointmentSearchFormProps> = ({
  isOpen,
  onClose
}) => {
  const { t } = useTranslation(['appointments', 'common']);
  const navigate = useNavigate();
  const { colors } = useTemplateStyles();
  const [formData, setFormData] = useState<AppointmentSearchFormData>({
    searchMode: 'email',
    email: '',
    phone: '',
    firstName: '',
    lastName: ''
  });
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleModeChange = (mode: SearchMode) => {
    setFormData(prev => ({ 
      ...prev, 
      searchMode: mode,
      // Reset fields when changing mode
      email: '',
      phone: '',
      firstName: '',
      lastName: ''
    }));
    setError(null);
  };

  const validateForm = () => {
    switch (formData.searchMode) {
      case 'email':
        return formData.email.trim() !== '';
      case 'phone':
        return formData.phone.trim() !== '';
      case 'name':
        return formData.firstName.trim() !== '' && formData.lastName.trim() !== '';
      default:
        return false;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setError('Veuillez remplir tous les champs requis');
      return;
    }

    // Créer les paramètres de recherche selon le mode
    const searchParams = new URLSearchParams();
    
    switch (formData.searchMode) {
      case 'email':
        searchParams.set('email', formData.email);
        break;
      case 'phone':
        searchParams.set('phone', formData.phone);
        break;
      case 'name':
        searchParams.set('firstName', formData.firstName);
        searchParams.set('lastName', formData.lastName);
        break;
    }

    // Extraire le slug du salon depuis l'URL actuelle
    const currentPath = window.location.pathname;
    const salonSlug = currentPath.split('/')[2] || 'default-salon';

    // Rediriger vers la page de liste des rendez-vous avec le slug du salon
    navigate(`/salon/${salonSlug}/appointments/list?${searchParams.toString()}`);
    onClose();
  };

  const renderSearchFields = () => {
    switch (formData.searchMode) {
      case 'email':
        return (
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium mb-2"
              style={{ color: colors.textPrimary }}
            >
              Adresse email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg transition-all duration-300 focus:outline-none focus:ring-2"
              style={{
                backgroundColor: `${colors.surface}`,
                color: colors.textPrimary,
                borderWidth: '2px',
                borderStyle: 'solid',
                borderColor: `${colors.primary}40`,
                '--tw-ring-color': colors.primary
              } as any}
              placeholder="votre@email.com"
              autoComplete="email"
            />
          </div>
        );

      case 'phone':
        return (
          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-medium mb-2"
              style={{ color: colors.textPrimary }}
            >
              Numéro de téléphone
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg transition-all duration-300 focus:outline-none focus:ring-2"
              style={{
                backgroundColor: `${colors.surface}`,
                color: colors.textPrimary,
                borderWidth: '2px',
                borderStyle: 'solid',
                borderColor: `${colors.primary}40`,
                '--tw-ring-color': colors.primary
              } as any}
              placeholder="06 12 34 56 78"
              autoComplete="tel"
            />
          </div>
        );

      case 'name':
        return (
          <>
            <div>
              <label
                htmlFor="firstName"
                className="block text-sm font-medium mb-2"
                style={{ color: colors.textPrimary }}
              >
                Prénom
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg transition-all duration-300 focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: `${colors.surface}`,
                  color: colors.textPrimary,
                  borderWidth: '2px',
                  borderStyle: 'solid',
                  borderColor: `${colors.primary}40`,
                  '--tw-ring-color': colors.primary
                } as any}
                placeholder="Votre prénom"
                autoComplete="given-name"
              />
            </div>
            <div>
              <label
                htmlFor="lastName"
                className="block text-sm font-medium mb-2"
                style={{ color: colors.textPrimary }}
              >
                Nom de famille
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg transition-all duration-300 focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: `${colors.surface}`,
                  color: colors.textPrimary,
                  borderWidth: '2px',
                  borderStyle: 'solid',
                  borderColor: `${colors.primary}40`,
                  '--tw-ring-color': colors.primary
                } as any}
                placeholder="Votre nom"
                autoComplete="family-name"
              />
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Gérer mes réservations"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Sélecteur de mode de recherche */}
        <div className="space-y-3">
          <h3 
            className="text-sm font-medium"
            style={{ color: colors.textPrimary }}
          >
            Comment souhaitez-vous rechercher vos rendez-vous ?
          </h3>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleModeChange('email')}
              className="px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 transform hover:scale-105"
              style={{
                background: formData.searchMode === 'email' 
                  ? `linear-gradient(135deg, ${colors.primary}, ${colors.primaryDark})`
                  : `${colors.surface}`,
                color: formData.searchMode === 'email' ? '#FFFFFF' : colors.textPrimary,
                border: `2px solid ${formData.searchMode === 'email' ? colors.primary : `${colors.primary}40`}`
              }}
            >
              📧 Email
            </button>
            <button
              type="button"
              onClick={() => handleModeChange('phone')}
              className="px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 transform hover:scale-105"
              style={{
                background: formData.searchMode === 'phone' 
                  ? `linear-gradient(135deg, ${colors.primary}, ${colors.primaryDark})`
                  : `${colors.surface}`,
                color: formData.searchMode === 'phone' ? '#FFFFFF' : colors.textPrimary,
                border: `2px solid ${formData.searchMode === 'phone' ? colors.primary : `${colors.primary}40`}`
              }}
            >
              📱 Téléphone
            </button>
            <button
              type="button"
              onClick={() => handleModeChange('name')}
              className="px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 transform hover:scale-105"
              style={{
                background: formData.searchMode === 'name' 
                  ? `linear-gradient(135deg, ${colors.primary}, ${colors.primaryDark})`
                  : `${colors.surface}`,
                color: formData.searchMode === 'name' ? '#FFFFFF' : colors.textPrimary,
                border: `2px solid ${formData.searchMode === 'name' ? colors.primary : `${colors.primary}40`}`
              }}
            >
              👤 Nom
            </button>
          </div>
        </div>

        {/* Champs de recherche dynamiques */}
        <div className="space-y-4">
          {renderSearchFields()}
        </div>

        {error && (
          <div 
            className="text-sm text-center p-3 rounded-lg"
            style={{
              backgroundColor: '#FEE2E2',
              color: '#991B1B'
            }}
          >
            {error}
          </div>
        )}

        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-105"
            style={{
              backgroundColor: `${colors.surface}`,
              color: colors.textSecondary,
              border: `2px solid ${colors.primary}40`
            }}
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={!validateForm()}
            className="px-6 py-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            style={{
              background: validateForm() 
                ? `linear-gradient(135deg, ${colors.primary}, ${colors.primaryDark})`
                : '#9CA3AF',
              color: '#FFFFFF',
              boxShadow: validateForm() ? `0 4px 15px ${colors.primary}40` : 'none'
            }}
          >
            Rechercher mes rendez-vous
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AppointmentSearchForm;
