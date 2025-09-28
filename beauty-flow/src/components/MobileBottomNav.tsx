import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import UserMenu from './UserMenu';

// Icons pour la navigation mobile
const DashboardIcon = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

const CalendarIcon = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const UsersIcon = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
  </svg>
);

const ScissorsIcon = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243 4.243 3 3 0 004.243-4.243zm0-5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z" />
  </svg>
);

const MenuIcon = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

interface MobileBottomNavProps {
  className?: string;
}

const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ className = '' }) => {
  const location = useLocation();
  const { t } = useTranslation();

  const navItems = [
    {
      name: t('navigation.dashboard') || 'Dashboard',
      href: '/dashboard',
      icon: DashboardIcon,
      gradient: 'from-purple-500 to-indigo-500'
    },
    {
      name: t('navigation.appointments'),
      href: '/appointments',
      icon: CalendarIcon,
      gradient: 'from-indigo-500 to-teal-500'
    },
    {
      name: t('navigation.clients'),
      href: '/clients',
      icon: UsersIcon,
      gradient: 'from-emerald-500 to-cyan-500'
    },
    {
      name: t('navigation.services'),
      href: '/services',
      icon: ScissorsIcon,
      gradient: 'from-blue-500 to-emerald-500'
    }
  ];

  const isActiveRoute = (href: string) => {
    return location.pathname === href || 
           (location.pathname === '/' && href === '/dashboard');
  };

  return (
    <nav className={`fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-t border-gray-200/20 dark:border-gray-700/20 ${className}`}>
      <div className="grid grid-cols-5 h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = isActiveRoute(item.href);
          
          return (
            <Link
              key={item.href}
              to={item.href}
              className={`
                relative flex flex-col items-center justify-center space-y-1 transition-all duration-300
                ${isActive 
                  ? 'text-indigo-600 dark:text-indigo-400' 
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }
              `}
            >
              {/* Indicateur actif en haut */}
              {isActive && (
                <div className={`absolute top-0 left-1/2 transform -translate-x-1/2 w-12 h-0.5 bg-gradient-to-r ${item.gradient}`} />
              )}
              
              {/* Icône avec effet de scale au tap */}
              <div className={`
                relative p-1 rounded-lg transition-all duration-300 transform active:scale-95
                ${isActive ? 'scale-110' : 'hover:scale-105'}
              `}>
                <Icon />
                {/* Effet glow pour l'élément actif */}
                {isActive && (
                  <div className={`absolute inset-0 bg-gradient-to-r ${item.gradient} opacity-20 blur-xl rounded-lg`} />
                )}
              </div>
              
              {/* Label */}
              <span className={`
                text-xs font-medium transition-all duration-300
                ${isActive ? 'font-semibold' : ''}
              `}>
                {item.name}
              </span>
            </Link>
          );
        })}
        
        {/* Menu utilisateur */}
        <div className="relative flex items-center justify-center">
          <UserMenu />
        </div>
      </div>
      
      {/* Ombre subtile en haut */}
      <div className="absolute -top-4 left-0 right-0 h-4 bg-gradient-to-t from-black/5 to-transparent pointer-events-none" />
    </nav>
  );
};

export default MobileBottomNav;
