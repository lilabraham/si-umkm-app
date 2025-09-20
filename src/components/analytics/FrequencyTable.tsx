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
  title = "Frequency Table",
  subtitle,
  rows,
  exportName = "frequency.csv",
  loading,
}) => {
  const onExport = () => {
    const csv = toCsv(rows.map((r) => ({ category: r.key, count: r.count })), ["category", "count"]);
    downloadCsv(exportName, csv);
  };

  return (
    <ChartCard title={title} subtitle={subtitle} onExport={onExport} loading={loading}>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-[#333]/80">
              <th className="px-3 py-2 font-medium">Category</th>
              <th className="px-3 py-2 font-medium">Count</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5">
            {rows.map((r) => (
              <tr key={r.key} className="hover:bg-black/[.03]">
                <td className="px-3 py-2">{r.key}</td>
                <td className="px-3 py-2 font-semibold">{r.count}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td className="px-3 py-4 text-[#333]/60" colSpan={2}>No data.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </ChartCard>
  );
};

export default FrequencyTable;
