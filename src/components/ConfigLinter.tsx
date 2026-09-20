import { useMemo } from "react";
import type { Config } from "../lib/generator";

interface LintRule {
  id: string;
  name: string;
  category: "security" | "performance" | "best-practice" | "maintainability";
  severity: "error" | "warning" | "info";
  check: (config: Config) => boolean;
  message: string;
  suggestion: string;
}

const lintRules: LintRule[] = [
  // Security rules
  {
    id: "SEC001",
    name: "Non-root user enforcement",
    category: "security",
    severity: "error",
    check: (config) => config.enforce.nonRoot && config.remoteUser !== "root",
    message: "Container should run as non-root user",
    suggestion: "Enable non-root policy and set remoteUser to 'vscode'",
  },
  {
    id: "SEC002",
    name: "Secret hygiene",
    category: "security",
    severity: "error",
    check: (config) => config.enforce.secretsGuard,
    message: "Secret hygiene policy should be enabled",
    suggestion: "Enable secret hygiene to prevent credential leaks",
  },
  {
    id: "SEC003",
    name: "Schema validation",
    category: "security",
    severity: "warning",
    check: (config) => config.enforce.schemaGate,
    message: "Schema validation is disabled",
    suggestion: "Enable schema validation to catch configuration errors",
  },
  {
    id: "SEC004",
    name: "Pre-commit hooks",
    category: "security",
    severity: "warning",
    check: (config) => config.enforce.preCommit,
    message: "Pre-commit hooks are disabled",
    suggestion: "Enable pre-commit hooks for automated code quality checks",
  },

  // Performance rules
  {
    id: "PERF001",
    name: "Named volume for node_modules",
    category: "performance",
    severity: "warning",
    check: (config) => config.namedVolume,
    message: "Named volume not enabled for node_modules",
    suggestion: "Enable named volume to improve rebuild performance",
  },
  {
    id: "PERF002",
    name: "Git protocol v2",
    category: "performance",
    severity: "info",
    check: (config) => config.git.protocolV2,
    message: "Git protocol v2 is disabled",
    suggestion: "Enable protocol v2 for faster git operations",
  },
  {
    id: "PERF003",
    name: "Git commit graph",
    category: "performance",
    severity: "info",
    check: (config) => config.git.commitGraph,
    message: "Git commit graph is disabled",
    suggestion: "Enable commit graph for faster log operations",
  },
  {
    id: "PERF004",
    name: "Shallow clone",
    category: "performance",
    severity: "info",
    check: (config) => config.clone === "shallow" || config.clone === "off",
    message: "Full clone strategy may be slow",
    suggestion: "Use shallow clone for faster repository setup",
  },

  // Best practice rules
  {
    id: "BP001",
    name: "Runtime version pinning",
    category: "best-practice",
    severity: "warning",
    check: (config) => config.enforce.engines,
    message: "Runtime version pinning is disabled",
    suggestion: "Enable runtime pinning for consistent environments",
  },
  {
    id: "BP002",
    name: "Essential tooling",
    category: "best-practice",
    severity: "warning",
    check: (config) => config.toolGroups.some((g) => g.on),
    message: "No essential tooling enabled",
    suggestion: "Enable at least one tool group for basic functionality",
  },
  {
    id: "BP003",
    name: "Core utilities",
    category: "best-practice",
    severity: "warning",
    check: (config) => config.toolGroups.find((g) => g.id === "core")?.on ?? false,
    message: "Core utilities not enabled",
    suggestion: "Enable core utilities for essential command-line tools",
  },
  {
    id: "BP004",
    name: "Port configuration",
    category: "best-practice",
    severity: "info",
    check: (config) => config.ports.length > 0,
    message: "No ports configured",
    suggestion: "Configure ports if your application needs network access",
  },
  {
    id: "BP005",
    name: "VS Code extensions",
    category: "best-practice",
    severity: "info",
    check: (config) => config.extensions.length > 0,
    message: "No VS Code extensions configured",
    suggestion: "Add extensions to enhance the development experience",
  },

  // Maintainability rules
  {
    id: "MAIN001",
    name: "Repository owner",
    category: "maintainability",
    severity: "error",
    check: (config) => config.owner.trim() !== "",
    message: "Repository owner is not set",
    suggestion: "Set the repository owner for proper identification",
  },
  {
    id: "MAIN002",
    name: "Repository name",
    category: "maintainability",
    severity: "error",
    check: (config) => config.repo.trim() !== "",
    message: "Repository name is not set",
    suggestion: "Set the repository name for proper identification",
  },
  {
    id: "MAIN003",
    name: "Image tag",
    category: "maintainability",
    severity: "warning",
    check: (config) => config.tag.trim() !== "",
    message: "Image tag is not set",
    suggestion: "Set an image tag for version tracking",
  },
  {
    id: "MAIN004",
    name: "Git maintenance",
    category: "maintainability",
    severity: "info",
    check: (config) => config.git.maintenance,
    message: "Git maintenance is disabled",
    suggestion: "Enable git maintenance for automatic repository optimization",
  },
];

interface LintResult {
  rule: LintRule;
  passed: boolean;
}

interface LintSummary {
  total: number;
  passed: number;
  failed: number;
  score: number;
  results: LintResult[];
}

export function lintConfig(config: Config): LintSummary {
  const results = lintRules.map((rule) => ({
    rule,
    passed: rule.check(config),
  }));

  const passed = results.filter((r) => r.passed).length;
  const failed = results.length - passed;
  const score = Math.round((passed / results.length) * 100);

  return {
    total: results.length,
    passed,
    failed,
    score,
    results,
  };
}

interface ConfigLinterProps {
  config: Config;
}

export default function ConfigLinter({ config }: ConfigLinterProps) {
  const lint = useMemo(() => lintConfig(config), [config]);

  const getCategoryIcon = (category: LintRule["category"]) => {
    switch (category) {
      case "security":
        return "🔒";
      case "performance":
        return "⚡";
      case "best-practice":
        return "✨";
      case "maintainability":
        return "🔧";
    }
  };

  const getCategoryColor = (category: LintRule["category"]) => {
    switch (category) {
      case "security":
        return "text-coral-400";
      case "performance":
        return "text-ember-400";
      case "best-practice":
        return "text-lagoon-400";
      case "maintainability":
        return "text-skyx-400";
    }
  };

  const getSeverityColor = (severity: LintRule["severity"]) => {
    switch (severity) {
      case "error":
        return "bg-coral-500/20 text-coral-400";
      case "warning":
        return "bg-ember-500/20 text-ember-400";
      case "info":
        return "bg-skyx-500/20 text-skyx-400";
    }
  };

  return (
    <div className="bg-ink-900 border border-ink-700 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-mist-100">Configuration Linting</h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-mist-500">Score:</span>
          <span
            className={`text-2xl font-bold ${
              lint.score >= 80
                ? "text-lagoon-400"
                : lint.score >= 60
                  ? "text-ember-400"
                  : "text-coral-400"
            }`}
          >
            {lint.score}%
          </span>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-ink-800 rounded-lg p-3">
          <div className="text-2xl font-bold text-lagoon-400">{lint.passed}</div>
          <div className="text-xs text-mist-500">Passed</div>
        </div>
        <div className="bg-ink-800 rounded-lg p-3">
          <div className="text-2xl font-bold text-coral-400">{lint.failed}</div>
          <div className="text-xs text-mist-500">Failed</div>
        </div>
        <div className="bg-ink-800 rounded-lg p-3">
          <div className="text-2xl font-bold text-mist-100">{lint.total}</div>
          <div className="text-xs text-mist-500">Total Rules</div>
        </div>
      </div>

      {/* Results */}
      <div className="space-y-3">
        {lint.results.map((result, idx) => (
          <div
            key={idx}
            className={`border rounded-lg p-4 ${
              result.passed ? "border-lagoon-500/30 bg-lagoon-500/5" : "border-coral-500/30 bg-coral-500/5"
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                {result.passed ? (
                  <svg className="w-5 h-5 text-lagoon-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-coral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-sm font-medium text-mist-100">{result.rule.name}</span>
                  <span className={`text-xs px-2 py-0.5 rounded ${getSeverityColor(result.rule.severity)}`}>
                    {result.rule.severity}
                  </span>
                  <span className={`text-xs ${getCategoryColor(result.rule.category)}`}>
                    {getCategoryIcon(result.rule.category)} {result.rule.category}
                  </span>
                  <span className="text-xs text-mist-600 font-mono">{result.rule.id}</span>
                </div>
                <p className="text-sm text-mist-300">{result.rule.message}</p>
                {!result.passed && (
                  <p className="text-xs text-mist-500 mt-1">💡 {result.rule.suggestion}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
