import { emailService } from './emailService';
import { logger } from '../utils/logger';
import { User, IUser } from '../models/User';
import { Client } from '../models/Client';
import { Appointment } from '../models/Appointment';
import { Service } from '../models/Service';
import { EmailTemplateData } from '../types/email.types';
import * as cron from 'node-cron';

class SubscriptionEmailService {
  constructor() {
    // Initialize cron jobs
    this.initializeCronJobs();
  }

  private initializeCronJobs() {
    // Check expiring subscriptions daily at 9:00 AM
    cron.schedule('0 9 * * *', async () => {
      logger.info('Running subscription expiry check...');
      await this.checkExpiringSubscriptions();
    });

    // Check usage limits every hour
    cron.schedule('0 * * * *', async () => {
      logger.info('Running usage limits check...');
      await this.checkUsageLimits();
    });

    // Send appointment reminders
    // J-1 reminder at 9:00 AM
    cron.schedule('0 9 * * *', async () => {
      logger.info('Sending J-1 appointment reminders...');
      await this.sendAppointmentReminders24h();
    });

    // H-2 reminder every 30 minutes
    cron.schedule('*/30 * * * *', async () => {
      logger.info('Sending H-2 appointment reminders...');
      await this.sendAppointmentReminders2h();
    });

    logger.info('Subscription email cron jobs initialized');
  }

  // Subscription expiry checks
  async checkExpiringSubscriptions() {
    try {
      const now = new Date();
      
      // Check for subscriptions expiring in 7, 3, and 1 days
      const checkDays = [7, 3, 1];
      
      for (const days of checkDays) {
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + days);
        expiryDate.setHours(0, 0, 0, 0);
        
        const endDate = new Date(expiryDate);
        endDate.setHours(23, 59, 59, 999);

        const users = await User.find({
          'subscription.isActive': true,
          'subscription.expiresAt': {
            $gte: expiryDate,
            $lte: endDate
          },
          [`subscription.notifications.expiry${days}d`]: { $ne: true }
        });

        for (const user of users) {
          await this.sendExpiryReminder(user, days);
          
          // Mark as sent
          await User.updateOne(
            { _id: user._id },
            { [`subscription.notifications.expiry${days}d`]: true }
          );
        }
      }

      // Check for expired subscriptions
      const expiredUsers = await User.find({
        'subscription.isActive': true,
        'subscription.expiresAt': { $lt: now },
        'subscription.notifications.expired': { $ne: true }
      });

      for (const user of expiredUsers) {
        await this.sendExpiredNotification(user);
        
        // Mark subscription as inactive
        await User.updateOne(
          { _id: user._id },
          { 
            'subscription.isActive': false,
            'subscription.notifications.expired': true
          }
        );
      }
    } catch (error) {
      logger.error('Error checking expiring subscriptions:', error);
    }
  }

  // Usage limits check
  async checkUsageLimits() {
    try {
      const users = await User.find({
        'subscription.isActive': true
      });

      for (const user of users) {
        const usage = await this.calculateUsage((user._id as any).toString());
        const limits = this.getSubscriptionLimits(user.subscription.plan);

        // Check each limit
        const checks = [
          { type: 'appointments', used: usage.appointments, limit: limits.appointments },
          { type: 'clients', used: usage.clients, limit: limits.clients },
          { type: 'services', used: usage.services, limit: limits.services }
        ];

        for (const check of checks) {
          const percentage = (check.used / check.limit) * 100;
          
          // Send alert at 80% and 100%
          const notificationKey80 = `${check.type}80` as keyof typeof user.subscription.notifications;
          const notificationKey100 = `${check.type}100` as keyof typeof user.subscription.notifications;
          
          if (percentage >= 100 && !user.subscription.notifications?.[notificationKey100]) {
            await this.sendLimitReachedEmail(user, check.type, check.used, check.limit);
            await User.updateOne(
              { _id: user._id },
              { [`subscription.notifications.${check.type}100`]: true }
            );
          } else if (percentage >= 80 && percentage < 100 && !user.subscription.notifications?.[notificationKey80]) {
            await this.sendLimitWarningEmail(user, check.type, check.used, check.limit);
            await User.updateOne(
              { _id: user._id },
              { [`subscription.notifications.${check.type}80`]: true }
            );
          }
        }
      }
    } catch (error) {
      logger.error('Error checking usage limits:', error);
    }
  }

  // Calculate current usage
  private async calculateUsage(userId: string) {
    const [appointments, clients, services] = await Promise.all([
      Appointment.countDocuments({ userId, isActive: true }),
      Client.countDocuments({ userId, isActive: true }),
      Service.countDocuments({ userId, isActive: true })
    ]);

    return { appointments, clients, services };
  }

  // Send expiry reminder
  private async sendExpiryReminder(user: IUser, daysRemaining: number) {
    try {
      const templateData: EmailTemplateData = {
        userName: `${user.firstName} ${user.lastName}`,
        salonName: user.establishmentName,
        salonAddress: user.address,
        salonPhone: user.phone,
        salonEmail: user.email,
        planName: this.getPlanDisplayName(user.subscription.plan),
        expiryDate: (user.subscription.expiresAt || new Date()).toISOString(),
        daysRemaining
      };

      await emailService.sendTemplateEmail(
        'subscription-expiry-reminder',
        user.email,
        templateData
      );

      logger.info(`Sent ${daysRemaining}-day expiry reminder to ${user.email}`);
    } catch (error) {
      logger.error(`Error sending expiry reminder to ${user.email}:`, error);
    }
  }

  // Send expired notification
  private async sendExpiredNotification(user: IUser) {
    try {
      const templateData: EmailTemplateData = {
        userName: `${user.firstName} ${user.lastName}`,
        salonName: user.establishmentName,
        salonAddress: user.address,
        salonPhone: user.phone,
        salonEmail: user.email,
        planName: this.getPlanDisplayName(user.subscription.plan)
      };

      await emailService.sendTemplateEmail(
        'subscription-expired',
        user.email,
        templateData
      );

      logger.info(`Sent expiry notification to ${user.email}`);
    } catch (error) {
      logger.error(`Error sending expiry notification to ${user.email}:`, error);
    }
  }

  // Send limit warning/reached emails
  private async sendLimitReachedEmail(user: IUser, limitType: string, _used: number, _limit: number) {
    try {
      const usage = await this.calculateUsage((user._id as any).toString());
      const limits = this.getSubscriptionLimits(user.subscription.plan);
      
      const templateData: EmailTemplateData = {
        userName: `${user.firstName} ${user.lastName}`,
        salonName: user.establishmentName,
        salonAddress: user.address,
        salonPhone: user.phone,
        salonEmail: user.email,
        planName: this.getPlanDisplayName(user.subscription.plan),
        currentUsage: {
          appointments: { used: usage.appointments, limit: limits.appointments },
          clients: { used: usage.clients, limit: limits.clients },
          services: { used: usage.services, limit: limits.services }
        }
      };

      await emailService.sendTemplateEmail(
        'subscription-limit-reached',
        user.email,
        templateData
      );

      logger.info(`Sent limit reached email to ${user.email} for ${limitType}`);
    } catch (error) {
      logger.error(`Error sending limit reached email to ${user.email}:`, error);
    }
  }

  private async sendLimitWarningEmail(user: IUser, limitType: string, used: number, limit: number) {
    // Use same template as limit reached but with different data
    await this.sendLimitReachedEmail(user, limitType, used, limit);
  }

  // Appointment reminders
  async sendAppointmentReminders24h() {
    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      
      const endOfTomorrow = new Date(tomorrow);
      endOfTomorrow.setHours(23, 59, 59, 999);

      const appointments = await Appointment.find({
        date: {
          $gte: tomorrow,
          $lte: endOfTomorrow
        },
        status: 'confirmed',
        'reminders.j1Sent': { $ne: true }
      })
      .populate('clientId')
      .populate('serviceId')
      .populate('stylistId')
      .populate('userId');

      for (const appointment of appointments) {
        const client = appointment.clientId as any;
        if (client?.email) {
          await this.sendAppointmentReminder(appointment, '24h');
          
          // Mark as sent
          await Appointment.updateOne(
            { _id: appointment._id },
            { 'reminders.j1Sent': true }
          );
        }
      }
    } catch (error) {
      logger.error('Error sending 24h reminders:', error);
    }
  }

  async sendAppointmentReminders2h() {
    try {
      const twoHoursLater = new Date();
      twoHoursLater.setHours(twoHoursLater.getHours() + 2);
      
      const twoHoursThirtyLater = new Date();
      twoHoursThirtyLater.setHours(twoHoursThirtyLater.getHours() + 2);
      twoHoursThirtyLater.setMinutes(twoHoursThirtyLater.getMinutes() + 30);

      const appointments = await Appointment.find({
        date: {
          $gte: twoHoursLater,
          $lte: twoHoursThirtyLater
        },
        status: 'confirmed',
        'reminders.h2Sent': { $ne: true }
      })
      .populate('clientId')
      .populate('serviceId')
      .populate('stylistId')
      .populate('userId');

      for (const appointment of appointments) {
        const client = appointment.clientId as any;
        if (client?.email) {
          await this.sendAppointmentReminder(appointment, '2h');
          
          // Mark as sent
          await Appointment.updateOne(
            { _id: appointment._id },
            { 'reminders.h2Sent': true }
          );
        }
      }
    } catch (error) {
      logger.error('Error sending 2h reminders:', error);
    }
  }

  private async sendAppointmentReminder(appointment: any, type: '24h' | '2h') {
    try {
      const client = appointment.clientId;
      const service = appointment.serviceId;
      const user = appointment.userId;
      const teamMember = appointment.stylistId;

      const templateData: EmailTemplateData = {
        clientName: `${client.firstName} ${client.lastName}`,
        salonName: user.establishmentName,
        salonAddress: user.address,
        salonPhone: user.phone,
        salonEmail: user.email,
        appointmentDate: appointment.date.toISOString(),
        appointmentTime: appointment.startTime,
        serviceName: service.name,
        servicePrice: service.price,
        serviceDuration: service.duration,
        staffName: teamMember ? 
          `${teamMember.firstName} ${teamMember.lastName}` : 
          `${user.firstName} ${user.lastName}`,
        appointmentId: (appointment._id as any).toString()
      };

      await emailService.sendTemplateEmail(
        'appointment-reminder',
        client.email,
        templateData
      );

      logger.info(`Sent ${type} reminder for appointment ${appointment._id}`);
    } catch (error) {
      logger.error(`Error sending appointment reminder:`, error);
    }
  }

  // Send appointment confirmation
  async sendAppointmentConfirmation(appointmentId: string) {
    try {
      const appointment = await Appointment.findById(appointmentId)
        .populate('clientId')
        .populate('serviceId')
        .populate('stylistId')
        .populate('userId');

      const client = appointment?.clientId as any;
      if (!appointment || !client?.email) {
        return;
      }

      const service = appointment.serviceId as any;
      const user = appointment.userId as any;
      const teamMember = appointment.stylistId as any;

      const templateData: EmailTemplateData = {
        clientName: `${client.firstName} ${client.lastName}`,
        salonName: user.establishmentName,
        salonAddress: user.address,
        salonPhone: user.phone,
        salonEmail: user.email,
        appointmentDate: appointment.date.toISOString(),
        appointmentTime: appointment.startTime,
        serviceName: service.name,
        servicePrice: service.price,
        serviceDuration: service.duration,
        staffName: teamMember ? 
          `${teamMember.firstName} ${teamMember.lastName}` : 
          `${user.firstName} ${user.lastName}`,
        appointmentId: (appointment._id as any).toString()
      };

      await emailService.sendTemplateEmail(
        'appointment-confirmation',
        client.email,
        templateData
      );

      logger.info(`Sent appointment confirmation for ${appointment._id}`);
    } catch (error) {
      logger.error('Error sending appointment confirmation:', error);
    }
  }

  // Send welcome email
  async sendWelcomeEmail(userId: string) {
    try {
      logger.info(`Attempting to send welcome email for user ID: ${userId}`);
      
      const user = await User.findById(userId);
      if (!user) {
        logger.error(`User not found with ID: ${userId}`);
        throw new Error(`User not found with ID: ${userId}`);
      }

      logger.info(`Found user: ${user.email} - ${user.firstName} ${user.lastName}`);

      const templateData: EmailTemplateData = {
        userName: `${user.firstName} ${user.lastName}`,
        salonName: user.establishmentName,
        salonAddress: user.address,
        salonPhone: user.phone,
        salonEmail: user.email,
        planName: this.getPlanDisplayName(user.subscription.plan),
        planDuration: this.getPlanDuration(user.subscription.duration)
      };

      logger.info('Sending email with template data:', templateData);

      await emailService.sendTemplateEmail(
        'subscription-welcome',
        user.email,
        templateData
      );

      logger.info(`✅ Successfully sent welcome email to ${user.email}`);
    } catch (error) {
      logger.error('❌ Error sending welcome email:', error);
      throw error; // Re-throw to see the error in the test script
    }
  }

  // Send payment receipt
  async sendPaymentReceipt(transactionId: string) {
    try {
      const { Transaction } = await import('../models/Transaction');
      const transaction = await Transaction.findById(transactionId)
        .populate('userId');

      if (!transaction || !transaction.userId) return;

      const user = transaction.userId as any;
      const templateData: EmailTemplateData = {
        userName: `${user.firstName} ${user.lastName}`,
        salonName: user.establishmentName,
        salonAddress: user.address,
        salonPhone: user.phone,
        salonEmail: user.email,
        amount: transaction.amount.toString(),
        currency: transaction.currency,
        transactionId: (transaction._id as any).toString(),
        planName: this.getPlanDisplayName((transaction as any).plan || user.subscription.plan),
        planDuration: this.getPlanDuration((transaction as any).duration || user.subscription.duration),
        invoiceNumber: `INV-${(transaction._id as any).toString().slice(-8).toUpperCase()}`
      };

      await emailService.sendTemplateEmail(
        'payment-receipt',
        user.email,
        templateData
      );

      logger.info(`Sent payment receipt for transaction ${transactionId}`);
    } catch (error) {
      logger.error('Error sending payment receipt:', error);
    }
  }

  // Additional email methods for complete functionality

  // Send appointment modification email
  async sendAppointmentModification(appointmentId: string, oldDate: Date, oldTime: string) {
    try {
      const appointment = await Appointment.findById(appointmentId)
        .populate('clientId')
        .populate('serviceId')
        .populate('stylistId')
        .populate('userId');

      const client = appointment?.clientId as any;
      if (!appointment || !client?.email) {
        return;
      }

      const service = appointment.serviceId as any;
      const user = appointment.userId as any;
      const teamMember = appointment.stylistId as any;

      const templateData: EmailTemplateData = {
        clientName: `${client.firstName} ${client.lastName}`,
        salonName: user.establishmentName,
        salonAddress: user.address,
        salonPhone: user.phone,
        salonEmail: user.email,
        appointmentDate: appointment.date.toISOString(),
        appointmentTime: appointment.startTime,
        oldAppointmentDate: oldDate.toISOString(),
        oldAppointmentTime: oldTime,
        serviceName: service.name,
        servicePrice: service.price,
        serviceDuration: service.duration,
        staffName: teamMember ? 
          `${teamMember.firstName} ${teamMember.lastName}` : 
          `${user.firstName} ${user.lastName}`,
        appointmentId: (appointment._id as any).toString()
      };

      await emailService.sendTemplateEmail(
        'appointment-modification',
        client.email,
        templateData
      );

      logger.info(`Sent appointment modification email for ${appointmentId}`);
    } catch (error) {
      logger.error('Error sending appointment modification:', error);
    }
  }

  // Send appointment cancellation email
  async sendAppointmentCancellation(appointmentId: string) {
    try {
      const appointment = await Appointment.findById(appointmentId)
        .populate('clientId')
        .populate('serviceId')
        .populate('stylistId')
        .populate('userId');

      const client = appointment?.clientId as any;
      if (!appointment || !client?.email) {
        return;
      }

      const service = appointment.serviceId as any;
      const user = appointment.userId as any;

      const templateData: EmailTemplateData = {
        clientName: `${client.firstName} ${client.lastName}`,
        salonName: user.establishmentName,
        salonAddress: user.address,
        salonPhone: user.phone,
        salonEmail: user.email,
        appointmentDate: appointment.date.toISOString(),
        appointmentTime: appointment.startTime,
        serviceName: service.name,
        appointmentId: (appointment._id as any).toString()
      };

      await emailService.sendTemplateEmail(
        'appointment-cancellation',
        client.email,
        templateData
      );

      logger.info(`Sent appointment cancellation email for ${appointmentId}`);
    } catch (error) {
      logger.error('Error sending appointment cancellation:', error);
    }
  }

  // Send subscription upgrade email
  async sendSubscriptionUpgrade(userId: string, oldPlan: string, newPlan: string) {
    try {
      const user = await User.findById(userId);
      if (!user) return;

      const templateData: EmailTemplateData = {
        userName: `${user.firstName} ${user.lastName}`,
        salonName: user.establishmentName,
        salonAddress: user.address,
        salonPhone: user.phone,
        salonEmail: user.email,
        oldPlanName: this.getPlanDisplayName(oldPlan),
        planName: this.getPlanDisplayName(newPlan),
        planDuration: this.getPlanDuration(user.subscription.duration)
      };

      await emailService.sendTemplateEmail(
        'subscription-upgrade',
        user.email,
        templateData
      );

      logger.info(`Sent subscription upgrade email to ${user.email}`);
    } catch (error) {
      logger.error('Error sending subscription upgrade email:', error);
    }
  }

  // Send admin subscription modification email
  async sendAdminSubscriptionModification(userId: string, changes: {
    plan?: string;
    duration?: string;
    expiresAt?: Date;
    isActive?: boolean;
  }) {
    try {
      const user = await User.findById(userId);
      if (!user) return;

      const templateData: EmailTemplateData = {
        userName: `${user.firstName} ${user.lastName}`,
        salonName: user.establishmentName,
        salonAddress: user.address,
        salonPhone: user.phone,
        salonEmail: user.email,
        planName: this.getPlanDisplayName(changes.plan || user.subscription.plan),
        planDuration: this.getPlanDuration(changes.duration || user.subscription.duration),
        expiryDate: (changes.expiresAt || user.subscription.expiresAt || new Date()).toISOString(),
        isActive: changes.isActive !== undefined ? changes.isActive : user.subscription.isActive
      };

      await emailService.sendTemplateEmail(
        'admin-subscription-modification',
        user.email,
        templateData
      );

      logger.info(`Sent admin subscription modification email to ${user.email}`);
    } catch (error) {
      logger.error('Error sending admin subscription modification email:', error);
    }
  }

  // Send account suspended email
  async sendAccountSuspended(userId: string, reason: string = 'payment_failed') {
    try {
      const user = await User.findById(userId);
      if (!user) return;

      const templateData: EmailTemplateData = {
        userName: `${user.firstName} ${user.lastName}`,
        salonName: user.establishmentName,
        salonAddress: user.address,
        salonPhone: user.phone,
        salonEmail: user.email,
        suspensionReason: reason
      };

      await emailService.sendTemplateEmail(
        'account-suspended',
        user.email,
        templateData
      );

      logger.info(`Sent account suspended email to ${user.email}`);
    } catch (error) {
      logger.error('Error sending account suspended email:', error);
    }
  }

  // Send account reactivated email
  async sendAccountReactivated(userId: string) {
    try {
      const user = await User.findById(userId);
      if (!user) return;

      const templateData: EmailTemplateData = {
        userName: `${user.firstName} ${user.lastName}`,
        salonName: user.establishmentName,
        salonAddress: user.address,
        salonPhone: user.phone,
        salonEmail: user.email,
        planName: this.getPlanDisplayName(user.subscription.plan)
      };

      await emailService.sendTemplateEmail(
        'account-reactivated',
        user.email,
        templateData
      );

      logger.info(`Sent account reactivated email to ${user.email}`);
    } catch (error) {
      logger.error('Error sending account reactivated email:', error);
    }
  }

  // Send email verification
  async sendEmailVerification(userId: string, verificationToken: string) {
    try {
      const user = await User.findById(userId);
      if (!user) return;

      const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;

      const templateData: EmailTemplateData = {
        userName: `${user.firstName} ${user.lastName}`,
        salonName: user.establishmentName,
        verificationUrl
      };

      await emailService.sendTemplateEmail(
        'email-verification',
        user.email,
        templateData
      );

      logger.info(`Sent email verification to ${user.email}`);
    } catch (error) {
      logger.error('Error sending email verification:', error);
    }
  }

  // Send password reset email
  async sendPasswordReset(userId: string, resetToken: string) {
    try {
      const user = await User.findById(userId);
      if (!user) return;

      const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

      const templateData: EmailTemplateData = {
        userName: `${user.firstName} ${user.lastName}`,
        resetUrl,
        expiryTime: '1 heure'
      };

      await emailService.sendTemplateEmail(
        'password-reset',
        user.email,
        templateData
      );

      logger.info(`Sent password reset email to ${user.email}`);
    } catch (error) {
      logger.error('Error sending password reset email:', error);
    }
  }

  // Send suspicious login alert
  async sendSuspiciousLoginAlert(userId: string, loginInfo: {
    ip: string;
    userAgent: string;
    location?: string;
    timestamp: Date;
  }) {
    try {
      const user = await User.findById(userId);
      if (!user) return;

      const templateData: EmailTemplateData = {
        userName: `${user.firstName} ${user.lastName}`,
        salonName: user.establishmentName,
        loginIp: loginInfo.ip,
        loginDevice: loginInfo.userAgent,
        loginLocation: loginInfo.location || 'Localisation inconnue',
        loginTime: loginInfo.timestamp.toISOString()
      };

      await emailService.sendTemplateEmail(
        'suspicious-login-alert',
        user.email,
        templateData
      );

      logger.info(`Sent suspicious login alert to ${user.email}`);
    } catch (error) {
      logger.error('Error sending suspicious login alert:', error);
    }
  }

  // Send affiliation activation email
  async sendAffiliationActivation(userId: string) {
    try {
      const user = await User.findById(userId);
      if (!user) return;

      const templateData: EmailTemplateData = {
        userName: `${user.firstName} ${user.lastName}`,
        salonName: user.establishmentName,
        salonAddress: user.address,
        salonPhone: user.phone,
        salonEmail: user.email,
        affiliationCode: user.affiliation?.affiliateCode || '',
        commissionRate: '20%'
      };

      await emailService.sendTemplateEmail(
        'affiliation-activation',
        user.email,
        templateData
      );

      logger.info(`Sent affiliation activation email to ${user.email}`);
    } catch (error) {
      logger.error('Error sending affiliation activation email:', error);
    }
  }

  // Send commission earned email
  async sendCommissionEarned(userId: string, amount: number, referralName: string) {
    try {
      const user = await User.findById(userId);
      if (!user) return;

      const templateData: EmailTemplateData = {
        userName: `${user.firstName} ${user.lastName}`,
        salonName: user.establishmentName,
        commissionAmount: amount.toString(),
        referralName,
        currency: 'DZD'
      };

      await emailService.sendTemplateEmail(
        'commission-earned',
        user.email,
        templateData
      );

      logger.info(`Sent commission earned email to ${user.email}`);
    } catch (error) {
      logger.error('Error sending commission earned email:', error);
    }
  }

  // Send commission payout email
  async sendCommissionPayout(userId: string, amount: number, payoutMethod: string) {
    try {
      const user = await User.findById(userId);
      if (!user) return;

      const templateData: EmailTemplateData = {
        userName: `${user.firstName} ${user.lastName}`,
        salonName: user.establishmentName,
        payoutAmount: amount.toString(),
        payoutMethod,
        currency: 'DZD'
      };

      await emailService.sendTemplateEmail(
        'commission-payout',
        user.email,
        templateData
      );

      logger.info(`Sent commission payout email to ${user.email}`);
    } catch (error) {
      logger.error('Error sending commission payout email:', error);
    }
  }

  // Send monthly performance report
  async sendMonthlyPerformanceReport(userId: string, month: string, stats: any) {
    try {
      const user = await User.findById(userId);
      if (!user) return;

      const templateData: EmailTemplateData = {
        userName: `${user.firstName} ${user.lastName}`,
        salonName: user.establishmentName,
        month,
        totalReferrals: stats.totalReferrals,
        totalCommissions: stats.totalCommissions,
        conversionRate: stats.conversionRate,
        topPlan: stats.topPlan
      };

      await emailService.sendTemplateEmail(
        'monthly-performance-report',
        user.email,
        templateData
      );

      logger.info(`Sent monthly performance report to ${user.email}`);
    } catch (error) {
      logger.error('Error sending monthly performance report:', error);
    }
  }

  // Helper methods
  private getPlanDisplayName(plan: string): string {
    const plans: Record<string, string> = {
      'FREE': 'Gratuit',
      'STARTER': 'Starter',
      'PRO': 'Professionnel',
      'ENTERPRISE': 'Entreprise'
    };
    return plans[plan] || plan;
  }

  private getPlanDuration(duration: string): string {
    const durations: Record<string, string> = {
      'MONTHLY': '1 mois',
      'YEARLY': '1 an',
      'BIENNIAL': '2 ans',
      'TRIENNIAL': '3 ans'
    };
    return durations[duration] || duration;
  }

  // Get subscription limits based on plan
  private getSubscriptionLimits(plan: string) {
    const limits: Record<string, { appointments: number; clients: number; services: number }> = {
      'FREE': { appointments: 10, clients: 20, services: 5 },
      'STARTER': { appointments: 100, clients: 200, services: 20 },
      'PRO': { appointments: 500, clients: 1000, services: 50 },
      'ENTERPRISE': { appointments: -1, clients: -1, services: -1 } // -1 means unlimited
    };
    return limits[plan] || limits['FREE'];
  }

  // Reset notifications (for testing or when upgrading)
  async resetNotifications(userId: string) {
    await User.updateOne(
      { _id: userId },
      { 
        'subscription.notifications': {
          expiry7d: false,
          expiry3d: false,
          expiry1d: false,
          expired: false,
          appointments80: false,
          appointments100: false,
          clients80: false,
          clients100: false,
          services80: false,
          services100: false
        }
      }
    );
  }

  // Check if should send upgrade suggestion
  async checkUpgradeSuggestion() {
    try {
      const users = await User.find({
        'subscription.isActive': true,
        'subscription.plan': { $ne: 'enterprise' }
      });

      for (const user of users) {
        const usage = await this.calculateUsage((user._id as any).toString());
        const limits = this.getSubscriptionLimits(user.subscription.plan);
        
        // Check if user is consistently hitting limits
        const appointmentsUsage = (usage.appointments / limits.appointments) * 100;
        const clientsUsage = (usage.clients / limits.clients) * 100;
        const servicesUsage = (usage.services / limits.services) * 100;

        if (appointmentsUsage >= 90 || clientsUsage >= 90 || servicesUsage >= 90) {
          await this.sendUpgradeSuggestion(user);
        }
      }
    } catch (error) {
      logger.error('Error checking upgrade suggestions:', error);
    }
  }

  // Send upgrade suggestion email
  private async sendUpgradeSuggestion(user: IUser) {
    try {
      const usage = await this.calculateUsage((user._id as any).toString());
      const limits = this.getSubscriptionLimits(user.subscription.plan);
      const nextPlan = this.getNextPlan(user.subscription.plan);

      const templateData: EmailTemplateData = {
        userName: `${user.firstName} ${user.lastName}`,
        salonName: user.establishmentName,
        salonAddress: user.address,
        salonPhone: user.phone,
        salonEmail: user.email,
        currentPlan: this.getPlanDisplayName(user.subscription.plan),
        suggestedPlan: this.getPlanDisplayName(nextPlan),
        currentUsage: {
          appointments: { used: usage.appointments, limit: limits.appointments },
          clients: { used: usage.clients, limit: limits.clients },
          services: { used: usage.services, limit: limits.services }
        }
      };

      await emailService.sendTemplateEmail(
        'upgrade-suggestion',
        user.email,
        templateData
      );

      logger.info(`Sent upgrade suggestion to ${user.email}`);
    } catch (error) {
      logger.error(`Error sending upgrade suggestion to ${user.email}:`, error);
    }
  }

  // Get next plan suggestion
  private getNextPlan(currentPlan: string): string {
    const planHierarchy: Record<string, string> = {
      'FREE': 'STARTER',
      'STARTER': 'PRO',
      'PRO': 'ENTERPRISE',
      'ENTERPRISE': 'ENTERPRISE'
    };
    return planHierarchy[currentPlan] || 'PRO';
  }
}

// Export singleton instance
export const subscriptionEmailService = new SubscriptionEmailService();
