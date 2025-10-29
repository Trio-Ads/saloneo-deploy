/**
 * Convertit un texte en slug URL-friendly
 * @param text - Le texte à convertir
 * @returns Le slug généré
 */
export function slugify(text: string): string {
  if (!text) return 'salon';
  
  return text
    .toLowerCase()
    .normalize('NFD') // Décomposer les caractères accentués
    .replace(/[\u0300-\u036f]/g, '') // Supprimer les accents
    .replace(/[^a-z0-9\s-]/g, '') // Garder seulement lettres, chiffres, espaces, tirets
    .trim()
    .replace(/\s+/g, '-') // Remplacer espaces par tirets
    .replace(/-+/g, '-') // Éviter tirets multiples
    .replace(/^-+|-+$/g, '') // Supprimer tirets en début/fin
    || 'salon'; // Fallback si le résultat est vide
}

/**
 * Génère un slug basé sur le nom du salon ou la présentation
 * @param input - Le nom du salon ou la présentation
 * @param fallback - Texte de fallback si l'input est vide
 * @returns Le slug généré
 */
export function generateSalonSlug(input: string, fallback: string = 'salon'): string {
  if (!input || input.trim() === '') {
    return slugify(fallback);
  }
  
  // Si l'input contient le mot "salon", extraire ce qui vient avant
  if (input.toLowerCase().includes('salon')) {
    const parts = input.toLowerCase().split('salon');
    const beforeSalon = parts[0].trim();
    if (beforeSalon) {
      return slugify(beforeSalon);
    }
  }
  
  // Sinon, utiliser l'input directement (nom d'établissement)
  return slugify(input);
}
