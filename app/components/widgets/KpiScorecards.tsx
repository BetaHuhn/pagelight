"use client";

import { useEffect, useState } from "react";
import { C } from "../../lib/theme";
import type { KpiScorecardsProps as KpiScorecardsDataProps } from "../../lib/articleTypes";

function formatValue(value: number | string) {
  if (typeof value === "number") return value.toLocaleString();
  return value;
}

export type KpiScorecardsProps = KpiScorecardsDataProps & {
  accent: string;
};

export function KpiScorecards({ items, accent }: KpiScorecardsProps) {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 80);
    return () => {
      clearTimeout(t);
      setAnimated(false);
    };
  }, [items]);

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
        return (
          <div
            key={i}
            style={{
              border: `1px solid ${C.border}`,
              borderRadius: C.borderRadius - 6,
              background: C.bg,
              padding: "14px 14px 12px",
              transform: animated ? "translateY(0)" : "translateY(8px)",
              opacity: animated ? 1 : 0,
              transition: `transform 420ms ease ${i * 60}ms, opacity 420ms ease ${i * 60}ms`,
            }}
          >
            <div
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 10,
                color: C.muted,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
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
              {formatValue(item.value)}
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
