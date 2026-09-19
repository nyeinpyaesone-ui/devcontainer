import { useState } from "react";
import type { Config } from "../lib/generator";
import { DEFAULT_CONFIG } from "../lib/generator";

interface ConfigurationWizardProps {
  onComplete: (config: Config) => void;
  onClose: () => void;
}

export default function ConfigurationWizard({ onComplete, onClose }: ConfigurationWizardProps) {
  const [step, setStep] = useState(0);
  const [config, setConfig] = useState<Config>(DEFAULT_CONFIG);

  const steps = [
    {
      title: "Welcome",
      description: "Let's set up your devcontainer environment",
    },
    {
      title: "Repository",
      description: "Configure your repository details",
    },
    {
      title: "Base Environment",
      description: "Choose your base image and shell",
    },
    {
      title: "Features",
      description: "Select devcontainer features",
    },
    {
      title: "Toolchains",
      description: "Add language toolchains",
    },
    {
      title: "Essential Tools",
      description: "Enable essential tooling groups",
    },
    {
      title: "Policies",
      description: "Configure security policies",
    },
    {
      title: "Complete",
      description: "Your configuration is ready!",
    },
  ];

  const nextStep = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      onComplete(config);
    }
  };

  const prevStep = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">🚀</div>
            <h3 className="text-2xl font-bold text-mist-100 mb-2">
              Welcome to the Configuration Wizard
            </h3>
            <p className="text-mist-400">
              This wizard will guide you through setting up your devcontainer environment step by step.
            </p>
          </div>
        );

      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-mist-100">Repository Configuration</h3>
            <div>
              <label className="block text-sm font-medium text-mist-300 mb-2">
                Repository Owner
              </label>
              <input
                type="text"
                value={config.owner}
                onChange={(e) => setConfig({ ...config, owner: e.target.value })}
                className="w-full px-4 py-2 bg-ink-800 border border-ink-700 rounded-lg text-mist-100 focus:outline-none focus:border-ember-500"
                placeholder="nyeinpyaesone-ui"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-mist-300 mb-2">
                Repository Name
              </label>
              <input
                type="text"
                value={config.repo}
                onChange={(e) => setConfig({ ...config, repo: e.target.value })}
                className="w-full px-4 py-2 bg-ink-800 border border-ink-700 rounded-lg text-mist-100 focus:outline-none focus:border-ember-500"
                placeholder="ERP"
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-mist-100">Base Environment</h3>
            <div>
              <label className="block text-sm font-medium text-mist-300 mb-2">Base Image</label>
              <select
                value={config.base}
                onChange={(e) => setConfig({ ...config, base: e.target.value })}
                className="w-full px-4 py-2 bg-ink-800 border border-ink-700 rounded-lg text-mist-100 focus:outline-none focus:border-ember-500"
              >
                <option value="ubuntu-24.04">Ubuntu 24.04</option>
                <option value="debian-12">Debian 12</option>
                <option value="alpine-3.20">Alpine 3.20</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-mist-300 mb-2">Shell</label>
              <select
                value={config.shell}
                onChange={(e) => setConfig({ ...config, shell: e.target.value as "zsh" | "bash" })}
                className="w-full px-4 py-2 bg-ink-800 border border-ink-700 rounded-lg text-mist-100 focus:outline-none focus:border-ember-500"
              >
                <option value="zsh">Zsh</option>
                <option value="bash">Bash</option>
              </select>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-mist-100">Devcontainer Features</h3>
            <p className="text-sm text-mist-400">
              Select the features you want to enable:
            </p>
            <div className="space-y-2">
              {config.features.map((feature, idx) => (
                <label key={idx} className="flex items-center gap-3 p-3 bg-ink-800 rounded-lg hover:bg-ink-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={feature.on}
                    onChange={(e) => {
                      const newFeatures = [...config.features];
                      newFeatures[idx] = { ...feature, on: e.target.checked };
                      setConfig({ ...config, features: newFeatures });
                    }}
                    className="w-5 h-5 rounded bg-ink-700 border-ink-600 text-ember-500 focus:ring-ember-500"
                  />
                  <div>
                    <div className="text-mist-100 font-medium">{feature.label}</div>
                    <div className="text-xs text-mist-500">{feature.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-mist-100">Language Toolchains</h3>
            <p className="text-sm text-mist-400">
              Select the language toolchains you need:
            </p>
            <div className="space-y-2">
              {config.langs.map((lang, idx) => (
                <label key={idx} className="flex items-center gap-3 p-3 bg-ink-800 rounded-lg hover:bg-ink-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={lang.on}
                    onChange={(e) => {
                      const newLangs = [...config.langs];
                      newLangs[idx] = { ...lang, on: e.target.checked };
                      setConfig({ ...config, langs: newLangs });
                    }}
                    className="w-5 h-5 rounded bg-ink-700 border-ink-600 text-ember-500 focus:ring-ember-500"
                  />
                  <div className="flex-1">
                    <div className="text-mist-100 font-medium">{lang.label}</div>
                    <div className="text-xs text-mist-500">{lang.desc}</div>
                  </div>
                  {lang.on && (
                    <select
                      value={lang.version}
                      onChange={(e) => {
                        const newLangs = [...config.langs];
                        newLangs[idx] = { ...lang, version: e.target.value };
                        setConfig({ ...config, langs: newLangs });
                      }}
                      className="px-3 py-1 bg-ink-700 border border-ink-600 rounded text-sm text-mist-100"
                    >
                      {lang.versions.map((v) => (
                        <option key={v} value={v}>
                          {v}
                        </option>
                      ))}
                    </select>
                  )}
                </label>
              ))}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-mist-100">Essential Tools</h3>
            <p className="text-sm text-mist-400">
              Enable essential tooling groups:
            </p>
            <div className="space-y-2">
              {config.toolGroups.map((group, idx) => (
                <label key={idx} className="flex items-center gap-3 p-3 bg-ink-800 rounded-lg hover:bg-ink-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={group.on}
                    onChange={(e) => {
                      const newGroups = [...config.toolGroups];
                      newGroups[idx] = { ...group, on: e.target.checked };
                      setConfig({ ...config, toolGroups: newGroups });
                    }}
                    className="w-5 h-5 rounded bg-ink-700 border-ink-600 text-ember-500 focus:ring-ember-500"
                  />
                  <div>
                    <div className="text-mist-100 font-medium">{group.label}</div>
                    <div className="text-xs text-mist-500">{group.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-mist-100">Security Policies</h3>
            <p className="text-sm text-mist-400">
              Configure security and enforcement policies:
            </p>
            <div className="space-y-2">
              <label className="flex items-center gap-3 p-3 bg-ink-800 rounded-lg hover:bg-ink-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.enforce.nonRoot}
                  onChange={(e) => setConfig({ ...config, enforce: { ...config.enforce, nonRoot: e.target.checked } })}
                  className="w-5 h-5 rounded bg-ink-700 border-ink-600 text-ember-500 focus:ring-ember-500"
                />
                <div>
                  <div className="text-mist-100 font-medium">Non-root Execution</div>
                  <div className="text-xs text-mist-500">Run container as non-root user</div>
                </div>
              </label>
              <label className="flex items-center gap-3 p-3 bg-ink-800 rounded-lg hover:bg-ink-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.enforce.secretsGuard}
                  onChange={(e) => setConfig({ ...config, enforce: { ...config.enforce, secretsGuard: e.target.checked } })}
                  className="w-5 h-5 rounded bg-ink-700 border-ink-600 text-ember-500 focus:ring-ember-500"
                />
                <div>
                  <div className="text-mist-100 font-medium">Secret Hygiene</div>
                  <div className="text-xs text-mist-500">Prevent secrets in configuration</div>
                </div>
              </label>
              <label className="flex items-center gap-3 p-3 bg-ink-800 rounded-lg hover:bg-ink-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.enforce.preCommit}
                  onChange={(e) => setConfig({ ...config, enforce: { ...config.enforce, preCommit: e.target.checked } })}
                  className="w-5 h-5 rounded bg-ink-700 border-ink-600 text-ember-500 focus:ring-ember-500"
                />
                <div>
                  <div className="text-mist-100 font-medium">Pre-commit Hooks</div>
                  <div className="text-xs text-mist-500">Validate changes before commit</div>
                </div>
              </label>
            </div>
          </div>
        );

      case 7:
        return (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">✅</div>
            <h3 className="text-2xl font-bold text-mist-100 mb-2">Configuration Complete!</h3>
            <p className="text-mist-400 mb-6">
              Your devcontainer environment is ready to generate.
            </p>
            <div className="bg-ink-800 rounded-lg p-4 text-left">
              <h4 className="text-sm font-semibold text-mist-300 mb-2">Summary:</h4>
              <ul className="space-y-1 text-sm text-mist-400">
                <li>• Repository: {config.owner}/{config.repo}</li>
                <li>• Base: {config.base}</li>
                <li>• Features: {config.features.filter((f) => f.on).length} enabled</li>
                <li>• Toolchains: {config.langs.filter((l) => l.on).length} configured</li>
                <li>• Tools: {config.toolGroups.filter((g) => g.on).length} groups</li>
                <li>• Policies: {Object.values(config.enforce).filter(Boolean).length}/5 enforced</li>
              </ul>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-ink-900 border border-ink-700 rounded-xl shadow-2xl w-[90vw] max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-ink-700">
          <div>
            <h2 className="text-xl font-bold text-mist-100">Configuration Wizard</h2>
            <p className="text-sm text-mist-500">Step {step + 1} of {steps.length}</p>
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

        {/* Progress bar */}
        <div className="h-1 bg-ink-800">
          <div
            className="h-full bg-ember-500 transition-all duration-300"
            style={{ width: `${((step + 1) / steps.length) * 100}%` }}
          ></div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">{renderStep()}</div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-ink-700">
          <button
            onClick={prevStep}
            disabled={step === 0}
            className="px-4 py-2 bg-ink-800 hover:bg-ink-700 disabled:opacity-50 disabled:cursor-not-allowed text-mist-100 rounded-lg transition-colors"
          >
            Previous
          </button>
          <button
            onClick={nextStep}
            className="px-6 py-2 bg-ember-500 hover:bg-ember-600 text-ink-950 font-semibold rounded-lg transition-colors"
          >
            {step === steps.length - 1 ? "Complete" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
}
