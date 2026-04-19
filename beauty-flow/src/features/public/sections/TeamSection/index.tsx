import { SectionProps } from '../types';
import { TeamCards } from './TeamCards';
import { TeamHScroll } from './TeamHScroll';
import { TeamSpotlight } from './TeamSpotlight';
import { TeamMinimal } from './TeamMinimal';

export function TeamSection(props: SectionProps) {
  switch (props.template.sections.team.variant) {
    case 'h-scroll':  return <TeamHScroll {...props} />;
    case 'spotlight': return <TeamSpotlight {...props} />;
    case 'minimal':   return <TeamMinimal {...props} />;
    default:          return <TeamCards {...props} />;
  }
}
