"use client";

import { useEffect, useRef } from "react";
import { C } from "../../lib/theme";

export function StatusLog({ lines, accent }) {
  const ref = useRef(null);
  useEffect(() => { if (ref.current) ref.current.scrollTop = ref.current.scrollHeight; }, [lines]);
  return (
    <div ref={ref} style={{ height: 120, overflowY: "auto", fontFamily: "'Geist Mono', monospace", fontSize: 11, color: C.muted, lineHeight: 1.9, padding: "12px 16px", background: C.bg, border: `1px solid ${C.border}`, borderRadius: 4 }}>
      {lines.map((l, i) => (
        <div key={i} style={{ color: i === lines.length - 1 ? accent : C.muted }}>
          <span style={{ color: "#5c3c0a", marginRight: 8 }}>›</span>{l}
        </div>
      ))}
    </div>
  );
}
