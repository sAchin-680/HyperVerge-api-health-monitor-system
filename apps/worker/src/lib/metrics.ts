import client from 'prom-client';

export const register = new client.Registry();

// Collect default metrics
client.collectDefaultMetrics({ register });

// Monitor checks executed
export const checksExecuted = new client.Counter({
  name: 'monitor_checks_executed_total',
  help: 'Total number of monitor checks executed',
  labelNames: ['status', 'type'], // status: success/failure, type: http/ping
});

register.registerMetric(checksExecuted);

// Check execution duration
export const checkDuration = new client.Histogram({
  name: 'monitor_check_duration_seconds',
  help: 'Duration of monitor checks in seconds',
  labelNames: ['type', 'status'],
  buckets: [0.1, 0.5, 1, 2, 5, 10, 30],
});

register.registerMetric(checkDuration);

// Active workers
export const activeWorkers = new client.Gauge({
  name: 'active_workers_total',
  help: 'Number of active worker instances',
});

register.registerMetric(activeWorkers);

// Job queue size
export const queueSize = new client.Gauge({
  name: 'worker_queue_size',
  help: 'Number of jobs waiting in the queue',
});

register.registerMetric(queueSize);

// Incidents created
export const incidentsCreated = new client.Counter({
  name: 'incidents_created_total',
  help: 'Total number of incidents created',
  labelNames: ['severity'],
});

register.registerMetric(incidentsCreated);
