import { useEffect, useState } from "react";

interface PerfMetrics {
  totalGenerations: number;
  avgGenerationTime: number;
  totalBytesGenerated: number;
  cacheHitRate: number;
  lastGenerationTime: number;
}

const METRICS_KEY = "forge.metrics";

export function usePerformanceMetrics() {
  const [metrics, setMetrics] = useState<PerfMetrics>(() => {
    if (typeof window === "undefined") {
      return {
        totalGenerations: 0,
        avgGenerationTime: 0,
        totalBytesGenerated: 0,
        cacheHitRate: 0,
        lastGenerationTime: 0,
      };
    }
    const stored = localStorage.getItem(METRICS_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        // ignore
      }
    }
    return {
      totalGenerations: 0,
      avgGenerationTime: 0,
      totalBytesGenerated: 0,
      cacheHitRate: 0,
      lastGenerationTime: 0,
    };
  });

  useEffect(() => {
    localStorage.setItem(METRICS_KEY, JSON.stringify(metrics));
  }, [metrics]);

  const recordGeneration = (timeMs: number, bytesGenerated: number, cacheHit: boolean) => {
    setMetrics((prev) => {
      const totalGens = prev.totalGenerations + 1;
      const totalTime = prev.avgGenerationTime * prev.totalGenerations + timeMs;
      const avgTime = totalTime / totalGens;
      const cacheHits = prev.cacheHitRate * prev.totalGenerations + (cacheHit ? 1 : 0);
      const cacheRate = cacheHits / totalGens;

      return {
        totalGenerations: totalGens,
        avgGenerationTime: avgTime,
        totalBytesGenerated: prev.totalBytesGenerated + bytesGenerated,
        cacheHitRate: cacheRate,
        lastGenerationTime: timeMs,
      };
    });
  };

  const resetMetrics = () => {
    setMetrics({
      totalGenerations: 0,
      avgGenerationTime: 0,
      totalBytesGenerated: 0,
      cacheHitRate: 0,
      lastGenerationTime: 0,
    });
  };

  return { metrics, recordGeneration, resetMetrics };
}
