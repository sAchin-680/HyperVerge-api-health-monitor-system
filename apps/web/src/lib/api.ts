const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  headers?: Record<string, string>;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { method = 'GET', body, headers = {} } = options;

    if (body) {
      headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  get<T>(endpoint: string) {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  post<T>(endpoint: string, body: unknown) {
    return this.request<T>(endpoint, { method: 'POST', body });
  }

  put<T>(endpoint: string, body: unknown) {
    return this.request<T>(endpoint, { method: 'PUT', body });
  }

  patch<T>(endpoint: string, body: unknown) {
    return this.request<T>(endpoint, { method: 'PATCH', body });
  }

  delete<T>(endpoint: string) {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const api = new ApiClient(API_URL);

// Monitor endpoints
export const monitorApi = {
  list: () => api.get<Monitor[]>('/monitors'),
  getAll: () => api.get<Monitor[]>('/monitors'),
  get: (id: string) => api.get<Monitor>(`/monitors/${id}`),
  create: (data: CreateMonitorInput) => api.post<Monitor>('/monitors', data),
  update: (id: string, data: UpdateMonitorInput) =>
    api.patch<Monitor>(`/monitors/${id}`, data),
  delete: (id: string) => api.delete(`/monitors/${id}`),
  getResults: (id: string, limit?: number) =>
    api.get<CheckResult[]>(
      `/monitors/${id}/results${limit ? `?limit=${limit}` : ''}`
    ),
};

// Types for API
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
  status: 'UP' | 'DOWN' | 'UNKNOWN';
  latency?: number;
  uptime?: number;
  lastCheckedAt?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CheckResult {
  id: string;
  monitorId: string;
  status: 'UP' | 'DOWN';
  statusCode: number | null;
  latency: number;
  error: string | null;
  checkedAt: string;
}

export interface Incident {
  id: string;
  monitorId: string;
  status: 'ONGOING' | 'RESOLVED';
  startedAt: string;
  resolvedAt: string | null;
  createdAt: string;
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
