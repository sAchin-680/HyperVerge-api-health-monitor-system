import { Queue } from 'bullmq';

const connection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: Number(process.env.REDIS_PORT) || 6379,
};

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
