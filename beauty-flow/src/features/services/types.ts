export interface Product {
  id: string;
  name: string;
  description: string;
  quantity: number;
  minQuantity: number; // Quantité minimale avant alerte
  unit: string; // ex: ml, g, unité
  isActive: boolean;
}

export interface ServiceProduct {
  productId: string;
  quantity: number; // Quantité utilisée pour ce service
}

export interface Service {
  id: string;
  name: string;
  description: string;
  duration: number; // en minutes
  price: number;
  category: string;
  isActive: boolean;
  products: ServiceProduct[]; // Produits utilisés pour ce service
  image?: string;
  bufferTimeBefore?: number;
  bufferTimeAfter?: number;
  maxAdvanceBooking?: number;
  minAdvanceBooking?: number;
  isOnlineBookingEnabled?: boolean;
}

export type ServiceFormData = Omit<Service, 'id' | 'isActive'>;

export type ProductFormData = Omit<Product, 'id' | 'isActive'>;

export interface ServiceCategory {
  id: string;
  name: string;
}
