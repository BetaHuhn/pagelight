import type { CSSProperties } from "react";

export default function GlowText({
  text,
  direction = "right",
  color,
  pauseMs = 0,
  strength = 1,
}: {
  text: string;
  direction?: "left" | "right";
  color: string;
  pauseMs?: number;
  strength?: number;
}) {
  const fromX = direction === "left" ? "-100%" : "100%";
  const toX = direction === "left" ? "100%" : "-100%";

  const safeStrength = Number.isFinite(strength) ? Math.min(1, Math.max(0, strength)) : 1;
  const bandAlpha = 0.9 * safeStrength;

  const sweepMs = 3400;
  const safePauseMs = Number.isFinite(pauseMs) ? Math.max(0, pauseMs) : 0;
  const totalMs = sweepMs + safePauseMs;

  const sweepPct = safePauseMs > 0 ? (sweepMs / totalMs) * 100 : 100;
  const fadeInPct = sweepPct * 0.16;
  const holdPct = sweepPct * 0.7;

  const pct = (n: number) => `${Math.min(100, Math.max(0, n)).toFixed(3)}%`;

  const styleVars = {
    "--glow-color": color,
    "--glow-opacity": String(safeStrength),
    "--glow-band-alpha": String(bandAlpha),
    "--from-x": fromX,
    "--to-x": toX,
  } as CSSProperties;

  return (
    <>
      <style>{`
                .glowText { position: relative; display: inline-block; }
                .glowText::after {
                    content: attr(data-text);
                    position: absolute;
                    inset: 0;
                    color: transparent;
                    background: linear-gradient(
                        90deg,
                        rgba(255,255,255,0) 0%,
                        rgba(255,255,255,var(--glow-band-alpha)) 50%,
                        rgba(255,255,255,0) 100%
                    );
                    background-size: 200% 100%;
                    background-repeat: no-repeat;
                    background-position: var(--from-x) 50%;
                    -webkit-background-clip: text;
                    background-clip: text;
                    filter: drop-shadow(0 0 5px var(--glow-color)) drop-shadow(0 0 10px var(--glow-color));
                    opacity: 0;
                    pointer-events: none;
                    will-change: background-position, opacity;
                    animation: glowTextSweep ${totalMs}ms ease-in-out infinite;
                }
                @keyframes glowTextSweep {
                    0% { background-position: var(--from-x) 50%; opacity: 0; }
                    ${pct(fadeInPct)} { opacity: var(--glow-opacity); }
                    ${pct(holdPct)} { opacity: var(--glow-opacity); }
                    ${pct(sweepPct)} { background-position: var(--to-x) 50%; opacity: 0; }
                    100% { background-position: var(--to-x) 50%; opacity: 0; }
                }
            `}</style>
      <span className="glowText" data-text={text} style={styleVars}>
        {text}
      </span>
    </>
  );
}
