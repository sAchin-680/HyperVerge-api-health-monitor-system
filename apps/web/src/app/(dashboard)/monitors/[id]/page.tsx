'use client';

import { use } from 'react';
import Link from 'next/link';
import { ArrowLeft, Edit, ExternalLink, Globe, Clock, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import PageHeader from '@/components/layout/PageHeader';
import MonitorStatusBadge from '@/components/monitors/MonitorStatusBadge';
import MonitorResultsHistory from '@/components/monitors/MonitorResultsHistory';
import LatencyChart from '@/components/dashboard/LatencyChart';
import { useMonitor, useMonitorResults } from '@/hooks/useMonitors';
import { formatLatency, formatUptime, formatRelativeTime } from '@/lib/utils';

interface MonitorDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function MonitorDetailPage({ params }: MonitorDetailPageProps) {
  const { id } = use(params);
  const { data: monitor, isLoading: monitorLoading } = useMonitor(id);
  const { data: results = [], isLoading: resultsLoading } =
    useMonitorResults(id);

  if (monitorLoading) {
    return (
      <div className="space-y-8">
        <PageHeader title="Loading..." />
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!monitor) {
    return (
      <div className="space-y-8">
        <PageHeader title="Monitor Not Found" />
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              The monitor you are looking for does not exist.
            </p>
            <Button asChild className="mt-4">
              <Link href="/monitors">Back to Monitors</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Generate latency chart data from results
  const latencyData = results
    .slice(0, 50)
    .reverse()
    .map((result) => ({
      time: new Date(result.checkedAt).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
      latency: result.latency,
    }));

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/monitors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Link>
        </Button>
      </div>

      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">{monitor.name}</h1>
            <MonitorStatusBadge
              status={monitor.status as 'UP' | 'DOWN' | 'UNKNOWN'}
              size="lg"
            />
          </div>
          <p className="text-muted-foreground mt-1 flex items-center gap-2">
            <Globe className="w-4 h-4" />
            {monitor.url}
          </p>
        </div>
        <Button asChild>
          <Link href={`/monitors/${id}/edit`}>
            <Edit className="w-4 h-4 mr-2" />
            Edit Monitor
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Check Interval</p>
                <p className="font-semibold">{monitor.interval}s</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <Zap className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Latency</p>
                <p className="font-semibold">
                  {formatLatency(monitor.latency || 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <ExternalLink className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Uptime</p>
                <p className="font-semibold text-green-500">
                  {formatUptime(monitor.uptime || 100)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                <Clock className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Last Check</p>
                <p className="font-semibold">
                  {monitor.lastCheckedAt
                    ? formatRelativeTime(monitor.lastCheckedAt)
                    : 'Never'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Configuration Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium">Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Method</p>
              <p className="font-medium">{monitor.method}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Timeout</p>
              <p className="font-medium">{monitor.timeout}s</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Expected Status</p>
              <p className="font-medium">{monitor.expectedStatus}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Headers</p>
              <p className="font-medium">
                {Object.keys(monitor.headers || {}).length} configured
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Latency Chart */}
      {latencyData.length > 0 && (
        <LatencyChart data={latencyData} title="Response Time History" />
      )}

      {/* Results History */}
      <MonitorResultsHistory results={results} isLoading={resultsLoading} />
    </div>
  );
}
