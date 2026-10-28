import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckIcon, LanguageIcon } from '@heroicons/react/24/outline';

const languages = [
  { code: 'fr', name: 'Français' },
  { code: 'en', name: 'English' },
  { code: 'ar', name: 'العربية' },
  { code: 'es', name: 'Español' },
  { code: 'pt', name: 'Português' },
  { code: 'tr', name: 'Türkçe' },
  { code: 'ber', name: 'Tamazight' },
];

const NavbarLanguageSelector: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const currentLang = i18n.language || 'fr';

  // Fermer le dropdown au clic extérieur ou avec Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) setIsOpen(false);
    };
    const handleKey = (e: KeyboardEvent) => e.key === 'Escape' && setIsOpen(false);
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKey);
    };
  }, [isOpen]);

  const handleLanguageChange = async (languageCode: string) => {
    try {
      await i18n.changeLanguage(languageCode);
      setIsOpen(false);
      // Recharger pour appliquer la direction (RTL) et les namespaces partout
      setTimeout(() => window.location.reload(), 100);
    } catch (error) {
      console.error('Erreur lors du changement de langue:', error);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-9 items-center gap-1.5 rounded-lg px-2 text-sm font-medium text-gray-600 transition-colors duration-150 ease-out hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-50"
        aria-label={t('navigation.language')}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <LanguageIcon className="size-5" />
        <span className="uppercase">{currentLang}</span>
      </button>

      {isOpen && (
        <div
          role="listbox"
          className="absolute end-0 top-full mt-2 w-48 origin-top-right rtl:origin-top-left rounded-xl border border-gray-200 bg-white p-1.5 shadow-[0_12px_32px_-8px_rgb(24_24_27/0.18)] z-50 animate-[menu-pop_200ms_ease-out] dark:border-gray-800 dark:bg-gray-900"
        >
          {languages.map((language) => {
            const active = currentLang === language.code;
            return (
              <button
                key={language.code}
                type="button"
                role="option"
                aria-selected={active}
                onClick={() => handleLanguageChange(language.code)}
                className={`flex w-full min-h-10 items-center justify-between gap-3 rounded-lg px-3 text-sm transition-colors duration-150 ease-out ${
                  active
                    ? 'font-medium text-orange-700 dark:text-orange-400'
                    : 'text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-800'
                }`}
              >
                <span>{language.name}</span>
                {active && <CheckIcon className="size-4" />}
              </button>
            );
          })}
          <style>{'@keyframes menu-pop{from{opacity:0;transform:scale(.97)}}'}</style>
        </div>
      )}
    </div>
  );
};

export default NavbarLanguageSelector;
