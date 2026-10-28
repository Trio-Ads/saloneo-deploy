import { describe, it, expect } from 'vitest';
import { allTemplates } from '../index';
import { fold, modeOf, salonProfile, scoreTemplate } from '../gallery';

const best = (words: string[]) => {
  const p = salonProfile(words);
  return [...allTemplates].sort((a, b) => scoreTemplate(b, p) - scoreTemplate(a, p))[0].category;
};

describe('template gallery ranking', () => {
  it('points a nail salon to ongles and a barber to barbier', () => {
    expect(best(['Manucure', 'Ongles', 'Pose gel', 'Ongles', 'Pédicure'])).toBe('ongles');
    expect(best(['Barber Shop Kamel', 'Coupe dégradé', 'Rasage', 'Taille de barbe'])).toBe('barbier');
  });
  it('gives no signal for an empty salon, and folds accents', () => {
    expect(salonProfile([])).toEqual({});
    expect(fold('Épure Ongles')).toBe('epure ongles');
  });
  it('reads dark templates from their background', () => {
    expect(modeOf({ ...allTemplates[0], mode: undefined, theme: { ...allTemplates[0].theme, colors: { ...allTemplates[0].theme.colors, background: '#0F1419' } } } as typeof allTemplates[0])).toBe('dark');
  });
});
