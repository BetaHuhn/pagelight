import { NextRequest, NextResponse } from "next/server";
import net from "node:net";
import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";

export const runtime = "nodejs";

const MAX_HTML_BYTES = 2_500_000; // ~2.5MB
const TIMEOUT_MS = 12_000;

function isPrivateIp(ip: string): boolean {
  if (ip.includes(":")) {
    const normalized = ip.toLowerCase();
    return (
      normalized === "::1" ||
      normalized.startsWith("fc") ||
      normalized.startsWith("fd") ||
      normalized.startsWith("fe80")
    );
  }

  const parts = ip.split(".").map((n) => Number(n));
  if (parts.length !== 4 || parts.some((n) => Number.isNaN(n) || n < 0 || n > 255)) return true;
  const [a, b] = parts;

  return (
    a === 10 ||
    a === 127 ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168)
  );
}

function isBlockedHost(hostname: string): boolean {
  const host = hostname.trim().toLowerCase();
  if (!host) return true;
  if (host === "localhost" || host.endsWith(".localhost")) return true;
  if (host === "0.0.0.0" || host === "::") return true;

  const ipVersion = net.isIP(host);
  if (ipVersion) return isPrivateIp(host);

  return false;
}

function cleanText(text: string): string {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/\t+/g, " ")
    .replace(/[ \u00A0]{2,}/g, " ")
    .trim();
}

function fallbackExtract(doc: Document): { title: string | null; text: string } {
  const selectorsToRemove = [
    "script",
    "style",
    "noscript",
    "svg",
    "canvas",
    "nav",
    "header",
    "footer",
    "aside",
    "form",
    "iframe",
    "button",
    "input",
    "textarea",
  ];
  for (const sel of selectorsToRemove) {
    doc.querySelectorAll(sel).forEach((el) => el.remove());
  }

  const root =
    doc.querySelector("article") ||
    doc.querySelector("main") ||
    doc.querySelector('[role="main"]') ||
    doc.body;

  const title = doc.querySelector("title")?.textContent?.trim() || null;
  const text = cleanText(root?.textContent || "");
  return { title, text };
}

async function readResponseTextWithLimit(res: Response, maxBytes: number): Promise<string> {
  const body = res.body;
  if (!body) return "";

  const reader = body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (!value) continue;
    total += value.byteLength;
    if (total > maxBytes) throw new Error("Fetched page is too large to process.");
    chunks.push(value);
  }

  const merged = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    merged.set(chunk, offset);
    offset += chunk.byteLength;
  }

  return new TextDecoder("utf-8", { fatal: false }).decode(merged);
}

async function fetchHtml(
  url: string
): Promise<{ html: string; finalUrl: string; contentType: string }> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      method: "GET",
      redirect: "follow",
      signal: controller.signal,
      headers: {
        accept: "text/html,application/xhtml+xml;q=0.9,*/*;q=0.1",
        "user-agent": "Pagelight/1.0 (+local dev)",
      },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch URL (HTTP ${res.status}).`);
    }

    const contentType = res.headers.get("content-type") || "";
    if (!/text\/html|application\/xhtml\+xml/i.test(contentType)) {
      throw new Error(`Unsupported content-type: ${contentType || "unknown"}.`);
    }

    const html = await readResponseTextWithLimit(res, MAX_HTML_BYTES);
    return { html, finalUrl: res.url || url, contentType };
  } finally {
    clearTimeout(timeout);
  }
}

function extractArticle(
  html: string,
  baseUrl: string
): {
  title: string | null;
  byline: string | null;
  excerpt: string | null;
  text: string;
} {
  const dom = new JSDOM(html, { url: baseUrl });
  const doc = dom.window.document;

  try {
    const reader = new Readability(doc);
    const parsed = reader.parse();
    if (parsed?.textContent) {
      return {
        title: parsed.title?.trim() || null,
        byline: parsed.byline?.trim() || null,
        excerpt: parsed.excerpt?.trim() || null,
        text: cleanText(parsed.textContent),
      };
    }
  } catch {
    // ignore and fallback
  }

  const fallback = fallbackExtract(doc);
  return { title: fallback.title, byline: null, excerpt: null, text: fallback.text };
}

function parseAndValidateUrl(
  input: unknown
): { ok: true; url: URL } | { ok: false; error: string } {
  if (typeof input !== "string" || !input.trim()) return { ok: false, error: "URL is required." };

  let url: URL;
  try {
    url = new URL(input.trim());
  } catch {
    return { ok: false, error: "Invalid URL." };
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    return { ok: false, error: "Only http(s) URLs are supported." };
  }

  if (isBlockedHost(url.hostname)) {
    return { ok: false, error: "This host is not allowed." };
  }

  return { ok: true, url };
}

async function handle(inputUrl: unknown) {
  const parsedUrl = parseAndValidateUrl(inputUrl);
  if (!parsedUrl.ok)
    return NextResponse.json({ ok: false, error: parsedUrl.error }, { status: 400 });

  const { html, finalUrl } = await fetchHtml(parsedUrl.url.toString());
  const extracted = extractArticle(html, finalUrl);
  const wordCount = extracted.text.split(/\s+/).filter(Boolean).length;

  if (!extracted.text) {
    return NextResponse.json(
      { ok: false, error: "No readable text found on the page." },
      { status: 422 }
    );
  }

  return NextResponse.json({
    ok: true,
    url: finalUrl,
    title: extracted.title,
    byline: extracted.byline,
    excerpt: extracted.excerpt,
    text: extracted.text,
    wordCount,
  });
}

export async function POST(req: NextRequest) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body." }, { status: 400 });
  }

  try {
    return await handle(body?.url);
  } catch (err: any) {
    const message = err?.name === "AbortError" ? "Fetch timed out." : err?.message || String(err);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const url = req.nextUrl.searchParams.get("url");
    return await handle(url);
  } catch (err: any) {
    const message = err?.name === "AbortError" ? "Fetch timed out." : err?.message || String(err);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
