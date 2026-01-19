import { cn } from '@/lib/utils';

interface MonitorStatusBadgeProps {
  status: 'UP' | 'DOWN' | 'UNKNOWN';
  size?: 'sm' | 'md' | 'lg';
  showPulse?: boolean;
}

const statusStyles = {
  UP: {
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-400',
    dot: 'bg-emerald-500',
    border: 'border-emerald-500/20',
    shadow: 'shadow-[0_0_12px_rgba(16,185,129,0.2)]',
    label: 'Operational',
  },
  DOWN: {
    bg: 'bg-rose-500/10',
    text: 'text-rose-400',
    dot: 'bg-rose-500',
    border: 'border-rose-500/20',
    shadow: 'shadow-[0_0_12px_rgba(244,63,94,0.2)]',
    label: 'Down',
  },
  UNKNOWN: {
    bg: 'bg-slate-500/10',
    text: 'text-slate-400',
    dot: 'bg-slate-500',
    border: 'border-slate-500/20',
    shadow: '',
    label: 'Unknown',
  },
};

const sizeStyles = {
  sm: {
    container: 'px-2 py-0.5 text-xs',
    dot: 'w-1.5 h-1.5',
  },
  md: {
    container: 'px-2.5 py-1 text-sm',
    dot: 'w-2 h-2',
  },
  lg: {
    container: 'px-3 py-1.5 text-base',
    dot: 'w-2.5 h-2.5',
  },
};

export default function MonitorStatusBadge({
  status,
  size = 'md',
  showPulse = true,
}: MonitorStatusBadgeProps) {
  const styles = statusStyles[status];
  const sizes = sizeStyles[size];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 rounded-full font-medium border transition-all duration-200',
        styles.bg,
        styles.text,
        styles.border,
        styles.shadow,
        sizes.container
      )}
    >
      <span className="relative flex">
        <span className={cn('rounded-full', styles.dot, sizes.dot)} />
        {showPulse && status === 'UP' && (
          <span
            className={cn(
              'absolute rounded-full animate-ping opacity-75',
              styles.dot,
              sizes.dot
            )}
          />
        )}
        {showPulse && status === 'DOWN' && (
          <span
            className={cn(
              'absolute rounded-full animate-pulse opacity-75',
              styles.dot,
              sizes.dot
            )}
          />
        )}
      </span>
      {styles.label}
    </span>
  );
}
