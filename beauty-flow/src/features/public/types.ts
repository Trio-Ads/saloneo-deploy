export type BookingStep = 'service' | 'datetime' | 'client';

export interface BookingData {
  serviceId: string;
  stylistId: string;
  date: string;
  startTime: string;
  clientData: PublicClientFormData;
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

export interface ServiceDepositInfo {
  serviceId: string;
  serviceName: string;
  depositAmount: number;
  totalAmount: number;
  currency: string;
  description?: string;
}
