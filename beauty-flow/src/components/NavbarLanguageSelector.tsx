import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

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
        className="flex items-center space-x-2 px-3 py-2 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105 active:scale-95"
        aria-label="Changer de langue"
      >
        <span className="text-lg">{selectedLanguage.flag}</span>
        <span className="hidden sm:block text-sm font-medium text-gray-700 dark:text-gray-200">
          {selectedLanguage.code.toUpperCase()}
        </span>
        <svg 
          className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-[9999]">
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
                    ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' 
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200'
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
                  <svg className="w-4 h-4 text-indigo-600 dark:text-indigo-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
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
