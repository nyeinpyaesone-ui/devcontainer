import React, { useEffect, useState } from "react";
import { AnalyticsEngine, type ConfigurationMetrics, type Insight, type TrendData } from "../lib/analytics-engine";
import type { Config } from "../lib/generator";

interface AnalyticsDashboardProps {
  config: Config;
  isOpen?: boolean;
  onClose?: () => void;
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ config, isOpen, onClose }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const showModal = isOpen ?? isModalOpen;
  const handleClose = onClose ?? (() => setIsModalOpen(false));
  const [engine] = useState(() => new AnalyticsEngine());
  const [metrics, setMetrics] = useState<ConfigurationMetrics | null>(null);
  const [trends, setTrends] = useState<TrendData[]>([]);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [snapshotCount, setSnapshotCount] = useState(0);
  const [activeTab, setActiveTab] = useState<"overview" | "trends" | "insights">("overview");

  useEffect(() => {
    engine.recordSnapshot(config);
    setMetrics(engine.getCurrentMetrics());
    setTrends(engine.getTrends());
    setInsights(engine.generateInsights());
    setSnapshotCount(engine.getSnapshotCount());
  }, [config, engine]);

  const handleExport = () => {
    const data = engine.exportData();
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `analytics-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const data = e.target?.result as string;
          engine.importData(data);
          setMetrics(engine.getCurrentMetrics());
          setTrends(engine.getTrends());
          setInsights(engine.generateInsights());
          setSnapshotCount(engine.getSnapshotCount());
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const handleClear = () => {
    if (window.confirm("Are you sure you want to clear all analytics history?")) {
      engine.clearHistory();
      setMetrics(engine.getCurrentMetrics());
      setTrends(engine.getTrends());
      setInsights(engine.generateInsights());
      setSnapshotCount(engine.getSnapshotCount());
    }
  };

  const renderMetricCard = (label: string, value: number, color: string) => {
    const radius = 40;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (value / 100) * circumference;

    return (
      <div className="bg-gray-800 rounded-lg p-4 flex flex-col items-center">
        <svg width="100" height="100" className="transform -rotate-90">
          <circle
            cx="50"
            cy="50"
            r={radius}
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            className="text-gray-700"
          />
          <circle
            cx="50"
            cy="50"
            r={radius}
            stroke={color}
            strokeWidth="8"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-500"
          />
        </svg>
        <div className="mt-2 text-center">
          <div className="text-2xl font-bold" style={{ color }}>
            {value}
          </div>
          <div className="text-sm text-gray-400">{label}</div>
        </div>
      </div>
    );
  };

  const renderTrendChart = () => {
    if (trends.length === 0) {
      return (
        <div className="text-center text-gray-400 py-12">
          Not enough data to show trends. Make more configuration changes to see trends.
        </div>
      );
    }

    const width = 600;
    const height = 300;
    const padding = 40;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    return (
      <div className="overflow-x-auto">
        <svg width={width} height={height} className="mx-auto">
          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map((value) => {
            const y = padding + chartHeight - (value / 100) * chartHeight;
            return (
              <g key={value}>
                <line
                  x1={padding}
                  y1={y}
                  x2={padding + chartWidth}
                  y2={y}
                  stroke="currentColor"
                  strokeWidth="1"
                  className="text-gray-700"
                />
                <text x={padding - 5} y={y + 5} textAnchor="end" className="text-xs text-gray-400">
                  {value}
                </text>
              </g>
            );
          })}

          {/* Trend lines */}
          {trends.map((trend, trendIndex) => {
            const points = trend.values.map((value, i) => {
              const x = padding + (i / (trend.values.length - 1)) * chartWidth;
              const y = padding + chartHeight - (value / 100) * chartHeight;
              return `${x},${y}`;
            });

            return (
              <g key={trendIndex}>
                <polyline
                  points={points.join(" ")}
                  fill="none"
                  stroke={trend.color}
                  strokeWidth="2"
                  className="transition-all duration-300"
                />
                {trend.values.map((value, i) => {
                  const x = padding + (i / (trend.values.length - 1)) * chartWidth;
                  const y = padding + chartHeight - (value / 100) * chartHeight;
                  return (
                    <circle
                      key={i}
                      cx={x}
                      cy={y}
                      r="3"
                      fill={trend.color}
                      className="transition-all duration-300"
                    />
                  );
                })}
              </g>
            );
          })}

          {/* Legend */}
          {trends.map((trend, i) => (
            <g key={i} transform={`translate(${padding + i * 100}, ${height - 10})`}>
              <rect width="12" height="12" fill={trend.color} />
              <text x="16" y="10" className="text-xs text-gray-400">
                {trend.label}
              </text>
            </g>
          ))}
        </svg>
      </div>
    );
  };

  const renderInsight = (insight: Insight, index: number) => {
    const icons = {
      improvement: "💡",
      warning: "⚠️",
      success: "✅",
      prediction: "🔮",
    };

    const colors = {
      high: "border-red-500 bg-red-500/10",
      medium: "border-yellow-500 bg-yellow-500/10",
      low: "border-blue-500 bg-blue-500/10",
    };

    return (
      <div key={index} className={`border-l-4 p-4 rounded ${colors[insight.impact]}`}>
        <div className="flex items-start gap-3">
          <span className="text-2xl">{icons[insight.type]}</span>
          <div className="flex-1">
            <h4 className="font-semibold text-white mb-1">{insight.title}</h4>
            <p className="text-sm text-gray-300 mb-2">{insight.description}</p>
            <div className="flex items-center gap-2 text-xs">
              <span className="px-2 py-1 bg-gray-700 rounded">{insight.metric}</span>
              {insight.change !== 0 && (
                <span className={insight.change > 0 ? "text-green-400" : "text-red-400"}>
                  {insight.change > 0 ? "+" : ""}
                  {insight.change.toFixed(1)}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Inline mode - show summary card
  if (isOpen === undefined && metrics) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            📊 Configuration Analytics
          </h3>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            View Full Dashboard
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {renderMetricCard("Overall", metrics.overall, "#8b5cf6")}
          {renderMetricCard("Security", metrics.security, "#ef4444")}
          {renderMetricCard("Performance", metrics.performance, "#22c55e")}
        </div>
        <div className="mt-4 text-sm text-gray-400">
          {snapshotCount} snapshots recorded • Click "View Full Dashboard" for detailed analytics
        </div>
      </div>
    );
  }

  // Modal mode - show full dashboard
  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-lg shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                📊 Advanced Analytics Dashboard
              </h2>
              <p className="text-purple-100 mt-1">
                Track configuration health, trends, and get AI-powered insights
              </p>
            </div>
            <button
              onClick={handleClose}
              className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mt-4">
            {(["overview", "trends", "insights"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === tab
                    ? "bg-white text-purple-600"
                    : "bg-white/20 text-white hover:bg-white/30"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === "overview" && metrics && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">Current Configuration Metrics</h3>
                <div className="flex gap-2">
                  <button
                    onClick={handleExport}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    Export Data
                  </button>
                  <button
                    onClick={handleImport}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                  >
                    Import Data
                  </button>
                  <button
                    onClick={handleClear}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                  >
                    Clear History
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {renderMetricCard("Complexity", metrics.complexity, "#f97316")}
                {renderMetricCard("Security", metrics.security, "#ef4444")}
                {renderMetricCard("Performance", metrics.performance, "#22c55e")}
                {renderMetricCard("Maintainability", metrics.maintainability, "#3b82f6")}
                {renderMetricCard("Cost Efficiency", metrics.cost, "#eab308")}
                {renderMetricCard("Overall", metrics.overall, "#8b5cf6")}
              </div>

              <div className="bg-gray-800 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-white mb-2">Summary</h4>
                <p className="text-gray-300">
                  Total snapshots recorded: <span className="font-bold text-white">{snapshotCount}</span>
                </p>
                <p className="text-gray-300 mt-2">
                  Your configuration is {metrics.overall >= 70 ? "excellent" : metrics.overall >= 50 ? "good" : "needs improvement"}.
                  {metrics.security < 60 && " Focus on improving security by enabling more policies."}
                  {metrics.performance < 50 && " Consider optimizing performance by reducing complexity."}
                </p>
              </div>
            </div>
          )}

          {activeTab === "trends" && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-white">Configuration Trends</h3>
              <div className="bg-gray-800 rounded-lg p-6">
                {renderTrendChart()}
              </div>
              <div className="bg-gray-800 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-white mb-2">About Trends</h4>
                <p className="text-gray-300">
                  This chart shows how your configuration metrics have changed over time.
                  Each point represents a snapshot of your configuration. More snapshots
                  provide better trend visibility.
                </p>
              </div>
            </div>
          )}

          {activeTab === "insights" && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-white">AI-Powered Insights</h3>
              {insights.length === 0 ? (
                <div className="text-center text-gray-400 py-12">
                  No insights yet. Make configuration changes to generate insights.
                </div>
              ) : (
                <div className="space-y-4">
                  {insights.map((insight, index) => renderInsight(insight, index))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-800 p-4 border-t border-gray-700">
          <div className="flex items-center justify-between text-sm text-gray-400">
            <span>Analytics Engine v1.0</span>
            <span>{snapshotCount} snapshots recorded</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
