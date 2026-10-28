export type BookingStep = 'service' | 'datetime' | 'client' | 'deposit';

export interface BookingData {
  serviceId: string;
  stylistId: string;
  date: string;
  startTime: string;
  clientData: PublicClientFormData;
  /** Waitlist offer token when the client came from an offer link (lets them book a held slot) */
  waitlistOffer?: string;
}

export interface PublicClientFormData {
  // Informations personnelles
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  birthDate?: string;
  address?: string;

  // Questionnaire cheveux
  hairQuestionnaire?: {
    hairType: 'Raides' | 'Ondulés' | 'Bouclés' | 'Crépus';
    thickness: 'Fins' | 'Moyens' | 'Épais';
    scalpCondition: 'Secs' | 'Normaux' | 'Gras' | 'Mixtes';
    porosity: 'Faible' | 'Modérée' | 'Élevée';
    chemicalTreatments: ('Aucun' | 'Coloration' | 'Mèches' | 'Défrisage' | 'Permanente')[];
    lastTreatmentDate?: string;
    hairProblems: ('Pointes fourchues' | 'Cassure' | 'Frisottis' | 'Sécheresse' | 'Excès de sébum')[];
    currentProducts?: string;
    allergies?: string;
  };

  // Questionnaire peau
  skinQuestionnaire?: {
    skinType: 'Sèche' | 'Normale' | 'Grasse' | 'Mixte' | 'Sensible';
    sensitivity: 'Faible' | 'Modérée' | 'Élevée';
    skinProblems: ('Sécheresse' | 'Acné' | 'Vieillissement' | 'Taches pigmentaires' | 'Rougeurs')[];
    mainConcernArea: ('Front' | 'Joues' | 'Menton' | 'Nez' | 'Contour des yeux')[];
    currentProducts?: string;
    allergies?: string;
    pastReactions?: string;
  };

  // Préférences
  preferences: {
    communicationPreferences: {
      smsReminders: boolean;
      emailMarketing: boolean;
      birthdayOffers: boolean;
    };
    servicePreferences?: {
      preferredStylist?: string;
      preferredDays?: string[];
      preferredTimes?: string[];
    };
  };
  
  notes?: string;
}

export interface BookingError {
  step: BookingStep;
  message: string;
}

/** Salon cancellation policy shown before booking (GET /public/salon/:slug → bookingPolicy). */
export interface BookingPolicy {
  allowCancellation: boolean;
  freeCancellationHours: number;
  lateReschedule: boolean;
  policyText: string;
}

export interface PublicService {
  _id: string;
  name: string;
  description: string;
  category: string;
  duration: number;
  price: number;
  images: Array<{ url: string; alt: string; isPrimary: boolean }>;
  settings?: {
    isOnline: boolean;
    minimumBookingTime: number;
  };
  /** Online deposit rule and the amount it asks for (DA, computed by the server; 0 = none). */
  deposit?: { mode: 'none' | 'fixed' | 'percent'; value: number };
  depositAmount?: number;
}

export interface PublicTeamMember {
  _id: string;
  firstName: string;
  lastName: string;
  role: string;
  specialties?: string[];
  avatar?: string;
  color?: string;
  workingHours?: Record<string, {
    isWorking: boolean;
    start: string;
    end: string;
    breaks: Array<{ start: string; end: string }>;
  }>;
}

export interface PublicReview {
  _id: string;
  author: string;
  rating: 1 | 2 | 3 | 4 | 5;
  comment: string;
  date: string;
}

export interface PublicSalonProfile {
  _id: string;
  establishmentName: string;
  slug: string;
  description?: string;
  presentation?: string;
  phone?: string;
  logo?: string;
  banner?: string;
  publicPhone?: string;
  email?: string;
  address?: string;
  socialMedia?: { facebook?: string; instagram?: string; twitter?: string };
  businessHours?: Record<string, { start: string; end: string; lunchBreak?: { enabled: boolean; start: string; end: string } }>;
  theme?: { selectedTemplateId?: string; primary?: string; secondary?: string; accent?: string; background?: string };
  serviceDisplay?: { defaultView: string; priceDisplay: 'fixed' | 'from' | 'range' | 'hidden' };
  showTeamOnPublicPage?: boolean;
  settings?: { currency: string };
  subscription?: { plan: string };
  bookingPolicy?: BookingPolicy;
}

export interface SalonPublicData {
  profile: PublicSalonProfile;
  services: PublicService[];
  team: PublicTeamMember[];
  reviews: PublicReview[];
}
