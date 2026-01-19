'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts';

interface UptimeChartProps {
  upCount: number;
  downCount: number;
  unknownCount: number;
}

const COLORS = {
  up: '#10b981',
  down: '#f43f5e',
  unknown: '#475569',
};

export default function UptimeChart({
  upCount,
  downCount,
  unknownCount,
}: UptimeChartProps) {
  const data = [
    { name: 'Up', value: upCount, color: COLORS.up },
    { name: 'Down', value: downCount, color: COLORS.down },
    { name: 'Unknown', value: unknownCount, color: COLORS.unknown },
  ].filter((item) => item.value > 0);

  const total = upCount + downCount + unknownCount;
  const uptimePercentage =
    total > 0 ? ((upCount / total) * 100).toFixed(1) : '100.0';

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Monitor Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[200px] relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <defs>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={75}
                paddingAngle={3}
                dataKey="value"
                stroke="none"
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    style={{ filter: 'url(#glow)' }}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(15, 23, 42, 0.95)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  boxShadow: '0 10px 40px -10px rgba(0,0,0,0.5)',
                }}
                itemStyle={{ color: '#e2e8f0' }}
              />
              <Legend
                wrapperStyle={{ paddingTop: '10px' }}
                formatter={(value) => (
                  <span style={{ color: '#94a3b8', fontSize: '12px' }}>
                    {value}
                  </span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
          <div
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            style={{ marginTop: '-20px' }}
          >
            <div className="text-center">
              <p className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                {uptimePercentage}%
              </p>
              <p className="text-xs text-slate-500">Uptime</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
