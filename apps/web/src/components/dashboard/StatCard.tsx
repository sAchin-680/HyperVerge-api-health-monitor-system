import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'default' | 'success' | 'warning' | 'danger';
}

const variantStyles = {
  default: {
    text: 'text-blue-400',
    bg: 'bg-gradient-to-br from-blue-500/20 to-blue-600/10',
    border: 'border-blue-500/20',
    icon: 'text-blue-400',
    glow: 'shadow-[0_8px_32px_-8px_rgba(59,130,246,0.3)]',
    hoverGlow: 'hover:shadow-[0_12px_40px_-8px_rgba(59,130,246,0.4)]',
  },
  success: {
    text: 'text-emerald-400',
    bg: 'bg-gradient-to-br from-emerald-500/20 to-emerald-600/10',
    border: 'border-emerald-500/20',
    icon: 'text-emerald-400',
    glow: 'shadow-[0_8px_32px_-8px_rgba(16,185,129,0.3)]',
    hoverGlow: 'hover:shadow-[0_12px_40px_-8px_rgba(16,185,129,0.4)]',
  },
  warning: {
    text: 'text-amber-400',
    bg: 'bg-gradient-to-br from-amber-500/20 to-amber-600/10',
    border: 'border-amber-500/20',
    icon: 'text-amber-400',
    glow: 'shadow-[0_8px_32px_-8px_rgba(245,158,11,0.3)]',
    hoverGlow: 'hover:shadow-[0_12px_40px_-8px_rgba(245,158,11,0.4)]',
  },
  danger: {
    text: 'text-rose-400',
    bg: 'bg-gradient-to-br from-rose-500/20 to-rose-600/10',
    border: 'border-rose-500/20',
    icon: 'text-rose-400',
    glow: 'shadow-[0_8px_32px_-8px_rgba(244,63,94,0.3)]',
    hoverGlow: 'hover:shadow-[0_12px_40px_-8px_rgba(244,63,94,0.4)]',
  },
};

export default function StatCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  variant = 'default',
}: StatCardProps) {
  const styles = variantStyles[variant];

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl border p-6 transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1',
        'bg-gradient-to-br from-slate-900/90 via-slate-900/80 to-slate-800/70',
        'backdrop-blur-xl',
        styles.border,
        styles.glow,
        styles.hoverGlow,
        'hover:border-opacity-40'
      )}
    >
      {/* Background decoration */}
      <div
        className={cn(
          'absolute -right-4 -top-4 w-24 h-24 rounded-full blur-2xl opacity-30',
          variant === 'default' && 'bg-blue-500',
          variant === 'success' && 'bg-emerald-500',
          variant === 'warning' && 'bg-amber-500',
          variant === 'danger' && 'bg-rose-500'
        )}
      />

      <div className="relative flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-slate-400">{title}</p>
          <p className={cn('text-3xl font-bold tracking-tight', styles.text)}>
            {value}
          </p>
          {description && (
            <p className="text-xs text-slate-500 mt-2">{description}</p>
          )}
          {trend && (
            <div
              className={cn(
                'inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-full text-xs font-medium',
                trend.isPositive
                  ? 'bg-emerald-500/10 text-emerald-400'
                  : 'bg-rose-500/10 text-rose-400'
              )}
            >
              <span>
                {trend.isPositive ? '+' : ''}
                {trend.value}%
              </span>
              <span className="text-slate-500">vs last week</span>
            </div>
          )}
        </div>
        <div
          className={cn(
            'w-12 h-12 rounded-xl flex items-center justify-center',
            styles.bg
          )}
        >
          <Icon className={cn('w-6 h-6', styles.icon)} />
        </div>
      </div>
    </div>
  );
}
