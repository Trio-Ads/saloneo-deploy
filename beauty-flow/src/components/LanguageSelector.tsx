import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { ChevronDownIcon, CheckIcon } from '@heroicons/react/24/outline';

interface LanguageSelectorProps {
  compact?: boolean;
  showLabel?: boolean;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  compact = false,
  showLabel = true
}) => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [buttonPosition, setButtonPosition] = useState({ top: 0, left: 0, width: 0 });
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const languages = [
    { code: 'fr', name: 'Français', flag: '🇫🇷', isImage: false },
    { code: 'en', name: 'English', flag: '🇺🇸', isImage: false },
    { code: 'ar', name: 'العربية', flag: '🇸🇦', isImage: false },
    { code: 'es', name: 'Español', flag: '🇪🇸', isImage: false },
    { code: 'pt', name: 'Português', flag: '🇵🇹', isImage: false },
    { code: 'tr', name: 'Türkçe', flag: '🇹🇷', isImage: false },
    { code: 'ber', name: 'Tamazight', flag: '/images/flags/berber-flag.webp', isImage: true }
  ];

  // Fonction pour rendre le drapeau (émoji ou image)
  const renderFlag = (language: typeof languages[0], size: 'sm' | 'md' | 'lg' = 'md') => {
    const sizeClasses = {
      sm: 'w-4 h-4',
      md: 'w-5 h-5',
      lg: 'w-6 h-6'
    };

    if (language.isImage) {
      return (
        <img 
          src={language.flag} 
          alt={`${language.name} flag`}
          className={`${sizeClasses[size]} object-cover rounded`}
        />
      );
    }
    return <span className={size === 'sm' ? 'text-base' : size === 'md' ? 'text-lg' : 'text-xl'}>{language.flag}</span>;
  };

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

  const toggleDropdown = () => {
    if (!isOpen) {
      updateButtonPosition();
    }
    setIsOpen(!isOpen);
  };

  if (compact) {
    return (
      <>
        <div ref={dropdownRef} className="relative inline-block">
          <button
            ref={buttonRef}
            onClick={toggleDropdown}
            className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 border border-orange-500/20 dark:border-orange-400/20 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all duration-200 text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            {renderFlag(selectedLanguage, 'sm')}
            <span>{selectedLanguage.code.toUpperCase()}</span>
            <ChevronDownIcon className={`h-3.5 w-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {isOpen && createPortal(
          <>
            {/* Overlay */}
            <div 
              className="fixed inset-0 z-[9998] bg-black/20 dark:bg-black/40 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Dropdown avec glassmorphism */}
            <div 
              className="fixed z-[99999] min-w-[200px] bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-orange-500/20 dark:border-orange-400/20 rounded-xl shadow-[0_8px_32px_rgba(249,115,22,0.15)] dark:shadow-[0_8px_32px_rgba(251,146,60,0.2)] animate-slide-down"
              style={{
                top: buttonPosition.top,
                left: buttonPosition.left,
                pointerEvents: "auto"
              }}
            >
              {languages.map((language) => (
                <button
                  key={language.code}
                  onClick={() => handleLanguageChange(language.code)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all duration-200 first:rounded-t-xl last:rounded-b-xl ${
                    currentLang === language.code
                      ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-orange-900/10'
                  }`}
                >
                  {renderFlag(language, 'md')}
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
  }

  return (
    <div className="mb-4">
      {showLabel && (
        <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          🌍 Langue / Language
        </label>
      )}
      
      <div ref={dropdownRef} className="relative">
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsOpen(!isOpen);
          }}
          className="w-full flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-800 border border-orange-500/20 dark:border-orange-400/20 rounded-xl hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all duration-200 text-sm"
        >
          <div className="flex items-center gap-3">
            {renderFlag(selectedLanguage, 'lg')}
            <div className="text-left">
              <div className="font-medium text-gray-900 dark:text-gray-100">{selectedLanguage.name}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{selectedLanguage.code.toUpperCase()}</div>
            </div>
          </div>
          <ChevronDownIcon className={`h-4 w-4 text-gray-400 dark:text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-orange-500/20 dark:border-orange-400/20 rounded-xl shadow-[0_8px_32px_rgba(249,115,22,0.15)] dark:shadow-[0_8px_32px_rgba(251,146,60,0.2)] z-[99999] max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-orange-300 dark:scrollbar-thumb-orange-600 scrollbar-track-transparent animate-slide-down">
            {languages.map((language) => (
              <button
                key={language.code}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleLanguageChange(language.code);
                }}
                className={`w-full flex items-center justify-between px-4 py-3 text-sm font-medium transition-all duration-200 first:rounded-t-xl last:rounded-b-xl ${
                  currentLang === language.code
                    ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-orange-900/10'
                }`}
              >
                <div className="flex items-center gap-3">
                  {renderFlag(language, 'md')}
                  <div className="text-left">
                    <div className={currentLang === language.code ? 'font-semibold' : ''}>
                      {language.name}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {language.code.toUpperCase()}
                    </div>
                  </div>
                </div>
                {currentLang === language.code && (
                  <CheckIcon className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LanguageSelector;
