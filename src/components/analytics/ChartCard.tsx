import { ReactNode } from "react";
import { Download } from "lucide-react";

type Props = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  onExport?: () => void;
  loading?: boolean;
};

export default function ChartCard({ title, subtitle, children, onExport, loading }: Props) {
  return (
    <div className="rounded-2xl bg-white dark:bg-zinc-900 ring-1 ring-zinc-200/70 dark:ring-zinc-800 shadow-sm hover:shadow-md transition-shadow">
      <header className="flex items-start justify-between p-4 border-b border-zinc-200/60 dark:border-zinc-800">
        <div>
          <h3 className="text-base font-semibold">{title}</h3>
          {subtitle && <p className="text-sm text-zinc-500 mt-0.5">{subtitle}</p>}
        </div>
        {onExport && (
          <button
            onClick={onExport}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm bg-blue-600 text-white hover:bg-blue-700 active:scale-[.98]"
          >
            <Download size={16} /> Unduh CSV
          </button>
        )}
      </header>
      <div className="p-4">
        {loading ? (
          <div className="h-72 w-full rounded-xl bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
        ) : (
          children
        )}
      </div>
    </div>
  );
}
