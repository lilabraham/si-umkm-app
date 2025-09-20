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

const palette = ["#4A90E2", "#2CB1A5", "#F5A25D", "#60A5FA", "#22D3EE", "#FDBA74", "#93C5FD", "#34D399"];

const CategoryDonutChart: React.FC<Props> = ({
  data,
  title = "Product Proportion by Category",
  subtitle,
  exportName = "donut_kategori.csv",
  loading,
}) => {
  const chartData = data.map((d) => ({ name: d.key, value: d.count }));
  const onExport = () => downloadCsv(exportName, toCsv(chartData, ["name", "value"]));

  return (
    <ChartCard title={title} subtitle={subtitle} onExport={onExport} loading={loading}>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            {/* Donut: innerRadius untuk lubang tengah */}
            <Pie data={chartData} dataKey="value" nameKey="name" innerRadius="55%" outerRadius="80%" label>
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

export default CategoryDonutChart;
