import { describe, it, expect } from 'vitest';
import { existsSync } from 'fs';
import { resolve } from 'path';
import { allTemplates } from '../index';
import { kitOf, sampleKits, sampleSalons } from '../samples';

describe('sample photo kits', () => {
  it('maps trade families to their kit and the rest to coiffure', () => {
    const kit = (family: string, category = 'polyvalent') => kitOf({ family, category } as never);
    expect(kit('barbier')).toBe('barbier');
    expect(kit('afro-texture')).toBe('afro');
    expect(kit('ongles-cils')).toBe('ongles');
    expect(kit('institut')).toBe('bienetre');
    expect(kit('anything', 'bien-etre')).toBe('bienetre');
    expect(kit('mariage')).toBe('mariage');
    expect(kit('pop-quartier')).toBe('coiffure');
    expect(kit('patrimoine')).toBe('coiffure');
    expect(new Set(allTemplates.map(kitOf)).size).toBe(sampleKits.length);
  });
  it('only points at photos that exist', () => {
    const urls = Object.values(sampleSalons).flatMap((d) => [d.profile.banner!, ...d.services.map((s) => s.images[0].url), ...d.team.map((m) => m.avatar!)]);
    expect(urls).toHaveLength(66);
    for (const u of urls) expect(existsSync(resolve(__dirname, '../../../../public', u.slice(1))), u).toBe(true);
  });
});
