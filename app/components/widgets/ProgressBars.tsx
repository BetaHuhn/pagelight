"use client";

import { useEffect, useState } from "react";
import { C } from "@/lib/theme";
import type { ProgressBarsProps as ProgressBarsDataProps } from "@/lib/types";

export type ProgressBarsProps = ProgressBarsDataProps & {
  accent: string;
  accentDim: string;
};

export function ProgressBars({ items, accent }: ProgressBarsProps) {
  const [animated, setAnimated] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 200);
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {items.map(({ label, sub, value, sentiment }, i) => {
        const safeValue = Math.min(100, Math.max(0, Number.isFinite(Number(value)) ? Number(value) : 0));
        const color =
          sentiment === "negative" ? C.red : sentiment === "positive" ? accent : C.muted;
        return (
          <div key={i}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 6,
                alignItems: "flex-start",
              }}
            >
              <div>
                <div
                  style={{
                    fontFamily: "'IBM Plex Sans', sans-serif",
                    fontSize: 14,
                    color: C.text,
                    fontWeight: 500,
                  }}
                >
                  {label}
                </div>
                {sub && (
                  <div
                    style={{
                      fontFamily: "'IBM Plex Sans', sans-serif",
                      fontSize: 11,
                      color: C.muted,
                      marginTop: 2,
                    }}
                  >
                    {sub}
                  </div>
                )}
              </div>
              <span
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: 16,
                  color,
                  fontWeight: 500,
                  alignSelf: "center",
                  flexShrink: 0,
                  marginLeft: 12,
                }}
              >
                {safeValue}%
              </span>
            </div>
            <div style={{ height: 8, background: C.border, borderRadius: 4, overflow: "hidden" }}>
              <div
                style={{
                  height: "100%",
                  width: animated ? `${safeValue}%` : "0%",
                  background: `linear-gradient(90deg, ${color}80, ${color})`,
                  borderRadius: 4,
                  transition: `width ${0.8 + i * 0.12}s cubic-bezier(0.16,1,0.3,1) ${i * 0.08}s`,
                  boxShadow: `0 0 10px ${color}60`,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
