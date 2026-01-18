// types.ts
export type MonitorJob = {
  monitorId: string;
  url: string;
};

export type CheckResult = {
  status: 'UP' | 'DOWN';
  statusCode: number | null;
  latency: number;
  error?: string;
};
