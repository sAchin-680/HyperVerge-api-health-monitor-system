import client from 'prom-client';

export const register = new client.Registry();

// Collect default metrics
client.collectDefaultMetrics({ register });

// Jobs scheduled counter
export const jobsScheduled = new client.Counter({
  name: 'scheduler_jobs_scheduled_total',
  help: 'Total number of jobs scheduled',
  labelNames: ['monitor_type'],
});

register.registerMetric(jobsScheduled);

// Scheduling errors
export const schedulingErrors = new client.Counter({
  name: 'scheduler_errors_total',
  help: 'Total number of scheduling errors',
  labelNames: ['type'],
});

register.registerMetric(schedulingErrors);

// Active monitors
export const activeMonitorsCount = new client.Gauge({
  name: 'scheduler_active_monitors_total',
  help: 'Total number of active monitors being scheduled',
});

register.registerMetric(activeMonitorsCount);

// Scheduler cycle duration
export const schedulerCycleDuration = new client.Histogram({
  name: 'scheduler_cycle_duration_seconds',
  help: 'Duration of scheduler cycle in seconds',
  buckets: [0.1, 0.5, 1, 2, 5, 10],
});

register.registerMetric(schedulerCycleDuration);
