// ─── Theme ────────────────────────────────────────────────────────────────────
export const T = {
  bg:       "#07070a",
  surface:  "#0f0f12",
  panel:    "#141418",
  border:   "#1e1e24",
  accent:   "#c8f04a",     // electric lime
  accentDim:"#4a5a18",
  text:     "#dddbd5",
  muted:    "#55554f",
  white:    "#ffffff",
  red:      "#f04a4a",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
export function cc(...classes: (string | undefined | null | false)[]) { return classes.filter(Boolean).join(" "); }
