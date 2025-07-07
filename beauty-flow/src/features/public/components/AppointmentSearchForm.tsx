import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
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
              className="block text-sm font-medium text-white/90 mb-1"
            >
              Adresse email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="glass-input w-full px-4 py-2 rounded text-white"
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
              className="block text-sm font-medium text-white/90 mb-1"
            >
              Numéro de téléphone
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="glass-input w-full px-4 py-2 rounded text-white"
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
                className="block text-sm font-medium text-white/90 mb-1"
              >
                Prénom
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="glass-input w-full px-4 py-2 rounded text-white"
                placeholder="Votre prénom"
                autoComplete="given-name"
              />
            </div>
            <div>
              <label
                htmlFor="lastName"
                className="block text-sm font-medium text-white/90 mb-1"
              >
                Nom de famille
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="glass-input w-full px-4 py-2 rounded text-white"
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
          <h3 className="text-sm font-medium text-white/90">Comment souhaitez-vous rechercher vos rendez-vous ?</h3>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleModeChange('email')}
              className={`px-3 py-2 rounded text-sm transition-colors ${
                formData.searchMode === 'email'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                  : 'glass-button text-white/80 hover:text-white'
              }`}
            >
              📧 Email
            </button>
            <button
              type="button"
              onClick={() => handleModeChange('phone')}
              className={`px-3 py-2 rounded text-sm transition-colors ${
                formData.searchMode === 'phone'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                  : 'glass-button text-white/80 hover:text-white'
              }`}
            >
              📱 Téléphone
            </button>
            <button
              type="button"
              onClick={() => handleModeChange('name')}
              className={`px-3 py-2 rounded text-sm transition-colors ${
                formData.searchMode === 'name'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                  : 'glass-button text-white/80 hover:text-white'
              }`}
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
          <div className="text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded text-white/80 hover:text-white transition-colors glass-button"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={!validateForm()}
            className={`px-6 py-2 rounded text-white transition-colors ${
              !validateForm()
                ? 'bg-gray-400 cursor-not-allowed'
                : 'glass-button bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
            }`}
          >
            Rechercher mes rendez-vous
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AppointmentSearchForm;
