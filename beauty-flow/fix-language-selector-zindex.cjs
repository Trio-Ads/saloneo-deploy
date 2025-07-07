const fs = require('fs');
const path = require('path');

console.log('🔧 Correction du z-index du LanguageSelector...\n');

// Version corrigée avec z-index très élevé
const fixedLanguageSelectorContent = `import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

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
  const dropdownRef = useRef<HTMLDivElement>(null);

  const languages = [
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'pt', name: 'Português', flag: '🇵🇹' },
    { code: 'tr', name: 'Türkçe', flag: '🇹🇷' }
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

  const handleLanguageChange = (languageCode: string) => {
    i18n.changeLanguage(languageCode);
    setIsOpen(false);
  };

  if (compact) {
    return (
      <div ref={dropdownRef} style={{ position: 'relative', display: 'inline-block' }}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 12px',
            backgroundColor: 'white',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          <span style={{ fontSize: '16px' }}>{selectedLanguage.flag}</span>
          <span>{selectedLanguage.code.toUpperCase()}</span>
          <span style={{ 
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s'
          }}>▼</span>
        </button>

        {isOpen && (
          <>
            {/* Overlay pour fermer le dropdown */}
            <div 
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 9998,
                backgroundColor: 'transparent'
              }}
              onClick={() => setIsOpen(false)}
            />
            
            {/* Dropdown avec z-index très élevé */}
            <div style={{
              position: 'fixed',
              top: dropdownRef.current?.getBoundingClientRect().bottom || 0,
              left: dropdownRef.current?.getBoundingClientRect().left || 0,
              backgroundColor: 'white',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
              zIndex: 9999,
              minWidth: '200px'
            }}>
              {languages.map((language) => (
                <button
                  key={language.code}
                  onClick={() => handleLanguageChange(language.code)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 16px',
                    border: 'none',
                    backgroundColor: currentLang === language.code ? '#f3f4f6' : 'transparent',
                    cursor: 'pointer',
                    fontSize: '14px',
                    textAlign: 'left'
                  }}
                  onMouseEnter={(e) => {
                    if (currentLang !== language.code) {
                      e.currentTarget.style.backgroundColor = '#f9fafb';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (currentLang !== language.code) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  <span style={{ fontSize: '18px' }}>{language.flag}</span>
                  <span style={{ fontWeight: currentLang === language.code ? 'bold' : 'normal' }}>
                    {language.name}
                  </span>
                  {currentLang === language.code && (
                    <span style={{ marginLeft: 'auto', color: '#10b981' }}>✓</span>
                  )}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div style={{ marginBottom: '16px' }}>
      {showLabel && (
        <label style={{ 
          display: 'block', 
          marginBottom: '8px', 
          fontSize: '14px', 
          fontWeight: '500',
          color: '#374151'
        }}>
          🌍 Langue / Language
        </label>
      )}
      
      <div ref={dropdownRef} style={{ position: 'relative' }}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 16px',
            backgroundColor: 'white',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '20px' }}>{selectedLanguage.flag}</span>
            <div>
              <div style={{ fontWeight: '500', color: '#111827' }}>{selectedLanguage.name}</div>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>{selectedLanguage.code.toUpperCase()}</div>
            </div>
          </div>
          <span style={{ 
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s',
            color: '#9ca3af'
          }}>▼</span>
        </button>

        {isOpen && (
          <>
            {/* Overlay pour fermer le dropdown */}
            <div 
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 9998,
                backgroundColor: 'transparent'
              }}
              onClick={() => setIsOpen(false)}
            />
            
            {/* Dropdown avec z-index très élevé */}
            <div style={{
              position: 'fixed',
              top: dropdownRef.current?.getBoundingClientRect().bottom || 0,
              left: dropdownRef.current?.getBoundingClientRect().left || 0,
              width: dropdownRef.current?.getBoundingClientRect().width || 'auto',
              backgroundColor: 'white',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
              zIndex: 9999,
              maxHeight: '300px',
              overflowY: 'auto'
            }}>
              {languages.map((language) => (
                <button
                  key={language.code}
                  onClick={() => handleLanguageChange(language.code)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    border: 'none',
                    backgroundColor: currentLang === language.code ? '#f3f4f6' : 'transparent',
                    cursor: 'pointer',
                    fontSize: '14px',
                    textAlign: 'left'
                  }}
                  onMouseEnter={(e) => {
                    if (currentLang !== language.code) {
                      e.currentTarget.style.backgroundColor = '#f9fafb';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (currentLang !== language.code) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '18px' }}>{language.flag}</span>
                    <div>
                      <div style={{ fontWeight: currentLang === language.code ? 'bold' : 'normal' }}>
                        {language.name}
                      </div>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>
                        {language.code.toUpperCase()}
                      </div>
                    </div>
                  </div>
                  {currentLang === language.code && (
                    <span style={{ color: '#10b981', fontSize: '16px' }}>✓</span>
                  )}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default LanguageSelector;`;

// Écrire le LanguageSelector corrigé
const languageSelectorPath = path.join(__dirname, 'src', 'components', 'LanguageSelector.tsx');
fs.writeFileSync(languageSelectorPath, fixedLanguageSelectorContent);
console.log('✅ LanguageSelector avec z-index corrigé créé');

console.log('\n🎉 LanguageSelector avec z-index maximum créé !');
console.log('\n📋 Corrections apportées :');
console.log('  1. ✅ z-index: 9999 pour le dropdown');
console.log('  2. ✅ position: fixed pour sortir du conteneur parent');
console.log('  3. ✅ Overlay transparent pour fermer le dropdown');
console.log('  4. ✅ Calcul dynamique de la position');
console.log('  5. ✅ Largeur adaptée au bouton parent');
console.log('  6. ✅ Ombre plus prononcée pour la visibilité');
console.log('\n🔧 Le dropdown devrait maintenant s\'afficher au-dessus de tout !');
