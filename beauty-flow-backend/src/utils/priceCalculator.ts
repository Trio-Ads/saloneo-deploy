// Enum PlanType dupliqué pour éviter les problèmes de rootDir
export enum PlanType {
  FREE = 'FREE',
  STARTER = 'STARTER',
  PRO = 'PRO',
  ENTERPRISE = 'ENTERPRISE'
}

export enum SubscriptionDuration {
  MONTHLY = 'MONTHLY',
  YEARLY = 'YEARLY',
  BIENNIAL = 'BIENNIAL',
  TRIENNIAL = 'TRIENNIAL'
}

interface PriceConfig {
  display: number;      // Prix affiché en DZD
  satim: number;        // Prix pour test SATIM en centimes
  production: number;   // Prix production en centimes
}

interface DurationPriceConfig {
  [SubscriptionDuration.MONTHLY]: PriceConfig;
  [SubscriptionDuration.YEARLY]: PriceConfig;
  [SubscriptionDuration.BIENNIAL]: PriceConfig;
  [SubscriptionDuration.TRIENNIAL]: PriceConfig;
}

// Configuration des prix par plan et durée
const DURATION_PRICE_CONFIG: Record<PlanType, DurationPriceConfig | null> = {
  [PlanType.FREE]: null,
  [PlanType.STARTER]: {
    [SubscriptionDuration.MONTHLY]: {
      display: 1900,
      satim: 10000,      // 100 DZD test
      production: 190000  // 1900 DZD production
    },
    [SubscriptionDuration.YEARLY]: {
      display: 14250,     // -25%
      satim: 75000,       // 750 DZD test
      production: 1425000 // 14250 DZD production
    },
    [SubscriptionDuration.BIENNIAL]: {
      display: 24700,     // -35%
      satim: 130000,      // 1300 DZD test
      production: 2470000 // 24700 DZD production
    },
    [SubscriptionDuration.TRIENNIAL]: {
      display: 34200,     // -50%
      satim: 180000,      // 1800 DZD test
      production: 3420000 // 34200 DZD production
    }
  },
  [PlanType.PRO]: {
    [SubscriptionDuration.MONTHLY]: {
      display: 3500,
      satim: 20000,       // 200 DZD test
      production: 350000  // 3500 DZD production
    },
    [SubscriptionDuration.YEARLY]: {
      display: 26250,     // -25%
      satim: 140000,      // 1400 DZD test
      production: 2625000 // 26250 DZD production
    },
    [SubscriptionDuration.BIENNIAL]: {
      display: 45500,     // -35%
      satim: 240000,      // 2400 DZD test
      production: 4550000 // 45500 DZD production
    },
    [SubscriptionDuration.TRIENNIAL]: {
      display: 63000,     // -50%
      satim: 330000,      // 3300 DZD test
      production: 6300000 // 63000 DZD production
    }
  },
  [PlanType.ENTERPRISE]: null
};

// Pourcentages de réduction
export const DURATION_DISCOUNTS = {
  [SubscriptionDuration.MONTHLY]: 0,
  [SubscriptionDuration.YEARLY]: 25,
  [SubscriptionDuration.BIENNIAL]: 35,
  [SubscriptionDuration.TRIENNIAL]: 50
};

export class PriceCalculator {
  /**
   * Obtient le montant à envoyer à SATIM selon l'environnement et la durée
   */
  static getSatimAmount(
    planType: PlanType, 
    duration: SubscriptionDuration,
    environment: 'test' | 'production'
  ): number | null {
    const planConfig = DURATION_PRICE_CONFIG[planType];
    
    if (!planConfig) {
      return null; // Plan gratuit ou enterprise
    }

    const config = planConfig[duration];
    return environment === 'test' ? config.satim : config.production;
  }

  /**
   * Obtient le prix d'affichage pour un plan et une durée
   */
  static getDisplayPrice(planType: PlanType, duration: SubscriptionDuration): number | null {
    const planConfig = DURATION_PRICE_CONFIG[planType];
    if (!planConfig) return null;
    
    return planConfig[duration].display;
  }

  /**
   * Vérifie si un plan nécessite un paiement
   */
  static requiresPayment(planType: PlanType): boolean {
    return planType === PlanType.STARTER || planType === PlanType.PRO;
  }

  /**
   * Convertit un montant en centimes vers DZD
   */
  static centsToDZD(amountInCents: number): number {
    return amountInCents / 100;
  }

  /**
   * Convertit un montant en DZD vers centimes
   */
  static dzdToCents(amountInDZD: number): number {
    return Math.round(amountInDZD * 100);
  }

  /**
   * Formate un montant pour l'affichage
   */
  static formatAmount(amount: number): string {
    return new Intl.NumberFormat('fr-DZ', {
      style: 'currency',
      currency: 'DZD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  /**
   * Obtient tous les détails de prix pour un plan et une durée
   */
  static getPriceDetails(
    planType: PlanType, 
    duration: SubscriptionDuration,
    environment: 'test' | 'production'
  ) {
    const planConfig = DURATION_PRICE_CONFIG[planType];
    
    if (!planConfig) {
      return {
        requiresPayment: false,
        displayPrice: 0,
        displayPriceFormatted: 'Gratuit',
        satimAmount: null,
        isTestMode: environment === 'test',
        duration,
        discount: 0
      };
    }

    const config = planConfig[duration];
    const satimAmount = environment === 'test' ? config.satim : config.production;
    const discount = DURATION_DISCOUNTS[duration];
    
    return {
      requiresPayment: true,
      displayPrice: config.display,
      displayPriceFormatted: this.formatAmount(config.display),
      satimAmount,
      satimAmountInDZD: this.centsToDZD(satimAmount),
      satimAmountFormatted: this.formatAmount(this.centsToDZD(satimAmount)),
      isTestMode: environment === 'test',
      duration,
      discount
    };
  }

  /**
   * Calcule les économies pour une durée donnée
   */
  static calculateSavings(planType: PlanType, duration: SubscriptionDuration): number {
    if (!this.requiresPayment(planType) || duration === SubscriptionDuration.MONTHLY) {
      return 0;
    }

    const monthlyPrice = this.getDisplayPrice(planType, SubscriptionDuration.MONTHLY);
    const durationPrice = this.getDisplayPrice(planType, duration);
    
    if (!monthlyPrice || !durationPrice) return 0;

    const durationMonths = {
      [SubscriptionDuration.MONTHLY]: 1,
      [SubscriptionDuration.YEARLY]: 12,
      [SubscriptionDuration.BIENNIAL]: 24,
      [SubscriptionDuration.TRIENNIAL]: 36
    };

    const totalWithoutDiscount = monthlyPrice * durationMonths[duration];
    return totalWithoutDiscount - durationPrice;
  }

  /**
   * Obtient le nombre de mois pour une durée
   */
  static getDurationMonths(duration: SubscriptionDuration): number {
    const months = {
      [SubscriptionDuration.MONTHLY]: 1,
      [SubscriptionDuration.YEARLY]: 12,
      [SubscriptionDuration.BIENNIAL]: 24,
      [SubscriptionDuration.TRIENNIAL]: 36
    };
    return months[duration];
  }

  /**
   * Calcule la date de fin d'abonnement
   */
  static calculateEndDate(startDate: Date, duration: SubscriptionDuration): Date {
    const endDate = new Date(startDate);
    const months = this.getDurationMonths(duration);
    endDate.setMonth(endDate.getMonth() + months);
    return endDate;
  }
}
