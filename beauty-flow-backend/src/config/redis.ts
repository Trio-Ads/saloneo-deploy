import Redis from 'ioredis';
import { logger } from '../utils/logger';

// Redis configuration for high availability
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  db: parseInt(process.env.REDIS_DB || '0'),
  retryStrategy: (times: number) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  enableOfflineQueue: true,
  connectTimeout: 10000,
  lazyConnect: true,
  keepAlive: 30000,
  noDelay: true,
};

// Create Redis clients
export const redisClient = new Redis(redisConfig);
export const redisSubscriber = new Redis(redisConfig);
export const redisPublisher = new Redis(redisConfig);

// Session Redis client with specific config
export const sessionRedisClient = new Redis({
  ...redisConfig,
  keyPrefix: 'session:',
});

// Cache Redis client with specific config
export const cacheRedisClient = new Redis({
  ...redisConfig,
  keyPrefix: 'cache:',
});

// Queue Redis client
export const queueRedisClient = new Redis({
  ...redisConfig,
  keyPrefix: 'queue:',
  maxRetriesPerRequest: null,
});

// Error handling
const clients = [
  { name: 'main', client: redisClient },
  { name: 'subscriber', client: redisSubscriber },
  { name: 'publisher', client: redisPublisher },
  { name: 'session', client: sessionRedisClient },
  { name: 'cache', client: cacheRedisClient },
  { name: 'queue', client: queueRedisClient },
];

clients.forEach(({ name, client }) => {
  client.on('error', (err) => {
    logger.error(`Redis ${name} client error:`, err);
  });

  client.on('connect', () => {
    logger.info(`Redis ${name} client connected`);
  });

  client.on('ready', () => {
    logger.info(`Redis ${name} client ready`);
  });

  client.on('close', () => {
    logger.warn(`Redis ${name} client connection closed`);
  });

  client.on('reconnecting', (delay: number) => {
    logger.info(`Redis ${name} client reconnecting in ${delay}ms`);
  });
});

// Initialize all Redis connections
export async function initializeRedis(): Promise<void> {
  try {
    await Promise.all(
      clients.map(async ({ name, client }) => {
        await client.connect();
        logger.info(`Redis ${name} client initialized`);
      })
    );
  } catch (error) {
    logger.error('Failed to initialize Redis:', error);
    throw error;
  }
}

// Graceful shutdown
export async function closeRedisConnections(): Promise<void> {
  await Promise.all(
    clients.map(async ({ name, client }) => {
      await client.quit();
      logger.info(`Redis ${name} client closed`);
    })
  );
}

// Health check
export async function checkRedisHealth(): Promise<boolean> {
  try {
    const results = await Promise.all(
      clients.map(async ({ client }) => {
        const pong = await client.ping();
        return pong === 'PONG';
      })
    );
    return results.every(result => result);
  } catch (error) {
    logger.error('Redis health check failed:', error);
    return false;
  }
}
