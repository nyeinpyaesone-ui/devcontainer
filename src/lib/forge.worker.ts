// ────────────────────────────────────────────────────────────────────────────
// Forge backend worker — computes the full environment bundle off the main
// thread so typing in the manifest never blocks the UI. Receives a Config,
// returns a serializable ForgeBundle plus the measured compute time.
// ────────────────────────────────────────────────────────────────────────────
import { computeBundle, type Config, type ForgeBundle } from "./generator";

export interface WorkerRequest {
  id: number;
  cfg: Config;
}

export interface WorkerResponse {
  id: number;
  bundle?: ForgeBundle;
  ms?: number;
  error?: string;
  stack?: string;
}

self.onmessage = (e: MessageEvent<WorkerRequest>) => {
  const { id, cfg } = e.data;
  const t0 = performance.now();
  try {
    const bundle = computeBundle(cfg);
    const ms = performance.now() - t0;
    (self as unknown as Worker).postMessage({ id, bundle, ms } satisfies WorkerResponse);
  } catch (err) {
    // Surface failures to the main thread with full error context for debugging
    const errorObj = err instanceof Error ? err : new Error(String(err));
    (self as unknown as Worker).postMessage({
      id,
      error: errorObj.message,
      stack: errorObj.stack,
    } satisfies WorkerResponse);
  }
};
