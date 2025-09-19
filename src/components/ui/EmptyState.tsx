import { ReactNode } from 'react';

export default function EmptyState({
  icon, title, description,
}: { icon?: ReactNode; title: string; description?: string }) {
  return (
    <div className="p-8 text-center text-slate-500">
      {icon && <div className="mx-auto mb-2">{icon}</div>}
      <p className="font-medium text-slate-700">{title}</p>
      {description && <p className="text-sm mt-1">{description}</p>}
    </div>
  );
}
