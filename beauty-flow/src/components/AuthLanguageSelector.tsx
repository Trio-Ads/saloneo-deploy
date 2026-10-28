import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { LanguageIcon } from '@heroicons/react/24/outline';

const LANGUAGES: [string, string][] = [
  ['fr', 'Français'],
  ['ar', 'العربية'],
  ['en', 'English'],
  ['es', 'Español'],
  ['pt', 'Português'],
  ['tr', 'Türkçe'],
  ['ber', 'Tamazight'],
];

/** Compact native language picker for logged-out pages (landing, pricing, auth). */
const AuthLanguageSelector: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { i18n } = useTranslation();
  const current = (i18n.resolvedLanguage || i18n.language || 'fr').split('-')[0];

  // Charger la langue depuis localStorage au démarrage
  useEffect(() => {
    const saved = localStorage.getItem('saloneo-language');
    if (saved && saved !== i18n.language) i18n.changeLanguage(saved);
  }, [i18n]);

  const change = (code: string) => {
    localStorage.setItem('saloneo-language', code);
    i18n.changeLanguage(code);
  };

  return (
    <label className={`inline-flex h-10 items-center gap-1.5 rounded-lg ps-2.5 pe-1 text-sm font-medium text-gray-600 transition-colors duration-150 ease-out hover:bg-gray-100 hover:text-gray-900 focus-within:ring-2 focus-within:ring-orange-500/40 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-50 cursor-pointer ${className}`}>
      <LanguageIcon className="size-4 shrink-0" aria-hidden="true" />
      <select
        aria-label="Langue · Language · اللغة"
        value={LANGUAGES.some(([c]) => c === current) ? current : 'fr'}
        onChange={(e) => change(e.target.value)}
        className="cursor-pointer appearance-none border-0 bg-transparent py-0 ps-0 pe-1 text-base sm:text-sm font-medium text-inherit focus:outline-none focus:ring-0"
      >
        {LANGUAGES.map(([code, name]) => (
          <option key={code} value={code} className="text-gray-900">{name}</option>
        ))}
      </select>
    </label>
  );
};

export default AuthLanguageSelector;
