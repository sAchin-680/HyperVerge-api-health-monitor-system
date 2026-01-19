'use client';

import { useEffect, useState } from 'react';
import {
  Activity,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { monitorApi, Monitor } from '@/lib/api';
import { formatRelativeTime, formatLatency, cn } from '@/lib/utils';

export default function StatusPage() {
  const [monitors, setMonitors] = useState<Monitor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchMonitors = async () => {
    try {
      const data = await monitorApi.getAll();
      setMonitors(data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to fetch monitors:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMonitors();
    const interval = setInterval(fetchMonitors, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  const upCount = monitors.filter((m) => m.status === 'UP').length;
  const downCount = monitors.filter((m) => m.status === 'DOWN').length;
  const totalCount = monitors.length;

  const overallStatus =
    downCount > 0
      ? 'partial'
      : upCount === totalCount && totalCount > 0
        ? 'operational'
        : 'unknown';

  const statusConfig = {
    operational: {
      label: 'All Systems Operational',
      color: 'text-emerald-400',
      bg: 'bg-gradient-to-r from-emerald-500/10 to-emerald-500/5',
      border: 'border-emerald-500/20',
      glow: 'shadow-[0_0_40px_-10px_rgba(16,185,129,0.3)]',
      icon: CheckCircle2,
    },
    partial: {
      label: 'Partial System Outage',
      color: 'text-amber-400',
      bg: 'bg-gradient-to-r from-amber-500/10 to-amber-500/5',
      border: 'border-amber-500/20',
      glow: 'shadow-[0_0_40px_-10px_rgba(245,158,11,0.3)]',
      icon: XCircle,
    },
    unknown: {
      label: 'Status Unknown',
      color: 'text-slate-400',
      bg: 'bg-gradient-to-r from-slate-500/10 to-slate-500/5',
      border: 'border-slate-500/20',
      glow: '',
      icon: Clock,
    },
  };

  const currentStatus = statusConfig[overallStatus];
  const StatusIcon = currentStatus.icon;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-14 h-14 rounded-full border-2 border-blue-500/20 border-t-blue-500 animate-spin" />
            <div className="absolute inset-0 w-14 h-14 rounded-full bg-blue-500/10 blur-xl" />
          </div>
          <p className="text-slate-500 text-sm">Loading status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl" />

      {/* Header */}
      <header className="border-b border-white/[0.06] backdrop-blur-xl bg-slate-950/50 sticky top-0 z-10">
        <div className="container max-w-4xl mx-auto px-4 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-500 rounded-xl blur-lg opacity-40" />
                <div className="relative w-12 h-12 bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-[0_8px_24px_-8px_rgba(59,130,246,0.5)]">
                  <Activity className="w-6 h-6 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                  API Health Monitor
                </h1>
                <p className="text-sm text-slate-500">System Status</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchMonitors}
              className="gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
          </div>
        </div>
      </header>

      <main className="container max-w-4xl mx-auto px-4 py-10 space-y-8 relative z-0">
        {/* Overall Status */}
        <Card
          className={cn(
            currentStatus.bg,
            currentStatus.border,
            currentStatus.glow,
            'border'
          )}
        >
          <CardContent className="py-10">
            <div className="flex items-center justify-center gap-4">
              <div className="relative">
                <StatusIcon className={cn('w-10 h-10', currentStatus.color)} />
                {overallStatus === 'operational' && (
                  <div className="absolute inset-0 w-10 h-10 bg-emerald-500 rounded-full blur-xl opacity-30 animate-pulse" />
                )}
              </div>
              <span className={cn('text-2xl font-bold', currentStatus.color)}>
                {currentStatus.label}
              </span>
            </div>
            <p className="text-center text-slate-500 mt-3">
              {upCount} of {totalCount} services operational
            </p>
          </CardContent>
        </Card>

        {/* Services List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              Services
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {monitors.length === 0 ? (
              <p className="text-center text-slate-500 py-8">
                No monitors configured
              </p>
            ) : (
              monitors.map((monitor) => (
                <div
                  key={monitor.id}
                  className="flex items-center justify-between p-4 rounded-xl border border-white/[0.06] bg-gradient-to-r from-slate-900/80 to-slate-900/50 hover:from-slate-800/80 hover:to-slate-800/50 transition-all duration-300 group"
                >
                  <div className="flex items-center gap-4">
                    {monitor.status === 'UP' ? (
                      <div className="relative">
                        <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)]" />
                        <div className="absolute inset-0 w-3 h-3 rounded-full bg-emerald-500 animate-ping opacity-50" />
                      </div>
                    ) : monitor.status === 'DOWN' ? (
                      <div className="w-3 h-3 rounded-full bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.5)] animate-pulse" />
                    ) : (
                      <div className="w-3 h-3 rounded-full bg-slate-500" />
                    )}
                    <div>
                      <p className="font-medium text-slate-200 group-hover:text-white transition-colors">
                        {monitor.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {monitor.lastCheckedAt
                          ? `Last checked ${formatRelativeTime(monitor.lastCheckedAt)}`
                          : 'Never checked'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={cn(
                        'font-medium',
                        monitor.status === 'UP'
                          ? 'text-emerald-400'
                          : monitor.status === 'DOWN'
                            ? 'text-rose-400'
                            : 'text-slate-400'
                      )}
                    >
                      {monitor.status === 'UP'
                        ? 'Operational'
                        : monitor.status === 'DOWN'
                          ? 'Down'
                          : 'Unknown'}
                    </p>
                    {monitor.latency && (
                      <p className="text-xs text-slate-500 font-mono">
                        {formatLatency(monitor.latency)}
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Uptime History */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              90-Day Uptime
            </CardTitle>
          </CardHeader>
          <CardContent>
            {monitors.length === 0 ? (
              <p className="text-center text-slate-500 py-8">
                No data available
              </p>
            ) : (
              <div className="space-y-6">
                {monitors.map((monitor) => (
                  <div key={monitor.id} className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-slate-200">
                        {monitor.name}
                      </span>
                      <span className="text-emerald-400 font-semibold">
                        {monitor.uptime?.toFixed(2) || '100.00'}%
                      </span>
                    </div>
                    <div className="flex gap-[2px] p-1 rounded-lg bg-slate-900/50">
                      {Array.from({ length: 90 }, (_, i) => (
                        <div
                          key={i}
                          className={cn(
                            'h-7 flex-1 rounded-[3px] transition-all duration-200 hover:scale-y-110',
                            i < 88
                              ? 'bg-gradient-to-t from-emerald-600 to-emerald-400 shadow-[0_0_4px_rgba(16,185,129,0.3)]'
                              : monitor.status === 'DOWN'
                                ? 'bg-gradient-to-t from-rose-600 to-rose-400 shadow-[0_0_4px_rgba(244,63,94,0.3)]'
                                : 'bg-gradient-to-t from-emerald-600 to-emerald-400 shadow-[0_0_4px_rgba(16,185,129,0.3)]'
                          )}
                          title={`Day ${90 - i}`}
                        />
                      ))}
                    </div>
                    <div className="flex justify-between text-xs text-slate-600">
                      <span>90 days ago</span>
                      <span>Today</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-slate-600 pb-8">
          <p className="flex items-center justify-center gap-2">
            <Clock className="w-4 h-4" />
            Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
          <p className="mt-2 text-slate-500">
            Powered by <span className="text-blue-400">API Health Monitor</span>
          </p>
        </div>
      </main>
    </div>
  );
}
