import { useState } from "react";
import type { Config } from "../lib/generator";

interface CompareModeProps {
  currentConfig: Config;
  onClose: () => void;
}

export default function CompareMode({ currentConfig, onClose }: CompareModeProps) {
  const [importedConfig, setImportedConfig] = useState<Config | null>(null);
  const [importError, setImportError] = useState<string>("");

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const config = JSON.parse(e.target?.result as string) as Config;
        setImportedConfig(config);
        setImportError("");
      } catch (err) {
        setImportError("Invalid JSON file");
        setImportedConfig(null);
      }
    };
    reader.readAsText(file);
  };

  const getDiff = (key: keyof Config) => {
    if (!importedConfig) return null;
    
    const current = currentConfig[key];
    const imported = importedConfig[key];
    
    if (JSON.stringify(current) === JSON.stringify(imported)) {
      return { same: true };
    }
    
    return { same: false, current, imported };
  };

  const renderValue = (value: any): string => {
    if (Array.isArray(value)) {
      return `[${value.length} items]`;
    }
    if (typeof value === "object" && value !== null) {
      return JSON.stringify(value, null, 2);
    }
    return String(value);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/80 backdrop-blur-sm">
      <div className="bg-ink-900 border border-ink-700 rounded-xl shadow-2xl max-w-6xl w-full mx-4 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-ink-700">
          <div>
            <h2 className="text-2xl font-bold text-mist-100">Configuration Comparison</h2>
            <p className="text-sm text-mist-500 mt-1">Compare current config with an imported one</p>
          </div>
          <button
            onClick={onClose}
            className="text-mist-500 hover:text-mist-100 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {!importedConfig ? (
            <div className="flex flex-col items-center justify-center h-full space-y-4">
              <div className="text-6xl">📊</div>
              <h3 className="text-xl font-semibold text-mist-100">Import Configuration</h3>
              <p className="text-mist-500 text-center max-w-md">
                Import a previously exported configuration file to compare it with your current setup
              </p>
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  className="hidden"
                />
                <div className="px-6 py-3 bg-ember-500 hover:bg-ember-600 text-ink-950 font-semibold rounded-lg transition-colors">
                  Choose File
                </div>
              </label>
              {importError && (
                <p className="text-coral-400 text-sm">{importError}</p>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-mist-100">Differences</h3>
                <button
                  onClick={() => setImportedConfig(null)}
                  className="text-sm text-mist-500 hover:text-mist-100 transition-colors"
                >
                  Import Different File
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(Object.keys(currentConfig) as Array<keyof Config>).map((key) => {
                  const diff = getDiff(key);
                  if (!diff) return null;

                  return (
                    <div
                      key={key}
                      className={`p-4 rounded-lg border ${
                        diff.same
                          ? "border-ink-700 bg-ink-800/50"
                          : "border-ember-500/50 bg-ember-500/10"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-mist-100 capitalize">
                          {key.replace(/([A-Z])/g, " $1").trim()}
                        </h4>
                        {diff.same ? (
                          <span className="text-xs text-lagoon-400 font-mono">✓ SAME</span>
                        ) : (
                          <span className="text-xs text-ember-400 font-mono">⚠ DIFFERENT</span>
                        )}
                      </div>
                      
                      {diff.same ? (
                        <div className="text-sm text-mist-500 font-mono">
                          {renderValue(diff.current)}
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <div className="text-xs text-mist-600 mb-1">Current:</div>
                            <div className="text-sm text-mist-300 font-mono bg-ink-950/50 p-2 rounded">
                              {renderValue(diff.current)}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-mist-600 mb-1">Imported:</div>
                            <div className="text-sm text-mist-300 font-mono bg-ink-950/50 p-2 rounded">
                              {renderValue(diff.imported)}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end p-6 border-t border-ink-700">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-ink-700 hover:bg-ink-600 text-mist-100 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
