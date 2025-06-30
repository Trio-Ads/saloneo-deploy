// @ts-nocheck
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useServiceStore } from '../store';

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

// Mock pour uuid
vi.mock('uuid', () => ({
  v4: vi.fn(() => 'test-uuid')
}));

describe('Service Store', () => {
  let store;
  
  beforeEach(() => {
    // Réinitialiser les mocks
    vi.clearAllMocks();
    
    // Obtenir le store
    store = useServiceStore.getState();
  });

  it('should initialize with default values', () => {
    // Vérifier que le store est initialisé avec des services de test
    expect(store.services).toHaveLength(3);
    expect(store.services[0].name).toBe('Coupe Femme');
    expect(store.services[1].name).toBe('Coloration complète');
    expect(store.services[2].name).toBe('Brushing');
    
    // Vérifier que les catégories sont initialisées
    expect(store.categories).toContain('Coupe');
    expect(store.categories).toContain('Coloration');
    expect(store.categories).toContain('Coiffure');
    
    // Vérifier que les produits sont initialisés
    expect(store.products).toHaveLength(2);
    expect(store.products[0].name).toBe('Shampooing professionnel');
    expect(store.products[1].name).toBe('Coloration');
    
    // Vérifier que les produits actifs sont filtrés correctement
    expect(store.activeProducts).toHaveLength(2);
  });

  it('should add a new service', () => {
    const serviceData = {
      name: 'Massage du cuir chevelu',
      description: 'Massage relaxant du cuir chevelu',
      category: 'Soin',
      duration: 30,
      price: 35
    };
    
    store.addService(serviceData);
    
    // Vérifier que le service a été ajouté
    expect(store.services).toHaveLength(4);
    
    // Vérifier les propriétés du nouveau service
    const newService = store.services[3];
    expect(newService.id).toBe('test-uuid');
    expect(newService.name).toBe('Massage du cuir chevelu');
    expect(newService.category).toBe('Soin');
    expect(newService.isActive).toBe(true);
    expect(newService.products).toEqual([]);
  });

  it('should update an existing service', () => {
    const serviceId = store.services[0].id;
    const updateData = {
      name: 'Coupe Femme Premium',
      price: 55
    };
    
    store.updateService(serviceId, updateData);
    
    // Vérifier que le service a été mis à jour
    const updatedService = store.services.find(s => s.id === serviceId);
    expect(updatedService.name).toBe('Coupe Femme Premium');
    expect(updatedService.price).toBe(55);
    
    // Vérifier que les autres propriétés n'ont pas changé
    expect(updatedService.description).toBe('Coupe, brushing et mise en forme');
    expect(updatedService.category).toBe('Coupe');
    expect(updatedService.duration).toBe(60);
  });

  it('should mark a service as inactive when deleted', () => {
    const serviceId = store.services[0].id;
    
    store.deleteService(serviceId);
    
    // Vérifier que le service est marqué comme inactif
    const deletedService = store.services.find(s => s.id === serviceId);
    expect(deletedService.isActive).toBe(false);
    
    // Vérifier que le service existe toujours dans la liste
    expect(store.services).toHaveLength(3);
  });

  it('should add a new category', () => {
    const newCategory = 'Épilation';
    
    store.addCategory(newCategory);
    
    // Vérifier que la catégorie a été ajoutée
    expect(store.categories).toContain(newCategory);
    expect(store.categories).toHaveLength(7); // 6 initiales + 1 nouvelle
  });

  it('should delete a category', () => {
    const categoryToDelete = 'Massage';
    
    store.deleteCategory(categoryToDelete);
    
    // Vérifier que la catégorie a été supprimée
    expect(store.categories).not.toContain(categoryToDelete);
    expect(store.categories).toHaveLength(5); // 6 initiales - 1 supprimée
  });

  it('should add a new product', () => {
    const productData = {
      name: 'Masque hydratant',
      description: 'Masque hydratant pour cheveux secs',
      quantity: 500,
      minQuantity: 100,
      unit: 'ml'
    };
    
    store.addProduct(productData);
    
    // Vérifier que le produit a été ajouté
    expect(store.products).toHaveLength(3);
    expect(store.activeProducts).toHaveLength(3);
    
    // Vérifier les propriétés du nouveau produit
    const newProduct = store.products[2];
    expect(newProduct.id).toBe('test-uuid');
    expect(newProduct.name).toBe('Masque hydratant');
    expect(newProduct.isActive).toBe(true);
  });

  it('should update an existing product', () => {
    const productId = store.products[0].id;
    const updateData = {
      name: 'Shampooing professionnel premium',
      quantity: 1200
    };
    
    store.updateProduct(productId, updateData);
    
    // Vérifier que le produit a été mis à jour
    const updatedProduct = store.products.find(p => p.id === productId);
    expect(updatedProduct.name).toBe('Shampooing professionnel premium');
    expect(updatedProduct.quantity).toBe(1200);
    
    // Vérifier que les autres propriétés n'ont pas changé
    expect(updatedProduct.description).toBe('Shampooing pour tous types de cheveux');
    expect(updatedProduct.minQuantity).toBe(200);
    expect(updatedProduct.unit).toBe('ml');
  });

  it('should mark a product as inactive when deleted', () => {
    const productId = store.products[0].id;
    
    store.deleteProduct(productId);
    
    // Vérifier que le produit est marqué comme inactif
    const deletedProduct = store.products.find(p => p.id === productId);
    expect(deletedProduct.isActive).toBe(false);
    
    // Vérifier que le produit existe toujours dans la liste des produits
    expect(store.products).toHaveLength(2);
    
    // Vérifier que le produit n'est plus dans la liste des produits actifs
    expect(store.activeProducts).toHaveLength(1);
    expect(store.activeProducts.find(p => p.id === productId)).toBeUndefined();
  });

  it('should update product quantity', () => {
    const productId = store.products[0].id;
    const initialQuantity = store.products[0].quantity;
    
    // Augmenter la quantité
    store.updateProductQuantity(productId, 100);
    
    // Vérifier que la quantité a été augmentée
    let updatedProduct = store.products.find(p => p.id === productId);
    expect(updatedProduct.quantity).toBe(initialQuantity + 100);
    
    // Diminuer la quantité
    store.updateProductQuantity(productId, -50);
    
    // Vérifier que la quantité a été diminuée
    updatedProduct = store.products.find(p => p.id === productId);
    expect(updatedProduct.quantity).toBe(initialQuantity + 100 - 50);
    
    // Essayer de diminuer en dessous de zéro
    store.updateProductQuantity(productId, -2000);
    
    // Vérifier que la quantité est limitée à zéro
    updatedProduct = store.products.find(p => p.id === productId);
    expect(updatedProduct.quantity).toBe(0);
  });
});
