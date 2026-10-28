import { DesignTemplate } from './types';
import { collection2026, studio } from './collection';
import { coiffureContemporaine } from './families/coiffure-contemporaine';
import { hauteCoiffure } from './families/haute-coiffure';
import { barbier } from './families/barbier';
import { afroTexture } from './families/afro-texture';
import { onglesCils } from './families/ongles-cils';
import { popQuartier } from './families/pop-quartier';
import { spaHammam } from './families/spa-hammam';
import { institut } from './families/institut';
import { mariage } from './families/mariage';
import { patrimoine } from './families/patrimoine';

export const allTemplates: DesignTemplate[] = [
  ...collection2026,
  ...coiffureContemporaine,
  ...hauteCoiffure,
  ...barbier,
  ...afroTexture,
  ...onglesCils,
  ...popQuartier,
  ...spaHammam,
  ...institut,
  ...mariage,
  ...patrimoine,
];

// Ids saved by salons before the 2026 collection.
const legacyIds: Record<string, string> = {
  'saloneo-classic': 'studio',
  'modern-salon-2025': 'soleil',
  'minimal-scandinavian': 'epure',
  'urban-street-art': 'barber',
  'botanical-spa': 'botanique',
  'glamour-hollywood': 'noir',
  'pastel-kawaii': 'onglerie',
  'industrial-chic': 'barber',
  'vintage-parisien': 'atelier',
  'tech-futuriste': 'institut',
};

/** Always returns a template: legacy ids are mapped, unknown ids fall back to Studio. */
export const getTemplateById = (id?: string | null): DesignTemplate => {
  const key = (id && legacyIds[id]) || id;
  return allTemplates.find(t => t.id === key) ?? studio;
};

type SavedColors = { primary?: string; secondary?: string; accent?: string; background?: string };
const hex = (v?: string) => (v && /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(v) ? v : undefined);
const dark = (h: string) => {
  const f = h.length === 4 ? h.slice(1).split('').map(c => c + c).join('') : h.slice(1);
  const [r, g, b] = [0, 2, 4].map(i => parseInt(f.slice(i, i + 2), 16) / 255);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b < 0.45;
};

/**
 * `template` with the salon's own colors ("Mon Interface → Couleurs") laid over its palette.
 * The background is only taken when it keeps the template light or dark (its text colors depend on it).
 */
export function withSalonColors(template: DesignTemplate, saved?: SavedColors): DesignTemplate {
  if (!saved) return template;
  const c = template.theme.colors;
  const bg = hex(saved.background);
  return {
    ...template,
    theme: {
      ...template.theme,
      colors: {
        ...c,
        primary: hex(saved.primary) ?? c.primary,
        secondary: hex(saved.secondary) ?? c.secondary,
        accent: hex(saved.accent) ?? c.accent,
        background: bg && dark(bg) === dark(c.background) ? bg : c.background,
      },
    },
  };
}

/**
 * The template a salon's public pages use, from its saved `profile.theme`.
 * Colors saved under a pre-2026 template id belong to that old template, so they are not carried over.
 */
export function salonTemplate(theme?: SavedColors & { selectedTemplateId?: string }): DesignTemplate {
  const template = getTemplateById(theme?.selectedTemplateId);
  const legacy = theme?.selectedTemplateId && theme.selectedTemplateId !== template.id;
  return legacy ? template : withSalonColors(template, theme);
}

export const getTemplatesByCategory = (category: string): DesignTemplate[] =>
  allTemplates.filter(t => t.category === category);

export * from './types';
export * from './collection';
