import { useState } from "react";
import {
  ENVIRONMENTS,
  applyEnvironment,
  getEnvironmentDiff,
  type Environment,
} from "../lib/multi-environment";
import type { Config } from "../lib/generator";

interface MultiEnvironmentSelectorProps {
  config: Config;
  onApply: (config: Config) => void;
}

export default function MultiEnvironmentSelector({
  config,
  onApply,
}: MultiEnvironmentSelectorProps) {
  const [selectedEnv, setSelectedEnv] = useState<Environment>("development");
  const [showDiff, setShowDiff] = useState(false);

  const envConfig = ENVIRONMENTS.find((e) => e.name === selectedEnv)!;
  const diff = getEnvironmentDiff(config, selectedEnv);

  const handleApply = () => {
    const modified = applyEnvironment(config, selectedEnv);
    onApply(modified);
  };

  const envIcons = {
    development: "🛠️",
    staging: "🧪",
    production: "🚀",
  };

  return (
    <div className="bg-ink-900 border border-ink-700 rounded-lg p-6">
      <h3 className="text-lg font-bold text-mist-100 mb-4">Multi-Environment Support</h3>
      <div className="grid grid-cols-3 gap-3 mb-4">
        {ENVIRONMENTS.map((env) => (
          <button
            key={env.name}
            onClick={() => {
              setSelectedEnv(env.name);
              setShowDiff(false);
            }}
            className={`p-4 rounded-lg border transition-all ${
              selectedEnv === env.name
                ? "bg-ember-500/10 border-ember-500/50"
                : "bg-ink-800 border-ink-700 hover:border-ink-600"
            }`}
          >
            <div className="text-3xl mb-2">{envIcons[env.name]}</div>
            <div className="text-sm font-semibold text-mist-100 mb-1">{env.label}</div>
            <div className="text-xs text-mist-500">{env.description}</div>
          </button>
        ))}
      </div>

      {showDiff && diff.length > 0 && (
        <div className="mb-4 p-4 bg-ink-800 rounded-lg">
          <div className="text-sm text-mist-500 mb-2">Changes from current config:</div>
          <ul className="space-y-1">
            {diff.map((change, idx) => (
              <li key={idx} className="text-sm text-mist-300">
                • {change}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex items-center gap-3">
        <button
          onClick={() => setShowDiff(!showDiff)}
          className="px-4 py-2 bg-ink-700 hover:bg-ink-600 text-mist-100 rounded-lg transition-colors text-sm"
        >
          {showDiff ? "Hide" : "Show"} Changes
        </button>
        <button
          onClick={handleApply}
          className="px-4 py-2 bg-ember-500 hover:bg-ember-600 text-ink-950 rounded-lg transition-colors text-sm font-semibold"
        >
          Apply {envConfig.label} Config
        </button>
      </div>
    </div>
  );
}
