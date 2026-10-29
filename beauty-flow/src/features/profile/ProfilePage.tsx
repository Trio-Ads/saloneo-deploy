import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ProfileForm from './components/ProfileForm';
import { useProfileStore } from './store';
import { PageHeader } from '../../components/ui';
import AppPanel from '../pwa/AppPanel';
import DeleteAccountPanel from '../auth/components/DeleteAccountPanel';

const ProfilePage: React.FC = () => {
  const { t } = useTranslation('profile');
  const { loadProfile } = useProfileStore();
  // Only the first load blocks the page: saving/toggling also flips the store's isLoading,
  // and unmounting the form then would throw away unsaved edits.
  const [ready, setReady] = useState(false);

  // Charger le profil au montage du composant
  useEffect(() => {
    loadProfile().finally(() => setReady(true));
  }, [loadProfile]);

  return (
    <div className="py-6 sm:py-8">
      <PageHeader title={t('my_profile')} subtitle={t('profile_page.subtitle')} />
      {ready ? (
        <>
          <ProfileForm />
          <AppPanel audience="owner" className="mt-6" />
          <DeleteAccountPanel audience="owner" className="mt-6" />
        </>
      ) : (
        <div className="flex items-center justify-center gap-3 py-16 text-sm text-gray-500 dark:text-gray-400">
          <span className="size-5 rounded-full border-2 border-orange-500 border-t-transparent animate-spin" />
          {t('profile_page.loading')}
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
