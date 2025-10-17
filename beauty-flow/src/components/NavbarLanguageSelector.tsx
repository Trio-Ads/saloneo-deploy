import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDownIcon, CheckIcon } from '@heroicons/react/24/outline';

const NavbarLanguageSelector: React.FC = () => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const languages = [
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'pt', name: 'Português', flag: '🇵🇹' },
    { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
    { code: 'ber', name: 'Tamazight', flag: '🏴' }
  ];

  const currentLang = i18n.language || 'fr';
  const selectedLanguage = languages.find(lang => lang.code === currentLang) || languages[0];

  // Fermer le dropdown quand on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
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

  const handleLanguageChange = async (languageCode: string) => {
    console.log('🌍 Tentative de changement de langue vers:', languageCode);
    
    try {
      await i18n.changeLanguage(languageCode);
      console.log('✅ Langue changée avec succès vers:', languageCode);
      console.log('✅ i18n.language est maintenant:', i18n.language);
      
      // Forcer un re-render en fermant le dropdown
      setIsOpen(false);
      
      // Forcer un refresh de la page si nécessaire
      setTimeout(() => {
        window.location.reload();
      }, 100);
      
    } catch (error) {
      console.error('❌ Erreur lors du changement de langue:', error);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          console.log('🔘 Clic sur le bouton langue, isOpen:', !isOpen);
          setIsOpen(!isOpen);
        }}
        className="flex items-center space-x-2 px-3 py-2 rounded-xl bg-white/10 dark:bg-white/5 backdrop-blur-sm border border-orange-500/20 dark:border-orange-400/20 hover:bg-orange-50/10 dark:hover:bg-orange-900/10 hover:border-orange-500/30 dark:hover:border-orange-400/30 transition-all duration-300 hover:scale-105 active:scale-95"
        aria-label="Changer de langue"
      >
        <span className="text-lg">{selectedLanguage.flag}</span>
        <span className="hidden sm:block text-sm font-medium text-gray-700 dark:text-gray-200">
          {selectedLanguage.code.toUpperCase()}
        </span>
        <ChevronDownIcon className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-2xl shadow-[0_8px_32px_rgba(249,115,22,0.15)] dark:shadow-[0_8px_32px_rgba(251,146,60,0.2)] border border-orange-500/20 dark:border-orange-400/20 overflow-hidden z-[9999] animate-slide-down">
          <div className="p-2">
            {languages.map((language) => (
              <button
                key={language.code}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('🔘 Clic sur langue:', language.code);
                  handleLanguageChange(language.code);
                }}
                className={`
                  w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-left
                  ${currentLang === language.code 
                    ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400' 
                    : 'hover:bg-orange-50 dark:hover:bg-orange-900/10 text-gray-700 dark:text-gray-200'
                  }
                `}
              >
                <span className="text-lg">{language.flag}</span>
                <div className="flex-1">
                  <div className={`font-medium text-sm ${currentLang === language.code ? 'font-semibold' : ''}`}>
                    {language.name}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {language.code.toUpperCase()}
                  </div>
                </div>
                {currentLang === language.code && (
                  <CheckIcon className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default NavbarLanguageSelector;
