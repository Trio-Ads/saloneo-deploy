import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../features/auth/store';
import { useSubscriptionStore } from '../features/subscription/store';

const UserIcon = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const MobileUserMenu: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const { logout } = useAuthStore();
  const { subscription } = useSubscriptionStore();

  const handleNavigation = (path: string) => {
    setIsOpen(false);
    navigate(path);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const menuItems = [
    { label: t('navigation.profile'), path: '/profile' },
    { label: t('navigation.interface'), path: '/interface' },
    { label: t('navigation.subscription'), path: '/subscription' },
    { label: t('navigation.products'), path: '/products' },
    { label: t('navigation.team'), path: '/team' },
  ];

  return (
    <div className="relative">
      {/* Bouton menu utilisateur */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex flex-col items-center justify-center space-y-0.5 p-1 text-gray-600 dark:text-gray-400"
      >
        <UserIcon />
        <span className="text-[10px] leading-tight font-medium">Menu</span>
      </button>

      {/* Menu déroulant */}
      {isOpen && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Menu */}
          <div className="absolute bottom-full right-0 mb-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 max-h-[60vh] overflow-hidden">
            <div className="py-1 max-h-[60vh] overflow-y-auto overflow-x-hidden">
              {menuItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => handleNavigation(item.path)}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                >
                  {item.label}
                </button>
              ))}
              
              <div className="border-t border-gray-200 dark:border-gray-700 my-1" />
              
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200"
              >
                {t('auth.logout')}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default MobileUserMenu;
