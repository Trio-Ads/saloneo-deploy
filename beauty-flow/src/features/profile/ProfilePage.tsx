import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { UserIcon } from '@heroicons/react/24/outline';
import ProfileForm from './components/ProfileForm';
import { useProfileStore } from './store';

const ProfilePage: React.FC = () => {
  const { t } = useTranslation('profile');
  const { loadProfile, isLoading } = useProfileStore();

  // Charger le profil au montage du composant
  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50 to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* HERO HEADER - Loading */}
          <div className="relative mb-12">
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/20 p-8 overflow-hidden">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
                <div className="flex items-center space-x-6">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl blur-lg opacity-30 animate-pulse"></div>
                    <div className="relative bg-gradient-to-r from-orange-500 to-orange-600 p-4 rounded-2xl shadow-xl">
                      <UserIcon className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
                      Mon Profil
                    </h1>
                    <p className="text-gray-600 dark:text-gray-300 mt-2 text-lg">Chargement de vos informations...</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Loading Content */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/20 p-6 min-h-[600px]">
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 border-2 border-orange-600 dark:border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-gray-700 dark:text-gray-300">Chargement du profil...</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50 to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* HERO HEADER - Design spectaculaire */}
        <div className="relative mb-12">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/20 p-8 overflow-hidden">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
              
              {/* Titre avec icône spectaculaire */}
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl blur-lg opacity-30 animate-pulse"></div>
                  <div className="relative bg-gradient-to-r from-orange-500 to-orange-600 p-4 rounded-2xl shadow-xl transform hover:scale-110 transition-all duration-300">
                    <UserIcon className="h-8 w-8 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
                    Mon Profil
                  </h1>
                  <p className="text-gray-600 dark:text-gray-300 mt-2 text-lg">Gérez vos informations personnelles et les paramètres de votre salon</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CONTENU PRINCIPAL */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/20 p-6 min-h-[600px]">
          <div className="animate-fadeIn">
            <ProfileForm />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
