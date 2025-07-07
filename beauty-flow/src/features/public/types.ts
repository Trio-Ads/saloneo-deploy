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
    scalpCondition: 'Normal' | 'Sec' | 'Gras' | 'Sensible' | 'Pellicules';
    porosity: 'Faible' | 'Moyenne' | 'Élevée';
    chemicalTreatments: ('Aucun' | 'Coloration' | 'Mèches' | 'Défrisage' | 'Permanente')[];
    lastTreatmentDate?: string;
    hairProblems: ('Pointes fourchues' | 'Cassure' | 'Frisottis' | 'Sécheresse' | 'Excès de sébum')[];
    currentProducts?: string;
    allergies?: string;
  };

  // Questionnaire peau
  skinQuestionnaire?: {
    skinType: 'Normale' | 'Sèche' | 'Grasse' | 'Mixte' | 'Sensible';
    sensitivity: 'Pas sensible' | 'Légèrement sensible' | 'Très sensible';
    skinProblems: ('Acné' | 'Vieillissement' | 'Taches pigmentaires' | 'Rougeurs' | 'Sécheresse')[];
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
