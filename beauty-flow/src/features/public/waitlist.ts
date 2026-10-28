// Client side of the waitlist (beauty-flow-backend/src/services/waitlist.ts).
import api from '../../services/api';

export const TIMES_OF_DAY = ['morning', 'afternoon', 'evening', 'any'] as const;
export type TimeOfDay = typeof TIMES_OF_DAY[number];
export type WaitlistStatus = 'active' | 'offered' | 'booked' | 'expired' | 'cancelled';
export const OFFER_MINUTES = [15, 30, 60] as const;

export interface WaitlistClient { firstName: string; lastName?: string; phone: string; email?: string }
export interface WaitlistJoin {
  serviceId: string;
  stylistId?: string;
  from: string;
  to: string;
  timeOfDay: TimeOfDay;
  client: WaitlistClient;
  consent: true;
  lang?: string;
}
/** What a client sees of their entry (manage page / after joining). */
export interface WaitlistPublicEntry {
  status: WaitlistStatus;
  salonName?: string;
  slug?: string;
  serviceName?: string;
  stylistName?: string;
  from: string;
  to: string;
  timeOfDay: TimeOfDay;
  client: { firstName: string };
  offer?: { date: string; time: string; expiresAt: string; url: string };
}
export interface WaitlistOfferView {
  valid: boolean;
  reason: null | 'taken' | 'expired' | 'booked' | 'cancelled';
  serviceId: string;
  stylistId: string;
  date: string;
  time: string;
  expiresAt: string;
  held: boolean;
  manageToken: string;
  client?: WaitlistClient;
}
export interface WaitlistEntryRow {
  id: string;
  status: WaitlistStatus;
  serviceId: string;
  serviceName?: string;
  stylistId?: string | null;
  stylistName?: string;
  from: string;
  to: string;
  timeOfDay: TimeOfDay;
  client: WaitlistClient;
  createdAt: string;
  offers: { date: string; time: string; stylistName?: string; sentAt: string; expiresAt: string; outcome?: string; manual: boolean; channels: string[] }[];
}
export interface WaitlistSettings { enabled: boolean; offerMinutes: number; holdSlot: boolean }

export const waitlistAPI = {
  join: (slug: string, data: WaitlistJoin) =>
    api.post<{ merged: boolean; token: string; manageUrl: string; entry: WaitlistPublicEntry }>(`/waitlist/public/${slug}`, data),
  entry: (token: string) => api.get<{ entry: WaitlistPublicEntry }>(`/waitlist/public/entry/${token}`),
  leave: (token: string) => api.post<{ entry: WaitlistPublicEntry }>(`/waitlist/public/entry/${token}/cancel`),
  offer: (token: string) => api.get<WaitlistOfferView>(`/waitlist/public/offer/${token}`),
  // Dashboard
  list: () => api.get<{ count: number; entries: WaitlistEntryRow[] }>('/waitlist'),
  slots: (id: string, date: string) => api.get<{ date: string; times: string[] }>(`/waitlist/${id}/slots`, { params: { date } }),
  offerSlot: (id: string, data: { date: string; time: string }) => api.post(`/waitlist/${id}/offer`, data),
  remove: (id: string) => api.delete(`/waitlist/${id}`),
  getSettings: () => api.get<WaitlistSettings>('/waitlist/settings'),
  saveSettings: (data: WaitlistSettings) => api.put<WaitlistSettings>('/waitlist/settings', data),
};

/** Error code of a waitlist/booking API error (WAITLIST_LIMIT, INVALID_RANGE, SLOT_TAKEN…). */
export const waitlistCode = (err: any): string | undefined => err?.response?.data?.code;
