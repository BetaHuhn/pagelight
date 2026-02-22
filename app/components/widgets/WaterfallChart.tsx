"use client";

import { useEffect, useRef } from "react";
import { C } from "@/lib/theme";
import { ease } from "@/lib/utils";
import type { WaterfallChartProps as WaterfallChartDataProps } from "@/lib/types";

export type WaterfallChartProps = WaterfallChartDataProps & {
  accent: string;
  accentDim: string;
};

export function WaterfallChart({ steps, unit = "", accent, accentDim }: WaterfallChartProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let raf = 0;
    let startTs: number | null = null;
    const DURATION = 1600;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const computed: Array<(typeof steps)[number] & { start: number; end: number }> = [];
    let cumulative = 0;
    steps.forEach((step) => {
      const start = cumulative;
      const end = step.type === "total" ? step.value : cumulative + step.value;
      computed.push({ ...step, start, end });
      cumulative = end;
    });

    const values = [0, ...computed.flatMap((step) => [step.start, step.end])];
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;

    function toY(v: number, h: number, pad: { t: number; b: number }) {
      const chartH = h - pad.t - pad.b;
      return pad.t + ((max - v) / range) * chartH;
    }

    function draw(ts: number) {
      if (!ctx || !canvas) return;
      if (!startTs) startTs = ts;
      const p = ease((ts - startTs) / DURATION);

      const w = canvas.width;
      const h = canvas.height;
      const pad = { t: 22, r: 16, b: 50, l: 56 };
      const chartW = w - pad.l - pad.r;
      const stepW = chartW / Math.max(1, steps.length);
      const barW = Math.min(52, stepW * 0.62);

      ctx.clearRect(0, 0, w, h);

      const yZero = toY(0, h, pad);
      ctx.strokeStyle = C.border;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(pad.l, yZero);
      ctx.lineTo(pad.l + chartW, yZero);
      ctx.stroke();

      ctx.font = "10px 'IBM Plex Mono', monospace";
      ctx.fillStyle = C.muted;
      ctx.textAlign = "right";
      for (let i = 0; i <= 4; i++) {
        const v = min + ((max - min) * i) / 4;
        const y = toY(v, h, pad);
        ctx.fillText(
          `${Math.round(v).toLocaleString()}${unit ? ` ${unit}` : ""}`,
          pad.l - 6,
          y + 3
        );
        ctx.strokeStyle = C.border + "38";
        ctx.lineWidth = 0.6;
        ctx.beginPath();
        ctx.moveTo(pad.l, y);
        ctx.lineTo(pad.l + chartW, y);
        ctx.stroke();
      }

      computed.forEach((step, i) => {
        const x = pad.l + stepW * i + (stepW - barW) / 2;
        const animatedEnd = step.start + (step.end - step.start) * p;
        const yStart = toY(step.start, h, pad);
        const yEnd = toY(animatedEnd, h, pad);
        const yTop = Math.min(yStart, yEnd);
        const barH = Math.max(2, Math.abs(yEnd - yStart));

        const isTotal = step.type === "total";
        const isPositive = step.end - step.start >= 0;
        const color = isTotal ? accent : isPositive ? accentDim : C.red;

        ctx.fillStyle = color;
        ctx.globalAlpha = 0.95;
        ctx.fillRect(x, yTop, barW, barH);
        ctx.globalAlpha = 1;

        if (i < computed.length - 1) {
          const next = computed[i + 1];
          const yLink = toY(animatedEnd, h, pad);
          const nextX = pad.l + stepW * (i + 1) + (stepW - barW) / 2;
          ctx.strokeStyle = C.border;
          ctx.lineWidth = 1;
          ctx.setLineDash([4, 4]);
          ctx.beginPath();
          ctx.moveTo(x + barW, yLink);
          ctx.lineTo(nextX, yLink);
          ctx.stroke();
          ctx.setLineDash([]);
        }

        ctx.textAlign = "center";
        ctx.fillStyle = C.muted;
        ctx.font = "10px 'IBM Plex Mono', monospace";
        ctx.fillText(step.label, x + barW / 2, h - 20);

        const delta = step.type === "total" ? step.end : step.end - step.start;
        ctx.fillStyle = isTotal ? accent : delta >= 0 ? accent : C.red;
        ctx.fillText(
          `${delta >= 0 && !isTotal ? "+" : ""}${Math.round(delta).toLocaleString()}`,
          x + barW / 2,
          yTop - 6
        );
      });

      if (p < 1) raf = requestAnimationFrame(draw);
    }

    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [steps, unit, accent, accentDim]);

  return <canvas ref={canvasRef} style={{ width: "100%", height: 250, display: "block" }} />;
}
