export interface InterfaceSettings {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
  };
  logo: {
    url: string;
    alt: string;
  };
  banner: {
    url: string;
    alt: string;
  };
  presentation: string;
  salonSlug: string;
  publicPhone?: string;
  serviceDisplay: {
    defaultView: 'grid' | 'list' | 'category';
    priceDisplay: 'fixed' | 'from' | 'range' | 'hidden';
  };
  showTeamOnPublicPage: boolean;
}

export interface ServiceDisplaySettings {
  id: string;
  isOnline: boolean;
  minimumBookingTime: number; // en heures
  displayOrder: number;
  images: Array<{
    url: string;
    alt: string;
  }>;
}

export type InterfaceFormData = Omit<InterfaceSettings, 'logo' | 'banner'>;
