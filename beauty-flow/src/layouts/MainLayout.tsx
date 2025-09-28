import React, { useState, useEffect } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useThemeColors } from '../hooks/useThemeColors';
import { useClientStore } from '../features/clients/store';
import { useServiceStore } from '../features/services/store';
import { useTeamStore } from '../features/team/store';
import { useAppointmentStore } from '../features/appointments/store';
import UserMenu from '../components/UserMenu';
import NavbarLanguageSelector from '../components/NavbarLanguageSelector';
import './MainLayout.css';

// Icons Saloneo 2025
const MenuIcon = () => (
  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

const CloseIcon = () => (
  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const DashboardIcon = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

const CalendarIcon = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const UsersIcon = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
  </svg>
);

const CogIcon = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const CubeIcon = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
  </svg>
);

const CollectionIcon = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
  </svg>
);

const UserGroupIcon = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);

const MainLayout: React.FC = () => {
  const location = useLocation();
  const { t } = useTranslation();
  const { currentTheme, toggleTheme } = useThemeColors();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Gérer le blocage du scroll du body sur mobile
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
    } else {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    }

    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    };
  }, [isOpen]);

  // Charger les stores au démarrage
  const fetchClients = useClientStore((state) => state.fetchClients);
  const fetchServices = useServiceStore((state) => state.fetchServices);
  const fetchMembers = useTeamStore((state) => state.fetchMembers);
  const loadAppointments = useAppointmentStore((state) => state.loadAppointments);

  // Détecter le scroll pour l'effet navbar
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Charger toutes les données au démarrage
  useEffect(() => {
    const loadAllData = async () => {
      try {
        console.log('🔄 Chargement des données au démarrage...');
        
        // Charger les données en parallèle
        await Promise.all([
          fetchClients(),
          fetchServices(),
          fetchMembers(),
          loadAppointments()
        ]);
        
        console.log('✅ Toutes les données chargées avec succès');
      } catch (error) {
        console.error('❌ Erreur lors du chargement des données:', error);
      }
    };

    loadAllData();
  }, [fetchClients, fetchServices, fetchMembers, loadAppointments]);

  const navigation = [
    { 
      name: t('navigation.dashboard') || 'Dashboard', 
      href: 'dashboard', 
      icon: DashboardIcon,
      color: 'from-purple-500 to-indigo-500'
    },
    { 
      name: t('navigation.appointments'), 
      href: 'appointments', 
      icon: CalendarIcon,
      color: 'from-indigo-500 to-teal-500'
    },
    { 
      name: t('navigation.clients'), 
      href: 'clients', 
      icon: UsersIcon,
      color: 'from-emerald-500 to-cyan-500'
    },
    { 
      name: t('navigation.services'), 
      href: 'services', 
      icon: CogIcon,
      color: 'from-blue-500 to-emerald-500'
    },
    { 
      name: t('navigation.products'), 
      href: 'products', 
      icon: CubeIcon,
      color: 'from-cyan-500 to-teal-500'
    },
    { 
      name: t('navigation.team'), 
      href: 'team', 
      icon: UserGroupIcon,
      color: 'from-teal-500 to-green-500'
    }
  ];

  const isActiveRoute = (href: string) => {
    return location.pathname === `/${href}` || 
           (location.pathname === '/' && href === 'dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Navigation principale */}
      <nav className={`
        fixed top-0 left-0 right-0 z-50 transition-all duration-500
        ${scrolled 
          ? 'navbar-2025-scrolled backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 shadow-glass-lg' 
          : 'navbar-2025 backdrop-blur-sm bg-white/60 dark:bg-gray-900/60'
        }
      `}>
        <div className="container-2025">
          <div className="flex justify-between items-center h-20">
            {/* Logo Saloneo */}
            <div className="flex items-center space-x-4">
              <Link 
                to="/" 
                className="flex items-center space-x-3 group"
              >
                <div className="logo-saloneo-2025">
                  <svg
                    viewBox="0 0 40 40"
                    className="w-10 h-10 text-indigo-600 dark:text-indigo-400"
                    fill="currentColor"
                  >
                    <path d="M20 4C11.163 4 4 11.163 4 20s7.163 16 16 16 16-7.163 16-16S28.837 4 20 4zm0 28c-6.627 0-12-5.373-12-12S13.373 8 20 8s12 5.373 12 12-5.373 12-12 12z"/>
                    <circle cx="20" cy="20" r="6"/>
                  </svg>
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-2xl font-display font-bold bg-gradient-to-r from-indigo-600 to-teal-500 bg-clip-text text-transparent">
                    Saloneo
                  </h1>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-body">
                    {t('common.app_subtitle', 'Gestion moderne')}
                  </p>
                </div>
              </Link>
            </div>

            {/* Navigation desktop */}
            <div className="hidden lg:flex items-center space-x-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = isActiveRoute(item.href);
                
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={`
                      nav-item-2025 group relative
                      ${isActive 
                        ? 'nav-item-active text-white' 
                        : 'nav-item-inactive text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                      }
                    `}
                  >
                    <div className={`
                      flex items-center space-x-2 px-4 py-3 rounded-2xl transition-all duration-300 transform hover:scale-105 active:scale-95
                      ${isActive 
                        ? `bg-gradient-to-r ${item.color} shadow-lg shadow-indigo-500/25` 
                        : 'hover:bg-gray-100 dark:hover:bg-gray-800 hover:shadow-md'
                      }
                    `}>
                      <Icon />
                      <span className="font-medium font-body text-sm">
                        {item.name}
                      </span>
                    </div>
                    
                    {/* Indicateur actif */}
                    {isActive && (
                      <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white rounded-full shadow-soft animate-bounce-gentle" />
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Actions droite */}
            <div className="flex items-center space-x-3">
              {/* Bouton thème */}
              <button
                onClick={toggleTheme}
                className="theme-toggle-2025 p-2.5 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95"
                aria-label="Basculer le thème"
              >
                {currentTheme === 'dark' ? (
                  <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                  </svg>
                )}
              </button>

              {/* Sélecteur de langue */}
              <div className="hidden lg:block">
                <NavbarLanguageSelector />
              </div>

              {/* Menu utilisateur */}
              <div className="hidden lg:block">
                <UserMenu />
              </div>

              {/* Bouton menu mobile */}
              <button
                type="button"
                className="lg:hidden mobile-menu-btn-2025 p-2.5 rounded-xl transition-all duration-300"
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Menu principal"
              >
                {isOpen ? <CloseIcon /> : <MenuIcon />}
              </button>
            </div>
          </div>

          {/* Menu mobile */}
          <div className={`
            lg:hidden overflow-hidden transition-all duration-300 ease-smooth
            ${isOpen ? 'max-h-[calc(100vh-5rem)] opacity-100' : 'max-h-0 opacity-0'}
          `}>
            <div className="mobile-menu-2025 py-4 space-y-2 max-h-[calc(100vh-7rem)] overflow-y-auto overflow-x-hidden">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = isActiveRoute(item.href);
                
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={`
                      mobile-nav-item-2025 flex items-center space-x-3 px-4 py-3 rounded-2xl transition-all duration-300 transform hover:scale-105 active:scale-95
                      ${isActive 
                        ? `bg-gradient-to-r ${item.color} text-white shadow-lg shadow-indigo-500/25` 
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:shadow-md'
                      }
                    `}
                    onClick={() => setIsOpen(false)}
                  >
                    <Icon />
                    <span className="font-medium font-body">
                      {item.name}
                    </span>
                  </Link>
                );
              })}
              
              {/* Menu utilisateur mobile */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <UserMenu />
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Contenu principal */}
      <main className="main-content-2025 pt-24 pb-8">
        <div className="container-2025">
          <div className="animate-fade-in">
            <Outlet />
          </div>
        </div>
      </main>

      {/* Styles CSS intégrés */}
      <style dangerouslySetInnerHTML={{
        __html: `
          .logo-saloneo-2025 {
            padding: 0.5rem;
            background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(20, 184, 166, 0.1));
            border-radius: 1rem;
            transition: all 0.3s ease;
          }
          
          .logo-saloneo-2025:hover {
            transform: scale(1.05);
            background: linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(20, 184, 166, 0.2));
          }

          .navbar-2025 {
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          }

          .navbar-2025-scrolled {
            border-bottom: 1px solid rgba(0, 0, 0, 0.1);
          }

          .nav-item-2025 {
            position: relative;
            transition: all 0.3s ease;
          }

          .nav-item-2025:hover {
            transform: translateY(-1px);
          }

          .theme-toggle-2025 {
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            backdrop-filter: blur(10px);
          }

          .theme-toggle-2025:hover {
            background: rgba(255, 255, 255, 0.2);
            transform: scale(1.05);
          }

          .mobile-menu-btn-2025 {
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            backdrop-filter: blur(10px);
            color: #374151;
          }

          .dark .mobile-menu-btn-2025 {
            color: #D1D5DB;
          }

          .mobile-menu-2025 {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(20px);
            border-radius: 1rem;
            border: 1px solid rgba(0, 0, 0, 0.1);
            margin: 0 1rem;
            -webkit-overflow-scrolling: touch;
            overscroll-behavior: contain;
          }

          .dark .mobile-menu-2025 {
            background: rgba(17, 24, 39, 0.95);
            border: 1px solid rgba(255, 255, 255, 0.1);
          }

          /* Forcer le défilement vertical sur mobile */
          @media (max-width: 1024px) {
            .mobile-menu-2025 {
              /* Forcer le défilement vertical uniquement */
              overflow-y: scroll !important;
              overflow-x: hidden !important;
              -webkit-overflow-scrolling: touch !important;
              overscroll-behavior-y: contain !important;
              overscroll-behavior-x: none !important;
              
              /* Empêcher le contenu de déborder horizontalement */
              width: 100% !important;
              max-width: calc(100vw - 2rem) !important;
            }

            /* Empêcher les éléments enfants de déborder */
            .mobile-menu-2025 > * {
              max-width: 100% !important;
              overflow-x: hidden !important;
            }

            .mobile-nav-item-2025 {
              width: 100% !important;
              max-width: 100% !important;
              overflow: hidden !important;
              text-overflow: ellipsis !important;
              white-space: nowrap !important;
            }

            .mobile-menu-2025::-webkit-scrollbar {
              width: 4px;
            }

            .mobile-menu-2025::-webkit-scrollbar-track {
              background: transparent;
            }

            .mobile-menu-2025::-webkit-scrollbar-thumb {
              background: rgba(0, 0, 0, 0.2);
              border-radius: 2px;
            }

            .dark .mobile-menu-2025::-webkit-scrollbar-thumb {
              background: rgba(255, 255, 255, 0.2);
            }

            /* Support pour iOS */
            .mobile-menu-2025 {
              scrollbar-width: thin;
              scrollbar-color: rgba(0, 0, 0, 0.2) transparent;
            }

            .dark .mobile-menu-2025 {
              scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
            }
          }

          .main-content-2025 {
            min-height: calc(100vh - 5rem);
          }

          @media (max-width: 640px) {
            .container-2025 {
              padding-left: 1rem;
              padding-right: 1rem;
            }
          }
        `
      }} />
    </div>
  );
};

export default MainLayout;
