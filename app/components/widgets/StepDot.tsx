import { T } from "../../lib/theme";

interface StepDotProps {
    n: number;
    active: boolean;
    done: boolean;
}

// ─── Step indicator ───────────────────────────────────────────────────────────
export default function StepDot({ n, active, done }: StepDotProps) {
    return (
        <div style={{
            width: 28, height: 28, borderRadius: "50%",
            border: `1px solid ${done ? T.accent : active ? T.accent : T.border}`,
            background: done ? T.accent : active ? `${T.accent}18` : "transparent",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "'Geist Mono', monospace", fontSize: 11,
            color: done ? T.bg : active ? T.accent : T.muted,
            flexShrink: 0,
            transition: "all 0.3s",
        }}>
            {done ? "✓" : n}
        </div>
    );
}