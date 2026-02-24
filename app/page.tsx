"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { generateArticleVisualization } from "./lib/ai";
import { C, THEMES } from "./lib/theme";
import { ArticleRenderer } from "./components/ui/ArticleRenderer";
import { BgCanvas } from "./components/ui/BgCanvas";
import { StatusLog } from "./components/ui/StatusLog";
import { ThinkingDots } from "./components/ui/ThinkingDots";
import { StepDot } from "./components/ui/StepDot";
import { decodeTextFromParam, setShareParams, wait } from "./lib/utils";
import type { ArticleDocument, ShareSource, ThemeKey } from "./lib/types";
import Link from "next/link";
import { IconChartHistogram, IconCheck, IconKeyframes, IconNews } from "@tabler/icons-react";
import GlowText from "./components/ui/GlowText";
import Button from "./components/ui/Button";
import { API_KEY_STORAGE_KEY, SHARE_PARAM_URL, SHARE_PARAM_TEXT } from "./lib/constants";
import { fetchArticleFromUrl } from "./lib/api";
import { EXAMPLE_ARTICLE_DATA } from "./lib/example-data";

const FONT_IMPORT = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:wght@300;400;500&family=Geist+Mono:wght@400;500&family=Geist:wght@300;400;500&display=swap');
`;

const EXAMPLES = [
  {
    title: "Putting Numbers on the Global Venture Slowdown",
    source: "TechCrunch",
    description: "Global VC funding fell 35% to $415.1B in 2022, with mega-rounds down 42% after a record 2021",
    url: "https://techcrunch.com/2023/01/17/putting-numbers-on-the-global-venture-slowdown/",
  },
  {
    title: "Tracking Global Data on Electric Vehicles",
    source: "Our World in Data",
    description: "1 in 5 new cars sold globally in 2023 was electric — Norway leads at 92%, China at 50%, US at 8%",
    url: "https://ourworldindata.org/electric-car-sales",
  },
  {
    title: "Generative AI Funding Reached New Heights in 2024",
    source: "TechCrunch",
    description: "Generative AI startups raised $56B globally in 2024, a 92% surge over 2023's $29.1B",
    url: "https://techcrunch.com/2025/01/03/generative-ai-funding-reached-new-heights-in-2024/",
  },
  {
    title: "Apple Q1 2024: iPad Decline Meets iPhone and Services Records",
    source: "The Verge",
    description: "Apple reported $119.6B in revenue with Services hitting an all-time record at $23.1B",
    url: "https://www.theverge.com/2024/2/1/24058442/apple-q1-2024-earnings-iphone",
  },
  {
    title: "AI Apps Saw Over $1 Billion in Consumer Spending in 2024",
    source: "TechCrunch",
    description: "7.7 billion hours spent on AI apps with 17 billion downloads featuring AI across mobile platforms",
    url: "https://techcrunch.com/2025/01/22/ai-apps-saw-over-1-billion-in-consumer-spending-in-2024/",
  },
  {
    title: "Stack Overflow Developer Survey 2024",
    source: "Stack Overflow",
    description: "65,437 developers surveyed: JavaScript tops languages for the 12th year, PostgreSQL overtakes MySQL, 76% use or plan to use AI tools",
    url: "https://stackoverflow.blog/2024/08/06/2024-developer-survey/",
  },
];

export default function Home() {
  const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [article, setArticle] = useState("");
  const [phase, setPhase] = useState<"setup" | "input" | "generating" | "done" | "error">("setup");
  const [log, setLog] = useState<string[]>([]);
  const [articleData, setArticleData] = useState<ArticleDocument | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [booting, setBooting] = useState(true);

  const shareSourceRef = useRef<ShareSource | null>(null);
  const bootstrappedFromShareRef = useRef(false);
  const pendingAutoGenerateRef = useRef<ShareSource | null>(null);

  const [apiKey, setApiKey] = useState("");

  const [ACCENT, setAccent] = useState("#c8f04a");
  const [accentGradient, setAccentGradient] = useState(
    "linear-gradient(135deg, #c8f04a 0%, #89c42a 100%)"
  );

  function storeApiKey(key: string) {
    try {
      window.localStorage.setItem(API_KEY_STORAGE_KEY, key);
    } catch {
      // ignore
    }
    setApiKey(key);
    setPhase("input");

    // If the page was opened via a share link, auto-run once the key exists.
    if (pendingAutoGenerateRef.current) {
      const src = pendingAutoGenerateRef.current;
      pendingAutoGenerateRef.current = null;
      // Defer to allow the phase+key state updates to commit.
      setTimeout(() => {
        runGenerate(src);
      }, 0);
    }
  }

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 600);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useIsomorphicLayoutEffect(() => {
    try {
      const stored = window.localStorage.getItem(API_KEY_STORAGE_KEY) || "";
      if (stored) storeApiKey(stored);
    } catch {
      // ignore
    }
    setBooting(false);
  }, []);

  useEffect(() => {
    if (booting) return;
    if (typeof window === "undefined") return;
    if (bootstrappedFromShareRef.current) return;

    bootstrappedFromShareRef.current = true;

    const params = new URLSearchParams(window.location.search);
    const sharedUrl = params.get(SHARE_PARAM_URL);
    const hashParams = new URLSearchParams(
      window.location.hash.startsWith("#") ? window.location.hash.slice(1) : window.location.hash
    );
    const sharedText = hashParams.get(SHARE_PARAM_TEXT) || params.get(SHARE_PARAM_TEXT);

    if (!sharedUrl && !sharedText) return;

    const bootstrap = async () => {
      try {
        if (sharedUrl) {
          const src: ShareSource = { kind: "url", value: sharedUrl };
          shareSourceRef.current = src;
          setArticle(sharedUrl);
          if (apiKey) runGenerate(src);
          else {
            pendingAutoGenerateRef.current = src;
            setPhase("setup");
          }
          return;
        }

        if (sharedText) {
          const decoded = await decodeTextFromParam(sharedText);
          const src: ShareSource = { kind: "text", value: decoded };
          shareSourceRef.current = src;
          setArticle(decoded);
          if (apiKey) runGenerate(src);
          else {
            pendingAutoGenerateRef.current = src;
            setPhase("setup");
          }
          return;
        }
      } catch (e: any) {
        const message = e?.message || String(e);
        setLog([`Error: ${message}`]);
        setPhase("error");
      }
    };

    bootstrap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [booting]);

  const addLog = (msg: string) => setLog((prev) => [...prev, msg]);
  const wordCount = article.trim().split(/\s+/).filter(Boolean).length;
  const isUrlInput = (() => {
    const value = article.trim();
    if (!value) return false;
    try {
      const url = new URL(value);
      return url.protocol === "http:" || url.protocol === "https:";
    } catch {
      return false;
    }
  })();
  const canGenerate = isUrlInput || wordCount >= 50;

  const ensureApiKey = async () => {
    let key = apiKey;
    try {
      if (!key) key = window.localStorage.getItem(API_KEY_STORAGE_KEY) || "";
    } catch {
      // ignore
    }

    return key;
  };

  const runGenerate = async (source?: ShareSource) => {
    const src: ShareSource | null = source
      ? source
      : ((): ShareSource | null => {
          const value = article.trim();
          if (!value) return null;
          return isUrlInput ? { kind: "url", value } : { kind: "text", value: article };
        })();

    if (!src) return;
    if (src.kind === "text") {
      const wc = src.value.trim().split(/\s+/).filter(Boolean).length;
      if (wc < 50) return;
    }

    // Track original input for share links.
    shareSourceRef.current = src;

    const key = await ensureApiKey();
    if (!key) {
      setLog(["Error: Anthropic API key is required."]);
      setPhase("setup");
      pendingAutoGenerateRef.current = src;
      return;
    }

    setPhase("generating");
    setLog([]);

    try {
      let contentToAnalyze = src.value;

      if (src.kind === "url") {
        addLog("Fetching article from URL…");
        const { text, title: fetchedTitle } = await fetchArticleFromUrl(src.value.trim());
        contentToAnalyze = text;
        setArticle(text);
        addLog(`Found: ${fetchedTitle ? fetchedTitle : ""}.`);
      } else {
        // Keep the textarea in sync with what will be analyzed.
        setArticle(src.value);
      }

      addLog("Sending article to Pagelight AI for analysis…");

      wait(500).then(() => {
        addLog("Extracting key data points and narrative structure…");
      });

      const data = await generateArticleVisualization(contentToAnalyze, key);

      const raw = ((data as any).content || []).map((b: any) => b.text || "").join("");

      addLog("Parsing structured layout…");

      // Strip any accidental markdown fences
      const cleaned = raw
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/```\s*$/i, "")
        .trim();

      let parsed: unknown;
      try {
        parsed = JSON.parse(cleaned);
      } catch (e) {
        // Attempt to extract JSON from mixed response
        const match = cleaned.match(/\{[\s\S]+\}/);
        if (match) {
          try {
            parsed = JSON.parse(match[0]);
          } catch {
            throw new Error("Response contained invalid JSON. Try again.");
          }
        } else {
          throw new Error("No JSON found in response. Try again.");
        }
      }

      if (!parsed || typeof parsed !== "object")
        throw new Error("Response contained invalid JSON. Try again.");
      const maybeDoc = parsed as Partial<ArticleDocument>;
      if (!Array.isArray(maybeDoc.sections))
        throw new Error("Missing sections array in response. Try again.");

      wait(200).then(() => {
        addLog("Rendering article with interactive widgets…");
      });

      await wait(500);
      const doc = parsed as ArticleDocument;
      if (src.kind === "url") {
        doc.sourceUrl = src.value.trim();
      }
      setArticleData(doc);

      const themeKey: ThemeKey = doc.theme;
      const theme = THEMES[themeKey] || THEMES.financial;
      const { accent, accentGradient } = theme;
      setAccent(accent ?? ACCENT);
      setAccentGradient(accentGradient ?? accentGradient);
      setPhase("done");

      // Persist the share link once we have successfully visualized.
      await setShareParams(shareSourceRef.current);
    } catch (err: any) {
      const message = err?.message || String(err);
      if (message.toLowerCase().includes("invalid api key")) {
        try {
          window.localStorage.removeItem(API_KEY_STORAGE_KEY);
        } catch {}
        setApiKey("");
      }
      addLog(`Error: ${message}`);
      setPhase("error");
    }
  };

  const generate = async () => {
    if (!canGenerate) return;
    return runGenerate();
  };

  const reset = () => {
    setPhase("input");
    setArticle("");
    setLog([]);
    setArticleData(null);
    setAccent("#c8f04a");
    setAccentGradient("linear-gradient(135deg, #c8f04a 0%, #89c42a 100%)");
    shareSourceRef.current = null;
    pendingAutoGenerateRef.current = null;
    setShareParams(null);
  };
  const steps = [
    { label: "Paste Article" },
    { label: "Analysing Article" },
    { label: "Rendering Visualizations" },
  ];
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

        @media (max-width: 600px) {
          .home-hero-h1 { font-size: clamp(22px, 6.5vw, 64px) !important; }
        }
      `}</style>

      <BgCanvas opacity={phase === "done" ? 0.05 : 0.1} />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          minHeight: "100vh",
          overflow: phase === "done" ? "auto" : "hidden",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {!booting && (
          <>
            <header
              style={{
                borderRadius: C.borderRadius,
                padding: "0 16px",
                height: 52,
                width: "100%",
                maxWidth: 800,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: isMobile ? 12 : 64,
                position: "sticky",
                top: 15,
                zIndex: 10,
              }}
            >
              <Link
                href="/"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  flexShrink: 0,
                  userSelect: "none",
                }}
              >
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: ACCENT,
                    boxShadow: `0 0 12px ${ACCENT}`,
                    animation: phase === "generating" ? "pulse 1.5s infinite" : "none",
                    flexShrink: 0,
                  }}
                />
                <span
                  style={{
                    fontFamily: "'Geist Mono', monospace",
                    fontSize: 13,
                    fontWeight: 500,
                    color: C.white,
                    letterSpacing: "0.05em",
                    flexShrink: 0,
                  }}
                >
                  Pagelight AI
                </span>
              </Link>

              {phase === "generating" && (
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  {steps.map((s, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        opacity: i > stepIdx + 1 ? 0.3 : 1,
                        transition: "opacity 0.4s",
                        flexShrink: 0,
                        marginRight: 8,
                      }}
                    >
                      <StepDot
                        n={i + 1}
                        active={i === stepIdx}
                        done={i < stepIdx}
                        accent={ACCENT}
                      />
                      <span
                        style={{
                          fontSize: 13,
                          color: i === stepIdx ? ACCENT : C.muted,
                          fontWeight: 400,
                          display: isMobile ? "none" : "block",
                        }}
                      >
                        {s.label}
                      </span>
                      {i < steps.length - 1 && (
                        <div
                          style={{ width: 24, height: 1, background: C.border, marginLeft: 4 }}
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}

              {phase !== "generating" && (
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  {!(isMobile && phase === "done") && (
                    <Link href="/about">
                      <Button kind="secondary" onClick={reset}>
                        What is this?
                      </Button>
                    </Link>
                  )}

                  {phase === "done" && (
                    <Button kind="secondary" onClick={reset}>
                      + Visualize Article
                    </Button>
                  )}
                </div>
              )}
            </header>

            <main style={{ flex: 1, display: "flex", flexDirection: "column", width: "100%" }}>
              {/* INPUT PHASE */}
              {(phase === "input" || phase === "error" || phase === "setup") && (
                <div
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: isMobile ? "32px 16px" : "48px 24px",
                    animation: "fadeUp 0.5s ease both",
                  }}
                >
                  {/* Hero */}
                  <div
                    style={{ maxWidth: 560, width: "100%", marginBottom: 40, textAlign: "center" }}
                  >
                    <p
                      style={{
                        fontFamily: "'Geist Mono', monospace",
                        fontSize: 11,
                        color: ACCENT,
                        letterSpacing: "0.2em",
                        textTransform: "uppercase",
                        marginBottom: 20,
                      }}
                    >
                      Powered by{" "}
                      <span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          height="14"
                          width="14"
                          viewBox="0 -.01 39.5 39.53"
                          style={{ display: "inline" }}
                        >
                          <path
                            d="m7.75 26.27 7.77-4.36.13-.38-.13-.21h-.38l-1.3-.08-4.44-.12-3.85-.16-3.73-.2-.94-.2-.88-1.16.09-.58.79-.53 1.13.1 2.5.17 3.75.26 2.72.16 4.03.42h.64l.09-.26-.22-.16-.17-.16-3.88-2.63-4.2-2.78-2.2-1.6-1.19-.81-.6-.76-.26-1.66 1.08-1.19 1.45.1.37.1 1.47 1.13 3.14 2.43 4.1 3.02.6.5.24-.17.03-.12-.27-.45-2.23-4.03-2.38-4.1-1.06-1.7-.28-1.02c-.1-.42-.17-.77-.17-1.2l1.23-1.67.68-.22 1.64.22.69.6 1.02 2.33 1.65 3.67 2.56 4.99.75 1.48.4 1.37.15.42h.26v-.24l.21-2.81.39-3.45.38-4.44.13-1.25.62-1.5 1.23-.81.96.46.79 1.13-.11.73-.47 3.05-.92 4.78-.6 3.2h.35l.4-.4 1.62-2.15 2.72-3.4 1.2-1.35 1.4-1.49.9-.71h1.7l 1.25 1.86-.56 1.92-1.75 2.22-1.45 1.88-2.08 2.8-1.3 2.24.12.18.31-.03 4.7-1 2.54-.46 3.03-.52 1.37.64.15.65-.54 1.33-3.24.8-3.8.76-5.66 1.34-.07.05.08.1 2.55.24 1.09.06h2.67l4.97.37 1.3.86.78 1.05-.13.8-2 1.02-2.7-.64-6.3-1.5-2.16-.54h-.3v.18l1.8 1.76 3.3 2.98 4.13 3.84.21.95-.53.75-.56-.08-3.63-2.73-1.4-1.23-3.17-2.67h-.21v.28l.73 1.07 3.86 5.8.2 1.78-.28.58-1 .35-1.1-.2-2.26-3.17-2.33-3.57-1.88-3.2-.23.13-1.11 11.95-.52.61-1.2.46-1-.76-.53-1.23.53-2.43.64-3.17.52-2.52.47-3.13.28-1.04-.02-.07-.23.03-2.36 3.24-3.59 4.85-2.84 3.04-.68.27-1.18-.61.11-1.09.66-.97 3.93-5 2.37-3.1 1.53-1.79-.01-.26h-.09l-10.44 6.78-1.86.24-.8-.75.1-1.23.38-.4 3.14-2.16z"
                            fill={ACCENT}
                          />
                        </svg>
                      </span>{" "}
                      Claude
                    </p>
                    <h1
                      className="home-hero-h1"
                      style={{
                        fontFamily: "'Instrument Serif', serif",
                        fontSize: "clamp(36px, 6vw, 64px)",
                        lineHeight: 1.1,
                        color: C.white,
                        letterSpacing: "-1px",
                        marginBottom: 16,
                      }}
                    >
                      Paste an Article.
                      <br />
                      <span style={{ color: ACCENT, fontStyle: "italic" }}>
                        <GlowText
                          text="Watch It Come Alive."
                          pauseMs={2000}
                          strength={0.9}
                          color={ACCENT}
                        />
                      </span>
                    </h1>
                    <p
                      style={{
                        fontSize: 15,
                        color: C.muted,
                        lineHeight: 1.7,
                        fontWeight: 300,
                      }}
                    >
                      Pagelight AI reads your article, extracts the key data, and renders it as a
                      beautifully designed piece with animated charts woven throughout the text.
                    </p>
                  </div>

                  {/* Textarea card */}
                  {phase === "setup" ? (
                    <div
                      style={{
                        maxWidth: 780,
                        width: "100%",
                        background: C.surface,
                        border: `1px solid ${C.border}`,
                        borderRadius: C.borderRadius,
                        overflow: "hidden",
                        boxShadow: "0 24px 64px rgba(0,0,0,0.4)",
                      }}
                    >
                      <input
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter" && apiKey) { e.preventDefault(); storeApiKey(apiKey); } }}
                        placeholder={"Paste your Anthropic API key here to get started"}
                        type="password"
                        autoFocus
                        style={{
                          width: "100%",
                          background: "transparent",
                          border: "none",
                          padding: "20px",
                          fontFamily: "'Geist', sans-serif",
                          fontSize: 14,
                          lineHeight: 1.2,
                          color: C.text,
                          fontWeight: 300,
                          outline: "none",
                        }}
                      />

                      {/* Card footer */}
                      <div
                        style={{
                          padding: "8px",
                          borderTop: `1px solid ${C.border}`,
                          display: "flex",
                          flexDirection: isMobile ? "column" : "row",
                          alignItems: isMobile ? "stretch" : "center",
                          justifyContent: "space-between",
                          gap: isMobile ? 8 : 0,
                          background: C.panel,
                        }}
                      >
                        <span
                          style={{
                            fontFamily: "'Geist Mono', monospace",
                            fontSize: 11,
                            color: wordCount >= 50 ? ACCENT : C.muted,
                            paddingLeft: 12,
                          }}
                        >
                          Your API key is stored locally in your browser and never shared with
                          anyone.
                        </span>

                        {apiKey ? (
                          <Button
                            onClick={() => storeApiKey(apiKey)}
                            disabled={!apiKey}
                            style={{
                              background: apiKey ? accentGradient : C.border,
                              color: apiKey ? C.bg : C.muted,
                              cursor: apiKey ? "pointer" : "not-allowed",
                            }}
                          >
                            Save Locally →
                          </Button>
                        ) : (
                          <a
                            href="https://platform.claude.com/settings/keys"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button
                              style={{
                                background: accentGradient,
                                color: C.bg,
                              }}
                            >
                              Get Anthropic API Key ↗
                            </Button>
                          </a>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div
                      style={{
                        maxWidth: 780,
                        width: "100%",
                        background: C.surfaceGradient,
                        border: `1px solid ${phase === "error" ? C.red : C.border}`,
                        borderRadius: C.borderRadius,
                        overflow: "hidden",
                        boxShadow: "0 24px 64px rgba(0,0,0,0.4)",
                      }}
                    >
                      <textarea
                        ref={textareaRef}
                        value={article}
                        onChange={(e) => setArticle(e.target.value)}
                        onKeyDown={(e) => { if ((e.ctrlKey || e.metaKey) && e.key === "Enter" && canGenerate) { e.preventDefault(); generate(); } }}
                        placeholder={
                          "Paste your article text or URL here — news, research, blog post, report… anything with data or narrative structure"
                        }
                        style={{
                          width: "100%",
                          height: 250,
                          background: "transparent",
                          border: "none",
                          padding: "20px",
                          fontFamily: "'Geist', sans-serif",
                          fontSize: 14,
                          lineHeight: 1.8,
                          color: C.text,
                          fontWeight: 300,
                        }}
                      />

                      {/* Card footer */}
                      <div
                        style={{
                          padding: "8px",
                          borderTop: `1px solid ${C.border}`,
                          display: "flex",
                          flexDirection: isMobile ? "column" : "row",
                          alignItems: isMobile ? "stretch" : "center",
                          justifyContent: "space-between",
                          gap: isMobile ? 8 : 0,
                          background: C.panel,
                        }}
                      >
                        <div style={{ paddingLeft: isMobile ? 0 : 12, textAlign: isMobile ? "center" : "left" }}>
                          {phase === "error" && (
                            <div
                              style={{
                                fontFamily: "'Geist Mono', monospace",
                                fontSize: 11,
                                color: C.red,
                              }}
                            >
                              ✕ {log[log.length - 1]}
                            </div>
                          )}
                          {phase !== "error" && (
                            <div
                              style={{
                                fontFamily: "'Geist Mono', monospace",
                                fontSize: 11,
                                color: C.muted,
                              }}
                            >
                              {isUrlInput ? (
                                <>
                                  <IconCheck
                                    size={13}
                                    style={{ display: "inline-block", color: ACCENT }}
                                  />{" "}
                                  URL detected
                                </>
                              ) : wordCount > 0 ? (
                                `${wordCount} words ${wordCount < 50 ? `(need ${50 - wordCount} more)` : "✓"}`
                              ) : (
                                "Works with a URL or raw text (best with 200+ words)"
                              )}
                            </div>
                          )}
                        </div>

                        <Button
                          disabled={!canGenerate}
                          onClick={generate}
                          style={{
                            background: canGenerate ? accentGradient : C.surface,
                            color: canGenerate ? C.bg : C.muted,
                            cursor: canGenerate ? "pointer" : "not-allowed",
                          }}
                        >
                          {phase === "error" ? "Try again →" : "Visualize Article →"}
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Feature hints */}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: isMobile ? "column" : "row",
                      gap: isMobile ? 20 : 48,
                      marginTop: 36,
                      flexWrap: "wrap",
                      justifyContent: "center",
                      alignItems: isMobile ? "center" : undefined,
                      maxWidth: 600,
                      width: "100%",
                    }}
                  >
                    {[
                      [
                        <IconChartHistogram
                          key={1}
                          size={17}
                          style={{ display: "inline-block" }}
                        />,
                        "Visualizations",
                        "Animated charts and graphs",
                      ],
                      [
                        <IconKeyframes key={2} size={17} style={{ display: "inline-block" }} />,
                        "Editorial Design",
                        "Custom aesthetic per article",
                      ],
                      [
                        <IconNews key={3} size={17} style={{ display: "inline-block" }} />,
                        "Woven Narrative",
                        "Visuals placed between text",
                      ],
                    ].map(([icon, title, sub], idx) => (
                      <div key={idx} style={{ textAlign: "center", minWidth: 140 }}>
                        <div
                          style={{
                            color: ACCENT,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 8,
                            marginBottom: 6,
                          }}
                        >
                          {icon}
                          <div
                            style={{
                              fontFamily: "'Geist Mono', monospace",
                              fontSize: 13,
                            }}
                          >
                            {title}
                          </div>
                        </div>
                        <div style={{ fontSize: 13, color: C.muted, fontWeight: 300 }}>{sub}</div>
                      </div>
                    ))}
                  </div>

                  {/* Examples */}
                  <div style={{ maxWidth: 780, width: "100%", marginTop: 72 }}>
                    <p
                      style={{
                        fontFamily: "'Geist Mono', monospace",
                        fontSize: 11,
                        color: C.muted,
                        letterSpacing: "0.15em",
                        textTransform: "uppercase",
                        marginBottom: 16,
                        textAlign: "center",
                      }}
                    >
                      Try an example
                    </p>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                        gap: 12,
                      }}
                    >
                      {EXAMPLES.map((ex) => (
                        <button
                          key={ex.url}
                          onClick={async () => {
                            const pregenData = EXAMPLE_ARTICLE_DATA[ex.url];
                            if (pregenData) {
                              const themeKey = pregenData.theme;
                              const theme = THEMES[themeKey] || THEMES.financial;
                              setAccent(theme.accent);
                              setAccentGradient(theme.accentGradient);
                              shareSourceRef.current = { kind: "url", value: ex.url };
                              setLog(["Fetching article from URL…"]);
                              setPhase("generating");
                              await wait(800);
                              setLog((prev) => [...prev, `Found: ${pregenData.title}.`]);
                              await wait(600);
                              setLog((prev) => [...prev, "Sending article to Pagelight AI for analysis…"]);
                              await wait(700);
                              setLog((prev) => [...prev, "Extracting key data points and narrative structure…"]);
                              await wait(800);
                              setLog((prev) => [...prev, "Parsing structured layout…"]);
                              await wait(500);
                              setLog((prev) => [...prev, "Rendering article with interactive widgets…"]);
                              await wait(400);
                              setArticleData(pregenData);
                              setPhase("done");
                              setShareParams({ kind: "url", value: ex.url });
                            } else {
                              setArticle(ex.url);
                              if (phase !== "setup") {
                                textareaRef.current?.focus();
                              }
                            }
                          }}
                          style={{
                            background: C.surface,
                            border: `1px solid ${C.border}`,
                            borderRadius: C.borderRadius,
                            padding: "14px 16px",
                            textAlign: "left",
                            cursor: "pointer",
                            transition: "border-color 0.2s, background 0.2s",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = ACCENT;
                            e.currentTarget.style.background = C.panel;
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = C.border;
                            e.currentTarget.style.background = C.surface;
                          }}
                        >
                          <div
                            style={{
                              fontFamily: "'Geist Mono', monospace",
                              fontSize: 9,
                              color: ACCENT,
                              letterSpacing: "0.15em",
                              textTransform: "uppercase",
                              marginBottom: 6,
                            }}
                          >
                            {ex.source}
                          </div>
                          <div
                            style={{
                              fontSize: 13,
                              color: C.white,
                              fontWeight: 500,
                              lineHeight: 1.4,
                              marginBottom: 6,
                            }}
                          >
                            {ex.title}
                          </div>
                          <div
                            style={{
                              fontSize: 11,
                              color: C.muted,
                              fontWeight: 300,
                              lineHeight: 1.5,
                              lineClamp: 2,
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {ex.description}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ── GENERATING ── */}
              {phase === "generating" && (
                <div
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "48px 24px",
                    gap: 32,
                    animation: "fadeUp 0.4s ease both",
                  }}
                >
                  {/* Animated spinner ring */}
                  <div
                    style={{
                      position: "relative",
                      width: 120,
                      height: 120,
                      background: C.bg,
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <svg
                      viewBox="0 0 120 120"
                      style={{
                        width: 120,
                        height: 120,
                        animation: "spin 2s linear infinite",
                        position: "absolute",
                      }}
                    >
                      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes dash{0%{stroke-dashoffset:280}100%{stroke-dashoffset:0}}`}</style>
                      <circle
                        cx="60"
                        cy="60"
                        r="52"
                        fill="none"
                        stroke={C.border}
                        strokeWidth="2"
                      />
                      <circle
                        cx="60"
                        cy="60"
                        r="52"
                        fill="none"
                        stroke={ACCENT}
                        strokeWidth="2"
                        strokeDasharray="80 246"
                        strokeLinecap="round"
                      />
                    </svg>
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <div
                        style={{
                          fontFamily: "'Instrument Serif', serif",
                          fontSize: 28,
                          color: ACCENT,
                          lineHeight: 1,
                        }}
                      >
                        ✦
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: "center", maxWidth: 380 }}>
                    <h2
                      style={{
                        fontFamily: "'Playfair Display', serif",
                        fontSize: 28,
                        color: C.white,
                        marginBottom: 12,
                        letterSpacing: "-0.5px",
                      }}
                    >
                      <GlowText
                        text="Pagelight is reading"
                        pauseMs={500}
                        strength={0.7}
                        color={ACCENT}
                      />
                      <ThinkingDots accent={ACCENT} />
                    </h2>
                    <p style={{ fontSize: 14, color: C.muted, fontWeight: 300, lineHeight: 1.7 }}>
                      Identifying data points, selecting chart types, and structuring your
                      article&apos;s editorial layout.
                    </p>
                  </div>
                  <div style={{ width: "100%", maxWidth: 600 }}>
                    <StatusLog lines={log} accent={ACCENT} />
                  </div>
                </div>
              )}

              {/* ── DONE ── */}
              {phase === "done" && articleData && (
                <div
                  style={{
                    flex: 1,
                    overflowY: "auto",
                    width: "100%",
                    maxWidth: 780,
                    margin: "0 auto",
                  }}
                >
                  <ArticleRenderer data={articleData} />
                </div>
              )}
            </main>
          </>
        )}
      </div>
    </>
  );
}
