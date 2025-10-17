import { Router, Request, Response } from 'express';
import { monitoringService, metricsMiddleware } from '../services/monitoringService';
import { logger } from '../utils/logger';

const router = Router();

/**
 * @route   GET /api/monitoring/metrics
 * @desc    Get Prometheus metrics
 * @access  Public (should be restricted in production)
 */
router.get('/metrics', async (req: Request, res: Response) => {
  try {
    const metrics = await monitoringService.getMetrics();
    res.set('Content-Type', 'text/plain');
    res.send(metrics);
  } catch (error) {
    logger.error('Failed to get metrics:', error);
    res.status(500).json({ error: 'Failed to get metrics' });
  }
});

/**
 * @route   GET /api/monitoring/health
 * @desc    Health check endpoint
 * @access  Public
 */
router.get('/health', async (req: Request, res: Response) => {
  try {
    const health = await monitoringService.getHealthCheckData();
    const statusCode = health.status === 'healthy' ? 200 : 
                      health.status === 'degraded' ? 503 : 500;
    
    res.status(statusCode).json(health);
  } catch (error) {
    logger.error('Health check failed:', error);
    res.status(500).json({
      status: 'unhealthy',
      error: 'Health check failed',
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * @route   GET /api/monitoring/health/live
 * @desc    Liveness probe for Kubernetes
 * @access  Public
 */
router.get('/health/live', (req: Request, res: Response) => {
  res.status(200).json({ status: 'alive' });
});

/**
 * @route   GET /api/monitoring/health/ready
 * @desc    Readiness probe for Kubernetes
 * @access  Public
 */
router.get('/health/ready', async (req: Request, res: Response) => {
  try {
    const health = await monitoringService.getHealthCheckData();
    if (health.status === 'healthy') {
      res.status(200).json({ status: 'ready' });
    } else {
      res.status(503).json({ status: 'not ready', health });
    }
  } catch (error) {
    res.status(503).json({ status: 'not ready', error: 'Health check failed' });
  }
});

/**
 * @route   GET /api/monitoring/circuit-breakers
 * @desc    Get circuit breaker status
 * @access  Private (Admin only in production)
 */
router.get('/circuit-breakers', (req: Request, res: Response) => {
  try {
    const metrics = monitoringService.getCircuitBreakerMetrics();
    res.json(metrics);
  } catch (error) {
    logger.error('Failed to get circuit breaker metrics:', error);
    res.status(500).json({ error: 'Failed to get circuit breaker metrics' });
  }
});

export default router;
