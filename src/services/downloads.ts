// ────────────────────────────────────────────────────────────────────────────
// services/downloads — single-file saves plus a staggered bundle queue
// (browsers swallow rapid successive downloads, so the queue spaces them out)
// ────────────────────────────────────────────────────────────────────────────
import { byteSize } from "./format";

export interface BundleFile {
  name: string;
  content: string;
}

export function downloadFile(name: string, content: string) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 800);
}

export interface BundleOptions {
  /** delay between files so the browser keeps every save */
  staggerMs?: number;
  /** called after each file lands */
  onStep?: (done: number, total: number, file: BundleFile) => void;
}

export function downloadBundle(files: BundleFile[], opts: BundleOptions = {}): Promise<number> {
  const { staggerMs = 260, onStep } = opts;
  return new Promise((resolve) => {
    if (!files.length) return resolve(0);
    let done = 0;
    const next = () => {
      if (done >= files.length) return resolve(files.length);
      const f = files[done];
      downloadFile(f.name, f.content);
      done += 1;
      onStep?.(done, files.length, f);
      window.setTimeout(next, staggerMs);
    };
    next();
  });
}

export const bundleSize = (files: BundleFile[]) =>
  byteSize(files.map((f) => f.content).join(""));
