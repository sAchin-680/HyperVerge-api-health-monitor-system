import { redis } from './redis';
import { Job } from '../../../packages/shared/src/types';

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
  let job = createJob();
  let attempt = 0;
  while (attempt < MAX_RETRIES) {
    try {
      await redis.lpush('jobs', JSON.stringify(job));
      jobCount++;
      if (attempt > 0) {
        console.log(
          `\x1b[33m[SCHEDULER] Job queued after retry (#${jobCount}):\x1b[0m`,
          job
        );
      } else {
        console.log(
          `\x1b[32m[SCHEDULER] Job queued (#${jobCount}):\x1b[0m`,
          job
        );
      }
      return;
    } catch (error) {
      attempt++;
      job.retries = attempt;
      console.error(
        `\x1b[31m[SCHEDULER] Failed to queue job (attempt ${attempt}):\x1b[0m`,
        error
      );
      await new Promise((res) => setTimeout(res, 500 * attempt));
    }
  }
  // Dead-letter queue
  try {
    await redis.lpush(DEAD_LETTER_QUEUE, JSON.stringify(job));
    failedJobs++;
    console.error(
      `\x1b[41m[SCHEDULER] Job moved to dead-letter queue:\x1b[0m`,
      job
    );
  } catch (err) {
    console.error(
      `\x1b[41m[SCHEDULER] Failed to move job to dead-letter queue:\x1b[0m`,
      err
    );
  }
}

function logStats() {
  redis.llen('jobs').then((queueLen) => {
    redis.llen(DEAD_LETTER_QUEUE).then((deadLen) => {
      console.log(
        `\x1b[34m[SCHEDULER] Total jobs queued: ${jobCount}, Failed jobs: ${failedJobs}, Queue length: ${queueLen}, Dead-letter: ${deadLen}\x1b[0m`
      );
    });
  });
}

async function gracefulShutdown() {
  isShuttingDown = true;
  console.log('\x1b[33m[SCHEDULER] Shutting down gracefully...\x1b[0m');
  await new Promise((res) => setTimeout(res, 1000));
  logStats();
  redis.quit(() => {
    console.log('\x1b[33m[SCHEDULER] Redis connection closed. Exiting.\x1b[0m');
    process.exit(0);
  });
}

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

console.log(
  `[SCHEDULER] Scheduler started. Queuing jobs every ${QUEUE_INTERVAL_MS / 1000} seconds.`
);
setInterval(queueJob, QUEUE_INTERVAL_MS);
setInterval(logStats, 30000); // Log stats every 30 seconds
