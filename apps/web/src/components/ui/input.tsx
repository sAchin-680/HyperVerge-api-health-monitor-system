import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-11 w-full rounded-xl border border-white/[0.08] bg-slate-900/50 px-4 py-2.5 text-sm text-white transition-all duration-300',
          'shadow-[inset_0_1px_2px_rgba(0,0,0,0.2),0_1px_0_rgba(255,255,255,0.02)]',
          'placeholder:text-slate-500',
          'hover:border-white/15 hover:bg-slate-900/70',
          'focus:outline-none focus:border-blue-500/50 focus:bg-slate-900/80',
          'focus:shadow-[0_0_0_3px_rgba(59,130,246,0.15),0_0_20px_-5px_rgba(59,130,246,0.3),inset_0_1px_2px_rgba(0,0,0,0.2)]',
          'file:border-0 file:bg-transparent file:text-sm file:font-medium',
          'disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export { Input };
