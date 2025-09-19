import React from "react";
import ChartCard from "./ChartCard";
import { ResponsiveContainer, BarChart, XAxis, YAxis, Tooltip, Legend, Bar, CartesianGrid } from "recharts";
import { Bin, toCsv, formatIDR } from "@/lib/stats";
import { downloadCsv } from "@/lib/csv";

type Props = {
  bins: Bin[];
  title?: string;
  subtitle?: string;
  exportName?: string;
  loading?: boolean;
};

const PriceHistogram: React.FC<Props> = ({
  bins,
  title = "Histogram Harga",
  subtitle,
  exportName = "histogram_harga.csv",
  loading,
}) => {
  const chartData = bins.map((b) => ({ rentang: `Rp${formatIDR(b.binStart)}–Rp${formatIDR(b.binEnd)}`, frekuensi: b.count }));
  const onExport = () => downloadCsv(exportName, toCsv(chartData, ["rentang", "frekuensi"]));

  return (
    <ChartCard title={title} subtitle={subtitle} onExport={onExport} loading={loading}>
      <div className="h-80 text-zinc-600 dark:text-zinc-300">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 24 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.15} />
            <XAxis dataKey="rentang" angle={-12} textAnchor="end" height={48} tick={{ fill: "currentColor" }} stroke="currentColor" />
            <YAxis tick={{ fill: "currentColor" }} stroke="currentColor" />
            <Tooltip />
            <Legend />
            <Bar dataKey="frekuensi" name="Frekuensi" fill="#10b981" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
};

export default PriceHistogram;
