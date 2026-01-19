import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'border-blue-500/20 bg-blue-500/10 text-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.15)] hover:bg-blue-500/20 hover:shadow-[0_0_15px_rgba(59,130,246,0.25)]',
        secondary:
          'border-slate-500/20 bg-slate-500/10 text-slate-400 hover:bg-slate-500/20',
        destructive:
          'border-rose-500/20 bg-rose-500/10 text-rose-400 shadow-[0_0_10px_rgba(244,63,94,0.15)] hover:bg-rose-500/20 hover:shadow-[0_0_15px_rgba(244,63,94,0.25)]',
        outline:
          'border-white/10 text-slate-300 hover:border-white/20 hover:bg-white/5',
        success:
          'border-emerald-500/20 bg-emerald-500/10 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.15)] hover:bg-emerald-500/20 hover:shadow-[0_0_15px_rgba(16,185,129,0.25)]',
        warning:
          'border-amber-500/20 bg-amber-500/10 text-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.15)] hover:bg-amber-500/20 hover:shadow-[0_0_15px_rgba(245,158,11,0.25)]',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
