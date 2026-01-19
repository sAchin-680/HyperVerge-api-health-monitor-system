'use client';

import { use } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PageHeader from '@/components/layout/PageHeader';
import MonitorForm from '@/components/monitors/MonitorForm';
import { useMonitor } from '@/hooks/useMonitors';

interface EditMonitorPageProps {
  params: Promise<{ id: string }>;
}

export default function EditMonitorPage({ params }: EditMonitorPageProps) {
  const { id } = use(params);
  const { data: monitor, isLoading } = useMonitor(id);

  if (isLoading) {
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
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            The monitor you are looking for does not exist.
          </p>
          <Button asChild className="mt-4">
            <Link href="/monitors">Back to Monitors</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/monitors/${id}`}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Link>
        </Button>
      </div>

      <PageHeader
        title={`Edit: ${monitor.name}`}
        description="Update your monitor configuration"
      />

      <div className="max-w-2xl">
        <MonitorForm monitor={monitor} mode="edit" />
      </div>
    </div>
  );
}
