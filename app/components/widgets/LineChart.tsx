"use client";

import { useEffect, useRef } from "react";
import { C } from "@/lib/theme";
import { ease } from "@/lib/utils";
import type { LineChartProps as LineChartDataProps } from "@/lib/types";

export type LineChartProps = LineChartDataProps & {
  accent: string;
  accentDim: string;
};

export function LineChart({ points, yLabel, unit = "", accent }: LineChartProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let raf = 0;
    let startTs: number | null = null;
    const DURATION = 1800;
    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = canvas.offsetWidth * dpr;
      canvas.height = canvas.offsetHeight * dpr;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    function draw(ts: number) {
      if (!ctx || !canvas) return;
      if (!startTs) startTs = ts;
      const p = ease((ts - startTs) / DURATION);
      const dpr = window.devicePixelRatio || 1;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const W = canvas.width / dpr,
        H = canvas.height / dpr;
      const PAD = { t: 20, r: 16, b: 36, l: 52 };
      const cW = W - PAD.l - PAD.r,
        cH = H - PAD.t - PAD.b;
      const vals = points.map((pt) => pt.y);
      const minY = Math.min(...vals),
        maxY = Math.max(...vals);
      const range = maxY - minY || 1;
      const toX = (i: number) => PAD.l + (i / (points.length - 1)) * cW;
      const toY = (v: number) => PAD.t + cH - ((v - minY) / range) * cH;
      ctx.clearRect(0, 0, W, H);

      ctx.strokeStyle = C.border;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(PAD.l, PAD.t);
      ctx.lineTo(PAD.l, PAD.t + cH);
      ctx.lineTo(PAD.l + cW, PAD.t + cH);
      ctx.stroke();

      ctx.font = "10px 'IBM Plex Mono', monospace";
      ctx.fillStyle = C.muted;
      ctx.textAlign = "right";
      for (let i = 0; i <= 4; i++) {
        const v = minY + (range * i) / 4;
        const y = toY(v);
        ctx.fillText(Math.round(v).toLocaleString() + (unit || ""), PAD.l - 5, y + 4);
        ctx.beginPath();
        ctx.moveTo(PAD.l, y);
        ctx.lineTo(PAD.l + cW, y);
        ctx.strokeStyle = C.border + "40";
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }

      ctx.textAlign = "center";
      ctx.fillStyle = C.muted;
      const step = Math.ceil(points.length / 7);
      points.forEach((pt, i) => {
        if (i % step === 0 || i === points.length - 1) ctx.fillText(pt.x, toX(i), PAD.t + cH + 16);
      });

      ctx.save();
      ctx.beginPath();
      ctx.rect(PAD.l, PAD.t - 4, cW * p, cH + 8);
      ctx.clip();

      const grad = ctx.createLinearGradient(0, PAD.t, 0, PAD.t + cH);
      grad.addColorStop(0, accent + "26");
      grad.addColorStop(1, accent + "00");
      ctx.beginPath();
      points.forEach((pt, i) => {
        i === 0 ? ctx.moveTo(toX(i), toY(pt.y)) : ctx.lineTo(toX(i), toY(pt.y));
      });
      ctx.lineTo(toX(points.length - 1), PAD.t + cH);
      ctx.lineTo(toX(0), PAD.t + cH);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();

      ctx.beginPath();
      points.forEach((pt, i) => {
        i === 0 ? ctx.moveTo(toX(i), toY(pt.y)) : ctx.lineTo(toX(i), toY(pt.y));
      });
      ctx.strokeStyle = accent;
      ctx.lineWidth = 2;
      ctx.lineJoin = "round";
      ctx.stroke();

      points.forEach((pt, i) => {
        ctx.beginPath();
        ctx.arc(toX(i), toY(pt.y), 4, 0, Math.PI * 2);
        ctx.fillStyle = accent;
        ctx.fill();
        ctx.strokeStyle = C.surface;
        ctx.lineWidth = 2;
        ctx.stroke();
      });
      ctx.restore();
      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [points, accent, unit]);

  return (
    <div>
      {yLabel && (
        <div
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 10,
            color: C.muted,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            marginBottom: 8,
          }}
        >
          {yLabel}
        </div>
      )}
      <canvas ref={canvasRef} style={{ width: "100%", height: 220, display: "block" }} />
    </div>
  );
}
