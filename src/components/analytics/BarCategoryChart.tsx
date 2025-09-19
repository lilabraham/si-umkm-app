import React from "react";
import ChartCard from "./ChartCard";
import { ResponsiveContainer, BarChart, XAxis, YAxis, Tooltip, Legend, Bar, CartesianGrid } from "recharts";
import { FrequencyRow, toCsv } from "@/lib/stats";
import { downloadCsv } from "@/lib/csv";

type Props = {
  data: FrequencyRow[];
  title?: string;
  subtitle?: string;
  exportName?: string;
  loading?: boolean;
};

const BarCategoryChart: React.FC<Props> = ({
  data,
  title = "Produk per Kategori",
  subtitle,
  exportName = "bar_kategori.csv",
  loading,
}) => {
  const chartData = data.map((d) => ({ kategori: d.key, jumlah: d.count }));
  const onExport = () => downloadCsv(exportName, toCsv(chartData, ["kategori", "jumlah"]));

  return (
    <ChartCard title={title} subtitle={subtitle} onExport={onExport} loading={loading}>
      <div className="h-80 text-zinc-600 dark:text-zinc-300">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 24 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.15} />
            <XAxis dataKey="kategori" angle={-12} textAnchor="end" height={48} tick={{ fill: "currentColor" }} stroke="currentColor" />
            <YAxis tick={{ fill: "currentColor" }} stroke="currentColor" />
            <Tooltip />
            <Legend />
            <Bar dataKey="jumlah" name="Jumlah Produk" fill="#6366f1" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
};

export default BarCategoryChart;
