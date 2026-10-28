import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { Link, NavLink, Navigate, Outlet, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import {
  ArrowRightOnRectangleIcon, BanknotesIcon, BuildingStorefrontIcon, ClipboardDocumentListIcon, HomeIcon, MoonIcon, Squares2X2Icon, SunIcon,
} from '@heroicons/react/24/outline';
import { useAuthStore } from '../../auth/store';
import { useThemeColors } from '../../../hooks/useThemeColors';
import SaloneoLogo from '../../../components/SaloneoLogo';
import NavbarLanguageSelector from '../../../components/NavbarLanguageSelector';
import { bottomNavItemClass } from '../../../components/MobileUserMenu';
import { IconButton } from '../../../components/ui';
import { SupplierProfile, supplierAPI } from '../api';
import { Notice, Spinner } from '../shared';

const Ctx = createContext<{ profile: SupplierProfile; reload: () => Promise<void> } | null>(null);
export const useSupplier = () => useContext(Ctx)!;

/** Supplier space shell: its own nav (no salon pages), status banner while the account is not approved. */
const SupplierLayout: React.FC = () => {
  const { t } = useTranslation('marketplace');
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { currentTheme, toggleTheme } = useThemeColors();
  const [profile, setProfile] = useState<SupplierProfile | null>(null);
  const [error, setError] = useState(false);

  const reload = useCallback(async () => {
    try {
      setProfile((await supplierAPI.me()).data);
    } catch {
      setError(true);
    }
  }, []);
  useEffect(() => { if (user?.role === 'supplier') reload(); }, [reload, user?.role]);

  if (user && user.role !== 'supplier') return <Navigate to="/dashboard" replace />;

  const nav = [
    { to: '/fournisseur', end: true, label: t('nav.dashboard'), icon: HomeIcon },
    { to: '/fournisseur/catalogue', label: t('nav.catalogue'), icon: Squares2X2Icon },
    { to: '/fournisseur/commandes', label: t('nav.orders'), icon: ClipboardDocumentListIcon },
    { to: '/fournisseur/paiements', label: t('nav.payments'), icon: BanknotesIcon },
    { to: '/fournisseur/entreprise', label: t('nav.company'), icon: BuildingStorefrontIcon },
  ];
  const itemClass = ({ isActive }: { isActive: boolean }) => clsx(
    'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-150 ease-out',
    isActive ? 'bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-50',
  );
  const signOut = async () => { await logout(); navigate('/auth/login'); };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0F1419]">
      <nav className="sticky top-0 z-40 border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="container-2025 flex h-16 items-center justify-between gap-4">
          <Link to="/fournisseur" className="flex shrink-0 items-center gap-2">
            <SaloneoLogo variant="auto" size="sm" />
            <span className="hidden rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 sm:inline dark:bg-gray-800 dark:text-gray-300">{t('nav.badge')}</span>
          </Link>
          <div className="hidden min-w-0 items-center gap-1 md:flex">
            {nav.map((n) => <NavLink key={n.to} to={n.to} end={n.end} className={itemClass}><n.icon className="hidden size-4 lg:block" />{n.label}</NavLink>)}
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <IconButton label={t('nav.theme')} onClick={toggleTheme}>{currentTheme === 'dark' ? <SunIcon className="size-5" /> : <MoonIcon className="size-5" />}</IconButton>
            <NavbarLanguageSelector />
            <IconButton label={t('nav.logout')} onClick={signOut}><ArrowRightOnRectangleIcon className="size-5 rtl:-scale-x-100" /></IconButton>
          </div>
        </div>
      </nav>

      <main className="pb-[calc(4.5rem+env(safe-area-inset-bottom))] md:pb-0">
        <div className="container-2025">
          {error ? (
            <div className="py-8"><Notice tone="red">{t('common.load_error')}</Notice></div>
          ) : !profile ? (
            <Spinner />
          ) : (
            <Ctx.Provider value={{ profile, reload }}>
              {profile.status !== 'approved' && (
                <div className="pt-6">
                  <Notice tone={profile.status === 'pending' ? 'amber' : 'red'}>
                    <p className="font-medium">{t(`account_status.${profile.status}.title`)}</p>
                    <p className="mt-0.5">{t(`account_status.${profile.status}.body`)}</p>
                    {profile.statusReason && <p className="mt-1">{t('account_status.reason', { reason: profile.statusReason })}</p>}
                  </Notice>
                </div>
              )}
              <Outlet />
            </Ctx.Provider>
          )}
        </div>
      </main>

      {/* Phones: bottom bar */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white md:hidden dark:border-gray-800 dark:bg-gray-900" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <div className="grid h-16 grid-cols-5">
          {nav.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.end} className={({ isActive }) => bottomNavItemClass(isActive)}>
              {({ isActive }) => (<><n.icon className="size-6" strokeWidth={isActive ? 2 : 1.5} /><span className="w-full truncate text-center">{n.label}</span></>)}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default SupplierLayout;
