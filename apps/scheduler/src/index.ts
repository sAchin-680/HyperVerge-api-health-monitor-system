import { redis } from './redis';
import { Job } from '../../../packages/shared/src/types';

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

function createJob(): Job & { timestamp: string } {
  return {
    id: crypto.randomUUID(),
    url: getRandom(JOB_URLS),
    interval: getRandom(JOB_INTERVALS),
    timestamp: new Date().toISOString(),
  };
}

async function queueJob() {
  if (isShuttingDown) return;
  const job = createJob();
  try {
    await redis.lpush('jobs', JSON.stringify(job));
    jobCount++;
    console.log(`\x1b[32m[SCHEDULER] Job queued (#${jobCount}):\x1b[0m`, job);
  } catch (error) {
    console.error(`\x1b[31m[SCHEDULER] Failed to queue job:\x1b[0m`, error);
  }
}

function logStats() {
  console.log(
    `\x1b[34m[SCHEDULER] Total jobs queued so far: ${jobCount}\x1b[0m`
  );
}

function gracefulShutdown() {
  isShuttingDown = true;
  console.log('\x1b[33m[SCHEDULER] Shutting down gracefully...\x1b[0m');
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
