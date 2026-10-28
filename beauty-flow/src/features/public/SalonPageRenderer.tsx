// beauty-flow/src/features/public/SalonPageRenderer.tsx
import React, { useId } from 'react';
import { DesignTemplate } from '../templates/types';
import { SalonPublicData } from './types';
import { HeroSection } from './sections/HeroSection';
import { ServicesSection } from './sections/ServicesSection';
import { TeamSection } from './sections/TeamSection';
import { ReviewsSection } from './sections/ReviewsSection';
import { ContactSection } from './sections/ContactSection';
import { AboutSection } from './sections/AboutSection';
import { GallerySection } from './sections/GallerySection';
import { CtaSection } from './sections/CtaSection';
import { Duotone, Ornament, themeVars } from './sections/kit';

interface Props {
  template: DesignTemplate;
  data: SalonPublicData;
  onBook: (serviceId: string) => void;
}

/** The salon page body. Self-contained (fonts + theme variables) so the dashboard previews render it as-is. */
export function SalonPageRenderer({ template, data, onBook }: Props) {
  const { sections } = template;
  const duoId = `sp-duo${useId().replace(/:/g, '')}`;
  const showTeam = sections.team.enabled && data.profile.showTeamOnPublicPage !== false && data.team.length > 0;
  const showReviews = sections.reviews.enabled && data.reviews.length > 0;
  const showAbout = !!sections.about?.enabled && !!data.profile.presentation?.trim();
  const props = { template, data, onBook };
  // The about section carries the presentation, so the hero falls back to the short description.
  const heroData = showAbout ? { ...data, profile: { ...data.profile, presentation: undefined } } : data;

  const sectionList = [
    { key: 'hero',     order: sections.hero.order,     node: <><HeroSection {...props} data={heroData} /><Ornament template={template} /></> },
    { key: 'about',    order: sections.about?.order ?? 0, node: showAbout ? <AboutSection {...props} /> : null },
    { key: 'services', order: sections.services.order, node: <ServicesSection {...props} /> },
    { key: 'gallery',  order: sections.gallery?.order ?? 0, node: sections.gallery?.enabled ? <GallerySection {...props} /> : null },
    { key: 'team',     order: sections.team.order,     node: showTeam ? <TeamSection {...props} /> : null },
    { key: 'reviews',  order: sections.reviews.order,  node: showReviews ? <ReviewsSection {...props} /> : null },
    { key: 'cta',      order: sections.cta?.order ?? 0, node: sections.cta?.enabled ? <CtaSection {...props} /> : null },
    { key: 'contact',  order: sections.contact.order,  node: <ContactSection {...props} /> },
  ];

  const treatment = template.imageTreatment && template.imageTreatment !== 'natural' ? template.imageTreatment : '';
  return (
    <div
      className={`sp ${treatment ? `sp-img-${treatment}` : ''}`}
      style={{ ...themeVars(template), ...(treatment === 'duotone' && { '--sp-duo': `url(#${duoId})` }) } as React.CSSProperties}
    >
      {template.fonts && <>
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="stylesheet" href={template.fonts} />
      </>}
      {treatment === 'duotone' && <Duotone template={template} id={duoId} />}
      {[...sectionList]
        .sort((a, b) => a.order - b.order)
        .map(({ key, node }) => node && <React.Fragment key={key}>{node}</React.Fragment>)}
    </div>
  );
}
