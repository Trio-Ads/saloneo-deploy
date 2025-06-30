// @ts-nocheck
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useInterfaceStore } from '../store';
import { fileService } from '../../../services/fileService';

// Mock pour localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: vi.fn((key) => store[key] || null),
    setItem: vi.fn((key, value) => {
      store[key] = value.toString();
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    removeItem: vi.fn((key) => {
      delete store[key];
    })
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Mock pour fileService
vi.mock('../../../services/fileService', () => ({
  fileService: {
    getImageUrl: vi.fn((url) => url)
  }
}));

describe('Interface Store', () => {
  let store;
  
  beforeEach(() => {
    // Réinitialiser les mocks
    vi.clearAllMocks();
    
    // Réinitialiser localStorage
    localStorageMock.clear();
    
    // Obtenir le store
    store = useInterfaceStore.getState();
  });

  it('should initialize with default values', () => {
    // Vérifier que les paramètres sont initialisés avec les valeurs par défaut
    expect(store.settings).toHaveProperty('colors');
    expect(store.settings.colors).toHaveProperty('primary', '#6B46C1');
    expect(store.settings.colors).toHaveProperty('secondary', '#4A5568');
    expect(store.settings.colors).toHaveProperty('accent', '#ED64A6');
    expect(store.settings.colors).toHaveProperty('background', '#FFFFFF');
    
    expect(store.settings).toHaveProperty('logo');
    expect(store.settings.logo).toHaveProperty('url', '');
    expect(store.settings.logo).toHaveProperty('alt', 'Logo du salon');
    
    expect(store.settings).toHaveProperty('banner');
    expect(store.settings.banner).toHaveProperty('url', '');
    expect(store.settings.banner).toHaveProperty('alt', 'Bannière du salon');
    
    expect(store.settings).toHaveProperty('presentation', 'Bienvenue dans notre salon de beauté');
    
    expect(store.settings).toHaveProperty('serviceDisplay');
    expect(store.settings.serviceDisplay).toHaveProperty('defaultView', 'category');
    expect(store.settings.serviceDisplay).toHaveProperty('priceDisplay', 'fixed');
    
    expect(store.serviceSettings).toEqual([]);
  });

  it('should update settings', () => {
    const newSettings = {
      colors: {
        primary: '#FF0000',
        accent: '#00FF00'
      },
      presentation: 'Nouveau texte de présentation',
      serviceDisplay: {
        defaultView: 'list'
      }
    };
    
    store.updateSettings(newSettings);
    
    // Vérifier que les paramètres ont été mis à jour
    expect(store.settings.colors.primary).toBe('#FF0000');
    expect(store.settings.colors.accent).toBe('#00FF00');
    expect(store.settings.colors.secondary).toBe('#4A5568'); // Inchangé
    expect(store.settings.colors.background).toBe('#FFFFFF'); // Inchangé
    
    expect(store.settings.presentation).toBe('Nouveau texte de présentation');
    
    expect(store.settings.serviceDisplay.defaultView).toBe('list');
    expect(store.settings.serviceDisplay.priceDisplay).toBe('fixed'); // Inchangé
  });

  it('should initialize service settings', () => {
    store.initializeServiceSettings('service-1');
    
    // Vérifier que les paramètres du service ont été initialisés
    expect(store.serviceSettings).toHaveLength(1);
    expect(store.serviceSettings[0].id).toBe('service-1');
    expect(store.serviceSettings[0].isOnline).toBe(false);
    expect(store.serviceSettings[0].minimumBookingTime).toBe(24);
    expect(store.serviceSettings[0].displayOrder).toBe(0);
    expect(store.serviceSettings[0].images).toEqual([]);
  });

  it('should not initialize service settings if they already exist', () => {
    // Initialiser les paramètres du service
    store.initializeServiceSettings('service-1');
    
    // Modifier les paramètres du service
    store.updateServiceSettings('service-1', { isOnline: true });
    
    // Essayer de réinitialiser les paramètres du service
    store.initializeServiceSettings('service-1');
    
    // Vérifier que les paramètres du service n'ont pas été réinitialisés
    expect(store.serviceSettings).toHaveLength(1);
    expect(store.serviceSettings[0].id).toBe('service-1');
    expect(store.serviceSettings[0].isOnline).toBe(true); // Toujours true
  });

  it('should update service settings', () => {
    // Initialiser les paramètres du service
    store.initializeServiceSettings('service-1');
    
    // Mettre à jour les paramètres du service
    store.updateServiceSettings('service-1', {
      isOnline: true,
      minimumBookingTime: 48,
      displayOrder: 1,
      images: [{ url: 'image-1.jpg', alt: 'Image 1' }]
    });
    
    // Vérifier que les paramètres du service ont été mis à jour
    expect(store.serviceSettings[0].isOnline).toBe(true);
    expect(store.serviceSettings[0].minimumBookingTime).toBe(48);
    expect(store.serviceSettings[0].displayOrder).toBe(1);
    expect(store.serviceSettings[0].images).toHaveLength(1);
    expect(store.serviceSettings[0].images[0].url).toBe('image-1.jpg');
    expect(store.serviceSettings[0].images[0].alt).toBe('Image 1');
  });

  it('should check and remove invalid logo images', () => {
    // Configurer un logo avec une URL
    store.updateSettings({
      logo: { url: 'logo.jpg', alt: 'Logo du salon' }
    });
    
    // Simuler que l'image n'existe pas dans localStorage
    localStorageMock.getItem.mockReturnValue(null);
    
    // Vérifier les images
    store.checkImages();
    
    // Vérifier que le logo a été réinitialisé
    expect(store.settings.logo.url).toBe('');
    expect(store.settings.logo.alt).toBe('Logo du salon');
  });

  it('should check and remove invalid banner images', () => {
    // Configurer une bannière avec une URL
    store.updateSettings({
      banner: { url: 'banner.jpg', alt: 'Bannière du salon' }
    });
    
    // Simuler que l'image n'existe pas dans localStorage
    localStorageMock.getItem.mockReturnValue(null);
    
    // Vérifier les images
    store.checkImages();
    
    // Vérifier que la bannière a été réinitialisée
    expect(store.settings.banner.url).toBe('');
    expect(store.settings.banner.alt).toBe('Bannière du salon');
  });

  it('should check and remove invalid service images', () => {
    // Initialiser les paramètres du service
    store.initializeServiceSettings('service-1');
    
    // Ajouter des images au service
    store.updateServiceSettings('service-1', {
      images: [
        { url: 'valid-image.jpg', alt: 'Image valide' },
        { url: 'invalid-image.jpg', alt: 'Image invalide' }
      ]
    });
    
    // Simuler que seule la première image existe dans localStorage
    localStorageMock.getItem.mockImplementation((key) => {
      if (key === 'valid-image.jpg') {
        return 'data:image/jpeg;base64,...';
      }
      return null;
    });
    
    // Vérifier les images
    store.checkImages();
    
    // Vérifier que seule l'image valide a été conservée
    expect(store.serviceSettings[0].images).toHaveLength(1);
    expect(store.serviceSettings[0].images[0].url).toBe('valid-image.jpg');
    expect(store.serviceSettings[0].images[0].alt).toBe('Image valide');
  });

  it('should keep valid images', () => {
    // Configurer un logo et une bannière avec des URLs
    store.updateSettings({
      logo: { url: 'logo.jpg', alt: 'Logo du salon' },
      banner: { url: 'banner.jpg', alt: 'Bannière du salon' }
    });
    
    // Initialiser les paramètres du service
    store.initializeServiceSettings('service-1');
    
    // Ajouter des images au service
    store.updateServiceSettings('service-1', {
      images: [
        { url: 'service-image.jpg', alt: 'Image du service' }
      ]
    });
    
    // Simuler que toutes les images existent dans localStorage
    localStorageMock.getItem.mockReturnValue('data:image/jpeg;base64,...');
    
    // Vérifier les images
    store.checkImages();
    
    // Vérifier que les images ont été conservées
    expect(store.settings.logo.url).toBe('logo.jpg');
    expect(store.settings.banner.url).toBe('banner.jpg');
    expect(store.serviceSettings[0].images).toHaveLength(1);
    expect(store.serviceSettings[0].images[0].url).toBe('service-image.jpg');
  });
});
