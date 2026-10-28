import { describe, it, expect } from 'vitest';
import { allTemplates } from '..';

describe('template collection', () => {
  it('has unique ids', () => {
    const ids = allTemplates.map(t => t.id);
    expect(ids.filter((id, i) => ids.indexOf(id) !== i)).toEqual([]);
  });
});
