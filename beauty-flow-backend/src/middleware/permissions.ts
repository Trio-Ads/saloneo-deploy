import { DEFAULT_STAFF_PERMISSIONS, StaffPermissions } from '../models/Team';

/**
 * Staff logins (role 'staff') act inside their owner's salon: `authenticate` sets req.userId to the owner's id,
 * so every salon-scoped query keeps working, and checks each request against STAFF_POLICY below.
 * Default deny: a salon route missing from the table is owner-only. Controllers then narrow with
 * planningScope / canEditAppointment, and responses go through sanitizeForStaff.
 */

export interface Actor {
  id: string;
  role: string;
  teamMemberId?: string;
  permissions?: StaffPermissions;
}

export type Perm =
  | 'owner'
  | 'staff'
  | 'createAppointments'
  | 'editAppointments'
  | 'viewClients'
  | 'viewClientContacts'
  | 'viewRevenue'
  | 'manageServices'
  | 'manageProducts';

const isOwner = (a?: Actor) => !!a && (a.role === 'owner' || a.role === 'admin');

/** Stored (possibly legacy or partial) permissions → the full shape with defaults. */
export function normalizePermissions(raw: any): StaffPermissions {
  const p = raw && typeof raw === 'object' ? raw : {};
  const bool = (k: keyof StaffPermissions) => (typeof p[k] === 'boolean' ? p[k] : DEFAULT_STAFF_PERMISSIONS[k]) as boolean;
  return {
    planning: p.planning === 'all' ? 'all' : 'own',
    canCreateAppointments: bool('canCreateAppointments'),
    canEditAppointments: ['none', 'own', 'all'].includes(p.canEditAppointments) ? p.canEditAppointments : DEFAULT_STAFF_PERMISSIONS.canEditAppointments,
    canViewClients: bool('canViewClients'),
    canViewClientContacts: bool('canViewClientContacts'),
    canViewRevenue: bool('canViewRevenue'),
    canManageServices: bool('canManageServices'),
    canManageProducts: bool('canManageProducts'),
  };
}

/** The one permission check. Owners/admins can do everything in their salon; suppliers nothing here. */
export function can(req: { actor?: Actor }, perm: Perm): boolean {
  const a = req.actor;
  if (isOwner(a)) return true;
  if (!a || a.role !== 'staff') return false;
  const p = a.permissions || DEFAULT_STAFF_PERMISSIONS;
  switch (perm) {
    case 'staff': return true;
    case 'createAppointments': return p.canCreateAppointments;
    case 'editAppointments': return p.canEditAppointments !== 'none';
    case 'viewClients': return p.canViewClients;
    case 'viewClientContacts': return p.canViewClients && p.canViewClientContacts;
    case 'viewRevenue': return p.canViewRevenue;
    case 'manageServices': return p.canManageServices;
    case 'manageProducts': return p.canManageProducts;
    default: return false;
  }
}

/** Team member id the request is limited to (staff with "own planning"), or null when it sees the whole salon. */
export function planningScope(req: { actor?: Actor }): string | null {
  const a = req.actor;
  if (!a || a.role !== 'staff') return null;
  return (a.permissions || DEFAULT_STAFF_PERMISSIONS).planning === 'all' ? null : a.teamMemberId || '-';
}

export const canSeeAppointment = (req: { actor?: Actor }, stylistId: unknown) => {
  const scope = planningScope(req);
  return !scope || String(stylistId) === scope;
};

/** May this actor change (move, edit, set the status of) an appointment held by stylistId? */
export function canEditAppointment(req: { actor?: Actor }, stylistId: unknown): boolean {
  const a = req.actor;
  if (isOwner(a)) return true;
  if (!a || a.role !== 'staff' || !can(req, 'editAppointments')) return false;
  const p = a.permissions || DEFAULT_STAFF_PERMISSIONS;
  if (p.canEditAppointments === 'own' || p.planning === 'own') return String(stylistId) === a.teamMemberId;
  return true;
}

/* ── route policy for staff logins ───────────────────────────── */

type Check = Perm | ((a: Actor, m: RegExpMatchArray) => boolean);
const ID = '([a-f0-9]{24})';
const re = (s: string) => new RegExp(`^${s}$`);

/** [method, path under /api, check]. First match wins; anything else is refused to staff. */
export const STAFF_POLICY: Array<[string, RegExp, Check]> = [
  // Staff space: own profile, password, leave requests, stats (each handler re-checks what it needs)
  ['*', re('/staff(/.*)?'), 'staff'],
  // Salon name, logo, currency for the app shell (reduced projection for staff)
  ['GET', re('/profile'), 'staff'],

  // Agenda
  ['GET', re('/appointments/(booking-settings|available-slots)'), 'staff'],
  ['GET', re('/appointments'), 'staff'],
  ['GET', re(`/appointments/${ID}`), 'staff'],
  ['POST', re('/appointments'), 'createAppointments'],
  ['PUT', re(`/appointments/${ID}`), 'editAppointments'],
  ['PATCH', re(`/appointments/${ID}/status`), 'editAppointments'],

  // Clients (contacts masked unless canViewClientContacts); a new walk-in client comes with a new appointment
  ['GET', re('/clients/stats'), 'viewRevenue'],
  ['GET', re('/clients(/search)?'), 'viewClients'],
  ['GET', re(`/clients/${ID}`), 'viewClients'],
  ['POST', re('/clients'), 'createAppointments'],

  // Services (prices hidden unless canViewRevenue); deleting one stays with the owner
  ['GET', re('/services/stats'), 'viewRevenue'],
  ['GET', re('/services(/categories)?'), 'staff'],
  ['GET', re(`/services/${ID}`), 'staff'],
  ['POST', re('/services'), 'manageServices'],
  ['PUT', re(`/services/${ID}(/images)?`), 'manageServices'],
  ['PATCH', re(`/services/${ID}/toggle-status`), 'manageServices'],
  ['POST', re(`/services/${ID}/images`), 'manageServices'],
  ['DELETE', re(`/services/${ID}/images`), 'manageServices'],
  ['POST', re(`/upload/service/${ID}/image`), 'manageServices'],

  // Products (stock)
  ['GET', re('/products(/stats)?'), 'manageProducts'],
  ['GET', re(`/products/${ID}`), 'manageProducts'],
  ['POST', re('/products'), 'manageProducts'],
  ['PUT', re(`/products/${ID}`), 'manageProducts'],
  ['PATCH', re(`/products/${ID}/quantity`), 'manageProducts'],
  ['DELETE', re(`/products/${ID}`), 'manageProducts'],

  // Team: names, colours, hours for the agenda (reduced projection for staff); own photo; leave certificate
  ['GET', re('/team'), 'staff'],
  ['POST', re(`/upload/team/${ID}/avatar`), (a, m) => m[1] === a.teamMemberId],
  // Leave certificates (private): the handler checks it is their own
  ['POST', re('/leave-attachments'), 'staff'],
  ['GET', re(`/leave-attachments/${ID}`), 'staff'],
];

/** '/api/appointments/?page=2' → '/appointments' */
export const apiPath = (url: string) => (url.split('?')[0].replace(/^\/api(?=\/|$)/, '').replace(/\/+$/, '') || '/');

export function staffAllowed(actor: Actor, method: string, url: string): boolean {
  const path = apiPath(url);
  for (const [m, pattern, check] of STAFF_POLICY) {
    if (m !== '*' && m !== method) continue;
    const match = path.match(pattern);
    if (!match) continue;
    return typeof check === 'function' ? check(actor, match) : can({ actor }, check);
  }
  return false;
}

/* ── response filtering ──────────────────────────────────────── */

/** Objects under these keys are clients (the client list, a populated appointment.clientId, clientInfo snapshot). */
const CLIENT_KEYS = new Set(['client', 'clients', 'clientId', 'clientInfo']);
const CONTACT_KEYS = new Set(['phone', 'email', 'address']);
const MONEY_KEYS = new Set([
  'price', 'amount', 'deposit', 'depositAmount', 'depositPercentage', 'totalSpent', 'averageSpent',
  'revenue', 'totalRevenue', 'monthRevenue', 'priceRange', 'minPrice', 'maxPrice',
]);

export function maskContact(key: string, value: unknown): unknown {
  if (typeof value !== 'string' || !value) return value;
  if (key === 'phone') {
    const digits = value.replace(/\D/g, '');
    return `•• •• •• ${digits.length > 4 ? digits.slice(-2) : '••'}`;
  }
  if (key === 'email') return value.replace(/^(.)[^@]*(@.*)?$/, (_s, c, d) => `${c}•••${d || ''}`);
  return '•••';
}

/** What a staff login may receive: client contacts masked, money removed, as their permissions say. */
export function sanitizeForStaff(body: unknown, permissions?: StaffPermissions): unknown {
  const p = permissions || DEFAULT_STAFF_PERMISSIONS;
  const hideContacts = !(p.canViewClients && p.canViewClientContacts);
  const hideMoney = !p.canViewRevenue;
  if ((!hideContacts && !hideMoney) || body === null || typeof body !== 'object') return body;
  const walk = (v: any, inClient: boolean): any => {
    if (Array.isArray(v)) return v.map((x) => walk(x, inClient));
    if (!v || typeof v !== 'object') return v;
    const out: Record<string, any> = {};
    for (const [k, x] of Object.entries(v)) {
      if (hideMoney && MONEY_KEYS.has(k)) continue;
      out[k] = hideContacts && inClient && CONTACT_KEYS.has(k) ? maskContact(k, x) : walk(x, inClient || CLIENT_KEYS.has(k));
    }
    return out;
  };
  // Round-trip first: mongoose documents become plain JSON (ObjectIds → strings, dates → ISO)
  return walk(JSON.parse(JSON.stringify(body)), false);
}
