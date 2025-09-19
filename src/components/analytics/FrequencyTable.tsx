import React from "react";
import ChartCard from "./ChartCard";
import { FrequencyRow, toCsv } from "@/lib/stats";
import { downloadCsv } from "@/lib/csv";

type Props = {
  title?: string;
  subtitle?: string;
  rows: FrequencyRow[];
  exportName?: string;
  loading?: boolean;
};

const FrequencyTable: React.FC<Props> = ({
  title = "Tabel Frekuensi",
  subtitle,
  rows,
  exportName = "frequency.csv",
  loading,
}) => {
  const onExport = () => {
    const csv = toCsv(rows.map((r) => ({ kategori: r.key, jumlah: r.count })), ["kategori", "jumlah"]);
    downloadCsv(exportName, csv);
  };

  return (
    <ChartCard title={title} subtitle={subtitle} onExport={onExport} loading={loading}>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-zinc-600 dark:text-zinc-300">
              <th className="px-3 py-2 font-medium">Kategori</th>
              <th className="px-3 py-2 font-medium">Jumlah Produk</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {rows.map((r) => (
              <tr key={r.key} className="hover:bg-zinc-50/60 dark:hover:bg-zinc-800/50">
                <td className="px-3 py-2">{r.key}</td>
                <td className="px-3 py-2 font-semibold">{r.count}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td className="px-3 py-4 text-zinc-500" colSpan={2}>Tidak ada data.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </ChartCard>
  );
};

export default FrequencyTable;
