'use client';

import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  TrendingUp,
  Zap,
} from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';
import StatCard from '@/components/dashboard/StatCard';
import LatencyChart from '@/components/dashboard/LatencyChart';
import UptimeChart from '@/components/dashboard/UptimeChart';
import IncidentTable from '@/components/dashboard/IncidentTable';
import { useDashboardStats, useMonitors } from '@/hooks/useMonitors';
import { formatLatency, formatUptime } from '@/lib/utils';

export default function DashboardPage() {
  const { data: monitors = [], isLoading: monitorsLoading } = useMonitors();
  const { stats, isLoading: statsLoading } = useDashboardStats();

  const isLoading = monitorsLoading || statsLoading;

  // Calculate stats from monitors if API doesn't provide them
  const calculatedStats = {
    totalMonitors: monitors.length,
    upMonitors: monitors.filter((m) => m.status === 'UP').length,
    downMonitors: monitors.filter((m) => m.status === 'DOWN').length,
    unknownMonitors: monitors.filter((m) => m.status === 'UNKNOWN').length,
    avgLatency:
      monitors.length > 0
        ? monitors.reduce((acc, m) => acc + (m.latency || 0), 0) /
          monitors.length
        : 0,
    avgUptime:
      monitors.length > 0
        ? monitors.reduce((acc, m) => acc + (m.uptime || 100), 0) /
          monitors.length
        : 100,
  };

  const displayStats = stats || calculatedStats;

  // Generate mock latency data for chart
  const latencyData = Array.from({ length: 24 }, (_, i) => ({
    time: `${i}:00`,
    latency: Math.floor(Math.random() * 100) + 50,
  }));

  // Mock incidents - in production this would come from API
  const recentIncidents = monitors
    .filter((m) => m.status === 'DOWN')
    .map((m) => ({
      id: m.id,
      monitorId: m.id,
      monitorName: m.name,
      status: 'ONGOING' as const,
      startedAt: m.lastCheckedAt || new Date().toISOString(),
      resolvedAt: null,
    }));

  if (isLoading) {
    return (
      <div className="space-y-8">
        <PageHeader
          title="Dashboard"
          description="Overview of your API health monitoring"
        />
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard"
        description="Overview of your API health monitoring"
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Monitors"
          value={displayStats.totalMonitors}
          description="Active monitoring endpoints"
          icon={Activity}
        />
        <StatCard
          title="Healthy"
          value={displayStats.upMonitors}
          description="Responding normally"
          icon={CheckCircle2}
          variant="success"
        />
        <StatCard
          title="Down"
          value={displayStats.downMonitors}
          description="Requires attention"
          icon={AlertTriangle}
          variant={displayStats.downMonitors > 0 ? 'danger' : 'default'}
        />
        <StatCard
          title="Avg Response Time"
          value={formatLatency(displayStats.avgLatency)}
          description="Across all monitors"
          icon={Zap}
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Avg Uptime"
          value={formatUptime(displayStats.avgUptime)}
          description="Last 30 days"
          icon={TrendingUp}
          variant="success"
        />
        <StatCard
          title="Unknown Status"
          value={displayStats.unknownMonitors}
          description="Pending first check"
          icon={Clock}
          variant="warning"
        />
        <StatCard
          title="Active Incidents"
          value={recentIncidents.length}
          description="Currently ongoing"
          icon={AlertTriangle}
          variant={recentIncidents.length > 0 ? 'warning' : 'default'}
        />
        <StatCard
          title="Checks Today"
          value="-"
          description="Total health checks"
          icon={Activity}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <LatencyChart data={latencyData} title="Response Time (24h)" />
        </div>
        <div>
          <UptimeChart
            upCount={displayStats.upMonitors}
            downCount={displayStats.downMonitors}
            unknownCount={displayStats.unknownMonitors}
          />
        </div>
      </div>

      {/* Incidents Table */}
      <IncidentTable incidents={recentIncidents} title="Active Incidents" />
    </div>
  );
}
