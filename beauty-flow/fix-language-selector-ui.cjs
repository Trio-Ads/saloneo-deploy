const fs = require('fs');
const path = require('path');

console.log('🎨 Correction de l\'UI/UX du LanguageSelector...\n');

// Nouveau LanguageSelector avec UI/UX améliorée
const newLanguageSelectorContent = `import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDownIcon, GlobeAltIcon, CheckIcon } from '@heroicons/react/24/outline';

interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  rtl?: boolean;
}

interface LanguageSelectorProps {
  currentLanguage?: string;
  onLanguageChange?: (language: string) => void;
  compact?: boolean;
  showLabel?: boolean;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  currentLanguage,
  onLanguageChange,
  compact = false,
  showLabel = true
}) => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const languages: Language[] = [
    { code: 'fr', name: 'Français', nativeName: 'Français', flag: '🇫🇷' },
    { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
    { code: 'ar', name: 'العربية', nativeName: 'العربية', flag: '🇸🇦', rtl: true },
    { code: 'es', name: 'Español', nativeName: 'Español', flag: '🇪🇸' },
    { code: 'pt', name: 'Português', nativeName: 'Português', flag: '🇵🇹' },
    { code: 'tr', name: 'Türkçe', nativeName: 'Türkçe', flag: '🇹🇷' }
  ];

  const currentLang = currentLanguage || i18n.language || 'fr';
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

  const handleLanguageChange = (e: React.MouseEvent, languageCode: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (onLanguageChange) {
      onLanguageChange(languageCode);
    } else {
      i18n.changeLanguage(languageCode);
    }
    
    setIsOpen(false);
  };

  const toggleDropdown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  if (compact) {
    return (
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={toggleDropdown}
          className="flex items-center space-x-2 px-3 py-2 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-lg hover:bg-white/90 transition-all duration-200 text-sm font-medium text-gray-700 shadow-sm hover:shadow-md"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-label="Sélectionner la langue"
        >
          <span className="text-lg">{selectedLanguage.flag}</span>
          <span className="hidden sm:inline">{selectedLanguage.code.toUpperCase()}</span>
          <ChevronDownIcon className={\`h-4 w-4 transition-transform duration-200 \${isOpen ? 'rotate-180' : ''}\`} />
        </button>

        {isOpen && (
          <div className="absolute top-full mt-2 right-0 w-48 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden animate-fadeIn">
            <div className="py-2">
              {languages.map((language) => (
                <button
                  key={language.code}
                  type="button"
                  onClick={(e) => handleLanguageChange(e, language.code)}
                  className={\`w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition-colors duration-150 \${
                    currentLang === language.code ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700'
                  }\`}
                  role="option"
                  aria-selected={currentLang === language.code}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">{language.flag}</span>
                    <div>
                      <div className="font-medium">{language.nativeName}</div>
                      <div className="text-xs text-gray-500">{language.name}</div>
                    </div>
                  </div>
                  {currentLang === language.code && (
                    <CheckIcon className="h-4 w-4 text-indigo-600" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {showLabel && (
        <div className="flex items-center space-x-2">
          <GlobeAltIcon className="h-5 w-5 text-indigo-600" />
          <label className="text-sm font-medium text-gray-700">
            Langue / Language
          </label>
        </div>
      )}
      
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={toggleDropdown}
          className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-300 rounded-xl shadow-sm hover:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-label="Sélectionner la langue"
        >
          <div className="flex items-center space-x-3">
            <span className="text-xl">{selectedLanguage.flag}</span>
            <div className="text-left">
              <div className="font-medium text-gray-900">{selectedLanguage.nativeName}</div>
              <div className="text-sm text-gray-500">{selectedLanguage.name}</div>
            </div>
          </div>
          <ChevronDownIcon className={\`h-5 w-5 text-gray-400 transition-transform duration-200 \${isOpen ? 'rotate-180' : ''}\`} />
        </button>

        {isOpen && (
          <>
            {/* Overlay pour mobile */}
            <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm md:hidden" onClick={() => setIsOpen(false)} />
            
            {/* Dropdown */}
            <div className="absolute top-full mt-2 left-0 right-0 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden animate-fadeIn max-h-80 overflow-y-auto">
              <div className="py-2">
                {languages.map((language) => (
                  <button
                    key={language.code}
                    type="button"
                    onClick={(e) => handleLanguageChange(e, language.code)}
                    className={\`w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition-colors duration-150 \${
                      currentLang === language.code ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700'
                    }\`}
                    role="option"
                    aria-selected={currentLang === language.code}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-xl">{language.flag}</span>
                      <div className={\`\${language.rtl ? 'text-right' : 'text-left'}\`}>
                        <div className="font-medium">{language.nativeName}</div>
                        <div className="text-sm text-gray-500">{language.name}</div>
                      </div>
                    </div>
                    {currentLang === language.code && (
                      <CheckIcon className="h-5 w-5 text-indigo-600" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default LanguageSelector;`;

// Écrire le nouveau LanguageSelector
const languageSelectorPath = path.join(__dirname, 'src', 'components', 'LanguageSelector.tsx');
fs.writeFileSync(languageSelectorPath, newLanguageSelectorContent);
console.log('✅ LanguageSelector UI/UX amélioré');

// Ajouter les animations CSS manquantes
console.log('\n📝 Ajout des animations CSS...');

const indexCssPath = path.join(__dirname, 'src', 'index.css');
let indexCss = fs.readFileSync(indexCssPath, 'utf8');

// Vérifier si les animations existent déjà
if (!indexCss.includes('@keyframes fadeIn')) {
  const animations = `
/* Animations pour les composants */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fadeIn {
  animation: fadeIn 0.2s ease-out;
}

.animate-slide-down {
  animation: slideDown 0.3s ease-out;
}

/* Améliorations pour le LanguageSelector */
.language-selector-dropdown {
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

/* Support RTL amélioré */
[dir="rtl"] .language-selector-dropdown {
  right: 0;
  left: auto;
}

/* Responsive pour mobile */
@media (max-width: 640px) {
  .language-selector-dropdown {
    position: fixed !important;
    top: auto !important;
    bottom: 0 !important;
    left: 0 !important;
    right: 0 !important;
    border-radius: 1rem 1rem 0 0 !important;
    max-height: 50vh !important;
  }
}
`;

  indexCss += animations;
  fs.writeFileSync(indexCssPath, indexCss);
  console.log('✅ Animations CSS ajoutées');
} else {
  console.log('✅ Animations CSS déjà présentes');
}

console.log('\n🎉 LanguageSelector UI/UX corrigé !');
console.log('\n📋 Améliorations apportées :');
console.log('  1. ✅ Interface plus claire et accessible');
console.log('  2. ✅ Support mobile amélioré');
console.log('  3. ✅ Animations fluides');
console.log('  4. ✅ Mode compact pour le UserMenu');
console.log('  5. ✅ Support RTL pour l\'arabe');
console.log('  6. ✅ Meilleure gestion des événements');
console.log('  7. ✅ Accessibilité ARIA complète');
