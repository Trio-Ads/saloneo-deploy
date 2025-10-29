import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { DirectionContext } from '../contexts/DirectionContext';

const DirectionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  useEffect(() => {
    // Appliquer la direction au niveau racine
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = i18n.language;
    
    // Ajouter/supprimer la classe RTL pour les styles spécifiques
    if (isRTL) {
      document.documentElement.classList.add('rtl');
      document.documentElement.classList.remove('ltr');
    } else {
      document.documentElement.classList.add('ltr');
      document.documentElement.classList.remove('rtl');
    }

    // Appliquer la police appropriée
    if (i18n.language === 'ar') {
      document.documentElement.style.fontFamily = 'var(--font-family-arabic)';
    } else {
      document.documentElement.style.fontFamily = 'var(--font-family-latin)';
    }
  }, [isRTL, i18n.language]);

  return (
    <DirectionContext.Provider value={{ isRTL }}>
      <div className={`app-container ${isRTL ? 'rtl' : 'ltr'}`}>
        {children}
      </div>
    </DirectionContext.Provider>
  );
};

export default DirectionProvider;
