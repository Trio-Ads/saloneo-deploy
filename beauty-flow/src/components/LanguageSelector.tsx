import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

const languages = [
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' }
];

const ChevronDownIcon = () => (
  <svg className="w-4 h-4 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

const GlobeIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
  </svg>
);

interface LanguageSelectorProps {
  currentLanguage?: string;
  onLanguageChange?: (languageCode: string) => void;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ 
  currentLanguage: propCurrentLanguage,
  onLanguageChange: propOnLanguageChange 
}) => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const currentLanguage = languages.find(lang => 
    lang.code === (propCurrentLanguage || i18n.language)
  ) || languages[0];

  const handleLanguageChange = (languageCode: string) => {
    if (propOnLanguageChange) {
      propOnLanguageChange(languageCode);
    } else {
      i18n.changeLanguage(languageCode);
    }
    setIsOpen(false);
  };

  return (
    <div className="relative">
      {/* Bouton principal */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          language-selector-2025 w-full flex items-center justify-between
          px-3 py-2.5 rounded-xl transition-all duration-300
          text-white/80 hover:text-white
          bg-white/5 hover:bg-white/10 backdrop-blur-sm
          border border-white/10 hover:border-white/20
          focus:outline-none focus:ring-2 focus:ring-saloneo-primary-400/30
          ${isOpen ? 'bg-white/15 border-white/30' : ''}
        `}
        aria-expanded={isOpen}
        aria-label="Sélectionner la langue"
      >
        <div className="flex items-center space-x-2">
          <GlobeIcon />
          <span className="text-lg">{currentLanguage.flag}</span>
          <span className="font-medium font-body text-sm">
            {currentLanguage.name}
          </span>
        </div>
        <div className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
          <ChevronDownIcon />
        </div>
      </button>

      {/* Menu déroulant */}
      {isOpen && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 z-[9998]"
            onClick={() => setIsOpen(false)}
          />
          
          <div className="language-dropdown-2025 absolute top-full left-0 right-0 mt-2 z-[9999]">
            <div className="
              bg-white/10 backdrop-blur-xl rounded-xl border border-white/20
              shadow-glass-lg overflow-hidden animate-slide-down
            ">
              {languages.map((language) => {
                const isActive = language.code === i18n.language;
                
                return (
                  <button
                    key={language.code}
                    onClick={() => handleLanguageChange(language.code)}
                    className={`
                      w-full flex items-center space-x-3 px-3 py-2.5
                      transition-all duration-300 font-body text-sm
                      hover:bg-white/10 focus:bg-white/10
                      focus:outline-none relative overflow-hidden
                      ${isActive 
                        ? 'bg-gradient-to-r from-saloneo-primary-500/20 to-saloneo-secondary-500/20 text-white border-l-2 border-saloneo-primary-400' 
                        : 'text-white/80 hover:text-white'
                      }
                    `}
                  >
                    <span className="text-lg">{language.flag}</span>
                    <span className="font-medium flex-1 text-left">
                      {language.name}
                    </span>
                    
                    {/* Indicateur actif */}
                    {isActive && (
                      <div className="w-2 h-2 bg-saloneo-primary-400 rounded-full animate-pulse" />
                    )}
                    
                    {/* Effet de brillance au survol */}
                    <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-700" />
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* Styles CSS intégrés */}
      <style dangerouslySetInnerHTML={{
        __html: `
          .language-selector-2025:hover {
            transform: translateY(-1px);
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
          }

          .language-dropdown-2025 {
            animation: slideDown 0.3s ease-out;
          }

          @keyframes slideDown {
            from {
              opacity: 0;
              transform: translateY(-10px) scale(0.95);
            }
            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }

          .animate-slide-down {
            animation: slideDown 0.3s ease-out;
          }

          /* Animation pour les éléments de la liste */
          .language-dropdown-2025 button {
            animation: fadeInUp 0.3s ease-out;
            animation-fill-mode: both;
          }

          .language-dropdown-2025 button:nth-child(1) { animation-delay: 0.05s; }
          .language-dropdown-2025 button:nth-child(2) { animation-delay: 0.1s; }
          .language-dropdown-2025 button:nth-child(3) { animation-delay: 0.15s; }
          .language-dropdown-2025 button:nth-child(4) { animation-delay: 0.2s; }
          .language-dropdown-2025 button:nth-child(5) { animation-delay: 0.25s; }
          .language-dropdown-2025 button:nth-child(6) { animation-delay: 0.3s; }

          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          /* Responsive */
          @media (max-width: 640px) {
            .language-selector-2025 {
              padding: 0.625rem 0.75rem;
            }
            
            .language-dropdown-2025 button {
              padding: 0.625rem 0.75rem;
            }
          }
        `
      }} />
    </div>
  );
};

export default LanguageSelector;
