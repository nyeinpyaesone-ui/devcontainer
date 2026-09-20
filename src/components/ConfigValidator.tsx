import { useMemo } from "react";
import type { Config } from "../lib/generator";

interface ValidationIssue {
  type: "error" | "warning" | "info";
  field: string;
  message: string;
  suggestion?: string;
}

interface ValidationResult {
  isValid: boolean;
  issues: ValidationIssue[];
  errorCount: number;
  warningCount: number;
  infoCount: number;
}

export function validateConfig(config: Config): ValidationResult {
  const issues: ValidationIssue[] = [];

  // Validate owner
  if (!config.owner || config.owner.trim() === "") {
    issues.push({
      type: "error",
      field: "owner",
      message: "Repository owner is required",
      suggestion: "Enter your GitHub username or organization name",
    });
  } else if (!/^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/.test(config.owner)) {
    issues.push({
      type: "error",
      field: "owner",
      message: "Invalid owner format",
      suggestion: "Owner must be 1-39 characters, alphanumeric or hyphens",
    });
  }

  // Validate repo
  if (!config.repo || config.repo.trim() === "") {
    issues.push({
      type: "error",
      field: "repo",
      message: "Repository name is required",
      suggestion: "Enter your repository name",
    });
  } else if (!/^[a-zA-Z0-9._-]+$/.test(config.repo)) {
    issues.push({
      type: "error",
      field: "repo",
      message: "Invalid repository name format",
      suggestion: "Repository name can only contain letters, numbers, dots, hyphens, and underscores",
    });
  }

  // Validate tag
  if (!config.tag || config.tag.trim() === "") {
    issues.push({
      type: "warning",
      field: "tag",
      message: "Image tag is empty",
      suggestion: "Consider using 'latest' or a specific version tag",
    });
  }

  // Validate remoteUser
  if (config.remoteUser === "root" && config.enforce.nonRoot) {
    issues.push({
      type: "error",
      field: "remoteUser",
      message: "Root user conflicts with non-root policy",
      suggestion: "Change remoteUser to 'vscode' or disable the non-root policy",
    });
  }

  // Validate ports
  config.ports.forEach((port, idx) => {
    const portNum = parseInt(port, 10);
    if (isNaN(portNum) || portNum < 1 || portNum > 65535) {
      issues.push({
        type: "error",
        field: `ports[${idx}]`,
        message: `Invalid port number: ${port}`,
        suggestion: "Port must be a number between 1 and 65535",
      });
    }
  });

  // Check for duplicate ports
  const portSet = new Set<string>();
  config.ports.forEach((port, idx) => {
    if (portSet.has(port)) {
      issues.push({
        type: "warning",
        field: `ports[${idx}]`,
        message: `Duplicate port: ${port}`,
        suggestion: "Remove duplicate port entries",
      });
    }
    portSet.add(port);
  });

  // Validate extensions
  config.extensions.forEach((ext, idx) => {
    if (!ext.includes(".")) {
      issues.push({
        type: "warning",
        field: `extensions[${idx}]`,
        message: `Extension format may be incorrect: ${ext}`,
        suggestion: "Extensions should be in format 'publisher.extension-name'",
      });
    }
  });

  // Validate features
  const activeFeatures = config.features.filter((f) => f.on);
  if (activeFeatures.length === 0) {
    issues.push({
      type: "info",
      field: "features",
      message: "No features enabled",
      suggestion: "Consider enabling at least one feature for enhanced functionality",
    });
  }

  // Validate toolchains
  const activeToolchains = config.langs.filter((l) => l.on);
  if (activeToolchains.length === 0) {
    issues.push({
      type: "info",
      field: "langs",
      message: "No language toolchains configured",
      suggestion: "Add language toolchains if your project requires them",
    });
  }

  // Validate tool groups
  const activeToolGroups = config.toolGroups.filter((g) => g.on);
  if (activeToolGroups.length === 0) {
    issues.push({
      type: "warning",
      field: "toolGroups",
      message: "No essential tooling enabled",
      suggestion: "Enable at least the 'Core utilities' tool group",
    });
  }

  // Validate apt packages
  if (config.aptExtra.trim() === "") {
    issues.push({
      type: "info",
      field: "aptExtra",
      message: "No additional apt packages specified",
      suggestion: "Add custom packages if needed for your project",
    });
  }

  // Validate policies
  const enabledPolicies = Object.values(config.enforce).filter(Boolean).length;
  if (enabledPolicies === 0) {
    issues.push({
      type: "warning",
      field: "enforce",
      message: "No policies enforced",
      suggestion: "Enable at least basic policies for security and consistency",
    });
  } else if (enabledPolicies < 3) {
    issues.push({
      type: "info",
      field: "enforce",
      message: "Only basic policies enforced",
      suggestion: "Consider enabling more policies for better security",
    });
  }

  // Validate clone strategy
  if (config.clone === "off") {
    issues.push({
      type: "info",
      field: "clone",
      message: "Repository cloning is disabled",
      suggestion: "Enable cloning if you want automatic repository setup",
    });
  }

  // Validate git tuning
  const enabledGitTuning = Object.values(config.git).filter(Boolean).length;
  if (enabledGitTuning === 0) {
    issues.push({
      type: "info",
      field: "git",
      message: "No git optimizations enabled",
      suggestion: "Enable git tuning for better performance",
    });
  }

  const errorCount = issues.filter((i) => i.type === "error").length;
  const warningCount = issues.filter((i) => i.type === "warning").length;
  const infoCount = issues.filter((i) => i.type === "info").length;

  return {
    isValid: errorCount === 0,
    issues,
    errorCount,
    warningCount,
    infoCount,
  };
}

interface ConfigValidatorProps {
  config: Config;
}

export default function ConfigValidator({ config }: ConfigValidatorProps) {
  const validation = useMemo(() => validateConfig(config), [config]);

  const getIcon = (type: ValidationIssue["type"]) => {
    switch (type) {
      case "error":
        return (
          <svg className="w-5 h-5 text-coral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case "warning":
        return (
          <svg className="w-5 h-5 text-ember-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
      case "info":
        return (
          <svg className="w-5 h-5 text-skyx-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const getBorderColor = (type: ValidationIssue["type"]) => {
    switch (type) {
      case "error":
        return "border-coral-500/30 bg-coral-500/5";
      case "warning":
        return "border-ember-500/30 bg-ember-500/5";
      case "info":
        return "border-skyx-500/30 bg-skyx-500/5";
    }
  };

  return (
    <div className="bg-ink-900 border border-ink-700 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-mist-100">Configuration Validation</h3>
        <div
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            validation.isValid
              ? "bg-lagoon-500/20 text-lagoon-400"
              : "bg-coral-500/20 text-coral-400"
          }`}
        >
          {validation.isValid ? "✓ Valid" : "✗ Invalid"}
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-ink-800 rounded-lg p-3">
          <div className="text-2xl font-bold text-coral-400">{validation.errorCount}</div>
          <div className="text-xs text-mist-500">Errors</div>
        </div>
        <div className="bg-ink-800 rounded-lg p-3">
          <div className="text-2xl font-bold text-ember-400">{validation.warningCount}</div>
          <div className="text-xs text-mist-500">Warnings</div>
        </div>
        <div className="bg-ink-800 rounded-lg p-3">
          <div className="text-2xl font-bold text-skyx-400">{validation.infoCount}</div>
          <div className="text-xs text-mist-500">Info</div>
        </div>
      </div>

      {/* Issues List */}
      {validation.issues.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-lagoon-500/20 flex items-center justify-center">
            <svg className="w-8 h-8 text-lagoon-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-mist-300">All checks passed!</p>
          <p className="text-sm text-mist-500 mt-1">Your configuration is valid and ready to use.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {validation.issues.map((issue, idx) => (
            <div key={idx} className={`border rounded-lg p-4 ${getBorderColor(issue.type)}`}>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">{getIcon(issue.type)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-mist-100">{issue.field}</span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded ${
                        issue.type === "error"
                          ? "bg-coral-500/20 text-coral-400"
                          : issue.type === "warning"
                            ? "bg-ember-500/20 text-ember-400"
                            : "bg-skyx-500/20 text-skyx-400"
                      }`}
                    >
                      {issue.type}
                    </span>
                  </div>
                  <p className="text-sm text-mist-300">{issue.message}</p>
                  {issue.suggestion && (
                    <p className="text-xs text-mist-500 mt-1">💡 {issue.suggestion}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
