import mongoose from 'mongoose';
import { logger } from './logger';

/**
 * Database optimization utilities for high-performance operations
 */

// Type for index specification
type IndexSpec = Record<string, 1 | -1 | 'text'>;

// Index definitions for each collection
const indexDefinitions: Record<string, IndexSpec[]> = {
  users: [
    { email: 1 },
    { username: 1 },
    { 'subscription.status': 1, 'subscription.endDate': 1 },
    { createdAt: -1 },
    { role: 1, isActive: 1 },
  ],
  
  appointments: [
    { salon: 1, date: 1, status: 1 },
    { client: 1, date: -1 },
    { teamMember: 1, date: 1, status: 1 },
    { date: 1, timeSlot: 1 },
    { status: 1, date: 1 },
    { createdAt: -1 },
    // Compound index for availability checks
    { salon: 1, teamMember: 1, date: 1, timeSlot: 1 },
  ],
  
  services: [
    { salon: 1, isActive: 1 },
    { category: 1, salon: 1 },
    { price: 1 },
    { name: 'text', description: 'text' }, // Text search index
  ],
  
  clients: [
    { salon: 1, isActive: 1 },
    { email: 1, salon: 1 },
    { phone: 1, salon: 1 },
    { createdAt: -1 },
    { name: 'text', email: 'text' }, // Text search index
  ],
  
  teams: [
    { salon: 1, isActive: 1 },
    { user: 1 },
    { specialties: 1 },
    { 'availability.dayOfWeek': 1 },
  ],
  
  transactions: [
    { user: 1, createdAt: -1 },
    { status: 1, createdAt: -1 },
    { orderId: 1 },
    { type: 1, status: 1 },
    { 'metadata.subscriptionId': 1 },
  ],
  
  products: [
    { salon: 1, isActive: 1 },
    { category: 1, salon: 1 },
    { stock: 1 },
    { price: 1 },
    { name: 'text', description: 'text' }, // Text search index
  ],
  
  commissions: [
    { affiliate: 1, status: 1 },
    { referredUser: 1 },
    { createdAt: -1 },
    { status: 1, paidAt: 1 },
  ],
};

/**
 * Create indexes for all collections
 */
export async function createIndexes(): Promise<void> {
  try {
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection not established');
    }
    
    for (const [collectionName, indexes] of Object.entries(indexDefinitions)) {
      const collection = db.collection(collectionName);
      
      for (const index of indexes) {
        try {
          await collection.createIndex(index as any);
          logger.info(`Created index on ${collectionName}:`, index);
        } catch (error) {
          logger.error(`Failed to create index on ${collectionName}:`, error);
        }
      }
    }
    
    logger.info('All database indexes created successfully');
  } catch (error) {
    logger.error('Failed to create database indexes:', error);
    throw error;
  }
}

/**
 * Analyze and optimize collections
 */
export async function optimizeCollections(): Promise<void> {
  try {
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection not established');
    }
    
    const collections = await db.listCollections().toArray();
    
    for (const collectionInfo of collections) {
      const collection = db.collection(collectionInfo.name);
      
      // Get collection stats using db.command
      const stats = await db.command({ collStats: collectionInfo.name });
      logger.info(`Collection ${collectionInfo.name} stats:`, {
        count: stats.count,
        size: stats.size,
        avgObjSize: stats.avgObjSize,
        storageSize: stats.storageSize,
        totalIndexSize: stats.totalIndexSize,
        indexSizes: stats.indexSizes,
      });
      
      // Compact collection if fragmented
      if (stats.storageSize > stats.size * 2) {
        logger.info(`Compacting collection ${collectionInfo.name}...`);
        await db.command({ compact: collectionInfo.name });
      }
    }
    
    logger.info('Collection optimization completed');
  } catch (error) {
    logger.error('Failed to optimize collections:', error);
    throw error;
  }
}

/**
 * Configure read preference for read replicas
 */
export function configureReadPreference(): void {
  // Configure read preference for different operations
  // This should be set in connection options instead of runtime
  logger.info('Read preference should be configured in connection options');
}

/**
 * Enable query profiling for slow queries
 */
export async function enableProfiling(level: 0 | 1 | 2 = 1, slowMs: number = 100): Promise<void> {
  try {
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection not established');
    }
    
    await db.command({
      profile: level,
      slowms: slowMs,
    });
    
    logger.info(`Database profiling enabled at level ${level} for queries slower than ${slowMs}ms`);
  } catch (error) {
    logger.error('Failed to enable database profiling:', error);
    throw error;
  }
}

/**
 * Get slow query logs
 */
export async function getSlowQueries(limit: number = 10): Promise<any[]> {
  try {
    const db = mongoose.connection.db;
    if (!db) {
      return [];
    }
    
    const profileCollection = db.collection('system.profile');
    
    const slowQueries = await profileCollection
      .find({ millis: { $gt: 100 } })
      .sort({ ts: -1 })
      .limit(limit)
      .toArray();
    
    return slowQueries;
  } catch (error) {
    logger.error('Failed to get slow queries:', error);
    return [];
  }
}

/**
 * Configure connection pooling for high concurrency
 */
export function getOptimizedConnectionOptions(): mongoose.ConnectOptions {
  return {
    // Connection pool settings
    maxPoolSize: 100, // Maximum number of connections
    minPoolSize: 10, // Minimum number of connections
    maxIdleTimeMS: 30000, // Max idle time before closing
    waitQueueTimeoutMS: 5000, // Max time to wait for connection
    
    // Socket settings
    socketTimeoutMS: 45000,
    connectTimeoutMS: 10000,
    
    // Server selection
    serverSelectionTimeoutMS: 5000,
    heartbeatFrequencyMS: 10000,
    
    // Compression
    compressors: ['zlib'],
    zlibCompressionLevel: 6,
    
    // Retry settings
    retryWrites: true,
    retryReads: true,
  };
}

/**
 * Setup change streams for real-time updates
 */
export function setupChangeStreams(): void {
  // Appointments change stream
  const appointmentsChangeStream = mongoose.connection.collection('appointments').watch(
    [
      {
        $match: {
          operationType: { $in: ['insert', 'update', 'delete'] },
        },
      },
    ],
    { fullDocument: 'updateLookup' }
  );
  
  appointmentsChangeStream.on('change', (change) => {
    logger.debug('Appointment change detected:', change);
    // TODO: Emit socket event or update cache
  });
  
  // Services change stream
  const servicesChangeStream = mongoose.connection.collection('services').watch(
    [
      {
        $match: {
          operationType: { $in: ['insert', 'update', 'delete'] },
        },
      },
    ],
    { fullDocument: 'updateLookup' }
  );
  
  servicesChangeStream.on('change', (change) => {
    logger.debug('Service change detected:', change);
    // TODO: Invalidate service cache
  });
  
  logger.info('Change streams configured for real-time updates');
}

/**
 * Aggregation pipeline templates for common queries
 */
export const aggregationPipelines = {
  // Get salon statistics
  salonStats: (salonId: string, startDate: Date, endDate: Date) => [
    {
      $match: {
        salon: new mongoose.Types.ObjectId(salonId),
        date: { $gte: startDate, $lte: endDate },
        status: 'completed',
      },
    },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$totalPrice' },
        appointmentCount: { $sum: 1 },
        avgServicePrice: { $avg: '$totalPrice' },
        uniqueClients: { $addToSet: '$client' },
      },
    },
    {
      $project: {
        _id: 0,
        totalRevenue: 1,
        appointmentCount: 1,
        avgServicePrice: { $round: ['$avgServicePrice', 2] },
        uniqueClientCount: { $size: '$uniqueClients' },
      },
    },
  ],
  
  // Get popular services
  popularServices: (salonId: string, limit: number = 10) => [
    {
      $match: {
        salon: new mongoose.Types.ObjectId(salonId),
        status: 'completed',
      },
    },
    { $unwind: '$services' },
    {
      $group: {
        _id: '$services',
        count: { $sum: 1 },
        revenue: { $sum: '$services.price' },
      },
    },
    {
      $lookup: {
        from: 'services',
        localField: '_id',
        foreignField: '_id',
        as: 'serviceDetails',
      },
    },
    { $unwind: '$serviceDetails' },
    {
      $project: {
        serviceName: '$serviceDetails.name',
        count: 1,
        revenue: 1,
      },
    },
    { $sort: { count: -1 } },
    { $limit: limit },
  ],
  
  // Get team member performance
  teamPerformance: (salonId: string, startDate: Date, endDate: Date) => [
    {
      $match: {
        salon: new mongoose.Types.ObjectId(salonId),
        date: { $gte: startDate, $lte: endDate },
        status: 'completed',
      },
    },
    {
      $group: {
        _id: '$teamMember',
        appointmentCount: { $sum: 1 },
        totalRevenue: { $sum: '$totalPrice' },
        avgRating: { $avg: '$rating' },
      },
    },
    {
      $lookup: {
        from: 'teams',
        localField: '_id',
        foreignField: '_id',
        as: 'teamMemberDetails',
      },
    },
    { $unwind: '$teamMemberDetails' },
    {
      $project: {
        name: '$teamMemberDetails.name',
        appointmentCount: 1,
        totalRevenue: 1,
        avgRating: { $round: ['$avgRating', 1] },
      },
    },
    { $sort: { totalRevenue: -1 } },
  ],
};

/**
 * Initialize all database optimizations
 */
export async function initializeDBOptimizations(): Promise<void> {
  try {
    // Create indexes
    await createIndexes();
    
    // Configure read preferences
    configureReadPreference();
    
    // Enable profiling in development
    if (process.env.NODE_ENV === 'development') {
      await enableProfiling(1, 100);
    }
    
    // Setup change streams
    setupChangeStreams();
    
    // Schedule periodic optimization
    setInterval(async () => {
      await optimizeCollections();
    }, 24 * 60 * 60 * 1000); // Run daily
    
    logger.info('Database optimizations initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize database optimizations:', error);
    throw error;
  }
}
