'use client';

import PageHeader from '@/components/layout/PageHeader';
import MonitorForm from '@/components/monitors/MonitorForm';

export default function NewMonitorPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="New Monitor"
        description="Create a new API health monitoring endpoint"
      />

      <div className="max-w-2xl">
        <MonitorForm mode="create" />
      </div>
    </div>
  );
}
