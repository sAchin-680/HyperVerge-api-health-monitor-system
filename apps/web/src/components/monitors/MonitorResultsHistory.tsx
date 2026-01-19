'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckResult } from '@/lib/api';
import { formatLatency, formatDateTime } from '@/lib/utils';
import { CheckCircle2, XCircle, Clock, Globe } from 'lucide-react';

interface MonitorDetailsCardProps {
  results: CheckResult[];
  isLoading?: boolean;
}

export default function MonitorResultsHistory({
  results,
  isLoading = false,
}: MonitorDetailsCardProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium">Check History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-medium">Check History</CardTitle>
      </CardHeader>
      <CardContent>
        {results.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No check results yet</p>
            <p className="text-sm mt-1">
              Results will appear after the first check runs
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {results.map((result) => (
              <div
                key={result.id}
                className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {result.status === 'UP' ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500" />
                  )}
                  <div>
                    <p className="font-medium">
                      {result.status === 'UP' ? 'Success' : 'Failed'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDateTime(result.checkedAt)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Globe className="w-4 h-4" />
                    <span>
                      {result.statusCode
                        ? `HTTP ${result.statusCode}`
                        : 'No response'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>{formatLatency(result.latency)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
