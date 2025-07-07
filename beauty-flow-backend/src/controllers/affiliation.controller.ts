import { Response } from 'express';
import { validationResult } from 'express-validator';
import { User } from '../models/User';
import { Commission } from '../models/Commission';
import { AuthRequest } from '../middleware/auth';
import { logger } from '../utils/logger';

// Obtenir les données d'affiliation
export const getAffiliationData = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.userId).select('affiliation');
    
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Si l'utilisateur n'a pas encore de données d'affiliation, initialiser
    if (!user.affiliation) {
      user.affiliation = {
        isAffiliate: false,
        affiliateCode: '',
        totalReferrals: 0,
        totalCommissions: 0,
        commissionRate: 0.20,
        stats: {
          clicksCount: 0,
          conversionsCount: 0,
          conversionRate: 0
        },
        isActive: false
      };
      await user.save();
    }

    res.json({ affiliation: user.affiliation });
  } catch (error) {
    logger.error('Get affiliation data error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Activer le programme d'affiliation
export const activateAffiliation = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.userId);
    
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Générer un code affilié unique
    const affiliateCode = user.generateAffiliateCode();
    
    // Vérifier l'unicité du code
    let codeExists = await User.findOne({ 'affiliation.affiliateCode': affiliateCode });
    let finalCode = affiliateCode;
    let counter = 1;
    
    while (codeExists) {
      finalCode = `${affiliateCode}${counter}`;
      codeExists = await User.findOne({ 'affiliation.affiliateCode': finalCode });
      counter++;
    }

    // Activer l'affiliation
    user.affiliation = {
      isAffiliate: true,
      affiliateCode: finalCode,
      totalReferrals: 0,
      totalCommissions: 0,
      commissionRate: 0.20, // 20% par défaut
      stats: {
        clicksCount: 0,
        conversionsCount: 0,
        conversionRate: 0
      },
      isActive: true,
      joinedAt: new Date()
    };

    await user.save();

    logger.info('Affiliation activated:', { userId: req.userId, affiliateCode: finalCode });
    res.json({ affiliation: user.affiliation });
  } catch (error) {
    logger.error('Activate affiliation error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Mettre à jour les paramètres d'affiliation
export const updateAffiliationSettings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { payoutMethod, payoutDetails } = req.body;
    
    const user = await User.findById(req.userId);
    if (!user || !user.affiliation?.isAffiliate) {
      res.status(404).json({ error: 'Affiliate account not found' });
      return;
    }

    // Mettre à jour les paramètres
    if (payoutMethod) user.affiliation.payoutMethod = payoutMethod;
    if (payoutDetails) user.affiliation.payoutDetails = payoutDetails;
    
    await user.save();

    res.json({ affiliation: user.affiliation });
  } catch (error) {
    logger.error('Update affiliation settings error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Obtenir les commissions
export const getCommissions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status, dateFrom, dateTo } = req.query;
    
    const query: any = { affiliateId: req.userId };
    
    if (status) {
      query.status = status;
    }
    
    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) query.createdAt.$gte = new Date(dateFrom as string);
      if (dateTo) query.createdAt.$lte = new Date(dateTo as string);
    }

    const commissions = await Commission.find(query)
      .populate('referredUserId', 'establishmentName email')
      .sort({ createdAt: -1 })
      .limit(100);

    // Formater les commissions pour le frontend
    const formattedCommissions = commissions.map(commission => ({
      id: commission._id,
      referredUserId: (commission.referredUserId as any)._id,
      referredUserName: (commission.referredUserId as any).establishmentName,
      amount: commission.amount,
      currency: commission.currency,
      status: commission.status,
      type: commission.type,
      commissionRate: commission.commissionRate,
      originalAmount: commission.originalAmount,
      paymentDate: commission.paymentDate,
      createdAt: commission.createdAt
    }));

    res.json({ commissions: formattedCommissions });
  } catch (error) {
    logger.error('Get commissions error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Obtenir le matériel marketing
export const getMarketingMaterials = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Pour l'instant, retourner des matériaux statiques
    const materials = [
      {
        id: 'banner-1',
        type: 'banner',
        name: 'Bannière horizontale 728x90',
        description: 'Parfaite pour les sites web et blogs',
        imageUrl: '/marketing/banner-728x90.jpg',
        dimensions: { width: 728, height: 90 }
      },
      {
        id: 'banner-2',
        type: 'banner',
        name: 'Bannière carrée 300x300',
        description: 'Idéale pour les réseaux sociaux',
        imageUrl: '/marketing/banner-300x300.jpg',
        dimensions: { width: 300, height: 300 }
      },
      {
        id: 'banner-3',
        type: 'banner',
        name: 'Bannière verticale 160x600',
        description: 'Pour les sidebars de sites web',
        imageUrl: '/marketing/banner-160x600.jpg',
        dimensions: { width: 160, height: 600 }
      }
    ];

    res.json({ materials });
  } catch (error) {
    logger.error('Get marketing materials error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Générer un lien d'affiliation
export const generateAffiliateLink = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { campaign } = req.body;
    
    const user = await User.findById(req.userId).select('affiliation');
    if (!user || !user.affiliation?.isAffiliate) {
      res.status(404).json({ error: 'Affiliate account not found' });
      return;
    }

    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const affiliateLink = `${baseUrl}/register?ref=${user.affiliation.affiliateCode}${campaign ? `&campaign=${campaign}` : ''}`;

    res.json({ 
      link: {
        url: affiliateLink,
        shortUrl: affiliateLink, // TODO: Implémenter un service de raccourcissement d'URL
        clicks: 0,
        conversions: 0,
        conversionRate: 0
      }
    });
  } catch (error) {
    logger.error('Generate affiliate link error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Tracker un clic sur un lien d'affiliation
export const trackClick = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { affiliateCode } = req.params;
    
    const user = await User.findOne({ 'affiliation.affiliateCode': affiliateCode });
    if (!user || !user.affiliation) {
      res.status(404).json({ error: 'Invalid affiliate code' });
      return;
    }

    // Incrémenter le compteur de clics
    user.affiliation.stats.clicksCount += 1;
    user.affiliation.stats.lastActivity = new Date();
    
    // Recalculer le taux de conversion
    if (user.affiliation.stats.clicksCount > 0) {
      user.affiliation.stats.conversionRate = 
        (user.affiliation.stats.conversionsCount / user.affiliation.stats.clicksCount) * 100;
    }

    await user.save();

    res.json({ success: true });
  } catch (error) {
    logger.error('Track click error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Demander un paiement
export const requestPayout = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { amount } = req.body;
    
    const user = await User.findById(req.userId).select('affiliation email establishmentName');
    if (!user || !user.affiliation?.isAffiliate) {
      res.status(404).json({ error: 'Affiliate account not found' });
      return;
    }

    // Vérifier le solde disponible
    const availableBalance = await Commission.aggregate([
      {
        $match: {
          affiliateId: user._id,
          status: 'APPROVED'
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);

    const totalAvailable = availableBalance[0]?.total || 0;

    if (amount > totalAvailable) {
      res.status(400).json({ error: 'Insufficient balance' });
      return;
    }

    // TODO: Créer une demande de paiement dans un nouveau modèle PayoutRequest
    logger.info('Payout requested:', { 
      userId: req.userId, 
      amount, 
      availableBalance: totalAvailable 
    });

    res.json({ 
      message: 'Payout request submitted successfully',
      requestedAmount: amount,
      availableBalance: totalAvailable
    });
  } catch (error) {
    logger.error('Request payout error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Obtenir les statistiques d'affiliation
export const getAffiliationStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.userId).select('affiliation');
    if (!user || !user.affiliation?.isAffiliate) {
      res.status(404).json({ error: 'Affiliate account not found' });
      return;
    }

    // Obtenir les statistiques mensuelles
    const monthlyStats = await Commission.aggregate([
      {
        $match: { affiliateId: user._id }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          revenue: { $sum: '$originalAmount' },
          commissions: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': -1, '_id.month': -1 }
      },
      {
        $limit: 12
      }
    ]);

    res.json({ 
      affiliation: user.affiliation,
      monthlyStats 
    });
  } catch (error) {
    logger.error('Get affiliation stats error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
