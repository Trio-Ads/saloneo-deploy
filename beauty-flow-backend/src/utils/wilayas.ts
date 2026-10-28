import { generateSalonSlug } from './slug';

/** The 58 wilayas of Algeria, index + 1 = official code. Same list in beauty-flow/src/features/directory/wilayas.ts. */
export const WILAYAS = [
  'Adrar', 'Chlef', 'Laghouat', 'Oum El Bouaghi', 'Batna', 'Béjaïa', 'Biskra', 'Béchar', 'Blida', 'Bouira',
  'Tamanrasset', 'Tébessa', 'Tlemcen', 'Tiaret', 'Tizi Ouzou', 'Alger', 'Djelfa', 'Jijel', 'Sétif', 'Saïda',
  'Skikda', 'Sidi Bel Abbès', 'Annaba', 'Guelma', 'Constantine', 'Médéa', 'Mostaganem', "M'Sila", 'Mascara', 'Ouargla',
  'Oran', 'El Bayadh', 'Illizi', 'Bordj Bou Arréridj', 'Boumerdès', 'El Tarf', 'Tindouf', 'Tissemsilt', 'El Oued', 'Khenchela',
  'Souk Ahras', 'Tipaza', 'Mila', 'Aïn Defla', 'Naâma', 'Aïn Témouchent', 'Ghardaïa', 'Relizane', 'Timimoun', 'Bordj Badji Mokhtar',
  'Ouled Djellal', 'Béni Abbès', 'In Salah', 'In Guezzam', 'Touggourt', 'Djanet', "El M'Ghair", 'El Meniaa',
];

export const wilayaSlug = generateSalonSlug;
const bySlug = new Map(WILAYAS.map(w => [wilayaSlug(w), w]));
/** Common spellings that differ from the official names. */
const aliases: Record<string, string> = { algiers: 'Alger', 'el-djazair': 'Alger', bejaia: 'Béjaïa', bougie: 'Béjaïa', 'tizi-ouzou': 'Tizi Ouzou', msila: "M'Sila", 'sidi-bel-abbes': 'Sidi Bel Abbès', 'bordj-bou-arreridj': 'Bordj Bou Arréridj' };

/** Official name from any spelling of a wilaya ("bejaia", "Béjaïa", "alger"), or undefined. */
export const findWilaya = (text?: string): string | undefined => {
  const s = wilayaSlug(text || '');
  return s ? bySlug.get(s) || aliases[s] : undefined;
};

/** City and wilaya guessed from a free-text address like "12 rue Didouche Mourad, 16000 Alger". */
export function parseAddress(address?: string): { city?: string; wilaya?: string } {
  if (!address) return {};
  // Drop postal codes, the country and street lines ("12 rue …"); what is left last is the town.
  const parts = address.split(/[,\n]/)
    .map(p => p.replace(/\b\d{5}\b/g, '').replace(/\b(alg[ée]rie|algeria)\b/gi, '').trim())
    .filter(p => p && !/^\d/.test(p));
  const last = parts[parts.length - 1];
  const named = parts.map(findWilaya).find(Boolean);
  // Algerian postal codes start with the wilaya code (01–48; newer wilayas reuse their parent's codes).
  const code = Number(address.match(/\b(\d{2})\d{3}\b/)?.[1] || 0);
  const wilaya = named || (code >= 1 && code <= 48 ? WILAYAS[code - 1] : undefined);
  // A lone line is a street unless it names a wilaya.
  const city = last && (parts.length > 1 || named) ? last : undefined;
  return { city, wilaya };
}
