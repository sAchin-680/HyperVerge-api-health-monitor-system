import { Worker, Job } from 'bullmq';
import { sendEmail } from '../providers/email';
import { sendWebhook } from '../providers/webhook';
import { logDelivery } from '../services/delivery.service';
import { retryQueue } from './retryQueue';
import { logger } from '../lib/logger';
import {
  notificationsSent,
  notificationDuration,
  retryAttempts,
  notificationQueueSize,
} from '../lib/metrics';

// Type-only import to avoid runtime issues
type AlertEvent = {
  alertId: string;
  userId: string;
  type: 'email' | 'webhook';
  target: string;
  message: string;
  attempt?: number;
};

// Parse REDIS_URL or fall back to host/port env vars
const getRedisConnection = () => {
  const redisUrl = process.env.REDIS_URL;
  if (redisUrl) {
    const url = new URL(redisUrl);
    return {
      host: url.hostname,
      port: Number(url.port) || 6379,
    };
  }
  return {
    host: process.env.REDIS_HOST || 'localhost',
    port: Number(process.env.REDIS_PORT) || 6379,
  };
};

const connection = getRedisConnection();

export const worker = new Worker<AlertEvent>(
  'alerts',
  async (job: Job<AlertEvent>) => {
    const event = job.data;
    const attempt = event.attempt ?? 1;

    const endTimer = notificationDuration.startTimer({ channel: event.type });

    logger.info(
      { alertId: event.alertId, type: event.type, attempt },
      'Processing alert'
    );

    try {
      // Send notification based on type
      if (event.type === 'email') {
        await sendEmail(event.target, event.message);
        logger.info(
          { target: event.target, alertId: event.alertId },
          'Email sent successfully'
        );
      } else if (event.type === 'webhook') {
        await sendWebhook(event.target, event.message);
        logger.info(
          { target: event.target, alertId: event.alertId },
          'Webhook sent successfully'
        );
      }

      endTimer();
      notificationsSent.inc({ channel: event.type, status: 'success' });

      // Log successful delivery
      await logDelivery({
        alertId: event.alertId,
        type: event.type,
        target: event.target,
        status: 'success',
        message: event.message,
        attempt,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);

      endTimer();
      notificationsSent.inc({ channel: event.type, status: 'failure' });

      logger.error(
        {
          alertId: event.alertId,
          type: event.type,
          target: event.target,
          error: errorMessage,
          attempt,
        },
        'Failed to send notification'
      );

      // Log failed delivery
      await logDelivery({
        alertId: event.alertId,
        type: event.type,
        target: event.target,
        status: 'failed',
        message: event.message,
        error: errorMessage,
        attempt,
      });

      // Retry logic - up to 5 attempts
      if (attempt < 5) {
        const nextAttempt = attempt + 1;
        const delay = Math.pow(2, attempt) * 5000; // Exponential backoff: 5s, 10s, 20s, 40s

        retryAttempts.inc({
          channel: event.type,
          attempt: nextAttempt.toString(),
        });

        logger.warn(
          {
            alertId: event.alertId,
            nextAttempt,
            delay,
            maxAttempts: 5,
          },
          'Scheduling retry'
        );

        await retryQueue.add(
          'retry-alert',
          { ...event, attempt: nextAttempt },
          { delay }
        );
      } else {
        logger.error(
          { alertId: event.alertId, attempt },
          'Max retries reached'
        );
      }

      throw err; // Re-throw to mark job as failed in BullMQ
    }
  },
  {
    connection,
    concurrency: 10, // Process 10 alerts concurrently
    removeOnComplete: { count: 100 }, // Keep last 100 completed jobs
    removeOnFail: { count: 500 }, // Keep last 500 failed jobs for debugging
  }
);

worker.on('completed', (job) => {
  logger.debug({ jobId: job.id }, 'Job completed');
});

worker.on('failed', (job, err) => {
  logger.error({ jobId: job?.id, error: err.message }, 'Job failed');
});

worker.on('error', (err) => {
  logger.error({ error: err.message }, 'Worker error');
});

logger.info('Alert consumer started - waiting for jobs...');
