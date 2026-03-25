import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { User, PlanType, SubscriptionDuration } from '../models/User';
import { Transaction, TransactionStatus } from '../models/Transaction';
import { PriceCalculator } from '../utils/priceCalculator';
import { logger } from '../utils/logger';

export const getCurrentSubscription = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ error: 'Non authentifié' });
      return;
    }

    const user = await User.findById(userId).select('subscription');
    if (!user) {
      res.status(404).json({ error: 'Utilisateur non trouvé' });
      return;
    }

    res.json({ subscription: user.subscription });
  } catch (error) {
    logger.error('Get current subscription error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getPlans = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    // These are the public plans exposed by the app
    const plans = Object.values(PlanType).map((planType) => {
      const durations = Object.values(SubscriptionDuration).map((duration) => {
        const displayPrice = PriceCalculator.getDisplayPrice(planType as any, duration as any);
        const requiresPayment = PriceCalculator.requiresPayment(planType as any);
        return {
          duration,
          displayPrice,
          requiresPayment,
          savings: PriceCalculator.calculateSavings(planType as any, duration as any),
        };
      });

      return {
        planType,
        requiresPayment: PriceCalculator.requiresPayment(planType as any),
        durations,
      };
    });

    res.json({ plans });
  } catch (error) {
    logger.error('Get plans error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const subscribe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ error: 'Non authentifié' });
      return;
    }

    const { planId, duration } = req.body as { planId: PlanType; duration?: SubscriptionDuration };

    if (!planId || !Object.values(PlanType).includes(planId)) {
      res.status(400).json({ error: 'Plan invalide' });
      return;
    }

    const subDuration = duration && Object.values(SubscriptionDuration).includes(duration)
      ? duration
      : SubscriptionDuration.MONTHLY;

    // Free plan: activate immediately
    if (planId === PlanType.FREE || !PriceCalculator.requiresPayment(planId as any)) {
      const startDate = new Date();
      await User.findByIdAndUpdate(userId, {
        'subscription.plan': planId,
        'subscription.duration': subDuration,
        'subscription.isActive': true,
        'subscription.startDate': startDate,
        'subscription.expiresAt': undefined,
      });

      res.json({ success: true, status: 'activated', plan: planId, duration: subDuration });
      return;
    }

    // Paid plan: frontend should initiate SATIM payment via /api/payment/satim/initiate
    res.status(402).json({
      success: false,
      status: 'payment_required',
      message: 'Paiement requis. Utilisez /api/payment/satim/initiate pour démarrer SATIM.',
      plan: planId,
      duration: subDuration,
    });
  } catch (error) {
    logger.error('Subscribe error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const cancel = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ error: 'Non authentifié' });
      return;
    }

    await User.findByIdAndUpdate(userId, {
      'subscription.autoRenew': false,
      'subscription.isActive': false,
    });

    res.json({ success: true, message: 'Subscription cancelled' });
  } catch (error) {
    logger.error('Cancel subscription error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getInvoices = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ error: 'Non authentifié' });
      return;
    }

    const transactions = await Transaction.find({
      userId,
      status: TransactionStatus.COMPLETED,
    })
      .sort({ createdAt: -1 })
      .select('_id planType duration displayAmount currency paymentMethod createdAt');

    const invoices = transactions.map((t) => ({
      id: t._id,
      invoiceNumber: `INV-${(t._id as any).toString().slice(-8).toUpperCase()}`,
      planType: t.planType,
      duration: t.duration,
      amount: t.displayAmount,
      currency: t.currency,
      paymentMethod: t.paymentMethod,
      createdAt: t.createdAt,
    }));

    res.json({ invoices });
  } catch (error) {
    logger.error('Get invoices error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
