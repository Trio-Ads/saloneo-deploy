import express from 'express';
import {
  getPublicStats,
  getSalonsCount,
  getAppointmentsCount,
  getClientsCount,
  invalidateStatsCache
} from '../controllers/stats.controller';

const router = express.Router();

/**
 * Routes publiques pour les statistiques de la landing page
 * Pas d'authentification requise
 * Cache Redis utilisé pour optimiser les performances
 */

// GET /api/stats/public - Toutes les statistiques en une seule requête
router.get('/public', getPublicStats);

// GET /api/stats/salons-count - Nombre de salons inscrits
router.get('/salons-count', getSalonsCount);

// GET /api/stats/appointments-count - Nombre de rendez-vous pris
router.get('/appointments-count', getAppointmentsCount);

// GET /api/stats/clients-count - Nombre de clients gérés
router.get('/clients-count', getClientsCount);

// POST /api/stats/invalidate-cache - Invalider le cache (admin uniquement)
// TODO: Ajouter middleware d'authentification admin
router.post('/invalidate-cache', invalidateStatsCache);

export default router;
