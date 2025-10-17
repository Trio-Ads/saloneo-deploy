import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { ChevronDownIcon, CheckIcon } from '@heroicons/react/24/outline';

const AuthLanguageSelector: React.FC = () => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [buttonPosition, setButtonPosition] = useState({ top: 0, left: 0, width: 0 });
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const languages = [
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'pt', name: 'Português', flag: '🇵🇹' },
    { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
    { code: 'ber', name: 'Tamazight', flag: '🏴' }
  ];

  // Charger la langue depuis localStorage au démarrage
  useEffect(() => {
    const savedLanguage = localStorage.getItem('saloneo-language');
    if (savedLanguage && savedLanguage !== i18n.language) {
      i18n.changeLanguage(savedLanguage);
    }
  }, [i18n]);

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

  const handleLanguageChange = (languageCode: string) => {
    try {
      localStorage.setItem('saloneo-language', languageCode);
      i18n.changeLanguage(languageCode);
      setIsOpen(false);
      console.log('Language changed to:', languageCode);
      window.location.reload();
    } catch (error) {
      console.error('Error changing language:', error);
    }
  };

  // Calculer la position du bouton quand le dropdown s'ouvre
  const updateButtonPosition = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setButtonPosition({
        top: rect.bottom + window.scrollY + 4,
        left: rect.right - 200 + window.scrollX,
        width: rect.width
      });
    }
  };

  const toggleDropdown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isOpen) {
      updateButtonPosition();
    }
    setIsOpen(!isOpen);
  };

  return (
    <>
      <div 
        ref={dropdownRef} 
        className="relative inline-block z-[99999]"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <button
          ref={buttonRef}
          onClick={toggleDropdown}
          className="flex items-center gap-2 px-3 py-2 bg-white/10 dark:bg-white/5 backdrop-blur-lg border border-white/20 dark:border-white/10 rounded-lg hover:bg-white/15 dark:hover:bg-white/10 hover:border-white/30 dark:hover:border-white/20 hover:-translate-y-0.5 transition-all duration-300 text-sm font-medium text-white z-[99999] relative shadow-lg hover:shadow-xl"
        >
          <span className="text-base">{selectedLanguage.flag}</span>
          <span>{selectedLanguage.code.toUpperCase()}</span>
          <ChevronDownIcon className={`h-3.5 w-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {isOpen && createPortal(
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 z-[999998] bg-transparent"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown avec glassmorphism orange */}
          <div 
            className="fixed z-[999999] min-w-[200px] bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-orange-500/20 dark:border-orange-400/20 rounded-xl shadow-[0_8px_32px_rgba(249,115,22,0.2)] dark:shadow-[0_8px_32px_rgba(251,146,60,0.25)] animate-slide-down"
            style={{
              top: buttonPosition.top,
              left: buttonPosition.left,
              pointerEvents: 'auto'
            }}
          >
            {languages.map((language) => (
              <button
                key={language.code}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleLanguageChange(language.code);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all duration-200 first:rounded-t-xl last:rounded-b-xl ${
                  currentLang === language.code
                    ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-orange-900/10'
                }`}
              >
                <span className="text-lg">{language.flag}</span>
                <span className={currentLang === language.code ? 'font-semibold' : ''}>
                  {language.name}
                </span>
                {currentLang === language.code && (
                  <CheckIcon className="h-4 w-4 ml-auto text-orange-600 dark:text-orange-400" />
                )}
              </button>
            ))}
          </div>
        </>,
        document.body
      )}
    </>
  );
};

export default AuthLanguageSelector;
