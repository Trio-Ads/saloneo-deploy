import { register, collectDefaultMetrics, Counter, Histogram, Gauge, Summary } from 'prom-client';
import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { circuitBreakerService } from './circuitBreakerService';
import { cacheService } from './cacheService';
import { queueService, QueueName } from './queueService';
import mongoose from 'mongoose';
import os from 'os';

// Collect default metrics
collectDefaultMetrics({ register });

// Custom metrics
const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10],
});

const httpRequestTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
});

const activeUsers = new Gauge({
  name: 'active_users',
  help: 'Number of active users',
});

const subscriptionMetrics = new Gauge({
  name: 'subscription_metrics',
  help: 'Subscription metrics by plan',
  labelNames: ['plan', 'status'],
});

const appointmentMetrics = new Counter({
  name: 'appointments_total',
  help: 'Total number of appointments',
  labelNames: ['status', 'service_type'],
});

const paymentMetrics = new Counter({
  name: 'payments_total',
  help: 'Total number of payments',
  labelNames: ['status', 'payment_method', 'plan'],
});

const cacheMetrics = new Counter({
  name: 'cache_operations_total',
  help: 'Total number of cache operations',
  labelNames: ['operation', 'result'],
});

const queueMetrics = new Gauge({
  name: 'queue_jobs',
  help: 'Number of jobs in queues',
  labelNames: ['queue', 'status'],
});

const dbConnectionMetrics = new Gauge({
  name: 'mongodb_connections',
  help: 'MongoDB connection metrics',
  labelNames: ['state'],
});

const errorRate = new Counter({
  name: 'application_errors_total',
  help: 'Total number of application errors',
  labelNames: ['type', 'severity'],
});

const apiLatency = new Summary({
  name: 'api_endpoint_latency',
  help: 'API endpoint latency',
  labelNames: ['endpoint', 'method'],
  percentiles: [0.5, 0.9, 0.95, 0.99],
});

// Business metrics
const revenueMetrics = new Gauge({
  name: 'revenue_total',
  help: 'Total revenue',
  labelNames: ['currency', 'period'],
});

const salonMetrics = new Gauge({
  name: 'salons_total',
  help: 'Total number of salons',
  labelNames: ['plan', 'status'],
});

// System metrics
const systemMetrics = new Gauge({
  name: 'system_metrics',
  help: 'System resource metrics',
  labelNames: ['metric'],
});

class MonitoringService {
  private metricsInterval?: NodeJS.Timeout;

  constructor() {
    // Register all metrics
    register.registerMetric(httpRequestDuration);
    register.registerMetric(httpRequestTotal);
    register.registerMetric(activeUsers);
    register.registerMetric(subscriptionMetrics);
    register.registerMetric(appointmentMetrics);
    register.registerMetric(paymentMetrics);
    register.registerMetric(cacheMetrics);
    register.registerMetric(queueMetrics);
    register.registerMetric(dbConnectionMetrics);
    register.registerMetric(errorRate);
    register.registerMetric(apiLatency);
    register.registerMetric(revenueMetrics);
    register.registerMetric(salonMetrics);
    register.registerMetric(systemMetrics);

    // Start collecting system metrics
    this.startSystemMetricsCollection();
  }

  /**
   * Express middleware for HTTP metrics
   */
  httpMetricsMiddleware() {
    return (req: Request, res: Response, next: NextFunction) => {
      const start = Date.now();
      
      res.on('finish', () => {
        const duration = (Date.now() - start) / 1000;
        const route = req.route?.path || req.path;
        const labels = {
          method: req.method,
          route: route,
          status_code: res.statusCode.toString(),
        };

        httpRequestDuration.observe(labels, duration);
        httpRequestTotal.inc(labels);
        apiLatency.observe({ endpoint: route, method: req.method }, duration);
      });

      next();
    };
  }

  /**
   * Track active users
   */
  trackActiveUser(userId: string, action: 'login' | 'logout'): void {
    if (action === 'login') {
      activeUsers.inc();
    } else {
      activeUsers.dec();
    }
  }

  /**
   * Track subscription metrics
   */
  async updateSubscriptionMetrics(): Promise<void> {
    try {
      const User = mongoose.model('User');
      const subscriptions = await User.aggregate([
        {
          $group: {
            _id: {
              plan: '$subscription.plan',
              status: '$subscription.status',
            },
            count: { $sum: 1 },
          },
        },
      ]);

      subscriptions.forEach((sub) => {
        subscriptionMetrics.set(
          { plan: sub._id.plan || 'none', status: sub._id.status || 'inactive' },
          sub.count
        );
      });
    } catch (error) {
      logger.error('Failed to update subscription metrics:', error);
    }
  }

  /**
   * Track appointment
   */
  trackAppointment(status: string, serviceType: string): void {
    appointmentMetrics.inc({ status, service_type: serviceType });
  }

  /**
   * Track payment
   */
  trackPayment(status: string, paymentMethod: string, plan: string): void {
    paymentMetrics.inc({ status, payment_method: paymentMethod, plan });
  }

  /**
   * Track cache operations
   */
  trackCacheOperation(operation: 'get' | 'set' | 'delete', result: 'hit' | 'miss' | 'error'): void {
    cacheMetrics.inc({ operation, result });
  }

  /**
   * Update queue metrics
   */
  async updateQueueMetrics(): Promise<void> {
    try {
      for (const queueName of Object.values(QueueName)) {
        const counts = await queueService.getJobCounts(queueName);
        
        Object.entries(counts).forEach(([status, count]) => {
          queueMetrics.set({ queue: queueName, status }, count);
        });
      }
    } catch (error) {
      logger.error('Failed to update queue metrics:', error);
    }
  }

  /**
   * Update database metrics
   */
  updateDatabaseMetrics(): void {
    const connections = mongoose.connections;
    
    connections.forEach((conn, index) => {
      dbConnectionMetrics.set(
        { state: 'ready' },
        conn.readyState === 1 ? 1 : 0
      );
      dbConnectionMetrics.set(
        { state: 'connecting' },
        conn.readyState === 2 ? 1 : 0
      );
      dbConnectionMetrics.set(
        { state: 'disconnected' },
        conn.readyState === 0 ? 1 : 0
      );
    });
  }

  /**
   * Track errors
   */
  trackError(type: string, severity: 'low' | 'medium' | 'high' | 'critical'): void {
    errorRate.inc({ type, severity });
  }

  /**
   * Update revenue metrics
   */
  async updateRevenueMetrics(): Promise<void> {
    try {
      const Transaction = mongoose.model('Transaction');
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      
      const revenue = await Transaction.aggregate([
        {
          $match: {
            status: 'completed',
            createdAt: { $gte: startOfMonth },
          },
        },
        {
          $group: {
            _id: '$currency',
            total: { $sum: '$amount' },
          },
        },
      ]);

      revenue.forEach((rev) => {
        revenueMetrics.set(
          { currency: rev._id || 'DZD', period: 'monthly' },
          rev.total
        );
      });
    } catch (error) {
      logger.error('Failed to update revenue metrics:', error);
    }
  }

  /**
   * Update salon metrics
   */
  async updateSalonMetrics(): Promise<void> {
    try {
      const User = mongoose.model('User');
      const salons = await User.aggregate([
        {
          $match: { role: 'salon' },
        },
        {
          $group: {
            _id: {
              plan: '$subscription.plan',
              status: '$isActive',
            },
            count: { $sum: 1 },
          },
        },
      ]);

      salons.forEach((salon) => {
        salonMetrics.set(
          { 
            plan: salon._id.plan || 'free', 
            status: salon._id.status ? 'active' : 'inactive' 
          },
          salon.count
        );
      });
    } catch (error) {
      logger.error('Failed to update salon metrics:', error);
    }
  }

  /**
   * Collect system metrics
   */
  private collectSystemMetrics(): void {
    // CPU usage
    const cpus = os.cpus();
    const cpuUsage = cpus.reduce((acc, cpu) => {
      const total = Object.values(cpu.times).reduce((a, b) => a + b, 0);
      const idle = cpu.times.idle;
      return acc + ((total - idle) / total);
    }, 0) / cpus.length;
    
    systemMetrics.set({ metric: 'cpu_usage_percent' }, cpuUsage * 100);

    // Memory usage
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    
    systemMetrics.set({ metric: 'memory_used_bytes' }, usedMem);
    systemMetrics.set({ metric: 'memory_total_bytes' }, totalMem);
    systemMetrics.set({ metric: 'memory_usage_percent' }, (usedMem / totalMem) * 100);

    // Load average
    const loadAvg = os.loadavg();
    systemMetrics.set({ metric: 'load_average_1m' }, loadAvg[0]);
    systemMetrics.set({ metric: 'load_average_5m' }, loadAvg[1]);
    systemMetrics.set({ metric: 'load_average_15m' }, loadAvg[2]);
  }

  /**
   * Start system metrics collection
   */
  private startSystemMetricsCollection(): void {
    // Collect system metrics every 30 seconds
    this.metricsInterval = setInterval(() => {
      this.collectSystemMetrics();
      this.updateDatabaseMetrics();
    }, 30000);

    // Update business metrics every 5 minutes
    setInterval(async () => {
      await this.updateSubscriptionMetrics();
      await this.updateQueueMetrics();
      await this.updateRevenueMetrics();
      await this.updateSalonMetrics();
    }, 300000);
  }

  /**
   * Get circuit breaker metrics
   */
  getCircuitBreakerMetrics(): any {
    const services = ['auth-service', 'payment-service', 'notification-service'];
    const metrics: any = {};

    services.forEach(service => {
      try {
        const stats = circuitBreakerService.getStatistics(service);
        const health = circuitBreakerService.getHealthStatus();
        
        metrics[service] = {
          ...stats,
          health: health,
        };
      } catch (error) {
        // Service might not be registered
      }
    });

    return metrics;
  }

  /**
   * Health check endpoint data
   */
  async getHealthCheckData(): Promise<any> {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: mongoose.connection.readyState === 1 ? 'healthy' : 'unhealthy',
        redis: await this.checkRedisHealth(),
        queues: await this.checkQueuesHealth(),
      },
      metrics: {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        cpu: process.cpuUsage(),
      },
      circuitBreakers: this.getCircuitBreakerMetrics(),
    };

    // Determine overall health
    const unhealthyServices = Object.values(health.services).filter(s => s !== 'healthy');
    if (unhealthyServices.length > 0) {
      health.status = unhealthyServices.length > 1 ? 'unhealthy' : 'degraded';
    }

    return health;
  }

  /**
   * Check Redis health
   */
  private async checkRedisHealth(): Promise<string> {
    try {
      await cacheService.set('health-check', 'ok', { ttl: 10 });
      const value = await cacheService.get('health-check');
      return value === 'ok' ? 'healthy' : 'unhealthy';
    } catch (error) {
      return 'unhealthy';
    }
  }

  /**
   * Check queues health
   */
  private async checkQueuesHealth(): Promise<string> {
    try {
      const counts = await queueService.getJobCounts(QueueName.EMAIL);
      return 'healthy';
    } catch (error) {
      return 'unhealthy';
    }
  }

  /**
   * Get Prometheus metrics
   */
  async getMetrics(): Promise<string> {
    return register.metrics();
  }

  /**
   * Cleanup
   */
  cleanup(): void {
    if (this.metricsInterval) {
      clearInterval(this.metricsInterval);
    }
  }
}

// Export singleton instance
export const monitoringService = new MonitoringService();

// Export middleware
export const metricsMiddleware = monitoringService.httpMetricsMiddleware();
