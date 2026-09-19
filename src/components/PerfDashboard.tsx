import { usePerformanceMetrics } from "../hooks/usePerformanceMetrics";

interface PerfDashboardProps {
  open: boolean;
  onClose: () => void;
}

export default function PerfDashboard({ open, onClose }: PerfDashboardProps) {
  const { metrics, resetMetrics } = usePerformanceMetrics();

  if (!open) return null;

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const formatTime = (ms: number) => {
    if (ms < 1000) return `${ms.toFixed(1)} ms`;
    return `${(ms / 1000).toFixed(2)} s`;
  };

  return (
    <div className="fixed inset-0 z-50">
      <div className="backdrop-in absolute inset-0 bg-ink-950/80 backdrop-blur-[3px]" onClick={onClose} />
      <div className="modal-in absolute left-1/2 top-[10vh] w-[min(92vw,640px)] -translate-x-1/2 border border-ink-600 rounded-xl bg-ink-900 shadow-[0_30px_90px_-20px_rgba(0,0,0,0.9)] overflow-hidden">
        <div className="flex items-center justify-between border-b border-ink-700/70 bg-ink-850 px-5 py-3.5">
          <div className="flex items-center gap-3">
            <svg viewBox="0 0 16 16" className="w-5 h-5 text-lagoon-400" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M2 12L6 8l3 3 5-7" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="2" cy="12" r="1" fill="currentColor" />
              <circle cx="6" cy="8" r="1" fill="currentColor" />
              <circle cx="9" cy="11" r="1" fill="currentColor" />
              <circle cx="14" cy="4" r="1" fill="currentColor" />
            </svg>
            <h2 className="font-display font-semibold text-[16px] text-mist-100">Performance Analytics</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid place-items-center w-7 h-7 rounded-md text-mist-500 hover:text-mist-100 hover:bg-ink-700 transition-colors"
            aria-label="close"
          >
            <svg viewBox="0 0 12 12" className="w-3.5 h-3.5" stroke="currentColor" strokeWidth="1.6" fill="none">
              <path d="M2.5 2.5l7 7m0-7-7 7" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Stats grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="border border-ink-700 rounded-lg bg-ink-850/50 p-4">
              <div className="font-mono text-[10px] uppercase tracking-wider text-mist-600 mb-1">
                Total Generations
              </div>
              <div className="font-display font-bold text-[24px] text-mist-100">
                {metrics.totalGenerations}
              </div>
            </div>

            <div className="border border-ink-700 rounded-lg bg-ink-850/50 p-4">
              <div className="font-mono text-[10px] uppercase tracking-wider text-mist-600 mb-1">
                Avg Generation Time
              </div>
              <div className="font-display font-bold text-[24px] text-lagoon-400">
                {formatTime(metrics.avgGenerationTime)}
              </div>
            </div>

            <div className="border border-ink-700 rounded-lg bg-ink-850/50 p-4">
              <div className="font-mono text-[10px] uppercase tracking-wider text-mist-600 mb-1">
                Last Generation
              </div>
              <div className="font-display font-bold text-[24px] text-ember-400">
                {formatTime(metrics.lastGenerationTime)}
              </div>
            </div>

            <div className="border border-ink-700 rounded-lg bg-ink-850/50 p-4">
              <div className="font-mono text-[10px] uppercase tracking-wider text-mist-600 mb-1">
                Cache Hit Rate
              </div>
              <div className="font-display font-bold text-[24px] text-skyx-400">
                {(metrics.cacheHitRate * 100).toFixed(1)}%
              </div>
            </div>

            <div className="border border-ink-700 rounded-lg bg-ink-850/50 p-4 col-span-2">
              <div className="font-mono text-[10px] uppercase tracking-wider text-mist-600 mb-1">
                Total Bytes Generated
              </div>
              <div className="font-display font-bold text-[24px] text-mist-100">
                {formatBytes(metrics.totalBytesGenerated)}
              </div>
            </div>
          </div>

          {/* Insights */}
          <div className="border border-ink-700 rounded-lg bg-ink-850/50 p-4">
            <h3 className="font-display font-semibold text-[13px] text-mist-100 mb-3">Insights</h3>
            <ul className="space-y-2 text-[12px] text-mist-400">
              {metrics.totalGenerations === 0 && (
                <li className="flex items-start gap-2">
                  <span className="text-ember-400">•</span>
                  <span>Start configuring to see performance metrics</span>
                </li>
              )}
              {metrics.totalGenerations > 0 && metrics.cacheHitRate < 0.5 && (
                <li className="flex items-start gap-2">
                  <span className="text-ember-400">•</span>
                  <span>Cache hit rate is low — try making smaller changes to benefit from caching</span>
                </li>
              )}
              {metrics.totalGenerations > 0 && metrics.cacheHitRate >= 0.5 && (
                <li className="flex items-start gap-2">
                  <span className="text-lagoon-400">•</span>
                  <span>Great cache utilization — the backend is working efficiently</span>
                </li>
              )}
              {metrics.avgGenerationTime > 100 && (
                <li className="flex items-start gap-2">
                  <span className="text-ember-400">•</span>
                  <span>Generation time is high — consider simplifying the configuration</span>
                </li>
              )}
              {metrics.avgGenerationTime > 0 && metrics.avgGenerationTime <= 100 && (
                <li className="flex items-start gap-2">
                  <span className="text-lagoon-400">•</span>
                  <span>Excellent performance — generations are fast and responsive</span>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-ink-700/70 bg-ink-850 px-5 py-3">
          <button
            type="button"
            onClick={() => {
              if (confirm("Reset all performance metrics?")) {
                resetMetrics();
              }
            }}
            className="font-mono text-[11px] text-mist-500 hover:text-coral-400 transition-colors"
          >
            Reset metrics
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-ember-500 px-4 py-2 text-[12px] font-bold text-ink-950 hover:bg-ember-400 transition-all active:scale-95"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
