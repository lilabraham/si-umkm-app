import React from "react";
import ChartCard from "./ChartCard";
import { ResponsiveContainer, PieChart, Pie, Tooltip, Legend, Cell } from "recharts";
import { FrequencyRow, toCsv } from "@/lib/stats";
import { downloadCsv } from "@/lib/csv";

type Props = {
  data: FrequencyRow[];
  title?: string;
  subtitle?: string;
  exportName?: string;
  loading?: boolean;
};

const palette = ["#6366f1","#22c55e","#f59e0b","#ef4444","#06b6d4","#a855f7","#84cc16","#e11d48"];

const CategoryPieChart: React.FC<Props> = ({
  data,
  title = "Proporsi Produk per Kategori",
  subtitle,
  exportName = "pie_kategori.csv",
  loading,
}) => {
  const chartData = data.map((d) => ({ name: d.key, value: d.count }));
  const onExport = () => downloadCsv(exportName, toCsv(chartData, ["name", "value"]));

  return (
    <ChartCard title={title} subtitle={subtitle} onExport={onExport} loading={loading}>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={chartData} dataKey="value" nameKey="name" outerRadius="80%" label>
              {chartData.map((_, i) => <Cell key={i} fill={palette[i % palette.length]} />)}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
};

export default CategoryPieChart;
