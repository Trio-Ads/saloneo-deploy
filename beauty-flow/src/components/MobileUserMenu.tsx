import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  UserCircleIcon,
  UserIcon,
  SwatchIcon,
  CreditCardIcon,
  CubeIcon,
  UserGroupIcon,
  ShieldCheckIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';
import { useAuthStore } from '../features/auth/store';
import { useStaffNav } from '../features/staff/nav';
import { Badge } from './ui';
import clsx from 'clsx';

export const bottomNavItemClass = (active: boolean) =>
  clsx(
    'flex flex-col items-center justify-center gap-1 px-1 text-[11px] font-medium leading-tight transition-colors duration-150 ease-out',
    active ? 'text-orange-600 dark:text-orange-400' : 'text-gray-500 active:text-gray-900 dark:text-gray-400 dark:active:text-gray-50'
  );

const MobileUserMenu: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const { logout, user } = useAuthStore();
  const plan = user?.subscription?.planType || 'FREE';
  const isAdmin = user?.isAdmin || user?.role === 'admin';
  const staffNav = useStaffNav();

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setIsOpen(false);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen]);

  const handleNavigation = (path: string) => {
    setIsOpen(false);
    navigate(path);
  };

  const handleLogout = async () => {
    setIsOpen(false);
    await logout();
    navigate('/login');
  };

  // Staff: the pages the bottom bar has no room for
  const menuItems = staffNav ? staffNav.slice(4).map((i) => ({ label: i.name, path: `/${i.href}`, icon: i.icon })) : [
    { label: t('navigation.profile'), path: '/profile', icon: UserIcon },
    { label: t('navigation.interface'), path: '/interface', icon: SwatchIcon },
    { label: t('navigation.subscription'), path: '/subscription', icon: CreditCardIcon },
    { label: t('navigation.products'), path: '/products', icon: CubeIcon },
    { label: t('navigation.team'), path: '/team', icon: UserGroupIcon },
    ...(isAdmin ? [{ label: t('navigation.admin'), path: '/admin', icon: ShieldCheckIcon }] : []),
  ];

  const rowClass = 'flex w-full min-h-12 items-center gap-3 px-5 text-[0.9375rem] font-medium transition-colors duration-150 ease-out';

  // Sheet sits above the bottom bar (z-40 < bar z-50) so "Menu" stays tappable to close it
  const sheet = isOpen && createPortal(
    <>
      <div className="fixed inset-0 z-40 bg-gray-900/30 animate-[sheet-fade_200ms_ease-out]" onClick={() => setIsOpen(false)} />
      <div
        role="menu"
        className="fixed inset-x-0 z-40 max-h-[70dvh] overflow-y-auto rounded-t-2xl border-t border-gray-200 bg-white pb-2 shadow-[0_-8px_24px_-12px_rgb(24_24_27/0.18)] animate-[sheet-up_200ms_ease-out] dark:border-gray-800 dark:bg-gray-900"
        style={{ bottom: 'calc(4rem + env(safe-area-inset-bottom))' }}
      >
        <div className="flex items-center gap-3 px-5 pt-5 pb-4 border-b border-gray-100 dark:border-gray-800">
          <span className="grid place-items-center size-10 rounded-full bg-gray-100 text-sm font-semibold text-gray-700 dark:bg-gray-800 dark:text-gray-200">
            {(user?.firstName || user?.establishmentName || '?').charAt(0).toUpperCase()}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-gray-900 dark:text-gray-50">{staffNav ? `${user?.firstName || ''} ${user?.lastName || ''}`.trim() : user?.establishmentName || user?.firstName}</p>
            <p className="truncate text-xs text-gray-500 dark:text-gray-400">{staffNav ? user?.establishmentName : user?.email}</p>
          </div>
          {!staffNav && <Badge tone={plan === 'FREE' ? 'neutral' : 'orange'}>{t(`user_menu.plans.${plan}`, plan)}</Badge>}
        </div>
        <div className="py-1">
          {menuItems.map(({ label, path, icon: Icon }) => (
            <button key={path} role="menuitem" onClick={() => handleNavigation(path)} className={`${rowClass} text-gray-700 active:bg-gray-100 dark:text-gray-200 dark:active:bg-gray-800`}>
              <Icon className="size-5 text-gray-400" />
              {label}
            </button>
          ))}
        </div>
        <div className="border-t border-gray-100 pt-1 dark:border-gray-800">
          <button role="menuitem" onClick={handleLogout} className={`${rowClass} text-red-600 active:bg-red-50 dark:text-red-400 dark:active:bg-red-500/10`}>
            <ArrowRightOnRectangleIcon className="size-5" />
            {t('actions.logout')}
          </button>
        </div>
      </div>
      <style>{'@keyframes sheet-up{from{opacity:0;transform:translateY(12px)}}@keyframes sheet-fade{from{opacity:0}}'}</style>
    </>,
    document.body
  );

  return (
    <>
      <button onClick={() => setIsOpen(!isOpen)} aria-expanded={isOpen} aria-haspopup="menu" className={bottomNavItemClass(isOpen)}>
        <UserCircleIcon className="size-6" strokeWidth={isOpen ? 2 : 1.5} />
        <span>{t('navigation.menu')}</span>
      </button>
      {sheet}
    </>
  );
};

export default MobileUserMenu;
