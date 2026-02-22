"use client";

import { useEffect, useRef } from "react";
import { C } from "@/lib/theme";
import { ease } from "@/lib/utils";
import type {
  StatComparisonProps as StatComparisonDataProps,
  StatComparisonSide,
} from "@/lib/types";

export type StatComparisonProps = StatComparisonDataProps & {
  accent: string;
  accentDim: string;
};

const Block = ({
  data,
  barRef,
  isAccent,
  accent,
  accentDim,
}: {
  data: StatComparisonSide;
  barRef: React.RefObject<HTMLDivElement | null>;
  isAccent: boolean;
  accent: string;
  accentDim: string;
}) => (
  <div style={{ flex: 1, padding: "16px 0" }}>
    <div
      style={{
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: 10,
        color: isAccent ? accent : C.muted,
        textTransform: "uppercase",
        letterSpacing: "0.12em",
        marginBottom: 8,
      }}
    >
      {data.label}
    </div>
    <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
      <div
        style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 42,
          fontWeight: 900,
          color: C.white,
          lineHeight: 1,
        }}
      >
        {data.prefix || ""}
        {typeof data.value === "number" ? data.value.toLocaleString() : data.value}
      </div>
      {data.unit && (
        <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: C.muted }}>
          {data.unit}
        </div>
      )}
    </div>
    <div
      style={{
        height: 4,
        background: C.border,
        borderRadius: 1,
        marginTop: 16,
        overflow: "hidden",
      }}
    >
      <div
        ref={barRef}
        style={{
          height: "100%",
          width: "0%",
          background: isAccent ? accent : accentDim,
          borderRadius: 1,
          boxShadow: isAccent ? `0 0 10px ${accent}50` : "none",
        }}
      />
    </div>
  </div>
);

export function StatComparison({
  left,
  right,
  description,
  accent,
  accentDim,
}: StatComparisonProps) {
  const leftRef = useRef<HTMLDivElement | null>(null);
  const rightRef = useRef<HTMLDivElement | null>(null);
  const maxVal = Math.max(left.value, right.value);

  useEffect(() => {
    let raf = 0;
    let startTs: number | null = null;
    const DURATION = 1400;
    function draw(ts: number) {
      if (!startTs) startTs = ts;
      const p = ease((ts - startTs) / DURATION);
      if (leftRef.current) leftRef.current.style.width = (left.value / maxVal) * p * 100 + "%";
      if (rightRef.current) rightRef.current.style.width = (right.value / maxVal) * p * 100 + "%";
      if (p < 1) raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [left, right, maxVal]);

  return (
    <div>
      <div style={{ display: "flex", gap: 0 }}>
        <Block
          data={left}
          barRef={leftRef}
          isAccent={false}
          accent={accent}
          accentDim={accentDim}
        />
        <div style={{ width: 1, background: C.border, margin: "0 28px" }} />
        <Block data={right} barRef={rightRef} isAccent accent={accent} accentDim={accentDim} />
      </div>
      {description && (
        <div style={{ marginTop: 16, padding: "12px 0px" }}>
          <p
            style={{
              fontFamily: "'IBM Plex Sans', sans-serif",
              fontSize: 13,
              color: C.body,
              margin: 0,
            }}
          >
            {description}
          </p>
        </div>
      )}
    </div>
  );
}
