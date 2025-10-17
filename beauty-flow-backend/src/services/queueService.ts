import Bull, { Queue, Job, JobOptions, QueueOptions } from 'bull';
import { createBullBoard } from '@bull-board/api';
import { BullAdapter } from '@bull-board/api/bullAdapter';
import { ExpressAdapter } from '@bull-board/express';
import { queueRedisClient } from '../config/redis';
import { logger } from '../utils/logger';
import { emailService } from './emailService';

// Queue configuration
const defaultQueueOptions: QueueOptions = {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB || '1'),
  },
  defaultJobOptions: {
    removeOnComplete: 100,
    removeOnFail: 500,
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
  },
};

// Define queue types
export enum QueueName {
  EMAIL = 'email',
  NOTIFICATION = 'notification',
  ANALYTICS = 'analytics',
  IMAGE_PROCESSING = 'image-processing',
  APPOINTMENT_REMINDER = 'appointment-reminder',
  SUBSCRIPTION_CHECK = 'subscription-check',
  CACHE_WARMUP = 'cache-warmup',
  DATA_EXPORT = 'data-export',
}

// Job data interfaces
export interface EmailJobData {
  template: string;
  to: string | string[];
  data: any;
  priority?: number;
}

export interface NotificationJobData {
  userId: string;
  type: string;
  title: string;
  message: string;
  data?: any;
}

export interface AnalyticsJobData {
  event: string;
  userId?: string;
  salonId?: string;
  data: any;
}

export interface ImageProcessingJobData {
  imageUrl: string;
  operations: Array<{
    type: 'resize' | 'compress' | 'watermark' | 'format';
    options: any;
  }>;
  outputPath: string;
}

export interface AppointmentReminderJobData {
  appointmentId: string;
  type: '24h' | '2h' | 'custom';
  customHours?: number;
}

export interface SubscriptionCheckJobData {
  userId: string;
  checkType: 'expiry' | 'limits' | 'usage';
}

export interface CacheWarmupJobData {
  type: 'salon' | 'services' | 'appointments' | 'all';
  salonId?: string;
  date?: string;
}

export interface DataExportJobData {
  userId: string;
  type: 'appointments' | 'clients' | 'revenue' | 'all';
  format: 'csv' | 'excel' | 'pdf';
  dateRange: {
    start: Date;
    end: Date;
  };
}

class QueueService {
  private queues: Map<QueueName, Queue> = new Map();
  private serverAdapter: ExpressAdapter;

  constructor() {
    this.serverAdapter = new ExpressAdapter();
    this.serverAdapter.setBasePath('/admin/queues');
    this.initializeQueues();
  }

  /**
   * Initialize all queues
   */
  private initializeQueues(): void {
    // Create queues
    Object.values(QueueName).forEach(queueName => {
      const queue = new Bull(queueName, defaultQueueOptions);
      this.queues.set(queueName, queue);
      this.setupQueueEventHandlers(queue, queueName);
    });

    // Setup Bull Board
    const bullBoard = createBullBoard({
      queues: Array.from(this.queues.values()).map(queue => new BullAdapter(queue)),
      serverAdapter: this.serverAdapter,
    });

    // Setup processors
    this.setupProcessors();

    logger.info('Queue service initialized with Bull Board');
  }

  /**
   * Setup queue event handlers
   */
  private setupQueueEventHandlers(queue: Queue, name: string): void {
    queue.on('completed', (job: Job) => {
      logger.info(`Job ${job.id} in queue ${name} completed`);
    });

    queue.on('failed', (job: Job, err: Error) => {
      logger.error(`Job ${job.id} in queue ${name} failed:`, err);
    });

    queue.on('stalled', (job: Job) => {
      logger.warn(`Job ${job.id} in queue ${name} stalled`);
    });

    queue.on('error', (error: Error) => {
      logger.error(`Queue ${name} error:`, error);
    });
  }

  /**
   * Setup job processors
   */
  private setupProcessors(): void {
    // Email processor
    this.getQueue(QueueName.EMAIL).process(async (job: Job<EmailJobData>) => {
      const { template, to, data } = job.data;
      await emailService.sendTemplateEmail(template, to, data);
      return { sent: true, to };
    });

    // Notification processor
    this.getQueue(QueueName.NOTIFICATION).process(async (job: Job<NotificationJobData>) => {
      const { userId, type, title, message, data } = job.data;
      // TODO: Implement push notification logic
      logger.info(`Processing notification for user ${userId}: ${title}`);
      return { notified: true, userId };
    });

    // Analytics processor
    this.getQueue(QueueName.ANALYTICS).process(async (job: Job<AnalyticsJobData>) => {
      const { event, userId, salonId, data } = job.data;
      // TODO: Send to analytics service (Google Analytics, Mixpanel, etc.)
      logger.info(`Analytics event: ${event}`, { userId, salonId, data });
      return { tracked: true, event };
    });

    // Image processing processor
    this.getQueue(QueueName.IMAGE_PROCESSING).process(async (job: Job<ImageProcessingJobData>) => {
      const { imageUrl, operations, outputPath } = job.data;
      // TODO: Implement image processing with Sharp
      logger.info(`Processing image: ${imageUrl}`);
      return { processed: true, outputPath };
    });

    // Appointment reminder processor
    this.getQueue(QueueName.APPOINTMENT_REMINDER).process(async (job: Job<AppointmentReminderJobData>) => {
      const { appointmentId, type } = job.data;
      // TODO: Fetch appointment and send reminder
      logger.info(`Sending ${type} reminder for appointment ${appointmentId}`);
      return { reminded: true, appointmentId };
    });

    // Subscription check processor
    this.getQueue(QueueName.SUBSCRIPTION_CHECK).process(async (job: Job<SubscriptionCheckJobData>) => {
      const { userId, checkType } = job.data;
      // TODO: Check subscription status and send notifications if needed
      logger.info(`Checking ${checkType} for user ${userId}`);
      return { checked: true, userId };
    });

    // Cache warmup processor
    this.getQueue(QueueName.CACHE_WARMUP).process(async (job: Job<CacheWarmupJobData>) => {
      const { type, salonId, date } = job.data;
      // TODO: Implement cache warmup logic
      logger.info(`Warming up ${type} cache`, { salonId, date });
      return { warmedUp: true, type };
    });

    // Data export processor
    this.getQueue(QueueName.DATA_EXPORT).process(async (job: Job<DataExportJobData>) => {
      const { userId, type, format, dateRange } = job.data;
      // TODO: Generate export and send email with download link
      logger.info(`Exporting ${type} data for user ${userId} in ${format} format`);
      return { exported: true, userId, type };
    });
  }

  /**
   * Get queue by name
   */
  getQueue(name: QueueName): Queue {
    const queue = this.queues.get(name);
    if (!queue) {
      throw new Error(`Queue ${name} not found`);
    }
    return queue;
  }

  /**
   * Add job to queue
   */
  async addJob<T>(
    queueName: QueueName,
    data: T,
    options?: JobOptions
  ): Promise<Job<T>> {
    const queue = this.getQueue(queueName);
    const job = await queue.add(data, options);
    logger.info(`Job ${job.id} added to queue ${queueName}`);
    return job;
  }

  /**
   * Add bulk jobs to queue
   */
  async addBulkJobs<T>(
    queueName: QueueName,
    jobs: Array<{ data: T; opts?: JobOptions }>
  ): Promise<Job<T>[]> {
    const queue = this.getQueue(queueName);
    const addedJobs = await queue.addBulk(jobs);
    logger.info(`${jobs.length} jobs added to queue ${queueName}`);
    return addedJobs;
  }

  /**
   * Schedule job
   */
  async scheduleJob<T>(
    queueName: QueueName,
    data: T,
    delay: number,
    options?: JobOptions
  ): Promise<Job<T>> {
    return this.addJob(queueName, data, { ...options, delay });
  }

  /**
   * Schedule recurring job
   */
  async scheduleRecurringJob<T>(
    queueName: QueueName,
    data: T,
    cron: string,
    options?: JobOptions
  ): Promise<Job<T>> {
    return this.addJob(queueName, data, { ...options, repeat: { cron } });
  }

  /**
   * Get job counts
   */
  async getJobCounts(queueName: QueueName): Promise<{
    waiting: number;
    active: number;
    completed: number;
    failed: number;
    delayed: number;
    paused: number;
  }> {
    const queue = this.getQueue(queueName);
    const counts = await queue.getJobCounts();
    return {
      waiting: counts.waiting || 0,
      active: counts.active || 0,
      completed: counts.completed || 0,
      failed: counts.failed || 0,
      delayed: counts.delayed || 0,
      paused: 0, // Bull doesn't provide paused count directly
    };
  }

  /**
   * Clean old jobs
   */
  async cleanJobs(queueName: QueueName, grace: number = 3600000): Promise<void> {
    const queue = this.getQueue(queueName);
    await queue.clean(grace, 'completed');
    await queue.clean(grace, 'failed');
    logger.info(`Cleaned old jobs from queue ${queueName}`);
  }

  /**
   * Pause queue
   */
  async pauseQueue(queueName: QueueName): Promise<void> {
    const queue = this.getQueue(queueName);
    await queue.pause();
    logger.info(`Queue ${queueName} paused`);
  }

  /**
   * Resume queue
   */
  async resumeQueue(queueName: QueueName): Promise<void> {
    const queue = this.getQueue(queueName);
    await queue.resume();
    logger.info(`Queue ${queueName} resumed`);
  }

  /**
   * Get Bull Board router
   */
  getBullBoardRouter() {
    return this.serverAdapter.getRouter();
  }

  /**
   * Schedule default recurring jobs
   */
  async scheduleDefaultJobs(): Promise<void> {
    // Check subscriptions daily at 2 AM
    await this.scheduleRecurringJob(
      QueueName.SUBSCRIPTION_CHECK,
      { checkType: 'expiry' },
      '0 2 * * *'
    );

    // Clean old jobs daily at 3 AM
    await this.scheduleRecurringJob(
      QueueName.ANALYTICS,
      { event: 'cleanup', data: { type: 'jobs' } },
      '0 3 * * *'
    );

    // Warm up cache every hour
    await this.scheduleRecurringJob(
      QueueName.CACHE_WARMUP,
      { type: 'all' },
      '0 * * * *'
    );

    logger.info('Default recurring jobs scheduled');
  }

  /**
   * Graceful shutdown
   */
  async shutdown(): Promise<void> {
    const promises = Array.from(this.queues.values()).map(queue => queue.close());
    await Promise.all(promises);
    logger.info('Queue service shut down');
  }
}

// Export singleton instance
export const queueService = new QueueService();

// Export convenience functions
export const addEmailJob = (data: EmailJobData, options?: JobOptions) =>
  queueService.addJob(QueueName.EMAIL, data, options);

export const addNotificationJob = (data: NotificationJobData, options?: JobOptions) =>
  queueService.addJob(QueueName.NOTIFICATION, data, options);

export const addAnalyticsJob = (data: AnalyticsJobData, options?: JobOptions) =>
  queueService.addJob(QueueName.ANALYTICS, data, options);

export const scheduleAppointmentReminder = (
  appointmentId: string,
  type: '24h' | '2h',
  scheduledTime: Date
) => {
  const delay = scheduledTime.getTime() - Date.now();
  return queueService.scheduleJob(
    QueueName.APPOINTMENT_REMINDER,
    { appointmentId, type },
    delay
  );
};
