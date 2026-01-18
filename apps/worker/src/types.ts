// types.ts
export type MonitorJob = {
  monitorId: string;
  url: string;
};

export type CheckResult = {
  status: 'up' | 'down';
  statusCode: number | null;
  latency: number;
  error?: string;
};
