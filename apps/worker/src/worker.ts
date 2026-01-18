// worker.ts
import { Worker } from 'bullmq';
import { executeCheck } from './checkExecutor';
import { evaluateState } from './stateEvaluator';
import { handleIncident } from './incidentManager';
import { connectRedis, monitorQueue } from './redis';
import { connectDb, prisma } from './db';
import { MonitorJob } from './types';

async function storeResult(
  monitorId: string,
  status: 'UP' | 'DOWN',
  statusCode: number | null,
  latency: number
) {
  await prisma.checkResult.create({
    data: {
      monitorId,
      status,
      statusCode,
      latencyMs: latency,
    },
  });
}

async function notify(monitorId: string, status: 'UP' | 'DOWN', event: string) {
  try {
    await fetch('http://notifier:4000/internal/incident', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ monitorId, status, event }),
    });
  } catch (err) {
    console.error('Notifier error:', err);
  }
}

async function main() {
  console.log('🚀 Starting worker service...');

  await connectRedis();
  console.log('✓ Connected to Redis');

  await connectDb();
  console.log('✓ Connected to Database');

  new Worker(
    'monitor-queue',
    async (job) => {
      const { monitorId, url } = job.data as MonitorJob;
      console.log(`📊 Processing check for monitor ${monitorId}: ${url}`);
      const result = await executeCheck(url);
      await storeResult(
        monitorId,
        result.status,
        result.statusCode,
        result.latency
      );
      console.log(`  Status: ${result.status}, Latency: ${result.latency}ms`);

      const evaluation = await evaluateState(monitorId, result.status);
      if (evaluation === 'STATE_CHANGED') {
        const incidentEvent = await handleIncident(monitorId, result.status);
        console.log(`  🚨 State changed: ${incidentEvent}`);
        if (
          incidentEvent === 'INCIDENT_CREATED' ||
          incidentEvent === 'INCIDENT_RESOLVED'
        ) {
          await notify(monitorId, result.status, incidentEvent);
          console.log(`  📧 Notification sent`);
        }
      }
    },
    {
      connection: monitorQueue.opts.connection,
      attempts: 3,
      backoff: { type: 'exponential', delay: 2000 },
    }
  );

  console.log('✓ Worker started and listening for jobs on monitor-queue');
}

main().catch((err) => {
  console.error('Worker fatal error:', err);
  process.exit(1);
});
