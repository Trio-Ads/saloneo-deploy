export type HeroVariant     = 'centered' | 'split' | 'fullbleed' | 'minimal' | 'magazine';
export type ServicesVariant = 'grid-3col' | 'masonry' | 'list' | 'carousel' | 'featured';
export type TeamVariant     = 'cards' | 'h-scroll' | 'spotlight' | 'minimal';
export type ReviewsVariant  = 'carousel' | 'masonry' | 'ticker' | 'featured';
export type ContactVariant  = 'split' | 'centered' | 'minimal';

export interface TemplateSections {
  hero:     { variant: HeroVariant;     order: number };
  services: { variant: ServicesVariant; order: number };
  team:     { variant: TeamVariant;     order: number; enabled: boolean };
  reviews:  { variant: ReviewsVariant;  order: number; enabled: boolean };
  contact:  { variant: ContactVariant;  order: number };
}

export interface ParticleConfig {
  count: number;
  color: string;
  size: number;
  speed: number;
}

export interface AnimationConfig {
  name: string;
  keyframes: string;
  duration: string;
  easing: string;
}

export interface DesignTemplate {
  id: string;
  name: string;
  category: 'minimal' | 'modern' | 'classic' | 'creative';
  description: string;
  preview: string;
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
    };
    effects: {
      glassmorphism: { enabled: boolean; blur: number; opacity: number; border: string };
      animations: string[];
      transitions: string[];
      specialEffects?: string[];
      shadows: { sm: string; md: string; lg: string; xl: string; neon: string };
    };
    layout: {
      borderRadius: Record<string, string>;
      spacing: Record<string, string>;
      containers: { maxWidth: string; padding: string };
    };
  };
  assets?: {
    patterns?: string[];
    illustrations?: string[];
    textures?: string[];
    particles?: ParticleConfig[];
  };
  customCSS?: string;
  customAnimations?: AnimationConfig[];
}

export interface TemplateStore {
  templates: DesignTemplate[];
  selectedTemplate: string | null;
  isApplying: boolean;
  previewMode: boolean;
  getTemplate: (id: string) => DesignTemplate | undefined;
  applyTemplate: (templateId: string) => Promise<void>;
  setPreviewMode: (enabled: boolean) => void;
  createCustomTemplate: (template: Omit<DesignTemplate, 'id'>) => void;
  updateTemplate: (id: string, updates: Partial<DesignTemplate>) => void;
}
