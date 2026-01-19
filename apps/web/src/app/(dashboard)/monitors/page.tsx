'use client';

import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PageHeader from '@/components/layout/PageHeader';
import MonitorTable from '@/components/monitors/MonitorTable';
import { useMonitors, useDeleteMonitor } from '@/hooks/useMonitors';

export default function MonitorsPage() {
  const { data: monitors = [], isLoading } = useMonitors();
  const deleteMonitor = useDeleteMonitor();

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this monitor?')) {
      await deleteMonitor.mutateAsync(id);
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Monitors"
        description="Manage your API health monitoring endpoints"
      >
        <Button asChild>
          <Link href="/monitors/new">
            <Plus className="w-4 h-4 mr-2" />
            New Monitor
          </Link>
        </Button>
      </PageHeader>

      <MonitorTable
        monitors={monitors}
        isLoading={isLoading}
        onDelete={handleDelete}
      />
    </div>
  );
}
