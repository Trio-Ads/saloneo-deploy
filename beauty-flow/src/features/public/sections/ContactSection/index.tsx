import { SectionProps } from '../types';
import { ContactSplit } from './ContactSplit';
import { ContactCentered } from './ContactCentered';
import { ContactMinimal } from './ContactMinimal';

export function ContactSection(props: SectionProps) {
  switch (props.template.sections.contact.variant) {
    case 'centered': return <ContactCentered {...props} />;
    case 'minimal':  return <ContactMinimal {...props} />;
    default:         return <ContactSplit {...props} />;
  }
}
