import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Profile, Language, Currency, CURRENCIES } from './types';
import { profileAPI } from '../../services/api';
import { generateSalonSlug } from '../../utils/slugify';

interface ProfileStore {
  profile: Profile;
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;
  lastUpdateTimestamp: number;
  loadProfile: () => Promise<void>;
  updateProfile: (profile: Partial<Profile>) => Promise<void>;
  setLanguage: (language: Language) => Promise<void>;
  setCurrency: (currency: Currency) => Promise<void>;
  setEstablishmentName: (name: string) => Promise<void>;
  syncWithBackend: () => Promise<void>;
}

const defaultCurrency = CURRENCIES.EUR;

export const generatePublicLink = (name: string): string => {
  if (!name) return '';
  // Utiliser le système de slug local au lieu de saloneo.tech
  const slug = generateSalonSlug(name);
  return `${window.location.origin}/salon/${slug}`;
};

// Profil par défaut
const getDefaultProfile = (): Profile => ({
  firstName: '',
  lastName: '',
  establishmentName: '',
  address: '',
  language: 'fr',
  currency: defaultCurrency,
  publicLink: ''
});

const useProfileStore = create<ProfileStore>()(
  persist(
    (set, get) => ({
      profile: getDefaultProfile(),
      isLoading: false,
      error: null,
      isInitialized: false,
      lastUpdateTimestamp: 0,

      loadProfile: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await profileAPI.get();
          const userData = response.data.user || response.data;
          
          // Vérifier que userData existe
          if (!userData) {
            console.warn('⚠️ Aucune donnée utilisateur reçue du backend');
            set({ 
              isLoading: false, 
              isInitialized: true,
              error: 'Aucune donnée utilisateur trouvée'
            });
            return;
          }
          
          // Mapper les données du backend vers le format du frontend
          const profile: Profile = {
            firstName: userData.firstName || '',
            lastName: userData.lastName || '',
            establishmentName: userData.establishmentName || '',
            address: userData.address || '',
            language: userData.settings?.language || 'fr',
            currency: typeof userData.settings?.currency === 'string' 
              ? CURRENCIES[userData.settings.currency] || defaultCurrency
              : userData.settings?.currency || defaultCurrency,
            publicLink: generatePublicLink(userData.establishmentName || '')
          };

          set({ 
            profile, 
            isLoading: false, 
            isInitialized: true,
            lastUpdateTimestamp: Date.now()
          });
        } catch (error: any) {
          console.error('Erreur lors du chargement du profil:', error);
          set({ 
            error: error.response?.data?.error || 'Erreur lors du chargement du profil',
            isLoading: false,
            isInitialized: true
          });
        }
      },

      updateProfile: async (profileData) => {
        set({ isLoading: true, error: null });
        try {
          console.log('🔄 Mise à jour du profil avec:', profileData);
          
          // Préparer les données pour l'API backend
          const backendData: any = {};
          
          if (profileData.firstName !== undefined) backendData.firstName = profileData.firstName;
          if (profileData.lastName !== undefined) backendData.lastName = profileData.lastName;
          if (profileData.establishmentName !== undefined) backendData.establishmentName = profileData.establishmentName;
          if (profileData.address !== undefined) backendData.address = profileData.address;
          
          // Gérer les settings séparément
          if (profileData.language !== undefined || profileData.currency !== undefined) {
            backendData.settings = {};
            if (profileData.language !== undefined) backendData.settings.language = profileData.language;
            if (profileData.currency !== undefined) {
              // Envoyer seulement le code de la devise au backend
              backendData.settings.currency = typeof profileData.currency === 'string' 
                ? profileData.currency 
                : profileData.currency.code;
            }
          }

          console.log('📤 Données envoyées au backend:', backendData);
          
          const response = await profileAPI.update(backendData);
          const userData = response.data.user;
          
          console.log('📥 Réponse du backend:', userData);

          // Mettre à jour le profil local avec les données du backend
          const updatedProfile: Profile = {
            firstName: userData.firstName || '',
            lastName: userData.lastName || '',
            establishmentName: userData.establishmentName || '',
            address: userData.address || '',
            language: userData.settings?.language || 'fr',
            currency: typeof userData.settings?.currency === 'string' 
              ? CURRENCIES[userData.settings.currency] || defaultCurrency
              : userData.settings?.currency || defaultCurrency,
            publicLink: generatePublicLink(userData.establishmentName || '')
          };

          console.log('✅ Profil mis à jour localement:', updatedProfile);
          
          set({ 
            profile: updatedProfile, 
            isLoading: false,
            lastUpdateTimestamp: Date.now()
          });
        } catch (error: any) {
          console.error('❌ Erreur lors de la mise à jour du profil:', error);
          set({ 
            error: error.response?.data?.error || 'Erreur lors de la mise à jour du profil',
            isLoading: false 
          });
          throw error;
        }
      },

      setLanguage: async (language) => {
        // Mise à jour silencieuse de la langue (sans notification)
        set({ isLoading: true, error: null });
        try {
          const backendData = {
            settings: {
              language: language
            }
          };

          console.log('🔄 Mise à jour silencieuse de la langue:', language);
          
          const response = await profileAPI.update(backendData);
          const userData = response.data.user;
          
          // Mettre à jour le profil local
          const currentProfile = get().profile;
          const updatedProfile: Profile = {
            ...currentProfile,
            language: userData.settings?.language || language,
            currency: typeof userData.settings?.currency === 'string' 
              ? CURRENCIES[userData.settings.currency] || defaultCurrency
              : userData.settings?.currency || currentProfile.currency,
          };

          set({ profile: updatedProfile, isLoading: false });
        } catch (error: any) {
          console.error('❌ Erreur lors de la mise à jour de la langue:', error);
          set({ 
            error: error.response?.data?.error || 'Erreur lors de la mise à jour de la langue',
            isLoading: false 
          });
          throw error;
        }
      },

      setCurrency: async (currency) => {
        // Mise à jour de la devise avec notification
        await get().updateProfile({ currency });
      },

      setEstablishmentName: async (name) => {
        await get().updateProfile({ establishmentName: name });
      },

      syncWithBackend: async () => {
        try {
          await get().loadProfile();
        } catch (error) {
          console.error('Erreur lors de la synchronisation:', error);
        }
      }
    }),
    {
      name: 'beauty-flow-profile',
      storage: createJSONStorage(() => localStorage),
      version: 1,
      onRehydrateStorage: () => (state) => {
        if (state) {
          console.log('🔄 Rehydrating profile store...');
          // Ne charger le profil que si ce n'est pas déjà initialisé
          // ou si la dernière mise à jour date de plus de 5 minutes
          const now = Date.now();
          const fiveMinutes = 5 * 60 * 1000;
          const shouldReload = !state.isInitialized || 
            (now - state.lastUpdateTimestamp) > fiveMinutes;
          
          if (shouldReload) {
            console.log('📥 Chargement du profil depuis le backend...');
            state.loadProfile().catch(console.error);
          } else {
            console.log('✅ Profil déjà à jour, pas de rechargement nécessaire');
          }
        }
      },
    }
  )
);

export { useProfileStore };
