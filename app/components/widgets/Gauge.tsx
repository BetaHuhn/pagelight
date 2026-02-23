"use client";

import { useEffect, useRef } from "react";
import { C } from "@/lib/theme";
import { ease } from "@/lib/utils";
import type { GaugeProps as GaugeDataProps } from "@/lib/types";

export type GaugeProps = GaugeDataProps & {
  accent?: string;
  accentDim?: string;
};

export function Gauge({
  value,
  min = 0,
  max = 100,
  unit = "",
  lowLabel = "LOW",
  highLabel = "HIGH",
}: GaugeProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const pct = (value - min) / (max - min);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let raf = 0;
    let startTs: number | null = null;
    const DURATION = 1800;
    const CSS_W = 280,
      CSS_H = 160;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = CSS_W * dpr;
    canvas.height = CSS_H * dpr;

    function draw(ts: number) {
      if (!ctx || !canvas) return;
      if (!startTs) startTs = ts;
      const elapsed = ts - startTs;
      const p = ease(elapsed / DURATION);
      const sway = p >= 1 ? Math.sin(elapsed / 1100) * 0.022 : 0;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const W = CSS_W,
        H = CSS_H;
      const cx = W / 2,
        cy = H * 0.72;
      const r = W * 0.37;
      ctx.clearRect(0, 0, W, H);

      ctx.beginPath();
      ctx.arc(cx, cy, r, Math.PI, 0);
      ctx.strokeStyle = C.border;
      ctx.lineWidth = 12;
      ctx.lineCap = "butt";
      ctx.stroke();

      const endA = Math.PI + (p * pct + sway) * Math.PI;
      const grd = ctx.createLinearGradient(cx - r, cy, cx + r, cy);
      grd.addColorStop(0, "#e05c5c");
      grd.addColorStop(0.45, "#f5a623");
      grd.addColorStop(1, "#6ed96e");
      ctx.beginPath();
      ctx.arc(cx, cy, r, Math.PI, endA);
      ctx.strokeStyle = grd;
      ctx.lineWidth = 12;
      ctx.lineCap = "round";
      ctx.stroke();

      const na = Math.PI + (p * pct + sway) * Math.PI;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(na) * (r - 6), cy + Math.sin(na) * (r - 6));
      ctx.strokeStyle = C.white;
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx, cy, 5, 0, Math.PI * 2);
      ctx.fillStyle = C.white;
      ctx.fill();

      ctx.font = "10px 'IBM Plex Mono', monospace";
      ctx.fillStyle = C.muted;
      ctx.textAlign = "center";
      ctx.fillText(lowLabel, cx - r + 2, cy + 20);
      ctx.fillText(highLabel, cx + r - 2, cy + 20);

      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [value, min, max, pct, lowLabel, highLabel]);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <canvas
        ref={canvasRef}
        width={280}
        height={160}
        style={{ width: "100%", maxWidth: 280, height: "auto", display: "block" }}
      />
      <div style={{ display: "flex", justifyContent: "center", marginTop: 4 }}>
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 38,
              fontWeight: 900,
              color: C.white,
              lineHeight: 1,
            }}
          >
            {value}
            {unit}
          </div>
          <div
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 9,
              color: C.muted,
              letterSpacing: "0.1em",
              marginTop: 2,
            }}
          >
            out of {max}
            {unit}
          </div>
        </div>
      </div>
    </div>
  );
}
