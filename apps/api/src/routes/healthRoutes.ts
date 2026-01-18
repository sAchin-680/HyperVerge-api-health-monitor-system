import { Router } from 'express';
import prisma from '../utils/prisma';
import { logger } from '../lib/logger';

const router = Router();

router.get('/health', async (req, res) => {
  const checks = {
    uptime: process.uptime(),
    database: 'unknown' as 'ok' | 'down' | 'unknown',
    timestamp: new Date().toISOString(),
    service: 'api',
  };

  // Check database connection
  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = 'ok';
  } catch (error) {
    checks.database = 'down';
    logger.error({ error, check: 'database' }, 'Database health check failed');
  }

  const healthy = checks.database === 'ok';

  res.status(healthy ? 200 : 503).json({
    status: healthy ? 'healthy' : 'unhealthy',
    checks,
  });
});

// Readiness check (Kubernetes-compatible)
router.get('/ready', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({ status: 'ready' });
  } catch (error) {
    logger.error({ error }, 'Readiness check failed');
    res.status(503).json({ status: 'not ready' });
  }
});

// Liveness check (Kubernetes-compatible)
router.get('/live', (req, res) => {
  res.status(200).json({ status: 'alive' });
});

export default router;
