import { redis } from './redis';
import { Job, Alert } from '../../../packages/shared/src/types';
import { logger } from './lib/logger';
import { checksExecuted, checkDuration } from './lib/metrics';
import { startHealthServer } from './health';

async function checkWebsite(url: string): Promise<Alert> {
  const start = Date.now();
  const end = checkDuration.startTimer({ type: 'http' });

  try {
    const res = await fetch(url);
    const duration = Date.now() - start;
    const status = res.ok ? 'UP' : 'DOWN';

    end({ status: res.ok ? 'success' : 'failure' });
    checksExecuted.inc({
      status: res.ok ? 'success' : 'failure',
      type: 'http',
    });

    logger.info(
      { url, status, responseTime: duration, httpStatus: res.status },
      'Website check completed'
    );

    return {
      url,
      status,
      responseTime: duration,
    };
  } catch (error) {
    const duration = Date.now() - start;

    end({ status: 'failure' });
    checksExecuted.inc({ status: 'failure', type: 'http' });

    logger.error(
      { url, error, responseTime: duration },
      'Website check failed'
    );

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

async function startWorker() {
  logger.info('Worker starting - waiting for jobs...');

  while (true) {
    const result = await redis.brpop('jobs', 0);
    const job: Job = JSON.parse(result![1]);

    logger.info({ job }, 'Processing job');

    const alert = await checkWebsite(job.url);

    await redis.lpush('alerts', JSON.stringify(alert));

    logger.info({ alert }, 'Alert queued');
  }
}

async function main() {
  logger.info('Starting worker service...');

  // Start health check server
  startHealthServer();

  let client;
  try {
    client = createClient();
    client.on('error', (err) => logger.error({ err }, 'Redis client error'));
    await client.connect();
    logger.info('Connected to Redis');

    // Main job processing loop
    while (true) {
      try {
        const job = await client.blPop('jobQueue', 0);
        if (job) {
          logger.info({ job }, 'Received job from queue');
          await processJob(job);
          logger.info('Job processed successfully');
        }
      } catch (jobErr) {
        logger.error({ err: jobErr }, 'Error processing job');
      }
    }
  } catch (err) {
    logger.fatal({ err }, 'Fatal error in worker');
    process.exit(1);
  }
}

main();

startWorker();
