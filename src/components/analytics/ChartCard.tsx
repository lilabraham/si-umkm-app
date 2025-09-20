import { ReactNode } from "react";
import { Download } from "lucide-react";

type Props = {
  title: string;            // 18px (text-lg)
  subtitle?: string;        // 14px (text-sm)
  children: ReactNode;
  onExport?: () => void;
  loading?: boolean;
};

export default function ChartCard({ title, subtitle, children, onExport, loading }: Props) {
  return (
    <div className="rounded-xl bg-white shadow-[0_8px_24px_rgba(0,0,0,0.06)] ring-1 ring-black/5">
      <header className="flex items-start justify-between p-4 border-b border-black/5">
        <div>
          <h3 className="text-lg font-semibold">{title}</h3>
          {subtitle && <p className="text-sm text-[#333]/70 mt-0.5">{subtitle}</p>}
        </div>
        {onExport && (
          <button
            onClick={onExport}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm bg-[#4A90E2] text-white hover:bg-[#3C7AC2] active:scale-[.98]"
          >
            <Download size={16} /> Download CSV
          </button>
        )}
      </header>
      <div className="p-4">
        {loading ? (
          <div className="h-80 w-full rounded-xl bg-zinc-100 animate-pulse" />
        ) : (
          children
        )}
      </div>
    </div>
  );
}
