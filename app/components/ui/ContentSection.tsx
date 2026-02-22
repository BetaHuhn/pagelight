import { C } from "@/lib/theme";

export default function ContentSection({
  title,
  accent,
  children,
  style,
}: {
  title: string;
  accent?: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <section
      className="content-section"
      style={{
        background: C.surface,
        border: `1px solid ${C.border}`,
        borderRadius: C.borderRadius,
        padding: "22px 24px",
        ...style,
      }}
    >
      <style>{`
        @media (max-width: 600px) {
          .content-section { padding: 16px !important; }
        }
      `}</style>
      <h2
        style={{
          fontFamily: "'Geist Mono', monospace",
          fontSize: 12,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: C.muted,
          marginBottom: 15,
        }}
      >
        <span style={{ color: accent }}>✦</span> {title}
      </h2>
      {children}
    </section>
  );
}
