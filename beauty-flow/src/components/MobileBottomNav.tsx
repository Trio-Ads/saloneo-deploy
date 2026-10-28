import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { HomeIcon, CalendarDaysIcon, UsersIcon, ScissorsIcon } from '@heroicons/react/24/outline';
import MobileUserMenu, { bottomNavItemClass } from './MobileUserMenu';
import { useStaffNav } from '../features/staff/nav';

interface MobileBottomNavProps {
  className?: string;
}

const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ className = '' }) => {
  const location = useLocation();
  const { t } = useTranslation();

  const staffNav = useStaffNav();
  // Staff: their first four pages (the rest is in the menu sheet)
  const navItems: { name: string; href: string; icon: typeof HomeIcon; badge?: number }[] = staffNav ? staffNav.slice(0, 4).map((i) => ({ ...i, href: `/${i.href}` })) : [
    { name: t('navigation.home'), href: '/dashboard', icon: HomeIcon },
    { name: t('navigation.appointments'), href: '/appointments', icon: CalendarDaysIcon },
    { name: t('navigation.clients'), href: '/clients', icon: UsersIcon },
    { name: t('navigation.services'), href: '/services', icon: ScissorsIcon },
  ];

  const isActiveRoute = (href: string) =>
    location.pathname === href || (location.pathname === '/' && href === '/dashboard');

  return (
    <nav
      className={`fixed inset-x-0 bottom-0 z-50 border-t border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 ${className}`}
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="grid grid-cols-5 h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActiveRoute(item.href);
          return (
            <Link key={item.href} to={item.href} className={bottomNavItemClass(active)} aria-current={active ? 'page' : undefined}>
              <span className="relative">
                <Icon className="size-6" strokeWidth={active ? 2 : 1.5} />
                {!!item.badge && <span className="absolute -end-2 -top-1 grid min-w-4 place-items-center rounded-full bg-orange-500 px-1 text-[0.625rem] font-semibold tabular-nums text-white">{item.badge}</span>}
              </span>
              <span className="w-full truncate text-center">{item.name}</span>
            </Link>
          );
        })}
        <MobileUserMenu />
      </div>
    </nav>
  );
};

export default MobileBottomNav;
