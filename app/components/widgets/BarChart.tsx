"use client";

import { useEffect, useRef } from "react";
import { C } from "../../lib/theme";
import { ease } from "../../lib/utils";
import type { BarChartProps as BarChartDataProps, BarChartBar } from "../../lib/articleTypes";

export type BarChartProps = BarChartDataProps & {
  accent: string;
  accentDim: string;
};

export function BarChart({ bars, unit, accent, accentDim }: BarChartProps) {
  const maxVal = Math.max(...bars.map(b => b.value));
  const barRefs = useRef<Array<HTMLDivElement | null>>([]);

  useEffect(() => {
    let raf = 0;
    let startTs: number | null = null;
    const DURATION = 1400;
    function draw(ts: number) {
      if (!startTs) startTs = ts;
      const p = ease((ts - startTs) / DURATION);
      bars.forEach((bar, i) => {
        const el = barRefs.current[i];
        if (el) el.style.width = ((bar.value / maxVal) * p * 100) + "%";
      });
      if (p < 1) raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [bars, maxVal]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      {bars.map((bar, i) => (
        <div key={i}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 7 }}>
            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: bar.highlight ? accent : C.muted, textTransform: "uppercase", letterSpacing: "0.08em" }}>{bar.label}</span>
            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: bar.highlight ? accent : C.muted }}>
              {bar.value.toLocaleString()}{unit ? ` ${unit}` : ""}
            </span>
          </div>
          <div style={{ height: 6, background: C.border, borderRadius: 1, overflow: "hidden" }}>
            <div
              ref={(el: HTMLDivElement | null) => { barRefs.current[i] = el; }}
              style={{ height: "100%", width: "0%", background: bar.highlight ? accent : accentDim, borderRadius: 1, boxShadow: bar.highlight ? `0 0 10px ${accent}50` : "none" }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
