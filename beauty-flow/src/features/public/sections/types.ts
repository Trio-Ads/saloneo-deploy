import { DesignTemplate } from '../../templates/types';
import { SalonPublicData } from '../types';

export interface SectionProps {
  template: DesignTemplate;
  data: SalonPublicData;
  onBook: (serviceId: string) => void;
}
