import { SectionProps } from '../types';
import { HeroCentered } from './HeroCentered';
import { HeroSplit } from './HeroSplit';
import { HeroFullbleed } from './HeroFullbleed';
import { HeroMinimal } from './HeroMinimal';
import { HeroMagazine } from './HeroMagazine';

export function HeroSection(props: SectionProps) {
  const variant = props.template.sections.hero.variant;
  switch (variant) {
    case 'split':     return <HeroSplit {...props} />;
    case 'fullbleed': return <HeroFullbleed {...props} />;
    case 'minimal':   return <HeroMinimal {...props} />;
    case 'magazine':  return <HeroMagazine {...props} />;
    default:          return <HeroCentered {...props} />;
  }
}
