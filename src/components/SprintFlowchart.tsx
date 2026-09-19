import type { Config } from "../lib/generator";

interface SprintFlowchartProps {
  config: Config;
}

export default function SprintFlowchart({ config }: SprintFlowchartProps) {
  const steps = [
    {
      id: 1,
      name: "Initialize",
      description: "Set up repository structure",
      status: "complete",
      icon: "🚀",
    },
    {
      id: 2,
      name: "Configure",
      description: "Define devcontainer settings",
      status: "complete",
      icon: "⚙️",
    },
    {
      id: 3,
      name: "Install",
      description: "Set up toolchains and packages",
      status: "complete",
      icon: "📦",
    },
    {
      id: 4,
      name: "Validate",
      description: "Run security and lint checks",
      status: config.enforce.nonRoot ? "complete" : "warning",
      icon: "✅",
    },
    {
      id: 5,
      name: "Test",
      description: "Verify environment works",
      status: config.smokeTest ? "complete" : "pending",
      icon: "🧪",
    },
    {
      id: 6,
      name: "Document",
      description: "Generate documentation",
      status: "complete",
      icon: "📚",
    },
    {
      id: 7,
      name: "Deploy",
      description: "Ready for production",
      status: config.enforce.nonRoot && config.enforce.secretsGuard ? "complete" : "pending",
      icon: "🎯",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "complete":
        return "bg-lagoon-500/20 border-lagoon-500 text-lagoon-400";
      case "warning":
        return "bg-ember-500/20 border-ember-500 text-ember-400";
      case "pending":
        return "bg-ink-800 border-ink-700 text-mist-500";
      default:
        return "bg-ink-800 border-ink-700 text-mist-500";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "complete":
        return "✓";
      case "warning":
        return "⚠";
      case "pending":
        return "○";
      default:
        return "○";
    }
  };

  return (
    <div className="bg-ink-900 border border-ink-700 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-mist-100">Sprint Workflow</h3>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-lagoon-500"></div>
            <span className="text-mist-400">Complete</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-ember-500"></div>
            <span className="text-mist-400">Warning</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-ink-700"></div>
            <span className="text-mist-400">Pending</span>
          </div>
        </div>
      </div>

      <div className="relative">
        {/* Connection lines */}
        <div className="absolute left-8 top-8 bottom-8 w-0.5 bg-ink-700"></div>

        {/* Steps */}
        <div className="space-y-6">
          {steps.map((step, idx) => (
            <div key={step.id} className="relative flex items-start gap-4">
              {/* Step number circle */}
              <div
                className={`relative z-10 flex items-center justify-center w-16 h-16 rounded-full border-2 ${getStatusColor(
                  step.status
                )}`}
              >
                <div className="text-center">
                  <div className="text-2xl mb-0.5">{step.icon}</div>
                  <div className="text-xs font-bold">{step.id}</div>
                </div>
              </div>

              {/* Step content */}
              <div className="flex-1 pt-2">
                <div className="flex items-center gap-3 mb-1">
                  <h4 className="text-base font-semibold text-mist-100">{step.name}</h4>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(
                      step.status
                    )}`}
                  >
                    {getStatusIcon(step.status)} {step.status}
                  </span>
                </div>
                <p className="text-sm text-mist-400">{step.description}</p>
              </div>

              {/* Connector arrow */}
              {idx < steps.length - 1 && (
                <div className="absolute left-8 top-16 w-0.5 h-6 bg-ink-700"></div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="mt-6 pt-6 border-t border-ink-700">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-lagoon-400">
              {steps.filter((s) => s.status === "complete").length}
            </div>
            <div className="text-xs text-mist-500 mt-1">Complete</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-ember-400">
              {steps.filter((s) => s.status === "warning").length}
            </div>
            <div className="text-xs text-mist-500 mt-1">Warnings</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-mist-500">
              {steps.filter((s) => s.status === "pending").length}
            </div>
            <div className="text-xs text-mist-500 mt-1">Pending</div>
          </div>
        </div>
      </div>
    </div>
  );
}
