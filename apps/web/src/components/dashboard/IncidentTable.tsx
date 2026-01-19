import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatRelativeTime } from '@/lib/utils';
import { ExternalLink, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface Incident {
  id: string;
  monitorId: string;
  monitorName: string;
  status: 'ONGOING' | 'RESOLVED';
  startedAt: string;
  resolvedAt: string | null;
}

interface IncidentTableProps {
  incidents: Incident[];
  title?: string;
}

export default function IncidentTable({
  incidents,
  title = 'Recent Incidents',
}: IncidentTableProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {incidents.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            </div>
            <p className="text-slate-300 font-medium">
              No incidents to display
            </p>
            <p className="text-sm mt-1 text-slate-500">
              All systems are operational
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-slate-800 hover:bg-transparent">
                <TableHead className="text-slate-400">Monitor</TableHead>
                <TableHead className="text-slate-400">Status</TableHead>
                <TableHead className="text-slate-400">Started</TableHead>
                <TableHead className="text-slate-400">Duration</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {incidents.map((incident) => {
                const duration = incident.resolvedAt
                  ? new Date(incident.resolvedAt).getTime() -
                    new Date(incident.startedAt).getTime()
                  : Date.now() - new Date(incident.startedAt).getTime();
                const durationMins = Math.floor(duration / 60000);

                return (
                  <TableRow
                    key={incident.id}
                    className="border-slate-800/50 hover:bg-slate-800/30 transition-colors"
                  >
                    <TableCell className="font-medium text-slate-200">
                      {incident.monitorName}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          incident.status === 'ONGOING'
                            ? 'destructive'
                            : 'success'
                        }
                        className="gap-1"
                      >
                        {incident.status === 'ONGOING' ? (
                          <AlertTriangle className="w-3 h-3" />
                        ) : (
                          <CheckCircle2 className="w-3 h-3" />
                        )}
                        {incident.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-400">
                      {formatRelativeTime(incident.startedAt)}
                    </TableCell>
                    <TableCell className="text-slate-400">
                      {durationMins < 60
                        ? `${durationMins}m`
                        : `${Math.floor(durationMins / 60)}h ${durationMins % 60}m`}
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/monitors/${incident.monitorId}`}
                        className="text-slate-500 hover:text-blue-400 transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
