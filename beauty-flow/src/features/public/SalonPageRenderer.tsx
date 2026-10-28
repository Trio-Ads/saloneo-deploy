// beauty-flow/src/features/public/SalonPageRenderer.tsx
import React from 'react';
import { DesignTemplate } from '../templates/types';
import { SalonPublicData } from './types';
import { HeroSection } from './sections/HeroSection';
import { ServicesSection } from './sections/ServicesSection';
import { TeamSection } from './sections/TeamSection';
import { ReviewsSection } from './sections/ReviewsSection';
import { ContactSection } from './sections/ContactSection';
import { themeVars } from './sections/kit';

interface Props {
  template: DesignTemplate;
  data: SalonPublicData;
  onBook: (serviceId: string) => void;
}

/** The salon page body. Self-contained (fonts + theme variables) so the dashboard previews render it as-is. */
export function SalonPageRenderer({ template, data, onBook }: Props) {
  const { sections } = template;
  const showTeam = sections.team.enabled && data.profile.showTeamOnPublicPage !== false && data.team.length > 0;
  const showReviews = sections.reviews.enabled && data.reviews.length > 0;
  const props = { template, data, onBook };

  const sectionList = [
    { key: 'hero',     order: sections.hero.order,     node: <HeroSection {...props} /> },
    { key: 'services', order: sections.services.order, node: <ServicesSection {...props} /> },
    { key: 'team',     order: sections.team.order,     node: showTeam ? <TeamSection {...props} /> : null },
    { key: 'reviews',  order: sections.reviews.order,  node: showReviews ? <ReviewsSection {...props} /> : null },
    { key: 'contact',  order: sections.contact.order,  node: <ContactSection {...props} /> },
  ];

  return (
    <div className="sp" style={themeVars(template)}>
      {template.fonts && <>
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="stylesheet" href={template.fonts} />
      </>}
      {[...sectionList]
        .sort((a, b) => a.order - b.order)
        .map(({ key, node }) => node && <React.Fragment key={key}>{node}</React.Fragment>)}
    </div>
  );
}
