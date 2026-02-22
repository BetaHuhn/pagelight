import { C } from "@/app/lib/theme";

export default function Button({ kind = 'primary', children, onClick, style, disabled }: { kind?: 'primary' | 'secondary'; children: React.ReactNode; onClick?: () => void; style?: React.CSSProperties; disabled?: boolean }) {
    if (kind === 'primary') {
        return (
            <button
                onClick={onClick}
                disabled={disabled}
                style={{
                    fontFamily: "'Geist Mono', monospace", fontSize: 12, fontWeight: 500,
                    background: C.border,
                    color: C.muted,
                    border: "none", borderRadius: 6,
                    padding: "10px 14px",
                    transition: "all 0.2s",
                    letterSpacing: "0.05em",
                    ...style,
                }}
                onMouseEnter={(e: MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.opacity = "0.85"; }}
                onMouseLeave={(e: MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.opacity = "1"; }}
            >
                {children}
            </button>
        )
    }

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            style={{
                fontFamily: "'Geist Mono', monospace", fontSize: 11,
                color: C.muted, background: "transparent",
                border: `1px solid ${C.border}`, borderRadius: 4,
                padding: "5px 12px", cursor: "pointer",
                transition: "all 0.2s",
                flexShrink: 0,
                ...style,
            }}
            onMouseEnter={(e: MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.color = C.white; e.currentTarget.style.borderColor = C.muted; }}
            onMouseLeave={(e: MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.color = C.muted; e.currentTarget.style.borderColor = C.border; }}
        >
            {children}
        </button>
    )
}