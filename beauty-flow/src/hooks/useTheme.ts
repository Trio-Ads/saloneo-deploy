import { useState, useEffect, useCallback } from 'react';

export type Theme = 'light' | 'dark';

// Clé unifiée pour le localStorage (compatible avec useThemeColors)
const THEME_STORAGE_KEY = 'saloneo-theme';

// Événement custom pour synchroniser le thème entre composants
const THEME_CHANGE_EVENT = 'saloneo-theme-change';

/**
 * Hook personnalisé unifié pour gérer le thème de l'application (Light/Dark Mode)
 * 
 * Fonctionnalités :
 * - Détecte la préférence système au premier chargement
 * - Sauvegarde la préférence dans localStorage (clé unifiée)
 * - Applique le thème via l'attribut data-theme sur <html>
 * - Ajoute la classe 'dark' pour Tailwind CSS
 * - Fournit une fonction toggle pour basculer entre les thèmes
 * - Transitions fluides et instantanées
 * - Synchronisation entre tous les composants via événements custom
 * 
 * @returns {Object} - { theme, toggleTheme, setTheme, isDark, isLight }
 */
export const useTheme = () => {
  const [theme, setThemeState] = useState<Theme>(() => {
    // 1. Vérifier si une préférence est sauvegardée dans localStorage
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    if (savedTheme === 'light' || savedTheme === 'dark') {
      return savedTheme;
    }
    
    // 2. Sinon, utiliser la préférence système
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return prefersDark ? 'dark' : 'light';
  });

  // Fonction pour appliquer le thème au DOM (optimisée avec requestAnimationFrame)
  const applyTheme = useCallback((newTheme: Theme) => {
    requestAnimationFrame(() => {
      const root = document.documentElement;
      
      // Appliquer le thème immédiatement
      root.setAttribute('data-theme', newTheme);
      
      // Ajouter/retirer la classe 'dark' pour Tailwind CSS
      if (newTheme === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
      
      // Sauvegarder dans localStorage
      localStorage.setItem(THEME_STORAGE_KEY, newTheme);
      
      // Émettre un événement custom pour synchroniser les autres composants
      window.dispatchEvent(new CustomEvent(THEME_CHANGE_EVENT, { detail: { theme: newTheme } }));
    });
  }, []);

  // Appliquer le thème au montage et à chaque changement
  useEffect(() => {
    applyTheme(theme);
  }, [theme, applyTheme]);

  // Écouter les changements de préférence système
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      // Ne changer que si l'utilisateur n'a pas de préférence sauvegardée
      const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
      if (!savedTheme) {
        setThemeState(e.matches ? 'dark' : 'light');
      }
    };

    // Ajouter l'écouteur (compatible avec les anciens navigateurs)
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else {
      // Fallback pour les anciens navigateurs
      mediaQuery.addListener(handleChange);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      } else {
        mediaQuery.removeListener(handleChange);
      }
    };
  }, []);

  // Écouter les changements de thème depuis d'autres composants
  useEffect(() => {
    const handleThemeChange = (e: CustomEvent<{ theme: Theme }>) => {
      setThemeState(e.detail.theme);
    };

    window.addEventListener(THEME_CHANGE_EVENT, handleThemeChange as EventListener);
    
    return () => {
      window.removeEventListener(THEME_CHANGE_EVENT, handleThemeChange as EventListener);
    };
  }, []);

  /**
   * Bascule entre light et dark mode instantanément
   */
  const toggleTheme = useCallback(() => {
    setThemeState(prevTheme => {
      const newTheme = prevTheme === 'light' ? 'dark' : 'light';
      console.log(`🎨 Theme changed: ${prevTheme} → ${newTheme}`);
      return newTheme;
    });
  }, []);

  /**
   * Définir un thème spécifique
   */
  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
  }, []);

  return {
    theme,
    setTheme,
    toggleTheme,
    isDark: theme === 'dark',
    isLight: theme === 'light',
  };
};

export default useTheme;
