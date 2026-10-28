import { useAuthStore } from '../auth/store';
import { StaffPermissions, UserProfile } from '../auth/types';

/** Mirror of the API's permission check (beauty-flow-backend/src/middleware/permissions.ts) — the API enforces, this only shapes the UI. */
export type Perm = 'owner' | 'createAppointments' | 'editAppointments' | 'viewClients' | 'viewClientContacts' | 'viewRevenue' | 'manageServices' | 'manageProducts';

export const DEFAULT_STAFF_PERMISSIONS: StaffPermissions = {
  planning: 'own',
  canCreateAppointments: true,
  canEditAppointments: 'own',
  canViewClients: true,
  canViewClientContacts: false,
  canViewRevenue: false,
  canManageServices: false,
  canManageProducts: false,
};

export const isStaffUser = (user?: UserProfile | null) => user?.role === 'staff';

export function canUser(user: UserProfile | null | undefined, perm: Perm): boolean {
  if (!user) return false;
  if (!isStaffUser(user)) return user.role !== 'supplier';
  const p = { ...DEFAULT_STAFF_PERMISSIONS, ...user.permissions };
  switch (perm) {
    case 'owner': return false;
    case 'createAppointments': return p.canCreateAppointments;
    case 'editAppointments': return p.canEditAppointments !== 'none';
    case 'viewClients': return p.canViewClients;
    case 'viewClientContacts': return p.canViewClients && p.canViewClientContacts;
    case 'viewRevenue': return p.canViewRevenue;
    case 'manageServices': return p.canManageServices;
    case 'manageProducts': return p.canManageProducts;
  }
}

export function useAccess() {
  const user = useAuthStore((s) => s.user);
  const isStaff = isStaffUser(user);
  const p = { ...DEFAULT_STAFF_PERMISSIONS, ...user?.permissions };
  return {
    user,
    isStaff,
    can: (perm: Perm) => canUser(user, perm),
    /** Team member id the UI is limited to (own planning), or null */
    scope: isStaff && p.planning === 'own' ? user?.teamMemberId ?? null : null,
    /** May act on an appointment held by stylistId */
    canEdit: (stylistId?: string) =>
      !isStaff || (p.canEditAppointments !== 'none' && (p.canEditAppointments === 'all' && p.planning === 'all' ? true : stylistId === user?.teamMemberId)),
  };
}
