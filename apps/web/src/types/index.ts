// Frontend-specific types
export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface Monitor {
  id: string;
  name: string;
  url: string;
  method: string;
  interval: number;
  timeout: number;
  expectedStatus: number;
  headers: Record<string, string>;
  body?: string;
  status: MonitorStatus;
  latency?: number;
  uptime?: number;
  lastCheckedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type MonitorStatus = 'UP' | 'DOWN' | 'UNKNOWN';

export interface CheckResult {
  id: string;
  monitorId: string;
  status: MonitorStatus;
  statusCode?: number;
  latency: number;
  error?: string;
  checkedAt: string;
}

export interface Incident {
  id: string;
  monitorId: string;
  monitorName?: string;
  status: 'ONGOING' | 'RESOLVED';
  startedAt: string;
  resolvedAt?: string;
  duration?: number;
}

export interface DashboardStats {
  totalMonitors: number;
  upMonitors: number;
  downMonitors: number;
  unknownMonitors: number;
  avgLatency: number;
  avgUptime: number;
  activeIncidents: number;
  totalIncidents24h: number;
}

export interface CreateMonitorInput {
  name: string;
  url: string;
  method?: string;
  interval?: number;
  timeout?: number;
  expectedStatus?: number;
  headers?: Record<string, string>;
  body?: string;
}

export interface UpdateMonitorInput {
  name?: string;
  url?: string;
  method?: string;
  interval?: number;
  timeout?: number;
  expectedStatus?: number;
  headers?: Record<string, string>;
  body?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface ApiError {
  message: string;
  code?: string;
  statusCode?: number;
}

// Re-export shared types for consistency
export type { Job, Alert, AlertEvent } from '@shared/types';
