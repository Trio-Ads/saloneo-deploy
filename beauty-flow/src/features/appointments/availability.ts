// Client side of the availability engine (beauty-flow-backend/src/services/availability.ts).
// The server decides; these are its shapes and the calls that read/write it.
import { addDays, format, parseISO } from 'date-fns';
import api from '../../services/api';

export const AVAILABILITY_CODES = ['SLOT_TAKEN', 'OUTSIDE_HOURS', 'TOO_SOON', 'TOO_FAR', 'STAFF_UNAVAILABLE', 'SERVICE_UNAVAILABLE'] as const;
export type AvailabilityCode = typeof AVAILABILITY_CODES[number];

export interface AvailabilitySlot { time: string; staff: string[] }
export interface AvailabilityDay { date: string; open: boolean; slots: AvailabilitySlot[] }
export interface StaffOption { id: string; firstName: string; lastName: string; avatar?: string; color?: string; isOwner?: boolean }
export interface PublicAvailability {
  days: AvailabilityDay[];
  staff: StaffOption[];
  today: string;
  horizon: string;
  slotInterval: number;
  allowAnyStaff: boolean;
  duration: number;
  /** The salon takes waitlist requests */
  waitlist?: boolean;
}
export interface DashboardAvailability {
  slots: string[];
  days: AvailabilityDay[];
  busy?: { time: string; reason: AvailabilityCode | null; staff: string[] }[];
  staff: StaffOption[];
  configured: boolean;
}

export const WEEK = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;
export type WeekDay = typeof WEEK[number];
export interface TimeRange { start: string; end: string }
export interface DayHours { isOpen: boolean; start: string; end: string; breaks: TimeRange[] }
export type WeekHours = Record<WeekDay, DayHours>;
export interface DateRange { from: string; to: string; reason?: string }
export interface BookingSettings {
  slotInterval: number;
  minNoticeMinutes: number;
  maxAdvanceDays: number;
  allowAnyStaff: boolean;
  bufferMinutes: number;
  allowCancellation: boolean;
  /** Also the free-cancellation deadline of online deposits */
  cancellationDeadlineHours: number;
  /** After that deadline, one client reschedule is still allowed */
  lateReschedule: boolean;
  /** Status of an online booking once its deposit is paid */
  paidStatus: 'confirmed' | 'scheduled';
  /** Salon's own policy wording (booking step, emails) */
  policyText: string;
}
export interface SalonBookingSettings {
  hours: WeekHours; configured: boolean; bookingSettings: BookingSettings; closures: DateRange[];
  /** Server switch DEPOSITS_ENABLED: off = deposit settings are saved but no payment is asked yet */
  depositsEnabled?: boolean;
}

export const availabilityAPI = {
  dashboard: (params: { serviceId: string; teamMemberId?: string; date: string; includeBusy?: 1; excludeId?: string }) =>
    api.get<DashboardAvailability>('/appointments/available-slots', { params }),
  getSettings: () => api.get<SalonBookingSettings>('/appointments/booking-settings'),
  saveSettings: (data: Partial<Omit<SalonBookingSettings, 'configured'>>) => api.put<SalonBookingSettings>('/appointments/booking-settings', data),
};

// One request per page load: whether online deposits are switched on server-side (settings stay editable either way)
let depositsFlag: Promise<boolean> | null = null;
export const fetchDepositsEnabled = () =>
  (depositsFlag ??= availabilityAPI.getSettings().then(({ data }) => data.depositsEnabled !== false).catch(() => true));

/** The refusal code of a 409 from any booking endpoint (undefined for other errors). */
export const availabilityCode = (err: any): AvailabilityCode | undefined =>
  [err?.response?.data?.code, err?.code].find((c) => AVAILABILITY_CODES.includes(c));

/**
 * Public availability for [from, to] (inclusive day keys). The endpoint serves ≤ 14 days per call,
 * so a month view is fetched in parallel chunks and merged.
 */
export async function fetchPublicAvailability(
  slug: string,
  params: { serviceId: string; stylistId?: string; token?: string; offer?: string },
  from: string,
  to: string
): Promise<PublicAvailability> {
  const chunks: { from: string; days: number }[] = [];
  for (let d = parseISO(from); format(d, 'yyyy-MM-dd') <= to; d = addDays(d, 14)) {
    const last = format(addDays(d, 13), 'yyyy-MM-dd');
    const end = last < to ? last : to;
    chunks.push({ from: format(d, 'yyyy-MM-dd'), days: Math.round((parseISO(end).getTime() - d.getTime()) / 864e5) + 1 });
  }
  const parts = await Promise.all(chunks.map((c) =>
    api.get<PublicAvailability>(`/public/availability/${slug}`, {
      params: { serviceId: params.serviceId, stylistId: params.stylistId || undefined, token: params.token, offer: params.offer, from: c.from, days: c.days },
    }).then((r) => r.data)
  ));
  return { ...parts[0], days: parts.flatMap((p) => p.days) };
}
