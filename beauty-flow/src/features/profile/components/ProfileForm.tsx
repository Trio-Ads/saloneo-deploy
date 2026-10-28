import React, { useMemo, useEffect, useState } from 'react';
import { useForm, UseFormRegisterReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import {
  ArrowTopRightOnSquareIcon,
  CheckIcon,
  ClipboardDocumentIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';
import { useProfileStore } from '../store';
import { useToastStore } from '../../../components/Toast';
import { Profile, getAllCurrencies } from '../types';
import { AffiliationTab } from './affiliation';
import DepositsTab from './deposits/DepositsTab';
import { useAuthStore } from '../../auth/store';
import { profileAPI } from '../../../services/api';
import { Panel, IconButton, Segmented } from '../../../components/ui';

interface ExtendedProfile extends Profile {
  email?: string;
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

const LANGUAGES = [
  { code: 'fr', name: 'Français' },
  { code: 'ar', name: 'العربية' },
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español' },
  { code: 'pt', name: 'Português' },
  { code: 'tr', name: 'Türkçe' },
  { code: 'ber', name: 'Tamazight' }
];

const labelClass = 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5';
const errorClass = 'mt-1.5 text-xs text-red-600 dark:text-red-400';

// Settings row: title + description on the start side, fields on the end side (stacked on mobile).
const Section: React.FC<{ title: React.ReactNode; description?: React.ReactNode; children: React.ReactNode }> = ({ title, description, children }) => (
  <div className="grid gap-4 px-5 py-6 md:grid-cols-3 md:gap-8">
    <div>
      <h2 className="text-base font-semibold text-gray-900 dark:text-gray-50">{title}</h2>
      {description && <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{description}</p>}
    </div>
    <div className="space-y-4 md:col-span-2">{children}</div>
  </div>
);

const PasswordField: React.FC<{ label: string; registration: UseFormRegisterReturn; showLabel: string; hideLabel: string; error?: string }> = ({ label, registration, showLabel, hideLabel, error }) => {
  const [visible, setVisible] = useState(false);
  const errorId = `${registration.name}-error`;
  return (
    <div>
      <label className={labelClass} htmlFor={registration.name}>{label}</label>
      <div className="relative">
        <input
          id={registration.name}
          type={visible ? 'text' : 'password'}
          autoComplete={registration.name === 'currentPassword' ? 'current-password' : 'new-password'}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          {...registration}
          className={clsx('field pe-11', error && 'border-red-400')}
        />
        <IconButton label={visible ? hideLabel : showLabel} onClick={() => setVisible(!visible)} className="absolute inset-y-0 end-1 my-auto">
          {visible ? <EyeSlashIcon className="size-5" /> : <EyeIcon className="size-5" />}
        </IconButton>
      </div>
      {error && <p id={errorId} className={errorClass}>{error}</p>}
    </div>
  );
};

const ProfileForm: React.FC = () => {
  const { t, i18n } = useTranslation('profile');
  const {
    profile,
    isLoading,
    error,
    updateProfile,
    setLanguage,
    setCurrency,
    loadProfile
  } = useProfileStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  // ?tab=deposits: links from the deposit / payout emails
  const [activeTab, setActiveTab] = useState<'profile' | 'affiliation' | 'deposits'>(() =>
    new URLSearchParams(window.location.search).get('tab') === 'deposits' ? 'deposits' : 'profile');

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
    setError,
    clearErrors
  } = useForm<ExtendedProfile>({
    defaultValues: {
      ...profile,
      email: '' // Sera rempli dynamiquement depuis le store d'authentification
    }
  });

  const currentLanguage = watch('language');
  const showAsTeamMember = watch('showAsTeamMember');
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
    clearErrors(['currentPassword', 'newPassword', 'confirmPassword']);
    // Validation du changement de mot de passe (erreurs affichées sous le champ concerné)
    if (isChangingPassword) {
      if (!data.currentPassword) {
        setError('currentPassword', { message: t('profile_form.messages.password_required') }, { shouldFocus: true });
        return;
      }
      if (!data.newPassword || data.newPassword.length < 8) {
        setError('newPassword', { message: t('profile_form.messages.password_min_length') }, { shouldFocus: true });
        return;
      }
      if (data.newPassword !== data.confirmPassword) {
        setError('confirmPassword', { message: t('profile_form.messages.passwords_not_match') }, { shouldFocus: true });
        return;
      }
    }

    setIsSubmitting(true);
    try {
      // Mot de passe d'abord : s'il est refusé, rien n'est enregistré et l'erreur reste sous le champ.
      if (isChangingPassword) {
        try {
          await profileAPI.updatePassword({ currentPassword: data.currentPassword!, newPassword: data.newPassword! });
        } catch (err: any) {
          const status = err?.response?.status;
          setError(
            'currentPassword',
            { message: status === 400 ? t('profile_form.messages.current_password_incorrect') : (err?.response?.data?.error || t('error.save')) },
            { shouldFocus: true }
          );
          return;
        }
        showToast(t('profile_form.messages.password_updated'), 'success');
        setIsChangingPassword(false);
        // Réinitialiser les champs de mot de passe
        setValue('currentPassword', '');
        setValue('newPassword', '');
        setValue('confirmPassword', '');
      }

      await updateProfile({
        firstName: data.firstName,
        lastName: data.lastName,
        establishmentName: data.establishmentName,
        address: data.address,
        language: data.language,
        currency: data.currency
      });

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

  const handleCurrencyChange = async (code: string) => {
    const currency = availableCurrencies.find(c => c.code === code);
    try {
      // Ne mettre à jour que si la monnaie a vraiment changé
      if (!currency || profile.currency?.code === code) {
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

  const handleTeamMemberToggle = () => {
    const next = !showAsTeamMember;
    setValue('showAsTeamMember', next);
    updateProfile({ showAsTeamMember: next })
      .then(() => {
        showToast(t(next ? 'profile_form.messages.team_member_on' : 'profile_form.messages.team_member_off'), 'success');
        // Recharger le profil pour mettre à jour l'interface
        loadProfile();
      })
      .catch(() => {
        setValue('showAsTeamMember', !next);
        showToast(t('profile_form.messages.team_member_error'), 'error');
      });
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

  const currencyCode = typeof profile.currency === 'string' ? profile.currency : profile.currency?.code;

  return (
    <div>
      <Segmented
        className="mb-6"
        value={activeTab}
        onChange={setActiveTab}
        options={[
          { value: 'profile', label: t('profile_form.tabs.profile') },
          { value: 'deposits', label: t('profile_form.tabs.deposits') },
          { value: 'affiliation', label: t('profile_form.tabs.affiliation') }
        ]}
      />

      {activeTab === 'deposits' ? (
        <DepositsTab />
      ) : activeTab === 'affiliation' ? (
        <AffiliationTab />
      ) : (
        <form onSubmit={handleSubmit(onSubmit)}>
          <Panel flush bodyClassName="divide-y divide-gray-100 dark:divide-gray-800">
            <Section title={t('profile_form.sections.login_info')} description={t('profile_form.descriptions.login_info')}>
              <div>
                <label className={labelClass} htmlFor="email">{t('profile_form.fields.email')}</label>
                <input
                  id="email"
                  type="email"
                  readOnly
                  {...register('email')}
                  className="field bg-gray-50 text-gray-500 dark:bg-gray-800/60 dark:text-gray-400"
                />
              </div>

              <div className="flex items-center justify-between gap-4">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('profile_form.fields.password')}</span>
                <button type="button" onClick={() => setIsChangingPassword(!isChangingPassword)} className="btn-secondary">
                  {isChangingPassword ? t('profile_form.buttons.cancel') : t('profile_form.buttons.change_password')}
                </button>
              </div>

              {isChangingPassword && (
                <div className="space-y-4">
                  <PasswordField label={t('profile_form.fields.current_password')} registration={register('currentPassword')} error={errors.currentPassword?.message} showLabel={t('profile_form.buttons.show_password')} hideLabel={t('profile_form.buttons.hide_password')} />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <PasswordField label={t('profile_form.fields.new_password')} registration={register('newPassword')} error={errors.newPassword?.message} showLabel={t('profile_form.buttons.show_password')} hideLabel={t('profile_form.buttons.hide_password')} />
                    <PasswordField label={t('profile_form.fields.confirm_password')} registration={register('confirmPassword')} error={errors.confirmPassword?.message} showLabel={t('profile_form.buttons.show_password')} hideLabel={t('profile_form.buttons.hide_password')} />
                  </div>
                  {!errors.newPassword && <p className="text-xs text-gray-500 dark:text-gray-400">{t('profile_form.messages.password_min_length')}</p>}
                </div>
              )}
            </Section>

            <Section title={t('profile_form.sections.personal_info')} description={t('profile_form.descriptions.personal_info')}>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelClass} htmlFor="firstName">{t('firstName')}</label>
                  <input id="firstName" type="text" autoComplete="given-name" {...register('firstName', { required: true })} className={clsx('field', errors.firstName && 'border-red-400')} placeholder={t('profile_form.placeholders.first_name')} />
                  {errors.firstName && <p className={errorClass}>{t('form.required')}</p>}
                </div>
                <div>
                  <label className={labelClass} htmlFor="lastName">{t('lastName')}</label>
                  <input id="lastName" type="text" autoComplete="family-name" {...register('lastName', { required: true })} className={clsx('field', errors.lastName && 'border-red-400')} placeholder={t('profile_form.placeholders.last_name')} />
                  {errors.lastName && <p className={errorClass}>{t('form.required')}</p>}
                </div>
              </div>
            </Section>

            <Section title={t('profile_form.sections.salon_info')} description={t('profile_form.descriptions.salon_info')}>
              <div>
                <label className={labelClass} htmlFor="establishmentName">{t('establishmentName')}</label>
                <input id="establishmentName" type="text" autoComplete="organization" {...register('establishmentName', { required: true })} className={clsx('field', errors.establishmentName && 'border-red-400')} placeholder={t('profile_form.placeholders.establishment_name')} />
                {errors.establishmentName && <p className={errorClass}>{t('form.required')}</p>}
              </div>
              <div>
                <label className={labelClass} htmlFor="address">{t('profile_form.fields.full_address')}</label>
                <textarea id="address" rows={2} autoComplete="street-address" {...register('address', { required: true })} className={clsx('field resize-y', errors.address && 'border-red-400')} placeholder={t('profile_form.placeholders.address')} />
                {errors.address && <p className={errorClass}>{t('form.required')}</p>}
              </div>
            </Section>

            <Section title={t('profile_form.sections.preferences')} description={t('profile_form.descriptions.preferences')}>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelClass} htmlFor="language">{t('language')}</label>
                  <select id="language" value={i18n.language} onChange={(e) => handleLanguageChange(e.target.value)} className="field">
                    {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass} htmlFor="currency">{t('currency')}</label>
                  <select id="currency" value={currencyCode} onChange={(e) => handleCurrencyChange(e.target.value)} className="field">
                    {availableCurrencies.map(c => <option key={c.code} value={c.code}>{t(`currencies.${c.code}`)} ({c.symbol})</option>)}
                  </select>
                </div>
              </div>

              <div className="flex items-start justify-between gap-4 pt-2">
                <div>
                  <p id="team-member-label" className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('profile_form.fields.show_as_team_member')}</p>
                  <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">{t('profile_form.messages.show_as_team_member_description')}</p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={!!showAsTeamMember}
                  aria-labelledby="team-member-label"
                  onClick={handleTeamMemberToggle}
                  className={clsx(
                    'relative mt-0.5 inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900',
                    showAsTeamMember ? 'bg-orange-500' : 'bg-gray-200 dark:bg-gray-700'
                  )}
                >
                  <span className={clsx('inline-block size-5 rounded-full bg-white shadow-sm transition-transform duration-150 ease-out', showAsTeamMember ? 'translate-x-[22px] rtl:-translate-x-[22px]' : 'translate-x-0.5 rtl:-translate-x-0.5')} />
                </button>
              </div>
            </Section>

            <Section title={t('profile_form.sections.public_link')} description={t('profile_form.messages.public_link_description')}>
              <div>
                <label className={labelClass} htmlFor="publicLink">{t('profile_form.messages.public_link_label')}</label>
                <div className="flex items-center gap-2">
                  <input id="publicLink" readOnly value={profile.publicLink || ''} placeholder={t('profile_form.placeholders.demo_link')} dir="ltr" onFocus={(e) => e.target.select()} className="field min-w-0 flex-1 text-gray-700 dark:text-gray-300" />
                  <IconButton label={t('actions.copy')} onClick={handleCopyLink} disabled={!profile.publicLink} className="size-10 shrink-0 border border-gray-200 dark:border-gray-700 disabled:opacity-50">
                    {linkCopied ? <CheckIcon className="size-5 text-emerald-600" /> : <ClipboardDocumentIcon className="size-5" />}
                  </IconButton>
                  {profile.publicLink && (
                    <a href={profile.publicLink} target="_blank" rel="noopener noreferrer" className="btn-secondary shrink-0">
                      <ArrowTopRightOnSquareIcon className="size-4" />
                      <span className="hidden sm:inline">{t('profile_form.buttons.open')}</span>
                    </a>
                  )}
                </div>
              </div>
            </Section>

            <div className="flex justify-end px-5 py-4">
              <button type="submit" disabled={isLoading || isSubmitting} className="btn-primary w-full sm:w-auto">
                {isSubmitting ? t('actions.saving') : t('actions.save')}
              </button>
            </div>
          </Panel>
        </form>
      )}
    </div>
  );
};

export default ProfileForm;
