import { DesignTemplate } from './types';
import { saloneoClassicTemplate } from './saloneo-classic';
import { minimalScandinavianTemplate } from './minimal-scandinavian';
import { urbanStreetArtTemplate } from './urban-street-art';
import { botanicalSpaTemplate } from './botanical-spa';
import { glamourHollywoodTemplate } from './glamour-hollywood';
import { pastelKawaiiTemplate } from './pastel-kawaii';
import { industrialChicTemplate } from './industrial-chic';
import { vintageParisienTemplate } from './vintage-parisien';
import { techFuturisteTemplate } from './tech-futuriste';
import { modernSalon2025 } from './modern-salon-2025';

export const allTemplates: DesignTemplate[] = [
  modernSalon2025, // Nouveau template en premier
  saloneoClassicTemplate,
  minimalScandinavianTemplate,
  urbanStreetArtTemplate,
  botanicalSpaTemplate,
  glamourHollywoodTemplate,
  pastelKawaiiTemplate,
  industrialChicTemplate,
  vintageParisienTemplate,
  techFuturisteTemplate,
];

export const getTemplateById = (id: string): DesignTemplate | undefined => {
  return allTemplates.find(template => template.id === id);
};

export const getTemplatesByCategory = (category: string): DesignTemplate[] => {
  return allTemplates.filter(template => template.category === category);
};

export * from './types';
export { 
  modernSalon2025,
  saloneoClassicTemplate,
  minimalScandinavianTemplate, 
  urbanStreetArtTemplate,
  botanicalSpaTemplate,
  glamourHollywoodTemplate,
  pastelKawaiiTemplate,
  industrialChicTemplate,
  vintageParisienTemplate,
  techFuturisteTemplate
};
