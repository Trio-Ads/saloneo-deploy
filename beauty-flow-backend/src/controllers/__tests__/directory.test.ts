// Self-check: npx ts-node --transpile-only src/controllers/__tests__/directory.test.ts
import assert from 'assert';
import { categoryOf } from '../directory.controller';
import { parseAddress, findWilaya } from '../../utils/wilayas';

assert.deepStrictEqual(parseAddress('12 rue Didouche Mourad, 16000 Alger'), { city: 'Alger', wilaya: 'Alger' });
assert.deepStrictEqual(parseAddress('Cité 1000 logements, 19000 Sétif, Algérie'), { city: 'Sétif', wilaya: 'Sétif' });
assert.deepStrictEqual(parseAddress('Bab Ezzouar, Alger'), { city: 'Alger', wilaya: 'Alger' });
assert.deepStrictEqual(parseAddress('Cité Daksi, Constantine'), { city: 'Constantine', wilaya: 'Constantine' });
assert.deepStrictEqual(parseAddress('5 bd Zighout Youcef 31000'), { city: undefined, wilaya: 'Oran' });
assert.deepStrictEqual(parseAddress('Rue des frères Bouadou'), { city: undefined, wilaya: undefined });
assert.deepStrictEqual(parseAddress(''), {});
assert.strictEqual(findWilaya('bejaia'), 'Béjaïa');
assert.strictEqual(findWilaya('Algiers'), 'Alger');
assert.strictEqual(findWilaya('Paris'), undefined);

assert.strictEqual(categoryOf('Coloration', 'Balayage'), 'coiffure');
assert.strictEqual(categoryOf('Barbier', 'Taille de barbe'), 'barbier');
assert.strictEqual(categoryOf('Soins', 'Soin kératine'), 'esthetique');
assert.strictEqual(categoryOf('Divers', 'Soin kératine'), 'coiffure');
assert.strictEqual(categoryOf('Hammam', 'Gommage'), 'spa-hammam');
assert.strictEqual(categoryOf('Espace détente', 'x'), undefined);
assert.strictEqual(categoryOf('Ongles', 'Pose gel'), 'ongles');
assert.strictEqual(categoryOf('Mariage', 'Coiffure mariée'), 'maquillage-mariee');
assert.strictEqual(categoryOf('Autre', 'Forfait'), undefined);
console.log('directory: ok');
