import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'relative inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 disabled:pointer-events-none disabled:opacity-50 overflow-hidden',
  {
    variants: {
      variant: {
        default:
          'bg-gradient-to-r from-blue-500 via-blue-600 to-blue-500 bg-[length:200%_100%] text-white shadow-[0_4px_20px_-4px_rgba(59,130,246,0.5),inset_0_1px_0_rgba(255,255,255,0.15)] hover:bg-[position:100%_0] hover:shadow-[0_8px_30px_-4px_rgba(59,130,246,0.6)] active:scale-[0.97] active:shadow-[0_2px_10px_-2px_rgba(59,130,246,0.4)]',
        destructive:
          'bg-gradient-to-r from-rose-500 via-rose-600 to-rose-500 bg-[length:200%_100%] text-white shadow-[0_4px_20px_-4px_rgba(244,63,94,0.5),inset_0_1px_0_rgba(255,255,255,0.15)] hover:bg-[position:100%_0] hover:shadow-[0_8px_30px_-4px_rgba(244,63,94,0.6)] active:scale-[0.97]',
        outline:
          'border border-white/10 bg-white/[0.03] text-white shadow-[0_2px_10px_-2px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.05)] hover:bg-white/[0.08] hover:border-blue-500/30 hover:shadow-[0_4px_20px_-4px_rgba(59,130,246,0.2)] active:scale-[0.97]',
        secondary:
          'bg-gradient-to-r from-slate-800 to-slate-700 text-slate-200 shadow-[0_2px_10px_-2px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.05)] hover:from-slate-700 hover:to-slate-600 active:scale-[0.97]',
        ghost:
          'text-slate-400 hover:bg-white/[0.06] hover:text-white hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]',
        link: 'text-blue-400 underline-offset-4 hover:underline hover:text-blue-300 hover:drop-shadow-[0_0_8px_rgba(59,130,246,0.4)]',
      },
      size: {
        default: 'h-11 px-6 py-2.5',
        sm: 'h-9 rounded-lg px-4 text-xs',
        lg: 'h-13 rounded-xl px-10 text-base',
        icon: 'h-11 w-11',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, children, ...props }, ref) => {
    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(
        children as React.ReactElement<{ className?: string }>,
        {
          className: cn(
            buttonVariants({ variant, size, className }),
            (children as React.ReactElement<{ className?: string }>).props
              .className
          ),
          ...props,
        }
      );
    }

    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';

export default Button;
export { Button, buttonVariants };
