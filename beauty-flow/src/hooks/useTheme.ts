import { useState, useEffect } from 'react';

export type Theme = 'light' | 'dark';

/**
 * Hook personnalisé pour gérer le thème de l'application (Light/Dark Mode)
 * 
 * Fonctionnalités :
 * - Détecte la préférence système au premier chargement
 * - Sauvegarde la préférence dans localStorage
 * - Applique le thème via l'attribut data-theme sur <html>
 * - Ajoute la classe 'dark' pour Tailwind CSS
 * - Fournit une fonction toggle pour basculer entre les thèmes
 * - Transitions fluides entre les thèmes
 * 
 * @returns {Object} - { theme, toggleTheme, setTheme, isDark, isLight }
 */
export const useTheme = () => {
  const [theme, setTheme] = useState<Theme>(() => {
    // 1. Vérifier si une préférence est sauvegardée dans localStorage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light' || savedTheme === 'dark') {
      return savedTheme;
    }
    
    // 2. Sinon, utiliser la préférence système
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return prefersDark ? 'dark' : 'light';
  });

  useEffect(() => {
    // Appliquer le thème au document avec transition fluide
    const root = document.documentElement;
    
    // Ajouter une classe de transition temporaire
    root.style.transition = 'background-color 0.3s ease, color 0.3s ease';
    
    // Appliquer le thème
    root.setAttribute('data-theme', theme);
    
    // Sauvegarder dans localStorage
    localStorage.setItem('theme', theme);
    
    // Ajouter/retirer la classe 'dark' pour Tailwind CSS
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    
    // Retirer la transition après l'animation
    const timeoutId = setTimeout(() => {
      root.style.transition = '';
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [theme]);

  // Écouter les changements de préférence système
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      // Ne changer que si l'utilisateur n'a pas de préférence sauvegardée
      const savedTheme = localStorage.getItem('theme');
      if (!savedTheme) {
        setTheme(e.matches ? 'dark' : 'light');
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

  /**
   * Bascule entre light et dark mode avec animation
   */
  const toggleTheme = () => {
    setTheme(prevTheme => {
      const newTheme = prevTheme === 'light' ? 'dark' : 'light';
      console.log(`🎨 Theme changed: ${prevTheme} → ${newTheme}`);
      return newTheme;
    });
  };

  return {
    theme,
    setTheme,
    toggleTheme,
    isDark: theme === 'dark',
    isLight: theme === 'light',
  };
};

export default useTheme;
