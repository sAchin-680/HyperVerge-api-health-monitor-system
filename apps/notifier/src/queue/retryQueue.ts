import { Queue } from 'bullmq';

// Parse REDIS_URL or fall back to host/port env vars
const getRedisConnection = () => {
  const redisUrl = process.env.REDIS_URL;
  if (redisUrl) {
    const url = new URL(redisUrl);
    return {
      host: url.hostname,
      port: Number(url.port) || 6379,
    };
  }
  return {
    host: process.env.REDIS_HOST || 'localhost',
    port: Number(process.env.REDIS_PORT) || 6379,
  };
};

const connection = getRedisConnection();

export const retryQueue = new Queue('alerts', {
  connection,
  defaultJobOptions: {
    delay: 5000, // 5s initial delay
    attempts: 1, // Single attempt per retry
    backoff: {
      type: 'exponential',
      delay: 5000, // Exponential backoff starting at 5s
    },
    removeOnComplete: true,
    removeOnFail: false,
  },
});
