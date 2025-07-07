import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';

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
      // Sauvegarder dans localStorage
      localStorage.setItem('saloneo-language', languageCode);
      
      // Changer la langue
      i18n.changeLanguage(languageCode);
      
      // Fermer le dropdown
      setIsOpen(false);
      
      // Debug log
      console.log('Language changed to:', languageCode);
      
      // Forcer un re-render de la page
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

  // Ouvrir/fermer le dropdown
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
        style={{ 
          position: 'relative', 
          display: 'inline-block',
          zIndex: 99999
        }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <button
          ref={buttonRef}
          onClick={toggleDropdown}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 12px',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            color: 'white',
            transition: 'all 0.3s ease',
            zIndex: 99999,
            position: 'relative'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <span style={{ fontSize: '16px' }}>{selectedLanguage.flag}</span>
          <span>{selectedLanguage.code.toUpperCase()}</span>
          <span style={{ 
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s'
          }}>▼</span>
        </button>
      </div>

      {isOpen && createPortal(
        <>
          {/* Overlay pour fermer le dropdown */}
          <div 
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 999998,
              backgroundColor: 'transparent'
            }}
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown avec position fixe */}
          <div style={{
            position: 'fixed',
            top: buttonPosition.top,
            left: buttonPosition.left,
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '8px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)',
            zIndex: 999999,
            minWidth: '200px',
            pointerEvents: 'auto'
          }}>
              {languages.map((language) => (
                <button
                  key={language.code}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleLanguageChange(language.code);
                  }}
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
                    textAlign: 'left',
                    color: '#374151',
                    pointerEvents: 'auto'
                  }}
                  onMouseEnter={(e) => {
                    if (currentLang !== language.code) {
                      e.currentTarget.style.backgroundColor = 'rgba(99, 102, 241, 0.1)';
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
        </>,
        document.body
      )}
    </>
  );
};

export default AuthLanguageSelector;
