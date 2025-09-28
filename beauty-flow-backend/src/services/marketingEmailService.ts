import { emailService } from './emailService';
import { logger } from '../utils/logger';
import { User, IUser } from '../models/User';
import { Client, IClient } from '../models/Client';
import { EmailTemplateData } from '../types/email.types';
import * as cron from 'node-cron';

interface NewsletterContent {
  title: string;
  sections: Array<{
    heading: string;
    content: string;
    image?: string;
    cta?: {
      text: string;
      url: string;
    };
  }>;
}

interface SpecialOffer {
  title: string;
  description: string;
  discount: number;
  validUntil: Date;
  code?: string;
  services?: string[];
}

interface LoyaltyReward {
  points: number;
  level: string;
  nextLevelPoints: number;
  availableRewards: Array<{
    name: string;
    pointsCost: number;
    description: string;
  }>;
}

class MarketingEmailService {
  constructor() {
    // Initialize marketing cron jobs
    this.initializeMarketingCronJobs();
  }

  private initializeMarketingCronJobs() {
    // Send monthly newsletter on the 1st of each month at 10:00 AM
    cron.schedule('0 10 1 * *', async () => {
      logger.info('Sending monthly newsletter...');
      await this.sendMonthlyNewsletter();
    });

    // Check for birthdays daily at 9:00 AM
    cron.schedule('0 9 * * *', async () => {
      logger.info('Checking for client birthdays...');
      await this.sendBirthdayEmails();
    });

    // Send loyalty program updates weekly on Mondays at 10:00 AM
    cron.schedule('0 10 * * 1', async () => {
      logger.info('Sending loyalty program updates...');
      await this.sendLoyaltyProgramUpdates();
    });

    logger.info('Marketing email cron jobs initialized');
  }

  // Send monthly newsletter
  async sendMonthlyNewsletter() {
    try {
      const users = await User.find({ 
        isActive: true,
        'subscription.isActive': true 
      });

      for (const user of users) {
        const clients = await Client.find({ 
          userId: user._id,
          'preferences.newsletter': true 
        });

        if (clients.length === 0) continue;

        // Generate newsletter content based on salon data
        const newsletterContent = await this.generateNewsletterContent(user);

        for (const client of clients) {
          await this.sendNewsletter(client, user, newsletterContent);
        }
      }
    } catch (error) {
      logger.error('Error sending monthly newsletter:', error);
    }
  }

  // Send newsletter to individual client
  private async sendNewsletter(client: IClient, salon: IUser, content: NewsletterContent) {
    try {
      const templateData: EmailTemplateData = {
        clientName: `${client.firstName} ${client.lastName}`,
        salonName: salon.establishmentName,
        salonAddress: salon.address,
        salonPhone: salon.phone,
        salonEmail: salon.email,
        newsletterTitle: content.title,
        newsletterSections: content.sections,
        unsubscribeUrl: `${process.env.FRONTEND_URL}/unsubscribe?token=${client._id}`
      };

      await emailService.sendTemplateEmail(
        'monthly-newsletter',
        client.email || '',
        templateData
      );

      logger.info(`Sent newsletter to ${client.email}`);
    } catch (error) {
      logger.error(`Error sending newsletter to ${client.email}:`, error);
    }
  }

  // Send special offers and promotions
  async sendSpecialOffer(userId: string, offer: SpecialOffer) {
    try {
      const user = await User.findById(userId);
      if (!user) return;

      const clients = await Client.find({ 
        userId,
        'preferences.promotions': true 
      });

      for (const client of clients) {
        const templateData: EmailTemplateData = {
          clientName: `${client.firstName} ${client.lastName}`,
          salonName: user.establishmentName,
          salonAddress: user.address,
          salonPhone: user.phone,
          salonEmail: user.email,
          offerTitle: offer.title,
          offerDescription: offer.description,
          discount: offer.discount.toString(),
          validUntil: offer.validUntil.toISOString(),
          promoCode: offer.code,
          services: offer.services,
          bookingUrl: `${process.env.FRONTEND_URL}/book/${user.tokens?.public}`
        };

      await emailService.sendTemplateEmail(
        'special-offer',
        client.email || '',
        templateData
      );

        logger.info(`Sent special offer to ${client.email}`);
      }
    } catch (error) {
      logger.error('Error sending special offer:', error);
    }
  }

  // Send birthday emails
  async sendBirthdayEmails() {
    try {
      const today = new Date();
      const todayMonth = today.getMonth() + 1;
      const todayDay = today.getDate();

      const users = await User.find({ 
        isActive: true,
        'subscription.isActive': true 
      });

      for (const user of users) {
        // Find clients with birthday today
        const birthdayClients = await Client.find({
          userId: user._id,
          $expr: {
            $and: [
              { $eq: [{ $month: '$dateOfBirth' }, todayMonth] },
              { $eq: [{ $dayOfMonth: '$dateOfBirth' }, todayDay] }
            ]
          }
        });

        for (const client of birthdayClients) {
          await this.sendBirthdayEmail(client, user);
        }
      }
    } catch (error) {
      logger.error('Error sending birthday emails:', error);
    }
  }

  // Send individual birthday email
  private async sendBirthdayEmail(client: IClient, salon: IUser) {
    try {
      // Calculate age
      const today = new Date();
      const birthDate = new Date(client.dateOfBirth!);
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }

      const templateData: EmailTemplateData = {
        clientName: `${client.firstName} ${client.lastName}`,
        salonName: salon.establishmentName,
        salonAddress: salon.address,
        salonPhone: salon.phone,
        salonEmail: salon.email,
        age: age.toString(),
        birthdayDiscount: '20', // 20% birthday discount
        birthdayPromoCode: `BDAY${(client._id as any).toString().slice(-6).toUpperCase()}`,
        validDays: '30',
        bookingUrl: `${process.env.FRONTEND_URL}/book/${salon.tokens?.public}`
      };

      await emailService.sendTemplateEmail(
        'birthday-wishes',
        client.email || '',
        templateData
      );

      logger.info(`Sent birthday email to ${client.email}`);
    } catch (error) {
      logger.error(`Error sending birthday email to ${client.email}:`, error);
    }
  }

  // Send loyalty program updates
  async sendLoyaltyProgramUpdates() {
    try {
      const users = await User.find({ 
        isActive: true,
        'subscription.isActive': true 
      });

      for (const user of users) {
        const clients = await Client.find({ 
          userId: user._id,
          loyaltyPoints: { $gt: 0 }
        });

        for (const client of clients) {
          const loyaltyData = this.calculateLoyaltyStatus(client);
          await this.sendLoyaltyUpdate(client, user, loyaltyData);
        }
      }
    } catch (error) {
      logger.error('Error sending loyalty program updates:', error);
    }
  }

  // Send individual loyalty update
  private async sendLoyaltyUpdate(client: IClient, salon: IUser, loyaltyData: LoyaltyReward) {
    try {
      const templateData: EmailTemplateData = {
        clientName: `${client.firstName} ${client.lastName}`,
        salonName: salon.establishmentName,
        salonAddress: salon.address,
        salonPhone: salon.phone,
        salonEmail: salon.email,
        loyaltyPoints: loyaltyData.points.toString(),
        loyaltyLevel: loyaltyData.level,
        nextLevelPoints: loyaltyData.nextLevelPoints.toString(),
        availableRewards: loyaltyData.availableRewards,
        redeemUrl: `${process.env.FRONTEND_URL}/loyalty/${client._id}`
      };

      await emailService.sendTemplateEmail(
        'loyalty-program-update',
        client.email || '',
        templateData
      );

      logger.info(`Sent loyalty update to ${client.email}`);
    } catch (error) {
      logger.error(`Error sending loyalty update to ${client.email}:`, error);
    }
  }

  // Send welcome to loyalty program
  async sendLoyaltyProgramWelcome(clientId: string) {
    try {
      const client = await Client.findById(clientId).populate('userId');
      if (!client || !client.userId) return;

      const salon = client.userId as any;

      const templateData: EmailTemplateData = {
        clientName: `${client.firstName} ${client.lastName}`,
        salonName: salon.establishmentName,
        salonAddress: salon.address,
        salonPhone: salon.phone,
        salonEmail: salon.email,
        welcomePoints: '50', // Welcome bonus points
        programBenefits: [
          '1 point pour chaque 100 DZD dépensé',
          'Réductions exclusives',
          'Cadeaux d\'anniversaire',
          'Accès prioritaire aux nouveaux services'
        ]
      };

      await emailService.sendTemplateEmail(
        'loyalty-program-welcome',
        client.email || '',
        templateData
      );

      logger.info(`Sent loyalty welcome to ${client.email}`);
    } catch (error) {
      logger.error('Error sending loyalty welcome:', error);
    }
  }

  // Send reward earned notification
  async sendRewardEarned(clientId: string, rewardName: string, pointsUsed: number) {
    try {
      const client = await Client.findById(clientId).populate('userId');
      if (!client || !client.userId) return;

      const salon = client.userId as any;

      const templateData: EmailTemplateData = {
        clientName: `${client.firstName} ${client.lastName}`,
        salonName: salon.establishmentName,
        salonAddress: salon.address,
        salonPhone: salon.phone,
        salonEmail: salon.email,
        rewardName,
        pointsUsed: pointsUsed.toString(),
        remainingPoints: (client.loyaltyPoints || 0).toString(),
        redeemCode: `REWARD${Date.now().toString(36).toUpperCase()}`
      };

      await emailService.sendTemplateEmail(
        'reward-earned',
        client.email || '',
        templateData
      );

      logger.info(`Sent reward earned notification to ${client.email}`);
    } catch (error) {
      logger.error('Error sending reward earned notification:', error);
    }
  }

  // Send re-engagement campaign
  async sendReEngagementCampaign() {
    try {
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

      const users = await User.find({ 
        isActive: true,
        'subscription.isActive': true 
      });

      for (const user of users) {
        // Find inactive clients (no appointments in last 3 months)
        const { Appointment } = await import('../models/Appointment');
        
        // Get clients who haven't had appointments in 3 months
        const recentAppointments = await Appointment.find({
          userId: user._id,
          date: { $gte: threeMonthsAgo }
        }).distinct('clientId');
        
        const inactiveClients = await Client.find({
          userId: user._id,
          _id: { $nin: recentAppointments }
        });

        for (const client of inactiveClients) {
          await this.sendReEngagementEmail(client, user);
        }
      }
    } catch (error) {
      logger.error('Error sending re-engagement campaign:', error);
    }
  }

  // Send individual re-engagement email
  private async sendReEngagementEmail(client: IClient, salon: IUser) {
    try {
      // Calculate days since last appointment (approximation)
      const daysSinceLastVisit = '90'; // Default to 3 months
      
      const templateData: EmailTemplateData = {
        clientName: `${client.firstName} ${client.lastName}`,
        salonName: salon.establishmentName,
        salonAddress: salon.address,
        salonPhone: salon.phone,
        salonEmail: salon.email,
        lastVisitDays: daysSinceLastVisit,
        comebackDiscount: '30', // 30% comeback discount
        comebackPromoCode: `COMEBACK${(client._id as any).toString().slice(-6).toUpperCase()}`,
        bookingUrl: `${process.env.FRONTEND_URL}/book/${salon.tokens?.public}`
      };

      await emailService.sendTemplateEmail(
        're-engagement',
        client.email || '',
        templateData
      );

      logger.info(`Sent re-engagement email to ${client.email}`);
    } catch (error) {
      logger.error(`Error sending re-engagement email to ${client.email}:`, error);
    }
  }

  // Helper methods
  private async generateNewsletterContent(salon: IUser): Promise<NewsletterContent> {
    const currentMonth = new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
    
    return {
      title: `Newsletter ${salon.establishmentName} - ${currentMonth}`,
      sections: [
        {
          heading: 'Nouveautés du mois',
          content: 'Découvrez nos derniers services et produits pour sublimer votre beauté.',
          cta: {
            text: 'Voir les nouveautés',
            url: `${process.env.FRONTEND_URL}/services/${salon.tokens?.public}`
          }
        },
        {
          heading: 'Conseils beauté',
          content: 'Nos experts partagent leurs meilleurs conseils pour prendre soin de vous.',
          image: '/images/beauty-tips.jpg'
        },
        {
          heading: 'Offre exclusive',
          content: 'En tant que client fidèle, bénéficiez de -15% sur votre prochain soin.',
          cta: {
            text: 'Réserver maintenant',
            url: `${process.env.FRONTEND_URL}/book/${salon.tokens?.public}`
          }
        }
      ]
    };
  }

  private calculateLoyaltyStatus(client: IClient): LoyaltyReward {
    const points = client.loyaltyPoints || 0;
    let level = 'Bronze';
    let nextLevelPoints = 500;

    if (points >= 2000) {
      level = 'Platinum';
      nextLevelPoints = 0; // Max level
    } else if (points >= 1000) {
      level = 'Gold';
      nextLevelPoints = 2000;
    } else if (points >= 500) {
      level = 'Silver';
      nextLevelPoints = 1000;
    }

    const availableRewards = [];
    if (points >= 100) availableRewards.push({ name: 'Réduction 10%', pointsCost: 100, description: '10% sur votre prochain service' });
    if (points >= 250) availableRewards.push({ name: 'Soin express offert', pointsCost: 250, description: 'Un soin express gratuit' });
    if (points >= 500) availableRewards.push({ name: 'Réduction 25%', pointsCost: 500, description: '25% sur un service premium' });
    if (points >= 1000) availableRewards.push({ name: 'Journée VIP', pointsCost: 1000, description: 'Accès VIP avec services exclusifs' });

    return {
      points,
      level,
      nextLevelPoints,
      availableRewards
    };
  }

  // Send seasonal campaign
  async sendSeasonalCampaign(season: 'spring' | 'summer' | 'autumn' | 'winter') {
    try {
      const users = await User.find({ 
        isActive: true,
        'subscription.isActive': true 
      });

      const seasonalOffers: Record<string, SpecialOffer> = {
        spring: {
          title: 'Offre Printemps - Réveillez votre beauté',
          description: 'Préparez-vous pour le printemps avec nos soins revitalisants',
          discount: 20,
          validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          code: 'SPRING2025'
        },
        summer: {
          title: 'Offre Été - Brillez sous le soleil',
          description: 'Protégez et sublimez votre peau pour l\'été',
          discount: 25,
          validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          code: 'SUMMER2025'
        },
        autumn: {
          title: 'Offre Automne - Préparez votre peau',
          description: 'Soins réparateurs pour affronter l\'automne',
          discount: 20,
          validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          code: 'AUTUMN2025'
        },
        winter: {
          title: 'Offre Hiver - Cocooning beauté',
          description: 'Chouchoutez-vous avec nos soins d\'hiver',
          discount: 30,
          validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          code: 'WINTER2025'
        }
      };

      for (const user of users) {
        await this.sendSpecialOffer((user._id as any).toString(), seasonalOffers[season]);
      }
    } catch (error) {
      logger.error(`Error sending seasonal campaign for ${season}:`, error);
    }
  }
}

// Export singleton instance
export const marketingEmailService = new MarketingEmailService();
