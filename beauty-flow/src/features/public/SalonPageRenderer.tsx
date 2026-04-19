// beauty-flow/src/features/public/SalonPageRenderer.tsx
import React from 'react';
import { DesignTemplate } from '../templates/types';
import { SalonPublicData } from './types';
import { HeroSection } from './sections/HeroSection';
import { ServicesSection } from './sections/ServicesSection';
import { TeamSection } from './sections/TeamSection';
import { ReviewsSection } from './sections/ReviewsSection';
import { ContactSection } from './sections/ContactSection';

interface Props {
  template: DesignTemplate;
  data: SalonPublicData;
  onBook: (serviceId: string) => void;
}

export function SalonPageRenderer({ template, data, onBook }: Props) {
  const { sections } = template;
  const showTeam = sections.team.enabled && data.profile.showTeamOnPublicPage !== false && data.team.length > 0;
  const showReviews = sections.reviews.enabled && data.reviews.length > 0;

  const sectionList = [
    { key: 'hero',     order: sections.hero.order,     node: <HeroSection     key="hero"     template={template} data={data} onBook={onBook} /> },
    { key: 'services', order: sections.services.order, node: <ServicesSection key="services" template={template} data={data} onBook={onBook} /> },
    { key: 'team',     order: sections.team.order,     node: showTeam    ? <TeamSection    key="team"    template={template} data={data} onBook={onBook} /> : null },
    { key: 'reviews',  order: sections.reviews.order,  node: showReviews ? <ReviewsSection key="reviews" template={template} data={data} onBook={onBook} /> : null },
    { key: 'contact',  order: sections.contact.order,  node: <ContactSection key="contact"  template={template} data={data} onBook={onBook} /> },
  ];

  return (
    <>
      {sectionList
        .sort((a, b) => a.order - b.order)
        .map(({ key, node }) => node && <React.Fragment key={key}>{node}</React.Fragment>)}
    </>
  );
}
