import { Worker, Job } from 'bullmq';
import { sendEmail } from '../providers/email';
import { sendWebhook } from '../providers/webhook';
import { logDelivery } from '../services/delivery.service';
import { retryQueue } from './retryQueue';

// Type-only import to avoid runtime issues
type AlertEvent = {
  alertId: string;
  userId: string;
  type: 'email' | 'webhook';
  target: string;
  message: string;
  attempt?: number;
};

const connection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: Number(process.env.REDIS_PORT) || 6379,
};

export const worker = new Worker<AlertEvent>(
  'alerts',
  async (job: Job<AlertEvent>) => {
    const event = job.data;
    const attempt = event.attempt ?? 1;

    console.log(
      `[CONSUMER] Processing alert ${event.alertId} (attempt ${attempt})`
    );

    try {
      // Send notification based on type
      if (event.type === 'email') {
        await sendEmail(event.target, event.message);
        console.log(`[CONSUMER] ✅ Email sent to ${event.target}`);
      } else if (event.type === 'webhook') {
        await sendWebhook(event.target, event.message);
        console.log(`[CONSUMER] ✅ Webhook sent to ${event.target}`);
      }

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
      console.error(
        `[CONSUMER] ❌ Failed to send ${event.type} to ${event.target}:`,
        errorMessage
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

        console.log(
          `[CONSUMER] 🔄 Scheduling retry ${nextAttempt}/5 with ${delay}ms delay`
        );

        await retryQueue.add(
          'retry-alert',
          { ...event, attempt: nextAttempt },
          { delay }
        );
      } else {
        console.error(
          `[CONSUMER] ⚠️ Max retries reached for alert ${event.alertId}`
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
  console.log(`[WORKER] Job ${job.id} completed successfully`);
});

worker.on('failed', (job, err) => {
  console.error(`[WORKER] Job ${job?.id} failed:`, err.message);
});

worker.on('error', (err) => {
  console.error('[WORKER] Worker error:', err);
});

console.log('[WORKER] Alert consumer started, waiting for jobs...');
