export const fetchArticleFromUrl = async (
  url: string
): Promise<{ text: string; title?: string | null; wordCount?: number }> => {
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
