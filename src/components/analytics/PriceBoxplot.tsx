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

const MARGIN = { top: 12, right: 24, bottom: 48, left: 72 };

const PriceBoxplot: React.FC<Props> = ({
  data,
  title = "Boxplot Harga per Kategori",
  subtitle,
  exportName = "boxplot_harga.csv",
  height = 360,
  loading,
}) => {
  const onExport = () => {
    const rows = data.map((d) => ({
      kategori: d.category,
      min: Math.round(d.stats.min),
      q1: Math.round(d.stats.q1),
      median: Math.round(d.stats.median),
      q3: Math.round(d.stats.q3),
      max: Math.round(d.stats.max),
      n: d.stats.count,
    }));
    downloadCsv(exportName, toCsv(rows, ["kategori", "min", "q1", "median", "q3", "max", "n"]));
  };

  return (
    <ChartCard title={title} subtitle={subtitle} onExport={onExport} loading={loading}>
      {data.length === 0 ? (
        <p className="text-sm text-zinc-500">Tidak ada data.</p>
      ) : (
        <div className="overflow-x-auto">
          <svg width={900} height={height} role="img" aria-label="Boxplot harga per kategori" className="text-zinc-500 dark:text-zinc-300">
            <g>
              {/* Grid & Axis labels */}
              <text x={450} y={height - 8} textAnchor="middle" className="fill-current text-sm">Kategori</text>
              <text x={16} y={height / 2} textAnchor="middle" transform={`rotate(-90,16,${height / 2})`} className="fill-current text-sm">Harga (Rp)</text>
            </g>

            {(() => {
              const width = 900;
              const innerW = width - MARGIN.left - MARGIN.right;
              const innerH = height - MARGIN.top - MARGIN.bottom;
              const minV = Math.min(...data.map((d) => d.stats.min));
              const maxV = Math.max(...data.map((d) => d.stats.max));
              const xScale = (i: number) => (i + 0.5) * (innerW / data.length);
              const yScale = (v: number) => innerH - ((v - minV) / Math.max(1, maxV - minV)) * innerH;

              // grid horizontal
              const ticks = 5;
              const lines = [];
              for (let i = 0; i <= ticks; i++) {
                const val = minV + (i * (maxV - minV)) / ticks;
                const y = MARGIN.top + yScale(val);
                lines.push(
                  <g key={`grid-${i}`}>
                    <line x1={MARGIN.left} x2={width - MARGIN.right} y1={y} y2={y} className="stroke-current opacity-10" />
                    <text x={MARGIN.left - 8} y={y + 4} textAnchor="end" className="fill-current text-xs">Rp{formatIDR(val)}</text>
                  </g>
                );
              }

              return (
                <>
                  {lines}
                  {data.map((d, i) => {
                    const cx = MARGIN.left + xScale(i);
                    const w = Math.min(40, innerW / data.length - 12);
                    const { min, q1, median, q3, max } = d.stats;
                    const yMin = MARGIN.top + yScale(min);
                    const yQ1 = MARGIN.top + yScale(q1);
                    const yMed = MARGIN.top + yScale(median);
                    const yQ3 = MARGIN.top + yScale(q3);
                    const yMax = MARGIN.top + yScale(max);

                    return (
                      <g key={d.category}>
                        {/* whiskers */}
                        <line x1={cx} x2={cx} y1={yMin} y2={yQ1} className="stroke-current" />
                        <line x1={cx} x2={cx} y1={yQ3} y2={yMax} className="stroke-current" />
                        <line x1={cx - w / 2} x2={cx + w / 2} y1={yMin} y2={yMin} className="stroke-current" />
                        <line x1={cx - w / 2} x2={cx + w / 2} y1={yMax} y2={yMax} className="stroke-current" />

                        {/* box */}
                        <rect x={cx - w / 2} y={yQ3} width={w} height={Math.max(1, yQ1 - yQ3)} className="fill-current opacity-10 stroke-current" />
                        {/* median */}
                        <line x1={cx - w / 2} x2={cx + w / 2} y1={yMed} y2={yMed} className="stroke-current" />
                        {/* category label */}
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
