// index.ts - Entry point re-exports
// Note: The actual worker is started via worker.ts (see Dockerfile)
// This file is kept for package.json compatibility

export { executeCheck } from './checkExecutor';
export { evaluateState } from './stateEvaluator';
export { handleIncident } from './incidentManager';
export { monitorQueue, connection, connectRedis } from './redis';
export { prisma, connectDb } from './db';
export type { MonitorJob, CheckResult } from './types';
