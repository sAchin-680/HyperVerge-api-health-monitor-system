import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
}

export default function PageHeader({
  title,
  description,
  children,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn('flex items-center justify-between mb-8', className)}>
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">
          {title}
        </h1>
        {description && <p className="text-slate-400 mt-1">{description}</p>}
      </div>
      {children && <div className="flex items-center gap-4">{children}</div>}
    </div>
  );
}
