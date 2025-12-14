import { Request, Response } from 'express';
import { emailService } from '../services/emailService';
import { logger } from '../utils/logger';
import { User } from '../models/User';

export class FeedbackController {
  /**
   * Send feedback request email to a specific user
   */
  async sendFeedbackToUser(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;

      // Get user from database
      const user = await User.findById(userId, 'email establishmentName _id');
      
      if (!user) {
        res.status(404).json({
          success: false,
          message: 'Utilisateur non trouvé'
        });
        return;
      }

      const feedbackSubmitUrl = `https://saloneo.app/api/feedback/submit`;

      try {
        await emailService.sendTemplateEmail(
          'user-feedback-request',
          user.email,
          {
            userName: user.establishmentName || 'Utilisateur',
            userId: (user._id as any).toString(),
            userEmail: user.email,
            establishmentName: user.establishmentName || '',
            feedbackSubmitUrl,
            salonName: 'Saloneo',
            salonAddress: '',
            salonPhone: '',
            salonEmail: process.env.SMTP_FROM || 'donotreply@saloneo.app'
          }
        );

        logger.info(`Feedback email sent to user ${user.email} (${userId})`);

        res.json({
          success: true,
          message: `Email de feedback envoyé avec succès à ${user.establishmentName}`,
          data: {
            userEmail: user.email,
            establishmentName: user.establishmentName
          }
        });

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
        logger.error(`Failed to send feedback email to ${user.email}:`, error);
        
        res.status(500).json({
          success: false,
          message: `Erreur lors de l'envoi de l'email à ${user.establishmentName}`,
          error: errorMessage
        });
      }

    } catch (error) {
      logger.error('Error sending feedback email:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de l\'envoi de l\'email de feedback',
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      });
    }
  }

  /**
   * Handle feedback submission from users
   */
  async submitFeedback(req: Request, res: Response): Promise<void> {
    try {
      logger.info('Feedback submission received:', { body: req.body, headers: req.headers });
      
      const { userId, userEmail, establishmentName, satisfaction, missing_features, issues } = req.body;

      // Validate required fields
      if (!userId || !userEmail || !satisfaction) {
        logger.error('Missing required fields:', { userId, userEmail, satisfaction });
        res.status(400).json({
          success: false,
          message: 'Données manquantes: userId, userEmail et satisfaction sont requis'
        });
        return;
      }

      // Prepare feedback content for admin email
      const feedbackContent = `
        <h2>Nouveau feedback utilisateur reçu</h2>
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Informations utilisateur:</h3>
          <p><strong>ID:</strong> ${userId}</p>
          <p><strong>Email:</strong> ${userEmail}</p>
          <p><strong>Établissement:</strong> ${establishmentName || 'Non spécifié'}</p>
        </div>
        
        <div style="background: #fff5f0; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #FF6B35;">
          <h3>Satisfaction générale:</h3>
          <p>${satisfaction}</p>
        </div>
        
        ${missing_features ? `
        <div style="background: #f0f8ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #007bff;">
          <h3>Fonctionnalités souhaitées:</h3>
          <p>${missing_features}</p>
        </div>
        ` : ''}
        
        ${issues ? `
        <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
          <h3>Problèmes rencontrés:</h3>
          <p>${issues}</p>
        </div>
        ` : ''}
        
        <p style="margin-top: 30px; font-size: 14px; color: #666;">
          Feedback reçu le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}
        </p>
      `;

      // Send feedback to admin email
      await emailService.sendEmail({
        to: process.env.SMTP_FROM || 'donotreply@saloneo.app',
        subject: `Nouveau feedback utilisateur - ${establishmentName || userEmail}`,
        html: feedbackContent
      });

      logger.info(`Feedback received from user ${userEmail} (${userId})`);

      // Return success response to user - redirect to thank you page
      res.redirect('/api/feedback/thank-you');

    } catch (error) {
      logger.error('Error processing feedback submission:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de l\'envoi de votre feedback. Veuillez réessayer.'
      });
    }
  }

  /**
   * Get feedback statistics for admin
   */
  async getFeedbackStats(req: Request, res: Response) {
    try {
      const emailStats = await emailService.getEmailStats();
      
      res.json({
        success: true,
        data: {
          emailStats,
          lastFeedbackCampaign: {
            // This could be enhanced to track actual campaign data
            date: new Date().toISOString(),
            status: 'completed'
          }
        }
      });

    } catch (error) {
      logger.error('Error getting feedback stats:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des statistiques'
      });
    }
  }
}

export const feedbackController = new FeedbackController();
