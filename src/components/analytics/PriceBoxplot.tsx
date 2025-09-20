import React from "react";
import ChartCard from "./ChartCard";
import { BoxByCategory, formatIDR, toCsv } from "@/lib/stats";
import { downloadCsv } from "@/lib/csv";

type Props = {
  data: BoxByCategory[];
  title?: string;
  subtitle?: string;
  exportName?: string;
  height?: number;
  loading?: boolean;
};

const MARGIN = { top: 12, right: 24, bottom: 52, left: 80 };

const PriceBoxplot: React.FC<Props> = ({
  data,
  title = "Price Box Plot by Category",
  subtitle,
  exportName = "boxplot_harga.csv",
  height = 360,
  loading,
}) => {
  const onExport = () => {
    const rows = data.map((d) => ({
      category: d.category,
      min: Math.round(d.stats.min),
      q1: Math.round(d.stats.q1),
      median: Math.round(d.stats.median),
      q3: Math.round(d.stats.q3),
      max: Math.round(d.stats.max),
      n: d.stats.count,
    }));
    downloadCsv(exportName, toCsv(rows, ["category", "min", "q1", "median", "q3", "max", "n"]));
  };

  return (
    <ChartCard title={title} subtitle={subtitle} onExport={onExport} loading={loading}>
      {data.length === 0 ? (
        <p className="text-sm text-[#333]/70">No data.</p>
      ) : (
        <div className="overflow-x-auto">
          <svg width={980} height={height} role="img" aria-label="Boxplot per kategori" className="text-[#333]">
            <g>
              <text x={490} y={height - 8} textAnchor="middle" className="fill-current text-sm">Category</text>
              <text x={18} y={height / 2} transform={`rotate(-90,18,${height / 2})`} textAnchor="middle" className="fill-current text-sm">Price (Rp)</text>
            </g>

            {(() => {
              const width = 980;
              const innerW = width - MARGIN.left - MARGIN.right;
              const innerH = height - MARGIN.top - MARGIN.bottom;
              const minV = Math.min(...data.map((d) => d.stats.min));
              const maxV = Math.max(...data.map((d) => d.stats.max));
              const xScale = (i: number) => (i + 0.5) * (innerW / data.length);
              const yScale = (v: number) => innerH - ((v - minV) / Math.max(1, maxV - minV)) * innerH;

              // grid
              const ticks = 5;
              const lines = [];
              for (let i = 0; i <= ticks; i++) {
                const val = minV + (i * (maxV - minV)) / ticks;
                const y = MARGIN.top + yScale(val);
                lines.push(
                  <g key={`grid-${i}`}>
                    <line x1={MARGIN.left} x2={width - MARGIN.right} y1={y} y2={y} stroke="rgba(0,0,0,.15)" />
                    <text x={MARGIN.left - 10} y={y + 4} textAnchor="end" className="fill-current text-xs">Rp{formatIDR(val)}</text>
                  </g>
                );
              }

              return (
                <>
                  {lines}
                  {data.map((d, i) => {
                    const cx = MARGIN.left + xScale(i);
                    const w = Math.min(44, innerW / data.length - 16);
                    const { min, q1, median, q3, max } = d.stats;
                    const yMin = MARGIN.top + yScale(min);
                    const yQ1 = MARGIN.top + yScale(q1);
                    const yMed = MARGIN.top + yScale(median);
                    const yQ3 = MARGIN.top + yScale(q3);
                    const yMax = MARGIN.top + yScale(max);

                    return (
                      <g key={d.category}>
                        {/* whiskers */}
                        <line x1={cx} x2={cx} y1={yMin} y2={yQ1} stroke="#333" />
                        <line x1={cx} x2={cx} y1={yQ3} y2={yMax} stroke="#333" />
                        <line x1={cx - w / 2} x2={cx + w / 2} y1={yMin} y2={yMin} stroke="#333" />
                        <line x1={cx - w / 2} x2={cx + w / 2} y1={yMax} y2={yMax} stroke="#333" />

                        {/* box (soft orange fill) */}
                        <rect x={cx - w / 2} y={yQ3} width={w} height={Math.max(1, yQ1 - yQ3)} fill="#F5A25D" fillOpacity={0.25} stroke="#F5A25D" />
                        {/* median */}
                        <line x1={cx - w / 2} x2={cx + w / 2} y1={yMed} y2={yMed} stroke="#F59E0B" />
                        {/* label kategori */}
                        <text x={cx} y={height - MARGIN.bottom / 2} textAnchor="middle" className="fill-current text-xs">{d.category}</text>
                      </g>
                    );
                  })}
                </>
              );
            })()}
          </svg>
        </div>
      )}
    </ChartCard>
  );
};

export default PriceBoxplot;
