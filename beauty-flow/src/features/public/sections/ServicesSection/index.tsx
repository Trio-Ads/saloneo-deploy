import { SectionProps } from '../types';
import { ServicesGrid3col } from './ServicesGrid3col';
import { ServicesMasonry } from './ServicesMasonry';
import { ServicesList } from './ServicesList';
import { ServicesCarousel } from './ServicesCarousel';
import { ServicesFeatured } from './ServicesFeatured';

export function ServicesSection(props: SectionProps) {
  switch (props.template.sections.services.variant) {
    case 'masonry':  return <ServicesMasonry {...props} />;
    case 'list':     return <ServicesList {...props} />;
    case 'carousel': return <ServicesCarousel {...props} />;
    case 'featured': return <ServicesFeatured {...props} />;
    default:         return <ServicesGrid3col {...props} />;
  }
}
