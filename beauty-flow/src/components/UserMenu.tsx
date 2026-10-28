import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  UserIcon,
  SwatchIcon,
  CreditCardIcon,
  ArrowRightOnRectangleIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';
import { useAuthStore } from '../features/auth/store';
import { Badge } from './ui';

const UserMenu: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { logout, user } = useAuthStore();
  const menuRef = useRef<HTMLDivElement>(null);
  // The auth user carries the plan from the API; the subscription store defaults to FREE until /subscription is visited
  const plan = user?.subscription?.planType || 'FREE';
  const displayName = user?.establishmentName || [user?.firstName, user?.lastName].filter(Boolean).join(' ');

  // Fermer le menu au clic extérieur ou avec Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setIsOpen(false);
    };
    const handleKey = (e: KeyboardEvent) => e.key === 'Escape' && setIsOpen(false);
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKey);
    };
  }, [isOpen]);

  const handleNavigation = (path: string) => {
    setIsOpen(false);
    navigate(path);
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      setIsOpen(false);
      navigate('/login');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      // Rediriger quand même vers la page de connexion en cas d'erreur
      navigate('/login');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const menuItems = [
    { icon: UserIcon, label: t('navigation.profile'), description: t('user_menu.menu_items.profile.description'), href: '/profile' },
    { icon: SwatchIcon, label: t('navigation.interface'), description: t('user_menu.menu_items.interface.description'), href: '/interface' },
    { icon: CreditCardIcon, label: t('navigation.subscription'), description: t('user_menu.menu_items.subscription.description'), href: '/subscription' },
  ];

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 rounded-lg p-1 ps-1 pe-2 transition-colors duration-150 ease-out hover:bg-gray-100 dark:hover:bg-gray-800"
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label={displayName || t('navigation.profile')}
      >
        <span className="grid place-items-center size-8 rounded-full bg-gray-100 text-sm font-semibold text-gray-700 dark:bg-gray-800 dark:text-gray-200">
          {(displayName || '?').charAt(0).toUpperCase()}
        </span>
        <ChevronDownIcon className={`size-4 text-gray-400 transition-transform duration-150 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div
          role="menu"
          className="absolute end-0 top-full mt-2 w-72 origin-top-right rtl:origin-top-left overflow-hidden rounded-xl border border-gray-200 bg-white shadow-[0_12px_32px_-8px_rgb(24_24_27/0.18)] z-50 animate-[menu-pop_200ms_ease-out] dark:border-gray-800 dark:bg-gray-900"
        >
          <div className="flex items-start gap-3 p-4 border-b border-gray-100 dark:border-gray-800">
            <span className="grid place-items-center size-10 shrink-0 rounded-full bg-gray-100 text-sm font-semibold text-gray-700 dark:bg-gray-800 dark:text-gray-200">
              {(displayName || '?').charAt(0).toUpperCase()}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-gray-900 dark:text-gray-50">{displayName}</p>
              <p className="truncate text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
              <Badge tone={plan === 'FREE' ? 'neutral' : 'orange'} className="mt-2">
                {t('user_menu.plan_prefix')} {t(`user_menu.plans.${plan}`, plan)}
              </Badge>
            </div>
          </div>

          <nav className="p-1.5">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.href}
                  role="menuitem"
                  onClick={() => handleNavigation(item.href)}
                  className="flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-start transition-colors duration-150 ease-out hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <Icon className="mt-0.5 size-5 shrink-0 text-gray-400" />
                  <span className="min-w-0">
                    <span className="block text-sm font-medium text-gray-900 dark:text-gray-50">{item.label}</span>
                    <span className="block text-xs text-gray-500 dark:text-gray-400">{item.description}</span>
                  </span>
                </button>
              );
            })}
          </nav>

          <div className="p-1.5 border-t border-gray-100 dark:border-gray-800">
            <button
              role="menuitem"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 transition-colors duration-150 ease-out hover:bg-red-50 hover:text-red-600 disabled:opacity-50 disabled:cursor-not-allowed dark:text-gray-200 dark:hover:bg-red-500/10 dark:hover:text-red-400"
            >
              <ArrowRightOnRectangleIcon className="size-5 shrink-0" />
              {isLoggingOut ? t('actions.logging_out') : t('actions.logout')}
            </button>
            <p className="px-3 pt-1 pb-1.5 text-xs text-gray-400 dark:text-gray-500">{t('user_menu.version')}</p>
          </div>
          <style>{'@keyframes menu-pop{from{opacity:0;transform:scale(.97)}}'}</style>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
