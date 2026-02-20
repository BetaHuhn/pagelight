"use client";

import { useEffect, useState } from "react";
import { C } from "../../lib/theme";

export function ComparisonTable({ highlight, unit, rows, accent, accentDim }) {
  const [hovered, setHovered] = useState(null);
  const [animated, setAnimated] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 200);
    return () => clearTimeout(t);
  }, []);
  const maxVal = Math.max(...rows.map(r => r.value));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {rows.map((row, i) => {
        const isHL = row.name === highlight;
        return (
          <div
            key={i}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
            style={{
              display: "grid", gridTemplateColumns: "140px 1fr 52px auto",
              alignItems: "center", gap: 14, padding: "10px 14px",
              background: hovered === i ? C.panel : "transparent",
              borderRadius: 2, cursor: "default", transition: "background 0.15s",
              border: isHL ? `1px solid ${accentDim}` : "1px solid transparent",
            }}>
            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, color: isHL ? accent : C.muted, fontWeight: isHL ? 600 : 400 }}>{row.name}</span>
            <div style={{ height: 4, background: C.border, borderRadius: 2, overflow: "hidden" }}>
              <div style={{
                height: "100%",
                width: animated ? `${(row.value / maxVal) * 100}%` : "0%",
                background: isHL ? `linear-gradient(90deg, ${accentDim}, ${accent})` : accentDim,
                transition: `width 0.9s cubic-bezier(0.16,1,0.3,1) ${i * 0.06}s`,
                boxShadow: isHL ? `0 0 8px ${accent}40` : "none",
              }} />
            </div>
            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, color: isHL ? accent : C.muted, textAlign: "right" }}>{row.value}{unit || ""}</span>
            {row.note && <span style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 11, color: C.muted }}>{row.note}</span>}
          </div>
        );
      })}
    </div>
  );
}
