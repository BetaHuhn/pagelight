"use client";

import { useMemo } from "react";
import { Radar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  type ChartData,
  type ChartOptions,
} from "chart.js";
import { C } from "@/lib/theme";
import type { RadarChartProps as RadarChartDataProps } from "@/lib/types";

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

const FILL_ALPHAS = ["2a", "16", "0d"];
const BORDER_ALPHAS = ["ff", "99", "66"];

export type RadarChartProps = RadarChartDataProps & {
  accent: string;
  accentDim: string;
};

export function RadarChart({ axes, series, unit, accent, accentDim }: RadarChartProps) {
  const { data, options } = useMemo(() => {
    const data: ChartData<"radar"> = {
      labels: axes,
      datasets: series.map((s, i) => ({
        label: s.label,
        data: s.values,
        backgroundColor: `${i === 0 ? accent : accentDim}${FILL_ALPHAS[i] ?? "0d"}`,
        borderColor: `${i === 0 ? accent : accentDim}${BORDER_ALPHAS[i] ?? "55"}`,
        borderWidth: i === 0 ? 2 : 1.5,
        pointBackgroundColor: i === 0 ? accent : accentDim,
        pointBorderColor: C.surface,
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      })),
    };

    const options: ChartOptions<"radar"> = {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        r: {
          beginAtZero: true,
          grid: { color: C.border },
          angleLines: { color: C.border },
          pointLabels: {
            color: C.muted,
            font: { family: "'IBM Plex Mono', monospace", size: 10 },
          },
          ticks: { display: false, backdropColor: "transparent" },
        },
      },
      plugins: {
        legend: {
          display: series.length > 1,
          labels: {
            color: C.muted,
            font: { family: "'IBM Plex Mono', monospace", size: 10 },
            boxWidth: 10,
            padding: 16,
          },
        },
        tooltip: {
          callbacks: {
            label: (ctx) => `${ctx.dataset.label}: ${ctx.raw}${unit ? ` ${unit}` : ""}`,
          },
        },
      },
    };

    return { data, options };
  }, [axes, series, unit, accent, accentDim]);

  return (
    <div style={{ width: "100%", height: 300 }}>
      <Radar data={data} options={options} />
    </div>
  );
}
