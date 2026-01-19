'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Monitor, CreateMonitorInput, UpdateMonitorInput } from '@/lib/api';
import { useCreateMonitor, useUpdateMonitor } from '@/hooks/useMonitors';

interface MonitorFormProps {
  monitor?: Monitor;
  mode: 'create' | 'edit';
}

const HTTP_METHODS = [
  'GET',
  'POST',
  'PUT',
  'PATCH',
  'DELETE',
  'HEAD',
  'OPTIONS',
];
const INTERVALS = [
  { value: 30, label: '30 seconds' },
  { value: 60, label: '1 minute' },
  { value: 120, label: '2 minutes' },
  { value: 300, label: '5 minutes' },
  { value: 600, label: '10 minutes' },
  { value: 900, label: '15 minutes' },
  { value: 1800, label: '30 minutes' },
  { value: 3600, label: '1 hour' },
];

export default function MonitorForm({ monitor, mode }: MonitorFormProps) {
  const router = useRouter();
  const createMonitor = useCreateMonitor();
  const updateMonitor = useUpdateMonitor();

  const [formData, setFormData] = useState({
    name: monitor?.name || '',
    url: monitor?.url || '',
    method: monitor?.method || 'GET',
    interval: monitor?.interval || 60,
    timeout: monitor?.timeout || 30,
    expectedStatus: monitor?.expectedStatus || 200,
    headers: monitor?.headers ? JSON.stringify(monitor.headers, null, 2) : '{}',
    body: monitor?.body || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.url.trim()) {
      newErrors.url = 'URL is required';
    } else {
      try {
        new URL(formData.url);
      } catch {
        newErrors.url = 'Invalid URL format';
      }
    }

    try {
      JSON.parse(formData.headers);
    } catch {
      newErrors.headers = 'Invalid JSON format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    const data: CreateMonitorInput | UpdateMonitorInput = {
      name: formData.name,
      url: formData.url,
      method: formData.method,
      interval: formData.interval,
      timeout: formData.timeout,
      expectedStatus: formData.expectedStatus,
      headers: JSON.parse(formData.headers),
      body: formData.body || undefined,
    };

    try {
      if (mode === 'create') {
        await createMonitor.mutateAsync(data as CreateMonitorInput);
        router.push('/monitors');
      } else if (monitor) {
        await updateMonitor.mutateAsync({
          id: monitor.id,
          data: data as UpdateMonitorInput,
        });
        router.push(`/monitors/${monitor.id}`);
      }
    } catch (error) {
      console.error('Failed to save monitor:', error);
    }
  };

  const isSubmitting = createMonitor.isPending || updateMonitor.isPending;

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>
            {mode === 'create' ? 'Create Monitor' : 'Edit Monitor'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-slate-300">
                Name *
              </Label>
              <Input
                id="name"
                placeholder="My API Monitor"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
              {errors.name && (
                <p className="text-sm text-rose-400">{errors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="method" className="text-slate-300">
                HTTP Method
              </Label>
              <Select
                value={formData.method}
                onChange={(e) =>
                  setFormData({ ...formData, method: e.target.value })
                }
              >
                {HTTP_METHODS.map((method) => (
                  <option key={method} value={method}>
                    {method}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="url" className="text-slate-300">
              URL *
            </Label>
            <Input
              id="url"
              placeholder="https://api.example.com/health"
              value={formData.url}
              onChange={(e) =>
                setFormData({ ...formData, url: e.target.value })
              }
            />
            {errors.url && (
              <p className="text-sm text-rose-400">{errors.url}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="interval" className="text-slate-300">
                Check Interval
              </Label>
              <Select
                value={String(formData.interval)}
                onChange={(e) =>
                  setFormData({ ...formData, interval: Number(e.target.value) })
                }
              >
                {INTERVALS.map((interval) => (
                  <option key={interval.value} value={interval.value}>
                    {interval.label}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="timeout" className="text-slate-300">
                Timeout (seconds)
              </Label>
              <Input
                id="timeout"
                type="number"
                min={1}
                max={60}
                value={formData.timeout}
                onChange={(e) =>
                  setFormData({ ...formData, timeout: Number(e.target.value) })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expectedStatus" className="text-slate-300">
                Expected Status
              </Label>
              <Input
                id="expectedStatus"
                type="number"
                min={100}
                max={599}
                value={formData.expectedStatus}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    expectedStatus: Number(e.target.value),
                  })
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="headers" className="text-slate-300">
              Headers (JSON)
            </Label>
            <textarea
              id="headers"
              className="flex min-h-[100px] w-full rounded-xl border border-white/[0.08] bg-slate-900/50 px-4 py-3 text-sm text-white font-mono transition-all duration-300 placeholder:text-slate-500 focus:outline-none focus:border-blue-500/50 focus:bg-slate-900/80 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.15),0_0_20px_-5px_rgba(59,130,246,0.3)] hover:border-white/15 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder='{"Authorization": "Bearer token"}'
              value={formData.headers}
              onChange={(e) =>
                setFormData({ ...formData, headers: e.target.value })
              }
            />
            {errors.headers && (
              <p className="text-sm text-rose-400">{errors.headers}</p>
            )}
          </div>

          {['POST', 'PUT', 'PATCH'].includes(formData.method) && (
            <div className="space-y-2">
              <Label htmlFor="body" className="text-slate-300">
                Request Body
              </Label>
              <textarea
                id="body"
                className="flex min-h-[100px] w-full rounded-xl border border-white/[0.08] bg-slate-900/50 px-4 py-3 text-sm text-white font-mono transition-all duration-300 placeholder:text-slate-500 focus:outline-none focus:border-blue-500/50 focus:bg-slate-900/80 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.15),0_0_20px_-5px_rgba(59,130,246,0.3)] hover:border-white/15 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder='{"key": "value"}'
                value={formData.body}
                onChange={(e) =>
                  setFormData({ ...formData, body: e.target.value })
                }
              />
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? 'Saving...'
              : mode === 'create'
                ? 'Create Monitor'
                : 'Save Changes'}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
