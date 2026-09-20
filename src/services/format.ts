// ────────────────────────────────────────────────────────────────────────────
// services/format — pure, dependency-free formatting & hashing utilities
// ────────────────────────────────────────────────────────────────────────────

export function byteSize(s: string): string {
  const b = new Blob([s]).size;
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / 1024 / 1024).toFixed(2)} MB`;
}

export function formatDuration(totalSeconds: number): string {
  const t = Math.round(totalSeconds);
  if (t < 60) return `${t}s`;
  const m = Math.floor(t / 60);
  const s = t % 60;
  if (m < 60) return s ? `${m}m ${s}s` : `${m}m`;
  const h = Math.floor(m / 60);
  return `${h}h ${m % 60}m`;
}

/** cyrb53-style 64-bit fingerprint rendered as 16 hex chars */
export function shortHash(content: string): string {
  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;
  for (let i = 0; i < content.length; i++) {
    const ch = content.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (
    (h2 >>> 0).toString(16).padStart(8, "0") + (h1 >>> 0).toString(16).padStart(8, "0")
  );
}

export function countLines(s: string): number {
  return s.split("\n").length;
}

export const clamp = (v: number, min: number, max: number) =>
  Math.min(max, Math.max(min, v));
