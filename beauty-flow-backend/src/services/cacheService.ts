import { cacheRedisClient } from '../config/redis';
import { logger } from '../utils/logger';
import crypto from 'crypto';

interface CacheOptions {
  ttl?: number; // Time to live in seconds
  tags?: string[]; // Tags for cache invalidation
  compress?: boolean; // Compress large data
}

interface CacheStats {
  hits: number;
  misses: number;
  sets: number;
  deletes: number;
  errors: number;
}

class CacheService {
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0,
    errors: 0,
  };

  private defaultTTL = 3600; // 1 hour
  private maxTTL = 86400 * 7; // 7 days

  // Cache key patterns for different data types
  private keyPatterns = {
    user: (id: string) => `user:${id}`,
    salon: (id: string) => `salon:${id}`,
    service: (salonId: string, serviceId: string) => `salon:${salonId}:service:${serviceId}`,
    appointment: (id: string) => `appointment:${id}`,
    appointments: (salonId: string, date: string) => `salon:${salonId}:appointments:${date}`,
    availability: (salonId: string, date: string) => `salon:${salonId}:availability:${date}`,
    stats: (salonId: string, period: string) => `salon:${salonId}:stats:${period}`,
    subscription: (userId: string) => `subscription:${userId}`,
    limits: (userId: string) => `limits:${userId}`,
  };

  /**
   * Get value from cache
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await cacheRedisClient.get(key);
      
      if (value) {
        this.stats.hits++;
        logger.debug(`Cache hit: ${key}`);
        return JSON.parse(value);
      }
      
      this.stats.misses++;
      logger.debug(`Cache miss: ${key}`);
      return null;
    } catch (error) {
      this.stats.errors++;
      logger.error('Cache get error:', error);
      return null;
    }
  }

  /**
   * Get multiple values from cache
   */
  async mget<T>(keys: string[]): Promise<(T | null)[]> {
    try {
      const values = await cacheRedisClient.mget(keys);
      return values.map(value => value ? JSON.parse(value) : null);
    } catch (error) {
      this.stats.errors++;
      logger.error('Cache mget error:', error);
      return keys.map(() => null);
    }
  }

  /**
   * Set value in cache with options
   */
  async set(key: string, value: any, options: CacheOptions = {}): Promise<boolean> {
    try {
      const ttl = Math.min(options.ttl || this.defaultTTL, this.maxTTL);
      const serialized = JSON.stringify(value);
      
      await cacheRedisClient.setex(key, ttl, serialized);
      
      // Handle tags for grouped invalidation
      if (options.tags && options.tags.length > 0) {
        await this.addToTags(key, options.tags, ttl);
      }
      
      this.stats.sets++;
      logger.debug(`Cache set: ${key} (TTL: ${ttl}s)`);
      return true;
    } catch (error) {
      this.stats.errors++;
      logger.error('Cache set error:', error);
      return false;
    }
  }

  /**
   * Set multiple values in cache
   */
  async mset(items: Array<{ key: string; value: any; options?: CacheOptions }>): Promise<boolean> {
    try {
      const pipeline = cacheRedisClient.pipeline();
      
      for (const item of items) {
        const ttl = Math.min(item.options?.ttl || this.defaultTTL, this.maxTTL);
        const serialized = JSON.stringify(item.value);
        pipeline.setex(item.key, ttl, serialized);
        
        if (item.options?.tags) {
          for (const tag of item.options.tags) {
            pipeline.sadd(`tag:${tag}`, item.key);
            pipeline.expire(`tag:${tag}`, ttl);
          }
        }
      }
      
      await pipeline.exec();
      this.stats.sets += items.length;
      return true;
    } catch (error) {
      this.stats.errors++;
      logger.error('Cache mset error:', error);
      return false;
    }
  }

  /**
   * Delete value from cache
   */
  async delete(key: string): Promise<boolean> {
    try {
      await cacheRedisClient.del(key);
      this.stats.deletes++;
      logger.debug(`Cache delete: ${key}`);
      return true;
    } catch (error) {
      this.stats.errors++;
      logger.error('Cache delete error:', error);
      return false;
    }
  }

  /**
   * Delete multiple values from cache
   */
  async deleteMany(keys: string[]): Promise<boolean> {
    try {
      if (keys.length > 0) {
        await cacheRedisClient.del(...keys);
        this.stats.deletes += keys.length;
        logger.debug(`Cache delete many: ${keys.length} keys`);
      }
      return true;
    } catch (error) {
      this.stats.errors++;
      logger.error('Cache delete many error:', error);
      return false;
    }
  }

  /**
   * Invalidate cache by pattern
   */
  async invalidatePattern(pattern: string): Promise<number> {
    try {
      const keys = await this.scanKeys(pattern);
      if (keys.length > 0) {
        await this.deleteMany(keys);
      }
      logger.info(`Cache invalidated ${keys.length} keys matching pattern: ${pattern}`);
      return keys.length;
    } catch (error) {
      this.stats.errors++;
      logger.error('Cache invalidate pattern error:', error);
      return 0;
    }
  }

  /**
   * Invalidate cache by tags
   */
  async invalidateByTags(tags: string[]): Promise<number> {
    try {
      const allKeys = new Set<string>();
      
      for (const tag of tags) {
        const keys = await cacheRedisClient.smembers(`tag:${tag}`);
        keys.forEach(key => allKeys.add(key));
        await cacheRedisClient.del(`tag:${tag}`);
      }
      
      const keysArray = Array.from(allKeys);
      if (keysArray.length > 0) {
        await this.deleteMany(keysArray);
      }
      
      logger.info(`Cache invalidated ${keysArray.length} keys for tags: ${tags.join(', ')}`);
      return keysArray.length;
    } catch (error) {
      this.stats.errors++;
      logger.error('Cache invalidate by tags error:', error);
      return 0;
    }
  }

  /**
   * Warm up cache with frequently accessed data
   */
  async warmup(keys: string[], fetcher: (key: string) => Promise<any>): Promise<void> {
    try {
      const promises = keys.map(async (key) => {
        const cached = await this.get(key);
        if (!cached) {
          const data = await fetcher(key);
          if (data) {
            await this.set(key, data);
          }
        }
      });
      
      await Promise.all(promises);
      logger.info(`Cache warmed up with ${keys.length} keys`);
    } catch (error) {
      logger.error('Cache warmup error:', error);
    }
  }

  /**
   * Get or set cache (cache-aside pattern)
   */
  async getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    options: CacheOptions = {}
  ): Promise<T> {
    // Try to get from cache first
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    // Fetch from source
    const data = await fetcher();
    
    // Store in cache
    await this.set(key, data, options);
    
    return data;
  }

  /**
   * Remember forever (with max TTL)
   */
  async remember<T>(
    key: string,
    fetcher: () => Promise<T>
  ): Promise<T> {
    return this.getOrSet(key, fetcher, { ttl: this.maxTTL });
  }

  /**
   * Increment counter
   */
  async increment(key: string, by: number = 1): Promise<number> {
    try {
      const result = await cacheRedisClient.incrby(key, by);
      await cacheRedisClient.expire(key, this.defaultTTL);
      return result;
    } catch (error) {
      logger.error('Cache increment error:', error);
      return 0;
    }
  }

  /**
   * Decrement counter
   */
  async decrement(key: string, by: number = 1): Promise<number> {
    try {
      const result = await cacheRedisClient.decrby(key, by);
      await cacheRedisClient.expire(key, this.defaultTTL);
      return result;
    } catch (error) {
      logger.error('Cache decrement error:', error);
      return 0;
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats & { hitRate: number } {
    const total = this.stats.hits + this.stats.misses;
    const hitRate = total > 0 ? (this.stats.hits / total) * 100 : 0;
    
    return {
      ...this.stats,
      hitRate: Math.round(hitRate * 100) / 100,
    };
  }

  /**
   * Reset cache statistics
   */
  resetStats(): void {
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      errors: 0,
    };
  }

  /**
   * Clear all cache
   */
  async flush(): Promise<void> {
    try {
      await cacheRedisClient.flushdb();
      logger.warn('Cache flushed');
    } catch (error) {
      logger.error('Cache flush error:', error);
    }
  }

  /**
   * Helper: Add keys to tags
   */
  private async addToTags(key: string, tags: string[], ttl: number): Promise<void> {
    const pipeline = cacheRedisClient.pipeline();
    
    for (const tag of tags) {
      pipeline.sadd(`tag:${tag}`, key);
      pipeline.expire(`tag:${tag}`, ttl);
    }
    
    await pipeline.exec();
  }

  /**
   * Helper: Scan keys by pattern
   */
  private async scanKeys(pattern: string): Promise<string[]> {
    const keys: string[] = [];
    let cursor = '0';
    
    do {
      const [newCursor, foundKeys] = await cacheRedisClient.scan(
        cursor,
        'MATCH',
        pattern,
        'COUNT',
        100
      );
      
      cursor = newCursor;
      keys.push(...foundKeys);
    } while (cursor !== '0');
    
    return keys;
  }

  /**
   * Generate cache key with version
   */
  generateVersionedKey(baseKey: string, version: string | number): string {
    return `${baseKey}:v${version}`;
  }

  /**
   * Generate cache key with hash
   */
  generateHashedKey(baseKey: string, params: any): string {
    const hash = crypto
      .createHash('md5')
      .update(JSON.stringify(params))
      .digest('hex')
      .substring(0, 8);
    return `${baseKey}:${hash}`;
  }

  // Convenience methods for common patterns
  keys = this.keyPatterns;
}

// Export singleton instance
export const cacheService = new CacheService();

// Export types
export type { CacheOptions, CacheStats };
