"use client";

import { useEffect, useRef } from "react";
import { C } from "../../lib/theme";
import { ease } from "./utils";

export function BubbleChart({ bubbles, unit, accent, accentDim }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let raf, startTs = null;
    const DURATION = 1600;
    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const maxVal = Math.max(...bubbles.map(b => b.value));
    const MAX_R = 62, MIN_R = 16;

    function draw(ts) {
      if (!startTs) startTs = ts;
      const W = canvas.width, H = canvas.height;
      ctx.clearRect(0, 0, W, H);
      const n = bubbles.length;
      const cols = Math.ceil(Math.sqrt(n * 1.5));
      const rows = Math.ceil(n / cols);
      const cellW = W / cols, cellH = H / rows;

      bubbles.forEach((b, i) => {
        const staggerP = ease(Math.max(0, ((ts - startTs) - i * 80) / DURATION));
        const targetR = MIN_R + Math.sqrt(b.value / maxVal) * (MAX_R - MIN_R);
        const r = targetR * staggerP;
        const col = i % cols, row = Math.floor(i / cols);
        const cx = cellW * col + cellW / 2;
        const cy = cellH * row + cellH / 2;
        const isTop = b.value === maxVal;

        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fillStyle = isTop ? accent + "2a" : accentDim + "55";
        ctx.fill();
        ctx.strokeStyle = isTop ? accent : accentDim;
        ctx.lineWidth = isTop ? 1.5 : 1;
        ctx.stroke();

        if (r > 18) {
          const short = b.label.length > 10 ? b.label.slice(0, 9) + "…" : b.label;
          ctx.fillStyle = isTop ? accent : C.muted;
          ctx.font = `${Math.min(11, r * 0.38)}px 'IBM Plex Mono', monospace`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(short, cx, r > 28 ? cy - 7 : cy);
          if (r > 28) {
            ctx.font = `bold ${Math.min(13, r * 0.4)}px 'Playfair Display', serif`;
            ctx.fillStyle = C.white;
            ctx.fillText(b.value.toLocaleString(), cx, cy + 9);
          }
        }
      });
      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [bubbles, accent, accentDim]);

  return (
    <div>
      <canvas ref={canvasRef} style={{ width: "100%", height: 240, display: "block" }} />
      {unit && <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: C.muted, textAlign: "center", marginTop: 8, letterSpacing: "0.1em" }}>{unit}</div>}
    </div>
  );
}
