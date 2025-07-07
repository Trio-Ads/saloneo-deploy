const fs = require('fs');

console.log('🔧 CORRECTION DU SÉLECTEUR DE LANGUE - PAGE CONNEXION');
console.log('============================================================\n');

// 1. DIAGNOSTIC DU PROBLÈME
console.log('🔍 ÉTAPE 1: DIAGNOSTIC DU PROBLÈME');
console.log('------------------------------------------------------------');

const authLayoutPath = 'src/features/auth/components/AuthLayout.tsx';
const languageSelectorPath = 'src/components/LanguageSelector.tsx';

if (fs.existsSync(authLayoutPath)) {
  const authContent = fs.readFileSync(authLayoutPath, 'utf8');
  
  console.log('📋 Analyse AuthLayout:');
  
  // Vérifier la présence du LanguageSelector
  if (authContent.includes('LanguageSelector')) {
    console.log('  ✅ LanguageSelector importé et utilisé');
  } else {
    console.log('  ❌ LanguageSelector manquant');
  }
  
  // Vérifier les props
  if (authContent.includes('compact={true}')) {
    console.log('  ✅ Mode compact activé');
  } else {
    console.log('  ⚠️  Mode compact non activé');
  }
  
  // Vérifier le z-index
  if (authContent.includes('z-index: 10')) {
    console.log('  ⚠️  Z-index potentiellement insuffisant (10)');
  }
  
  // Vérifier les styles CSS
  if (authContent.includes('.auth-language-selector')) {
    console.log('  ✅ Styles CSS pour le sélecteur présents');
  } else {
    console.log('  ❌ Styles CSS manquants');
  }
}

// 2. CORRECTION DU LANGUAGESELECTOR
console.log('\n🔧 ÉTAPE 2: CORRECTION DU LANGUAGESELECTOR');
console.log('------------------------------------------------------------');

if (fs.existsSync(languageSelectorPath)) {
  let content = fs.readFileSync(languageSelectorPath, 'utf8');
  let modified = false;
  
  console.log('📋 Corrections appliquées:');
  
  // Correction 1: Améliorer le z-index pour le mode compact
  if (content.includes('zIndex: 9999')) {
    content = content.replace(/zIndex: 9999/g, 'zIndex: 99999');
    modified = true;
    console.log('  ✅ Z-index augmenté à 99999');
  }
  
  // Correction 2: Ajouter une persistance localStorage
  if (!content.includes('localStorage.setItem')) {
    const handleLanguageChangePattern = /const handleLanguageChange = \(languageCode: string\) => \{[\s\S]*?\};/;
    const newHandleLanguageChange = `const handleLanguageChange = (languageCode: string) => {
    try {
      // Sauvegarder dans localStorage
      localStorage.setItem('saloneo-language', languageCode);
      
      // Changer la langue
      i18n.changeLanguage(languageCode);
      
      // Fermer le dropdown
      setIsOpen(false);
      
      // Debug log
      console.log('Language changed to:', languageCode);
    } catch (error) {
      console.error('Error changing language:', error);
    }
  };`;
    
    content = content.replace(handleLanguageChangePattern, newHandleLanguageChange);
    modified = true;
    console.log('  ✅ Persistance localStorage ajoutée');
  }
  
  // Correction 3: Améliorer la gestion des événements
  if (!content.includes('stopPropagation')) {
    content = content.replace(
      /onClick={toggleDropdown}/g,
      'onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleDropdown(); }}'
    );
    modified = true;
    console.log('  ✅ Gestion des événements améliorée');
  }
  
  // Correction 4: Ajouter un style pour forcer la visibilité
  if (!content.includes('pointerEvents: "auto"')) {
    content = content.replace(
      /zIndex: 99999,/g,
      'zIndex: 99999,\n              pointerEvents: "auto",'
    );
    modified = true;
    console.log('  ✅ Pointer events forcés');
  }
  
  if (modified) {
    fs.writeFileSync(languageSelectorPath, content);
    console.log('  ✅ LanguageSelector.tsx mis à jour');
  } else {
    console.log('  ⚠️  Aucune modification nécessaire');
  }
}

// 3. CORRECTION DE L'AUTHLAYOUT
console.log('\n🔧 ÉTAPE 3: CORRECTION DE L\'AUTHLAYOUT');
console.log('------------------------------------------------------------');

if (fs.existsSync(authLayoutPath)) {
  let content = fs.readFileSync(authLayoutPath, 'utf8');
  let modified = false;
  
  console.log('📋 Corrections appliquées:');
  
  // Correction 1: Augmenter le z-index du sélecteur de langue
  if (content.includes('z-index: 10;')) {
    content = content.replace(/z-index: 10;/g, 'z-index: 99999;');
    modified = true;
    console.log('  ✅ Z-index du sélecteur augmenté à 99999');
  }
  
  // Correction 2: Ajouter des styles pour forcer la visibilité
  const additionalStyles = `
          /* Styles améliorés pour le sélecteur de langue */
          .auth-language-selector {
            position: absolute;
            top: 1.5rem;
            right: 1.5rem;
            z-index: 99999 !important;
            animation: fadeIn 0.8s ease-out 0.4s both;
            pointer-events: auto !important;
          }

          .auth-language-selector * {
            pointer-events: auto !important;
          }

          .auth-language-selector button {
            background: rgba(255, 255, 255, 0.1) !important;
            backdrop-filter: blur(10px) !important;
            border: 1px solid rgba(255, 255, 255, 0.2) !important;
            color: white !important;
            transition: all 0.3s ease !important;
            pointer-events: auto !important;
            position: relative !important;
            z-index: 99999 !important;
          }

          .auth-language-selector button:hover {
            background: rgba(255, 255, 255, 0.15) !important;
            border-color: rgba(255, 255, 255, 0.3) !important;
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          }

          /* Dropdown avec z-index très élevé */
          .auth-language-selector [style*="position: fixed"] {
            background: rgba(255, 255, 255, 0.95) !important;
            backdrop-filter: blur(20px) !important;
            border: 1px solid rgba(255, 255, 255, 0.2) !important;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1) !important;
            z-index: 999999 !important;
            pointer-events: auto !important;
          }

          .auth-language-selector [style*="position: fixed"] button {
            color: #374151 !important;
            background: transparent !important;
            border: none !important;
            pointer-events: auto !important;
          }

          .auth-language-selector [style*="position: fixed"] button:hover {
            background: rgba(99, 102, 241, 0.1) !important;
          }`;
  
  if (!content.includes('z-index: 999999')) {
    // Remplacer les anciens styles du sélecteur de langue
    content = content.replace(
      /\/\* Styles spécifiques pour le sélecteur de langue dans le contexte auth \*\/[\s\S]*?\.auth-language-selector \[style\*="position: fixed"\] button:hover \{[\s\S]*?\}/,
      additionalStyles
    );
    modified = true;
    console.log('  ✅ Styles CSS améliorés');
  }
  
  // Correction 3: Ajouter un gestionnaire d'événements pour empêcher la propagation
  if (!content.includes('onMouseDown')) {
    content = content.replace(
      /<div className="auth-language-selector">/,
      '<div className="auth-language-selector" onMouseDown={(e) => e.stopPropagation()}>'
    );
    modified = true;
    console.log('  ✅ Gestionnaire d\'événements ajouté');
  }
  
  if (modified) {
    fs.writeFileSync(authLayoutPath, content);
    console.log('  ✅ AuthLayout.tsx mis à jour');
  } else {
    console.log('  ⚠️  Aucune modification nécessaire');
  }
}

// 4. CRÉATION D'UN COMPOSANT SPÉCIALISÉ
console.log('\n🔧 ÉTAPE 4: CRÉATION D\'UN COMPOSANT SPÉCIALISÉ');
console.log('------------------------------------------------------------');

const authLanguageSelectorPath = 'src/components/AuthLanguageSelector.tsx';

const authLanguageSelectorContent = `import React, { useState, useEffect, useRef } from 'react';
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
    { code: 'tr', name: 'Türkçe', flag: '🇹🇷' }
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

export default AuthLanguageSelector;`;

fs.writeFileSync(authLanguageSelectorPath, authLanguageSelectorContent);
console.log('✅ AuthLanguageSelector.tsx créé');

// 5. RAPPORT FINAL
console.log('\n📊 RAPPORT FINAL');
console.log('============================================================');

console.log('🎯 CORRECTIONS APPLIQUÉES:');
console.log('✅ LanguageSelector amélioré avec persistance localStorage');
console.log('✅ Z-index augmenté à 99999 pour éviter les conflits');
console.log('✅ Gestion des événements améliorée');
console.log('✅ AuthLayout mis à jour avec de meilleurs styles');
console.log('✅ AuthLanguageSelector spécialisé créé');

console.log('\n🔧 PROCHAINES ÉTAPES:');
console.log('1. Remplacer LanguageSelector par AuthLanguageSelector dans AuthLayout');
console.log('2. Tester le changement de langue sur la page de connexion');
console.log('3. Vérifier la persistance entre les rechargements');

console.log('\n============================================================');
