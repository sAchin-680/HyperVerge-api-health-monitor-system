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
