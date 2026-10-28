import { AboutVariant, CtaVariant, DesignTemplate, GalleryVariant, SectionKey, TemplateCategory, TemplateSections } from './types';

// Collection 2026: each template is a world (type, palette, radius, density, section structure).
// Everything not listed here is shared plumbing, filled in by `define`.

type Variants = [TemplateSections['hero']['variant'], TemplateSections['services']['variant'], TemplateSections['team']['variant'], TemplateSections['reviews']['variant'], TemplateSections['contact']['variant']];

export interface Spec {
  id: string;
  name: string;
  tagline: string;
  description: string;
  category: TemplateCategory;
  fonts: string;
  heading: [family: string, weight: number, tracking: string, uppercase?: boolean];
  body: string;
  /** primary, secondary, accent, background, surface, text, textSecondary */
  colors: [string, string, string, string, string, string, string];
  band?: string;
  /** buttons, cards, avatars */
  radius: [string, string, string];
  section: string;
  variants: Variants;
  /** section order, default hero → services → team → reviews → contact */
  order?: [hero: number, services: number, team: number, reviews: number, contact: number];
  /** Optional sections, off unless given. Default places: about after the hero, gallery after services, cta before contact. */
  about?: AboutVariant;
  gallery?: GalleryVariant;
  cta?: CtaVariant;
  /** Full page order (overrides `order`), e.g. ['hero', 'about', 'services', 'gallery', 'team', 'reviews', 'cta', 'contact']. */
  flow?: SectionKey[];
  family?: string;
  tags?: string[];
  /** Derived from the background when absent. */
  mode?: DesignTemplate['mode'];
  ornament?: DesignTemplate['ornament'];
  booking?: NonNullable<DesignTemplate['booking']>['variant'];
  density?: DesignTemplate['density'];
  imageTreatment?: DesignTemplate['imageTreatment'];
  patterns?: string[];
}

const luminance = (hex: string) => {
  const h = hex.replace('#', '');
  const f = h.length === 3 ? h.split('').map(c => c + c).join('') : h;
  const [r, g, b] = [0, 2, 4].map(i => parseInt(f.slice(i, i + 2), 16) / 255);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

const fallback = (family: string, serif: boolean) =>
  `'${family}', 'Noto Sans Arabic', ${serif ? "Georgia, 'Times New Roman', serif" : 'system-ui, sans-serif'}`;

const fonts = (q: string) => `https://fonts.googleapis.com/css2?${q}&display=swap`;

export function define(s: Spec): DesignTemplate {
  const [primary, secondary, accent, background, surface, text, textSecondary] = s.colors;
  const [hero, services, team, reviews, contact] = s.variants;
  const [o0, o1, o2, o3, o4] = s.order ?? [0, 1, 2, 3, 4];
  const at = (k: SectionKey, d: number) => (s.flow?.includes(k) ? s.flow.indexOf(k) : d);
  const [hFamily, hWeight, hTracking, upper] = s.heading;
  const serif = (f: string) => /Fraunces|Marcellus|Cormorant|Amiri|Lora|Playfair|Serif|Caslon|Forum|Gloock|Newsreader|Mincho|Hahmlet|Bodoni|Didot|Gilda|Alegreya|Prata|Garamond|Baskerville|Cinzel|Crimson|Spectral|Libre|Merriweather|Rozha|Abril|Italiana|Tenor|Young Serif|Caprasimo|DM Serif|Rufina|Domine|Bellefair|Aboreto|Literata|Fanwood|Sorts Mill|Old Standard|Petrona|Brygada|Besley|Castoro|Instrument Serif|Aref|Reem|Messiri|Noto Naskh|Scheherazade/.test(f);
  return {
    id: s.id,
    name: s.name,
    category: s.category,
    tagline: s.tagline,
    description: s.description,
    preview: '',
    fonts: fonts(s.fonts),
    family: s.family ?? s.id,
    tags: s.tags ?? [],
    mode: s.mode ?? (luminance(background) < 0.45 ? 'dark' : 'light'),
    sections: {
      hero:     { variant: hero, order: at('hero', o0) },
      services: { variant: services, order: at('services', o1) },
      team:     { variant: team, order: at('team', o2), enabled: !s.flow || s.flow.includes('team') },
      reviews:  { variant: reviews, order: at('reviews', o3), enabled: !s.flow || s.flow.includes('reviews') },
      contact:  { variant: contact, order: at('contact', o4) },
      ...(s.about && { about: { variant: s.about, order: at('about', 0.5), enabled: true } }),
      ...(s.gallery && { gallery: { variant: s.gallery, order: at('gallery', 1.5), enabled: true } }),
      ...(s.cta && { cta: { variant: s.cta, order: at('cta', 3.5), enabled: true } }),
    },
    ...(s.ornament && { ornament: s.ornament }),
    ...(s.booking && { booking: { variant: s.booking } }),
    ...(s.density && { density: s.density }),
    ...(s.imageTreatment && { imageTreatment: s.imageTreatment }),
    theme: {
      colors: { primary, secondary, accent, background, surface, text, textSecondary, ...(s.band && { custom: { band: s.band } }) },
      typography: {
        headingFont: fallback(hFamily, serif(hFamily)),
        bodyFont: fallback(s.body, serif(s.body)),
        sizes: {},
        weights: { heading: hWeight },
        headingWeight: hWeight,
        headingTracking: hTracking,
        ...(upper && { headingCase: 'uppercase' as const }),
      },
      effects: {
        glassmorphism: { enabled: false, blur: 0, opacity: 0, border: 'none' },
        animations: [],
        transitions: [],
        shadows: { sm: 'none', md: 'none', lg: 'none', xl: 'none', neon: 'none' },
      },
      layout: {
        borderRadius: { sm: s.radius[0], md: s.radius[0], lg: s.radius[1], full: s.radius[2] },
        spacing: { section: s.section },
        containers: { maxWidth: '72rem', padding: '1.25rem' },
      },
    },
    ...(s.patterns && { assets: { patterns: s.patterns } }),
  };
}

export const studio = define({
  family: 'coiffure-contemporaine', tags: ['lumineux', 'minimal'],
  id: 'studio', name: 'Studio', tagline: 'Salon polyvalent', category: 'polyvalent',
  description: 'Clair et chaleureux, l’orange Saloneo pour un salon polyvalent qui mène droit à la réservation.',
  fonts: 'family=Plus+Jakarta+Sans:wght@500;600;700&family=Inter:wght@400;500;600',
  heading: ['Plus Jakarta Sans', 700, '-0.03em'], body: 'Inter',
  colors: ['#F97316', '#C2410C', '#FFEDD5', '#FFFFFF', '#FAFAF9', '#18181B', '#52525B'],
  radius: ['12px', '16px', '9999px'], section: '6rem',
  variants: ['split', 'tabs', 'cards', 'carousel', 'split'],
});

export const atelier = define({
  family: 'coiffure-contemporaine', tags: ['éditorial', 'lumineux'],
  id: 'atelier', name: 'Atelier', tagline: 'Atelier de coiffure', category: 'coiffure',
  description: 'Esprit éditorial : le nom du salon en grand comme une affiche, les prestations en carte de menu.',
  fonts: 'family=Fraunces:opsz,wght@9..144,300..600&family=Inter:wght@400;500;600',
  heading: ['Fraunces', 400, '-0.035em'], body: 'Inter',
  colors: ['#7F1D1D', '#1C1917', '#E7E5E4', '#FAFAF7', '#F2F0EA', '#1C1917', '#57534E'],
  radius: ['0px', '0px', '0px'], section: '8rem',
  variants: ['poster', 'menu', 'portraits', 'featured', 'minimal'],
});

export const hammam = define({
  family: 'spa-hammam', tags: ['naturel', 'patrimoine'],
  id: 'hammam', name: 'Hammam', tagline: 'Hammam & spa', category: 'bien-etre',
  description: 'Vert profond, sable et cuivre, une arche mauresque pour les hammams et les spas.',
  fonts: 'family=Marcellus&family=Nunito+Sans:wght@400;600;700',
  heading: ['Marcellus', 400, '0em'], body: 'Nunito Sans',
  colors: ['#1F3B2D', '#B4693E', '#E9DFCC', '#F7F2E8', '#EFE6D5', '#1D2A22', '#55594B'],
  band: '#E9DFCC',
  radius: ['9999px', '20px', '9999px'], section: '6.5rem',
  variants: ['arch', 'list', 'minimal', 'masonry', 'centered'],
});

export const barber = define({
  family: 'barbier', tags: ['sombre', 'street'],
  id: 'barber', name: 'Barber Club', tagline: 'Barbier', category: 'barbier',
  description: 'Anthracite, laiton et lettres condensées : l’ardoise d’un barbier de quartier.',
  fonts: 'family=Oswald:wght@500;600&family=Inter:wght@400;500;600',
  heading: ['Oswald', 600, '0.01em', true], body: 'Inter',
  colors: ['#C8A15A', '#8C6D35', '#2A2620', '#141414', '#1C1C1C', '#EDE8DF', '#A9A296'],
  radius: ['4px', '4px', '4px'], section: '4.5rem',
  variants: ['fullbleed', 'menu', 'h-scroll', 'ticker', 'split'],
  order: [0, 2, 3, 1, 4],
});

export const onglerie = define({
  family: 'ongles-cils', tags: ['coloré', 'lumineux'],
  id: 'onglerie', name: 'Onglerie', tagline: 'Studio ongles', category: 'ongles',
  description: 'Fuchsia et lilas, des pastilles de couleur comme des flacons de vernis, pour les studios d’ongles.',
  fonts: 'family=Bricolage+Grotesque:opsz,wght@12..96,600..800&family=Inter:wght@400;500;600',
  heading: ['Bricolage Grotesque', 700, '-0.035em'], body: 'Inter',
  colors: ['#DB2777', '#A78BFA', '#FCE7F3', '#FFFFFF', '#FDF4F9', '#1F1023', '#6B5A6E'],
  radius: ['9999px', '24px', '9999px'], section: '5rem',
  variants: ['capsule', 'masonry', 'cards', 'masonry', 'centered'],
});

export const mariee = define({
  family: 'mariage', tags: ['romantique', 'luxe'],
  id: 'mariee', name: 'Mariée', tagline: 'Mariée & maquillage', category: 'mariage',
  description: 'Ivoire, champagne et rose poudré, de l’espace et de la lumière pour la mariée et le maquillage.',
  fonts: 'family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500&family=Jost:wght@400;500',
  heading: ['Cormorant Garamond', 500, '-0.01em'], body: 'Jost',
  colors: ['#B08D57', '#E8C4C0', '#F3E6D3', '#FFFDF8', '#FAF4EA', '#2B2420', '#6E625A'],
  radius: ['0px', '2px', '9999px'], section: '8rem',
  variants: ['centered', 'featured', 'spotlight', 'featured', 'centered'],
  order: [0, 1, 3, 2, 4],
});

export const institut = define({
  family: 'institut', tags: ['minimal', 'naturel'],
  id: 'institut', name: 'Institut', tagline: 'Institut d’esthétique', category: 'bien-etre',
  description: 'Net et apaisant, vert sauge et typographie précise pour un institut d’esthétique.',
  fonts: 'family=Manrope:wght@400;500;600;700',
  heading: ['Manrope', 700, '-0.03em'], body: 'Manrope',
  colors: ['#5F7F6E', '#3F5A4C', '#EEF3F0', '#FFFFFF', '#EEF3F0', '#15201B', '#4E5E57'],
  radius: ['10px', '12px', '9999px'], section: '5.5rem',
  variants: ['minimal', 'tabs', 'minimal', 'carousel', 'split'],
});

export const medina = define({
  family: 'patrimoine', tags: ['patrimoine', 'coloré'],
  id: 'medina', name: 'Médina', tagline: 'Patrimoine algérois', category: 'polyvalent',
  description: 'Indigo, safran et zellige : un hommage à la Casbah pour un salon ancré dans son patrimoine.',
  fonts: 'family=Amiri:wght@400;700&family=Lora:wght@400;500;600',
  heading: ['Amiri', 700, '0em'], body: 'Lora',
  colors: ['#1E2A4A', '#E3A33B', '#2A7F7A', '#FBF7EF', '#F3EBDD', '#1E2A4A', '#4E5670'],
  band: '#1E2A4A',
  radius: ['6px', '10px', '9999px'], section: '6rem',
  variants: ['arch', 'menu', 'cards', 'carousel', 'split'],
  patterns: ['zellige'],
});

export const noir = define({
  family: 'haute-coiffure', tags: ['luxe', 'sombre'],
  id: 'noir', name: 'Noir', tagline: 'Salon haut de gamme', category: 'coiffure',
  description: 'Noir profond et or, l’équipe mise en scène : le salon haut de gamme.',
  fonts: 'family=Playfair+Display:wght@400;500;600&family=Inter:wght@400;500',
  heading: ['Playfair Display', 500, '-0.01em'], body: 'Inter',
  colors: ['#C9A96E', '#8A7344', '#262420', '#121212', '#1A1A1A', '#F2EDE4', '#A8A298'],
  radius: ['0px', '2px', '9999px'], section: '7rem',
  variants: ['fullbleed', 'featured', 'spotlight', 'featured', 'minimal'],
});

export const epure = define({
  family: 'coiffure-contemporaine', tags: ['minimal', 'lumineux'],
  id: 'epure', name: 'Épure', tagline: 'Minimal', category: 'polyvalent',
  description: 'Noir et blanc, rien de superflu : la mise en page la plus sobre de la collection.',
  fonts: 'family=Inter:wght@300..700',
  heading: ['Inter', 600, '-0.04em'], body: 'Inter',
  colors: ['#111111', '#666666', '#EDEDED', '#FFFFFF', '#F5F5F5', '#111111', '#666666'],
  radius: ['9999px', '8px', '9999px'], section: '7rem',
  variants: ['statement', 'list', 'minimal', 'featured', 'minimal'],
});

export const soleil = define({
  family: 'pop-quartier', tags: ['coloré', 'lumineux'],
  id: 'soleil', name: 'Soleil', tagline: 'Salon de quartier', category: 'polyvalent',
  description: 'Corail et jaune soleil, le salon de quartier familial, accueillant et joyeux.',
  fonts: 'family=DM+Serif+Display&family=DM+Sans:opsz,wght@9..40,400..700',
  heading: ['DM Serif Display', 400, '-0.01em'], body: 'DM Sans',
  colors: ['#F26B5B', '#FFC857', '#FFE9C2', '#FFFFFF', '#FFF6EC', '#2A1A14', '#6B5148'],
  radius: ['9999px', '20px', '9999px'], section: '5rem',
  variants: ['panel', 'carousel', 'h-scroll', 'ticker', 'centered'],
  order: [0, 2, 3, 1, 4],
});

export const botanique = define({
  family: 'spa-hammam', tags: ['naturel', 'éditorial'],
  id: 'botanique', name: 'Botanique', tagline: 'Soins naturels', category: 'bien-etre',
  description: 'Lin, olive et argile, une mise en page magazine pour les soins naturels.',
  fonts: 'family=Instrument+Serif:ital@0;1&family=Instrument+Sans:wght@400..600',
  heading: ['Instrument Serif', 400, '-0.02em'], body: 'Instrument Sans',
  colors: ['#5B6B2F', '#C77B58', '#E3DCC8', '#F6F3EC', '#EDE7DA', '#23261B', '#5A5C4C'],
  radius: ['9999px', '14px', '9999px'], section: '6rem',
  variants: ['magazine', 'grid-3col', 'cards', 'masonry', 'split'],
});

export const collection2026 = [studio, atelier, hammam, barber, onglerie, mariee, institut, medina, noir, epure, soleil, botanique];
