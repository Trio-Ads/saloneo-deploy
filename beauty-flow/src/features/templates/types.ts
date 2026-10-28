// The full layout menu. Each list is the set of variants a template can pick for that section;
// /dev/layouts (dev server only) renders every one of them.
export const heroVariants = [
  'centered', 'split', 'fullbleed', 'minimal', 'magazine', 'poster', 'arch', 'panel', 'capsule', 'statement',
  'mosaic', 'marquee', 'frame', 'vertical', 'letterbox', 'booking', 'address', 'signature',
] as const;
export const servicesVariants = [
  'grid-3col', 'masonry', 'list', 'carousel', 'featured', 'menu', 'tabs',
  'accordion', 'pricelist-columns', 'lookbook', 'chips', 'split-categories',
] as const;
export const teamVariants = ['cards', 'h-scroll', 'spotlight', 'minimal', 'portraits', 'polaroid', 'list', 'marquee-portraits'] as const;
export const reviewsVariants = ['carousel', 'masonry', 'ticker', 'featured', 'quote-wall', 'rating-summary'] as const;
export const contactVariants = ['split', 'centered', 'minimal', 'hours-board', 'card'] as const;
export const aboutVariants = ['text', 'logo-text', 'quote'] as const;
export const galleryVariants = ['grid', 'strip'] as const;
export const ctaVariants = ['band', 'split'] as const;

export type HeroVariant     = typeof heroVariants[number];
export type ServicesVariant = typeof servicesVariants[number];
export type TeamVariant     = typeof teamVariants[number];
export type ReviewsVariant  = typeof reviewsVariants[number];
export type ContactVariant  = typeof contactVariants[number];
export type AboutVariant    = typeof aboutVariants[number];
export type GalleryVariant  = typeof galleryVariants[number];
export type CtaVariant      = typeof ctaVariants[number];

export const sectionVariants = {
  hero: heroVariants, about: aboutVariants, services: servicesVariants, gallery: galleryVariants,
  team: teamVariants, reviews: reviewsVariants, cta: ctaVariants, contact: contactVariants,
} as const;
export type SectionKey = keyof typeof sectionVariants;

export type TemplateCategory = 'polyvalent' | 'coiffure' | 'barbier' | 'ongles' | 'bien-etre' | 'mariage';

/** Style / mood tags, used by the gallery to group and search templates. */
export type TemplateTag =
  | 'lumineux' | 'sombre' | 'éditorial' | 'luxe' | 'minimal' | 'coloré' | 'naturel' | 'patrimoine' | 'street' | 'romantique'
  | (string & {});

/** Subtle motif, drawn as one decorative band under the hero (never behind text). */
export const ornaments = ['none', 'grain', 'zellige', 'lines', 'dots', 'arches', 'botanical', 'stripes', 'grid'] as const;
export type Ornament = typeof ornaments[number];

/** sheet = bottom sheet / centered dialog, drawer = side panel on desktop (sheet on phones), page = full-screen steps. */
export const bookingVariants = ['sheet', 'drawer', 'page'] as const;
export type BookingVariant = typeof bookingVariants[number];

/** Section spacing: airy ×1.35, regular as the template's `spacing.section`, compact ×0.7. */
export const densities = ['airy', 'regular', 'compact'] as const;
export type Density = typeof densities[number];
/** Filter on photos (not logos). duotone maps photos onto the template's dark and light colors. */
export const imageTreatments = ['natural', 'mono', 'warm', 'duotone'] as const;
export type ImageTreatment = typeof imageTreatments[number];

export interface TemplateSections {
  hero:     { variant: HeroVariant;     order: number };
  services: { variant: ServicesVariant; order: number };
  team:     { variant: TeamVariant;     order: number; enabled: boolean };
  reviews:  { variant: ReviewsVariant;  order: number; enabled: boolean };
  contact:  { variant: ContactVariant;  order: number };
  /** Presentation text; hidden when the salon has none. */
  about?:   { variant: AboutVariant;    order: number; enabled: boolean };
  /** Banner + service photos; hidden under 3 images. */
  gallery?: { variant: GalleryVariant;  order: number; enabled: boolean };
  /** Closing booking call to action. */
  cta?:     { variant: CtaVariant;      order: number; enabled: boolean };
}

export interface DesignTemplate {
  id: string;
  name: string;
  category: TemplateCategory;
  /** Art-direction family the template belongs to (several templates share one). */
  family: string;
  tags: TemplateTag[];
  mode: 'light' | 'dark';
  /** One line shown to the salon owner in the gallery. */
  description: string;
  tagline: string;
  preview: string;
  /** Google Fonts CSS URL, injected as a <link> by the public page. */
  fonts: string;
  sections: TemplateSections;
  ornament?: Ornament;
  booking?: { variant: BookingVariant };
  density?: Density;
  imageTreatment?: ImageTreatment;
  theme: {
    colors: {
      primary: string;
      secondary: string;
      accent: string;
      background: string;
      surface: string;
      text: string;
      textSecondary: string;
      custom?: Record<string, string>;
    };
    typography: {
      headingFont: string;
      bodyFont: string;
      sizes: Record<string, string>;
      weights: Record<string, number>;
      headingWeight: number;
      headingCase?: 'uppercase';
      headingTracking: string;
    };
    effects: {
      glassmorphism: { enabled: boolean; blur: number; opacity: number; border: string };
      animations: string[];
      transitions: string[];
      specialEffects?: string[];
      shadows: { sm: string; md: string; lg: string; xl: string; neon: string };
    };
    layout: {
      /** sm, md (buttons), lg (cards), full (avatars) */
      borderRadius: Record<string, string>;
      /** `section` = vertical padding of a section on desktop */
      spacing: Record<string, string>;
      containers: { maxWidth: string; padding: string };
    };
  };
  assets?: {
    patterns?: string[];
  };
  customCSS?: string;
}
