import axios from 'axios';

const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/api\/?$/, '');

/** The 58 wilayas, index + 1 = official code. Same list in beauty-flow-backend/src/utils/wilayas.ts. */
export const WILAYAS = [
  'Adrar', 'Chlef', 'Laghouat', 'Oum El Bouaghi', 'Batna', 'Béjaïa', 'Biskra', 'Béchar', 'Blida', 'Bouira',
  'Tamanrasset', 'Tébessa', 'Tlemcen', 'Tiaret', 'Tizi Ouzou', 'Alger', 'Djelfa', 'Jijel', 'Sétif', 'Saïda',
  'Skikda', 'Sidi Bel Abbès', 'Annaba', 'Guelma', 'Constantine', 'Médéa', 'Mostaganem', "M'Sila", 'Mascara', 'Ouargla',
  'Oran', 'El Bayadh', 'Illizi', 'Bordj Bou Arréridj', 'Boumerdès', 'El Tarf', 'Tindouf', 'Tissemsilt', 'El Oued', 'Khenchela',
  'Souk Ahras', 'Tipaza', 'Mila', 'Aïn Defla', 'Naâma', 'Aïn Témouchent', 'Ghardaïa', 'Relizane', 'Timimoun', 'Bordj Badji Mokhtar',
  'Ouled Djellal', 'Béni Abbès', 'In Salah', 'In Guezzam', 'Touggourt', 'Djanet', "El M'Ghair", 'El Meniaa',
];
/** Same rule as the backend slug (so "M'Sila" → "m-sila" on both sides). */
export const toSlug = (s: string) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
export const wilayaBySlug = new Map(WILAYAS.map((name, i) => [toSlug(name), { name, code: i + 1 }]));

/** Directory categories, in display order. */
export const CATEGORIES = ['coiffure', 'barbier', 'ongles', 'esthetique', 'spa-hammam', 'maquillage-mariee'] as const;
export type Category = typeof CATEGORIES[number];
export const isCategory = (s?: string): s is Category => !!s && (CATEGORIES as readonly string[]).includes(s);

export interface DirectoryCard {
  slug: string;
  name: string;
  logo?: string;
  banner?: string;
  city?: string;
  wilaya?: string;
  wilayaSlug?: string;
  categories: Category[];
  ratingAvg: number | null;
  ratingCount: number;
  minPrice: number | null;
  currency: string;
  /** First bookable slot within 7 days; inDays 0 = today (salon's timezone). Absent when nothing is free. */
  nextSlot?: { date: string; time: string; inDays: number };
  templateId?: string;
  theme?: { selectedTemplateId?: string; primary?: string; secondary?: string; accent?: string; background?: string };
}

export interface DirectoryPage { salons: DirectoryCard[]; total: number; page: number; limit: number; hasMore: boolean }
export interface DirectoryFacets {
  total: number;
  wilayas: Array<{ code: number; slug: string; name: string; count: number }>;
  categories: Array<{ slug: Category; count: number }>;
}

export const fetchDirectory = (params: { q?: string; wilaya?: string; category?: string; page?: number; limit?: number }, signal?: AbortSignal) =>
  axios.get<DirectoryPage>(`${API_BASE}/api/public/directory`, { params, signal }).then(r => r.data);
export const fetchFacets = (params: { wilaya?: string; category?: string } = {}) =>
  axios.get<DirectoryFacets>(`${API_BASE}/api/public/directory/facets`, { params }).then(r => r.data);
export const fetchCard = (slug: string) => axios.get<DirectoryCard>(`${API_BASE}/api/public/directory/salon/${encodeURIComponent(slug)}`).then(r => r.data);

/** Path of a filtered directory page: /salons, /salons/oran, /salons/coiffure, /salons/oran/coiffure. */
export const directoryPath = (wilaya?: string, category?: string) => ['/salons', wilaya, category].filter(Boolean).join('/');
