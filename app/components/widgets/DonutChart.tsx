"use client";

import { useEffect, useRef } from "react";
import { C } from "../../lib/theme";
import { ease } from "./utils";

const SEG_COLORS = ["#f5a623", "#5ce0d4", "#a78bfa", "#e05c5c", "#6ed96e"];

export function DonutChart({ segments, centerValue, centerLabel }) {
  const canvasRef = useRef(null);
  const total = segments.reduce((s, sg) => s + sg.value, 0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let raf, startTs = null;
    const DURATION = 1500;

    function draw(ts) {
      if (!startTs) startTs = ts;
      const p = ease((ts - startTs) / DURATION);
      const W = canvas.width, H = canvas.height;
      const cx = W / 2, cy = H / 2;
      const r = Math.min(W, H) * 0.42, ir = r * 0.58;
      ctx.clearRect(0, 0, W, H);

      let angle = -Math.PI / 2;
      const gap = 0.03;
      segments.forEach((seg, i) => {
        const sweep = ((seg.value / total) * Math.PI * 2 - gap) * p;
        ctx.beginPath();
        ctx.arc(cx, cy, r, angle + gap / 2, angle + gap / 2 + sweep);
        ctx.arc(cx, cy, ir, angle + gap / 2 + sweep, angle + gap / 2, true);
        ctx.closePath();
        ctx.fillStyle = SEG_COLORS[i % SEG_COLORS.length];
        ctx.fill();
        angle += (seg.value / total) * Math.PI * 2;
      });

      ctx.beginPath();
      ctx.arc(cx, cy, ir - 1, 0, Math.PI * 2);
      ctx.fillStyle = C.surface;
      ctx.fill();

      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [segments, total]);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 36, flexWrap: "wrap" }}>
      <div style={{ position: "relative", flexShrink: 0 }}>
        <canvas ref={canvasRef} width={180} height={180} style={{ width: 180, height: 180, display: "block" }} />
        {centerValue && (
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
            <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 30, fontWeight: 900, color: C.white, lineHeight: 1 }}>{centerValue}</span>
            {centerLabel && <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, color: C.muted, letterSpacing: "0.1em", textTransform: "uppercase", marginTop: 3 }}>{centerLabel}</span>}
          </div>
        )}
      </div>
      <div style={{ flex: 1, minWidth: 160, display: "flex", flexDirection: "column", gap: 12 }}>
        {segments.map((seg, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: SEG_COLORS[i % SEG_COLORS.length], flexShrink: 0 }} />
            <span style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 13, color: C.body, flex: 1 }}>{seg.label}</span>
            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: C.muted }}>{((seg.value / total) * 100).toFixed(1)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
