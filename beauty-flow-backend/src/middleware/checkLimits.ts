import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User';
import { Appointment } from '../models/Appointment';
import { Client } from '../models/Client';
import { Service } from '../models/Service';
import { TeamMember } from '../models/Team';

interface AuthRequest extends Request {
  user?: any;
}

// Définition des limites par plan
const PLAN_LIMITS = {
  FREE: {
    appointments: 20,
    clients: 10,
    services: 5,
    teamMembers: 1,
    stock: false,
    onlineBooking: true,
    customInterface: false
  },
  STARTER: {
    appointments: 60,
    clients: 200,
    services: 20,
    teamMembers: 5,
    stock: true,
    onlineBooking: true,
    customInterface: true
  },
  PRO: {
    appointments: 200,
    clients: 1000,
    services: 50,
    teamMembers: 10,
    stock: true,
    onlineBooking: true,
    customInterface: true
  },
  ENTERPRISE: {
    appointments: -1, // illimité
    clients: -1,
    services: -1,
    teamMembers: -1,
    stock: true,
    onlineBooking: true,
    customInterface: true
  }
};

// Middleware pour vérifier les limites d'abonnement
export const checkSubscriptionLimit = (resourceType: 'appointments' | 'clients' | 'services' | 'teamMembers') => {
  return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Récupérer l'utilisateur avec ses informations d'abonnement
      const user = await User.findById(req.user.id);
      if (!user) {
        res.status(404).json({ error: 'Utilisateur non trouvé' });
        return;
      }

      const currentPlan = user.subscription?.plan || 'FREE';
      const limits = PLAN_LIMITS[currentPlan as keyof typeof PLAN_LIMITS];
      
      if (!limits) {
        res.status(400).json({ error: 'Plan d\'abonnement invalide' });
        return;
      }

      const limit = limits[resourceType];
      
      // Si limite illimitée (-1), on continue
      if (limit === -1) {
        next();
        return;
      }

      // Compter les ressources actuelles
      let currentCount = 0;
      
      switch (resourceType) {
        case 'appointments':
          currentCount = await Appointment.countDocuments({ 
            userId: req.user.id,
            status: { $ne: 'cancelled' }
          });
          break;
          
        case 'clients':
          currentCount = await Client.countDocuments({ 
            userId: req.user.id,
            isActive: true
          });
          break;
          
        case 'services':
          currentCount = await Service.countDocuments({ 
            userId: req.user.id,
            isActive: true
          });
          break;
          
        case 'teamMembers':
          currentCount = await TeamMember.countDocuments({ 
            userId: req.user.id,
            isActive: true
          });
          break;
      }

      // Vérifier si la limite est atteinte
      if (currentCount >= limit) {
        res.status(403).json({
          error: 'Limite atteinte',
          message: `Vous avez atteint la limite de ${limit} ${resourceType} pour votre plan ${currentPlan}.`,
          currentCount,
          limit,
          plan: currentPlan,
          upgradeRequired: true
        });
        return;
      }

      // Ajouter les informations de limite à la requête
      req.limitInfo = {
        currentCount,
        limit,
        remaining: limit - currentCount,
        plan: currentPlan
      };

      next();
    } catch (error) {
      console.error('Erreur lors de la vérification des limites:', error);
      res.status(500).json({ error: 'Erreur lors de la vérification des limites' });
    }
  };
};

// Middleware pour vérifier l'accès aux fonctionnalités
export const checkFeatureAccess = (feature: 'stock' | 'onlineBooking' | 'customInterface') => {
  return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = await User.findById(req.user.id);
      if (!user) {
        res.status(404).json({ error: 'Utilisateur non trouvé' });
        return;
      }

      const currentPlan = user.subscription?.plan || 'FREE';
      const limits = PLAN_LIMITS[currentPlan as keyof typeof PLAN_LIMITS];
      
      if (!limits) {
        res.status(400).json({ error: 'Plan d\'abonnement invalide' });
        return;
      }

      if (!limits[feature]) {
        res.status(403).json({
          error: 'Fonctionnalité non disponible',
          message: `La fonctionnalité "${feature}" n'est pas disponible dans votre plan ${currentPlan}.`,
          plan: currentPlan,
          upgradeRequired: true
        });
        return;
      }

      next();
    } catch (error) {
      console.error('Erreur lors de la vérification d\'accès:', error);
      res.status(500).json({ error: 'Erreur lors de la vérification d\'accès' });
    }
  };
};

// Middleware pour obtenir les statistiques d'utilisation
export const getUsageStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      res.status(404).json({ error: 'Utilisateur non trouvé' });
      return;
    }

    const currentPlan = user.subscription?.plan || 'FREE';
    const limits = PLAN_LIMITS[currentPlan as keyof typeof PLAN_LIMITS];

    const [appointmentsCount, clientsCount, servicesCount, teamMembersCount] = await Promise.all([
      Appointment.countDocuments({ userId: req.user.id, status: { $ne: 'cancelled' } }),
      Client.countDocuments({ userId: req.user.id, isActive: true }),
      Service.countDocuments({ userId: req.user.id, isActive: true }),
      TeamMember.countDocuments({ userId: req.user.id, isActive: true })
    ]);

    const usage = {
      plan: currentPlan,
      limits: limits,
      usage: {
        appointments: {
          current: appointmentsCount,
          limit: limits.appointments,
          remaining: limits.appointments === -1 ? -1 : Math.max(0, limits.appointments - appointmentsCount),
          percentage: limits.appointments === -1 ? 0 : (appointmentsCount / limits.appointments) * 100
        },
        clients: {
          current: clientsCount,
          limit: limits.clients,
          remaining: limits.clients === -1 ? -1 : Math.max(0, limits.clients - clientsCount),
          percentage: limits.clients === -1 ? 0 : (clientsCount / limits.clients) * 100
        },
        services: {
          current: servicesCount,
          limit: limits.services,
          remaining: limits.services === -1 ? -1 : Math.max(0, limits.services - servicesCount),
          percentage: limits.services === -1 ? 0 : (servicesCount / limits.services) * 100
        },
        teamMembers: {
          current: teamMembersCount,
          limit: limits.teamMembers,
          remaining: limits.teamMembers === -1 ? -1 : Math.max(0, limits.teamMembers - teamMembersCount),
          percentage: limits.teamMembers === -1 ? 0 : (teamMembersCount / limits.teamMembers) * 100
        }
      },
      features: {
        stock: limits.stock,
        onlineBooking: limits.onlineBooking,
        customInterface: limits.customInterface
      }
    };

    res.json(usage);
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des statistiques' });
  }
};

// Types pour TypeScript
declare global {
  namespace Express {
    interface Request {
      limitInfo?: {
        currentCount: number;
        limit: number;
        remaining: number;
        plan: string;
      };
    }
  }
}
