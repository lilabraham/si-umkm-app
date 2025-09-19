import { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export function Card({
  className,
  children,
}: { className?: string; children: ReactNode }) {
  return (
    <div className={cn('bg-white border border-slate-200 rounded-2xl shadow-card', className)}>
      {children}
    </div>
  );
}

export function CardBody({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn('p-4', className)}>{children}</div>;
}

export function CardHeader({
  title,
  subtitle,
  right,
}: { title: string; subtitle?: string; right?: ReactNode }) {
  return (
    <div className="flex items-center justify-between p-4 border-b border-slate-100">
      <div>
        <h3 className="font-semibold text-slate-800">{title}</h3>
        {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
      </div>
      {right}
    </div>
  );
}
