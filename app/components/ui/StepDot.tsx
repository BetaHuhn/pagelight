"use client";

import { C } from "@/lib/theme";

export type StepDotProps = {
  n: number;
  active: boolean;
  done: boolean;
  accent: string;
};

export function StepDot({ n, active, done, accent }: StepDotProps) {
  return (
    <div
      style={{
        width: 18,
        height: 18,
        borderRadius: "50%",
        border: `1px solid ${done ? accent : active ? accent : C.border}`,
        background: done ? accent : active ? accent + "18" : "transparent",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Geist Mono', monospace",
        fontSize: 11,
        color: done ? C.bg : active ? accent : C.muted,
        flexShrink: 0,
        transition: "all 0.3s",
      }}
    >
      {done ? "✓" : n}
    </div>
  );
}
