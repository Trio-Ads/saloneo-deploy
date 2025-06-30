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

  // Basculer le thème
  const toggleTheme = useCallback(() => {
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    setCurrentTheme(newTheme);
    localStorage.setItem('saloneo-theme', newTheme);
  }, [currentTheme]);

  // Définir un thème spécifique
  const setTheme = useCallback((theme: ThemeMode) => {
    setCurrentTheme(theme);
    localStorage.setItem('saloneo-theme', theme);
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

    // Couleurs Saloneo 2025 par défaut
    const saloneoColors = {
      light: {
        primary: '#6366F1',
        primaryLight: '#818CF8',
        primaryDark: '#4F46E5',
        secondary: '#14B8A6',
        secondaryLight: '#2DD4BF',
        secondaryDark: '#0F766E',
        accent: '#F59E0B',
        accentLight: '#FCD34D',
        accentDark: '#D97706',
        background: '#FAFBFC',
        surface: '#FFFFFF',
        surfaceElevated: '#F8FAFC',
        border: '#E5E7EB',
        textPrimary: '#111827',
        textSecondary: '#6B7280',
        textTertiary: '#9CA3AF',
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        info: '#3B82F6',
      },
      dark: {
        primary: '#818CF8',
        primaryLight: '#A5B4FC',
        primaryDark: '#6366F1',
        secondary: '#2DD4BF',
        secondaryLight: '#5EEAD4',
        secondaryDark: '#14B8A6',
        accent: '#FCD34D',
        accentLight: '#FDE68A',
        accentDark: '#F59E0B',
        background: '#0B0F1A',
        surface: '#111827',
        surfaceElevated: '#1F2937',
        border: '#374151',
        textPrimary: '#F9FAFB',
        textSecondary: '#9CA3AF',
        textTertiary: '#6B7280',
        success: '#34D399',
        warning: '#FBBF24',
        error: '#F87171',
        info: '#60A5FA',
      }
    };

    const themeColors = saloneoColors[effectiveTheme];

    // Utiliser les couleurs personnalisées seulement si elles sont différentes des couleurs par défaut
    // Cela évite d'écraser les couleurs du thème avec les mêmes valeurs
    const hasCustomColors = settings.colors && (
      settings.colors.primary !== '#6366F1' ||
      settings.colors.secondary !== '#14B8A6' ||
      settings.colors.accent !== '#F59E0B' ||
      settings.colors.background !== '#FFFFFF'
    );

    const finalColors = hasCustomColors ? {
      ...themeColors,
      // Appliquer les couleurs personnalisées seulement si elles sont vraiment personnalisées
      primary: settings.colors?.primary || themeColors.primary,
      secondary: settings.colors?.secondary || themeColors.secondary,
      accent: settings.colors?.accent || themeColors.accent,
      background: settings.colors?.background || themeColors.background,
      // Calculer les variantes pour les couleurs personnalisées
      primaryLight: settings.colors?.primary ? lightenColor(settings.colors.primary, 20) : themeColors.primaryLight,
      primaryDark: settings.colors?.primary ? darkenColor(settings.colors.primary, 20) : themeColors.primaryDark,
      secondaryLight: settings.colors?.secondary ? lightenColor(settings.colors.secondary, 20) : themeColors.secondaryLight,
      secondaryDark: settings.colors?.secondary ? darkenColor(settings.colors.secondary, 20) : themeColors.secondaryDark,
      accentLight: settings.colors?.accent ? lightenColor(settings.colors.accent, 20) : themeColors.accentLight,
      accentDark: settings.colors?.accent ? darkenColor(settings.colors.accent, 20) : themeColors.accentDark,
    } : themeColors;

    // Calculer les variantes RGB pour les couleurs personnalisées
    const primaryRgb = hexToRgb(finalColors.primary);
    const secondaryRgb = hexToRgb(finalColors.secondary);
    const accentRgb = hexToRgb(finalColors.accent);

    // Appliquer toutes les variables CSS
    const cssVariables = {
      '--primary': finalColors.primary,
      '--primary-light': finalColors.primaryLight,
      '--primary-dark': finalColors.primaryDark,
      '--primary-rgb': primaryRgb ? `${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}` : '99, 102, 241',
      
      '--secondary': finalColors.secondary,
      '--secondary-light': finalColors.secondaryLight,
      '--secondary-dark': finalColors.secondaryDark,
      '--secondary-rgb': secondaryRgb ? `${secondaryRgb.r}, ${secondaryRgb.g}, ${secondaryRgb.b}` : '20, 184, 166',
      
      '--accent': finalColors.accent,
      '--accent-light': finalColors.accentLight,
      '--accent-dark': finalColors.accentDark,
      '--accent-rgb': accentRgb ? `${accentRgb.r}, ${accentRgb.g}, ${accentRgb.b}` : '245, 158, 11',
      
      '--background': finalColors.background,
      '--surface': finalColors.surface,
      '--surface-elevated': finalColors.surfaceElevated,
      '--border': finalColors.border,
      '--text-primary': finalColors.textPrimary,
      '--text-secondary': finalColors.textSecondary,
      '--text-tertiary': finalColors.textTertiary,
      
      '--success': finalColors.success,
      '--warning': finalColors.warning,
      '--error': finalColors.error,
      '--info': finalColors.info,

      // Variables pour glassmorphism
      '--glass-bg': effectiveTheme === 'dark' 
        ? 'rgba(17, 24, 39, 0.8)' 
        : 'rgba(255, 255, 255, 0.05)',
      '--glass-border': 'rgba(255, 255, 255, 0.1)',
      '--glass-shadow': effectiveTheme === 'dark' 
        ? 'rgba(0, 0, 0, 0.3)' 
        : 'rgba(0, 0, 0, 0.1)',
      '--glass-blur': '10px',
      '--glass-highlight': 'rgba(255, 255, 255, 0.08)',
    };

    // Appliquer les variables CSS
    Object.entries(cssVariables).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });

    // Mettre à jour les couleurs personnalisées si elles existent
    if (settings.colors?.primary && primaryRgb) {
      root.style.setProperty('--color-primary', settings.colors.primary);
      root.style.setProperty('--color-primary-rgb', `${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}`);
      root.style.setProperty('--color-primary-light', lightenColor(settings.colors.primary, 20));
      root.style.setProperty('--color-primary-dark', darkenColor(settings.colors.primary, 20));
    }

    if (settings.colors?.secondary && secondaryRgb) {
      root.style.setProperty('--color-secondary', settings.colors.secondary);
      root.style.setProperty('--color-secondary-rgb', `${secondaryRgb.r}, ${secondaryRgb.g}, ${secondaryRgb.b}`);
      root.style.setProperty('--color-secondary-light', lightenColor(settings.colors.secondary, 20));
      root.style.setProperty('--color-secondary-dark', darkenColor(settings.colors.secondary, 20));
    }

    if (settings.colors?.accent && accentRgb) {
      root.style.setProperty('--color-accent', settings.colors.accent);
      root.style.setProperty('--color-accent-rgb', `${accentRgb.r}, ${accentRgb.g}, ${accentRgb.b}`);
      root.style.setProperty('--color-accent-light', lightenColor(settings.colors.accent, 20));
      root.style.setProperty('--color-accent-dark', darkenColor(settings.colors.accent, 20));
    }

  }, [settings.colors, getEffectiveTheme]);

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

// Fonctions utilitaires
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

function lightenColor(hex: string, percent: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  
  const factor = percent / 100;
  const r = Math.min(255, Math.round(rgb.r + (255 - rgb.r) * factor));
  const g = Math.min(255, Math.round(rgb.g + (255 - rgb.g) * factor));
  const b = Math.min(255, Math.round(rgb.b + (255 - rgb.b) * factor));
  
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

function darkenColor(hex: string, percent: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  
  const factor = 1 - (percent / 100);
  const r = Math.max(0, Math.round(rgb.r * factor));
  const g = Math.max(0, Math.round(rgb.g * factor));
  const b = Math.max(0, Math.round(rgb.b * factor));
  
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

// Hook pour créer un thème personnalisé
export const useCustomTheme = () => {
  const createTheme = useCallback((colors: Partial<SaloneoTheme['colors']>): SaloneoTheme => {
    return {
      mode: 'light',
      colors: {
        primary: colors.primary || '#6366F1',
        primaryLight: colors.primaryLight || '#818CF8',
        primaryDark: colors.primaryDark || '#4F46E5',
        secondary: colors.secondary || '#14B8A6',
        secondaryLight: colors.secondaryLight || '#2DD4BF',
        secondaryDark: colors.secondaryDark || '#0F766E',
        accent: colors.accent || '#F59E0B',
        accentLight: colors.accentLight || '#FCD34D',
        accentDark: colors.accentDark || '#D97706',
        background: colors.background || '#FAFBFC',
        surface: colors.surface || '#FFFFFF',
        surfaceElevated: colors.surfaceElevated || '#F8FAFC',
        border: colors.border || '#E5E7EB',
        textPrimary: colors.textPrimary || '#111827',
        textSecondary: colors.textSecondary || '#6B7280',
        textTertiary: colors.textTertiary || '#9CA3AF',
        success: colors.success || '#10B981',
        warning: colors.warning || '#F59E0B',
        error: colors.error || '#EF4444',
        info: colors.info || '#3B82F6',
      }
    };
  }, []);

  return { createTheme };
};
