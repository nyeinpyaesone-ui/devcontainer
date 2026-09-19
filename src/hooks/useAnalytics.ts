import { useMemo } from "react";
import type { Config } from "../lib/generator";

interface AnalyticsData {
  featureUsage: { name: string; count: number }[];
  toolchainUsage: { name: string; count: number }[];
  policyCompliance: { name: string; enabled: boolean }[];
  portDistribution: { port: string; service: string }[];
  complexityScore: number;
  recommendations: string[];
}

export function useAnalytics(config: Config): AnalyticsData {
  return useMemo(() => {
    // Feature usage analysis
    const featureUsage = config.features
      .filter((f) => f.on)
      .map((f) => ({ name: f.label, count: 1 }));

    // Toolchain usage
    const toolchainUsage = config.langs
      .filter((l) => l.on)
      .map((l) => ({ name: `${l.label} ${l.version}`, count: 1 }));

    // Policy compliance
    const policyCompliance = [
      { name: "Non-root execution", enabled: config.enforce.nonRoot },
      { name: "Runtime pinning", enabled: config.enforce.engines },
      { name: "Secret hygiene", enabled: config.enforce.secretsGuard },
      { name: "Pre-commit hooks", enabled: config.enforce.preCommit },
      { name: "Schema validation", enabled: config.enforce.schemaGate },
    ];

    // Port distribution
    const portServices: Record<string, string> = {
      "3000": "Web Server",
      "5173": "Vite Dev Server",
      "5432": "PostgreSQL",
      "3306": "MySQL",
      "27017": "MongoDB",
      "6379": "Redis",
      "9200": "Elasticsearch",
      "8080": "HTTP Server",
      "8443": "HTTPS Server",
    };

    const portDistribution = config.ports.map((port) => ({
      port,
      service: portServices[port] || "Custom Service",
    }));

    // Complexity score (0-100)
    const featureComplexity = featureUsage.length * 10;
    const toolchainComplexity = toolchainUsage.length * 15;
    const portComplexity = config.ports.length * 5;
    const policyComplexity = policyCompliance.filter((p) => p.enabled).length * 8;
    const complexityScore = Math.min(
      100,
      featureComplexity + toolchainComplexity + portComplexity + policyComplexity
    );

    // Generate recommendations
    const recommendations: string[] = [];

    if (featureUsage.length === 0) {
      recommendations.push("Consider enabling at least one devcontainer feature");
    }

    if (toolchainUsage.length === 0) {
      recommendations.push("No language toolchains configured - add one if needed");
    }

    if (config.ports.length > 5) {
      recommendations.push("Many ports exposed - review if all are necessary");
    }

    if (!config.enforce.nonRoot) {
      recommendations.push("Enable non-root execution for better security");
    }

    if (!config.enforce.secretsGuard) {
      recommendations.push("Enable secret hygiene to prevent credential leaks");
    }

    if (config.clone === "off") {
      recommendations.push("Consider enabling repository cloning for easier setup");
    }

    if (complexityScore > 80) {
      recommendations.push("High complexity detected - consider simplifying configuration");
    }

    if (recommendations.length === 0) {
      recommendations.push("Configuration looks good! No immediate improvements needed.");
    }

    return {
      featureUsage,
      toolchainUsage,
      policyCompliance,
      portDistribution,
      complexityScore,
      recommendations,
    };
  }, [config]);
}
