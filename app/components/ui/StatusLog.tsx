"use client";

import { useEffect, useRef } from "react";
import { C } from "@/lib/theme";

export type StatusLogProps = {
  lines: string[];
  accent: string;
};

export function StatusLog({ lines, accent }: StatusLogProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!ref.current) return;
    ref.current.scrollTop = ref.current.scrollHeight;
  }, [lines]);
  return (
    <div
      ref={ref}
      style={{
        height: 150,
        overflowY: "auto",
        fontFamily: "'Geist Mono', monospace",
        fontSize: 11,
        color: C.muted,
        lineHeight: 1.9,
        padding: "12px 16px",
        background: C.bg,
        border: `1px solid ${C.border}`,
        borderRadius: C.borderRadius,
      }}
    >
      {lines.map((l, i) => (
        <div
          key={i}
          style={{
            color: i === lines.length - 1 ? accent : C.muted,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          <span style={{ color: "#5c3c0a", marginRight: 8 }}>›</span>
          {l}
        </div>
      ))}
    </div>
  );
}
