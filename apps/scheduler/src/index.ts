import { redis } from './redis';
import { Job } from '../../../packages/shared/src/types';
import { logger } from './lib/logger';
import {
  activeMonitorsCount,
  jobsScheduled,
  schedulerCycleDuration,
  schedulingErrors,
} from './lib/metrics';
import { startHealthServer } from './health';

const MAX_RETRIES = 3;
const DEAD_LETTER_QUEUE = 'jobs:dead';
let failedJobs = 0;

// Configurable job parameters
const JOB_URLS = [
  'https://example.com',
  'https://api.hyperverge.co',
  'https://status.hyperverge.co',
];
const JOB_INTERVALS = [15, 30, 60];
const QUEUE_INTERVAL_MS = 5000;

let jobCount = 0;
let isShuttingDown = false;

function getRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function createJob(): Job & { timestamp: string; retries: number } {
  return {
    id: crypto.randomUUID(),
    url: getRandom(JOB_URLS),
    interval: getRandom(JOB_INTERVALS),
    timestamp: new Date().toISOString(),
    retries: 0,
  };
}

async function queueJob() {
  if (isShuttingDown) return;
  const job = createJob();
  let attempt = 0;

  const endTimer = schedulerCycleDuration.startTimer();

  while (attempt < MAX_RETRIES) {
    try {
      await redis.lpush('jobs', JSON.stringify(job));
      jobCount++;

      jobsScheduled.inc({ monitor_type: 'http' });
      endTimer();

      if (attempt > 0) {
        logger.warn({ job, attempt, jobCount }, 'Job queued after retry');
      } else {
        logger.info({ job, jobCount }, 'Job queued successfully');
      }
      return;
    } catch (error) {
      attempt++;
      job.retries = attempt;
      schedulingErrors.inc({ type: 'queue_push_failed' });
      logger.error({ job, attempt, error }, 'Failed to queue job');
      await new Promise((res) => setTimeout(res, 500 * attempt));
    }
  }

  // Dead-letter queue
  try {
    await redis.lpush(DEAD_LETTER_QUEUE, JSON.stringify(job));
    failedJobs++;
    schedulingErrors.inc({ type: 'moved_to_dlq' });
    logger.error({ job, failedJobs }, 'Job moved to dead-letter queue');
  } catch (err) {
    schedulingErrors.inc({ type: 'dlq_push_failed' });
    logger.fatal({ job, err }, 'Failed to move job to dead-letter queue');
  }
}

function logStats() {
  redis.llen('jobs').then((queueLen) => {
    redis.llen(DEAD_LETTER_QUEUE).then((deadLen) => {
      logger.info(
        {
          totalJobs: jobCount,
          failedJobs,
          queueLength: queueLen,
          deadLetterQueue: deadLen,
        },
        'Scheduler stats'
      );

      // Update metrics
      activeMonitorsCount.set(queueLen);
    });
  });
}

async function gracefulShutdown() {
  isShuttingDown = true;
  logger.warn('Shutting down gracefully...');
  await new Promise((res) => setTimeout(res, 1000));
  logStats();
  redis.quit(() => {
    logger.info('Redis connection closed. Exiting.');
    process.exit(0);
  });
}

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

// Start health server
startHealthServer();

logger.info(
  { intervalMs: QUEUE_INTERVAL_MS },
  'Scheduler started - queuing jobs'
);
setInterval(queueJob, QUEUE_INTERVAL_MS);
setInterval(logStats, 30000); // Log stats every 30 seconds
