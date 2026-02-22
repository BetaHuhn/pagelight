"use client";

import { useMemo } from "react";
import { Bubble } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  Tooltip,
  type ChartData,
  type ChartOptions,
  type TooltipItem,
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { C } from "../../lib/theme";
import type { BubbleChartProps as BubbleChartDataProps } from "../../lib/articleTypes";

ChartJS.register(LinearScale, PointElement, Tooltip, ChartDataLabels);

type BubblePoint = {
  x: number;
  y: number;
  r: number;
  label: string;
  value: number;
};

export type BubbleChartProps = BubbleChartDataProps & {
  accent: string;
  accentDim: string;
};

type DataLabelsContextLike = {
  dataset?: { data?: unknown[] };
  dataIndex?: number;
  raw?: unknown;
};

function getBubblePoint(ctx: DataLabelsContextLike): BubblePoint | null {
  const idx = typeof ctx.dataIndex === "number" ? ctx.dataIndex : -1;
  const fromDataset =
    Array.isArray(ctx.dataset?.data) && idx >= 0 ? ctx.dataset?.data[idx] : undefined;
  const raw = (fromDataset ?? ctx.raw) as unknown;
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Partial<BubblePoint>;
  if (typeof r.x !== "number" || typeof r.y !== "number" || typeof r.r !== "number") return null;
  return {
    x: r.x,
    y: r.y,
    r: r.r,
    label: typeof r.label === "string" ? r.label : "",
    value: typeof r.value === "number" ? r.value : 0,
  };
}

export function BubbleChart({ bubbles, unit, accent, accentDim }: BubbleChartProps) {
  const { data, options } = useMemo(() => {
    if (!bubbles?.length) {
      return { data: null, options: null };
    }
    const maxVal = Math.max(...bubbles.map((b) => b.value));
    const n = bubbles.length;
    const cols = Math.ceil(Math.sqrt(n * 1.5));
    const rows = Math.ceil(n / cols);
    const MAX_R = 62;
    const MIN_R = 16;

    const formatLabel = (label: string) => (label.length > 12 ? `${label.slice(0, 11)}…` : label);
    const formatTiny = (label: string) => {
      const compact = String(label).replace(/\s+/g, "");
      if (!compact) return "";
      return compact.slice(0, 3).toUpperCase();
    };

    const points: BubblePoint[] = bubbles.map((b, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const r = MIN_R + Math.sqrt(b.value / maxVal) * (MAX_R - MIN_R);
      return {
        x: col + 1,
        y: rows - row,
        r,
        label: b.label,
        value: b.value,
      };
    });

    const maxR = Math.max(...points.map((p) => p.r));
    const pad = Math.ceil(maxR + 10);

    const data: ChartData<"bubble", BubblePoint[]> = {
      datasets: [
        {
          data: points,
          backgroundColor: points.map((p) =>
            p.value === maxVal ? `${accent}2a` : `${accentDim}55`
          ),
          borderColor: points.map((p) => (p.value === maxVal ? accent : accentDim)),
          borderWidth: points.map((p) => (p.value === maxVal ? 1.6 : 1)),
          hoverBorderColor: accent,
          clip: false,
        },
      ],
    };

    const options: ChartOptions<"bubble"> = {
      responsive: true,
      maintainAspectRatio: false,
      layout: {
        padding: { top: pad, bottom: pad, left: pad, right: pad },
      },
      scales: {
        x: { display: false, min: 0, max: cols + 1 },
        y: { display: false, min: 0, max: rows + 1 },
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx: TooltipItem<"bubble">) => {
              const raw = ctx.raw as unknown;
              const p = raw && typeof raw === "object" ? (raw as Partial<BubblePoint>) : null;
              const value = typeof p?.value === "number" ? p.value : 0;
              const label = typeof p?.label === "string" ? p.label : "";
              return `${label}: ${value.toLocaleString()}${unit ? ` ${unit}` : ""}`;
            },
          },
        },
        // Provided by chartjs-plugin-datalabels
        datalabels: {
          align: "center",
          anchor: "center",
          clip: false,
          display: true,
          color: (ctx: unknown) => {
            const p = getBubblePoint(ctx as DataLabelsContextLike);
            const r = p?.r ?? 0;
            if (p?.value === maxVal) return r > 24 ? C.white : accent;
            return r > 24 ? C.white : C.muted;
          },
          formatter: (_value: unknown, ctx: unknown) => {
            const p = getBubblePoint(ctx as DataLabelsContextLike);
            const r = p?.r ?? 0;
            const label = formatLabel(p?.label ?? "");
            if (r < 22) return formatTiny(p?.label ?? "");
            if (r < 34) return label;
            return [label, (p?.value ?? 0).toLocaleString()];
          },
          font: (ctx: unknown) => {
            const p = getBubblePoint(ctx as DataLabelsContextLike);
            const r = p?.r ?? 0;
            return {
              family: "'IBM Plex Mono', monospace",
              size: Math.max(9, Math.min(12, r * 0.28)),
              weight: r > 28 ? 600 : 500,
            };
          },
        },
      },
    };

    return { data, options };
  }, [bubbles, unit, accent, accentDim]);

  if (!data || !options) {
    return (
      <div
        style={{
          color: C.muted,
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: 12,
          padding: "6px 0",
        }}
      >
        No data for bubble chart.
      </div>
    );
  }

  return (
    <div>
      <div style={{ width: "100%", height: 240 }}>
        <Bubble data={data} options={options} plugins={[ChartDataLabels]} />
      </div>
      {unit && (
        <div
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 10,
            color: C.muted,
            textAlign: "center",
            marginTop: 8,
            letterSpacing: "0.1em",
          }}
        >
          {unit}
        </div>
      )}
    </div>
  );
}
