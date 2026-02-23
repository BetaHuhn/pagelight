"use client";

import { useEffect, useState } from "react";
import { C } from "@/lib/theme";
import { ease } from "@/lib/utils";
import type { KpiScorecardsProps as KpiScorecardsDataProps } from "@/lib/types";

function formatValue(value: number | string) {
  if (typeof value === "number") return value.toLocaleString();
  return value;
}

export type KpiScorecardsProps = KpiScorecardsDataProps & {
  accent: string;
};

export function KpiScorecards({ items, accent }: KpiScorecardsProps) {
  const [animated, setAnimated] = useState(false);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [countValues, setCountValues] = useState<Array<number | string>>(
    items.map((it) => (typeof it.value === "number" ? 0 : it.value))
  );

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 80);
    return () => {
      clearTimeout(t);
      setAnimated(false);
    };
  }, [items]);

  useEffect(() => {
    if (!animated) return;
    const DURATION = 900;
    let raf = 0;
    let startTs: number | null = null;

    const numericItems = items.map((it) =>
      typeof it.value === "number" ? it.value : null
    );

    function tick(ts: number) {
      if (!startTs) startTs = ts;
      const p = ease((ts - startTs) / DURATION);
      setCountValues(
        numericItems.map((target, i) =>
          target !== null ? target * p : items[i].value
        )
      );
      if (p < 1) raf = requestAnimationFrame(tick);
    }

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [animated, items]);

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
        gap: 12,
      }}
    >
      {items.map((item, i) => {
        const deltaColor =
          item.sentiment === "negative" ? C.red : item.sentiment === "neutral" ? C.muted : accent;
        const isHovered = hoveredIdx === i;
        // Determine decimal precision from the final target value, not the animated intermediate.
        const isDecimal = typeof item.value === "number" && item.value % 1 !== 0;
        const displayValue =
          typeof item.value === "number"
            ? (countValues[i] as number).toLocaleString(undefined, {
                minimumFractionDigits: isDecimal ? 1 : 0,
                maximumFractionDigits: isDecimal ? 2 : 0,
              })
            : formatValue(item.value);

        return (
          <div
            key={i}
            onMouseEnter={() => setHoveredIdx(i)}
            onMouseLeave={() => setHoveredIdx(null)}
            style={{
              border: `1px solid ${isHovered ? accent + "60" : C.border}`,
              borderRadius: C.borderRadius - 6,
              background: isHovered ? C.panel : C.bg,
              padding: "14px 14px 12px",
              transform: animated
                ? isHovered
                  ? "translateY(-3px) scale(1.01)"
                  : "translateY(0) scale(1)"
                : "translateY(8px)",
              opacity: animated ? 1 : 0,
              transition: `transform 420ms ease ${i * 60}ms, opacity 420ms ease ${i * 60}ms, border-color 0.2s, background 0.2s, box-shadow 0.2s`,
              boxShadow: isHovered
                ? `0 6px 24px rgba(0,0,0,0.3), 0 0 0 1px ${accent}30`
                : "none",
              cursor: "default",
            }}
          >
            <div
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 10,
                color: isHovered ? accent : C.muted,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                transition: "color 0.2s",
              }}
            >
              {item.label}
            </div>
            <div
              style={{
                marginTop: 8,
                fontFamily: "'Playfair Display', serif",
                color: C.white,
                fontSize: 32,
                lineHeight: 1,
                fontWeight: 800,
              }}
            >
              {item.prefix || ""}
              {displayValue}
              {item.suffix || ""}
              {item.unit ? (
                <span
                  style={{
                    marginLeft: 6,
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: 11,
                    color: C.muted,
                    fontWeight: 500,
                  }}
                >
                  {item.unit}
                </span>
              ) : null}
            </div>
            {(item.delta !== undefined || item.deltaLabel) && (
              <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 8 }}>
                {item.delta !== undefined && item.delta !== null ? (
                  <span
                    style={{
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontSize: 11,
                      color: deltaColor,
                    }}
                  >
                    {item.delta > 0 ? "+" : ""}
                    {item.delta}%
                  </span>
                ) : null}
                {item.deltaLabel ? (
                  <span
                    style={{
                      fontFamily: "'IBM Plex Sans', sans-serif",
                      fontSize: 12,
                      color: C.muted,
                    }}
                  >
                    {item.deltaLabel}
                  </span>
                ) : null}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
