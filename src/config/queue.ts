import { Queue, QueueOptions } from 'bullmq';
import IORedis from 'ioredis';

export const redisConnection = new IORedis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  maxRetriesPerRequest: null,
});

const queueOptions: QueueOptions = {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: parseInt(process.env.MAX_RETRIES || '3'),
    backoff: {
      type: 'exponential',
      delay: parseInt(process.env.RETRY_DELAY || '2000'),
    },
    removeOnComplete: {
      count: 100,
      age: 24 * 3600,
    },
    removeOnFail: {
      count: 1000,
    },
  },
};

export const evaluationQueue = new Queue('evaluation', queueOptions);

evaluationQueue.on('error', (error: Error) => {
  console.error('[Queue] Error:', error);
});

process.on('SIGTERM', async () => {
  console.log('[Queue] Closing queue...');
  await evaluationQueue.close();
  await redisConnection.quit();
});

export default evaluationQueue;
