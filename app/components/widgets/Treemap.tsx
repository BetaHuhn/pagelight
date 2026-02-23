"use client";

import { useEffect, useRef } from "react";
import { C } from "@/lib/theme";
import { ease } from "@/lib/utils";
import type { TreemapProps as TreemapDataProps } from "@/lib/types";

export type TreemapProps = TreemapDataProps & {
  accent: string;
  accentDim: string;
};

type Rect = { x: number; y: number; w: number; h: number };
type Cell = Rect & { label: string; value: number };

function buildTreemap(
  nodes: Array<{ label: string; value: number }>,
  rect: Rect,
): Cell[] {
  const cells: Cell[] = [];

  function layout(items: Array<{ label: string; value: number }>, r: Rect) {
    if (items.length === 0) return;
    if (items.length === 1) {
      cells.push({ ...r, label: items[0].label, value: items[0].value });
      return;
    }

    const totalVal = items.reduce((s, n) => s + n.value, 0);
    const splitHorizontal = r.w >= r.h;

    // Find the split that minimises the worst aspect ratio
    let bestRatio = Infinity;
    let bestSplit = 1;
    for (let i = 1; i < items.length; i++) {
      const leftVal = items.slice(0, i).reduce((s, n) => s + n.value, 0);
      const leftFrac = leftVal / totalVal;
      let ratio: number;
      if (splitHorizontal) {
        const lw = r.w * leftFrac;
        const rw = r.w - lw;
        ratio = Math.max(lw / r.h, r.h / lw, rw / r.h, r.h / rw);
      } else {
        const lh = r.h * leftFrac;
        const rh = r.h - lh;
        ratio = Math.max(r.w / lh, lh / r.w, r.w / rh, rh / r.w);
      }
      if (ratio < bestRatio) {
        bestRatio = ratio;
        bestSplit = i;
      }
    }

    const leftItems = items.slice(0, bestSplit);
    const rightItems = items.slice(bestSplit);
    const leftFrac = leftItems.reduce((s, n) => s + n.value, 0) / totalVal;

    if (splitHorizontal) {
      const lw = r.w * leftFrac;
      layout(leftItems, { x: r.x, y: r.y, w: lw, h: r.h });
      layout(rightItems, { x: r.x + lw, y: r.y, w: r.w - lw, h: r.h });
    } else {
      const lh = r.h * leftFrac;
      layout(leftItems, { x: r.x, y: r.y, w: r.w, h: lh });
      layout(rightItems, { x: r.x, y: r.y + lh, w: r.w, h: r.h - lh });
    }
  }

  layout(nodes, rect);
  return cells;
}

export function Treemap({ nodes, unit, accent, accentDim }: TreemapProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let startTs: number | null = null;
    const DURATION = 1000;

    const sorted = [...nodes].sort((a, b) => b.value - a.value);
    const maxVal = sorted[0]?.value ?? 1;

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
      const W = canvas.width / dpr;
      const H = canvas.height / dpr;
      ctx.clearRect(0, 0, W, H);

      const cells = buildTreemap(sorted, { x: 0, y: 0, w: W, h: H });
      const PAD = 2;

      cells.forEach((cell) => {
        const isTop = cell.value === maxVal;
        const fillHex = Math.round(p * (isTop ? 0x2a : 0x55))
          .toString(16)
          .padStart(2, "0");
        const cBase = isTop ? accent : accentDim;

        ctx.fillStyle = `${cBase}${fillHex}`;
        ctx.fillRect(cell.x + PAD, cell.y + PAD, cell.w - PAD * 2, cell.h - PAD * 2);

        ctx.strokeStyle = cBase;
        ctx.lineWidth = isTop ? 1.5 : 0.8;
        ctx.globalAlpha = p;
        ctx.strokeRect(cell.x + PAD, cell.y + PAD, cell.w - PAD * 2, cell.h - PAD * 2);
        ctx.globalAlpha = 1;

        const cw = cell.w - PAD * 2;
        const ch = cell.h - PAD * 2;
        if (cw < 24 || ch < 14) return;

        ctx.save();
        ctx.beginPath();
        ctx.rect(cell.x + PAD, cell.y + PAD, cw, ch);
        ctx.clip();
        ctx.globalAlpha = p;

        const fontSize = Math.min(12, Math.max(8, Math.min(cw * 0.14, ch * 0.22)));
        const cx = cell.x + PAD + cw / 2;
        const cy = cell.y + PAD + ch / 2;

        const rawLabel = cell.label;
        const label = rawLabel.length > 14 ? rawLabel.slice(0, 13) + "…" : rawLabel;
        const valueStr = cell.value.toLocaleString() + (unit ? ` ${unit}` : "");

        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        if (ch > 38) {
          ctx.font = `500 ${fontSize}px 'IBM Plex Mono', monospace`;
          ctx.fillStyle = isTop ? accent : C.muted;
          ctx.fillText(label, cx, cy - fontSize * 0.75);

          ctx.font = `400 ${Math.max(8, fontSize - 1)}px 'IBM Plex Mono', monospace`;
          ctx.fillStyle = isTop ? C.white : C.body;
          ctx.fillText(valueStr, cx, cy + fontSize * 0.75);
        } else {
          ctx.font = `500 ${fontSize}px 'IBM Plex Mono', monospace`;
          ctx.fillStyle = isTop ? accent : C.muted;
          ctx.fillText(label, cx, cy);
        }

        ctx.globalAlpha = 1;
        ctx.restore();
      });

      if (p < 1) raf = requestAnimationFrame(draw);
    }

    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [nodes, unit, accent, accentDim]);

  return <canvas ref={canvasRef} style={{ width: "100%", height: 260, display: "block" }} />;
}
