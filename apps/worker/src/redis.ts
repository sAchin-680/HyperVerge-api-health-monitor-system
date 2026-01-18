import { ConnectionOptions, Queue } from 'bullmq';
import IORedis from 'ioredis';

const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
export const connection = new IORedis(redisUrl, {
  maxRetriesPerRequest: null,
});

// Cast connection to satisfy BullMQ types (ioredis version mismatch)
export const monitorQueue = new Queue('monitor-queue', {
  connection: connection as unknown as ConnectionOptions,
});

export async function connectRedis() {
  // ioredis connects automatically, but you can check status if needed
  if (connection.status !== 'ready') {
    await new Promise((resolve, reject) => {
      connection.once('ready', resolve);
      connection.once('error', reject);
    });
  }
}
