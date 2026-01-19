'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import MonitorStatusBadge from './MonitorStatusBadge';
import { formatLatency, formatRelativeTime } from '@/lib/utils';
import { Monitor } from '@/lib/api';
import {
  ExternalLink,
  MoreHorizontal,
  Pause,
  Play,
  Trash2,
  Activity,
} from 'lucide-react';

interface MonitorTableProps {
  monitors: Monitor[];
  onPause?: (id: string) => void;
  onResume?: (id: string) => void;
  onDelete?: (id: string) => void;
  isLoading?: boolean;
}

export default function MonitorTable({
  monitors,
  onPause,
  onResume,
  onDelete,
  isLoading = false,
}: MonitorTableProps) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-12">
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="relative">
              <div className="w-12 h-12 rounded-full border-2 border-blue-500/20 border-t-blue-500 animate-spin" />
              <div className="absolute inset-0 w-12 h-12 rounded-full bg-blue-500/10 blur-xl" />
            </div>
            <p className="text-slate-500 text-sm">Loading monitors...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (monitors.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 flex items-center justify-center">
            <Activity className="w-10 h-10 text-blue-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-200 mb-2">
            No monitors configured
          </h3>
          <p className="text-sm text-slate-500 mb-6">
            Create your first monitor to start tracking uptime
          </p>
          <Button asChild>
            <Link href="/monitors/new">Create Monitor</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="border-slate-800/50 hover:bg-transparent">
              <TableHead className="text-slate-400 font-medium">Name</TableHead>
              <TableHead className="text-slate-400 font-medium">URL</TableHead>
              <TableHead className="text-slate-400 font-medium">
                Status
              </TableHead>
              <TableHead className="text-slate-400 font-medium">
                Latency
              </TableHead>
              <TableHead className="text-slate-400 font-medium">
                Last Check
              </TableHead>
              <TableHead className="text-slate-400 font-medium">
                Uptime
              </TableHead>
              <TableHead className="w-[100px] text-slate-400 font-medium">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {monitors.map((monitor) => (
              <TableRow
                key={monitor.id}
                className="border-slate-800/30 hover:bg-gradient-to-r hover:from-blue-500/5 hover:to-transparent transition-all duration-200 group"
              >
                <TableCell>
                  <Link
                    href={`/monitors/${monitor.id}`}
                    className="font-medium text-slate-200 hover:text-blue-400 transition-colors"
                  >
                    {monitor.name}
                  </Link>
                </TableCell>
                <TableCell className="max-w-[200px] truncate text-slate-500 font-mono text-xs">
                  {monitor.url}
                </TableCell>
                <TableCell>
                  <MonitorStatusBadge
                    status={monitor.status as 'UP' | 'DOWN' | 'UNKNOWN'}
                    size="sm"
                  />
                </TableCell>
                <TableCell className="text-slate-400 font-mono text-sm">
                  {monitor.latency ? formatLatency(monitor.latency) : '-'}
                </TableCell>
                <TableCell className="text-slate-500">
                  {monitor.lastCheckedAt
                    ? formatRelativeTime(monitor.lastCheckedAt)
                    : 'Never'}
                </TableCell>
                <TableCell>
                  <span className="font-semibold text-emerald-400">
                    {monitor.uptime ? `${monitor.uptime.toFixed(2)}%` : '-'}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-0.5 opacity-60 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      asChild
                      className="h-8 w-8"
                    >
                      <Link href={`/monitors/${monitor.id}`}>
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                    </Button>
                    {monitor.status === 'UP' ? (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:text-amber-400"
                        onClick={() => onPause?.(monitor.id)}
                      >
                        <Pause className="w-4 h-4" />
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:text-emerald-400"
                        onClick={() => onResume?.(monitor.id)}
                      >
                        <Play className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 hover:text-rose-400"
                      onClick={() => onDelete?.(monitor.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
