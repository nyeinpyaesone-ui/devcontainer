import type { Config } from "./generator";

export interface SecurityIssue {
  severity: "critical" | "high" | "medium" | "low" | "info";
  category: string;
  title: string;
  description: string;
  recommendation: string;
  policy?: string;
}

export function generateSecurityAudit(c: Config): {
  score: number;
  grade: string;
  issues: SecurityIssue[];
  summary: string;
} {
  const issues: SecurityIssue[] = [];

  // P1 - Non-root execution
  if (c.remoteUser === "root") {
    issues.push({
      severity: "critical",
      category: "Container Security",
      title: "Container runs as root",
      description: "Running containers as root user is a significant security risk",
      recommendation: "Set remoteUser to 'vscode' or another non-root user",
      policy: "P1",
    });
  } else if (!c.enforce.nonRoot) {
    issues.push({
      severity: "medium",
      category: "Policy Enforcement",
      title: "Non-root policy not enforced",
      description: "Policy P1 is disabled, allowing potential root execution",
      recommendation: "Enable policy P1 to enforce non-root execution",
    });
  }

  // Secret hygiene
  if (!c.enforce.secretsGuard) {
    issues.push({
      severity: "high",
      category: "Secret Management",
      title: "Secret hygiene not enforced",
      description: "Policy P3 is disabled, secrets may be committed to version control",
      recommendation: "Enable policy P3 and ensure .env files are in .gitignore",
    });
  }

  // Pre-commit hooks
  if (!c.enforce.preCommit) {
    issues.push({
      severity: "medium",
      category: "Code Quality",
      title: "Pre-commit hooks not installed",
      description: "Policy P4 is disabled, no automated checks before commits",
      recommendation: "Enable policy P4 to install pre-commit hooks",
    });
  }

  // Schema validation
  if (!c.enforce.schemaGate) {
    issues.push({
      severity: "low",
      category: "Configuration",
      title: "Schema validation disabled",
      description: "Policy P5 is disabled, invalid configurations may not be caught",
      recommendation: "Enable policy P5 for schema validation",
    });
  }

  // Runtime pinning
  if (!c.enforce.engines) {
    issues.push({
      severity: "medium",
      category: "Dependency Management",
      title: "Runtime versions not pinned",
      description: "Policy P2 is disabled, runtime versions may vary between environments",
      recommendation: "Enable policy P2 to pin runtime versions",
    });
  }

  // SSH key exposure
  if (c.git.sshSign) {
    issues.push({
      severity: "info",
      category: "Git Security",
      title: "SSH commit signing enabled",
      description: "SSH keys will be available in the container for commit signing",
      recommendation: "Ensure SSH keys are properly secured and rotated regularly",
    });
  }

  // Network exposure
  const exposedPorts = c.ports.length;
  if (exposedPorts > 5) {
    issues.push({
      severity: "low",
      category: "Network Security",
      title: "Many ports exposed",
      description: `${exposedPorts} ports are forwarded, increasing attack surface`,
      recommendation: "Review and minimize exposed ports to only those needed",
    });
  }

  // Database ports without authentication
  const dbPorts = ["5432", "3306", "27017", "6379"];
  const exposedDbPorts = c.ports.filter((p) => dbPorts.includes(p));
  if (exposedDbPorts.length > 0) {
    issues.push({
      severity: "high",
      category: "Database Security",
      title: "Database ports exposed without authentication",
      description: `Database ports (${exposedDbPorts.join(", ")}) are exposed. Ensure strong authentication is configured`,
      recommendation: "Use strong passwords, enable SSL/TLS, and restrict network access",
    });
  }

  // Toolchain security
  const toolchains = c.langs.filter((l) => l.on);
  if (toolchains.some((l) => l.id === "python" && l.version.startsWith("2"))) {
    issues.push({
      severity: "high",
      category: "Dependency Security",
      title: "Python 2.x detected",
      description: "Python 2.x is end-of-life and has known security vulnerabilities",
      recommendation: "Upgrade to Python 3.8 or later",
    });
  }

  // Volume mounts
  if (!c.namedVolume) {
    issues.push({
      severity: "info",
      category: "Data Management",
      title: "Named volumes not used",
      description: "Without named volumes, node_modules will be in the bind mount",
      recommendation: "Enable named volumes for better performance and isolation",
    });
  }

  // Calculate score
  const severityWeights = { critical: 25, high: 15, medium: 8, low: 3, info: 0 };
  const totalDeductions = issues.reduce((sum, issue) => sum + severityWeights[issue.severity], 0);
  const score = Math.max(0, 100 - totalDeductions);

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

  const criticalCount = issues.filter((i) => i.severity === "critical").length;
  const highCount = issues.filter((i) => i.severity === "high").length;
  const mediumCount = issues.filter((i) => i.severity === "medium").length;

  const summary =
    criticalCount > 0
      ? `Critical security issues found. ${criticalCount} critical issue${criticalCount > 1 ? "s" : ""} must be addressed before deployment.`
      : highCount > 0
        ? `Security concerns identified. ${highCount} high-severity issue${highCount > 1 ? "s" : ""} should be addressed.`
        : mediumCount > 0
          ? `Minor security improvements recommended. ${mediumCount} medium-severity issue${mediumCount > 1 ? "s" : ""} found.`
          : "Security posture is good. No critical or high-severity issues found.";

  return { score, grade, issues, summary };
}
