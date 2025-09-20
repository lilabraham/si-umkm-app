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
  title = "Price Distribution (Histogram)",
  subtitle,
  exportName = "histogram_harga.csv",
  loading,
}) => {
  const chartData = bins.map((b) => ({ range: `Rp${formatIDR(b.binStart)}–Rp${formatIDR(b.binEnd)}`, freq: b.count }));
  const onExport = () => downloadCsv(exportName, toCsv(chartData, ["range", "freq"]));

  return (
    <ChartCard title={title} subtitle={subtitle} onExport={onExport} loading={loading}>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 28 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,.15)" />
            <XAxis dataKey="range" angle={-10} textAnchor="end" height={48} tick={{ fill: "#333" }} stroke="#333" />
            <YAxis tick={{ fill: "#333" }} stroke="#333" />
            <Tooltip />
            <Legend />
            {/* warna: teal lembut */}
            <Bar dataKey="freq" name="Frequency" fill="#2CB1A5" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
};

export default PriceHistogram;
