import { SHARE_PARAM_TEXT, SHARE_PARAM_URL } from "./constants";
import { ShareSource } from "./types";

export const ease = (p: number) => 1 - Math.pow(1 - Math.min(p, 1), 3);

export const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const base64UrlEncodeBytes = (bytes: Uint8Array) => {
  let binary = "";
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  const b64 = btoa(binary);
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
};

export const base64UrlDecodeToBytes = (b64url: string) => {
  const b64 = b64url.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((b64url.length + 3) % 4);
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
};

export const encodeTextForParam = async (text: string): Promise<string> => {
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

export const decodeTextFromParam = async (encoded: string): Promise<string> => {
  const value = String(encoded || "");
  if (!value) return "";

  const [prefix, payload] = value.includes(".")
    ? (value.split(/\.(.+)/) as [string, string])
    : (["b64", value] as [string, string]);

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

export const setShareParams = async (source: ShareSource | null) => {
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
