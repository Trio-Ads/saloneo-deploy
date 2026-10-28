import { useEffect, useState, useCallback } from 'react';
import { useInterfaceStore } from '../features/interface/store';

export type ThemeMode = 'light' | 'dark' | 'auto';

export interface SaloneoTheme {
  mode: ThemeMode;
  colors: {
    primary: string;
    primaryLight: string;
    primaryDark: string;
    secondary: string;
    secondaryLight: string;
    secondaryDark: string;
    accent: string;
    accentLight: string;
    accentDark: string;
    background: string;
    surface: string;
    surfaceElevated: string;
    border: string;
    textPrimary: string;
    textSecondary: string;
    textTertiary: string;
    success: string;
    warning: string;
    error: string;
    info: string;
  };
}

export const useThemeColors = () => {
  const { settings } = useInterfaceStore();
  const [currentTheme, setCurrentTheme] = useState<ThemeMode>('light');
  const [isSystemDark, setIsSystemDark] = useState(false);

  // Détecter le thème système
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setIsSystemDark(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setIsSystemDark(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Déterminer le thème actuel
  const getEffectiveTheme = useCallback((): 'light' | 'dark' => {
    const savedTheme = localStorage.getItem('saloneo-theme') as ThemeMode;
    const themeMode = savedTheme || 'auto';
    
    if (themeMode === 'auto') {
      return isSystemDark ? 'dark' : 'light';
    }
    return themeMode;
  }, [isSystemDark]);

  // Basculer le thème (synchronisé avec useTheme)
  const toggleTheme = useCallback(() => {
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    setCurrentTheme(newTheme);
    localStorage.setItem('saloneo-theme', newTheme);
    
    // Émettre un événement pour synchroniser avec useTheme
    window.dispatchEvent(new CustomEvent('saloneo-theme-change', { detail: { theme: newTheme } }));
  }, [currentTheme]);

  // Définir un thème spécifique (synchronisé avec useTheme)
  const setTheme = useCallback((theme: ThemeMode) => {
    setCurrentTheme(theme);
    localStorage.setItem('saloneo-theme', theme);
    
    // Émettre un événement pour synchroniser avec useTheme
    window.dispatchEvent(new CustomEvent('saloneo-theme-change', { detail: { theme } }));
  }, []);

  // Écouter les changements de thème depuis useTheme
  useEffect(() => {
    const handleThemeChange = (e: CustomEvent<{ theme: string }>) => {
      const newTheme = e.detail.theme as ThemeMode;
      setCurrentTheme(newTheme);
    };

    window.addEventListener('saloneo-theme-change', handleThemeChange as EventListener);
    
    return () => {
      window.removeEventListener('saloneo-theme-change', handleThemeChange as EventListener);
    };
  }, []);

  // Appliquer les variables CSS
  useEffect(() => {
    const effectiveTheme = getEffectiveTheme();
    setCurrentTheme(effectiveTheme);

    const root = document.documentElement;
    
    // Appliquer l'attribut data-theme pour le mode sombre
    if (effectiveTheme === 'dark') {
      root.setAttribute('data-theme', 'dark');
      root.classList.add('dark');
    } else {
      root.removeAttribute('data-theme');
      root.classList.remove('dark');
    }

    // Brand tokens live in index.css; the salon's own colors only theme its public page.
    // Clear inline vars older builds wrote on <html> (they overrode the orange brand).
    Array.from(root.style)
      .filter((prop) => prop.startsWith('--'))
      .forEach((prop) => root.style.removeProperty(prop));
  }, [getEffectiveTheme]);

  // Initialiser le thème au montage
  useEffect(() => {
    const savedTheme = localStorage.getItem('saloneo-theme') as ThemeMode;
    if (savedTheme && savedTheme !== 'auto') {
      setCurrentTheme(savedTheme);
    } else {
      setCurrentTheme(getEffectiveTheme());
    }
  }, [getEffectiveTheme]);

  return {
    currentTheme,
    isSystemDark,
    toggleTheme,
    setTheme,
    colors: settings.colors,
    isDark: currentTheme === 'dark',
    isLight: currentTheme === 'light',
  };
};
