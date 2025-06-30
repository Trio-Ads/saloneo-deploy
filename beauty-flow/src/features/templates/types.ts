export interface DesignTemplate {
  id: string;
  name: string;
  category: 'minimal' | 'modern' | 'classic' | 'creative';
  description: string;
  preview: string;
  theme: {
    colors: {
      primary: string;
      secondary: string;
      accent: string;
      background: string;
      surface: string;
      text: string;
      textSecondary: string;
      // Couleurs spécifiques au template
      custom?: Record<string, string>;
    };
    typography: {
      headingFont: string;
      bodyFont: string;
      sizes: {
        xs: string;
        sm: string;
        base: string;
        lg: string;
        xl: string;
        '2xl': string;
        '3xl': string;
        '4xl': string;
      };
      weights: {
        light: number;
        normal: number;
        medium: number;
        semibold: number;
        bold: number;
      };
    };
    effects: {
      glassmorphism: {
        enabled: boolean;
        blur: string;
        opacity: string;
        border: string;
      };
      animations: string[];
      transitions: string[];
      specialEffects?: string[];
      shadows: {
        sm: string;
        md: string;
        lg: string;
        xl: string;
        neon?: string;
      };
    };
    layout: {
      borderRadius: {
        sm: string;
        md: string;
        lg: string;
        xl: string;
        full: string;
      };
      spacing: {
        xs: string;
        sm: string;
        md: string;
        lg: string;
        xl: string;
      };
      containers: {
        maxWidth: string;
        padding: string;
      };
    };
  };
  assets: {
    patterns?: string[];
    illustrations?: string[];
    textures?: string[];
    particles?: ParticleConfig[];
  };
  customCSS?: string;
  customAnimations?: AnimationConfig[];
}

export interface ParticleConfig {
  type: 'floating' | 'falling' | 'orbiting' | 'glitch' | 'sparkle';
  count: number;
  size: {
    min: number;
    max: number;
  };
  speed: {
    min: number;
    max: number;
  };
  color: string;
  opacity: {
    min: number;
    max: number;
  };
}

export interface AnimationConfig {
  name: string;
  keyframes: string;
  duration: string;
  timing: string;
  iteration?: string;
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
