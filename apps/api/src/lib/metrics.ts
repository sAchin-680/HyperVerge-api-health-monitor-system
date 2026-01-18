import client from 'prom-client';

export const register = new client.Registry();

// Collect default metrics (CPU, memory, event loop lag, etc.)
client.collectDefaultMetrics({ register });

// HTTP request duration histogram
export const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status'],
  buckets: [0.1, 0.3, 0.5, 1, 2, 5], // Response time buckets in seconds
});

register.registerMetric(httpRequestDuration);

// HTTP request counter
export const httpRequestTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status'],
});

register.registerMetric(httpRequestTotal);

// Active monitors gauge
export const activeMonitors = new client.Gauge({
  name: 'active_monitors_total',
  help: 'Total number of active monitors',
});

register.registerMetric(activeMonitors);
