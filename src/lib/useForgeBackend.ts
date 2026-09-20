// ────────────────────────────────────────────────────────────────────────────
// useForgeBackend — talks to the forge worker like a tiny backend service.
// Coalesces rapid manifest edits to the latest config, debounces, caches
// results by manifest hash, reports compute latency + cache hits, and falls
// back to synchronous computation if workers are unavailable.
// ────────────────────────────────────────────────────────────────────────────
import { useEffect, useRef, useState } from "react";
import {
  computeBundle,
  shortHash,
  type Config,
  type ForgeBundle,
} from "./generator";
import type { WorkerRequest, WorkerResponse } from "./forge.worker";

export type BackendStatus = "compiling" | "ready";

export interface BackendState {
  bundle: ForgeBundle;
  status: BackendStatus;
  ms: number;
  cacheHits: number;
  workerOk: boolean;
  /** rolling window of recent compile latencies (ms) for the sparkline */
  times: number[];
}

const keyOf = (c: Config) => shortHash(JSON.stringify(c));

export function useForgeBackend(cfg: Config): BackendState {
  // Seed synchronously so the first paint is never empty.
  const [bundle, setBundle] = useState<ForgeBundle>(() => computeBundle(cfg));
  const [status, setStatus] = useState<BackendStatus>("ready");
  const [ms, setMs] = useState(0);
  const [cacheHits, setCacheHits] = useState(0);
  const [workerOk, setWorkerOk] = useState(true);
  const [times, setTimes] = useState<number[]>([]);
  const recordTime = (v: number) => setTimes((t) => [...t.slice(-15), Math.max(v, 0.1)]);

  const workerRef = useRef<Worker | null>(null);
  const workerFailedRef = useRef(false);
  const reqIdRef = useRef(0);
  const cacheRef = useRef(new Map<string, ForgeBundle>());
  const debounceRef = useRef<number | undefined>(undefined);

  // Lazily boot the worker once.
  useEffect(() => {
    if (typeof Worker === "undefined") {
      workerFailedRef.current = true;
      setWorkerOk(false);
      return;
    }
    try {
      const w = new Worker(new URL("./forge.worker.ts", import.meta.url), {
        type: "module",
      });
      w.onmessage = (e: MessageEvent<WorkerResponse & { error?: string }>) => {
        const res = e.data;
        // Coalescing: only the newest request may land.
        if (res.id !== reqIdRef.current) return;
        if (res.error || !res.bundle) {
          // Worker blew up — degrade to the main thread, quietly.
          workerFailedRef.current = true;
          setWorkerOk(false);
          runSync();
          return;
        }
        cacheRef.current.set(keyOf(lastCfgRef.current), res.bundle);
        setBundle(res.bundle);
        setMs(res.ms ?? 0);
        recordTime(res.ms ?? 0);
        setStatus("ready");
      };
      workerRef.current = w;
      return () => w.terminate();
    } catch {
      workerFailedRef.current = true;
      setWorkerOk(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const lastCfgRef = useRef<Config>(cfg);

  const runSync = () => {
    const t0 = performance.now();
    const b = computeBundle(lastCfgRef.current);
    cacheRef.current.set(keyOf(lastCfgRef.current), b);
    const dt = performance.now() - t0;
    setBundle(b);
    setMs(dt);
    recordTime(dt);
    setStatus("ready");
  };

  useEffect(() => {
    lastCfgRef.current = cfg;
    setStatus("compiling");
    window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => {
      const key = keyOf(cfg);
      const cached = cacheRef.current.get(key);
      if (cached) {
        setBundle(cached);
        setMs(0);
        setCacheHits((n) => n + 1);
        setStatus("ready");
        return;
      }
      const id = ++reqIdRef.current;
      if (!workerFailedRef.current && workerRef.current) {
        const req: WorkerRequest = { id, cfg };
        workerRef.current.postMessage(req);
      } else {
        runSync();
      }
    }, 60);
    return () => window.clearTimeout(debounceRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cfg]);

  return { bundle, status, ms, cacheHits, workerOk, times };
}
