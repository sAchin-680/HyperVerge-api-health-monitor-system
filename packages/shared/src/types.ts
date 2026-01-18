export interface Job {
  id: string;
  url: string;
  interval: number;
}

export interface Alert {
  url: string;
  status: 'UP' | 'DOWN';
  responseTime: number;
}

// Alert Event Contract for Notifier Service
export type AlertEvent = {
  alertId: string;
  userId: string;
  type: 'email' | 'webhook';
  target: string; // email address or webhook URL
  message: string;
  attempt?: number;
};
