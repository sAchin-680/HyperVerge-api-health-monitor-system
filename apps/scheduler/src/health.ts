import express from 'express';
import prisma from './db';
import { redis } from './redis';
import { register } from './lib/metrics';
import { logger } from './lib/logger';

const app = express();
const PORT = process.env.SCHEDULER_PORT || 4002;

// Health check endpoint
app.get('/health', async (req, res) => {
  const checks = {
    uptime: process.uptime(),
    database: 'unknown' as 'ok' | 'down' | 'unknown',
    redis: 'unknown' as 'ok' | 'down' | 'unknown',
    timestamp: new Date().toISOString(),
    service: 'scheduler',
  };

  // Check database connection
  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = 'ok';
  } catch (error) {
    checks.database = 'down';
    logger.error({ error, check: 'database' }, 'Database health check failed');
  }

  // Check Redis connection
  try {
    await redis.ping();
    checks.redis = 'ok';
  } catch (error) {
    checks.redis = 'down';
    logger.error({ error, check: 'redis' }, 'Redis health check failed');
  }

  const healthy = checks.database === 'ok' && checks.redis === 'ok';

  res.status(healthy ? 200 : 503).json({
    status: healthy ? 'healthy' : 'unhealthy',
    checks,
  });
});

// Readiness check
app.get('/ready', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    await redis.ping();
    res.status(200).json({ status: 'ready' });
  } catch (error) {
    logger.error({ error }, 'Readiness check failed');
    res.status(503).json({ status: 'not ready' });
  }
});

// Liveness check
app.get('/live', (req, res) => {
  res.status(200).json({ status: 'alive' });
});

// Metrics endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

export function startHealthServer() {
  app.listen(PORT, () => {
    logger.info(
      { port: PORT },
      `Scheduler health server started on http://localhost:${PORT}`
    );
  });
}
