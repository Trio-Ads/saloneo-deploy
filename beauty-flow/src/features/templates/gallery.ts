// Pure helpers for the owner-facing template gallery: metadata fallbacks, search, salon-based ranking.
import { DesignTemplate } from './types';

// Read with fallbacks: templates defined before the 100+ collection may not carry these yet.
export const familyOf = (t: DesignTemplate) => t.family || t.category;
export const tagsOf = (t: DesignTemplate): string[] => t.tags ?? [];
export function modeOf(t: DesignTemplate): 'light' | 'dark' {
  if (t.mode) return t.mode;
  const h = t.theme.colors.background.replace('#', '');
  const f = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(f.slice(i, i + 2), 16) / 255);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b < 0.45 ? 'dark' : 'light';
}

/** Lowercase, accents stripped — "Épure" matches "epure". */
export const fold = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

// Words in a salon's service names/categories → the template category they point to.
const signals: Record<string, RegExp> = {
  barbier: /barb|rasage|beard|fade|degrade|homme|barber/,
  ongles: /ongle|nail|manucure|pedicure|vernis|gel\b|capsule|semi.?perm|prothes/,
  coiffure: /coiff|cheveu|brushing|coupe|coloration|balayage|meche|lissage|keratin|hair|chignon|defrisage/,
  'bien-etre': /spa\b|hammam|massage|soin|visage|epilation|esthet|gommage|facial|sauna|cire/,
  mariage: /mari|bride|henn|maquillage|makeup|fianc|ceremon|negaf/,
};

/**
 * How much each template category fits a salon, from its service names/categories (shares summing to 1).
 * ponytail: keyword regexes, swap for a per-salon "activity" field if the profile ever stores one.
 */
export function salonProfile(words: string[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const w of words.map(fold)) for (const [k, re] of Object.entries(signals)) if (re.test(w)) counts[k] = (counts[k] ?? 0) + 1;
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  if (!total) return {};
  const shares = Object.fromEntries(Object.entries(counts).map(([k, v]) => [k, v / total]));
  // A salon spread over several trades is what the "polyvalent" templates are for.
  const spread = Object.values(shares).filter((s) => s >= 0.2).length;
  if (spread >= 2) shares.polyvalent = 0.25 * spread;
  return shares;
}

/** Score of a template for a salon profile: its category, family and tags each vote for the trades they name. */
export function scoreTemplate(t: DesignTemplate, profile: Record<string, number>): number {
  const text = fold([familyOf(t), ...tagsOf(t)].join(' '));
  return Object.entries(profile).reduce((sum, [k, share]) => {
    const hit = t.category === k ? 1 : 0;
    const meta = k !== 'polyvalent' && signals[k]?.test(text) ? 0.5 : 0;
    return sum + share * (hit + meta);
  }, 0);
}
