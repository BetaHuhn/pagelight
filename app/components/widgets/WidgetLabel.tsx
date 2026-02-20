"use client";

export function WidgetLabel({ text, accent, accentDim }) {
  return (
    <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: accent, letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
      <span style={{ color: accentDim }}>◈</span> {text}
    </div>
  );
}
