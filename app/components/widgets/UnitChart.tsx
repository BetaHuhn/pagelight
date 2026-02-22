"use client";

import { useEffect, useRef } from "react";
import { C } from "@/lib/theme";
import type { UnitChartProps as UnitChartDataProps } from "@/lib/types";

export type UnitChartProps = UnitChartDataProps & {
  accent: string;
  accentDim: string;
};

export function UnitChart({ total = 100, highlighted, unit, description, accent }: UnitChartProps) {
  const safeTotal = Number.isFinite(Number(total)) ? Math.min(100, Math.max(1, Math.trunc(Number(total)))) : 100;
  const safeHighlighted = Number.isFinite(Number(highlighted)) ? Math.min(safeTotal, Math.max(0, Math.trunc(Number(highlighted)))) : 0;
  const dotRefs = useRef<Array<HTMLDivElement | null>>([]);

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      if (i >= safeHighlighted) {
        clearInterval(interval);
        return;
      }
      const el = dotRefs.current[i];
      if (el) {
        el.style.background = accent;
        el.style.boxShadow = `0 0 6px ${accent}60`;
      }
      i++;
    }, 22);
    return () => clearInterval(interval);
  }, [safeHighlighted, accent]);

  return (
    <div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(20, 1fr)",
          gap: 5,
          marginBottom: 18,
        }}
      >
        {Array.from({ length: safeTotal }, (_, i) => (
          <div
            key={i}
            ref={(el: HTMLDivElement | null) => {
              dotRefs.current[i] = el;
            }}
            style={{
              width: "100%",
              paddingTop: "100%",
              borderRadius: "50%",
              background: C.border,
              transition: "all 0.3s ease",
            }}
          />
        ))}
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
        <span
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 42,
            fontWeight: 900,
            color: accent,
            lineHeight: 1,
          }}
        >
          {safeHighlighted}
        </span>
        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: C.muted }}>
          of {safeTotal} {unit}
        </span>
      </div>
      {description && (
        <p
          style={{
            fontFamily: "'IBM Plex Sans', sans-serif",
            fontSize: 13,
            color: C.body,
            marginTop: 8,
            lineHeight: 1.7,
          }}
        >
          {description}
        </p>
      )}
    </div>
  );
}
