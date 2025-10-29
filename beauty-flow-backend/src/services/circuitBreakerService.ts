import CircuitBreaker from 'opossum';
import { logger } from '../utils/logger';

interface CircuitBreakerOptions {
  timeout?: number;
  errorThresholdPercentage?: number;
  resetTimeout?: number;
  rollingCountTimeout?: number;
  rollingCountBuckets?: number;
  name?: string;
}

class CircuitBreakerService {
  private breakers: Map<string, CircuitBreaker> = new Map();
  private defaultOptions: CircuitBreakerOptions = {
    timeout: 3000, // 3 seconds
    errorThresholdPercentage: 50,
    resetTimeout: 30000, // 30 seconds
    rollingCountTimeout: 10000,
    rollingCountBuckets: 10,
  };

  /**
   * Create or get a circuit breaker for a specific service
   */
  getBreaker(
    name: string,
    action: (...args: any[]) => Promise<any>,
    options?: CircuitBreakerOptions
  ): CircuitBreaker {
    if (!this.breakers.has(name)) {
      const breakerOptions = {
        ...this.defaultOptions,
        ...options,
        name,
      };

      const breaker = new CircuitBreaker(action, breakerOptions);

      // Event listeners
      breaker.on('open', () => {
        logger.warn(`Circuit breaker opened for ${name}`);
      });

      breaker.on('halfOpen', () => {
        logger.info(`Circuit breaker half-open for ${name}`);
      });

      breaker.on('close', () => {
        logger.info(`Circuit breaker closed for ${name}`);
      });

      breaker.on('failure', (error) => {
        logger.error(`Circuit breaker failure for ${name}:`, error);
      });

      this.breakers.set(name, breaker);
    }

    return this.breakers.get(name)!;
  }

  /**
   * Execute an action with circuit breaker protection
   */
  async execute<T>(
    name: string,
    action: (...args: any[]) => Promise<T>,
    options?: CircuitBreakerOptions,
    ...args: any[]
  ): Promise<T> {
    const breaker = this.getBreaker(name, action, options);
    return breaker.fire(...args) as Promise<T>;
  }

  /**
   * Get circuit breaker statistics
   */
  getStatistics(name: string): any {
    const breaker = this.breakers.get(name);
    if (!breaker) {
      throw new Error(`Circuit breaker ${name} not found`);
    }

    return {
      name,
      state: breaker.opened ? 'open' : breaker.halfOpen ? 'half-open' : 'closed',
      stats: breaker.stats,
      enabled: breaker.enabled,
    };
  }

  /**
   * Get all circuit breakers statistics
   */
  getAllStatistics(): Record<string, any> {
    const stats: Record<string, any> = {};
    
    this.breakers.forEach((breaker, name) => {
      stats[name] = this.getStatistics(name);
    });

    return stats;
  }

  /**
   * Reset a specific circuit breaker
   */
  reset(name: string): void {
    const breaker = this.breakers.get(name);
    if (breaker) {
      breaker.close();
      logger.info(`Circuit breaker ${name} has been reset`);
    }
  }

  /**
   * Reset all circuit breakers
   */
  resetAll(): void {
    this.breakers.forEach((breaker, name) => {
      breaker.close();
      logger.info(`Circuit breaker ${name} has been reset`);
    });
  }

  /**
   * Disable a specific circuit breaker
   */
  disable(name: string): void {
    const breaker = this.breakers.get(name);
    if (breaker) {
      breaker.disable();
      logger.info(`Circuit breaker ${name} has been disabled`);
    }
  }

  /**
   * Enable a specific circuit breaker
   */
  enable(name: string): void {
    const breaker = this.breakers.get(name);
    if (breaker) {
      breaker.enable();
      logger.info(`Circuit breaker ${name} has been enabled`);
    }
  }

  /**
   * Get health status of all circuit breakers
   */
  getHealthStatus(): { healthy: boolean; breakers: Record<string, string> } {
    const breakerStatus: Record<string, string> = {};
    let healthy = true;

    this.breakers.forEach((breaker, name) => {
      const state = breaker.opened ? 'open' : breaker.halfOpen ? 'half-open' : 'closed';
      breakerStatus[name] = state;
      
      if (breaker.opened) {
        healthy = false;
      }
    });

    return {
      healthy,
      breakers: breakerStatus,
    };
  }
}

// Export singleton instance
export const circuitBreakerService = new CircuitBreakerService();

// Export wrapped functions for common services
export const protectedServices = {
  /**
   * Protected HTTP request
   */
  httpRequest: async (requestFn: () => Promise<any>, options?: CircuitBreakerOptions) => {
    return circuitBreakerService.execute('http-request', requestFn, options);
  },

  /**
   * Protected database query
   */
  databaseQuery: async (queryFn: () => Promise<any>, options?: CircuitBreakerOptions) => {
    return circuitBreakerService.execute('database-query', queryFn, {
      timeout: 5000,
      ...options,
    });
  },

  /**
   * Protected external API call
   */
  externalApi: async (
    apiName: string,
    callFn: () => Promise<any>,
    options?: CircuitBreakerOptions
  ) => {
    return circuitBreakerService.execute(`external-api-${apiName}`, callFn, options);
  },

  /**
   * Protected email service
   */
  emailService: async (emailFn: () => Promise<any>, options?: CircuitBreakerOptions) => {
    return circuitBreakerService.execute('email-service', emailFn, {
      timeout: 10000,
      ...options,
    });
  },

  /**
   * Protected payment service
   */
  paymentService: async (paymentFn: () => Promise<any>, options?: CircuitBreakerOptions) => {
    return circuitBreakerService.execute('payment-service', paymentFn, {
      timeout: 30000,
      errorThresholdPercentage: 30,
      ...options,
    });
  },
};
