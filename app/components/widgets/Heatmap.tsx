"use client";

import { useEffect, useState } from "react";
import { C } from "../../lib/theme";

function hexToRgb(hex) {
  if (!hex || typeof hex !== "string") return { r: 92, g: 224, b: 212 };
  const cleaned = hex.replace("#", "");
  if (cleaned.length !== 6) return { r: 92, g: 224, b: 212 };
  return {
    r: parseInt(cleaned.slice(0, 2), 16),
    g: parseInt(cleaned.slice(2, 4), 16),
    b: parseInt(cleaned.slice(4, 6), 16),
  };
}

export function Heatmap({ cells, unit = "", accent }) {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    setAnimated(false);
    const t = setTimeout(() => setAnimated(true), 120);
    return () => clearTimeout(t);
  }, [cells]);

  if (!cells?.length) {
    return (
      <div style={{ color: C.muted, fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, padding: "6px 0" }}>
        No data for heatmap.
      </div>
    );
  }

  const xLabels = [...new Set(cells.map((cell) => cell.x))];
  const yLabels = [...new Set(cells.map((cell) => cell.y))];
  const values = cells.map((cell) => cell.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const rgb = hexToRgb(accent);

  const valueMap = new Map(cells.map((cell) => [`${cell.y}::${cell.x}`, cell.value]));

  return (
    <div>
      <div style={{ overflowX: "auto" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `130px repeat(${xLabels.length}, minmax(34px, 1fr))`,
            gap: 8,
            alignItems: "center",
            minWidth: xLabels.length * 40 + 140,
          }}
        >
          <div />
          {xLabels.map((label, i) => (
            <div key={i} style={{ textAlign: "center", fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: C.muted, textTransform: "uppercase", letterSpacing: "0.08em" }}>
              {label}
            </div>
          ))}

          {yLabels.map((rowLabel, rowIndex) => (
            <div key={rowLabel} style={{ display: "contents" }}>
              <div style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 13, color: C.body, paddingRight: 8 }}>
                {rowLabel}
              </div>
              {xLabels.map((colLabel, colIndex) => {
                const cellKey = `${rowLabel}::${colLabel}`;
                const v = valueMap.get(cellKey) ?? 0;
                const t = (v - min) / range;
                const alpha = 0.12 + t * 0.82;
                return (
                  <div
                    key={cellKey}
                    title={`${rowLabel} • ${colLabel}: ${v.toLocaleString()}${unit ? ` ${unit}` : ""}`}
                    style={{
                      height: 28,
                      borderRadius: 4,
                      border: `1px solid ${C.border}`,
                      background: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`,
                      transform: animated ? "scale(1)" : "scale(0.88)",
                      opacity: animated ? 1 : 0,
                      transition: `transform 420ms ease ${rowIndex * 26 + colIndex * 14}ms, opacity 420ms ease ${rowIndex * 26 + colIndex * 14}ms`,
                    }}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: C.muted }}>Low</span>
        <div style={{ flex: 1, maxWidth: 220, height: 8, borderRadius: 4, background: `linear-gradient(90deg, rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.12), rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.94))`, border: `1px solid ${C.border}` }} />
        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: C.muted }}>High</span>
        <span style={{ marginLeft: 8, fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: C.muted }}>
          {min.toLocaleString()} → {max.toLocaleString()}
          {unit ? ` ${unit}` : ""}
        </span>
      </div>
    </div>
  );
}
