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
  restoreTemplate: () => void;
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
  }
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
        
        try {
          // Sauvegarder les paramètres d'interface dans le profil utilisateur
          await api.put('/profile', {
            theme: state.settings.colors,
            logo: state.settings.logo.url,
            banner: state.settings.banner.url,
            presentation: state.settings.presentation,
            serviceDisplay: state.settings.serviceDisplay
          });

          // Sauvegarder les paramètres de services
          for (const serviceSetting of state.serviceSettings) {
            await api.put(`/services/${serviceSetting.id}/settings`, {
              isOnline: serviceSetting.isOnline,
              minimumBookingTime: serviceSetting.minimumBookingTime,
              displayOrder: serviceSetting.displayOrder,
              images: serviceSetting.images
            });
          }
        } catch (error) {
          console.error('Erreur lors de la sauvegarde des paramètres:', error);
          throw error;
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

            // Charger le template sélectionné
            if (profile.theme?.selectedTemplateId) {
              set({ selectedTemplateId: profile.theme.selectedTemplateId });
            }

            if (Object.keys(newSettings).length > 0) {
              get().updateSettings(newSettings);
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
          get().updateSettings({
            logo: {
              url,
              alt: 'Logo du salon'
            }
          });
        } catch (error) {
          console.error('Erreur lors de l\'upload du logo:', error);
          throw error;
        }
      },

      // Upload de la bannière
      uploadBanner: async (file: File) => {
        try {
          const url = await fileService.uploadImage(file, 'banner');
          get().updateSettings({
            banner: {
              url,
              alt: 'Bannière du salon'
            }
          });
        } catch (error) {
          console.error('Erreur lors de l\'upload de la bannière:', error);
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

        // Appliquer le CSS complet du template
        const existingStyle = document.getElementById('template-styles');
        if (existingStyle) {
          existingStyle.remove();
        }

        // Créer un nouvel élément style avec le CSS du template
        const styleElement = document.createElement('style');
        styleElement.id = 'template-styles';
        styleElement.textContent = template.customCSS || '';
        document.head.appendChild(styleElement);

        // Appliquer la classe du template au body
        document.body.className = document.body.className.replace(/\b\w+-\d{4}\b/g, '');
        document.body.classList.add(template.id + '-2025');

        // Mettre à jour les variables CSS pour les couleurs
        document.documentElement.style.setProperty('--color-primary', template.theme.colors.primary);
        document.documentElement.style.setProperty('--color-secondary', template.theme.colors.secondary);
        document.documentElement.style.setProperty('--color-accent', template.theme.colors.accent);
        document.documentElement.style.setProperty('--color-background', template.theme.colors.background);
        document.documentElement.style.setProperty('--color-text', template.theme.colors.text);
        document.documentElement.style.setProperty('--color-text-secondary', template.theme.colors.textSecondary);

        // Appliquer les polices Google Fonts si nécessaire
        if (template.theme.typography.headingFont || template.theme.typography.bodyFont) {
          const existingFonts = document.getElementById('template-fonts');
          if (existingFonts) {
            existingFonts.remove();
          }

          const fontLink = document.createElement('link');
          fontLink.id = 'template-fonts';
          fontLink.rel = 'stylesheet';
          
          const fonts = [];
          if (template.theme.typography.headingFont && template.theme.typography.headingFont.includes('Google')) {
            fonts.push(template.theme.typography.headingFont.split(',')[0].trim());
          }
          if (template.theme.typography.bodyFont && template.theme.typography.bodyFont.includes('Google')) {
            fonts.push(template.theme.typography.bodyFont.split(',')[0].trim());
          }
          
          if (fonts.length > 0) {
            fontLink.href = `https://fonts.googleapis.com/css2?${fonts.map(font => `family=${font.replace(/\s+/g, '+')}`).join('&')}&display=swap`;
            document.head.appendChild(fontLink);
          }
        }

        console.log(`Template "${template.name}" appliqué avec succès !`);
      },

      // Restaurer le template sauvegardé
      restoreTemplate: () => {
        const state = get();
        if (state.selectedTemplateId) {
          // Importer dynamiquement les templates
          import('../templates/index').then(({ allTemplates }) => {
            const template = allTemplates.find(t => t.id === state.selectedTemplateId);
            if (template) {
              // Réappliquer le template sans changer l'ID (éviter la boucle)
              const existingStyle = document.getElementById('template-styles');
              if (existingStyle) {
                existingStyle.remove();
              }

              const styleElement = document.createElement('style');
              styleElement.id = 'template-styles';
              styleElement.textContent = template.customCSS || '';
              document.head.appendChild(styleElement);

              document.body.className = document.body.className.replace(/\b\w+-\d{4}\b/g, '');
              document.body.classList.add(template.id + '-2025');

              document.documentElement.style.setProperty('--color-primary', template.theme.colors.primary);
              document.documentElement.style.setProperty('--color-secondary', template.theme.colors.secondary);
              document.documentElement.style.setProperty('--color-accent', template.theme.colors.accent);
              document.documentElement.style.setProperty('--color-background', template.theme.colors.background);
              document.documentElement.style.setProperty('--color-text', template.theme.colors.text);
              document.documentElement.style.setProperty('--color-text-secondary', template.theme.colors.textSecondary);

              if (template.theme.typography.headingFont || template.theme.typography.bodyFont) {
                const existingFonts = document.getElementById('template-fonts');
                if (existingFonts) {
                  existingFonts.remove();
                }

                const fontLink = document.createElement('link');
                fontLink.id = 'template-fonts';
                fontLink.rel = 'stylesheet';
                
                const fonts = [];
                if (template.theme.typography.headingFont && template.theme.typography.headingFont.includes('Google')) {
                  fonts.push(template.theme.typography.headingFont.split(',')[0].trim());
                }
                if (template.theme.typography.bodyFont && template.theme.typography.bodyFont.includes('Google')) {
                  fonts.push(template.theme.typography.bodyFont.split(',')[0].trim());
                }
                
                if (fonts.length > 0) {
                  fontLink.href = `https://fonts.googleapis.com/css2?${fonts.map(font => `family=${font.replace(/\s+/g, '+')}`).join('&')}&display=swap`;
                  document.head.appendChild(fontLink);
                }
              }

              console.log(`Template "${template.name}" restauré avec succès !`);
            }
          }).catch(error => {
            console.error('Erreur lors de la restauration du template:', error);
          });
        }
      }
    }),
    {
      name: 'beauty-flow-interface',
      storage: createJSONStorage(() => localStorage),
      version: 1
    }
  )
);
