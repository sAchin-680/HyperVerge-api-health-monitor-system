import { redis } from './redis';
import cron from 'node-cron';
import express from 'express';
import { Alert } from '../../../packages/shared/src/types';

// Scheduler: pushes dummy alerts to Redis every 10 seconds
function startScheduler() {
  cron.schedule('*/10 * * * * *', async () => {
    const alert: Alert = {
      url: 'https://api.healthcheck.com',
      status: Math.random() > 0.5 ? 'DOWN' : 'UP',
      timestamp: Date.now(),
    };
    await redis.lpush('alerts', JSON.stringify(alert));
    console.log('[SCHEDULER] Alert scheduled:', alert);
  });
}

// Worker: processes alerts from Redis
async function startWorker() {
  console.log('[WORKER] Waiting for alerts...');
  while (true) {
    const result = await redis.brpop('alerts', 0);
    const alert: Alert = JSON.parse(result![1]);
    if (alert.status === 'DOWN') {
      console.log(' ALERT:', alert.url, 'is DOWN');
    } else {
      console.log(' OK:', alert.url);
    }
  }
}

// Start Express server
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (_req, res) => {
  res.send('API Health Monitor System is running!');
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

startScheduler();

// Non-blocking worker loop
async function workerLoop() {
  const result = await redis.brpop('alerts', 0);
  const alert: Alert = JSON.parse(result![1]);
  if (alert.status === 'DOWN') {
    console.log('🚨 ALERT:', alert.url, 'is DOWN');
  } else {
    console.log('✅ OK:', alert.url);
  }
  setImmediate(workerLoop);
}

workerLoop();
