"use client";

import { useState, useRef, useEffect } from "react";
import BgCanvas from "./BgCanvas";
import StatusLog from "./ScrollingLogLines";
import ThinkingDots from "./ThinkingDots";
import StepDot from "./widgets/StepDot";
import { T } from "../lib/theme";
import { generateArticleVisualization } from "../lib/ai";

// ─── Fonts ───────────────────────────────────────────────────────────────────
const FONT_IMPORT = `@import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Geist+Mono:wght@300;400;500&family=Geist:wght@300;400;500&display=swap');`;

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [article, setArticle]   = useState("");
  const [phase, setPhase]       = useState("input"); // input | generating | done | error
  const [log, setLog]           = useState([]);
  const [html, setHtml]         = useState("");
  const [blobUrl, setBlobUrl]   = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const prevBlobUrl             = useRef(null);
  const textareaRef             = useRef(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 600);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  const addLog = (msg) => setLog(prev => [...prev, msg]);

  const wordCount = article.trim().split(/\s+/).filter(Boolean).length;
  const canGenerate = wordCount >= 50;

  // Cleanup blob URLs
  useEffect(() => () => { if (prevBlobUrl.current) URL.revokeObjectURL(prevBlobUrl.current); }, []);

  const generate = async () => {
    if (!canGenerate) return;
    setPhase("generating");
    setLog(["Sending article to Claude for analysis…"]);

    try {
      addLog("Identifying key data points and narrative structure…");

      const data = await generateArticleVisualization(article)
      
      addLog("Generating interactive widgets…");

      const raw = data?.map(b => b.text || "").join("") || "";

      // Strip any accidental markdown fences
      const cleaned = raw.replace(/^```html\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "").trim();

      if (!cleaned.startsWith("<!") && !cleaned.startsWith("<html")) {
        throw new Error("Claude returned unexpected output. Try again.");
      }

      addLog("Rendering interactive article…");

      // Blob URL is only used for download — NOT for iframe src (blocked by CSP).
      // The iframe uses srcdoc instead to inline the HTML directly.
      if (prevBlobUrl.current) URL.revokeObjectURL(prevBlobUrl.current);
      const blob = new Blob([cleaned], { type: "text/html" });
      const url  = URL.createObjectURL(blob);
      prevBlobUrl.current = url;

      setHtml(cleaned);
      setBlobUrl(url);
      setPhase("done");
      addLog("Done! Rendering below ↓");

    } catch (err) {
      addLog(`Error: ${err.message}`);
      setPhase("error");
    }
  };

  const reset = () => {
    setPhase("input");
    setArticle("");
    setLog([]);
    setHtml("");
  };

  // ─── Step tracker ──────────────────────────────────────────────────────────
  const steps = [
    { label: "Paste article" },
    { label: "Claude analyses" },
    { label: "Visualizations built" },
  ];
  const stepIdx = phase === "input" ? 0 : phase === "generating" ? 1 : 2;

  return (
    <>
      <style>{`
        ${FONT_IMPORT}
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: ${T.bg}; color: ${T.text}; font-family: 'Geist', sans-serif; }
        @keyframes blink { 0%,100%{opacity:0.2} 50%{opacity:1} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:none} }
        @keyframes pulse { 0%,100%{box-shadow:0 0 0 0 ${T.accent}30} 50%{box-shadow:0 0 0 8px ${T.accent}00} }
        ::-webkit-scrollbar { width: 4px; } 
        ::-webkit-scrollbar-track { background: ${T.bg}; }
        ::-webkit-scrollbar-thumb { background: ${T.border}; border-radius: 2px; }
        textarea { resize: none; outline: none; }
        textarea::placeholder { color: ${T.muted}; }
      `}</style>

      <BgCanvas />

      <div style={{
        position: "relative", zIndex: 1,
        minHeight: "100vh",
        display: "flex", flexDirection: "column",
      }}>

        {/* ── Top bar ── */}
        <header style={{
          borderBottom: `1px solid ${T.border}`,
          padding: "0 32px",
          height: 52,
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: 64,
          background: `${T.surface}cc`,
          backdropFilter: "blur(12px)",
          position: "sticky", top: 0, zIndex: 10,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 8, height: 8, borderRadius: "50%",
              background: T.accent,
              boxShadow: `0 0 12px ${T.accent}`,
              animation: phase === "generating" ? "pulse 1.5s infinite" : "none",
            }} />
            <span style={{
              fontFamily: "'Geist Mono', monospace",
              fontSize: 13, fontWeight: 500,
              color: T.white, letterSpacing: "0.05em",
            }}>
              ARTICLE VISUALIZER
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
            {steps.map((s, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, opacity: i > stepIdx + 1 ? 0.3 : 1, transition: "opacity 0.4s" }}>
                <StepDot n={i + 1} active={i === stepIdx} done={i < stepIdx} />
                <span style={{
                  fontFamily: "'Geist Mono', monospace",
                  fontSize: 11, color: i === stepIdx ? T.accent : T.muted,
                  display: isMobile ? "none" : "block",
                }}>{s.label}</span>
                {i < steps.length - 1 && (
                  <div style={{ width: 24, height: 1, background: T.border, marginLeft: 4 }} />
                )}
              </div>
            ))}
          </div>

          {phase === "done" && (
            <button onClick={reset} style={{
              fontFamily: "'Geist Mono', monospace", fontSize: 11,
              color: T.muted, background: "transparent",
              border: `1px solid ${T.border}`, borderRadius: 4,
              padding: "5px 12px", cursor: "pointer",
              transition: "all 0.2s",
            }}
              onMouseEnter={e => { e.target.style.color = T.white; e.target.style.borderColor = T.muted; }}
              onMouseLeave={e => { e.target.style.color = T.muted; e.target.style.borderColor = T.border; }}
            >↩ New article</button>
          )}
        </header>

        {/* ── Body ── */}
        <main style={{ flex: 1, display: "flex", flexDirection: "column" }}>

          {/* INPUT PHASE */}
          {(phase === "input" || phase === "error") && (
            <div style={{
              flex: 1, display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
              padding: "48px 24px",
              animation: "fadeUp 0.5s ease both",
            }}>
              {/* Hero */}
              <div style={{ maxWidth: 560, width: "100%", marginBottom: 40, textAlign: "center" }}>
                <p style={{
                  fontFamily: "'Geist Mono', monospace", fontSize: 11,
                  color: T.accent, letterSpacing: "0.2em",
                  textTransform: "uppercase", marginBottom: 20,
                }}>
                  ◈ Powered by Claude
                </p>
                <h1 style={{
                  fontFamily: "'Instrument Serif', serif",
                  fontSize: "clamp(36px, 6vw, 64px)",
                  lineHeight: 1.1, color: T.white,
                  letterSpacing: "-1px", marginBottom: 16,
                }}>
                  Paste an article.<br />
                  <span style={{ color: T.accent, fontStyle: "italic" }}>Watch it come alive.</span>
                </h1>
                <p style={{
                  fontSize: 15, color: T.muted, lineHeight: 1.7, fontWeight: 300,
                }}>
                  Claude reads your article, identifies the key data and narrative beats, then builds a fully interactive editorial page — with bespoke animated visualizations woven between each section.
                </p>
              </div>

              {/* Textarea card */}
              <div style={{
                maxWidth: 680, width: "100%",
                background: T.surface,
                border: `1px solid ${phase === "error" ? T.red : T.border}`,
                borderRadius: 8,
                overflow: "hidden",
                boxShadow: "0 24px 64px rgba(0,0,0,0.4)",
              }}>
                {/* Card header */}
                <div style={{
                  padding: "12px 20px",
                  borderBottom: `1px solid ${T.border}`,
                  display: "flex", alignItems: "center", gap: 10,
                  background: T.panel,
                }}>
                  {["#f04a4a", "#f0a54a", "#c8f04a"].map(c => (
                    <div key={c} style={{ width: 9, height: 9, borderRadius: "50%", background: c, opacity: 0.7 }} />
                  ))}
                  <span style={{
                    fontFamily: "'Geist Mono', monospace", fontSize: 11,
                    color: T.muted, marginLeft: 4,
                  }}>article.txt</span>
                  <div style={{ marginLeft: "auto" }}>
                    <span style={{
                      fontFamily: "'Geist Mono', monospace", fontSize: 11,
                      color: wordCount >= 50 ? T.accent : T.muted,
                    }}>
                      {wordCount} words {wordCount < 50 ? `(need ${50 - wordCount} more)` : "✓"}
                    </span>
                  </div>
                </div>

                <textarea
                  ref={textareaRef}
                  value={article}
                  onChange={e => setArticle(e.target.value)}
                  placeholder="Paste your article here — news, research, blog post, report… anything with data or narrative structure.

Claude will analyse it and automatically design visualizations that bring the key facts and trends to life."
                  style={{
                    width: "100%", height: 280,
                    background: "transparent",
                    border: "none",
                    padding: "20px 24px",
                    fontFamily: "'Geist', sans-serif",
                    fontSize: 14, lineHeight: 1.8,
                    color: T.text, fontWeight: 300,
                  }}
                />

                {/* Card footer */}
                <div style={{
                  padding: "12px 20px",
                  borderTop: `1px solid ${T.border}`,
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  background: T.panel,
                }}>
                  {phase === "error" && (
                    <span style={{
                      fontFamily: "'Geist Mono', monospace", fontSize: 11, color: T.red,
                    }}>
                      ✕ {log[log.length - 1]}
                    </span>
                  )}
                  {phase !== "error" && (
                    <span style={{
                      fontFamily: "'Geist Mono', monospace", fontSize: 11, color: T.muted,
                    }}>
                      Works best with 200+ words
                    </span>
                  )}

                  <button
                    onClick={generate}
                    disabled={!canGenerate}
                    style={{
                      fontFamily: "'Geist Mono', monospace", fontSize: 12, fontWeight: 500,
                      background: canGenerate ? T.accent : T.border,
                      color: canGenerate ? T.bg : T.muted,
                      border: "none", borderRadius: 5,
                      padding: "10px 24px", cursor: canGenerate ? "pointer" : "not-allowed",
                      transition: "all 0.2s",
                      letterSpacing: "0.05em",
                    }}
                    onMouseEnter={e => { if (canGenerate) e.target.style.opacity = "0.85"; }}
                    onMouseLeave={e => { e.target.style.opacity = "1"; }}
                  >
                    {phase === "error" ? "Try again →" : "Visualize article →"}
                  </button>
                </div>
              </div>

              {/* Feature hints */}
              <div style={{
                display: "flex", gap: 24, marginTop: 36, flexWrap: "wrap",
                justifyContent: "center", maxWidth: 600,
              }}>
                {[
                  ["◈", "Animated charts", "Canvas-based, smooth 60fps"],
                  ["◈", "Editorial design", "Custom aesthetic per article"],
                  ["◈", "Woven narrative", "Visuals placed between text"],
                ].map(([icon, title, sub]) => (
                  <div key={title} style={{ textAlign: "center", minWidth: 140 }}>
                    <div style={{
                      fontFamily: "'Geist Mono', monospace",
                      fontSize: 11, color: T.accent, marginBottom: 6,
                    }}>{icon} {title}</div>
                    <div style={{ fontSize: 12, color: T.muted, fontWeight: 300 }}>{sub}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* GENERATING PHASE */}
          {phase === "generating" && (
            <div style={{
              flex: 1, display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
              padding: "48px 24px", gap: 32,
              animation: "fadeUp 0.4s ease both",
            }}>
              {/* Animated spinner ring */}
              <div style={{ position: "relative", width: 120, height: 120 }}>
                <svg viewBox="0 0 120 120" style={{
                  width: 120, height: 120,
                  animation: "spin 2s linear infinite",
                  position: "absolute",
                }}>
                  <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes dash{0%{stroke-dashoffset:280}100%{stroke-dashoffset:0}}`}</style>
                  <circle cx="60" cy="60" r="52"
                    fill="none" stroke={T.border} strokeWidth="2" />
                  <circle cx="60" cy="60" r="52"
                    fill="none" stroke={T.accent} strokeWidth="2"
                    strokeDasharray="80 246"
                    strokeLinecap="round"
                  />
                </svg>
                <div style={{
                  position: "absolute", inset: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <div style={{
                    fontFamily: "'Instrument Serif', serif",
                    fontSize: 28, color: T.accent, lineHeight: 1,
                  }}>✦</div>
                </div>
              </div>

              <div style={{ textAlign: "center", maxWidth: 380 }}>
                <h2 style={{
                  fontFamily: "'Instrument Serif', serif",
                  fontSize: 28, color: T.white,
                  marginBottom: 12, letterSpacing: "-0.5px",
                }}>
                  Claude is reading…
                  <ThinkingDots />
                </h2>
                <p style={{ fontSize: 14, color: T.muted, fontWeight: 300, lineHeight: 1.7 }}>
                  Analysing narrative structure, extracting key data points, and designing bespoke visualizations for your article.
                </p>
              </div>

              <div style={{ width: "100%", maxWidth: 500 }}>
                <StatusLog lines={log} />
              </div>
            </div>
          )}

          {/* DONE PHASE – full-page iframe via srcdoc (avoids CSP blob: restriction) */}
          {phase === "done" && html && (
            <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
              {/* Toolbar */}
              <div style={{
                padding: "8px 20px",
                background: T.surface,
                borderBottom: `1px solid ${T.border}`,
                display: "flex", alignItems: "center", gap: 12,
              }}>
                <div style={{
                  flex: 1, background: T.panel,
                  border: `1px solid ${T.border}`,
                  borderRadius: 4, padding: "5px 12px",
                  fontFamily: "'Geist Mono', monospace", fontSize: 11,
                  color: T.muted, display: "flex", alignItems: "center", gap: 8,
                }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: T.accent }} />
                  srcdoc:// interactive-article
                </div>
                {blobUrl && (
                  <a
                    href={blobUrl}
                    download="article-visualized.html"
                    style={{
                      fontFamily: "'Geist Mono', monospace", fontSize: 11,
                      color: T.muted, textDecoration: "none",
                      border: `1px solid ${T.border}`, borderRadius: 4,
                      padding: "5px 14px",
                      transition: "all 0.2s",
                      whiteSpace: "nowrap",
                    }}
                    onMouseEnter={e => { e.target.style.color = T.accent; e.target.style.borderColor = T.accent; }}
                    onMouseLeave={e => { e.target.style.color = T.muted; e.target.style.borderColor = T.border; }}
                  >
                    ↓ Download HTML
                  </a>
                )}
              </div>

              {/* srcdoc inlines HTML directly — no blob URL load, no CSP issue */}
              <iframe
                srcdoc={html}
                style={{
                  flex: 1, width: "100%",
                  border: "none",
                  minHeight: "calc(100vh - 52px - 44px)",
                }}
                title="Visualized Article"
                sandbox="allow-scripts"
              />
            </div>
          )}
        </main>
      </div>
    </>
  );
}
