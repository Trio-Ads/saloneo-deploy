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
  EyeSlashIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import { useProfileStore, generatePublicLink } from '../store';
import { useToastStore } from '../../../components/Toast';
import { Profile, Currency, getAllCurrencies } from '../types';
import LanguageSelector from '../../../components/LanguageSelector';
import CurrencySelector from '../../../components/CurrencySelector';
import { AffiliationTab } from './affiliation';
import { useAuthStore } from '../../auth/store';

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
  const [activeTab, setActiveTab] = useState<'profile' | 'affiliation'>('profile');
  
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
      email: '' // Sera rempli dynamiquement depuis le store d'authentification
    }
  });

  const currentLanguage = watch('language');
  const newPassword = watch('newPassword');
  const availableCurrencies = useMemo(() => getAllCurrencies(), []);
  const { user } = useAuthStore();

  // Récupérer l'email de l'utilisateur depuis le store d'authentification
  useEffect(() => {
    if (user?.email) {
      setValue('email', user.email);
    }
  }, [user, setValue]);

  // Synchroniser les valeurs du formulaire avec le profil du store (une seule fois au chargement)
  useEffect(() => {
    if (profile && !watch('firstName')) {
      // Ne synchroniser que si les champs sont vides (premier chargement)
      reset({
        firstName: profile.firstName,
        lastName: profile.lastName,
        establishmentName: profile.establishmentName,
        address: profile.address,
        language: profile.language,
        currency: profile.currency,
        showAsTeamMember: profile.showAsTeamMember,
        email: user?.email || ''
      });
    }
  }, [profile, reset, user, watch]);

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
          showToast(t('profile_form.messages.password_required'), 'error');
          setIsSubmitting(false);
          return;
        }
        if (!data.newPassword || data.newPassword.length < 8) {
          showToast(t('profile_form.messages.password_min_length'), 'error');
          setIsSubmitting(false);
          return;
        }
        if (data.newPassword !== data.confirmPassword) {
          showToast(t('profile_form.messages.passwords_not_match'), 'error');
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
        showToast(t('profile_form.messages.password_updated'), 'success');
        setIsChangingPassword(false);
        // Réinitialiser les champs de mot de passe
        setValue('currentPassword', '');
        setValue('newPassword', '');
        setValue('confirmPassword', '');
      }

      showToast(t('success.save'), 'success');
    } catch (error) {
      console.error('Error saving profile:', error);
      showToast(t('error.save'), 'error');
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
      console.error('Error changing language:', error);
      showToast(t('profile_form.messages.language_error'), 'error');
    }
  };

  const handleCurrencyChange = async (currency: Currency) => {
    try {
      // Ne mettre à jour que si la monnaie a vraiment changé
      if (profile.currency === currency) {
        return;
      }
      setValue('currency', currency);
      await setCurrency(currency);
      showToast(t('profile_form.messages.currency_updated'), 'success');
    } catch (error) {
      console.error('Error changing currency:', error);
      showToast(t('profile_form.messages.currency_error'), 'error');
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
    <div className="max-w-5xl mx-auto">
      {/* Onglets */}
      <div className="bg-white dark:bg-gray-800 rounded-t-xl shadow-sm border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8 px-6" aria-label="Tabs">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`
              flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm
              transition-colors duration-200
              ${activeTab === 'profile'
                ? 'border-orange-500 text-orange-600 dark:text-orange-500'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
              }
            `}
          >
            <UserIcon className="h-5 w-5" />
            <span>{t('profile_form.tabs.profile')}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('affiliation')}
            className={`
              flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm
              transition-colors duration-200
              ${activeTab === 'affiliation'
                ? 'border-orange-500 text-orange-600 dark:text-orange-500'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
              }
            `}
          >
            <UserGroupIcon className="h-5 w-5" />
            <span>{t('profile_form.tabs.affiliation')}</span>
          </button>
        </nav>
      </div>

      {/* Contenu des onglets */}
      <div className="bg-white dark:bg-gray-800 rounded-b-xl shadow-sm p-6">
        {activeTab === 'profile' ? (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        
        {/* SECTION 1: Informations de connexion */}
        <div className="bg-white/80 dark:bg-gray-800/70 backdrop-blur-xl rounded-2xl shadow-xl border border-orange-500/20 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl shadow-orange-lg">
              <EnvelopeIcon className="h-5 w-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
              {t('profile_form.sections.login_info')}
            </h3>
          </div>
          
          <div className="space-y-6">
            {/* Email */}
            <div>
              <label className={`block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                <EnvelopeIcon className="h-4 w-4 inline mr-2 text-orange-600 dark:text-orange-500" />
                {t('profile_form.fields.email')}
              </label>
              <input
                type="email"
                {...register('email', { required: true, pattern: /^\S+@\S+\.\S+$/ })}
                className={`w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white/70 dark:bg-gray-700 dark:text-gray-100 backdrop-blur-sm shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 ${
                  isRTL ? 'text-right' : 'text-left'
                } ${errors.email ? 'ring-2 ring-red-300 focus:ring-red-500' : ''}`}
                dir={isRTL ? 'rtl' : 'ltr'}
                placeholder={t('profile_form.placeholders.email')}
              />
              {errors.email && (
                <p className={`mt-2 text-sm text-red-600 ${isRTL ? 'text-right' : 'text-left'}`}>
                  {t('profile_form.messages.email_validation')}
                </p>
              )}
            </div>

            {/* Changement de mot de passe */}
            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <LockClosedIcon className="h-4 w-4 text-orange-600 dark:text-orange-500" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('security.current_password')}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsChangingPassword(!isChangingPassword)}
                  className="text-sm text-orange-600 dark:text-orange-500 hover:text-orange-700 dark:hover:text-orange-400 font-medium transition-colors duration-200"
                >
                  {isChangingPassword ? t('profile_form.buttons.cancel') : t('profile_form.buttons.change_password')}
                </button>
              </div>

              {isChangingPassword && (
                <div className="space-y-4 bg-orange-50/50 dark:bg-orange-900/20 rounded-xl p-4 border border-orange-200 dark:border-orange-700">
                  {/* Mot de passe actuel */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('profile_form.fields.current_password')}
                    </label>
                    <div className="relative">
                      <input
                        type={showCurrentPassword ? 'text' : 'password'}
                        {...register('currentPassword')}
                        className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 dark:border-gray-600 bg-white/70 dark:bg-gray-700 dark:text-gray-100 backdrop-blur-sm shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
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
                      {t('profile_form.fields.new_password')}
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
                      {t('profile_form.fields.confirm_password')}
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
        <div className="bg-white/80 dark:bg-gray-800/70 backdrop-blur-xl rounded-2xl shadow-xl border border-orange-500/20 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl shadow-orange-lg">
              <UserIcon className="h-5 w-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
              {t('profile_form.sections.personal_info')}
            </h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={`block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                <UserIcon className="h-4 w-4 inline mr-2 text-orange-600 dark:text-orange-500" />
                {t('firstName')} *
              </label>
              <input
                type="text"
                {...register('firstName', { required: true })}
                className={`w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white/70 dark:bg-gray-700 dark:text-gray-100 backdrop-blur-sm shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 ${
                  isRTL ? 'text-right' : 'text-left'
                } ${errors.firstName ? 'ring-2 ring-red-300 focus:ring-red-500' : ''}`}
                dir={isRTL ? 'rtl' : 'ltr'}
                placeholder={t('profile_form.placeholders.first_name')}
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
                placeholder={t('profile_form.placeholders.last_name')}
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
        <div className="bg-white/80 dark:bg-gray-800/70 backdrop-blur-xl rounded-2xl shadow-xl border border-orange-500/20 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl shadow-orange-lg">
              <BuildingStorefrontIcon className="h-5 w-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
              {t('profile_form.sections.salon_info')}
            </h3>
          </div>
          
          <div className="space-y-6">
            <div>
              <label className={`block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                <BuildingStorefrontIcon className="h-4 w-4 inline mr-2 text-orange-600 dark:text-orange-500" />
                {t('establishmentName')} *
              </label>
              <input
                type="text"
                {...register('establishmentName', { required: true })}
                className={`w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white/70 dark:bg-gray-700 dark:text-gray-100 backdrop-blur-sm shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 ${
                  isRTL ? 'text-right' : 'text-left'
                } ${errors.establishmentName ? 'ring-2 ring-red-300 focus:ring-red-500' : ''}`}
                dir={isRTL ? 'rtl' : 'ltr'}
                placeholder={t('profile_form.placeholders.establishment_name')}
              />
              {errors.establishmentName && (
                <p className={`mt-2 text-sm text-red-600 ${isRTL ? 'text-right' : 'text-left'}`}>
                  {t('form.required')}
                </p>
              )}
            </div>

            <div>
              <label className={`block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                <MapPinIcon className="h-4 w-4 inline mr-2 text-orange-600 dark:text-orange-500" />
                {t('address')} *
              </label>
              <textarea
                {...register('address', { required: true })}
                rows={3}
                className={`w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/70 backdrop-blur-sm shadow-sm focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-200 ${
                  isRTL ? 'text-right' : 'text-left'
                } ${errors.address ? 'ring-2 ring-red-300 focus:ring-red-500' : ''}`}
                dir={isRTL ? 'rtl' : 'ltr'}
                placeholder={t('profile_form.placeholders.address')}
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
        <div className="bg-white/80 dark:bg-gray-800/70 backdrop-blur-xl rounded-2xl shadow-xl border border-orange-500/20 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl shadow-orange-lg">
              <LanguageIcon className="h-5 w-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
              {t('profile_form.sections.preferences')}
            </h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={`block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                <LanguageIcon className="h-4 w-4 inline mr-2 text-orange-600 dark:text-orange-500" />
                {t('language')}
              </label>
              <div className="bg-white/50 p-3 rounded-xl border border-gray-200">
                <LanguageSelector />
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                <CurrencyDollarIcon className="h-4 w-4 inline mr-2 text-orange-600 dark:text-orange-500" />
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
          
          <div className="mt-6 border-t border-gray-200 pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <UserGroupIcon className="h-5 w-5 text-orange-600 dark:text-orange-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('profile_form.fields.show_as_team_member', 'Apparaître comme membre de l\'équipe')}
                </span>
              </div>
            </div>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              {t('profile_form.messages.show_as_team_member_description', 'Activez cette option pour apparaître comme membre de l\'équipe dans les réservations et sur la page publique de votre salon.')}
            </p>
            
            <div className="mt-4 flex flex-col space-y-4">
              <div className="flex items-center">
                <span className="mr-3 text-sm font-medium text-gray-700 dark:text-gray-300">État actuel:</span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${watch('showAsTeamMember') ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                  {watch('showAsTeamMember') ? 'Activé' : 'Désactivé'}
                </span>
              </div>
              
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setValue('showAsTeamMember', true);
                    updateProfile({
                      showAsTeamMember: true
                    }).then(() => {
                      showToast('Vous apparaissez maintenant comme membre de l\'équipe', 'success');
                      // Recharger le profil pour mettre à jour l'interface
                      loadProfile().then(() => {
                        console.log('Profil rechargé après activation');
                      });
                    }).catch(error => {
                      showToast('Erreur lors de l\'activation', 'error');
                    });
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-lg shadow-orange-md hover:shadow-orange-lg transition-all duration-200"
                >
                  Activer
                </button>
                
                <button
                  type="button"
                  onClick={() => {
                    setValue('showAsTeamMember', false);
                    updateProfile({
                      showAsTeamMember: false
                    }).then(() => {
                      showToast('Option désactivée', 'success');
                      // Recharger le profil pour mettre à jour l'interface
                      loadProfile().then(() => {
                        console.log('Profil rechargé après désactivation');
                      });
                    }).catch(error => {
                      showToast('Erreur lors de la désactivation', 'error');
                    });
                  }}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200"
                >
                  Désactiver
                </button>
              </div>
            </div>
            
            {watch('showAsTeamMember') && (
              <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
                <p className="text-sm text-green-700 dark:text-green-300 flex items-center">
                  <CheckCircleIcon className="h-4 w-4 mr-2" />
                  Option activée ! Vous apparaîtrez maintenant comme membre de l'équipe.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* SECTION 5: Lien public */}
        <div className="bg-gradient-to-r from-orange-50/80 to-orange-100/80 dark:from-orange-900/20 dark:to-orange-800/20 backdrop-blur-xl rounded-2xl shadow-xl border border-orange-200/50 dark:border-orange-700/50 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl shadow-orange-lg">
              <LinkIcon className="h-5 w-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
              {t('profile_form.sections.public_link')}
            </h3>
          </div>
          
          <div className="bg-white/70 dark:bg-gray-800/70 p-4 rounded-xl border border-orange-200/50 dark:border-orange-700/50">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('profile_form.messages.public_link_label')}</p>
                <div className="flex items-center space-x-2">
                  <code className="text-sm text-orange-600 dark:text-orange-400 font-mono bg-orange-50 dark:bg-orange-900/20 px-3 py-2 rounded-lg">
                    {profile.publicLink || t('profile_form.placeholders.demo_link')}
                  </code>
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    disabled={!profile.publicLink}
                    className={`p-2 rounded-lg transition-all duration-200 ${
                      linkCopied 
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' 
                        : 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 hover:bg-orange-200 dark:hover:bg-orange-900/50'
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
              {t('profile_form.messages.public_link_description')}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className={`flex ${isRTL ? 'justify-start' : 'justify-end'} pt-6`}>
          <button
            type="submit"
            disabled={isLoading || isSubmitting}
            className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-8 py-3 rounded-xl shadow-orange-lg hover:shadow-orange-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none font-medium"
          >
            {isLoading || isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                {t('actions.saving')}
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
      ) : (
        <AffiliationTab />
      )}
    </div>
  </div>
  );
};

export default ProfileForm;
