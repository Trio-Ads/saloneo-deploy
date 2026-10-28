import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { InterfaceSettings, ServiceDisplaySettings } from './types';
import { fileService } from '../../services/fileService';
import api from '../../services/api';
import { DesignTemplate } from '../templates/types';
import { generateSalonSlug } from '../../utils/slugify';
import { useProfileStore } from '../profile/store';

interface InterfaceStore {
  settings: InterfaceSettings;
  serviceSettings: ServiceDisplaySettings[];
  selectedTemplateId: string | null;
  isLoading: boolean;
  isSaving: boolean;
  checkImages: () => void;
  updateSettings: (settings: Partial<InterfaceSettings>) => void;
  updateServiceSettings: (serviceId: string, settings: Partial<ServiceDisplaySettings>) => void;
  initializeServiceSettings: (serviceId: string) => void;
  saveSettings: () => Promise<void>;
  loadSettings: () => Promise<void>;
  uploadLogo: (file: File) => Promise<void>;
  uploadBanner: (file: File) => Promise<void>;
  applyTemplate: (template: DesignTemplate) => void;
}

const defaultSettings: InterfaceSettings = {
  colors: {
    primary: '#6366F1',
    secondary: '#14B8A6',
    accent: '#F59E0B',
    background: '#FFFFFF'
  },
  logo: {
    url: '',
    alt: 'Logo du salon'
  },
  banner: {
    url: '',
    alt: 'Bannière du salon'
  },
  presentation: 'Bienvenue dans notre salon de beauté',
  salonSlug: generateSalonSlug('Bienvenue dans notre salon de beauté'),
  serviceDisplay: {
    defaultView: 'category',
    priceDisplay: 'fixed'
  },
  showTeamOnPublicPage: true
};

const defaultServiceSettings: Omit<ServiceDisplaySettings, 'id'> = {
  isOnline: false,
  minimumBookingTime: 24,
  displayOrder: 0,
  images: []
};

export const useInterfaceStore = create<InterfaceStore>()(
  persist(
    (set, get) => ({
      settings: defaultSettings,
      serviceSettings: [],
      selectedTemplateId: null,
      isLoading: false,
      isSaving: false,

      checkImages: () => {
        const state = get();
        const { settings, serviceSettings } = state;

        // Vérifier le logo et la bannière
        if (settings.logo.url && !localStorage.getItem(settings.logo.url)) {
          set((state) => ({
            settings: {
              ...state.settings,
              logo: { ...defaultSettings.logo }
            }
          }));
        }
        if (settings.banner.url && !localStorage.getItem(settings.banner.url)) {
          set((state) => ({
            settings: {
              ...state.settings,
              banner: { ...defaultSettings.banner }
            }
          }));
        }

        // Vérifier les images des services
        const updatedServiceSettings = serviceSettings.map(setting => {
          const validImages = setting.images.filter(img => 
            localStorage.getItem(img.url)
          );
          return {
            ...setting,
            images: validImages
          };
        });

        set({ serviceSettings: updatedServiceSettings });
      },

      updateSettings: (newSettings: Partial<InterfaceSettings>) => {
        set((state) => {
          const updatedSettings = {
            ...state.settings,
            ...newSettings,
            colors: {
              ...state.settings.colors,
              ...(newSettings.colors || {})
            },
            serviceDisplay: {
              ...state.settings.serviceDisplay,
              ...(newSettings.serviceDisplay || {})
            }
          };

          // Mettre à jour automatiquement le slug si la présentation change
          if (newSettings.presentation && newSettings.presentation !== state.settings.presentation) {
            updatedSettings.salonSlug = generateSalonSlug(newSettings.presentation);
          }

          return { settings: updatedSettings };
        });
        get().checkImages();
      },

      updateServiceSettings: (serviceId: string, newSettings: Partial<ServiceDisplaySettings>) =>
        set((state) => ({
          serviceSettings: state.serviceSettings.map((settings) =>
            settings.id === serviceId
              ? { ...settings, ...newSettings }
              : settings
          )
        })),

      initializeServiceSettings: (serviceId: string) =>
        set((state) => {
          if (state.serviceSettings.some(settings => settings.id === serviceId)) {
            return state;
          }
          return {
            serviceSettings: [
              ...state.serviceSettings,
              {
                id: serviceId,
                ...defaultServiceSettings
              }
            ]
          };
        }),

      // Sauvegarder les paramètres dans le backend
      saveSettings: async () => {
        const state = get();
        set({ isSaving: true });
        
        let profileSaved = false;
        let serviceErrors: string[] = [];
        
        try {
          // 1. Sauvegarder les paramètres d'interface dans le profil utilisateur (PRIORITÉ)
          console.log('🔄 Sauvegarde du profil avec showTeamOnPublicPage:', state.settings.showTeamOnPublicPage);
          await api.put('/profile', {
            theme: state.settings.colors,
            logo: state.settings.logo.url,
            banner: state.settings.banner.url,
            presentation: state.settings.presentation,
            publicPhone: state.settings.publicPhone,
            serviceDisplay: state.settings.serviceDisplay,
            showTeamOnPublicPage: state.settings.showTeamOnPublicPage
          });
          profileSaved = true;
          console.log('✅ Profil sauvegardé avec succès');

          // Note: Les paramètres de services sont gérés directement dans la page Services
          // Ici on ne sauvegarde que les paramètres d'interface du profil
          
          console.log('🎉 Paramètres d\'interface sauvegardés avec succès');

        } catch (error: any) {
          console.error('❌ Erreur lors de la sauvegarde du profil:', error);
          if (!profileSaved) {
            // Si le profil n'a pas pu être sauvegardé, c'est critique
            throw new Error(`Erreur critique: ${error.message}`);
          }
        } finally {
          set({ isSaving: false });
        }
      },

      // Charger les paramètres depuis le backend
      loadSettings: async () => {
        set({ isLoading: true });
        
        try {
          // Charger le profil utilisateur
          const profileResponse = await api.get('/profile');
          const profile = profileResponse.data;

          if (profile) {
            const newSettings: Partial<InterfaceSettings> = {};
            
            if (profile.theme) {
              newSettings.colors = profile.theme;
            }
            
            if (profile.logo) {
              newSettings.logo = {
                url: profile.logo,
                alt: 'Logo du salon'
              };
            }
            
            if (profile.banner) {
              newSettings.banner = {
                url: profile.banner,
                alt: 'Bannière du salon'
              };
            }
            
            if (profile.presentation) {
              newSettings.presentation = profile.presentation;
            }
            
            if (profile.serviceDisplay) {
              newSettings.serviceDisplay = profile.serviceDisplay;
            }

            // Charger le numéro de téléphone public
            if (profile.publicPhone) {
              newSettings.publicPhone = profile.publicPhone;
            }

            // Charger le paramètre d'affichage de l'équipe
            if (profile.showTeamOnPublicPage !== undefined) {
              newSettings.showTeamOnPublicPage = profile.showTeamOnPublicPage;
            }

            // Charger le template sélectionné
            if (profile.theme?.selectedTemplateId) {
              set({ selectedTemplateId: profile.theme.selectedTemplateId });
            }

            if (Object.keys(newSettings).length > 0) {
              // Utiliser directement set() au lieu de updateSettings() pour éviter les problèmes de réactivité
              set((state) => ({
                ...state,
                settings: {
                  ...state.settings,
                  ...newSettings,
                  colors: {
                    ...state.settings.colors,
                    ...(newSettings.colors || {})
                  },
                  serviceDisplay: {
                    ...state.settings.serviceDisplay,
                    ...(newSettings.serviceDisplay || {})
                  }
                }
              }));
            }
          }

          // Charger les paramètres des services
          const servicesResponse = await api.get('/services');
          const services = servicesResponse.data;

          if (services && Array.isArray(services)) {
            const serviceSettings: ServiceDisplaySettings[] = services.map(service => ({
              id: service.id,
              isOnline: service.isOnline || false,
              minimumBookingTime: service.minimumBookingTime || 24,
              displayOrder: service.displayOrder || 0,
              images: service.images || []
            }));

            set({ serviceSettings });
          }
        } catch (error) {
          console.error('Erreur lors du chargement des paramètres:', error);
        } finally {
          set({ isLoading: false });
        }
      },

      // Upload du logo
      uploadLogo: async (file: File) => {
        try {
          const url = await fileService.uploadImage(file, 'logo');
          
          // Mettre à jour le store local
          get().updateSettings({
            logo: {
              url,
              alt: 'Logo du salon'
            }
          });

          // Sauvegarder immédiatement dans la base de données
          await api.put('/profile', {
            logo: url
          });

          console.log('Logo uploadé et sauvegardé:', url);
        } catch (error) {
          console.error('Erreur lors de l\'upload du logo:', error);
          throw error;
        }
      },

      // Upload de la bannière
      uploadBanner: async (file: File) => {
        try {
          const url = await fileService.uploadImage(file, 'banner');
          console.log('🔍 URL de bannière générée:', url);
          
          // Mettre à jour le store local
          get().updateSettings({
            banner: {
              url,
              alt: 'Bannière du salon'
            }
          });

          // Sauvegarder immédiatement dans la base de données
          console.log('🔍 Envoi vers API:', { banner: url });
          const response = await api.put('/profile', {
            banner: url
          });
          console.log('🔍 Réponse du backend:', response.data);

          // Recharger les settings pour synchroniser l'affichage
          await get().loadSettings();

          console.log('✅ Bannière uploadée et sauvegardée:', url);
        } catch (error) {
          console.error('❌ Erreur lors de l\'upload de la bannière:', error);
          throw error;
        }
      },

      // Appliquer un template
      applyTemplate: (template: DesignTemplate) => {
        // Sauvegarder l'ID du template sélectionné
        set({ selectedTemplateId: template.id });

        // Mettre à jour les couleurs dans le store
        get().updateSettings({
          colors: {
            primary: template.theme.colors.primary,
            secondary: template.theme.colors.secondary,
            accent: template.theme.colors.accent,
            background: template.theme.colors.background
          }
        });

        // Sauvegarder le template sélectionné dans la base de données
        api.put('/profile', {
          theme: {
            ...get().settings.colors,
            selectedTemplateId: template.id
          }
        }).catch(error => {
          console.error('Erreur lors de la sauvegarde du template:', error);
        });

      }
    }),
    {
      name: 'beauty-flow-interface',
      storage: createJSONStorage(() => localStorage),
      version: 1
    }
  )
);
