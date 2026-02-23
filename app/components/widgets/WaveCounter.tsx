"use client";

import { useEffect, useRef } from "react";
import { C } from "@/lib/theme";
import { ease } from "@/lib/utils";
import type { WaveCounterProps as WaveCounterDataProps } from "@/lib/types";

export type WaveCounterProps = WaveCounterDataProps & {
  accent: string;
  accentDim: string;
};

export function WaveCounter({
  value,
  prefix = "",
  suffix = "",
  unit,
  description,
  accent,
  accentDim,
}: WaveCounterProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const numRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let raf = 0;
    let startTs: number | null = null;
    const DURATION = 2200;
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
      const elapsed = ts - startTs;
      const p = ease(elapsed / DURATION);
      const frame = elapsed / 1000;
      const dpr = window.devicePixelRatio || 1;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const W = canvas.width / dpr,
        H = canvas.height / dpr;
      ctx.clearRect(0, 0, W, H);

      for (let w = 0; w < 2; w++) {
        const baseY = H * (1 - p * 0.8);
        const amp = H * 0.042;
        const speed = w === 0 ? 1.1 : 0.75;
        const phase = w === 0 ? 0 : Math.PI * 0.65;
        ctx.beginPath();
        ctx.moveTo(0, H);
        for (let x = 0; x <= W; x += 2) {
          const y = baseY + Math.sin((x / W) * Math.PI * 6 + frame * speed + phase) * amp;
          ctx.lineTo(x, y);
        }
        ctx.lineTo(W, H);
        ctx.closePath();
        const g = ctx.createLinearGradient(0, 0, 0, H);
        if (w === 0) {
          g.addColorStop(0, accent + "30");
          g.addColorStop(1, accent + "08");
        } else {
          g.addColorStop(0, accentDim + "60");
          g.addColorStop(1, accentDim + "00");
        }
        ctx.fillStyle = g;
        ctx.fill();
      }

      if (numRef.current)
        numRef.current.textContent = prefix + Math.round(p * value).toLocaleString() + suffix;
      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [value, accent, accentDim, prefix, suffix]);

  return (
    <div style={{ position: "relative", height: 200, overflow: "hidden" }}>
      <canvas
        ref={canvasRef}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
      />
      <div
        style={{
          position: "relative",
          zIndex: 1,
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
          textAlign: "center",
          padding: "0 24px",
        }}
      >
        <span
          ref={numRef}
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 80,
            fontWeight: 900,
            color: C.white,
            lineHeight: 1,
          }}
        >
          0
        </span>
        {unit && (
          <span
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 11,
              color: accent,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
            }}
          >
            {unit}
          </span>
        )}
        {description && (
          <span
            style={{
              fontFamily: "'IBM Plex Sans', sans-serif",
              fontSize: 13,
              color: C.muted,
              marginTop: 2,
              maxWidth: 340,
            }}
          >
            {description}
          </span>
        )}
      </div>
    </div>
  );
}
