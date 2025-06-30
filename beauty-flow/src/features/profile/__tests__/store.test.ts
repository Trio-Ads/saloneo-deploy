// @ts-nocheck
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useProfileStore, generatePublicLink } from '../store';
import { CURRENCIES } from '../types';

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

describe('Profile Store', () => {
  let store;
  
  beforeEach(() => {
    // Réinitialiser les mocks
    vi.clearAllMocks();
    
    // Réinitialiser localStorage
    localStorageMock.clear();
    
    // Obtenir le store
    store = useProfileStore.getState();
    
    // Réinitialiser l'état du store pour les tests
    store.profile = {
      firstName: '',
      lastName: '',
      establishmentName: '',
      address: '',
      language: 'fr',
      currency: CURRENCIES.EUR,
      publicLink: ''
    };
  });

  it('should initialize with default values', () => {
    // Vérifier que le store est initialisé avec les valeurs par défaut
    expect(store.profile).toEqual({
      firstName: '',
      lastName: '',
      establishmentName: '',
      address: '',
      language: 'fr',
      currency: CURRENCIES.EUR,
      publicLink: ''
    });
  });

  it('should update the profile', () => {
    const newProfile = {
      firstName: 'John',
      lastName: 'Doe',
      establishmentName: 'Beauty Salon',
      address: '123 Main St',
      language: 'en',
      currency: CURRENCIES.USD,
      publicLink: ''
    };
    
    store.updateProfile(newProfile);
    
    // Vérifier que le profil a été mis à jour
    expect(store.profile.firstName).toBe('John');
    expect(store.profile.lastName).toBe('Doe');
    expect(store.profile.establishmentName).toBe('Beauty Salon');
    expect(store.profile.address).toBe('123 Main St');
    expect(store.profile.language).toBe('en');
    expect(store.profile.currency).toEqual(CURRENCIES.USD);
    
    // Vérifier que le lien public a été généré
    expect(store.profile.publicLink).toBe('saloneo.tech/beautysalon');
    
    // Vérifier que le profil a été sauvegardé dans localStorage
    expect(localStorageMock.setItem).toHaveBeenCalledWith('profile', expect.any(String));
    const savedProfile = JSON.parse(localStorageMock.setItem.mock.calls[0][1]);
    expect(savedProfile).toEqual(store.profile);
  });

  it('should set the language', () => {
    store.setLanguage('es');
    
    // Vérifier que la langue a été mise à jour
    expect(store.profile.language).toBe('es');
    
    // Vérifier que le profil a été sauvegardé dans localStorage
    expect(localStorageMock.setItem).toHaveBeenCalledWith('profile', expect.any(String));
    const savedProfile = JSON.parse(localStorageMock.setItem.mock.calls[0][1]);
    expect(savedProfile.language).toBe('es');
  });

  it('should set the currency', () => {
    store.setCurrency(CURRENCIES.GBP);
    
    // Vérifier que la devise a été mise à jour
    expect(store.profile.currency).toEqual(CURRENCIES.GBP);
    
    // Vérifier que le profil a été sauvegardé dans localStorage
    expect(localStorageMock.setItem).toHaveBeenCalledWith('profile', expect.any(String));
    const savedProfile = JSON.parse(localStorageMock.setItem.mock.calls[0][1]);
    expect(savedProfile.currency).toEqual(CURRENCIES.GBP);
  });

  it('should set the establishment name and generate a public link', () => {
    store.setEstablishmentName('My Beauty Salon');
    
    // Vérifier que le nom de l'établissement a été mis à jour
    expect(store.profile.establishmentName).toBe('My Beauty Salon');
    
    // Vérifier que le lien public a été généré
    expect(store.profile.publicLink).toBe('saloneo.tech/mybeautysalon');
    
    // Vérifier que le profil a été sauvegardé dans localStorage
    expect(localStorageMock.setItem).toHaveBeenCalledWith('profile', expect.any(String));
    const savedProfile = JSON.parse(localStorageMock.setItem.mock.calls[0][1]);
    expect(savedProfile.establishmentName).toBe('My Beauty Salon');
    expect(savedProfile.publicLink).toBe('saloneo.tech/mybeautysalon');
  });

  it('should load profile from localStorage on initialization', () => {
    // Simuler un profil sauvegardé dans localStorage
    const savedProfile = {
      firstName: 'Jane',
      lastName: 'Smith',
      establishmentName: 'Jane Beauty',
      address: '456 Second St',
      language: 'pt',
      currency: CURRENCIES.BRL,
      publicLink: 'saloneo.tech/janebeauty'
    };
    
    localStorageMock.getItem.mockReturnValue(JSON.stringify(savedProfile));
    
    // Réinitialiser le store pour qu'il charge les données du localStorage
    const newStore = useProfileStore.getState();
    
    // Vérifier que le profil a été chargé
    expect(newStore.profile).toEqual(savedProfile);
  });

  it('should generate a public link from an establishment name', () => {
    // Tester la fonction generatePublicLink
    expect(generatePublicLink('Beauty Salon')).toBe('saloneo.tech/beautysalon');
    expect(generatePublicLink('My Beauty & Spa')).toBe('saloneo.tech/mybeautyspa');
    expect(generatePublicLink('Salon de Beauté')).toBe('saloneo.tech/salondebeaut');
    expect(generatePublicLink('123 Beauty')).toBe('saloneo.tech/123beauty');
    expect(generatePublicLink('')).toBe('');
  });
});
