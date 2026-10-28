import type React from 'react';
import type { DesignTemplate } from '../../templates';
import './booking.css';

export { dateLocale } from '../../dashboard/dateLocale';

// Relative luminance of a #rgb / #rrggbb color; null when the value is not hex.
function luminance(color: string): number | null {
  let hex = color.trim().replace('#', '');
  if (hex.length === 3) hex = hex.split('').map((c) => c + c).join('');
  if (!/^[0-9a-f]{6}/i.test(hex)) return null;
  const [r, g, b] = [0, 2, 4].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Black or white, whichever reads best on `color`. */
export const readableOn = (color: string) => {
  const l = luminance(color);
  // contrast with white (1.05/(l+.05)) vs black ((l+.05)/.05) → crossover at l ≈ 0.179
  return l !== null && l > 0.179 ? '#111111' : '#ffffff';
};

/** CSS variables that skin the booking UI with the salon template (see booking.css). */
export function bookingVars(template: DesignTemplate): React.CSSProperties {
  const { colors, typography, layout } = template.theme;
  // md = controls (may be 9999px pills), lg = cards and the sheet
  const radius = layout?.borderRadius?.md || '12px';
  const cardRadius = layout?.borderRadius?.lg || radius;
  const darkBg = (luminance(colors.background) ?? 1) < 0.179;
  return {
    '--bk-primary': colors.primary,
    '--bk-on-primary': readableOn(colors.primary),
    '--bk-bg': colors.background,
    '--bk-surface': colors.surface,
    '--bk-text': colors.text,
    '--bk-muted': colors.textSecondary,
    '--bk-danger': darkBg ? '#f87171' : '#dc2626',
    '--bk-success': darkBg ? '#4ade80' : '#15803d',
    '--bk-radius': radius,
    '--bk-radius-card': cardRadius,
    '--bk-heading': typography.headingFont,
    '--bk-hw': typography.headingWeight ?? 600,
    '--bk-hcase': typography.headingCase ?? 'none',
    '--bk-ht': typography.headingTracking ?? 'normal',
    '--bk-body': typography.bodyFont,
    colorScheme: darkBg ? 'dark' : 'light',
  } as React.CSSProperties;
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h}h` : `${h}h${String(m).padStart(2, '0')}`;
}
