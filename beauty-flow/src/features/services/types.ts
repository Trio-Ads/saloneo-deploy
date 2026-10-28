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

export interface ServiceImage {
  url: string;
  alt: string;
  isPrimary?: boolean;
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
  images?: ServiceImage[]; // Nouvelles images multiples
  /** Service.buffer.before / after côté API (minutes de préparation / de nettoyage, bloquées dans l'agenda) */
  bufferTimeBefore?: number;
  bufferTimeAfter?: number;
  maxAdvanceBooking?: number;
  minAdvanceBooking?: number;
  isOnlineBookingEnabled?: boolean;
  /** settings.isOnline côté API : réservable sur la page publique */
  isOnline?: boolean;
  /** settings.minimumBookingTime côté API, en heures — null = réglage du salon (Paramètres des rendez-vous) */
  minimumBookingTime?: number | null;
  /** Acompte en ligne : pourcentage du prix ou montant fixe en DA (montant calculé par le serveur) */
  deposit?: ServiceDeposit;
}

export interface ServiceDeposit { mode: 'none' | 'fixed' | 'percent'; value: number }

/** Same rule as the server (services/deposits.ts depositAmount): percent rounded to 50 DA, min 500 DA, never above the price. */
export const DEPOSIT_MIN = 500;
export function depositAmount(price: number, d?: ServiceDeposit): number {
  if (!d || price <= 0 || !(d.value > 0) || (d.mode !== 'fixed' && d.mode !== 'percent')) return 0;
  const raw = d.mode === 'percent' ? Math.round((price * Math.min(100, d.value)) / 100 / 50) * 50 : Math.round(d.value);
  return Math.min(price, Math.max(DEPOSIT_MIN, raw));
}

export type ServiceFormData = Omit<Service, 'id' | 'isActive'> & { id?: string };

export type ProductFormData = Omit<Product, 'id' | 'isActive'>;

export interface ServiceCategory {
  id: string;
  name: string;
}
