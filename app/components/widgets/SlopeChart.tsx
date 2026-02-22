"use client";

import { useEffect, useState } from "react";
import { C } from "../../lib/theme";
import { ease } from "../../lib/utils";
import type { SlopeChartProps as SlopeChartDataProps } from "../../lib/articleTypes";

export type SlopeChartProps = SlopeChartDataProps & {
  accent: string;
};

export function SlopeChart({ items, unit = "", leftLabel = "Before", rightLabel = "After", accent }: SlopeChartProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let raf = 0;
    let startTs: number | null = null;
    const DURATION = 1300;

    function tick(ts: number) {
      if (!startTs) startTs = ts;
      const p = ease((ts - startTs) / DURATION);
      setProgress(p);
      if (p < 1) raf = requestAnimationFrame(tick);
    }

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [items]);

  if (!items?.length) {
    return (
      <div style={{ color: C.muted, fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, padding: "6px 0" }}>
        No data for slope chart.
      </div>
    );
  }

  const values = items.flatMap((item) => [item.start, item.end]);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const width = 760;
  const height = Math.max(240, items.length * 44 + 84);
  const xLeft = 180;
  const xRight = width - 180;
  const top = 52;
  const step = (height - top - 44) / Math.max(1, items.length - 1);
  const toY = (value: number) => top + ((max - value) / range) * (height - top - 44);

  const format = (value: number) => `${value.toLocaleString()}${unit ? ` ${unit}` : ""}`;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: C.muted, letterSpacing: "0.08em", textTransform: "uppercase" }}>{leftLabel}</span>
        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: C.muted, letterSpacing: "0.08em", textTransform: "uppercase" }}>{rightLabel}</span>
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} style={{ width: "100%", height: "auto", display: "block" }}>
        <line x1={xLeft} y1={top - 18} x2={xLeft} y2={height - 28} stroke={C.border} strokeWidth="1" />
        <line x1={xRight} y1={top - 18} x2={xRight} y2={height - 28} stroke={C.border} strokeWidth="1" />

        {items.map((item, i) => {
          const y1 = toY(item.start);
          const y2 = toY(item.start + (item.end - item.start) * progress);
          const fullY2 = toY(item.end);
          const delta = item.end - item.start;
          const color = delta > 0 ? accent : delta < 0 ? C.red : C.muted;
          const rowY = top + step * i;

          return (
            <g key={i}>
              <line x1={xLeft} y1={y1} x2={xRight} y2={y2} stroke={color} strokeWidth="2" strokeOpacity="0.85" />
              <circle cx={xLeft} cy={y1} r="4" fill={C.surface} stroke={color} strokeWidth="2" />
              <circle cx={xRight} cy={y2} r="4" fill={C.surface} stroke={color} strokeWidth="2" />

              <text x={22} y={rowY + 4} fill={C.body} fontFamily="'IBM Plex Sans', sans-serif" fontSize="13">{item.label}</text>
              <text x={xLeft - 10} y={y1 + 4} textAnchor="end" fill={C.muted} fontFamily="'IBM Plex Mono', monospace" fontSize="10">{format(item.start)}</text>
              <text x={xRight + 10} y={fullY2 + 4} fill={color} fontFamily="'IBM Plex Mono', monospace" fontSize="10">{format(item.end)}</text>
              <text x={xRight + 118} y={fullY2 + 4} textAnchor="end" fill={color} fontFamily="'IBM Plex Mono', monospace" fontSize="10">
                {delta > 0 ? "+" : ""}
                {delta.toLocaleString()}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
