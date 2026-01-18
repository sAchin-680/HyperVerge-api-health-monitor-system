import './queue/consumer';

console.log('🚀 Notifier Service running');
console.log("📬 Listening for alert events on 'alerts' queue");
console.log(
  '🔄 Retry logic enabled with exponential backoff (up to 5 attempts)'
);
console.log('📊 Delivery logging enabled');
