"use client";

import { useState, useRef, useEffect, useLayoutEffect, type MouseEvent } from "react";
import { generateArticleVisualization } from "./lib/ai";
import { C, THEMES } from "./lib/theme";
import { ArticleRenderer } from "./components/ui/ArticleRenderer";
import { BgCanvas } from "./components/ui/BgCanvas";
import { StatusLog } from "./components/ui/StatusLog";
import { ThinkingDots } from "./components/ui/ThinkingDots";
import { StepDot } from "./components/ui/StepDot";
import { wait } from "./lib/utils";
import type { ArticleDocument, ThemeKey } from "./lib/articleTypes";
import Link from "next/link";
import { IconChartHistogram, IconCheck, IconKeyframes, IconLayout, IconNews } from "@tabler/icons-react";
import GlowText from "./components/ui/GlowText";
import Button from "./components/ui/Button";

const FONT_IMPORT = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:wght@300;400;500&family=Geist+Mono:wght@400;500&family=Geist:wght@300;400;500&display=swap');
`;

export default function Home() {
  const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

  type ShareSource = { kind: "url" | "text"; value: string };
  const SHARE_PARAM_URL = "u";
  const SHARE_PARAM_TEXT = "t";

  const base64UrlEncodeBytes = (bytes: Uint8Array) => {
    let binary = "";
    const chunkSize = 0x8000;
    for (let i = 0; i < bytes.length; i += chunkSize) {
      binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
    }
    const b64 = btoa(binary);
    return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
  };

  const base64UrlDecodeToBytes = (b64url: string) => {
    const b64 = b64url.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((b64url.length + 3) % 4);
    const binary = atob(b64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes;
  };

  const encodeTextForParam = async (text: string): Promise<string> => {
    const trimmed = text.trim();
    if (!trimmed) return "";

    // Prefer gzip-compressed base64url when available.
    const hasGzip = typeof (window as any).CompressionStream !== "undefined";
    if (hasGzip) {
      try {
        const cs = new (window as any).CompressionStream("gzip");
        const stream = new Blob([trimmed]).stream().pipeThrough(cs);
        const buf = await new Response(stream).arrayBuffer();
        return `gz.${base64UrlEncodeBytes(new Uint8Array(buf))}`;
      } catch {
        // fall through
      }
    }

    const bytes = new TextEncoder().encode(trimmed);
    return `b64.${base64UrlEncodeBytes(bytes)}`;
  };

  const decodeTextFromParam = async (encoded: string): Promise<string> => {
    const value = String(encoded || "");
    if (!value) return "";

    const [prefix, payload] = value.includes(".") ? (value.split(/\.(.+)/) as [string, string]) : (["b64", value] as [string, string]);

    if (prefix === "gz") {
      const hasGunzip = typeof (window as any).DecompressionStream !== "undefined";
      if (!hasGunzip) throw new Error("Your browser does not support compressed share links.");
      const bytes = base64UrlDecodeToBytes(payload);
      const ds = new (window as any).DecompressionStream("gzip");
      const stream = new Blob([bytes]).stream().pipeThrough(ds);
      return await new Response(stream).text();
    }

    const bytes = base64UrlDecodeToBytes(payload);
    return new TextDecoder().decode(bytes);
  };

  const setShareParams = async (source: ShareSource | null) => {
    if (typeof window === "undefined") return;

    const url = new URL(window.location.href);
    url.searchParams.delete(SHARE_PARAM_URL);
    // Backwards-compat cleanup: older links may have used ?t= for text.
    url.searchParams.delete(SHARE_PARAM_TEXT);

    const hashParams = new URLSearchParams(url.hash.startsWith("#") ? url.hash.slice(1) : url.hash);
    hashParams.delete(SHARE_PARAM_TEXT);

    if (source) {
      if (source.kind === "url") {
        url.searchParams.set(SHARE_PARAM_URL, source.value);
        // Ensure large text never remains in the fragment.
        if ([...hashParams.keys()].length === 0) url.hash = "";
        else url.hash = hashParams.toString();
      } else {
        const encoded = await encodeTextForParam(source.value);

        // Put text behind the fragment so it isn't sent to the server.
        if (encoded) hashParams.set(SHARE_PARAM_TEXT, encoded);
        url.searchParams.delete(SHARE_PARAM_URL);

        url.hash = hashParams.toString();
      }
    } else {
      url.hash = [...hashParams.keys()].length === 0 ? "" : hashParams.toString();
    }

    window.history.replaceState({}, "", url.toString());
  };

  const textareaRef             = useRef<HTMLTextAreaElement | null>(null);
  const [article,     setArticle]     = useState("");
  const [phase,       setPhase]       = useState<"setup" | "input" | "generating" | "done" | "error">("setup");
  const [log,         setLog]         = useState<string[]>([]);
  const [articleData, setArticleData] = useState<ArticleDocument | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [booting, setBooting] = useState(true);

  const shareSourceRef = useRef<ShareSource | null>(null);
  const bootstrappedFromShareRef = useRef(false);
  const pendingAutoGenerateRef = useRef<ShareSource | null>(null);

  const API_KEY_STORAGE_KEY = "pagelight.anthropicApiKey";
  const [apiKey, setApiKey] = useState("");

//   const themeKeys = Object.keys(THEMES);
//   const randomKey = themeKeys[Math.floor(Math.random() * themeKeys.length)];
  // const [ACCENT, setAccent] = useState(THEMES[randomKey].accent);
  const [ACCENT, setAccent] = useState("#c8f04a");
  const [accentGradient, setAccentGradient] = useState("linear-gradient(135deg, #c8f04a 0%, #89c42a 100%)");

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
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
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
    const hashParams = new URLSearchParams(window.location.hash.startsWith("#") ? window.location.hash.slice(1) : window.location.hash);
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

  const addLog     = (msg: string) => setLog(prev => [...prev, msg]);
  const wordCount  = article.trim().split(/\s+/).filter(Boolean).length;
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

  const fetchArticleFromUrl = async (url: string): Promise<{ text: string; title?: string | null; wordCount?: number }> => {
    const res = await fetch("/api/fetch-article", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ url }),
    });

    let json: any;
    try {
      json = await res.json();
    } catch {
      throw new Error("Failed to parse fetch response.");
    }

    if (!res.ok || !json?.ok) {
      throw new Error(json?.error || `Failed to fetch URL (HTTP ${res.status}).`);
    }

    const text = String(json.text || "");
    if (!text.trim()) throw new Error("No readable text found on the page.");
    return { text, title: json.title ?? null, wordCount: json.wordCount };
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

      if (!parsed || typeof parsed !== "object") throw new Error("Response contained invalid JSON. Try again.");
      const maybeDoc = parsed as Partial<ArticleDocument>;
      if (!Array.isArray(maybeDoc.sections)) throw new Error("Missing sections array in response. Try again.");

      wait(200).then(() => {
        addLog("Rendering article with interactive widgets…");
      });

      await wait(500);
      const doc = parsed as ArticleDocument;
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

  const reset   = () => {
    setPhase("input");
    setArticle("");
    setLog([]);
    setArticleData(null);
    setAccent('#c8f04a');
    setAccentGradient("linear-gradient(135deg, #c8f04a 0%, #89c42a 100%)");
    shareSourceRef.current = null;
    pendingAutoGenerateRef.current = null;
    setShareParams(null);
  };
  const steps   = [{ label: "Paste Article" }, { label: "Analysing Article" }, { label: "Rendering Visualizations" }];
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

      <BgCanvas opacity={phase === 'done' ? 0.05 : 0.15} />

      <div style={{ position: "relative", zIndex: 1, minHeight: "100vh", overflow: phase === 'done' ? 'auto' : 'hidden', display: "flex", flexDirection: "column", alignItems: 'center', justifyContent: 'center' }}>
        {!booting && (
          <>
          <header style={{
            borderRadius: C.borderRadius,
            padding: "0 16px",
            height: 52,
            width: '100%',
            maxWidth: 800,
            display: "flex", alignItems: "center", justifyContent: "space-between", gap: 64,
            position: "sticky", top: 15, zIndex: 10,
          }}>
            <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0, userSelect: 'none' }}>
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
            </Link>

            {phase === 'generating' && (
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  {steps.map((s, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, opacity: i > stepIdx + 1 ? 0.3 : 1, transition: "opacity 0.4s", flexShrink: 0, marginRight: 8 }}>
                      <StepDot n={i + 1} active={i === stepIdx} done={i < stepIdx} accent={ACCENT} />
                      <span style={{
                      fontSize: 13, color: i === stepIdx ? ACCENT : C.muted,
                      fontWeight: 400,
                      display: isMobile ? "none" : "block",
                      }}>{s.label}</span>
                      {i < steps.length - 1 && (
                      <div style={{ width: 24, height: 1, background: C.border, marginLeft: 4 }} />
                      )}
                  </div>
                  ))}
              </div>
            )}

            {phase !== 'generating' && (
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                {/* <Link href="/about" style={{
                  fontFamily: "'Geist Mono', monospace", fontSize: 11,
                  color: C.muted, background: "transparent",
                  border: `1px solid ${C.border}`, borderRadius: 6,
                  padding: "5px 12px", cursor: "pointer",
                  transition: "all 0.2s",
                  flexShrink: 0
                }}
                  onMouseEnter={(e: MouseEvent<HTMLAnchorElement>) => { e.currentTarget.style.color = C.white; e.currentTarget.style.borderColor = C.muted; }}
                  onMouseLeave={(e: MouseEvent<HTMLAnchorElement>) => { e.currentTarget.style.color = C.muted; e.currentTarget.style.borderColor = C.border; }}
                >What is this?</Link> */}

              <Link href="/about">
                <Button
                  kind="secondary"
                  onClick={reset}
                >
                  What is this?
                </Button>
              </Link>
              

              {phase === "done" && (
                <Button
                  kind="secondary"
                  onClick={reset}
                >
                  + Visualize Article
                </Button>
                )}
              </div>
            )}
          </header>

          <main style={{ flex: 1, display: "flex", flexDirection: "column", width: '100%' }}>
            {/* INPUT PHASE */}
              {(phase === "input" || phase === "error" || phase === "setup") && (
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
                      Powered by <span><svg xmlns="http://www.w3.org/2000/svg" fill="none" height="14" width="14" viewBox="0 -.01 39.5 39.53" style={{ display: 'inline' }}><path d="m7.75 26.27 7.77-4.36.13-.38-.13-.21h-.38l-1.3-.08-4.44-.12-3.85-.16-3.73-.2-.94-.2-.88-1.16.09-.58.79-.53 1.13.1 2.5.17 3.75.26 2.72.16 4.03.42h.64l.09-.26-.22-.16-.17-.16-3.88-2.63-4.2-2.78-2.2-1.6-1.19-.81-.6-.76-.26-1.66 1.08-1.19 1.45.1.37.1 1.47 1.13 3.14 2.43 4.1 3.02.6.5.24-.17.03-.12-.27-.45-2.23-4.03-2.38-4.1-1.06-1.7-.28-1.02c-.1-.42-.17-.77-.17-1.2l1.23-1.67.68-.22 1.64.22.69.6 1.02 2.33 1.65 3.67 2.56 4.99.75 1.48.4 1.37.15.42h.26v-.24l.21-2.81.39-3.45.38-4.44.13-1.25.62-1.5 1.23-.81.96.46.79 1.13-.11.73-.47 3.05-.92 4.78-.6 3.2h.35l.4-.4 1.62-2.15 2.72-3.4 1.2-1.35 1.4-1.49.9-.71h1.7l 1.25 1.86-.56 1.92-1.75 2.22-1.45 1.88-2.08 2.8-1.3 2.24.12.18.31-.03 4.7-1 2.54-.46 3.03-.52 1.37.64.15.65-.54 1.33-3.24.8-3.8.76-5.66 1.34-.07.05.08.1 2.55.24 1.09.06h2.67l4.97.37 1.3.86.78 1.05-.13.8-2 1.02-2.7-.64-6.3-1.5-2.16-.54h-.3v.18l1.8 1.76 3.3 2.98 4.13 3.84.21.95-.53.75-.56-.08-3.63-2.73-1.4-1.23-3.17-2.67h-.21v.28l.73 1.07 3.86 5.8.2 1.78-.28.58-1 .35-1.1-.2-2.26-3.17-2.33-3.57-1.88-3.2-.23.13-1.11 11.95-.52.61-1.2.46-1-.76-.53-1.23.53-2.43.64-3.17.52-2.52.47-3.13.28-1.04-.02-.07-.23.03-2.36 3.24-3.59 4.85-2.84 3.04-.68.27-1.18-.61.11-1.09.66-.97 3.93-5 2.37-3.1 1.53-1.79-.01-.26h-.09l-10.44 6.78-1.86.24-.8-.75.1-1.23.38-.4 3.14-2.16z" fill={ACCENT}/></svg></span> Claude
                      </p>
                      <h1 style={{
                      fontFamily: "'Instrument Serif', serif",
                      fontSize: "clamp(36px, 6vw, 64px)",
                      lineHeight: 1.1, color: C.white,
                      letterSpacing: "-1px", marginBottom: 16,
                      }}>
                      Paste an Article.<br />
                      <span style={{ color: ACCENT, fontStyle: "italic" }}>
                        <GlowText text="Watch It Come Alive." pauseMs={2000} strength={0.9} color={ACCENT} />
                      </span>
                      </h1>
                      <p style={{
                      fontSize: 15, color: C.muted, lineHeight: 1.7, fontWeight: 300,
                      }}>
                      Pagelight AI reads your article, extracts the key data, and renders it as a beautifully designed piece with animated charts woven throughout the text.
                      </p>
                  </div>
      
                  {/* Textarea card */}
                  {phase === "setup" ? (
                    <div style={{
                      maxWidth: 780, width: "100%",
                      background: C.surface,
                      border: `1px solid ${C.border}`,
                      borderRadius: C.borderRadius,
                      overflow: "hidden",
                      boxShadow: "0 24px 64px rgba(0,0,0,0.4)",
                    }}>      
                      <input
                      value={apiKey}
                      onChange={e => setApiKey(e.target.value)}
                      placeholder={"Paste your Anthropic API key here to get started"}
                      type="password"
                      autoFocus
                      style={{
                          width: "100%",
                          background: "transparent",
                          border: "none",
                          padding: "20px",
                          fontFamily: "'Geist', sans-serif",
                          fontSize: 14, lineHeight: 1.2,
                          color: C.text, fontWeight: 300,
                          outline: 'none'
                      }}
                      />
      
                      {/* Card footer */}
                      <div style={{
                      padding: "8px",
                      borderTop: `1px solid ${C.border}`,
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      background: C.panel,
                      }}>
                          <span style={{
                            fontFamily: "'Geist Mono', monospace", fontSize: 11,
                            color: wordCount >= 50 ? ACCENT : C.muted,
                            paddingLeft: 12
                            }}>
                            Your API key is stored locally in your browser and never shared with anyone.
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
                    <div style={{
                      maxWidth: 780, width: "100%",
                      background: C.surfaceGradient,
                      border: `1px solid ${phase === "error" ? C.red : C.border}`,
                      borderRadius: C.borderRadius,
                      overflow: "hidden",
                      boxShadow: "0 24px 64px rgba(0,0,0,0.4)",
                    }}>
                      <textarea
                      ref={textareaRef}
                      value={article}
                      onChange={e => setArticle(e.target.value)}
                      placeholder={"Paste your article text or URL here — news, research, blog post, report… anything with data or narrative structure"}
                      style={{
                          width: "100%", height: 250,
                          background: "transparent",
                          border: "none",
                          padding: "20px",
                          fontFamily: "'Geist', sans-serif",
                          fontSize: 14, lineHeight: 1.8,
                          color: C.text, fontWeight: 300,
                      }}
                      />
      
                      {/* Card footer */}
                      <div style={{
                      padding: "8px",
                      borderTop: `1px solid ${C.border}`,
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      background: C.panel,
                      }}>
                      <div style={{ paddingLeft: 12 }}>
                        {phase === "error" && (
                          <div style={{
                          fontFamily: "'Geist Mono', monospace", fontSize: 11, color: C.red,
                          }}>
                          ✕ {log[log.length - 1]}
                          </div>
                        )}
                        {phase !== "error" && (
                            <div style={{
                            fontFamily: "'Geist Mono', monospace", fontSize: 11, color: C.muted,
                            }}>
                              {isUrlInput ? <><IconCheck size={13} style={{ display: "inline-block", color: ACCENT }} /> URL detected</> : wordCount > 0 ? `${wordCount} words ${wordCount < 50 ? `(need ${50 - wordCount} more)` : "✓"}` : "Works with a URL or raw text (best with 200+ words)"}
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
                  <div style={{
                      display: "flex", gap: 48, marginTop: 36, flexWrap: "wrap",
                      justifyContent: "center", maxWidth: 600,
                  }}>
                      {[
                      [<IconChartHistogram key={1} size={17} style={{ display: "inline-block" }} />, "Visualizations", "Animated charts and graphs"],
                      [<IconKeyframes key={2} size={17} style={{ display: "inline-block" }} />, "Editorial Design", "Custom aesthetic per article"],
                      [<IconNews key={3} size={17} style={{ display: "inline-block" }} />, "Woven Narrative", "Visuals placed between text"],
                      ].map(([icon, title, sub], idx) => (
                      <div key={idx} style={{ textAlign: "center", minWidth: 140 }}>
                        <div style={{ color: ACCENT, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 6 }}>
                          {icon}
                          <div style={{
                          fontFamily: "'Geist Mono', monospace",
                          fontSize: 13,
                          }}>{title}</div>
                        </div>
                          <div style={{ fontSize: 13, color: C.muted, fontWeight: 300 }}>{sub}</div>
                      </div>
                      ))}
                  </div>
                  </div>
              )}

            {/* ── GENERATING ── */}
            {phase === "generating" && (
              <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "48px 24px", gap: 32, animation: "fadeUp 0.4s ease both" }}>
                {/* Animated spinner ring */}
                  <div style={{ position: "relative", width: 120, height: 120, background: C.bg, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
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
                    <GlowText text="Pagelight AI is reading" pauseMs={500} strength={0.7} color={ACCENT} /><ThinkingDots accent={ACCENT} />
                  </h2>
                  <p style={{ fontSize: 14, color: C.muted, fontWeight: 300, lineHeight: 1.7 }}>
                    Identifying data points, selecting chart types, and structuring your article&apos;s editorial layout.
                  </p>
                </div>
                <div style={{ width: "100%", maxWidth: 600 }}>
                  <StatusLog lines={log} accent={ACCENT} />
                </div>
              </div>
            )}

            {/* ── DONE ── */}
            {phase === "done" && articleData && (
              <div style={{ flex: 1, overflowY: "auto", width: "100%", maxWidth: 780, margin: "0 auto" }}>
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