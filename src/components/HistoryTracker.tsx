import { useState, useEffect } from "react";
import type { Config } from "../lib/generator";

interface HistoryEntry {
  id: string;
  timestamp: number;
  config: Config;
  label?: string;
}

interface HistoryTrackerProps {
  currentConfig: Config;
  onRestore: (config: Config) => void;
}

const STORAGE_KEY = "forge.config.history";
const MAX_ENTRIES = 20;

export default function HistoryTracker({ currentConfig, onRestore }: HistoryTrackerProps) {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Load history from localStorage
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setHistory(JSON.parse(stored));
      } catch (err) {
        console.error("Failed to load history:", err);
      }
    }
  }, []);

  const saveSnapshot = (label?: string) => {
    const entry: HistoryEntry = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      config: currentConfig,
      label,
    };

    const newHistory = [entry, ...history].slice(0, MAX_ENTRIES);
    setHistory(newHistory);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
  };

  const restoreSnapshot = (entry: HistoryEntry) => {
    onRestore(entry.config);
    setIsOpen(false);
  };

  const deleteSnapshot = (id: string) => {
    const newHistory = history.filter((e) => e.id !== id);
    setHistory(newHistory);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
  };

  const clearHistory = () => {
    if (confirm("Clear all history? This cannot be undone.")) {
      setHistory([]);
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const formatTimestamp = (ts: number) => {
    const date = new Date(ts);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const getConfigSummary = (config: Config) => {
    const features = config.features.filter((f) => f.on).length;
    const langs = config.langs.filter((l) => l.on).length;
    const tools = config.toolGroups.filter((g) => g.on).length;
    return `${features} features · ${langs} langs · ${tools} tools`;
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-ink-700 hover:bg-ink-600 text-mist-100 rounded-lg transition-colors"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        History ({history.length})
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/80 backdrop-blur-sm">
          <div className="bg-ink-900 border border-ink-700 rounded-xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-ink-700">
              <div>
                <h2 className="text-2xl font-bold text-mist-100">Configuration History</h2>
                <p className="text-sm text-mist-500 mt-1">
                  {history.length} snapshot{history.length !== 1 ? "s" : ""} saved
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-mist-500 hover:text-mist-100 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {history.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full space-y-4">
                  <div className="text-6xl">📜</div>
                  <h3 className="text-xl font-semibold text-mist-100">No History Yet</h3>
                  <p className="text-mist-500 text-center max-w-md">
                    Save snapshots of your configuration to track changes over time
                  </p>
                  <button
                    onClick={() => {
                      saveSnapshot("Initial snapshot");
                      setIsOpen(false);
                    }}
                    className="px-6 py-3 bg-ember-500 hover:bg-ember-600 text-ink-950 font-semibold rounded-lg transition-colors"
                  >
                    Save Current Config
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between mb-4">
                    <button
                      onClick={() => saveSnapshot()}
                      className="px-4 py-2 bg-ember-500 hover:bg-ember-600 text-ink-950 font-semibold rounded-lg transition-colors"
                    >
                      + Save Current Config
                    </button>
                    <button
                      onClick={clearHistory}
                      className="px-4 py-2 text-coral-400 hover:text-coral-300 transition-colors"
                    >
                      Clear All
                    </button>
                  </div>

                  {history.map((entry) => (
                    <div
                      key={entry.id}
                      className="p-4 bg-ink-800/50 border border-ink-700 rounded-lg hover:border-ink-600 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-semibold text-mist-100">
                              {entry.label || "Untitled snapshot"}
                            </span>
                            <span className="text-xs text-mist-600">
                              {formatTimestamp(entry.timestamp)}
                            </span>
                          </div>
                          <div className="text-xs text-mist-500 font-mono">
                            {getConfigSummary(entry.config)}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => restoreSnapshot(entry)}
                            className="px-3 py-1 text-sm bg-lagoon-500/20 hover:bg-lagoon-500/30 text-lagoon-400 rounded transition-colors"
                          >
                            Restore
                          </button>
                          <button
                            onClick={() => deleteSnapshot(entry.id)}
                            className="px-3 py-1 text-sm text-coral-400 hover:text-coral-300 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end p-6 border-t border-ink-700">
              <button
                onClick={() => setIsOpen(false)}
                className="px-6 py-2 bg-ink-700 hover:bg-ink-600 text-mist-100 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
