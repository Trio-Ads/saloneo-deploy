import { Request, Response } from 'express';
import { User } from '../models/User';
import { Appointment } from '../models/Appointment';
import { Client } from '../models/Client';
import { Service } from '../models/Service';
import { cacheService } from '../services/cacheService';
import { logger } from '../utils/logger';

/**
 * Controller pour les statistiques publiques de la landing page
 * Ces endpoints sont publics (pas d'authentification requise)
 */

// Durée du cache : 1 heure (3600 secondes)
const CACHE_DURATION = 3600;

/**
 * GET /api/stats/public
 * Récupère toutes les statistiques publiques en une seule requête
 */
export const getPublicStats = async (req: Request, res: Response): Promise<void> => {
  try {
    // Vérifier le cache d'abord
    const cacheKey = 'public_stats';
    const cachedStats = await cacheService.get(cacheKey);
    
    if (cachedStats) {
      logger.info('Statistiques publiques servies depuis le cache');
      res.json({
        success: true,
        data: cachedStats,
        cached: true
      });
      return;
    }

    // Si pas de cache, calculer les statistiques
    const [salonsCount, appointmentsCount, clientsCount, servicesCount] = await Promise.all([
      User.countDocuments({ role: 'owner' }),
      Appointment.countDocuments({ status: 'completed' }),
      Client.countDocuments(),
      Service.countDocuments()
    ]);

    // Calculer les heures économisées (estimation : 2h par salon par semaine)
    const hoursSaved = Math.round(salonsCount * 2 * 52); // 52 semaines par an

    const stats = {
      salonsCount,
      appointmentsCount,
      clientsCount,
      servicesCount,
      hoursSaved,
      satisfactionRate: 98, // Taux de satisfaction fixe pour l'instant
      timestamp: new Date().toISOString()
    };

    // Mettre en cache pour 1 heure
    await cacheService.set(cacheKey, stats, { ttl: CACHE_DURATION });

    logger.info('Statistiques publiques calculées et mises en cache', { stats });

    res.json({
      success: true,
      data: stats,
      cached: false
    });
  } catch (error) {
    logger.error('Erreur lors de la récupération des statistiques publiques', { error });
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques'
    });
  }
};

/**
 * GET /api/stats/salons-count
 * Récupère uniquement le nombre de salons inscrits
 */
export const getSalonsCount = async (req: Request, res: Response): Promise<void> => {
  try {
    const cacheKey = 'salons_count';
    const cachedCount = await cacheService.get<number>(cacheKey);
    
    if (cachedCount !== null) {
      res.json({
        success: true,
        count: cachedCount,
        cached: true
      });
      return;
    }

    const count = await User.countDocuments({ role: 'owner' });
    
    await cacheService.set(cacheKey, count, { ttl: CACHE_DURATION });

    res.json({
      success: true,
      count,
      cached: false
    });
  } catch (error) {
    logger.error('Erreur lors de la récupération du nombre de salons', { error });
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du nombre de salons'
    });
  }
};

/**
 * GET /api/stats/appointments-count
 * Récupère uniquement le nombre de rendez-vous pris
 */
export const getAppointmentsCount = async (req: Request, res: Response): Promise<void> => {
  try {
    const cacheKey = 'appointments_count';
    const cachedCount = await cacheService.get<number>(cacheKey);
    
    if (cachedCount !== null) {
      res.json({
        success: true,
        count: cachedCount,
        cached: true
      });
      return;
    }

    const count = await Appointment.countDocuments({ status: 'completed' });
    
    await cacheService.set(cacheKey, count, { ttl: CACHE_DURATION });

    res.json({
      success: true,
      count,
      cached: false
    });
  } catch (error) {
    logger.error('Erreur lors de la récupération du nombre de rendez-vous', { error });
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du nombre de rendez-vous'
    });
  }
};

/**
 * GET /api/stats/clients-count
 * Récupère le nombre total de clients gérés
 */
export const getClientsCount = async (req: Request, res: Response): Promise<void> => {
  try {
    const cacheKey = 'clients_count';
    const cachedCount = await cacheService.get<number>(cacheKey);
    
    if (cachedCount !== null) {
      res.json({
        success: true,
        count: cachedCount,
        cached: true
      });
      return;
    }

    const count = await Client.countDocuments();
    
    await cacheService.set(cacheKey, count, { ttl: CACHE_DURATION });

    res.json({
      success: true,
      count,
      cached: false
    });
  } catch (error) {
    logger.error('Erreur lors de la récupération du nombre de clients', { error });
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du nombre de clients'
    });
  }
};

/**
 * POST /api/stats/invalidate-cache
 * Invalide le cache des statistiques (endpoint admin)
 * Note: Cet endpoint devrait être protégé par une authentification admin
 */
export const invalidateStatsCache = async (req: Request, res: Response): Promise<void> => {
  try {
    // TODO: Ajouter une vérification d'authentification admin ici
    
    const cacheKeys = [
      'public_stats',
      'salons_count',
      'appointments_count',
      'clients_count'
    ];

    // Invalider tous les caches de statistiques
    await cacheService.deleteMany(cacheKeys);

    logger.info('Cache des statistiques invalidé');

    res.json({
      success: true,
      message: 'Cache des statistiques invalidé avec succès'
    });
  } catch (error) {
    logger.error('Erreur lors de l\'invalidation du cache', { error });
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'invalidation du cache'
    });
  }
};
