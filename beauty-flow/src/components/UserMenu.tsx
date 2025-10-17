import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { 
  UserIcon, 
  Cog6ToothIcon, 
  CreditCardIcon, 
  ArrowRightOnRectangleIcon,
  GlobeAltIcon,
  SparklesIcon,
  ChevronDownIcon,
  StarIcon,
  BoltIcon
} from '@heroicons/react/24/outline';
import { useSubscriptionStore } from '../features/subscription/store';
import { useAuthStore } from '../features/auth/store';
import './UserMenu.css';

const UserMenu: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { subscription } = useSubscriptionStore();
  const { logout } = useAuthStore();
  const menuRef = useRef<HTMLDivElement>(null);

  // Fermer le menu quand on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Gérer le scroll du body sur mobile
  useEffect(() => {
    if (isOpen && window.innerWidth <= 768) {
      document.body.classList.add('menu-open');
    } else {
      document.body.classList.remove('menu-open');
    }

    return () => {
      document.body.classList.remove('menu-open');
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

  // Configuration des badges de plan
  const getPlanBadge = () => {
    const plan = subscription.currentPlan;
    switch (plan) {
      case 'FREE':
        return { text: 'Gratuit', class: 'bg-gray-500 dark:bg-gray-600' };
      case 'STARTER':
        return { text: 'Starter', class: 'bg-gradient-to-r from-orange-500 to-orange-600 dark:from-orange-600 dark:to-orange-500' };
      case 'PRO':
        return { text: 'Pro', class: 'bg-gradient-to-r from-orange-600 to-orange-700 dark:from-orange-500 dark:to-orange-600' };
      case 'ENTERPRISE':
        return { text: 'Enterprise', class: 'bg-gradient-to-r from-orange-400 to-orange-500 dark:from-orange-500 dark:to-orange-400' };
      default:
        return { text: 'Gratuit', class: 'bg-gray-500 dark:bg-gray-600' };
    }
  };

  const planBadge = getPlanBadge();

  const menuItems = [
    {
      icon: UserIcon,
      label: t('navigation.profile'),
      description: 'Gérer vos informations',
      href: '/profile',
      gradient: 'from-orange-500 to-orange-600',
      hoverGradient: 'from-orange-600 to-orange-700'
    },
    {
      icon: Cog6ToothIcon,
      label: t('navigation.interface'),
      description: 'Personnaliser votre salon',
      href: '/interface',
      gradient: 'from-orange-400 to-orange-500',
      hoverGradient: 'from-orange-500 to-orange-600'
    },
    {
      icon: CreditCardIcon,
      label: t('navigation.subscription'),
      description: 'Plans et facturation',
      href: '/subscription',
      gradient: 'from-orange-600 to-orange-700',
      hoverGradient: 'from-orange-700 to-orange-800'
    }
  ];

  return (
    <div className="relative" ref={menuRef}>
      {/* Bouton principal avec avatar */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`group relative flex items-center space-x-2 p-1.5 rounded-xl transition-all duration-300 hover:scale-105 ${
          isOpen 
            ? 'bg-white/20 dark:bg-gray-800/40 backdrop-blur-xl shadow-2xl ring-2 ring-orange-500/30 dark:ring-orange-400/30' 
            : 'bg-white/10 dark:bg-gray-800/20 backdrop-blur-sm hover:bg-white/20 dark:hover:bg-gray-800/30'
        }`}
        aria-expanded={isOpen}
      >
        {/* Avatar avec effet glow */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-orange-600 dark:from-orange-600 dark:to-orange-500 rounded-full blur-md opacity-50 group-hover:opacity-75 transition-opacity duration-300"></div>
          <div className="relative w-9 h-9 bg-gradient-to-r from-orange-500 to-orange-600 dark:from-orange-600 dark:to-orange-500 rounded-full flex items-center justify-center shadow-xl">
            <UserIcon className="h-4 w-4 text-white dark:text-gray-900" />
          </div>
          {/* Badge de plan */}
          <div className={`absolute -top-0.5 -right-0.5 ${planBadge.class} text-white text-xs font-bold px-1 py-0.5 rounded-full shadow-lg animate-pulse`}>
            {planBadge.text.charAt(0)}
          </div>
        </div>

        {/* Chevron animé */}
        <ChevronDownIcon 
          className={`h-3.5 w-3.5 text-white/70 dark:text-gray-300/70 transition-transform duration-300 ${
            isOpen ? 'rotate-180' : ''
          }`} 
        />
      </button>

      {/* Menu déroulant spectaculaire */}
      {isOpen && (
        <>
          {/* Overlay */}
          <div 
            className="user-menu-overlay fixed inset-0 z-40 bg-black/20 dark:bg-black/40 backdrop-blur-sm transition-opacity"
            onClick={() => setIsOpen(false)}
          />
          
          <div className="user-menu-dropdown absolute right-0 mt-3 w-72 bg-white/95 dark:bg-gray-900/95 backdrop-blur-2xl rounded-2xl shadow-2xl border border-orange-500/20 dark:border-orange-400/20 z-50 animate-slide-down max-h-[calc(100vh-100px)] overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-orange-300 dark:scrollbar-thumb-orange-600 scrollbar-track-transparent">
            
            {/* Header avec infos utilisateur */}
            <div className="relative p-4 bg-gradient-to-br from-orange-500/10 to-orange-600/10 dark:from-orange-600/10 dark:to-orange-500/10 border-b border-orange-500/20 dark:border-orange-400/20">
              {/* Particules décoratives */}
              <div className="absolute top-2 right-2 w-1 h-1 bg-orange-400 dark:bg-orange-500 rounded-full animate-ping"></div>
              <div className="absolute bottom-2 left-2 w-1.5 h-1.5 bg-orange-500 dark:bg-orange-400 rounded-full animate-pulse"></div>
              
              <div className="flex items-center space-x-3">
                {/* Avatar principal */}
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-orange-600 dark:from-orange-600 dark:to-orange-500 rounded-xl blur-lg opacity-30"></div>
                  <div className="relative w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 dark:from-orange-600 dark:to-orange-500 rounded-xl flex items-center justify-center shadow-xl">
                    <UserIcon className="h-6 w-6 text-white dark:text-gray-900" />
                  </div>
                </div>
                
                {/* Infos utilisateur */}
                <div className="flex-1">
                  <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-1">Utilisateur Saloneo</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">user@saloneo.com</p>
                  <div className={`inline-flex items-center ${planBadge.class} text-white dark:text-gray-900 text-xs font-bold px-2 py-0.5 rounded-full shadow-lg`}>
                    <StarIcon className="h-2.5 w-2.5 mr-1" />
                    Plan {planBadge.text}
                  </div>
                </div>
              </div>
            </div>

            {/* Menu items */}
            <nav className="p-1.5">
              {menuItems.map((item, index) => {
                const IconComponent = item.icon;
                return (
                  <button
                    key={item.href}
                    onClick={() => handleNavigation(item.href)}
                    className="w-full group relative flex items-center p-3 rounded-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-lg mb-1.5 overflow-hidden"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    {/* Background gradient au hover */}
                    <div className={`absolute inset-0 bg-gradient-to-r ${item.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-xl`}></div>
                    
                    {/* Icône avec gradient */}
                    <div className={`relative flex items-center justify-center w-10 h-10 bg-gradient-to-r ${item.gradient} rounded-lg shadow-lg group-hover:scale-110 transition-transform duration-300 mr-3`}>
                      <IconComponent className="h-5 w-5 text-white" />
                    </div>
                    
                    {/* Contenu */}
                    <div className="flex-1 text-left">
                      <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100 group-hover:text-gray-800 dark:group-hover:text-gray-200 transition-colors">
                        {item.label}
                      </h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">
                        {item.description}
                      </p>
                    </div>

                    {/* Flèche */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <ChevronDownIcon className="h-3.5 w-3.5 text-gray-400 dark:text-gray-500 rotate-[-90deg]" />
                    </div>

                    {/* Effet de brillance */}
                    <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                  </button>
                );
              })}
            </nav>

            {/* Footer avec déconnexion */}
            <div className="p-3 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="w-full group flex items-center justify-center p-2.5 bg-gradient-to-r from-gray-600 to-gray-700 dark:from-gray-700 dark:to-gray-800 hover:from-gray-700 hover:to-gray-800 dark:hover:from-gray-800 dark:hover:to-gray-900 text-white rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoggingOut ? (
                  <>
                    <svg className="animate-spin h-4 w-4 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="font-medium text-sm">Déconnexion...</span>
                  </>
                ) : (
                  <>
                    <ArrowRightOnRectangleIcon className="h-4 w-4 mr-2 group-hover:translate-x-1 transition-transform duration-300" />
                    <span className="font-medium text-sm">Se déconnecter</span>
                  </>
                )}
              </button>
              
              {/* Version */}
              <div className="text-center mt-2">
                <p className="text-xs text-gray-500 dark:text-gray-400">Saloneo v2.0.0</p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default UserMenu;
