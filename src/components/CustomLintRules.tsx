import { useState, useEffect } from "react";
import type { Config } from "../lib/generator";

interface CustomRule {
  id: string;
  name: string;
  description: string;
  severity: "error" | "warning" | "info";
  condition: string;
  message: string;
  enabled: boolean;
}

interface CustomLintRulesProps {
  config: Config;
}

const STORAGE_KEY = "devcontainer-forge-custom-rules";

const DEFAULT_RULES: CustomRule[] = [
  {
    id: "custom-1",
    name: "Node Version Check",
    description: "Ensure Node.js version is LTS",
    severity: "warning",
    condition: "nodeVersion >= 18",
    message: "Consider using Node.js LTS version (18+)",
    enabled: true,
  },
  {
    id: "custom-2",
    name: "Docker in Docker",
    description: "Check if Docker-in-Docker is enabled",
    severity: "info",
    condition: "hasFeature('docker-in-docker')",
    message: "Docker-in-Docker is enabled for nested containers",
    enabled: true,
  },
];

export default function CustomLintRules({ config }: CustomLintRulesProps) {
  const [rules, setRules] = useState<CustomRule[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : DEFAULT_RULES;
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [newRule, setNewRule] = useState<Partial<CustomRule>>({
    severity: "warning",
    enabled: true,
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rules));
  }, [rules]);

  const evaluateRule = (rule: CustomRule): { passed: boolean; message: string } => {
    // Simple rule evaluation based on condition
    const condition = rule.condition.toLowerCase();

    if (condition.includes("nodeversion")) {
      const nodeFeature = config.features.find((f) => f.id === "node");
      if (nodeFeature && nodeFeature.on) {
        const version = parseInt(nodeFeature.version || "0");
        const required = parseInt(condition.match(/\d+/)?.[0] || "0");
        return {
          passed: version >= required,
          message: rule.message,
        };
      }
    }

    if (condition.includes("hasfeature")) {
      const featureName = condition.match(/'([^']+)'/)?.[1];
      if (featureName) {
        const feature = config.features.find((f) => f.id === featureName);
        return {
          passed: feature?.on || false,
          message: rule.message,
        };
      }
    }

    if (condition.includes("port")) {
      const portNum = parseInt(condition.match(/\d+/)?.[0] || "0");
      return {
        passed: config.ports.includes(portNum.toString()),
        message: rule.message,
      };
    }

    return { passed: true, message: rule.message };
  };

  const addRule = () => {
    if (!newRule.name || !newRule.condition || !newRule.message) return;

    const rule: CustomRule = {
      id: `custom-${Date.now()}`,
      name: newRule.name || "",
      description: newRule.description || "",
      severity: newRule.severity || "warning",
      condition: newRule.condition || "",
      message: newRule.message || "",
      enabled: newRule.enabled ?? true,
    };

    setRules([...rules, rule]);
    setNewRule({ severity: "warning", enabled: true });
    setShowAddModal(false);
  };

  const deleteRule = (id: string) => {
    setRules(rules.filter((r) => r.id !== id));
  };

  const toggleRule = (id: string) => {
    setRules(rules.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r)));
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "error":
        return "bg-coral-500/20 text-coral-400 border-coral-500/30";
      case "warning":
        return "bg-ember-500/20 text-ember-400 border-ember-500/30";
      case "info":
        return "bg-skyx-500/20 text-skyx-400 border-skyx-500/30";
      default:
        return "bg-ink-800 text-mist-400 border-ink-700";
    }
  };

  const enabledRules = rules.filter((r) => r.enabled);
  const results = enabledRules.map((rule) => ({
    rule,
    result: evaluateRule(rule),
  }));

  return (
    <div className="bg-ink-900 border border-ink-700 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-mist-100">Custom Lint Rules</h3>
          <p className="text-sm text-mist-500">Define your own validation rules</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-ember-500 hover:bg-ember-600 text-ink-950 font-semibold rounded-lg transition-colors"
        >
          + Add Rule
        </button>
      </div>

      {rules.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📝</div>
          <p className="text-mist-400">No custom rules yet</p>
          <p className="text-sm text-mist-500 mt-2">
            Click "Add Rule" to create your first custom validation rule
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {results.map(({ rule, result }) => (
            <div
              key={rule.id}
              className={`border rounded-lg p-4 ${getSeverityColor(rule.severity)}`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <input
                      type="checkbox"
                      checked={rule.enabled}
                      onChange={() => toggleRule(rule.id)}
                      className="w-4 h-4 rounded bg-ink-700 border-ink-600"
                    />
                    <h4 className="font-semibold text-mist-100">{rule.name}</h4>
                    <span className="text-xs px-2 py-0.5 rounded bg-ink-800 text-mist-400">
                      {rule.severity}
                    </span>
                  </div>
                  <p className="text-sm text-mist-400 mb-2">{rule.description}</p>
                  <div className="text-xs text-mist-500 font-mono bg-ink-950 px-2 py-1 rounded">
                    {rule.condition}
                  </div>
                </div>
                <button
                  onClick={() => deleteRule(rule.id)}
                  className="text-mist-500 hover:text-coral-400 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
              <div className="flex items-center gap-2 text-sm">
                {result.passed ? (
                  <>
                    <span className="text-lagoon-400">✓</span>
                    <span className="text-mist-300">{result.message}</span>
                  </>
                ) : (
                  <>
                    <span className="text-coral-400">✗</span>
                    <span className="text-mist-300">{result.message}</span>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Rule Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-ink-900 border border-ink-700 rounded-xl shadow-2xl w-[90vw] max-w-lg p-6">
            <h3 className="text-xl font-bold text-mist-100 mb-4">Add Custom Rule</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-mist-300 mb-2">Rule Name</label>
                <input
                  type="text"
                  value={newRule.name || ""}
                  onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                  className="w-full px-4 py-2 bg-ink-800 border border-ink-700 rounded-lg text-mist-100 focus:outline-none focus:border-ember-500"
                  placeholder="My Custom Rule"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-mist-300 mb-2">Description</label>
                <input
                  type="text"
                  value={newRule.description || ""}
                  onChange={(e) => setNewRule({ ...newRule, description: e.target.value })}
                  className="w-full px-4 py-2 bg-ink-800 border border-ink-700 rounded-lg text-mist-100 focus:outline-none focus:border-ember-500"
                  placeholder="What does this rule check?"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-mist-300 mb-2">Severity</label>
                <select
                  value={newRule.severity}
                  onChange={(e) => setNewRule({ ...newRule, severity: e.target.value as any })}
                  className="w-full px-4 py-2 bg-ink-800 border border-ink-700 rounded-lg text-mist-100 focus:outline-none focus:border-ember-500"
                >
                  <option value="error">Error</option>
                  <option value="warning">Warning</option>
                  <option value="info">Info</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-mist-300 mb-2">Condition</label>
                <input
                  type="text"
                  value={newRule.condition || ""}
                  onChange={(e) => setNewRule({ ...newRule, condition: e.target.value })}
                  className="w-full px-4 py-2 bg-ink-800 border border-ink-700 rounded-lg text-mist-100 font-mono text-sm focus:outline-none focus:border-ember-500"
                  placeholder="nodeVersion >= 18"
                />
                <p className="text-xs text-mist-500 mt-1">
                  Examples: nodeVersion {">"}= 18, hasFeature('docker-in-docker'), port == 3000
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-mist-300 mb-2">Message</label>
                <input
                  type="text"
                  value={newRule.message || ""}
                  onChange={(e) => setNewRule({ ...newRule, message: e.target.value })}
                  className="w-full px-4 py-2 bg-ink-800 border border-ink-700 rounded-lg text-mist-100 focus:outline-none focus:border-ember-500"
                  placeholder="Message to display when rule fails"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 bg-ink-800 hover:bg-ink-700 text-mist-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={addRule}
                className="px-4 py-2 bg-ember-500 hover:bg-ember-600 text-ink-950 font-semibold rounded-lg transition-colors"
              >
                Add Rule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
