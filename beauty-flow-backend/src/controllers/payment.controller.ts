import { Request, Response } from 'express';
import { Types } from 'mongoose';
import { satimPaymentService } from '../services/satimPayment.service';
import { Transaction, TransactionStatus, PaymentMethod } from '../models/Transaction';
import { User } from '../models/User';
import { PlanType, PriceCalculator, SubscriptionDuration } from '../utils/priceCalculator';
import { logger } from '../utils/logger';

interface AuthRequest extends Request {
  userId?: string;
  user?: any;
}

export class PaymentController {
  /**
   * Initie un paiement SATIM pour un abonnement
   */
  static async initiateSatimPayment(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { planType, duration = SubscriptionDuration.MONTHLY } = req.body;
      const userId = req.userId;

      if (!userId) {
        res.status(401).json({ error: 'Non authentifié' });
        return;
      }

      // Valider le type de plan
      if (!Object.values(PlanType).includes(planType)) {
        res.status(400).json({ error: 'Type de plan invalide' });
        return;
      }

      // Vérifier si le plan nécessite un paiement
      if (!PriceCalculator.requiresPayment(planType)) {
        res.status(400).json({ 
          error: `Le plan ${planType} ne nécessite pas de paiement` 
        });
        return;
      }

      // Vérifier si SATIM est configuré
      if (!satimPaymentService.isConfigured()) {
        logger.error('SATIM service not configured');
        res.status(503).json({ 
          error: 'Service de paiement temporairement indisponible' 
        });
        return;
      }

      // Obtenir les détails du prix
      const environment = satimPaymentService.getEnvironment();
      const priceDetails = PriceCalculator.getPriceDetails(planType, duration, environment);

      if (!priceDetails.satimAmount) {
        res.status(400).json({ error: 'Impossible de déterminer le montant' });
        return;
      }

      // Créer une transaction
      const transaction = new Transaction({
        userId: new Types.ObjectId(userId),
        planType,
        duration,
        amount: priceDetails.satimAmount,
        displayAmount: priceDetails.displayPrice,
        currency: 'DZD',
        paymentMethod: PaymentMethod.SATIM,
        status: TransactionStatus.PENDING,
        environment,
        metadata: {
          ip: req.ip,
          userAgent: req.get('user-agent'),
          referrer: req.get('referrer')
        }
      });

      await transaction.save();

      // Générer les URLs de retour
      const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const { returnUrl, failUrl } = satimPaymentService.generateReturnUrls(
        baseUrl,
        (transaction._id as any).toString()
      );

      // Enregistrer la commande auprès de SATIM
      const satimResult = await satimPaymentService.registerOrder(
        userId,
        planType,
        returnUrl,
        failUrl,
        duration
      );

      // Mettre à jour la transaction avec les infos SATIM
      transaction.satim = {
        orderId: satimResult.orderId,
        orderNumber: satimResult.orderNumber,
        formUrl: satimResult.formUrl
      };
      transaction.status = TransactionStatus.PROCESSING;
      await transaction.save();

      logger.info('Payment initiated', {
        userId,
        planType,
        transactionId: transaction._id,
        orderId: satimResult.orderId
      });

      // Retourner les informations pour redirection
      res.json({
        success: true,
        transactionId: transaction._id,
        formUrl: satimResult.formUrl,
        amount: priceDetails.displayPrice,
        amountFormatted: priceDetails.displayPriceFormatted,
        isTestMode: priceDetails.isTestMode,
        testAmount: priceDetails.isTestMode ? priceDetails.satimAmountFormatted : null
      });

    } catch (error) {
      logger.error('Failed to initiate payment', error);
      res.status(500).json({ 
        error: 'Erreur lors de l\'initialisation du paiement' 
      });
    }
  }

  /**
   * Gère le retour après paiement réussi
   */
  static async handlePaymentReturn(req: Request, res: Response): Promise<void> {
    try {
      const { transactionId } = req.query;

      if (!transactionId) {
        res.redirect('/subscription?error=missing_transaction');
        return;
      }

      // Récupérer la transaction
      const transaction = await Transaction.findById(transactionId);
      if (!transaction) {
        res.redirect('/subscription?error=transaction_not_found');
        return;
      }

      // Vérifier le statut auprès de SATIM
      if (transaction.satim?.orderId) {
        const confirmResult = await satimPaymentService.confirmOrder(
          transaction.satim.orderId
        );

        if (confirmResult.success) {
          // Paiement réussi
          await transaction.markAsCompleted({
            actionCode: confirmResult.details?.actionCode,
            actionCodeDescription: confirmResult.details?.actionCodeDescription,
            approvalCode: confirmResult.details?.approvalCode,
            pan: confirmResult.details?.pan,
            cardholderName: confirmResult.details?.cardholderName,
            rawResponse: confirmResult.details
          });

          // Calculer la date d'expiration en fonction de la durée
          const startDate = new Date();
          const expiresAt = PriceCalculator.calculateEndDate(startDate, transaction.duration);

          // Mettre à jour l'abonnement de l'utilisateur
          await User.findByIdAndUpdate(transaction.userId, {
            'subscription.plan': transaction.planType,
            'subscription.duration': transaction.duration,
            'subscription.isActive': true,
            'subscription.startDate': startDate,
            'subscription.expiresAt': expiresAt,
            'subscription.lastPaymentDate': new Date(),
            'subscription.lastTransactionId': transaction._id
          });

          logger.info('Payment completed successfully', {
            transactionId: transaction._id,
            userId: transaction.userId,
            planType: transaction.planType,
            amount: transaction.displayAmount
          });

          // Rediriger vers la page de succès avec les informations de transaction
          res.redirect(`/subscription?success=true&plan=${transaction.planType}&transaction_id=${transaction._id}&amount=${transaction.displayAmount}&payment_method=CIB&card_last4=${confirmResult.details?.pan ? confirmResult.details.pan.slice(-4) : '****'}`);
        } else {
          // Paiement échoué
          await transaction.markAsFailed({
            code: confirmResult.details?.errorCode,
            message: confirmResult.details?.errorMessage
          });

          res.redirect('/subscription?error=payment_failed');
        }
      } else {
        res.redirect('/subscription?error=invalid_transaction');
      }

    } catch (error) {
      logger.error('Failed to handle payment return', error);
      res.redirect('/subscription?error=processing_error');
    }
  }

  /**
   * Gère le retour après échec de paiement
   */
  static async handlePaymentFail(req: Request, res: Response): Promise<void> {
    try {
      const { transactionId } = req.query;

      if (transactionId) {
        const transaction = await Transaction.findById(transactionId);
        if (transaction) {
          await transaction.markAsFailed({
            message: 'Paiement annulé par l\'utilisateur'
          });
        }
      }

      res.redirect('/subscription?error=payment_cancelled');

    } catch (error) {
      logger.error('Failed to handle payment failure', error);
      res.redirect('/subscription?error=processing_error');
    }
  }

  /**
   * Vérifie le statut d'une transaction
   */
  static async checkTransactionStatus(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { transactionId } = req.params;
      const userId = req.userId;

      if (!userId) {
        res.status(401).json({ error: 'Non authentifié' });
        return;
      }

      const transaction = await Transaction.findOne({
        _id: transactionId,
        userId: new Types.ObjectId(userId)
      });

      if (!transaction) {
        res.status(404).json({ error: 'Transaction non trouvée' });
        return;
      }

      res.json({
        transactionId: transaction._id,
        status: transaction.status,
        planType: transaction.planType,
        amount: transaction.displayAmount,
        createdAt: transaction.createdAt,
        completedAt: transaction.completedAt,
        environment: transaction.environment
      });

    } catch (error) {
      logger.error('Failed to check transaction status', error);
      res.status(500).json({ error: 'Erreur lors de la vérification' });
    }
  }

  /**
   * Récupère l'historique des transactions d'un utilisateur
   */
  static async getTransactionHistory(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId;
      const { status, limit = 50, skip = 0 } = req.query;

      if (!userId) {
        res.status(401).json({ error: 'Non authentifié' });
        return;
      }

      const transactions = await Transaction.find({
        userId: new Types.ObjectId(userId),
        ...(status && { status })
      })
        .sort({ createdAt: -1 })
        .limit(Number(limit))
        .skip(Number(skip))
        .select('-satim.rawResponse'); // Exclure les données sensibles

      const total = await Transaction.countDocuments({
        userId: new Types.ObjectId(userId),
        ...(status && { status })
      });

      res.json({
        transactions: transactions.map(t => ({
          id: t._id,
          planType: t.planType,
          amount: t.displayAmount,
          status: t.status,
          paymentMethod: t.paymentMethod,
          environment: t.environment,
          createdAt: t.createdAt,
          completedAt: t.completedAt,
          canRefund: t.canBeRefunded()
        })),
        total,
        limit: Number(limit),
        skip: Number(skip)
      });

    } catch (error) {
      logger.error('Failed to get transaction history', error);
      res.status(500).json({ error: 'Erreur lors de la récupération' });
    }
  }

  /**
   * Initie un remboursement (admin only)
   */
  static async initiateRefund(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { transactionId } = req.params;
      const { reason } = req.body;
      const adminUserId = req.userId;

      // TODO: Vérifier les permissions admin

      const transaction = await Transaction.findById(transactionId);
      if (!transaction) {
        res.status(404).json({ error: 'Transaction non trouvée' });
        return;
      }

      if (!transaction.canBeRefunded()) {
        res.status(400).json({ 
          error: 'Cette transaction ne peut pas être remboursée' 
        });
        return;
      }

      if (!transaction.satim?.orderId) {
        res.status(400).json({ 
          error: 'Informations de paiement manquantes' 
        });
        return;
      }

      // Effectuer le remboursement via SATIM
      const refundSuccess = await satimPaymentService.refundOrder(
        transaction.satim.orderId,
        transaction.amount
      );

      if (refundSuccess) {
        await transaction.markAsRefunded({
          amount: transaction.amount,
          reason,
          refundedBy: new Types.ObjectId(adminUserId!)
        });

        // TODO: Mettre à jour l'abonnement de l'utilisateur si nécessaire

        logger.info('Refund completed', {
          transactionId: transaction._id,
          userId: transaction.userId,
          amount: transaction.amount,
          adminUserId
        });

        res.json({
          success: true,
          message: 'Remboursement effectué avec succès'
        });
      } else {
        res.status(400).json({
          error: 'Le remboursement a échoué'
        });
      }

    } catch (error) {
      logger.error('Failed to initiate refund', error);
      res.status(500).json({ error: 'Erreur lors du remboursement' });
    }
  }
}
