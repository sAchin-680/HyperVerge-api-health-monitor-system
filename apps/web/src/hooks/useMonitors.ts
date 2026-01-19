'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  monitorApi,
  Monitor,
  CreateMonitorInput,
  UpdateMonitorInput,
} from '@/lib/api';

export function useMonitors() {
  return useQuery({
    queryKey: ['monitors'],
    queryFn: () => monitorApi.list(),
  });
}

export function useMonitor(id: string) {
  return useQuery({
    queryKey: ['monitors', id],
    queryFn: () => monitorApi.get(id),
    enabled: !!id,
  });
}

export function useMonitorResults(id: string, limit?: number) {
  return useQuery({
    queryKey: ['monitors', id, 'results', limit],
    queryFn: () => monitorApi.getResults(id, limit),
    enabled: !!id,
  });
}

export function useCreateMonitor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateMonitorInput) => monitorApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['monitors'] });
    },
  });
}

export function useUpdateMonitor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateMonitorInput }) =>
      monitorApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['monitors'] });
      queryClient.invalidateQueries({ queryKey: ['monitors', id] });
    },
  });
}

export function useDeleteMonitor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => monitorApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['monitors'] });
    },
  });
}

// Dashboard stats hook
export function useDashboardStats() {
  const { data: monitors, isLoading } = useMonitors();

  const stats = {
    totalMonitors: monitors?.length || 0,
    upMonitors: monitors?.filter((m) => m.status === 'UP').length || 0,
    downMonitors: monitors?.filter((m) => m.status === 'DOWN').length || 0,
    unknownMonitors:
      monitors?.filter((m) => m.status === 'UNKNOWN').length || 0,
    avgLatency:
      monitors && monitors.length > 0
        ? monitors.reduce((acc, m) => acc + (m.latency || 0), 0) /
          monitors.length
        : 0,
    avgUptime:
      monitors && monitors.length > 0
        ? monitors.reduce((acc, m) => acc + (m.uptime || 100), 0) /
          monitors.length
        : 100,
  };

  return { stats, isLoading };
}
