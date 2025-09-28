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
// Remove unused import
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
      host: process.env.SMTP_HOST || 'smtpout.secureserver.net',
      port: parseInt(process.env.SMTP_PORT || '465'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || ''
      },
      from: process.env.EMAIL_FROM || '"Saloneo" <donotreply@saloneo.app>',
      replyTo: process.env.EMAIL_REPLY_TO || 'support@saloneo.app'
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
        'appointment-confirmation',
        'appointment-reminder',
        'appointment-cancellation',
        'subscription-welcome',
        'subscription-expiry-reminder',
        'subscription-expired',
        'subscription-limit-reached',
        'payment-receipt',
        'password-reset',
        'email-verification',
        'commission-earned',
        'newsletter'
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
    const baseTemplate = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #8B5CF6; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background: #f9f9f9; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
    .button { display: inline-block; padding: 12px 24px; background: #8B5CF6; color: white; text-decoration: none; border-radius: 5px; }
    .info-box { background: white; padding: 15px; margin: 10px 0; border-radius: 5px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>{{salonName}}</h1>
    </div>
    <div class="content">
      {{#if (ifEquals template 'appointment-confirmation')}}
        <h2>Confirmation de votre rendez-vous</h2>
        <p>Bonjour {{clientName}},</p>
        <p>Votre rendez-vous a été confirmé avec succès.</p>
        <div class="info-box">
          <p><strong>Service:</strong> {{serviceName}}</p>
          <p><strong>Date:</strong> {{formatDate appointmentDate}}</p>
          <p><strong>Heure:</strong> {{appointmentTime}}</p>
          <p><strong>Avec:</strong> {{staffName}}</p>
          <p><strong>Prix:</strong> {{formatCurrency servicePrice}}</p>
        </div>
      {{/if}}

      {{#if (ifEquals template 'subscription-expiry-reminder')}}
        <h2>Votre abonnement expire bientôt</h2>
        <p>Bonjour {{userName}},</p>
        <p>Votre abonnement {{planName}} expire dans {{daysRemaining}} jours.</p>
        <p>Date d'expiration: {{formatDate expiryDate}}</p>
        <p style="text-align: center; margin: 30px 0;">
          <a href="{{salonEmail}}/subscription" class="button">Renouveler maintenant</a>
        </p>
      {{/if}}

      {{#if (ifEquals template 'subscription-limit-reached')}}
        <h2>Limite atteinte</h2>
        <p>Bonjour {{userName}},</p>
        <p>Vous avez atteint votre limite pour l'une de vos fonctionnalités :</p>
        <div class="info-box">
          {{#if currentUsage.appointments}}
            <p><strong>Rendez-vous:</strong> {{currentUsage.appointments.used}}/{{currentUsage.appointments.limit}} ({{percentage currentUsage.appointments.used currentUsage.appointments.limit}}%)</p>
          {{/if}}
          {{#if currentUsage.clients}}
            <p><strong>Clients:</strong> {{currentUsage.clients.used}}/{{currentUsage.clients.limit}} ({{percentage currentUsage.clients.used currentUsage.clients.limit}}%)</p>
          {{/if}}
          {{#if currentUsage.services}}
            <p><strong>Services:</strong> {{currentUsage.services.used}}/{{currentUsage.services.limit}} ({{percentage currentUsage.services.used currentUsage.services.limit}}%)</p>
          {{/if}}
        </div>
        <p style="text-align: center; margin: 30px 0;">
          <a href="{{salonEmail}}/subscription" class="button">Augmenter mes limites</a>
        </p>
      {{/if}}

      {{#if (ifEquals template 'payment-receipt')}}
        <h2>Reçu de paiement</h2>
        <p>Bonjour {{userName}},</p>
        <p>Nous confirmons la réception de votre paiement.</p>
        <div class="info-box">
          <p><strong>Montant:</strong> {{formatCurrency amount currency}}</p>
          <p><strong>Transaction:</strong> {{transactionId}}</p>
          <p><strong>Plan:</strong> {{planName}}</p>
          <p><strong>Durée:</strong> {{planDuration}}</p>
        </div>
      {{/if}}
    </div>
    <div class="footer">
      <p>{{salonName}} - {{salonAddress}}</p>
      <p>{{salonPhone}} | {{salonEmail}}</p>
      <p>&copy; {{currentYear}} Saloneo. Tous droits réservés.</p>
      <p><a href="{{salonEmail}}/unsubscribe">Se désinscrire</a></p>
    </div>
  </div>
</body>
</html>`;

    return baseTemplate.replace('{{template}}', templateName);
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
      'newsletter': data.promotionTitle || 'Newsletter Saloneo'
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
