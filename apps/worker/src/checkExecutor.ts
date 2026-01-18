// checkExecutor.ts
import axios from 'axios';
import { CheckResult } from './types';

export async function executeCheck(url: string): Promise<CheckResult> {
  const start = Date.now();
  try {
    const response = await axios.get(url, {
      timeout: 5000,
      validateStatus: () => true,
    });
    const latency = Date.now() - start;
    return {
      status: response.status >= 200 && response.status < 400 ? 'UP' : 'DOWN',
      statusCode: response.status,
      latency,
    };
  } catch (err) {
    const latency = Date.now() - start;
    return {
      status: 'DOWN',
      statusCode: null,
      latency,
      error: 'NETWORK_ERROR',
    };
  }
}
