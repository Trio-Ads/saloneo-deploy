export type HeroVariant     = 'centered' | 'split' | 'fullbleed' | 'minimal' | 'magazine' | 'poster' | 'arch' | 'panel' | 'capsule' | 'statement';
export type ServicesVariant = 'grid-3col' | 'masonry' | 'list' | 'carousel' | 'featured' | 'menu' | 'tabs';
export type TeamVariant     = 'cards' | 'h-scroll' | 'spotlight' | 'minimal' | 'portraits';
export type ReviewsVariant  = 'carousel' | 'masonry' | 'ticker' | 'featured';
export type ContactVariant  = 'split' | 'centered' | 'minimal';

export type TemplateCategory = 'polyvalent' | 'coiffure' | 'barbier' | 'ongles' | 'bien-etre' | 'mariage';

export interface TemplateSections {
  hero:     { variant: HeroVariant;     order: number };
  services: { variant: ServicesVariant; order: number };
  team:     { variant: TeamVariant;     order: number; enabled: boolean };
  reviews:  { variant: ReviewsVariant;  order: number; enabled: boolean };
  contact:  { variant: ContactVariant;  order: number };
}

export interface DesignTemplate {
  id: string;
  name: string;
  category: TemplateCategory;
  /** One line shown to the salon owner in the gallery. */
  description: string;
  tagline: string;
  preview: string;
  /** Google Fonts CSS URL, injected as a <link> by the public page. */
  fonts: string;
  sections: TemplateSections;
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
