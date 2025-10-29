import { create } from 'zustand';
import { Service, ServiceFormData, Product, ProductFormData } from './types';
import { servicesAPI, productsAPI } from '../../services/api';
import { AxiosError } from 'axios';

export interface ServiceStore {
  services: Service[];
  categories: string[];
  products: Product[];
  activeProducts: Product[];
  loading: boolean;
  error: string | null;
  // API methods
  fetchServices: () => Promise<void>;
  addService: (serviceData: ServiceFormData) => Promise<Service>;
  updateService: (id: string, serviceData: Partial<ServiceFormData>) => Promise<void>;
  deleteService: (id: string) => Promise<void>;
  addCategory: (category: string) => void;
  deleteCategory: (category: string) => void;
  fetchProducts: () => Promise<void>;
  addProduct: (productData: ProductFormData) => Promise<Product>;
  updateProduct: (id: string, productData: Partial<ProductFormData>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  updateProductQuantity: (id: string, quantityChange: number) => Promise<void>;
  clearError: () => void;
}

// Fonction pour mapper les données du backend vers le frontend
const mapServiceFromAPI = (apiService: any): Service => ({
  id: apiService._id || apiService.id,
  name: apiService.name,
  description: apiService.description || '',
  category: apiService.category,
  duration: apiService.duration,
  price: apiService.price,
  isActive: apiService.isActive !== false,
  products: apiService.products || [],
  image: apiService.image,
  images: apiService.images || [],
  bufferTimeBefore: apiService.bufferTimeBefore || 0,
  bufferTimeAfter: apiService.bufferTimeAfter || 0,
  maxAdvanceBooking: apiService.maxAdvanceBooking || 30,
  minAdvanceBooking: apiService.minAdvanceBooking || 0,
  isOnlineBookingEnabled: apiService.isOnlineBookingEnabled || false
});

// Fonction pour mapper les données du frontend vers le backend
const mapServiceToAPI = (service: ServiceFormData) => ({
  name: service.name,
  description: service.description || '',
  category: service.category,
  duration: service.duration,
  price: service.price,
  image: service.image,
  bufferTimeBefore: service.bufferTimeBefore || 0,
  bufferTimeAfter: service.bufferTimeAfter || 0,
  maxAdvanceBooking: service.maxAdvanceBooking || 30,
  minAdvanceBooking: service.minAdvanceBooking || 0,
  isOnlineBookingEnabled: service.isOnlineBookingEnabled || false
});

// Fonction pour mapper les produits du backend vers le frontend
const mapProductFromAPI = (apiProduct: any): Product => ({
  id: apiProduct._id || apiProduct.id,
  name: apiProduct.name,
  description: apiProduct.description || '',
  quantity: apiProduct.quantity,
  minQuantity: apiProduct.minQuantity,
  unit: apiProduct.unit,
  isActive: apiProduct.isActive !== false
});

// Fonction pour mapper les produits du frontend vers le backend
const mapProductToAPI = (product: ProductFormData) => ({
  name: product.name,
  description: product.description || '',
  quantity: product.quantity,
  minQuantity: product.minQuantity,
  unit: product.unit
});

// Données initiales pour les catégories
const initialCategories = [
  'Coupe',
  'Coloration',
  'Coiffure',
  'Soin',
  'Massage',
  'Manucure'
];

const initialState = {
  services: [],
  categories: initialCategories,
  products: [],
  activeProducts: [],
  loading: false,
  error: null
};

export const useServiceStore = create<ServiceStore>()((set, get) => ({
  ...initialState,

  clearError: () => set({ error: null }),

  fetchServices: async () => {
    set({ loading: true, error: null });
    try {
      const response = await servicesAPI.getAll();
      let servicesData = [];
      
      if (response.data && typeof response.data === 'object') {
        if (Array.isArray(response.data)) {
          servicesData = response.data;
        } else if (response.data.services && Array.isArray(response.data.services)) {
          servicesData = response.data.services;
        } else {
          console.warn('⚠️ Services data is not an array:', response.data);
          servicesData = [];
        }
      }

      const services = servicesData.map(mapServiceFromAPI);
      console.log('📋 Services chargés:', services.length);
      
      set({ services, loading: false });
    } catch (error) {
      const message = error instanceof AxiosError 
        ? error.response?.data?.error || 'Erreur lors du chargement des services'
        : 'Une erreur est survenue';
      set({ loading: false, error: message });
    }
  },

  addService: async (serviceData) => {
    set({ loading: true, error: null });
    try {
      const apiData = mapServiceToAPI(serviceData);
      const response = await servicesAPI.create(apiData);
      const newService = mapServiceFromAPI(response.data.service || response.data);
      
      set((state) => ({
        services: [...state.services, newService],
        loading: false
      }));

      return newService;
    } catch (error) {
      const message = error instanceof AxiosError 
        ? error.response?.data?.error || 'Erreur lors de la création du service'
        : 'Une erreur est survenue';
      set({ loading: false, error: message });
      throw error;
    }
  },
  
  updateService: async (id, serviceData) => {
    set({ loading: true, error: null });
    try {
      const apiData = mapServiceToAPI(serviceData as ServiceFormData);
      const response = await servicesAPI.update(id, apiData);
      const updatedService = mapServiceFromAPI(response.data.service || response.data);
      
      set((state) => ({
        services: state.services.map((service) =>
          service.id === id ? updatedService : service
        ),
        loading: false
      }));
    } catch (error) {
      const message = error instanceof AxiosError 
        ? error.response?.data?.error || 'Erreur lors de la mise à jour du service'
        : 'Une erreur est survenue';
      set({ loading: false, error: message });
      throw error;
    }
  },
  
  deleteService: async (id) => {
    set({ loading: true, error: null });
    try {
      await servicesAPI.delete(id);
      set((state) => ({
        services: state.services.filter((service) => service.id !== id),
        loading: false
      }));
    } catch (error) {
      const message = error instanceof AxiosError 
        ? error.response?.data?.error || 'Erreur lors de la suppression du service'
        : 'Une erreur est survenue';
      set({ loading: false, error: message });
      throw error;
    }
  },
  
  addCategory: (category) => set((state) => ({
    ...state,
    categories: [...state.categories, category]
  })),
  
  deleteCategory: (category) => set((state) => ({
    ...state,
    categories: state.categories.filter((c) => c !== category)
  })),

  fetchProducts: async () => {
    set({ loading: true, error: null });
    try {
      const response = await productsAPI.getAll();
      let productsData = [];
      
      if (response.data && typeof response.data === 'object') {
        if (Array.isArray(response.data)) {
          productsData = response.data;
        } else if (response.data.products && Array.isArray(response.data.products)) {
          productsData = response.data.products;
        } else {
          console.warn('⚠️ Products data is not an array:', response.data);
          productsData = [];
        }
      }

      const products = productsData.map(mapProductFromAPI);
      const activeProducts = products.filter((p: Product) => p.isActive);
      
      console.log('📦 Produits chargés:', products.length);
      
      set({ products, activeProducts, loading: false });
    } catch (error) {
      const message = error instanceof AxiosError 
        ? error.response?.data?.error || 'Erreur lors du chargement des produits'
        : 'Une erreur est survenue';
      set({ loading: false, error: message });
    }
  },

  addProduct: async (productData) => {
    set({ loading: true, error: null });
    try {
      const apiData = mapProductToAPI(productData);
      const response = await productsAPI.create(apiData);
      const newProduct = mapProductFromAPI(response.data.product || response.data);
      
      set((state) => ({
        products: [...state.products, newProduct],
        activeProducts: [...state.activeProducts, newProduct],
        loading: false
      }));

      return newProduct;
    } catch (error) {
      const message = error instanceof AxiosError 
        ? error.response?.data?.error || 'Erreur lors de la création du produit'
        : 'Une erreur est survenue';
      set({ loading: false, error: message });
      throw error;
    }
  },

  updateProduct: async (id, productData) => {
    set({ loading: true, error: null });
    try {
      const apiData = mapProductToAPI(productData as ProductFormData);
      const response = await productsAPI.update(id, apiData);
      const updatedProduct = mapProductFromAPI(response.data.product || response.data);
      
      set((state) => {
        const updatedProducts = state.products.map((product) =>
          product.id === id ? updatedProduct : product
        );
        return {
          products: updatedProducts,
          activeProducts: updatedProducts.filter(p => p.isActive),
          loading: false
        };
      });
    } catch (error) {
      const message = error instanceof AxiosError 
        ? error.response?.data?.error || 'Erreur lors de la mise à jour du produit'
        : 'Une erreur est survenue';
      set({ loading: false, error: message });
      throw error;
    }
  },

  deleteProduct: async (id) => {
    set({ loading: true, error: null });
    try {
      await productsAPI.delete(id);
      set((state) => {
        const updatedProducts = state.products.filter((product) => product.id !== id);
        return {
          products: updatedProducts,
          activeProducts: updatedProducts.filter(p => p.isActive),
          loading: false
        };
      });
    } catch (error) {
      const message = error instanceof AxiosError 
        ? error.response?.data?.error || 'Erreur lors de la suppression du produit'
        : 'Une erreur est survenue';
      set({ loading: false, error: message });
      throw error;
    }
  },

  updateProductQuantity: async (id, quantityChange) => {
    set({ loading: true, error: null });
    try {
      const response = await productsAPI.updateQuantity(id, quantityChange);
      const updatedProduct = mapProductFromAPI(response.data.product || response.data);
      
      set((state) => {
        const updatedProducts = state.products.map((product) =>
          product.id === id ? updatedProduct : product
        );
        return {
          products: updatedProducts,
          activeProducts: updatedProducts.filter(p => p.isActive),
          loading: false
        };
      });
    } catch (error) {
      const message = error instanceof AxiosError 
        ? error.response?.data?.error || 'Erreur lors de la mise à jour de la quantité'
        : 'Une erreur est survenue';
      set({ loading: false, error: message });
      throw error;
    }
  }
}));
