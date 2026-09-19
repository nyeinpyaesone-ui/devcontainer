import type { Config } from "../lib/generator";
import { useAnalytics } from "../hooks/useAnalytics";

interface AnalyticsDashboardProps {
  config: Config;
}

export default function AnalyticsDashboard({ config }: AnalyticsDashboardProps) {
  const analytics = useAnalytics(config);

  return (
    <div className="space-y-6">
      {/* Complexity Score */}
      <div className="bg-ink-900 border border-ink-700 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-mist-100">Configuration Complexity</h3>
          <div
            className={`text-3xl font-bold ${
              analytics.complexityScore < 40
                ? "text-lagoon-400"
                : analytics.complexityScore < 70
                  ? "text-ember-400"
                  : "text-coral-400"
            }`}
          >
            {analytics.complexityScore}
          </div>
        </div>
        <div className="w-full bg-ink-800 rounded-full h-3 overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${
              analytics.complexityScore < 40
                ? "bg-lagoon-400"
                : analytics.complexityScore < 70
                  ? "bg-ember-400"
                  : "bg-coral-400"
            }`}
            style={{ width: `${analytics.complexityScore}%` }}
          />
        </div>
        <p className="text-sm text-mist-500 mt-2">
          {analytics.complexityScore < 40
            ? "Simple configuration - easy to maintain"
            : analytics.complexityScore < 70
              ? "Moderate complexity - well-balanced"
              : "High complexity - consider simplifying"}
        </p>
      </div>

      {/* Feature Usage */}
      <div className="bg-ink-900 border border-ink-700 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-mist-100 mb-4">Active Features</h3>
        {analytics.featureUsage.length === 0 ? (
          <p className="text-sm text-mist-500">No features enabled</p>
        ) : (
          <div className="space-y-2">
            {analytics.featureUsage.map((feature, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <span className="text-sm text-mist-300">{feature.name}</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-ink-800 rounded-full h-2 overflow-hidden">
                    <div className="h-full bg-lagoon-400" style={{ width: "100%" }} />
                  </div>
                  <span className="text-xs text-mist-500 w-8 text-right">Active</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Toolchain Usage */}
      <div className="bg-ink-900 border border-ink-700 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-mist-100 mb-4">Language Toolchains</h3>
        {analytics.toolchainUsage.length === 0 ? (
          <p className="text-sm text-mist-500">No toolchains configured</p>
        ) : (
          <div className="space-y-2">
            {analytics.toolchainUsage.map((toolchain, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <span className="text-sm text-mist-300">{toolchain.name}</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-ink-800 rounded-full h-2 overflow-hidden">
                    <div className="h-full bg-ember-400" style={{ width: "100%" }} />
                  </div>
                  <span className="text-xs text-mist-500 w-8 text-right">Active</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Policy Compliance */}
      <div className="bg-ink-900 border border-ink-700 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-mist-100 mb-4">Policy Compliance</h3>
        <div className="space-y-2">
          {analytics.policyCompliance.map((policy, idx) => (
            <div key={idx} className="flex items-center justify-between">
              <span className="text-sm text-mist-300">{policy.name}</span>
              <div
                className={`px-2 py-1 rounded text-xs font-medium ${
                  policy.enabled
                    ? "bg-lagoon-500/20 text-lagoon-400"
                    : "bg-coral-500/20 text-coral-400"
                }`}
              >
                {policy.enabled ? "Enabled" : "Disabled"}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t border-ink-700">
          <div className="flex items-center justify-between">
            <span className="text-sm text-mist-400">Compliance Rate</span>
            <span className="text-lg font-bold text-mist-100">
              {analytics.policyCompliance.filter((p) => p.enabled).length}/
              {analytics.policyCompliance.length}
            </span>
          </div>
        </div>
      </div>

      {/* Port Distribution */}
      <div className="bg-ink-900 border border-ink-700 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-mist-100 mb-4">Port Distribution</h3>
        {analytics.portDistribution.length === 0 ? (
          <p className="text-sm text-mist-500">No ports configured</p>
        ) : (
          <div className="space-y-2">
            {analytics.portDistribution.map((port, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-mono text-ember-400">:{port.port}</span>
                  <span className="text-sm text-mist-300">{port.service}</span>
                </div>
                <div className="w-2 h-2 rounded-full bg-skyx-400" />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recommendations */}
      <div className="bg-ink-900 border border-ink-700 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-mist-100 mb-4">Recommendations</h3>
        <div className="space-y-3">
          {analytics.recommendations.map((rec, idx) => (
            <div key={idx} className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-ember-500/20 flex items-center justify-center">
                <span className="text-xs text-ember-400">{idx + 1}</span>
              </div>
              <p className="text-sm text-mist-300 leading-relaxed">{rec}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
