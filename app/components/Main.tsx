"use client";

import { useState, useRef, useEffect } from "react";
import { generateArticleVisualization } from "../lib/ai";
import { C, THEMES } from "../lib/theme";
import { ArticleRenderer } from "./ui/ArticleRenderer";
import { BgCanvas } from "./ui/BgCanvas";
import { StatusLog } from "./ui/StatusLog";
import { ThinkingDots } from "./ui/ThinkingDots";
import { StepDot } from "./ui/StepDot";

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const FONT_IMPORT = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:wght@300;400;500&family=Geist+Mono:wght@400;500&family=Geist:wght@300;400;500&display=swap');
`;

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const textareaRef             = useRef(null);
  const [article,     setArticle]     = useState("");
  const [phase,       setPhase]       = useState("input");
  const [log,         setLog]         = useState([]);
  const [articleData, setArticleData] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

//   const themeKeys = Object.keys(THEMES);
//   const randomKey = themeKeys[Math.floor(Math.random() * themeKeys.length)];
  // const [ACCENT, setAccent] = useState(THEMES[randomKey].accent);
  const [ACCENT, setAccent] = useState("#c8f04a");

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 600);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const addLog     = msg => setLog(prev => [...prev, msg]);
  const wordCount  = article.trim().split(/\s+/).filter(Boolean).length;
  const canGenerate = wordCount >= 50;

  const generate = async () => {
    if (!canGenerate) return;
    setPhase("generating");
    setLog(["Sending article to Pagelight AI for analysis…"]);

    try {
      wait(500).then(() => {
        addLog("Extracting key data points and narrative structure…");
      })

      const data = await generateArticleVisualization(article);

      const raw  = (data.content || []).map(b => b.text || "").join("");

      addLog("Parsing structured layout…");
      
      // Strip any accidental markdown fences
      const cleaned = raw
        .replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "")
        .trim();

      let parsed;
      try {
        parsed = JSON.parse(cleaned);
      } catch (e) {
        // Attempt to extract JSON from mixed response
        const match = cleaned.match(/\{[\s\S]+\}/);
        if (match) {
          try { parsed = JSON.parse(match[0]); }
          catch { throw new Error("Response contained invalid JSON. Try again."); }
        } else {
          throw new Error("No JSON found in response. Try again.");
        }
      }

      if (!Array.isArray(parsed.sections)) throw new Error("Missing sections array in response. Try again.");

      console.log('Parsed:', parsed)

      wait(200).then(() => {
        addLog("Rendering article with interactive widgets…");
      })

      await wait(500)
      setArticleData(parsed);
      const theme = THEMES[parsed.theme] || THEMES.financial;
      const { accent } = theme;
      setAccent(accent ?? ACCENT)
      setPhase("done");

    } catch (err) {
      addLog(`Error: ${err.message}`);
      setPhase("error");
    }
  };

  const reset   = () => { setPhase("input"); setArticle(""); setLog([]); setArticleData(null); setAccent('#c8f04a') };
  const steps   = [{ label: "Paste article" }, { label: "Analysing article" }, { label: "Rendering visualization" }];
  const stepIdx = phase === "input" || phase === "error" ? 0 : phase === "generating" ? 1 : 3;

  return (
    <>
      <style>{`
        ${FONT_IMPORT}
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: ${C.bg}; color: ${C.text}; font-family: 'Geist', sans-serif; }
        @keyframes blink { 0%,100%{opacity:0.2} 50%{opacity:1} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:none} }
        @keyframes pulse  { 0%,100%{box-shadow:0 0 0 0 ${ACCENT}30} 50%{box-shadow:0 0 0 8px ${ACCENT}00} }
        @keyframes spin   { to{transform:rotate(360deg)} }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: ${C.bg}; }
        ::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 2px; }
        textarea { resize: none; outline: none; }
        textarea::placeholder { color: ${C.muted}; }
      `}</style>

      <BgCanvas />

      <div style={{ position: "relative", zIndex: 1, minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: 'center', justifyContent: 'center' }}>

        {/* ── Top bar ── */}
        
            <header style={{
                  border: `1px solid ${C.border}`,
                  borderRadius: C.borderRadius,
                  padding: "0 16px",
                  height: 52,
                  width: '100%',
                  maxWidth: 800,
                  display: "flex", alignItems: "center", justifyContent: "space-between", gap: 64,
                  background: `${C.surface}cc`,
                  backdropFilter: "blur(12px)",
                  position: "sticky", top: 15, zIndex: 10,
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                    <div style={{
                      width: 8, height: 8, borderRadius: "50%",
                      background: ACCENT,
                      boxShadow: `0 0 12px ${ACCENT}`,
                      animation: phase === "generating" ? "pulse 1.5s infinite" : "none",
                      flexShrink: 0
                    }} />
                    <span style={{
                      fontFamily: "'Geist Mono', monospace",
                      fontSize: 13, fontWeight: 500,
                      color: C.white, letterSpacing: "0.05em",
                      flexShrink: 0
                    }}>
                      Pagelight AI
                    </span>
                  </div>
        
                  {phase === 'generating' && (
                    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                        {steps.map((s, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, opacity: i > stepIdx + 1 ? 0.3 : 1, transition: "opacity 0.4s", flexShrink: 0 }}>
                            <StepDot n={i + 1} active={i === stepIdx} done={i < stepIdx} accent={ACCENT} />
                            <span style={{
                            fontSize: 12, color: i === stepIdx ? ACCENT : C.muted,
                            fontWeight: 'semibold',
                            display: isMobile ? "none" : "block",
                            }}>{s.label}</span>
                            {i < steps.length - 1 && (
                            <div style={{ width: 24, height: 1, background: C.border, marginLeft: 4 }} />
                            )}
                        </div>
                        ))}
                    </div>
                  )}
        
                  {phase === "done" && (
                    <button onClick={reset} style={{
                      fontFamily: "'Geist Mono', monospace", fontSize: 11,
                      color: C.muted, background: "transparent",
                      border: `1px solid ${C.border}`, borderRadius: 4,
                      padding: "5px 12px", cursor: "pointer",
                      transition: "all 0.2s",
                      flexShrink: 0
                    }}
                      onMouseEnter={e => { e.target.style.color = C.white; e.target.style.borderColor = C.muted; }}
                      onMouseLeave={e => { e.target.style.color = C.muted; e.target.style.borderColor = C.border; }}
                    >+ New article</button>
                  )}

                  {phase === "input" && (
                    <a href="/about" style={{
                      fontFamily: "'Geist Mono', monospace", fontSize: 11,
                      color: C.muted, background: "transparent",
                      border: `1px solid ${C.border}`, borderRadius: 4,
                      padding: "5px 12px", cursor: "pointer",
                      transition: "all 0.2s",
                      flexShrink: 0
                    }}
                      onMouseEnter={e => { e.target.style.color = C.white; e.target.style.borderColor = C.muted; }}
                      onMouseLeave={e => { e.target.style.color = C.muted; e.target.style.borderColor = C.border; }}
                    >Introduction</a>
                  )}
                </header>

        <main style={{ flex: 1, display: "flex", flexDirection: "column", width: '100%' }}>

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
                    color: ACCENT, letterSpacing: "0.2em",
                    textTransform: "uppercase", marginBottom: 20,
                    }}>
                    Powered by <span><svg xmlns="http://www.w3.org/2000/svg" fill="none" height="14" width="14" viewBox="0 -.01 39.5 39.53" style={{ display: 'inline' }}><path d="m7.75 26.27 7.77-4.36.13-.38-.13-.21h-.38l-1.3-.08-4.44-.12-3.85-.16-3.73-.2-.94-.2-.88-1.16.09-.58.79-.53 1.13.1 2.5.17 3.75.26 2.72.16 4.03.42h.64l.09-.26-.22-.16-.17-.16-3.88-2.63-4.2-2.78-2.2-1.6-1.19-.81-.6-.76-.26-1.66 1.08-1.19 1.45.1.37.1 1.47 1.13 3.14 2.43 4.1 3.02.6.5.24-.17.03-.12-.27-.45-2.23-4.03-2.38-4.1-1.06-1.7-.28-1.02c-.1-.42-.17-.77-.17-1.2l1.23-1.67.68-.22 1.64.22.69.6 1.02 2.33 1.65 3.67 2.56 4.99.75 1.48.4 1.37.15.42h.26v-.24l.21-2.81.39-3.45.38-4.44.13-1.25.62-1.5 1.23-.81.96.46.79 1.13-.11.73-.47 3.05-.92 4.78-.6 3.2h.35l.4-.4 1.62-2.15 2.72-3.4 1.2-1.35 1.4-1.49.9-.71h1.7l1.25 1.86-.56 1.92-1.75 2.22-1.45 1.88-2.08 2.8-1.3 2.24.12.18.31-.03 4.7-1 2.54-.46 3.03-.52 1.37.64.15.65-.54 1.33-3.24.8-3.8.76-5.66 1.34-.07.05.08.1 2.55.24 1.09.06h2.67l4.97.37 1.3.86.78 1.05-.13.8-2 1.02-2.7-.64-6.3-1.5-2.16-.54h-.3v.18l1.8 1.76 3.3 2.98 4.13 3.84.21.95-.53.75-.56-.08-3.63-2.73-1.4-1.23-3.17-2.67h-.21v.28l.73 1.07 3.86 5.8.2 1.78-.28.58-1 .35-1.1-.2-2.26-3.17-2.33-3.57-1.88-3.2-.23.13-1.11 11.95-.52.61-1.2.46-1-.76-.53-1.23.53-2.43.64-3.17.52-2.52.47-3.13.28-1.04-.02-.07-.23.03-2.36 3.24-3.59 4.85-2.84 3.04-.68.27-1.18-.61.11-1.09.66-.97 3.93-5 2.37-3.1 1.53-1.79-.01-.26h-.09l-10.44 6.78-1.86.24-.8-.75.1-1.23.38-.4 3.14-2.16z" fill={ACCENT}/><script xmlns=""/></svg></span> Claude
                    </p>
                    {/* <div style={{ display: "flex", alignItems: "center", justifyContent: 'center', gap: 10, flexShrink: 0, marginBottom: 32 }}>
                    <div style={{
                      width: 18, height: 18, borderRadius: "50%",
                      background: ACCENT,
                      boxShadow: `0 0 12px ${ACCENT}`,
                      animation: phase === "input" ? "pulse 1.5s infinite" : "none",
                      flexShrink: 0
                    }} />
                    <span style={{
                      fontFamily: "'Geist Mono', monospace",
                      fontSize: 17, fontWeight: 500,
                      color: C.white, letterSpacing: "0.05em",
                      flexShrink: 0
                    }}>
                      Pagelight AI
                    </span>
                  </div> */}
                    <h1 style={{
                    fontFamily: "'Instrument Serif', serif",
                    fontSize: "clamp(36px, 6vw, 64px)",
                    lineHeight: 1.1, color: C.white,
                    letterSpacing: "-1px", marginBottom: 16,
                    }}>
                    Paste an article.<br />
                    <span style={{ color: ACCENT, fontStyle: "italic" }}>Watch it come alive.</span>
                    </h1>
                    <p style={{
                    fontSize: 15, color: C.muted, lineHeight: 1.7, fontWeight: 300,
                    }}>
                    Pagelight AI reads your article, extracts the key data, and renders it as a beautifully designed piece with animated charts woven throughout the text.
                    </p>
                </div>
    
                {/* Textarea card */}
                <div style={{
                    maxWidth: 780, width: "100%",
                    background: C.surface,
                    border: `1px solid ${phase === "error" ? C.red : C.border}`,
                    borderRadius: C.borderRadius,
                    overflow: "hidden",
                    boxShadow: "0 24px 64px rgba(0,0,0,0.4)",
                }}>
                    {/* Card header */}
                    <div style={{
                    padding: "12px 20px",
                    borderBottom: `1px solid ${C.border}`,
                    display: "flex", alignItems: "center", gap: 10,
                    background: C.panel,
                    }}>
                    {["#e05c5c", "#f5a623", "#6ed96e"].map(col => <div key={col} style={{ width: 10, height: 10, borderRadius: "50%", background: col }} />)}
                    <span style={{
                        fontFamily: "'Geist Mono', monospace", fontSize: 11,
                        color: C.muted, marginLeft: 4,
                    }}>article.txt</span>
                    <div style={{ marginLeft: "auto" }}>
                        <span style={{
                        fontFamily: "'Geist Mono', monospace", fontSize: 11,
                        color: wordCount >= 50 ? ACCENT : C.muted,
                        }}>
                        {wordCount} words {wordCount < 50 ? `(need ${50 - wordCount} more)` : "✓"}
                        </span>
                    </div>
                    </div>
    
                    <textarea
                    ref={textareaRef}
                    value={article}
                    onChange={e => setArticle(e.target.value)}
                    placeholder={"Paste your article here — news, research, blog post, report… anything with data or narrative structure"}
                    style={{
                        width: "100%", height: 320,
                        background: "transparent",
                        border: "none",
                        padding: "20px 24px",
                        fontFamily: "'Geist', sans-serif",
                        fontSize: 14, lineHeight: 1.8,
                        color: C.text, fontWeight: 300,
                    }}
                    />
    
                    {/* Card footer */}
                    <div style={{
                    padding: "12px 20px",
                    borderTop: `1px solid ${C.border}`,
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    background: C.panel,
                    }}>
                    {phase === "error" && (
                        <span style={{
                        fontFamily: "'Geist Mono', monospace", fontSize: 11, color: C.red,
                        }}>
                        ✕ {log[log.length - 1]}
                        </span>
                    )}
                    {phase !== "error" && (
                        <span style={{
                        fontFamily: "'Geist Mono', monospace", fontSize: 11, color: C.muted,
                        }}>
                        Works best with 200+ words
                        </span>
                    )}
    
                    <button
                        onClick={generate}
                        disabled={!canGenerate}
                        style={{
                        fontFamily: "'Geist Mono', monospace", fontSize: 12, fontWeight: 500,
                        background: canGenerate ? ACCENT : C.border,
                        color: canGenerate ? C.bg : C.muted,
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
                        fontSize: 11, color: ACCENT, marginBottom: 6,
                        }}>{icon} {title}</div>
                        <div style={{ fontSize: 12, color: C.muted, fontWeight: 300 }}>{sub}</div>
                    </div>
                    ))}
                </div>
                </div>
            )}

          {/* ── GENERATING ── */}
          {phase === "generating" && (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "48px 24px", gap: 32, animation: "fadeUp 0.4s ease both" }}>
              {/* Animated spinner ring */}
                <div style={{ position: "relative", width: 120, height: 120 }}>
                    <svg viewBox="0 0 120 120" style={{
                    width: 120, height: 120,
                    animation: "spin 2s linear infinite",
                    position: "absolute",
                    }}>
                    <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes dash{0%{stroke-dashoffset:280}100%{stroke-dashoffset:0}}`}</style>
                    <circle cx="60" cy="60" r="52"
                        fill="none" stroke={C.border} strokeWidth="2" />
                    <circle cx="60" cy="60" r="52"
                        fill="none" stroke={ACCENT} strokeWidth="2"
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
                        fontSize: 28, color: ACCENT, lineHeight: 1,
                    }}>✦</div>
                    </div>
                </div>
              <div style={{ textAlign: "center", maxWidth: 380 }}>
                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, color: C.white, marginBottom: 12, letterSpacing: "-0.5px" }}>
                  Pagelight AI is reading <ThinkingDots accent={ACCENT} />
                </h2>
                <p style={{ fontSize: 14, color: C.muted, fontWeight: 300, lineHeight: 1.7 }}>
                  Identifying data points, selecting chart types, and structuring your article's editorial layout.
                </p>
              </div>
              <div style={{ width: "100%", maxWidth: 500 }}>
                <StatusLog lines={log} accent={ACCENT} />
              </div>
            </div>
          )}

          {/* ── DONE ── */}
          {phase === "done" && articleData && (
            <div style={{ flex: 1, overflowY: "auto" }}>
              <ArticleRenderer data={articleData} />
            </div>
          )}

        </main>
      </div>
    </>
  );
}