/**
 * Test script to send sample alerts to the notifier service
 * Run with: npx tsx test-notifier.ts
 */

import { Queue } from 'bullmq';

// Type definition matching shared types
type AlertEvent = {
  alertId: string;
  userId: string;
  type: 'email' | 'webhook';
  target: string;
  message: string;
  attempt?: number;
};

const connection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: Number(process.env.REDIS_PORT) || 6379,
};

const alertQueue = new Queue<AlertEvent>('alerts', { connection });

async function sendTestAlerts() {
  console.log('📤 Sending test alerts...\n');

  // Test 1: Email alert
  const emailAlert: AlertEvent = {
    alertId: `alert-${Date.now()}-email`,
    userId: 'test-user-1',
    type: 'email',
    target: 'test@example.com',
    message: '🚨 Test Alert: API endpoint https://api.example.com is DOWN',
  };

  await alertQueue.add('email-alert', emailAlert);
  console.log('✅ Queued email alert:', emailAlert.alertId);

  // Test 2: Webhook alert
  const webhookAlert: AlertEvent = {
    alertId: `alert-${Date.now()}-webhook`,
    userId: 'test-user-2',
    type: 'webhook',
    target: 'https://webhook.site/your-unique-url', // Replace with actual webhook URL
    message: '⚠️ Test Alert: Database latency exceeding threshold',
  };

  await alertQueue.add('webhook-alert', webhookAlert);
  console.log('✅ Queued webhook alert:', webhookAlert.alertId);

  // Test 3: Multiple alerts
  console.log('\n📦 Queuing batch of alerts...');

  for (let i = 1; i <= 5; i++) {
    const batchAlert: AlertEvent = {
      alertId: `batch-alert-${Date.now()}-${i}`,
      userId: `user-${i}`,
      type: i % 2 === 0 ? 'email' : 'webhook',
      target:
        i % 2 === 0 ? `user${i}@example.com` : 'https://webhook.site/test',
      message: `Batch test alert #${i}`,
    };

    await alertQueue.add(`batch-alert-${i}`, batchAlert);
  }

  console.log('✅ Queued 5 batch alerts');

  // Check queue status
  const waiting = await alertQueue.getWaitingCount();
  const active = await alertQueue.getActiveCount();
  const completed = await alertQueue.getCompletedCount();
  const failed = await alertQueue.getFailedCount();

  console.log('\n📊 Queue Status:');
  console.log(`   Waiting: ${waiting}`);
  console.log(`   Active: ${active}`);
  console.log(`   Completed: ${completed}`);
  console.log(`   Failed: ${failed}`);

  console.log(
    '\n✨ Test alerts sent! Check the notifier service logs for processing.'
  );
  console.log(
    "📝 Delivery logs will be saved to the 'deliveries' table in your database."
  );

  process.exit(0);
}

sendTestAlerts().catch((err) => {
  console.error('❌ Error sending test alerts:', err);
  process.exit(1);
});
