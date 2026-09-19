// ────────────────────────────────────────────────────────────────────────────
// services/meter — a bounded rolling-window latency meter with derived stats
// ────────────────────────────────────────────────────────────────────────────

export interface Meter {
  push(v: number): void;
  values(): number[];
  last(): number;
  avg(): number;
  max(): number;
  count(): number;
  reset(): void;
}

export function createMeter(capacity = 16): Meter {
  const buf: number[] = [];
  return {
    push(v) {
      buf.push(Math.max(v, 0));
      if (buf.length > capacity) buf.shift();
    },
    values: () => [...buf],
    last: () => (buf.length ? buf[buf.length - 1] : 0),
    avg: () => (buf.length ? buf.reduce((a, b) => a + b, 0) / buf.length : 0),
    max: () => (buf.length ? Math.max(...buf) : 0),
    count: () => buf.length,
    reset: () => {
      buf.length = 0;
    },
  };
}
