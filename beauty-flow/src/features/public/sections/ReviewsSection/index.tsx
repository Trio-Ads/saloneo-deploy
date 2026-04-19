import { SectionProps } from '../types';
import { ReviewsCarousel } from './ReviewsCarousel';
import { ReviewsMasonry } from './ReviewsMasonry';
import { ReviewsTicker } from './ReviewsTicker';
import { ReviewsFeatured } from './ReviewsFeatured';

export function ReviewsSection(props: SectionProps) {
  switch (props.template.sections.reviews.variant) {
    case 'masonry':  return <ReviewsMasonry {...props} />;
    case 'ticker':   return <ReviewsTicker {...props} />;
    case 'featured': return <ReviewsFeatured {...props} />;
    default:         return <ReviewsCarousel {...props} />;
  }
}
