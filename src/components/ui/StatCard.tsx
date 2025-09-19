// LOKASI FILE: src/components/ui/StatCard.tsx
import { ReactNode } from 'react';

export default function StatCard({
  icon,
  label,
  value,
  accent = 'blue', // 'blue' | 'emerald' | 'amber' | 'slate'
}: {
  icon: ReactNode;
  label: string;
  value: ReactNode;
  accent?: 'blue' | 'emerald' | 'amber' | 'slate';
}) {
  const color = {
    blue:   'text-blue-600 ring-blue-100',
    emerald:'text-emerald-600 ring-emerald-100',
    amber:  'text-amber-600 ring-amber-100',
    slate:  'text-slate-600 ring-slate-100',
  }[accent];

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-5 shadow-sm ring-1 ring-slate-100 transition hover:-translate-y-0.5 hover:shadow-md">
      <div className={`mb-3 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white ring-4 ${color}`}>
        {icon}
      </div>
      <div className="text-xs uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-1 text-3xl font-extrabold text-slate-900">{value}</div>

      {/* aksen lembut */}
      <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-slate-100/60 blur-2xl" />
    </div>
  );
}
