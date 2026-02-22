"use client";

import { useEffect, useRef } from "react";
import { C } from "../../lib/theme";
import type { UnitChartProps as UnitChartDataProps } from "../../lib/articleTypes";

export type UnitChartProps = UnitChartDataProps & {
  accent: string;
  accentDim: string;
};

export function UnitChart({ total = 100, highlighted, unit, description, accent }: UnitChartProps) {
  const dotRefs = useRef<Array<HTMLDivElement | null>>([]);

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      if (i >= highlighted) {
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
  }, [highlighted, accent]);

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
        {Array.from({ length: total }, (_, i) => (
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
          {highlighted}
        </span>
        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: C.muted }}>
          of {total} {unit}
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
