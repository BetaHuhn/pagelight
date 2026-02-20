import { useRef, useEffect } from "react";
import { T } from "../lib/theme";

// ─── Scrolling log lines ──────────────────────────────────────────────────────
export default function StatusLog({ lines }: { lines: string[] }) {
    const ref = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (ref.current) ref.current.scrollTop = ref.current.scrollHeight;
    }, [lines]);

    return (
        <div ref={ref} style={{
            height: 120, overflowY: "auto",
            fontFamily: "'Geist Mono', monospace", fontSize: 11,
            color: T.muted, lineHeight: 1.9,
            padding: "12px 16px",
            background: T.bg,
            border: `1px solid ${T.border}`,
            borderRadius: 4,
        }}>
            {lines.map((l, i) => (
                <div key={i} style={{ color: i === lines.length - 1 ? T.accent : T.muted }}>
                    <span style={{ color: T.accentDim, marginRight: 8 }}>›</span>{l}
                </div>
            ))}
        </div>
    );
}