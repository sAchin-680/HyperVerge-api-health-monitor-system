import client from 'prom-client';

export const register = new client.Registry();

// Collect default metrics
client.collectDefaultMetrics({ register });

// Notifications sent counter
export const notificationsSent = new client.Counter({
  name: 'notifier_notifications_sent_total',
  help: 'Total number of notifications sent',
  labelNames: ['channel', 'status'], // channel: email/webhook, status: success/failure
});

register.registerMetric(notificationsSent);

// Notification delivery duration
export const notificationDuration = new client.Histogram({
  name: 'notifier_delivery_duration_seconds',
  help: 'Duration of notification delivery in seconds',
  labelNames: ['channel'],
  buckets: [0.1, 0.5, 1, 2, 5, 10],
});

register.registerMetric(notificationDuration);

// Queue size
export const notificationQueueSize = new client.Gauge({
  name: 'notifier_queue_size',
  help: 'Number of notifications waiting in the queue',
});

register.registerMetric(notificationQueueSize);

// Retry attempts
export const retryAttempts = new client.Counter({
  name: 'notifier_retry_attempts_total',
  help: 'Total number of delivery retry attempts',
  labelNames: ['channel', 'attempt'],
});

register.registerMetric(retryAttempts);

// Failed deliveries moved to DLQ
export const deadLetterQueueSize = new client.Gauge({
  name: 'notifier_dlq_size',
  help: 'Number of failed notifications in dead letter queue',
});

register.registerMetric(deadLetterQueueSize);
