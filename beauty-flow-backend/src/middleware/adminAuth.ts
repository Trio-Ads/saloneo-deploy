import { Request, Response, NextFunction } from 'express';
import { User, UserRole } from '../models/User';
import { logger } from '../utils/logger';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: UserRole;
    isAdmin: boolean;
  };
}

/**
 * Middleware pour vérifier que l'utilisateur est un administrateur
 * Doit être utilisé après le middleware d'authentification standard
 */
export const adminAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Vérifier que l'utilisateur est authentifié
    if (!req.user || !req.user.id) {
      logger.warn('Admin access attempt without authentication');
      res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
      return;
    }

    // Récupérer l'utilisateur complet depuis la base de données
    const user = await User.findById(req.user.id).select('+role +isAdmin');

    if (!user) {
      logger.warn(`Admin access attempt with invalid user ID: ${req.user.id}`);
      res.status(401).json({
        success: false,
        error: 'User not found'
      });
      return;
    }

    // Vérifier que l'utilisateur est admin
    if (user.role !== UserRole.ADMIN && !user.isAdmin) {
      logger.warn(`Unauthorized admin access attempt by user: ${user.email} (${user.id})`);
      res.status(403).json({
        success: false,
        error: 'Admin access required. You do not have permission to access this resource.'
      });
      return;
    }

    // Logger l'accès admin pour audit
    logger.info(`Admin access granted to ${user.email} (${user.id}) for ${req.method} ${req.path}`);

    // Mettre à jour les informations utilisateur dans la requête
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      isAdmin: user.isAdmin
    };

    next();
  } catch (error) {
    logger.error('Error in admin authentication middleware:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error during admin authentication'
    });
  }
};

/**
 * Middleware optionnel pour logger toutes les actions admin
 * À utiliser après adminAuth pour un audit détaillé
 */
export const logAdminAction = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  const originalJson = res.json.bind(res);

  res.json = function (body: any) {
    // Logger l'action admin avec le résultat
    logger.info('Admin action completed', {
      admin: req.user?.email,
      adminId: req.user?.id,
      method: req.method,
      path: req.path,
      body: req.body,
      query: req.query,
      params: req.params,
      success: body.success !== false,
      timestamp: new Date().toISOString()
    });

    return originalJson(body);
  };

  next();
};
