import { redis } from './redis';
import { Job, Alert } from '../../../packages/shared/src/types';

async function checkWebsite(url: string): Promise<Alert> {
  const start = Date.now();

  try {
    const res = await fetch(url);
    return {
      url,
      status: res.ok ? 'UP' : 'DOWN',
      responseTime: Date.now() - start,
    };
  } catch {
    return {
      url,
      status: 'DOWN',
      responseTime: -1,
    };
  }
}

// Entry point for the worker app
import { createClient } from 'redis';
import { processJob } from './redis';

// Enhanced logging utility
const log = (message: string, ...args: any[]) => {
  console.log(`[Worker] ${new Date().toISOString()} - ${message}`, ...args);
};

async function startWorker() {
  console.log('[WORKER] Waiting for jobs...');

  while (true) {
    const result = await redis.brpop('jobs', 0);
    const job: Job = JSON.parse(result![1]);

    console.log('[WORKER] Processing job:', job);

    const alert = await checkWebsite(job.url);

    await redis.lpush('alerts', JSON.stringify(alert));

    console.log('[WORKER] Alert queued:', alert);
  }
}

async function main() {
  log('Starting worker...');
  let client;
  try {
    client = createClient();
    client.on('error', (err) => log('Redis Client Error', err));
    await client.connect();
    log('Connected to Redis');

    // Main job processing loop
    while (true) {
      try {
        const job = await client.blPop('jobQueue', 0);
        if (job) {
          log('Received job:', job);
          await processJob(job);
          log('Job processed successfully');
        }
      } catch (jobErr) {
        log('Error processing job', jobErr);
      }
    }
  } catch (err) {
    log('Fatal error in worker', err);
    process.exit(1);
  }
}

main();

startWorker();
