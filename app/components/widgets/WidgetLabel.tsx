"use client";

export type WidgetLabelProps = {
  text: string;
  accent: string;
  accentDim: string;
};

export function WidgetLabel({ text, accent, accentDim }: WidgetLabelProps) {
  return (
    <div
      style={{
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: 11,
        color: accent,
        letterSpacing: "0.16em",
        textTransform: "uppercase",
        marginBottom: 20,
        display: "flex",
        alignItems: "center",
        gap: 8,
      }}
    >
      <span
        style={{
          color: accentDim,
          display: "inline-block",
          animation: "widgetLabelPulse 2.8s ease-in-out infinite",
        }}
      >
        ◈
      </span>{" "}
      {text}
      <style>{`
        @keyframes widgetLabelPulse {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50%       { opacity: 1;   transform: scale(1.2); }
        }
      `}</style>
    </div>
  );
}
