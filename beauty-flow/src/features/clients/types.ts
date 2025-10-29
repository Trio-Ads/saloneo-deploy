export interface Client {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  birthDate?: string;
  address?: string;
  notes?: string;
  preferences: ClientPreferences;
  loyaltyPoints: number;
  isActive: boolean;
  createdAt: string;
  lastVisit?: string;
}

export interface HairQuestionnaire {
  hairType: 'Raides' | 'Ondulés' | 'Bouclés' | 'Crépus';
  thickness: 'Fins' | 'Moyens' | 'Épais';
  scalpCondition: 'Secs' | 'Normaux' | 'Gras' | 'Mixtes'; // Conformes au backend
  porosity: 'Faible' | 'Moyenne' | 'Élevée';
  chemicalTreatments: ('Aucun' | 'Coloration' | 'Mèches' | 'Défrisage' | 'Permanente')[];
  lastTreatmentDate?: string;
  hairProblems: ('Pointes fourchues' | 'Cassure' | 'Frisottis' | 'Sécheresse' | 'Excès de sébum')[];
  currentProducts?: string;
  allergies?: string;
}

export interface SkinQuestionnaire {
  skinType: 'Sèche' | 'Normale' | 'Grasse' | 'Mixte' | 'Sensible'; // Conformes au backend
  sensitivity: 'Faible' | 'Modérée' | 'Élevée'; // Conformes au backend
  skinProblems: ('Acné' | 'Vieillissement' | 'Taches pigmentaires' | 'Rougeurs' | 'Sécheresse')[];
  mainConcernArea: ('Front' | 'Joues' | 'Menton' | 'Nez' | 'Contour des yeux')[];
  currentProducts?: string;
  allergies?: string;
  pastReactions?: string;
}

// Types pour l'interface utilisateur (affichage convivial)
export interface UIHairQuestionnaire {
  hairType: 'Raides' | 'Ondulés' | 'Bouclés' | 'Crépus';
  thickness: 'Fins' | 'Moyens' | 'Épais';
  scalpCondition: 'Normal' | 'Sec' | 'Gras' | 'Sensible' | 'Pellicules'; // Interface utilisateur
  porosity: 'Faible' | 'Moyenne' | 'Élevée';
  chemicalTreatments: ('Aucun' | 'Coloration' | 'Mèches' | 'Défrisage' | 'Permanente')[];
  lastTreatmentDate?: string;
  hairProblems: ('Pointes fourchues' | 'Cassure' | 'Frisottis' | 'Sécheresse' | 'Excès de sébum')[];
  currentProducts?: string;
  allergies?: string;
}

export interface UISkinQuestionnaire {
  skinType: 'Sèche' | 'Normale' | 'Grasse' | 'Mixte' | 'Sensible';
  sensitivity: 'Pas sensible' | 'Légèrement sensible' | 'Très sensible'; // Interface utilisateur
  skinProblems: ('Acné' | 'Vieillissement' | 'Taches pigmentaires' | 'Rougeurs' | 'Sécheresse')[];
  mainConcernArea: ('Front' | 'Joues' | 'Menton' | 'Nez' | 'Contour des yeux')[];
  currentProducts?: string;
  allergies?: string;
  pastReactions?: string;
}

export interface ClientPreferences {
  favoriteServices: string[]; // IDs des services préférés
  preferredStylists: string[]; // IDs des coiffeurs préférés
  hairQuestionnaire?: UIHairQuestionnaire; // Interface utilisateur pour le formulaire
  skinQuestionnaire?: UISkinQuestionnaire; // Interface utilisateur pour le formulaire
  communicationPreferences: {
    smsReminders: boolean;
    emailMarketing: boolean;
    birthdayOffers: boolean;
  };
}

export interface ClientHistory {
  clientId: string;
  appointments: AppointmentSummary[];
  purchases: PurchaseHistory[];
  loyaltyHistory: LoyaltyTransaction[];
}

export interface AppointmentSummary {
  id: string;
  date: string;
  services: string[]; // IDs des services
  stylist: string; // ID du coiffeur
  status: 'completed' | 'cancelled' | 'no-show';
  notes?: string;
}

export interface PurchaseHistory {
  id: string;
  date: string;
  items: {
    type: 'service' | 'product';
    id: string;
    name: string;
    price: number;
    quantity: number;
  }[];
  total: number;
}

export interface LoyaltyTransaction {
  id: string;
  date: string;
  type: 'earn' | 'redeem';
  points: number;
  reason: string;
}

export type ClientFormData = Omit<Client, 'id' | 'createdAt' | 'loyaltyPoints' | 'lastVisit'>;
