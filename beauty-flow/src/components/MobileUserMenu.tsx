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
        className={`flex flex-col items-center justify-center space-y-0.5 p-1 transition-all duration-300 ${
          isOpen 
            ? 'text-orange-600 dark:text-orange-400 scale-105' 
            : 'text-gray-600 dark:text-gray-400 hover:text-orange-500 dark:hover:text-orange-300'
        }`}
      >
        <div className={`relative p-1 rounded-lg transition-all duration-300 ${
          isOpen ? 'bg-orange-50 dark:bg-orange-900/20' : ''
        }`}>
          <UserIcon />
        </div>
        <span className={`text-[10px] leading-tight font-medium transition-all duration-300 ${
          isOpen ? 'font-semibold' : ''
        }`}>
          Menu
        </span>
      </button>

      {/* Menu déroulant */}
      {isOpen && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 z-40 bg-black/20 dark:bg-black/40 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Menu avec glassmorphism */}
          <div className="absolute bottom-full right-0 mb-2 w-56 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-2xl shadow-[0_8px_32px_rgba(249,115,22,0.15)] dark:shadow-[0_8px_32px_rgba(251,146,60,0.2)] border border-orange-500/20 dark:border-orange-400/20 z-50 max-h-[60vh] overflow-hidden animate-slide-down">
            <div className="py-2 max-h-[60vh] overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-orange-300 dark:scrollbar-thumb-orange-600 scrollbar-track-transparent">
              {menuItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => handleNavigation(item.path)}
                  className="w-full text-left px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:text-orange-600 dark:hover:text-orange-400 transition-all duration-200 active:scale-95"
                >
                  {item.label}
                </button>
              ))}
              
              <div className="border-t border-orange-500/20 dark:border-orange-400/20 my-2" />
              
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200 transition-all duration-200 active:scale-95"
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
