import type { Config } from "./generator";

export interface PerformanceIssue {
  severity: "critical" | "high" | "medium" | "low";
  category: string;
  title: string;
  description: string;
  impact: string;
  recommendation: string;
  estimatedSavings?: string;
}

export interface PerformanceProfile {
  score: number;
  grade: string;
  issues: PerformanceIssue[];
  summary: string;
  buildTime: number;
  imageSize: number;
  memoryUsage: number;
}

export function profilePerformance(config: Config): PerformanceProfile {
  const issues: PerformanceIssue[] = [];

  // Calculate base metrics
  const featureCount = config.features.filter((f) => f.on).length;
  const toolchainCount = config.langs.filter((l) => l.on).length;
  const toolGroupCount = config.toolGroups.filter((g) => g.on).length;
  const portCount = config.ports.length;
  const extensionCount = config.extensions.length;

  // Estimate build time (seconds)
  let buildTime = 30; // base
  buildTime += featureCount * 15;
  buildTime += toolchainCount * 45; // Toolchains are expensive
  buildTime += toolGroupCount * 8;
  buildTime += portCount * 2;

  // Estimate image size (MB)
  let imageSize = 150; // base ubuntu
  imageSize += featureCount * 80;
  imageSize += toolchainCount * 250; // Toolchains are large
  imageSize += toolGroupCount * 50;
  imageSize += extensionCount * 5;

  // Estimate memory usage (MB)
  let memoryUsage = 512; // base
  memoryUsage += featureCount * 128;
  memoryUsage += toolchainCount * 256;
  memoryUsage += portCount * 64;

  // Analyze issues

  // Toolchain analysis
  if (toolchainCount > 3) {
    issues.push({
      severity: "high",
      category: "Toolchains",
      title: "Multiple Toolchains Enabled",
      description: `${toolchainCount} language toolchains are enabled, significantly increasing build time and image size`,
      impact: `Adds ~${(toolchainCount - 3) * 45}s to build time and ~${(toolchainCount - 3) * 250}MB to image size`,
      recommendation: "Consider using only the toolchains you actively need. Disable unused toolchains or use feature flags.",
      estimatedSavings: `${(toolchainCount - 3) * 45}s build time, ${(toolchainCount - 3) * 250}MB image size`,
    });
  }

  // Heavy toolchains
  const heavyToolchains = config.langs.filter(
    (l) => l.on && (l.id === "java" || l.id === "dotnet" || l.id === "python")
  );
  if (heavyToolchains.length > 0) {
    issues.push({
      severity: "medium",
      category: "Toolchains",
      title: "Heavy Toolchains Detected",
      description: `${heavyToolchains.map((l) => l.label).join(", ")} ${heavyToolchains.length > 1 ? "are" : "is"} resource-intensive`,
      impact: "Each heavy toolchain adds 200-300MB to image size and 30-60s to build time",
      recommendation: "Consider using lighter alternatives or container-based development for these languages.",
    });
  }

  // Feature analysis
  if (config.features.some((f) => f.id === "docker-in-docker" && f.on)) {
    issues.push({
      severity: "medium",
      category: "Features",
      title: "Docker-in-Docker Enabled",
      description: "Docker-in-Docker adds significant overhead to the container",
      impact: "Adds ~80MB to image size and ~15s to build time",
      recommendation: "Only enable if you need to run Docker commands inside the container. Consider using host Docker instead.",
      estimatedSavings: "80MB image size, 15s build time",
    });
  }

  // Tool groups analysis
  const allToolsEnabled = config.toolGroups.every((g) => g.on);
  if (allToolsEnabled && toolGroupCount > 4) {
    issues.push({
      severity: "medium",
      category: "Tools",
      title: "All Tool Groups Enabled",
      description: "All tool groups are enabled, including potentially unnecessary tools",
      impact: "Adds ~200MB to image size and ~32s to build time",
      recommendation: "Review each tool group and disable those you don't actively use. Network tools and VCS tools are often unnecessary.",
      estimatedSavings: "200MB image size, 32s build time",
    });
  }

  // Port analysis
  if (portCount > 5) {
    issues.push({
      severity: "low",
      category: "Network",
      title: "Many Ports Exposed",
      description: `${portCount} ports are forwarded, which may indicate unnecessary services`,
      impact: "Each port adds minimal overhead but increases attack surface",
      recommendation: "Review exposed ports and disable those not needed for development.",
    });
  }

  // Extension analysis
  if (extensionCount > 10) {
    issues.push({
      severity: "low",
      category: "Extensions",
      title: "Many Extensions Installed",
      description: `${extensionCount} VS Code extensions are configured`,
      impact: "Extensions add ~5MB each and may slow down VS Code startup",
      recommendation: "Review extensions and disable those you don't use daily. Consider workspace-specific extensions.",
      estimatedSavings: `${(extensionCount - 10) * 5}MB image size`,
    });
  }

  // Optimization checks
  if (!config.namedVolume) {
    issues.push({
      severity: "high",
      category: "Optimization",
      title: "Named Volume Not Enabled",
      description: "node_modules is not using a named volume, causing slow rebuilds",
      impact: "Rebuilds take 2-3x longer due to node_modules being in bind mount",
      recommendation: "Enable named volumes for node_modules to dramatically improve rebuild performance.",
      estimatedSavings: "60-70% faster rebuilds",
    });
  }

  // Git optimizations
  const gitOptimizationsEnabled = Object.values(config.git).filter(Boolean).length;
  if (gitOptimizationsEnabled < 3) {
    issues.push({
      severity: "medium",
      category: "Optimization",
      title: "Git Optimizations Not Fully Enabled",
      description: `Only ${gitOptimizationsEnabled}/5 git optimizations are enabled`,
      impact: "Git operations may be slower than necessary",
      recommendation: "Enable protocol v2, commit graph, and maintenance for faster git operations.",
      estimatedSavings: "20-30% faster git operations",
    });
  }

  // Clone strategy
  if (config.clone === "full") {
    issues.push({
      severity: "medium",
      category: "Optimization",
      title: "Full Clone Strategy",
      description: "Using full clone instead of shallow clone",
      impact: "Initial clone takes 3-5x longer and uses more disk space",
      recommendation: "Switch to shallow clone unless you need full git history.",
      estimatedSavings: "60-80% faster initial clone",
    });
  }

  // Base image analysis
  if (config.base === "ubuntu-24.04") {
    issues.push({
      severity: "low",
      category: "Base Image",
      title: "Ubuntu Base Image",
      description: "Using Ubuntu base image (150MB)",
      impact: "Larger than minimal base images",
      recommendation: "Consider Alpine (7MB) or Debian slim (50MB) for smaller image size if compatibility allows.",
      estimatedSavings: "100-143MB image size",
    });
  }

  // Calculate performance score
  let score = 100;
  
  // Deduct for issues
  issues.forEach((issue) => {
    switch (issue.severity) {
      case "critical":
        score -= 20;
        break;
      case "high":
        score -= 15;
        break;
      case "medium":
        score -= 8;
        break;
      case "low":
        score -= 3;
        break;
    }
  });

  // Bonus for optimizations
  if (config.namedVolume) score += 10;
  if (gitOptimizationsEnabled >= 4) score += 5;
  if (config.clone === "shallow") score += 5;

  score = Math.max(0, Math.min(100, score));

  // Determine grade
  const grade =
    score >= 90
      ? "A"
      : score >= 80
        ? "B"
        : score >= 70
          ? "C"
          : score >= 60
            ? "D"
            : "F";

  // Generate summary
  const criticalCount = issues.filter((i) => i.severity === "critical").length;
  const highCount = issues.filter((i) => i.severity === "high").length;
  
  let summary = "";
  if (criticalCount > 0) {
    summary = `Critical performance issues found. ${criticalCount} critical issue${criticalCount > 1 ? "s" : ""} must be addressed.`;
  } else if (highCount > 0) {
    summary = `Performance concerns identified. ${highCount} high-severity issue${highCount > 1 ? "s" : ""} should be addressed for optimal performance.`;
  } else if (issues.length > 0) {
    summary = `Minor performance improvements available. ${issues.length} optimization${issues.length > 1 ? "s" : ""} recommended.`;
  } else {
    summary = "Excellent performance! No optimization opportunities identified.";
  }

  return {
    score,
    grade,
    issues: issues.sort((a, b) => {
      const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    }),
    summary,
    buildTime: Math.round(buildTime),
    imageSize: Math.round(imageSize),
    memoryUsage: Math.round(memoryUsage),
  };
}
