"use client";

import { C } from "../../lib/theme";
import type { TimelineMagnitudeProps as TimelineMagnitudeDataProps } from "../../lib/articleTypes";

export type TimelineMagnitudeProps = TimelineMagnitudeDataProps & {
  accent: string;
  accentDim: string;
};

export function TimelineMagnitude({ events, accent, accentDim }: TimelineMagnitudeProps) {
  const vals = events.map(e => e.value || 1);
  const maxVal = Math.max(...vals);
  const BAR_H = 120;

  return (
    <div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 6, paddingBottom: 40, position: "relative", height: BAR_H + 40 }}>
        <div style={{ position: "absolute", bottom: 40, left: 0, right: 0, height: 1, background: C.border }} />
        {events.map((ev, i) => {
          const h = Math.max(14, (vals[i] / maxVal) * BAR_H);
          const isFuture = ev.type === "future";
          const isCurrent = ev.type === "current";
          return (
            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", height: "100%", justifyContent: "flex-end" }}>
              <div style={{
                width: "100%", height: h,
                background: isFuture ? "transparent" : isCurrent ? accent : accentDim,
                border: isFuture ? `1px dashed ${C.muted}` : isCurrent ? `1px solid ${accent}` : "none",
                backgroundImage: isFuture ? `repeating-linear-gradient(45deg, ${C.muted}18 0, ${C.muted}18 3px, transparent 3px, transparent 8px)` : "none",
                boxShadow: isCurrent ? `0 0 14px ${accent}40` : "none",
                borderRadius: "1px 1px 0 0",
                animation: `growBar 0.6s cubic-bezier(0.34,1.56,0.64,1) ${i * 0.07}s both`,
              }} />
            </div>
          );
        })}
      </div>
      <div style={{ display: "flex", gap: 6 }}>
        {events.map((ev, i) => (
          <div key={i} style={{ flex: 1, textAlign: "center" }}>
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, color: ev.type === "current" ? accent : C.muted, letterSpacing: "0.05em" }}>{ev.label}</div>
            {ev.description && <div style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 9, color: C.muted, marginTop: 2 }}>{ev.description}</div>}
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 20, marginTop: 16 }}>
        {(
          [
            ["Past", accentDim, false],
            ["Current", accent, false],
            ["Projected", null, true],
          ] as const
        ).map(([label, color, dashed]) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: dashed ? "transparent" : (color ?? "transparent"), border: dashed ? `1px dashed ${C.muted}` : "none" }} />
            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: C.muted }}>{label}</span>
          </div>
        ))}
      </div>
      <style>{`@keyframes growBar { from { transform: scaleY(0); transform-origin: bottom; } to { transform: scaleY(1); transform-origin: bottom; } }`}</style>
    </div>
  );
}
