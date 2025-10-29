// @ts-nocheck
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAuthStore } from '../store';
import { PlanType } from '../../subscription/types';

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

// Mock pour le store de profil
vi.mock('../../profile/store', () => ({
  useProfileStore: {
    getState: vi.fn(() => ({
      updateProfile: vi.fn()
    }))
  }
}));

describe('Auth Store', () => {
  let store;
  
  beforeEach(() => {
    // Réinitialiser les mocks
    vi.clearAllMocks();
    
    // Réinitialiser localStorage
    localStorageMock.clear();
    
    // Obtenir le store
    store = useAuthStore.getState();
    
    // Réinitialiser l'état du store pour les tests
    store.isAuthenticated = false;
    store.user = null;
    store.token = null;
    store.loading = false;
    store.error = null;
  });

  it('should initialize with default values', () => {
    // Vérifier que le store est initialisé avec les valeurs par défaut
    expect(store.isAuthenticated).toBe(false);
    expect(store.user).toBeNull();
    expect(store.token).toBeNull();
    expect(store.loading).toBe(false);
    expect(store.error).toBeNull();
  });

  it('should login successfully with valid credentials', async () => {
    const credentials = {
      email: 'test@example.com',
      password: 'password'
    };
    
    await store.login(credentials);
    
    // Vérifier que l'utilisateur est authentifié
    expect(store.isAuthenticated).toBe(true);
    expect(store.user).not.toBeNull();
    expect(store.token).toBe('mock-jwt-token');
    expect(store.loading).toBe(false);
    expect(store.error).toBeNull();
    
    // Vérifier que les données ont été sauvegardées dans localStorage
    expect(localStorageMock.setItem).toHaveBeenCalledWith('auth_token', 'mock-jwt-token');
    expect(localStorageMock.setItem).toHaveBeenCalledWith('auth_user', expect.any(String));
    
    // Vérifier que le profil a été mis à jour
    const { useProfileStore } = await import('../../profile/store');
    expect(useProfileStore.getState().updateProfile).toHaveBeenCalled();
  });

  it('should fail login with invalid credentials', async () => {
    const credentials = {
      email: 'wrong@example.com',
      password: 'wrongpassword'
    };
    
    // La fonction login doit lancer une erreur
    await expect(store.login(credentials)).rejects.toThrow('Identifiants invalides');
    
    // Vérifier que l'utilisateur n'est pas authentifié
    expect(store.isAuthenticated).toBe(false);
    expect(store.user).toBeNull();
    expect(store.token).toBeNull();
    expect(store.loading).toBe(false);
    expect(store.error).toBe('Identifiants invalides');
    
    // Vérifier que rien n'a été sauvegardé dans localStorage
    expect(localStorageMock.setItem).not.toHaveBeenCalled();
  });

  it('should register a new user', async () => {
    const registerData = {
      email: 'new@example.com',
      password: 'password',
      firstName: 'Jane',
      lastName: 'Doe',
      establishmentName: 'New Salon',
      address: '456 Second St'
    };
    
    await store.register(registerData);
    
    // Vérifier que l'utilisateur est authentifié
    expect(store.isAuthenticated).toBe(true);
    expect(store.user).not.toBeNull();
    expect(store.token).toBe('mock-jwt-token');
    expect(store.loading).toBe(false);
    expect(store.error).toBeNull();
    
    // Vérifier que les données ont été sauvegardées dans localStorage
    expect(localStorageMock.setItem).toHaveBeenCalledWith('auth_token', 'mock-jwt-token');
    expect(localStorageMock.setItem).toHaveBeenCalledWith('auth_user', expect.any(String));
    
    // Vérifier que le profil a été mis à jour
    const { useProfileStore } = await import('../../profile/store');
    expect(useProfileStore.getState().updateProfile).toHaveBeenCalled();
  });

  it('should logout the user', async () => {
    // D'abord connecter l'utilisateur
    const credentials = {
      email: 'test@example.com',
      password: 'password'
    };
    
    await store.login(credentials);
    
    // Puis le déconnecter
    await store.logout();
    
    // Vérifier que l'utilisateur est déconnecté
    expect(store.isAuthenticated).toBe(false);
    expect(store.user).toBeNull();
    expect(store.token).toBeNull();
    expect(store.loading).toBe(false);
    expect(store.error).toBeNull();
    
    // Vérifier que les données ont été supprimées de localStorage
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('auth_token');
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('auth_user');
    
    // Vérifier que le profil a été réinitialisé
    const { useProfileStore } = await import('../../profile/store');
    expect(useProfileStore.getState().updateProfile).toHaveBeenCalledWith({
      firstName: '',
      lastName: '',
      establishmentName: '',
      address: '',
      language: 'fr',
      currency: { code: 'EUR', symbol: '€', name: 'Euro' },
      publicLink: ''
    });
  });

  it('should check auth with valid token', async () => {
    // Simuler un token valide dans le store
    store.token = 'mock-jwt-token';
    
    await store.checkAuth();
    
    // Vérifier que l'utilisateur est authentifié
    expect(store.isAuthenticated).toBe(true);
    expect(store.user).not.toBeNull();
    expect(store.loading).toBe(false);
    expect(store.error).toBeNull();
    
    // Vérifier que le profil a été mis à jour
    const { useProfileStore } = await import('../../profile/store');
    expect(useProfileStore.getState().updateProfile).toHaveBeenCalled();
  });

  it('should fail check auth with invalid token', async () => {
    // Simuler un token invalide dans le store
    store.token = 'invalid-token';
    
    await store.checkAuth();
    
    // Vérifier que l'utilisateur est déconnecté
    expect(store.isAuthenticated).toBe(false);
    expect(store.user).toBeNull();
    expect(store.token).toBeNull();
    expect(store.loading).toBe(false);
    expect(store.error).toBe('Token invalide');
    
    // Vérifier que les données ont été supprimées de localStorage
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('auth_token');
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('auth_user');
  });

  it('should do nothing on check auth with no token', async () => {
    // Aucun token dans le store
    store.token = null;
    
    await store.checkAuth();
    
    // Vérifier que l'état n'a pas changé
    expect(store.isAuthenticated).toBe(false);
    expect(store.user).toBeNull();
    expect(store.token).toBeNull();
    expect(store.loading).toBe(false);
    expect(store.error).toBeNull();
    
    // Vérifier qu'aucune action n'a été effectuée
    expect(localStorageMock.removeItem).not.toHaveBeenCalled();
    const { useProfileStore } = await import('../../profile/store');
    expect(useProfileStore.getState().updateProfile).not.toHaveBeenCalled();
  });

  it('should load auth from storage on initialization', () => {
    // Simuler des données d'authentification dans localStorage
    const user = {
      id: '1',
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      establishmentName: 'Beauty Salon',
      address: '123 Main St',
      language: 'fr',
      currency: { code: 'EUR', symbol: '€', name: 'Euro' },
      subscription: {
        planType: PlanType.FREE,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      }
    };
    
    localStorageMock.getItem.mockImplementation((key) => {
      if (key === 'auth_token') return 'stored-token';
      if (key === 'auth_user') return JSON.stringify(user);
      return null;
    });
    
    // Réinitialiser le store pour qu'il charge les données du localStorage
    const newStore = useAuthStore.getState();
    
    // Vérifier que les données ont été chargées
    expect(newStore.isAuthenticated).toBe(true);
    expect(newStore.token).toBe('stored-token');
    expect(newStore.user).toEqual(user);
  });
});
