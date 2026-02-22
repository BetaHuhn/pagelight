"use client";

import { useEffect, useRef } from "react";

export function BgCanvas({ opacity = 0.1 }: { opacity?: number }) {
  const ref = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    let raf = 0;

    const state = {
      w: 0,
      h: 0,
      dpr: 1,
      cols: 0,
      rows: 0,
      left: 0,
      top: 0,
      mouseX: 0,
      mouseY: 0,
      mouseVX: 0,
      mouseVY: 0,
      flowX: 0,
      flowY: 0,
      focusX: 0,
      focusY: 0,
      jumpX: 0,
      jumpY: 0,
      jumpStrength: 0,
      lastMouseX: 0,
      lastMouseY: 0,
      mouseActive: false,
      lastT: 0,
    };

    const dotSpacing = 28;
    const dotRadius = 1.1;
    const influenceRadius = 180;
    const velocityToOffset = 0.02;
    const maxVelocityForOffset = 800;
    const flowEase = 0.02;
    const focusEase = 0.18;
    const jumpDistancePx = 100;
    const jumpDecay = 0.88;

    const resize = () => {
      const rect = c.getBoundingClientRect();
      const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));

      state.w = rect.width;
      state.h = rect.height;
      state.left = rect.left;
      state.top = rect.top;
      state.dpr = dpr;

      c.width = Math.max(1, Math.floor(rect.width * dpr));
      c.height = Math.max(1, Math.floor(rect.height * dpr));

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      state.cols = Math.ceil(state.w / dotSpacing) + 1;
      state.rows = Math.ceil(state.h / dotSpacing) + 1;

      if (!state.mouseActive) {
        state.mouseX = state.w / 2;
        state.mouseY = state.h / 2;
        state.lastMouseX = state.mouseX;
        state.lastMouseY = state.mouseY;
        state.focusX = state.mouseX;
        state.focusY = state.mouseY;
        state.jumpStrength = 0;
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      const wasActive = state.mouseActive;
      state.mouseActive = true;
      state.mouseX = e.clientX - state.left;
      state.mouseY = e.clientY - state.top;

      if (!wasActive) {
        state.lastMouseX = state.mouseX;
        state.lastMouseY = state.mouseY;
        state.focusX = state.mouseX;
        state.focusY = state.mouseY;
        state.jumpStrength = 0;
      }
    };

    const onPointerLeave = () => {
      state.mouseActive = false;
      state.mouseVX *= 0.6;
      state.mouseVY *= 0.6;
    };

    resize();
    window.addEventListener("resize", resize, { passive: true });
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("mouseleave", onPointerLeave, { passive: true });
    window.addEventListener("blur", onPointerLeave);

    const draw = (t: number) => {
      const dt = Math.max(0.001, Math.min(0.05, (t - (state.lastT || t)) / 1000));
      state.lastT = t;

      const dx = state.mouseX - state.lastMouseX;
      const dy = state.mouseY - state.lastMouseY;
      const vx = dx / dt;
      const vy = dy / dt;

      if (Math.hypot(dx, dy) > jumpDistancePx) {
        state.jumpX = state.focusX;
        state.jumpY = state.focusY;
        state.jumpStrength = 1;
      }

      state.mouseVX = state.mouseVX * 0.9 + vx * 0.1;
      state.mouseVY = state.mouseVY * 0.9 + vy * 0.1;
      state.lastMouseX = state.mouseX;
      state.lastMouseY = state.mouseY;

      if (!state.mouseActive) {
        state.mouseX += (state.w / 2 - state.mouseX) * 0.02;
        state.mouseY += (state.h / 2 - state.mouseY) * 0.02;
        state.mouseVX *= 0.92;
        state.mouseVY *= 0.92;
        state.flowX *= 0.94;
        state.flowY *= 0.94;
      }

      state.focusX = state.focusX + (state.mouseX - state.focusX) * focusEase;
      state.focusY = state.focusY + (state.mouseY - state.focusY) * focusEase;
      state.jumpStrength *= jumpDecay;
      if (state.jumpStrength < 0.001) state.jumpStrength = 0;

      ctx.clearRect(0, 0, state.w, state.h);
      ctx.fillStyle = `rgba(245,166,35,${opacity})`;

      const vr = influenceRadius;
      const invVr2 = 1 / (vr * vr);
      const speed = Math.hypot(state.mouseVX, state.mouseVY);
      const speedNorm = Math.min(1, speed / 2200);

      const clampedVX = Math.max(
        -maxVelocityForOffset,
        Math.min(maxVelocityForOffset, state.mouseVX)
      );
      const clampedVY = Math.max(
        -maxVelocityForOffset,
        Math.min(maxVelocityForOffset, state.mouseVY)
      );

      const clampedSpeed = Math.hypot(clampedVX, clampedVY);
      let targetFlowX = 0;
      let targetFlowY = 0;
      if (clampedSpeed > 0.001) {
        const ux = clampedVX / clampedSpeed;
        const uy = clampedVY / clampedSpeed;
        const s = Math.min(1, clampedSpeed / maxVelocityForOffset);
        const eased = Math.pow(s, 0.65);
        const mag = eased * maxVelocityForOffset * velocityToOffset;
        targetFlowX = ux * mag;
        targetFlowY = uy * mag;
      }
      state.flowX = state.flowX + (targetFlowX - state.flowX) * flowEase;
      state.flowY = state.flowY + (targetFlowY - state.flowY) * flowEase;

      for (let y = 0; y < state.rows; y++) {
        const baseY = y * dotSpacing;
        for (let x = 0; x < state.cols; x++) {
          const baseX = x * dotSpacing;

          const mdx = baseX - state.focusX;
          const mdy = baseY - state.focusY;
          const d2 = mdx * mdx + mdy * mdy;

          const mainFalloff = Math.exp(-d2 * invVr2);
          let falloff = mainFalloff;
          if (state.jumpStrength > 0) {
            const jdx = baseX - state.jumpX;
            const jdy = baseY - state.jumpY;
            const jd2 = jdx * jdx + jdy * jdy;
            const jumpFalloff = Math.exp(-jd2 * invVr2) * state.jumpStrength;
            falloff = Math.min(1, mainFalloff + jumpFalloff);
          }
          const ox = state.flowX * falloff;
          const oy = state.flowY * falloff;
          const r = dotRadius + falloff * 0.9 * speedNorm;

          ctx.beginPath();
          ctx.arc(baseX + ox, baseY + oy, r, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("mouseleave", onPointerLeave);
      window.removeEventListener("blur", onPointerLeave);
    };
  }, [opacity]);

  return (
    <canvas
      ref={ref}
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 0,
      }}
    />
  );
}
