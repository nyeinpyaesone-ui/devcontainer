import { estimateCosts, formatSize, formatTime } from "../lib/cost-estimation";
import type { Config } from "../lib/generator";

interface CostEstimationProps {
  config: Config;
}

export default function CostEstimation({ config }: CostEstimationProps) {
  const costs = estimateCosts(config);

  const metrics = [
    {
      label: "Image Size",
      value: formatSize(costs.imageSize),
      icon: "📦",
      color: "text-blue-400",
    },
    {
      label: "Build Time",
      value: formatTime(costs.buildTime),
      icon: "⏱️",
      color: "text-purple-400",
    },
    {
      label: "Memory",
      value: `${costs.memoryUsage} MB`,
      icon: "💾",
      color: "text-green-400",
    },
    {
      label: "CPU",
      value: `${costs.cpuUsage} cores`,
      icon: "⚡",
      color: "text-yellow-400",
    },
    {
      label: "Disk",
      value: formatSize(costs.diskUsage),
      icon: "💿",
      color: "text-orange-400",
    },
    {
      label: "Monthly Cost",
      value: `$${costs.monthlyCost}`,
      icon: "💰",
      color: "text-emerald-400",
    },
  ];

  return (
    <div className="bg-ink-900 border border-ink-700 rounded-lg p-6">
      <h3 className="text-lg font-bold text-mist-100 mb-4">Cost & Resource Estimation</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {metrics.map((metric) => (
          <div key={metric.label} className="bg-ink-800 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">{metric.icon}</span>
              <span className="text-sm text-mist-500">{metric.label}</span>
            </div>
            <div className={`text-2xl font-bold ${metric.color}`}>{metric.value}</div>
          </div>
        ))}
      </div>
      <div className="mt-4 p-4 bg-ink-800 rounded-lg">
        <div className="text-sm text-mist-500 mb-2">Cost Breakdown</div>
        <div className="text-xs text-mist-400 space-y-1">
          <div className="flex justify-between">
            <span>Base image + features:</span>
            <span className="text-mist-300">{formatSize(costs.imageSize * 0.6)}</span>
          </div>
          <div className="flex justify-between">
            <span>Toolchains:</span>
            <span className="text-mist-300">{formatSize(costs.imageSize * 0.3)}</span>
          </div>
          <div className="flex justify-between">
            <span>Packages & dependencies:</span>
            <span className="text-mist-300">{formatSize(costs.imageSize * 0.1)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
