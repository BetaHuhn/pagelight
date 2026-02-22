"use client";

import { useEffect, useRef } from "react";
import { C } from "../../lib/theme";
import { ease } from "../../lib/utils";
import type { DonutChartProps as DonutChartDataProps } from "../../lib/articleTypes";

const SEG_COLORS = ["#f5a623", "#5ce0d4", "#a78bfa", "#e05c5c", "#6ed96e"];

export type DonutChartProps = DonutChartDataProps & {
  accent?: string;
  accentDim?: string;
};

export function DonutChart({ segments, centerValue, centerLabel }: DonutChartProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const total = segments.reduce((s, sg) => s + sg.value, 0);
  const labelLength = centerLabel?.length ?? 0;
  const centerLabelFontSize = labelLength > 36 ? 6 : labelLength > 24 ? 7 : 8;
  const centerLabelLetterSpacing = labelLength > 24 ? "0.04em" : "0.08em";

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let raf = 0;
    let startTs: number | null = null;
    const DURATION = 1500;

    function draw(ts: number) {
      if (!ctx || !canvas) return;
      if (!startTs) startTs = ts;
      const p = ease((ts - startTs) / DURATION);
      const W = canvas.width,
        H = canvas.height;
      const cx = W / 2,
        cy = H / 2;
      const r = Math.min(W, H) * 0.42,
        ir = r * 0.58;
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

      if (p < 1) raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [segments, total]);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 36, flexWrap: "wrap" }}>
      <div style={{ position: "relative", flexShrink: 0 }}>
        <canvas
          ref={canvasRef}
          width={200}
          height={200}
          style={{ width: 200, height: 200, display: "block" }}
        />
        {centerValue && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              pointerEvents: "none",
            }}
          >
            <span
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 30,
                fontWeight: 900,
                color: C.white,
                lineHeight: 1,
              }}
            >
              {centerValue}
            </span>
            {centerLabel && (
              <span
                title={centerLabel}
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: centerLabelFontSize,
                  color: C.muted,
                  letterSpacing: centerLabelLetterSpacing,
                  textTransform: "uppercase",
                  marginTop: 7,
                  maxWidth: 70,
                  textAlign: "center",
                  lineHeight: 1.2,
                  overflow: "hidden",
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  wordBreak: "break-word",
                }}
              >
                {centerLabel}
              </span>
            )}
          </div>
        )}
      </div>
      <div style={{ flex: 1, minWidth: 160, display: "flex", flexDirection: "column", gap: 12 }}>
        {segments.map((seg, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: 2,
                background: SEG_COLORS[i % SEG_COLORS.length],
                flexShrink: 0,
              }}
            />
            <span
              style={{
                fontFamily: "'IBM Plex Sans', sans-serif",
                fontSize: 13,
                color: C.body,
                flex: 1,
              }}
            >
              {seg.label}
            </span>
            <span
              style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: C.muted }}
            >
              {((seg.value / total) * 100).toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
