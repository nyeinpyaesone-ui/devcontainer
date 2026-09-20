import type { Config } from "./generator";

export interface AnalyticsSnapshot {
  timestamp: number;
  config: Config;
  metrics: ConfigurationMetrics;
}

export interface ConfigurationMetrics {
  complexity: number;
  security: number;
  performance: number;
  maintainability: number;
  cost: number;
  overall: number;
}

export interface TrendData {
  label: string;
  values: number[];
  color: string;
}

export interface Insight {
  type: "improvement" | "warning" | "success" | "prediction";
  title: string;
  description: string;
  impact: "high" | "medium" | "low";
  metric: keyof ConfigurationMetrics;
  change: number;
}

export class AnalyticsEngine {
  private snapshots: AnalyticsSnapshot[] = [];
  private readonly MAX_SNAPSHOTS = 100;

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem("devcontainer-analytics");
    if (stored) {
      try {
        this.snapshots = JSON.parse(stored);
      } catch (e) {
        console.error("Failed to load analytics:", e);
      }
    }
  }

  private saveToStorage() {
    if (typeof window === "undefined") return;
    localStorage.setItem("devcontainer-analytics", JSON.stringify(this.snapshots));
  }

  recordSnapshot(config: Config) {
    const metrics = this.calculateMetrics(config);
    const snapshot: AnalyticsSnapshot = {
      timestamp: Date.now(),
      config,
      metrics,
    };

    this.snapshots.push(snapshot);
    if (this.snapshots.length > this.MAX_SNAPSHOTS) {
      this.snapshots.shift();
    }

    this.saveToStorage();
  }

  calculateMetrics(config: Config): ConfigurationMetrics {
    // Complexity: Based on number of enabled features, toolchains, tools
    const featureCount = config.features.filter((f) => f.on).length;
    const toolchainCount = config.langs.filter((l) => l.on).length;
    const toolCount = config.toolGroups.filter((g) => g.on).length;
    const portCount = config.ports.length;
    const extensionCount = config.extensions.length;

    const complexity = Math.min(
      100,
      (featureCount * 8 + toolchainCount * 12 + toolCount * 6 + portCount * 3 + extensionCount * 4)
    );

    // Security: Based on enabled policies
    const policyCount = Object.values(config.enforce).filter(Boolean).length;
    const security = (policyCount / 5) * 100;

    // Performance: Inverse of complexity, adjusted for optimizations
    const hasNamedVolume = config.namedVolume;
    const hasGitOptimizations = Object.values(config.git).filter(Boolean).length;
    const performanceBase = 100 - complexity * 0.5;
    const performanceBonus = (hasNamedVolume ? 10 : 0) + (hasGitOptimizations * 2);
    const performance = Math.max(0, Math.min(100, performanceBase + performanceBonus));

    // Maintainability: Based on documentation, policies, and organization
    const hasPolicies = policyCount >= 3;
    const hasDocumentation = config.extensions.some((e) => e.includes("prettier") || e.includes("eslint"));
    const maintainability = (hasPolicies ? 40 : 0) + (hasDocumentation ? 30 : 0) + (toolCount >= 2 ? 30 : 0);

    // Cost: Based on resource usage (inverse - lower is better, so we invert for display)
    const resourceUsage = featureCount * 10 + toolchainCount * 15 + portCount * 5;
    const cost = Math.max(0, 100 - resourceUsage);

    // Overall: Weighted average
    const overall = (
      complexity * 0.15 +
      security * 0.30 +
      performance * 0.25 +
      maintainability * 0.20 +
      cost * 0.10
    );

    return {
      complexity: Math.round(complexity),
      security: Math.round(security),
      performance: Math.round(performance),
      maintainability: Math.round(maintainability),
      cost: Math.round(cost),
      overall: Math.round(overall),
    };
  }

  getTrends(): TrendData[] {
    if (this.snapshots.length < 2) return [];

    const last20 = this.snapshots.slice(-20);
    const metrics: (keyof ConfigurationMetrics)[] = [
      "complexity",
      "security",
      "performance",
      "maintainability",
      "cost",
      "overall",
    ];

    const colors = {
      complexity: "#f97316",
      security: "#ef4444",
      performance: "#22c55e",
      maintainability: "#3b82f6",
      cost: "#eab308",
      overall: "#8b5cf6",
    };

    return metrics.map((metric) => ({
      label: metric.charAt(0).toUpperCase() + metric.slice(1),
      values: last20.map((s) => s.metrics[metric]),
      color: colors[metric],
    }));
  }

  generateInsights(): Insight[] {
    if (this.snapshots.length < 2) return [];

    const current = this.snapshots[this.snapshots.length - 1];
    const previous = this.snapshots[this.snapshots.length - 2];
    const insights: Insight[] = [];

    // Compare metrics
    const metrics: (keyof ConfigurationMetrics)[] = [
      "complexity",
      "security",
      "performance",
      "maintainability",
      "cost",
      "overall",
    ];

    for (const metric of metrics) {
      const change = current.metrics[metric] - previous.metrics[metric];
      const percentChange = (change / previous.metrics[metric]) * 100;

      if (Math.abs(percentChange) > 10) {
        if (change > 0) {
          insights.push({
            type: "success",
            title: `${metric.charAt(0).toUpperCase() + metric.slice(1)} Improved`,
            description: `Your ${metric} score increased by ${Math.abs(Math.round(percentChange))}%`,
            impact: Math.abs(percentChange) > 20 ? "high" : "medium",
            metric,
            change,
          });
        } else {
          insights.push({
            type: "warning",
            title: `${metric.charAt(0).toUpperCase() + metric.slice(1)} Declined`,
            description: `Your ${metric} score decreased by ${Math.abs(Math.round(percentChange))}%`,
            impact: Math.abs(percentChange) > 20 ? "high" : "medium",
            metric,
            change,
          });
        }
      }
    }

    // Generate improvement suggestions
    if (current.metrics.security < 60) {
      insights.push({
        type: "improvement",
        title: "Enhance Security Posture",
        description: "Enable more security policies to improve your security score",
        impact: "high",
        metric: "security",
        change: 0,
      });
    }

    if (current.metrics.performance < 50) {
      insights.push({
        type: "improvement",
        title: "Optimize Performance",
        description: "Consider reducing complexity or enabling performance optimizations",
        impact: "high",
        metric: "performance",
        change: 0,
      });
    }

    if (current.metrics.maintainability < 50) {
      insights.push({
        type: "improvement",
        title: "Improve Maintainability",
        description: "Add more policies and documentation tools",
        impact: "medium",
        metric: "maintainability",
        change: 0,
      });
    }

    // Predictions based on trends
    if (this.snapshots.length >= 5) {
      const last5 = this.snapshots.slice(-5);
      const overallTrend =
        last5[last5.length - 1].metrics.overall - last5[0].metrics.overall;

      if (overallTrend > 10) {
        insights.push({
          type: "prediction",
          title: "Configuration Improving",
          description: "Your configuration quality is trending upward",
          impact: "low",
          metric: "overall",
          change: overallTrend,
        });
      } else if (overallTrend < -10) {
        insights.push({
          type: "prediction",
          title: "Configuration Declining",
          description: "Your configuration quality is trending downward",
          impact: "medium",
          metric: "overall",
          change: overallTrend,
        });
      }
    }

    return insights;
  }

  getCurrentMetrics(): ConfigurationMetrics | null {
    if (this.snapshots.length === 0) return null;
    return this.snapshots[this.snapshots.length - 1].metrics;
  }

  getSnapshotCount(): number {
    return this.snapshots.length;
  }

  clearHistory() {
    this.snapshots = [];
    this.saveToStorage();
  }

  exportData(): string {
    return JSON.stringify(this.snapshots, null, 2);
  }

  importData(data: string) {
    try {
      this.snapshots = JSON.parse(data);
      this.saveToStorage();
    } catch (e) {
      console.error("Failed to import analytics:", e);
    }
  }
}
