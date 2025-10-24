import nodemailer from 'nodemailer';
import { promises as fs } from 'fs';
import path from 'path';
import handlebars from 'handlebars';
import { logger } from '../utils/logger';
import { 
  EmailOptions, 
  EmailConfig, 
  EmailTemplateData,
  EmailLog,
  EmailQueueJob 
} from '../types/email.types';
import { EmailTemplates } from './emailTemplates';
import { v4 as uuidv4 } from 'uuid';

// Email logs storage (in production, use database)
const emailLogs: EmailLog[] = [];
const emailQueue: EmailQueueJob[] = [];

class EmailService {
  private transporter!: nodemailer.Transporter;
  private templates: Map<string, handlebars.TemplateDelegate> = new Map();
  private config: EmailConfig;
  private isInitialized = false;

  constructor() {
    this.config = {
      host: process.env.SMTP_HOST || 'smtp.office365.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true' || false,
      auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || ''
      },
      from: process.env.SMTP_FROM || '"Saloneo" <donotreply@saloneo.app>',
      replyTo: process.env.SMTP_REPLY_TO || 'support@saloneo.app'
    };

    // Register Handlebars helpers
    this.registerHandlebarsHelpers();
  }

  private registerHandlebarsHelpers() {
    // Format date helper
    handlebars.registerHelper('formatDate', (date: string | Date) => {
      return new Date(date).toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    });

    // Format time helper
    handlebars.registerHelper('formatTime', (time: string) => {
      return time;
    });

    // Format currency helper
    handlebars.registerHelper('formatCurrency', (amount: number | string, currency = 'DZD') => {
      return `${amount} ${currency}`;
    });

    // Percentage helper
    handlebars.registerHelper('percentage', (used: number, limit: number) => {
      return Math.round((used / limit) * 100);
    });

    // If equals helper
    handlebars.registerHelper('ifEquals', function(this: any, arg1: any, arg2: any, options: any) {
      return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
    });
  }

  async initialize() {
    if (this.isInitialized) return;

    try {
      // Create transporter
      this.transporter = nodemailer.createTransport({
        host: this.config.host,
        port: this.config.port,
        secure: this.config.secure,
        auth: this.config.auth,
        tls: {
          rejectUnauthorized: false
        }
      });

      // Verify connection
      await this.transporter.verify();
      logger.info('Email service initialized successfully');

      // Load all templates
      await this.loadTemplates();

      // Start queue processor
      this.startQueueProcessor();

      this.isInitialized = true;
    } catch (error) {
      logger.error('Failed to initialize email service:', error);
      throw error;
    }
  }

  private async loadTemplates() {
    const templatesDir = path.join(__dirname, '../templates/emails');
    
    try {
      // Create templates directory if it doesn't exist
      await fs.mkdir(templatesDir, { recursive: true });

      // Load all template files
      const templateFiles = [
        // Appointments
        'appointment-confirmation',
        'appointment-reminder',
        'appointment-cancellation',
        'appointment-modification',
        // Subscriptions
        'subscription-welcome',
        'subscription-expiry-reminder',
        'subscription-expired',
        'subscription-limit-reached',
        'subscription-upgrade',
        'upgrade-suggestion',
        // Payments
        'payment-receipt',
        // Authentication
        'password-reset',
        'email-verification',
        'suspicious-login-alert',
        // Account
        'account-suspended',
        'account-reactivated',
        // Affiliation
        'affiliation-activation',
        'commission-earned',
        'commission-payout',
        'monthly-performance-report',
        // Marketing
        'newsletter',
        'monthly-newsletter',
        'special-offer',
        'birthday-wishes',
        'loyalty-program-welcome',
        'loyalty-program-update',
        'reward-earned',
        're-engagement',
        // Admin
        'admin-subscription-modification'
      ];

      for (const templateName of templateFiles) {
        try {
          const templatePath = path.join(templatesDir, `${templateName}.html`);
          const templateContent = await fs.readFile(templatePath, 'utf-8');
          const compiledTemplate = handlebars.compile(templateContent);
          this.templates.set(templateName, compiledTemplate);
        } catch (error) {
          logger.warn(`Template ${templateName} not found, using default`);
          // Use default template if file doesn't exist
          const defaultTemplate = this.getDefaultTemplate(templateName);
          const compiledTemplate = handlebars.compile(defaultTemplate);
          this.templates.set(templateName, compiledTemplate);
        }
      }
    } catch (error) {
      logger.error('Error loading email templates:', error);
    }
  }

  private getDefaultTemplate(templateName: string): string {
    // Return the complete HTML template based on template name
    return this.getTemplateContent(templateName);
  }

  private getTemplateContent(templateName: string): string {
    const templates: Record<string, string> = {
      'appointment-confirmation': EmailTemplates.getAppointmentConfirmationTemplate(),
      'appointment-reminder': EmailTemplates.getAppointmentReminderTemplate(),
      'appointment-cancellation': EmailTemplates.getAppointmentCancellationTemplate(),
      'appointment-modification': EmailTemplates.getAppointmentModificationTemplate(),
      'subscription-welcome': EmailTemplates.getSubscriptionWelcomeTemplate(),
      'subscription-expiry-reminder': EmailTemplates.getSubscriptionExpiryReminderTemplate(),
      'subscription-expired': EmailTemplates.getSubscriptionExpiredTemplate(),
      'subscription-limit-reached': EmailTemplates.getSubscriptionLimitReachedTemplate(),
      'subscription-upgrade': EmailTemplates.getSubscriptionUpgradeTemplate(),
      'upgrade-suggestion': EmailTemplates.getUpgradeSuggestionTemplate(),
      'payment-receipt': EmailTemplates.getPaymentReceiptTemplate(),
      'password-reset': EmailTemplates.getPasswordResetTemplate(),
      'email-verification': EmailTemplates.getEmailVerificationTemplate(),
      'suspicious-login-alert': EmailTemplates.getSuspiciousLoginAlertTemplate(),
      'account-suspended': EmailTemplates.getAccountSuspendedTemplate(),
      'account-reactivated': EmailTemplates.getAccountReactivatedTemplate(),
      'affiliation-activation': EmailTemplates.getAffiliationActivationTemplate(),
      'commission-earned': EmailTemplates.getCommissionEarnedTemplate(),
      'commission-payout': EmailTemplates.getCommissionPayoutTemplate(),
      'monthly-performance-report': EmailTemplates.getMonthlyPerformanceReportTemplate(),
      'newsletter': EmailTemplates.getNewsletterTemplate(),
      'monthly-newsletter': EmailTemplates.getMonthlyNewsletterTemplate(),
      'special-offer': EmailTemplates.getSpecialOfferTemplate(),
      'birthday-wishes': EmailTemplates.getBirthdayWishesTemplate(),
      'loyalty-program-welcome': EmailTemplates.getLoyaltyProgramWelcomeTemplate(),
      'loyalty-program-update': EmailTemplates.getLoyaltyProgramUpdateTemplate(),
      'reward-earned': EmailTemplates.getRewardEarnedTemplate(),
      're-engagement': EmailTemplates.getReEngagementTemplate(),
      'admin-subscription-modification': EmailTemplates.getAdminSubscriptionModificationTemplate()
    };

    return templates[templateName] || this.getGenericTemplate();
  }

  private getBaseStyles(): string {
    return `
      body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: #f4f4f4; }
      .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
      .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
      .header h1 { margin: 0; font-size: 28px; font-weight: 600; }
      .content { padding: 30px; background: white; }
      .content h2 { color: #667eea; margin-top: 0; }
      .footer { text-align: center; padding: 20px; background: #f9f9f9; color: #666; font-size: 12px; border-top: 1px solid #eee; }
      .button { display: inline-block; padding: 14px 32px; background: #667eea; color: white !important; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; transition: background 0.3s; }
      .button:hover { background: #5568d3; }
      .info-box { background: #f8f9ff; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #667eea; }
      .info-box p { margin: 8px 0; }
      .alert-box { background: #fff3cd; padding: 15px; margin: 20px 0; border-radius: 6px; border-left: 4px solid #ffc107; }
      .success-box { background: #d4edda; padding: 15px; margin: 20px 0; border-radius: 6px; border-left: 4px solid #28a745; }
      .warning-box { background: #f8d7da; padding: 15px; margin: 20px 0; border-radius: 6px; border-left: 4px solid #dc3545; }
      ul { padding-left: 20px; }
      ul li { margin: 8px 0; }
    `;
  }

  private getGenericTemplate(): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>${this.getBaseStyles()}</style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>{{salonName}}</h1>
    </div>
    <div class="content">
      <h2>Notification Saloneo</h2>
      <p>Bonjour {{userName}},</p>
      <p>Ceci est une notification de votre compte Saloneo.</p>
    </div>
    <div class="footer">
      <p>{{salonName}}</p>
      <p>{{salonAddress}}</p>
      <p>{{salonPhone}} | {{salonEmail}}</p>
      <p>&copy; {{currentYear}} Saloneo. Tous droits réservés.</p>
    </div>
  </div>
</body>
</html>`;
  }

  async sendEmail(options: EmailOptions): Promise<EmailLog> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const emailLog: EmailLog = {
      id: uuidv4(),
      to: options.to,
      subject: options.subject,
      status: 'pending',
      metadata: {}
    };

    try {
      const mailOptions = {
        from: this.config.from,
        to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
        replyTo: options.replyTo || this.config.replyTo,
        attachments: options.attachments,
        headers: options.headers
      };

      const info = await this.transporter.sendMail(mailOptions);
      
      emailLog.status = 'sent';
      emailLog.sentAt = new Date();
      emailLog.messageId = info.messageId;

      logger.info(`Email sent successfully to ${options.to}`, {
        messageId: info.messageId,
        subject: options.subject
      });

      // Store log
      emailLogs.push(emailLog);

      return emailLog;
    } catch (error) {
      emailLog.status = 'failed';
      emailLog.error = error instanceof Error ? error.message : 'Unknown error';
      
      logger.error('Failed to send email:', error);
      
      // Store log
      emailLogs.push(emailLog);

      throw error;
    }
  }

  async sendTemplateEmail(
    template: string, 
    to: string | string[], 
    data: EmailTemplateData,
    options?: Partial<EmailOptions>
  ): Promise<EmailLog> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const compiledTemplate = this.templates.get(template);
    if (!compiledTemplate) {
      throw new Error(`Template ${template} not found`);
    }

    // Add common data
    const templateData: EmailTemplateData = {
      ...data,
      currentYear: new Date().getFullYear(),
      template // Pass template name for conditional rendering
    };

    const html = compiledTemplate(templateData);
    const subject = this.getSubjectForTemplate(template, data);

    return this.sendEmail({
      to,
      subject,
      html,
      ...options
    });
  }

  private getSubjectForTemplate(template: string, data: EmailTemplateData): string {
    const subjects: Record<string, string> = {
      'appointment-confirmation': `Confirmation de rendez-vous - ${data.appointmentDate}`,
      'appointment-reminder': `Rappel: Rendez-vous ${data.appointmentDate} à ${data.appointmentTime}`,
      'appointment-cancellation': 'Annulation de votre rendez-vous',
      'subscription-welcome': `Bienvenue sur Saloneo - ${data.planName}`,
      'subscription-expiry-reminder': `⏰ Votre abonnement expire dans ${data.daysRemaining} jours`,
      'subscription-expired': 'Votre abonnement Saloneo a expiré',
      'subscription-limit-reached': '⚠️ Limite atteinte sur votre compte',
      'payment-receipt': `Reçu de paiement - ${data.amount} ${data.currency}`,
      'password-reset': 'Réinitialisation de votre mot de passe',
      'email-verification': 'Vérifiez votre adresse email',
      'commission-earned': `💰 Nouvelle commission: ${data.commissionAmount}`,
      'newsletter': data.promotionTitle || 'Newsletter Saloneo',
      'admin-subscription-modification': `🎁 Mise à jour de votre abonnement ${data.planName}`
    };

    return subjects[template] || 'Notification Saloneo';
  }

  // Queue management
  async addToQueue(job: Omit<EmailQueueJob, 'id' | 'attempts'>): Promise<void> {
    const queueJob: EmailQueueJob = {
      ...job,
      id: uuidv4(),
      attempts: 0,
      maxAttempts: job.maxAttempts || 3
    };

    emailQueue.push(queueJob);
    logger.info(`Email added to queue: ${queueJob.id}`);
  }

  private async startQueueProcessor() {
    setInterval(async () => {
      await this.processQueue();
    }, 60000); // Process every minute
  }

  private async processQueue() {
    const now = new Date();
    const jobsToProcess = emailQueue.filter(job => 
      !job.scheduledFor || job.scheduledFor <= now
    );

    for (const job of jobsToProcess) {
      try {
        await this.sendTemplateEmail(job.template, job.to, job.data);
        
        // Remove from queue
        const index = emailQueue.indexOf(job);
        if (index > -1) {
          emailQueue.splice(index, 1);
        }
      } catch (error) {
        job.attempts++;
        job.lastError = error instanceof Error ? error.message : 'Unknown error';

        if (job.attempts >= job.maxAttempts) {
          // Remove from queue after max attempts
          const index = emailQueue.indexOf(job);
          if (index > -1) {
            emailQueue.splice(index, 1);
          }
          logger.error(`Email job ${job.id} failed after ${job.attempts} attempts`);
        }
      }
    }
  }

  // Monitoring methods
  async getEmailLogs(filters?: {
    userId?: string;
    status?: string;
    from?: Date;
    to?: Date;
  }): Promise<EmailLog[]> {
    let logs = [...emailLogs];

    if (filters) {
      if (filters.userId) {
        logs = logs.filter(log => log.userId === filters.userId);
      }
      if (filters.status) {
        logs = logs.filter(log => log.status === filters.status);
      }
      if (filters.from) {
        logs = logs.filter(log => log.sentAt && log.sentAt >= filters.from!);
      }
      if (filters.to) {
        logs = logs.filter(log => log.sentAt && log.sentAt <= filters.to!);
      }
    }

    return logs.sort((a, b) => 
      (b.sentAt?.getTime() || 0) - (a.sentAt?.getTime() || 0)
    );
  }

  async getEmailStats(): Promise<{
    total: number;
    sent: number;
    failed: number;
    pending: number;
    bounced: number;
    queueSize: number;
  }> {
    const stats = {
      total: emailLogs.length,
      sent: emailLogs.filter(log => log.status === 'sent').length,
      failed: emailLogs.filter(log => log.status === 'failed').length,
      pending: emailLogs.filter(log => log.status === 'pending').length,
      bounced: emailLogs.filter(log => log.status === 'bounced').length,
      queueSize: emailQueue.length
    };

    return stats;
  }

  // Utility methods
  async testConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      return true;
    } catch (error) {
      logger.error('Email connection test failed:', error);
      return false;
    }
  }

  async sendTestEmail(to: string): Promise<void> {
    await this.sendEmail({
      to,
      subject: 'Test Email - Saloneo',
      html: `
        <h1>Test Email</h1>
        <p>This is a test email from Saloneo email service.</p>
        <p>If you received this email, the email service is working correctly.</p>
        <p>Configuration:</p>
        <ul>
          <li>SMTP Host: ${this.config.host}</li>
          <li>SMTP Port: ${this.config.port}</li>
          <li>From: ${this.config.from}</li>
        </ul>
      `
    });
  }
}

// Export singleton instance
export const emailService = new EmailService();

// Export types for convenience
export * from '../types/email.types';
