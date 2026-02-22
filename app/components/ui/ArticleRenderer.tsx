"use client";

import { useState } from "react";
import { IconCheck, IconCopy } from "@tabler/icons-react";
import { C, THEMES } from "@/lib/theme";
import type { ArticleDocument } from "@/lib/types";
import { Widget } from "@/components/widgets/Widget";
import Button from "./Button";

export type ArticleRendererProps = {
  data: ArticleDocument;
};

export function ArticleRenderer({ data }: ArticleRendererProps) {
  const theme = THEMES[data.theme] || THEMES.financial;
  const { accent, dim: accentDim } = theme;

  const [copied, setCopied] = useState(false);

  return (
    <div
      style={{
        fontFamily: "'IBM Plex Sans', sans-serif",
        minHeight: "100%",
        padding: "60px 24px 100px",
      }}
    >
      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }
        @keyframes growBar { from { transform: scaleY(0); transform-origin: bottom; } to { transform: scaleY(1); transform-origin: bottom; } }
      `}</style>
      <div style={{ width: "100%" }}>
        <header style={{ marginBottom: 52, animation: "fadeUp 0.5s ease 0.1s both" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
            <div style={{ height: 1, width: 32, background: accent }} />
            <span
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 11,
                color: accent,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
              }}
            >
              {data.theme} · {data.date}
            </span>
          </div>
          <h1
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "clamp(32px, 5vw, 54px)",
              fontWeight: 900,
              color: C.white,
              lineHeight: 1.08,
              letterSpacing: "-0.02em",
              margin: "0 0 20px",
            }}
          >
            {data.title}
          </h1>
          {data.deck && (
            <p
              style={{
                fontFamily: "'IBM Plex Sans', sans-serif",
                fontSize: 18,
                fontWeight: 300,
                color: C.muted,
                lineHeight: 1.65,
                margin: "0 0 20px",
              }}
            >
              {data.deck}
            </p>
          )}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              paddingTop: 20,
              borderTop: `1px solid ${C.border}`,
            }}
          >
            {data.byline && (
              <span
                style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: C.muted }}
              >
                {data.byline}
              </span>
            )}
            {copied ? (
              <Button
                kind="secondary"
                onClick={() => {
                  const url = window.location.href;
                  navigator.clipboard.writeText(url);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "10px",
                  borderRadius: 8,
                }}
              >
                <IconCheck size={14} />
                URL Copied!
              </Button>
            ) : (
              <Button
                kind="secondary"
                onClick={() => {
                  const url = window.location.href;
                  navigator.clipboard.writeText(url);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "10px",
                  borderRadius: 8,
                }}
              >
                <IconCopy size={14} />
                Share
              </Button>
            )}
          </div>
        </header>

        {(data.sections || []).map((section, idx) => (
          <div key={idx} style={{ animation: `fadeUp 0.5s ease ${0.15 + idx * 0.04}s both` }}>
            {section.type === "prose" && (
              <section style={{ marginBottom: 32 }}>
                {section.heading && (
                  <h2
                    style={{
                      fontFamily: "'Playfair Display', serif",
                      fontSize: 26,
                      fontWeight: 700,
                      color: C.white,
                      marginBottom: 20,
                      paddingBottom: 14,
                      borderBottom: `1px solid ${C.border}`,
                    }}
                  >
                    {section.heading}
                  </h2>
                )}
                {(section.paragraphs || []).map((para, pi) => (
                  <p
                    key={pi}
                    style={{
                      fontSize: 16,
                      fontWeight: 300,
                      color: C.body,
                      lineHeight: 1.85,
                      marginBottom: 18,
                    }}
                  >
                    {para}
                  </p>
                ))}
              </section>
            )}
            {section.type === "widget" && (
              <Widget section={section} accent={accent} accentDim={accentDim} />
            )}
          </div>
        ))}

        <footer
          style={{
            marginTop: 64,
            paddingTop: 24,
            borderTop: `1px solid ${C.border}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 10,
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ height: 1, width: 24, background: accentDim }} />
            <span
              style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: C.muted }}
            >
              {data.date ? `${data.date}` : ""}
            </span>
          </div>
          {data.source && (
            <span
              style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: C.muted }}
            >
              Source: {data.source}
            </span>
          )}
        </footer>
      </div>
    </div>
  );
}
