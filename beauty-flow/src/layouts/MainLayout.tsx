import React, { useState, useEffect } from 'react';
import { Link, useLocation, Outlet, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import {
  HomeIcon,
  CalendarDaysIcon,
  UsersIcon,
  ScissorsIcon,
  CubeIcon,
  UserGroupIcon,
  ShieldCheckIcon,
  Bars3Icon,
  XMarkIcon,
  SunIcon,
  MoonIcon,
} from '@heroicons/react/24/outline';
import { useThemeColors } from '../hooks/useThemeColors';
import { useClientStore } from '../features/clients/store';
import { useServiceStore } from '../features/services/store';
import { useTeamStore } from '../features/team/store';
import { useAppointmentStore } from '../features/appointments/store';
import { useAuthStore } from '../features/auth/store';
import UserMenu from '../components/UserMenu';
import NavbarLanguageSelector from '../components/NavbarLanguageSelector';
import MobileBottomNav from '../components/MobileBottomNav';
import SaloneoLogo from '../components/SaloneoLogo';
import { IconButton } from '../components/ui';
import { staffAPI } from '../services/api';
import { useStaffNav, useStaffNotices } from '../features/staff/nav';
import { isNativeApp } from '../native';

const MOBILE_QUERY = '(max-width: 768px)';

const MainLayout: React.FC = () => {
  const location = useLocation();
  const { t } = useTranslation();
  const { currentTheme, toggleTheme } = useThemeColors();
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.isAdmin || user?.role === 'admin';
  const isStaff = user?.role === 'staff';
  const canViewClients = !isStaff || user?.permissions?.canViewClients !== false;
  const staffNav = useStaffNav();
  const setUser = useAuthStore((state) => state.setUser);
  const setUnread = useStaffNotices((state) => state.setUnread);
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(() => window.matchMedia(MOBILE_QUERY).matches);

  const fetchClients = useClientStore((state) => state.fetchClients);
  const fetchServices = useServiceStore((state) => state.fetchServices);
  const fetchMembers = useTeamStore((state) => state.fetchMembers);
  const loadAppointments = useAppointmentStore((state) => state.loadAppointments);

  // Phones get the bottom bar, tablets and desktops the top bar
  useEffect(() => {
    const mediaQuery = window.matchMedia(MOBILE_QUERY);
    const handleMediaChange = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mediaQuery.addEventListener('change', handleMediaChange);
    return () => mediaQuery.removeEventListener('change', handleMediaChange);
  }, []);

  // Close the tablet menu on navigation
  useEffect(() => setIsOpen(false), [location.pathname]);

  // Charger toutes les données au démarrage (staff: only what their permissions open)
  const isSupplier = user?.role === 'supplier';
  useEffect(() => {
    if (isSupplier) return;
    Promise.all([canViewClients ? fetchClients() : null, fetchServices(), fetchMembers(), loadAppointments()]).catch((error) =>
      console.error('Erreur lors du chargement des données:', error)
    );
  }, [fetchClients, fetchServices, fetchMembers, loadAppointments, canViewClients, isSupplier]);

  // Staff: permissions the owner may have changed since login, and unread answers to leave requests
  useEffect(() => {
    if (!isStaff) return;
    staffAPI.me().then(({ data }) => { setUser(data.user); setUnread(data.unreadDecisions); }).catch(() => undefined);
  }, [isStaff, location.pathname, setUser, setUnread]);

  const navigation: { name: string; href: string; icon: typeof HomeIcon; badge?: number }[] = staffNav ?? [
    { name: t('navigation.dashboard'), href: 'dashboard', icon: HomeIcon },
    { name: t('navigation.appointments'), href: 'appointments', icon: CalendarDaysIcon },
    { name: t('navigation.clients'), href: 'clients', icon: UsersIcon },
    { name: t('navigation.services'), href: 'services', icon: ScissorsIcon },
    { name: t('navigation.products'), href: 'products', icon: CubeIcon },
    { name: t('navigation.team'), href: 'team', icon: UserGroupIcon },
    ...(isAdmin ? [{ name: t('navigation.admin'), href: 'admin', icon: ShieldCheckIcon }] : []),
  ];

  const isActiveRoute = (href: string) =>
    location.pathname === `/${href}` || (location.pathname === '/' && href === 'dashboard');

  const navItemClass = (active: boolean) =>
    clsx(
      'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-150 ease-out',
      active
        ? 'bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400'
        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-50'
    );

  // Suppliers never see salon pages: their space is /fournisseur
  if (isSupplier) return <Navigate to="/fournisseur" replace />;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0F1419]">
      <nav className="sticky top-0 z-50 pt-[env(safe-area-inset-top)] border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="container-2025 flex h-16 items-center justify-between gap-4">
          <Link to={isNativeApp ? '/dashboard' : '/'} className="shrink-0">
            <SaloneoLogo variant="auto" size="sm" />
          </Link>

          {!isMobile && (
            <div className="hidden lg:flex items-center gap-1 min-w-0">
              {navigation.map((item) => {
                const Icon = item.icon;
                const active = isActiveRoute(item.href);
                return (
                  <Link key={item.href} to={item.href} className={navItemClass(active)} aria-current={active ? 'page' : undefined}>
                    <Icon className="hidden xl:block size-4" />
                    {item.name}
                    {!!item.badge && <span className="grid min-w-5 place-items-center rounded-full bg-orange-500 px-1.5 text-[0.6875rem] font-semibold tabular-nums text-white">{item.badge}</span>}
                  </Link>
                );
              })}
            </div>
          )}

          <div className="flex items-center gap-1 shrink-0">
            <IconButton label={t('navigation.toggle_theme')} onClick={toggleTheme}>
              {currentTheme === 'dark' ? <SunIcon className="size-5" /> : <MoonIcon className="size-5" />}
            </IconButton>
            <NavbarLanguageSelector />
            {!isMobile && (
              <>
                <UserMenu />
                <IconButton
                  label={t('navigation.main_menu')}
                  className="lg:hidden"
                  aria-expanded={isOpen}
                  onClick={() => setIsOpen(!isOpen)}
                >
                  {isOpen ? <XMarkIcon className="size-5" /> : <Bars3Icon className="size-5" />}
                </IconButton>
              </>
            )}
          </div>
        </div>

        {/* Tablet menu: drops below the bar */}
        {isOpen && !isMobile && (
          <>
            <div className="lg:hidden fixed inset-0 top-[calc(4rem+env(safe-area-inset-top))] bg-gray-900/30" onClick={() => setIsOpen(false)} />
            <div className="lg:hidden absolute inset-x-0 top-full border-b border-gray-200 bg-white px-4 py-3 shadow-[0_8px_16px_-8px_rgb(24_24_27/0.12)] animate-[menu-in_150ms_ease-out] dark:border-gray-800 dark:bg-gray-900">
              <div className="grid grid-cols-2 gap-1">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  const active = isActiveRoute(item.href);
                  return (
                    <Link key={item.href} to={item.href} className={clsx(navItemClass(active), 'min-h-11')}>
                      <Icon className="size-5" />
                      {item.name}
                      {!!item.badge && <span className="grid min-w-5 place-items-center rounded-full bg-orange-500 px-1.5 text-[0.6875rem] font-semibold tabular-nums text-white">{item.badge}</span>}
                    </Link>
                  );
                })}
              </div>
            </div>
            <style>{'@keyframes menu-in{from{opacity:0;transform:translateY(-4px)}}'}</style>
          </>
        )}
      </nav>

      <main className={isMobile ? 'pb-[calc(4.5rem+env(safe-area-inset-bottom))]' : undefined}>
        <div className="container-2025">
          <Outlet />
        </div>
      </main>

      {isMobile && <MobileBottomNav />}
    </div>
  );
};

export default MainLayout;
