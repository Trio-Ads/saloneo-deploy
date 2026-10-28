import { useTranslation } from 'react-i18next';
import { create } from 'zustand';
import { CalendarDaysIcon, CubeIcon, ScissorsIcon, SunIcon, UserIcon, UsersIcon } from '@heroicons/react/24/outline';
import { useAccess } from './access';

/** Owner's answers to leave requests the staff member has not seen yet (badge on "Mes congés"). */
export const useStaffNotices = create<{ unreadDecisions: number; setUnread: (n: number) => void }>((set) => ({
  unreadDecisions: 0,
  setUnread: (unreadDecisions) => set({ unreadDecisions }),
}));

export interface NavItem { name: string; href: string; icon: typeof UserIcon; badge?: number }

/** What a staff login can open, in nav order (null for owners). */
export function useStaffNav(): NavItem[] | null {
  const { t } = useTranslation('team');
  const { isStaff, can } = useAccess();
  const unread = useStaffNotices((s) => s.unreadDecisions);
  if (!isStaff) return null;
  return [
    { name: t('staff.nav.planning'), href: 'my-planning', icon: CalendarDaysIcon },
    ...(can('viewClients') ? [{ name: t('staff.nav.clients'), href: 'clients', icon: UsersIcon }] : []),
    { name: t('staff.nav.leaves'), href: 'my-leaves', icon: SunIcon, badge: unread },
    ...(can('manageServices') ? [{ name: t('staff.nav.services'), href: 'services', icon: ScissorsIcon }] : []),
    ...(can('manageProducts') ? [{ name: t('staff.nav.products'), href: 'products', icon: CubeIcon }] : []),
    { name: t('staff.nav.profile'), href: 'my-profile', icon: UserIcon },
  ];
}
