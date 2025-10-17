import { useMemo } from 'react';
import { useInterfaceStore } from '../features/interface/store';

/**
 * Hook pour récupérer les styles du template actif
 * Retourne les couleurs et styles à appliquer aux composants
 */
export const useTemplateStyles = () => {
  const settings = useInterfaceStore((state) => state.settings);
  
  const templateStyles = useMemo(() => {
    // Utiliser directement les couleurs des settings
    const colors = settings.colors;
    
    return {
      primary: colors.primary,
      primaryLight: lightenColor(colors.primary, 20),
      primaryDark: darkenColor(colors.primary, 20),
      primaryRgb: hexToRgb(colors.primary),
      secondary: colors.secondary,
      secondaryLight: lightenColor(colors.secondary, 20),
      secondaryDark: darkenColor(colors.secondary, 20),
      accent: colors.accent,
      accentLight: lightenColor(colors.accent, 20),
      background: colors.background,
      surface: '#FFFFFF',
      border: '#E5E7EB',
      textPrimary: '#111827',
      textSecondary: '#6B7280',
      textTertiary: '#9CA3AF',
      success: '#10B981',
      error: '#EF4444',
      warning: '#F59E0B',
    };
  }, [settings.colors]);

  // Générer les variables CSS
  const cssVariables = useMemo(() => ({
    '--template-primary': templateStyles.primary,
    '--template-primary-light': templateStyles.primaryLight,
    '--template-primary-dark': templateStyles.primaryDark,
    '--template-primary-rgb': templateStyles.primaryRgb,
    '--template-secondary': templateStyles.secondary,
    '--template-secondary-light': templateStyles.secondaryLight,
    '--template-secondary-dark': templateStyles.secondaryDark,
    '--template-accent': templateStyles.accent,
    '--template-accent-light': templateStyles.accentLight,
    '--template-background': templateStyles.background,
    '--template-surface': templateStyles.surface,
    '--template-border': templateStyles.border,
    '--template-text-primary': templateStyles.textPrimary,
    '--template-text-secondary': templateStyles.textSecondary,
    '--template-text-tertiary': templateStyles.textTertiary,
    '--template-success': templateStyles.success,
    '--template-error': templateStyles.error,
    '--template-warning': templateStyles.warning,
  }), [templateStyles]);

  return {
    colors: templateStyles,
    cssVariables,
  };
};

/**
 * Convertit une couleur hexadécimale en RGB
 */
function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return '0, 0, 0';
  
  return `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`;
}

/**
 * Éclaircit une couleur hexadécimale
 */
function lightenColor(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = (num >> 8 & 0x00FF) + amt;
  const B = (num & 0x0000FF) + amt;
  return '#' + (
    0x1000000 +
    (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
    (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
    (B < 255 ? (B < 1 ? 0 : B) : 255)
  ).toString(16).slice(1);
}

/**
 * Assombrit une couleur hexadécimale
 */
function darkenColor(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) - amt;
  const G = (num >> 8 & 0x00FF) - amt;
  const B = (num & 0x0000FF) - amt;
  return '#' + (
    0x1000000 +
    (R > 0 ? R : 0) * 0x10000 +
    (G > 0 ? G : 0) * 0x100 +
    (B > 0 ? B : 0)
  ).toString(16).slice(1);
}
