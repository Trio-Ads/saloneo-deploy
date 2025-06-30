import React, { useMemo, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { 
  UserIcon,
  BuildingStorefrontIcon,
  MapPinIcon,
  LanguageIcon,
  CurrencyDollarIcon,
  LinkIcon,
  ClipboardDocumentIcon,
  CheckCircleIcon,
  EnvelopeIcon,
  LockClosedIcon,
  KeyIcon,
  ShieldCheckIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';
import { useProfileStore, generatePublicLink } from '../store';
import { useToastStore } from '../../../components/Toast';
import { Profile, Currency, getAllCurrencies } from '../types';
import LanguageSelector from '../../../components/LanguageSelector';
import CurrencySelector from '../../../components/CurrencySelector';

interface ExtendedProfile extends Profile {
  email?: string;
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

const ProfileForm: React.FC = () => {
  const { t, i18n } = useTranslation('profile');
  const isRTL = useMemo(() => i18n.language === 'ar', [i18n.language]);
  const { 
    profile, 
    isLoading, 
    error, 
    updateProfile, 
    setLanguage, 
    setCurrency, 
    setEstablishmentName,
    loadProfile 
  } = useProfileStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset
  } = useForm<ExtendedProfile>({
    defaultValues: {
      ...profile,
      email: 'user@example.com' // Valeur par défaut pour la démo
    }
  });

  const currentLanguage = watch('language');
  const newPassword = watch('newPassword');
  const availableCurrencies = useMemo(() => getAllCurrencies(), []);

  // Synchroniser les valeurs du formulaire avec le profil du store
  useEffect(() => {
    if (profile) {
      setValue('firstName', profile.firstName);
      setValue('lastName', profile.lastName);
      setValue('establishmentName', profile.establishmentName);
      setValue('address', profile.address);
      setValue('language', profile.language);
      setValue('currency', profile.currency);
    }
  }, [profile, setValue]);

  // Synchroniser la langue du formulaire avec i18n
  useEffect(() => {
    if (i18n.language !== currentLanguage) {
      setValue('language', i18n.language as Profile['language']);
      setLanguage(i18n.language as Profile['language']).catch(console.error);
    }
  }, [i18n.language, currentLanguage, setValue, setLanguage]);

  const { showToast } = useToastStore();

  const onSubmit = async (data: ExtendedProfile) => {
    setIsSubmitting(true);
    try {
      // Validation du changement de mot de passe
      if (isChangingPassword) {
        if (!data.currentPassword) {
          showToast('Veuillez saisir votre mot de passe actuel', 'error');
          setIsSubmitting(false);
          return;
        }
        if (!data.newPassword || data.newPassword.length < 8) {
          showToast('Le nouveau mot de passe doit contenir au moins 8 caractères', 'error');
          setIsSubmitting(false);
          return;
        }
        if (data.newPassword !== data.confirmPassword) {
          showToast('Les mots de passe ne correspondent pas', 'error');
          setIsSubmitting(false);
          return;
        }
      }

      await updateProfile({
        firstName: data.firstName,
        lastName: data.lastName,
        establishmentName: data.establishmentName,
        address: data.address,
        language: data.language,
        currency: data.currency
      });

      // Simuler la mise à jour de l'email et du mot de passe
      if (isChangingPassword) {
        showToast('Mot de passe mis à jour avec succès', 'success');
        setIsChangingPassword(false);
        // Réinitialiser les champs de mot de passe
        setValue('currentPassword', '');
        setValue('newPassword', '');
        setValue('confirmPassword', '');
      }

      showToast(t('success.save'), 'success');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      showToast(t('error.save') || 'Erreur lors de la sauvegarde', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLanguageChange = async (newLanguage: string) => {
    try {
      // Changer la langue dans i18n immédiatement pour l'interface
      i18n.changeLanguage(newLanguage);
      setValue('language', newLanguage as Profile['language']);
      
      // Mettre à jour le profil en arrière-plan sans notification
      await setLanguage(newLanguage as Profile['language']);
    } catch (error) {
      console.error('Erreur lors du changement de langue:', error);
      showToast(t('error.save') || 'Erreur lors du changement de langue', 'error');
    }
  };

  const handleCurrencyChange = async (currency: Currency) => {
    try {
      setValue('currency', currency);
      await setCurrency(currency);
      showToast('Devise mise à jour avec succès', 'success');
    } catch (error) {
      console.error('Erreur lors du changement de devise:', error);
      showToast('Erreur lors du changement de devise', 'error');
    }
  };

  const handleCopyLink = () => {
    if (profile.publicLink) {
      navigator.clipboard.writeText(profile.publicLink);
      setLinkCopied(true);
      showToast(t('publicLinkCopied'), 'success');
      setTimeout(() => setLinkCopied(false), 2000);
    }
  };

  // Afficher un message d'erreur si nécessaire
  useEffect(() => {
    if (error) {
      showToast(error, 'error');
    }
  }, [error, showToast]);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        
        {/* SECTION 1: Informations de connexion */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-xl">
              <EnvelopeIcon className="h-5 w-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
              Informations de connexion
            </h3>
          </div>
          
          <div className="space-y-6">
            {/* Email */}
            <div>
              <label className={`block text-sm font-medium text-gray-700 mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                <EnvelopeIcon className="h-4 w-4 inline mr-2 text-indigo-600" />
                Adresse email
              </label>
              <input
                type="email"
                {...register('email', { required: true, pattern: /^\S+@\S+\.\S+$/ })}
                className={`w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/70 backdrop-blur-sm shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 ${
                  isRTL ? 'text-right' : 'text-left'
                } ${errors.email ? 'ring-2 ring-red-300 focus:ring-red-500' : ''}`}
                dir={isRTL ? 'rtl' : 'ltr'}
                placeholder="votre@email.com"
              />
              {errors.email && (
                <p className={`mt-2 text-sm text-red-600 ${isRTL ? 'text-right' : 'text-left'}`}>
                  Veuillez saisir une adresse email valide
                </p>
              )}
            </div>

            {/* Changement de mot de passe */}
            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <LockClosedIcon className="h-4 w-4 text-indigo-600" />
                  <span className="text-sm font-medium text-gray-700">Mot de passe</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsChangingPassword(!isChangingPassword)}
                  className="text-sm text-indigo-600 hover:text-indigo-700 font-medium transition-colors duration-200"
                >
                  {isChangingPassword ? 'Annuler' : 'Changer le mot de passe'}
                </button>
              </div>

              {isChangingPassword && (
                <div className="space-y-4 bg-indigo-50/50 rounded-xl p-4">
                  {/* Mot de passe actuel */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mot de passe actuel
                    </label>
                    <div className="relative">
                      <input
                        type={showCurrentPassword ? 'text' : 'password'}
                        {...register('currentPassword')}
                        className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 bg-white/70 backdrop-blur-sm shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                      >
                        {showCurrentPassword ? (
                          <EyeSlashIcon className="h-5 w-5" />
                        ) : (
                          <EyeIcon className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Nouveau mot de passe */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nouveau mot de passe
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        {...register('newPassword')}
                        className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 bg-white/70 backdrop-blur-sm shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                      >
                        {showNewPassword ? (
                          <EyeSlashIcon className="h-5 w-5" />
                        ) : (
                          <EyeIcon className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Confirmer le mot de passe */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirmer le nouveau mot de passe
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        {...register('confirmPassword')}
                        className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 bg-white/70 backdrop-blur-sm shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPassword ? (
                          <EyeSlashIcon className="h-5 w-5" />
                        ) : (
                          <EyeIcon className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* SECTION 2: Informations personnelles */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl">
              <UserIcon className="h-5 w-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              Informations personnelles
            </h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={`block text-sm font-medium text-gray-700 mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                <UserIcon className="h-4 w-4 inline mr-2 text-blue-600" />
                {t('firstName')} *
              </label>
              <input
                type="text"
                {...register('firstName', { required: true })}
                className={`w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/70 backdrop-blur-sm shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                  isRTL ? 'text-right' : 'text-left'
                } ${errors.firstName ? 'ring-2 ring-red-300 focus:ring-red-500' : ''}`}
                dir={isRTL ? 'rtl' : 'ltr'}
                placeholder="Votre prénom"
              />
              {errors.firstName && (
                <p className={`mt-2 text-sm text-red-600 ${isRTL ? 'text-right' : 'text-left'}`}>
                  {t('form.required')}
                </p>
              )}
            </div>

            <div>
              <label className={`block text-sm font-medium text-gray-700 mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                <UserIcon className="h-4 w-4 inline mr-2 text-blue-600" />
                {t('lastName')} *
              </label>
              <input
                type="text"
                {...register('lastName', { required: true })}
                className={`w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/70 backdrop-blur-sm shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                  isRTL ? 'text-right' : 'text-left'
                } ${errors.lastName ? 'ring-2 ring-red-300 focus:ring-red-500' : ''}`}
                dir={isRTL ? 'rtl' : 'ltr'}
                placeholder="Votre nom"
              />
              {errors.lastName && (
                <p className={`mt-2 text-sm text-red-600 ${isRTL ? 'text-right' : 'text-left'}`}>
                  {t('form.required')}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* SECTION 3: Informations du salon */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-gradient-to-r from-cyan-500 to-teal-600 rounded-xl">
              <BuildingStorefrontIcon className="h-5 w-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold bg-gradient-to-r from-cyan-600 to-teal-600 bg-clip-text text-transparent">
              Informations du salon
            </h3>
          </div>
          
          <div className="space-y-6">
            <div>
              <label className={`block text-sm font-medium text-gray-700 mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                <BuildingStorefrontIcon className="h-4 w-4 inline mr-2 text-cyan-600" />
                {t('establishmentName')} *
              </label>
              <input
                type="text"
                {...register('establishmentName', { required: true })}
                className={`w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/70 backdrop-blur-sm shadow-sm focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-200 ${
                  isRTL ? 'text-right' : 'text-left'
                } ${errors.establishmentName ? 'ring-2 ring-red-300 focus:ring-red-500' : ''}`}
                dir={isRTL ? 'rtl' : 'ltr'}
                placeholder="Nom de votre salon"
              />
              {errors.establishmentName && (
                <p className={`mt-2 text-sm text-red-600 ${isRTL ? 'text-right' : 'text-left'}`}>
                  {t('form.required')}
                </p>
              )}
            </div>

            <div>
              <label className={`block text-sm font-medium text-gray-700 mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                <MapPinIcon className="h-4 w-4 inline mr-2 text-cyan-600" />
                {t('address')} *
              </label>
              <textarea
                {...register('address', { required: true })}
                rows={3}
                className={`w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/70 backdrop-blur-sm shadow-sm focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-200 ${
                  isRTL ? 'text-right' : 'text-left'
                } ${errors.address ? 'ring-2 ring-red-300 focus:ring-red-500' : ''}`}
                dir={isRTL ? 'rtl' : 'ltr'}
                placeholder="Adresse complète de votre salon"
              />
              {errors.address && (
                <p className={`mt-2 text-sm text-red-600 ${isRTL ? 'text-right' : 'text-left'}`}>
                  {t('form.required')}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* SECTION 4: Préférences */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl">
              <LanguageIcon className="h-5 w-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Préférences
            </h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={`block text-sm font-medium text-gray-700 mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                <LanguageIcon className="h-4 w-4 inline mr-2 text-purple-600" />
                {t('language')}
              </label>
              <div className="bg-white/50 p-3 rounded-xl border border-gray-200">
                <LanguageSelector
                  currentLanguage={currentLanguage}
                  onLanguageChange={handleLanguageChange}
                />
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium text-gray-700 mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                <CurrencyDollarIcon className="h-4 w-4 inline mr-2 text-purple-600" />
                {t('currency')}
              </label>
              <div className="bg-white/50 p-3 rounded-xl border border-gray-200">
                <CurrencySelector
                  value={typeof profile.currency === 'string' ? profile.currency : profile.currency?.code}
                  currencies={availableCurrencies}
                  onChange={handleCurrencyChange}
                />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 5: Lien public */}
        <div className="bg-gradient-to-r from-blue-50/80 to-indigo-50/80 backdrop-blur-xl rounded-2xl shadow-xl border border-blue-200/50 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl">
              <LinkIcon className="h-5 w-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Lien de réservation public
            </h3>
          </div>
          
          <div className="bg-white/70 p-4 rounded-xl border border-blue-200/50">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-700 mb-1">Votre lien de réservation</p>
                <div className="flex items-center space-x-2">
                  <code className="text-sm text-blue-600 font-mono bg-blue-50 px-3 py-2 rounded-lg">
                    {profile.publicLink || 'saloneo.tech/votre-salon'}
                  </code>
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    disabled={!profile.publicLink}
                    className={`p-2 rounded-lg transition-all duration-200 ${
                      linkCopied 
                        ? 'bg-green-100 text-green-600' 
                        : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {linkCopied ? (
                      <CheckCircleIcon className="h-4 w-4" />
                    ) : (
                      <ClipboardDocumentIcon className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
            <p className={`mt-2 text-sm text-gray-600 ${isRTL ? 'text-right' : 'text-left'}`}>
              Partagez ce lien avec vos clients pour qu'ils puissent prendre rendez-vous directement
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className={`flex ${isRTL ? 'justify-start' : 'justify-end'} pt-6`}>
          <button
            type="submit"
            disabled={isLoading || isSubmitting}
            className="bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none font-medium"
          >
            {isLoading || isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                {t('actions.saving') || 'Sauvegarde...'}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <CheckCircleIcon className="h-5 w-5" />
                {t('actions.save')}
              </div>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfileForm;
