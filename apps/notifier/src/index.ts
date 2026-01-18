import './queue/consumer';
import { logger } from './lib/logger';
import { startHealthServer } from './health';

// Start health server
startHealthServer();

logger.info('Notifier service running');
logger.info("Listening for alert events on 'alerts' queue");
logger.info('Retry logic enabled with exponential backoff (up to 5 attempts)');
logger.info('Delivery logging enabled');
