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
  title = "Products by Category",
  subtitle,
  exportName = "bar_kategori.csv",
  loading,
}) => {
  const chartData = data.map((d) => ({ kategori: d.key, jumlah: d.count }));
  const onExport = () => downloadCsv(exportName, toCsv(chartData, ["kategori", "jumlah"]));

  return (
    <ChartCard title={title} subtitle={subtitle} onExport={onExport} loading={loading}>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 28 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,.15)" />
            <XAxis
              dataKey="kategori"
              angle={-10}
              textAnchor="end"
              height={46}
              tick={{ fill: "#333" }}
              stroke="#333"
            />
            <YAxis tick={{ fill: "#333" }} stroke="#333" />
            <Tooltip />
            <Legend />
            {/* warna: soft blue */}
            <Bar dataKey="jumlah" name="Jumlah Produk" fill="#4A90E2" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
};

export default BarCategoryChart;
