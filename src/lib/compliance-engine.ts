import type { Config } from "./generator";

export interface ComplianceFramework {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirements: ComplianceRequirement[];
}

export interface ComplianceRequirement {
  id: string;
  name: string;
  description: string;
  category: string;
  check: (config: Config) => ComplianceCheckResult;
}

export interface ComplianceCheckResult {
  status: "compliant" | "non-compliant" | "partial" | "not-applicable";
  score: number; // 0-100
  evidence: string;
  remediation?: string;
}

export interface ComplianceReport {
  framework: ComplianceFramework;
  overallScore: number;
  overallStatus: "compliant" | "non-compliant" | "partial";
  checks: ComplianceCheck[];
  generatedAt: number;
  summary: string;
}

export interface ComplianceCheck {
  requirement: ComplianceRequirement;
  result: ComplianceCheckResult;
}

export const COMPLIANCE_FRAMEWORKS: ComplianceFramework[] = [
  {
    id: "soc2",
    name: "SOC 2 Type II",
    description: "Service Organization Control 2 - Security, Availability, Processing Integrity, Confidentiality, Privacy",
    icon: "🔒",
    requirements: [
      {
        id: "soc2-cc6.1",
        name: "Logical Access Security",
        description: "The entity implements logical access security software, infrastructure, and architectures over protected information assets to protect them from security events.",
        category: "Security",
        check: (config) => {
          const hasNonRoot = config.enforce.nonRoot && config.remoteUser !== "root";
          const hasSecretsGuard = config.enforce.secretsGuard;
          
          if (hasNonRoot && hasSecretsGuard) {
            return {
              status: "compliant",
              score: 100,
              evidence: "Non-root execution enabled and secret hygiene enforced",
            };
          } else if (hasNonRoot || hasSecretsGuard) {
            return {
              status: "partial",
              score: 50,
              evidence: `Partial implementation: ${hasNonRoot ? "non-root enabled" : "secrets guard enabled"}`,
              remediation: "Enable both non-root execution and secret hygiene for full compliance",
            };
          }
          return {
            status: "non-compliant",
            score: 0,
            evidence: "Neither non-root execution nor secret hygiene enabled",
            remediation: "Enable P1 (non-root) and P3 (secrets guard) policies",
          };
        },
      },
      {
        id: "soc2-cc7.1",
        name: "Monitoring for Security Events",
        description: "The entity monitors system components and the operation of those components for anomalies indicative of security events.",
        category: "Monitoring",
        check: (config) => {
          const hasSmokeTest = config.smokeTest;
          const hasPolicies = Object.values(config.enforce).filter(Boolean).length >= 3;
          
          if (hasSmokeTest && hasPolicies) {
            return {
              status: "compliant",
              score: 100,
              evidence: "Smoke tests enabled and comprehensive policy enforcement active",
            };
          } else if (hasSmokeTest || hasPolicies) {
            return {
              status: "partial",
              score: 50,
              evidence: "Partial monitoring capabilities",
              remediation: "Enable smoke tests and at least 3 policy gates",
            };
          }
          return {
            status: "non-compliant",
            score: 0,
            evidence: "No monitoring or policy enforcement",
            remediation: "Enable smoke tests and policy enforcement",
          };
        },
      },
      {
        id: "soc2-cc8.1",
        name: "Change Management",
        description: "The entity authorizes, designs, develops or acquires, configures, documents, tests, approves, and implements changes to infrastructure, data, software, and procedures.",
        category: "Change Management",
        check: (config) => {
          const hasPreCommit = config.enforce.preCommit;
          const hasSchemaGate = config.enforce.schemaGate;
          
          if (hasPreCommit && hasSchemaGate) {
            return {
              status: "compliant",
              score: 100,
              evidence: "Pre-commit hooks and schema validation enforce change management",
            };
          } else if (hasPreCommit || hasSchemaGate) {
            return {
              status: "partial",
              score: 50,
              evidence: "Partial change management controls",
              remediation: "Enable both pre-commit hooks and schema validation",
            };
          }
          return {
            status: "non-compliant",
            score: 0,
            evidence: "No change management controls",
            remediation: "Enable P4 (pre-commit) and P5 (schema gate) policies",
          };
        },
      },
    ],
  },
  {
    id: "iso27001",
    name: "ISO 27001",
    description: "Information Security Management System - Comprehensive information security controls",
    icon: "🛡️",
    requirements: [
      {
        id: "iso-a.9.1",
        name: "Access Control Policy",
        description: "An access control policy should be established, documented and reviewed based on business and information security requirements.",
        category: "Access Control",
        check: (config) => {
          const hasNonRoot = config.enforce.nonRoot && config.remoteUser !== "root";
          
          if (hasNonRoot) {
            return {
              status: "compliant",
              score: 100,
              evidence: "Non-root execution policy enforces access control",
            };
          }
          return {
            status: "non-compliant",
            score: 0,
            evidence: "No access control policy enforced",
            remediation: "Enable P1 (non-root execution) policy",
          };
        },
      },
      {
        id: "iso-a.10.1",
        name: "Cryptographic Controls",
        description: "Ensure proper use of cryptographic controls for protection of information.",
        category: "Cryptography",
        check: (config) => {
          const hasSecretsGuard = config.enforce.secretsGuard;
          
          if (hasSecretsGuard) {
            return {
              status: "compliant",
              score: 100,
              evidence: "Secret hygiene policy protects sensitive information",
            };
          }
          return {
            status: "non-compliant",
            score: 0,
            evidence: "No cryptographic controls for secrets",
            remediation: "Enable P3 (secret hygiene) policy",
          };
        },
      },
      {
        id: "iso-a.12.1",
        name: "Operational Procedures and Responsibilities",
        description: "Documented operating procedures should be established and maintained.",
        category: "Operations",
        check: (config) => {
          const hasPolicies = Object.values(config.enforce).filter(Boolean).length >= 4;
          const hasSmokeTest = config.smokeTest;
          
          if (hasPolicies && hasSmokeTest) {
            return {
              status: "compliant",
              score: 100,
              evidence: "Comprehensive operational procedures with policy enforcement and testing",
            };
          } else if (hasPolicies || hasSmokeTest) {
            return {
              status: "partial",
              score: 50,
              evidence: "Partial operational procedures",
              remediation: "Enable at least 4 policy gates and smoke tests",
            };
          }
          return {
            status: "non-compliant",
            score: 0,
            evidence: "No operational procedures defined",
            remediation: "Enable policy enforcement and smoke tests",
          };
        },
      },
    ],
  },
  {
    id: "hipaa",
    name: "HIPAA",
    description: "Health Insurance Portability and Accountability Act - Protected Health Information security",
    icon: "🏥",
    requirements: [
      {
        id: "hipaa-164.312a",
        name: "Access Control",
        description: "Implement technical policies and procedures for electronic information systems that maintain ePHI to allow access only to authorized persons.",
        category: "Access Control",
        check: (config) => {
          const hasNonRoot = config.enforce.nonRoot && config.remoteUser !== "root";
          
          if (hasNonRoot) {
            return {
              status: "compliant",
              score: 100,
              evidence: "Non-root execution restricts access to authorized users",
            };
          }
          return {
            status: "non-compliant",
            score: 0,
            evidence: "No access control restrictions",
            remediation: "Enable P1 (non-root execution) policy",
          };
        },
      },
      {
        id: "hipaa-164.312e",
        name: "Transmission Security",
        description: "Implement technical security measures to guard against unauthorized access to ePHI transmitted over electronic communications network.",
        category: "Transmission Security",
        check: (config) => {
          const hasSecretsGuard = config.enforce.secretsGuard;
          
          if (hasSecretsGuard) {
            return {
              status: "compliant",
              score: 100,
              evidence: "Secret hygiene protects ePHI in transit",
            };
          }
          return {
            status: "non-compliant",
            score: 0,
            evidence: "No transmission security controls",
            remediation: "Enable P3 (secret hygiene) policy",
          };
        },
      },
    ],
  },
  {
    id: "gdpr",
    name: "GDPR",
    description: "General Data Protection Regulation - EU data protection and privacy",
    icon: "🇪🇺",
    requirements: [
      {
        id: "gdpr-art32",
        name: "Security of Processing",
        description: "Implement appropriate technical and organizational measures to ensure a level of security appropriate to the risk.",
        category: "Security",
        check: (config) => {
          const hasNonRoot = config.enforce.nonRoot && config.remoteUser !== "root";
          const hasSecretsGuard = config.enforce.secretsGuard;
          const hasPolicies = Object.values(config.enforce).filter(Boolean).length >= 3;
          
          const score = (hasNonRoot ? 33 : 0) + (hasSecretsGuard ? 33 : 0) + (hasPolicies ? 34 : 0);
          
          if (score >= 80) {
            return {
              status: "compliant",
              score,
              evidence: "Comprehensive security measures implemented",
            };
          } else if (score >= 40) {
            return {
              status: "partial",
              score,
              evidence: "Partial security measures",
              remediation: "Enable non-root execution, secret hygiene, and policy enforcement",
            };
          }
          return {
            status: "non-compliant",
            score,
            evidence: "Insufficient security measures",
            remediation: "Enable P1, P3, and at least 3 policy gates",
          };
        },
      },
    ],
  },
  {
    id: "pci-dss",
    name: "PCI DSS",
    description: "Payment Card Industry Data Security Standard - Credit card data protection",
    icon: "💳",
    requirements: [
      {
        id: "pci-req7",
        name: "Restrict Access to Cardholder Data",
        description: "Restrict access to cardholder data by business need-to-know.",
        category: "Access Control",
        check: (config) => {
          const hasNonRoot = config.enforce.nonRoot && config.remoteUser !== "root";
          
          if (hasNonRoot) {
            return {
              status: "compliant",
              score: 100,
              evidence: "Non-root execution restricts access to cardholder data",
            };
          }
          return {
            status: "non-compliant",
            score: 0,
            evidence: "No access restrictions for cardholder data",
            remediation: "Enable P1 (non-root execution) policy",
          };
        },
      },
      {
        id: "pci-req10",
        name: "Track and Monitor All Access",
        description: "Track and monitor all access to network resources and cardholder data.",
        category: "Monitoring",
        check: (config) => {
          const hasPolicies = Object.values(config.enforce).filter(Boolean).length >= 4;
          
          if (hasPolicies) {
            return {
              status: "compliant",
              score: 100,
              evidence: "Comprehensive policy enforcement enables access tracking",
            };
          }
          return {
            status: "non-compliant",
            score: 0,
            evidence: "Insufficient monitoring capabilities",
            remediation: "Enable at least 4 policy gates for comprehensive tracking",
          };
        },
      },
    ],
  },
];

export class ComplianceEngine {
  private reports: ComplianceReport[] = [];
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem("compliance-reports");
    if (stored) {
      try {
        this.reports = JSON.parse(stored);
      } catch (e) {
        console.error("Failed to load compliance reports:", e);
      }
    }
  }

  private saveToStorage() {
    if (typeof window === "undefined") return;
    localStorage.setItem("compliance-reports", JSON.stringify(this.reports));
  }

  private notifyListeners() {
    this.listeners.forEach((listener) => listener());
  }

  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  generateReport(config: Config, frameworkId: string): ComplianceReport {
    const framework = COMPLIANCE_FRAMEWORKS.find((f) => f.id === frameworkId);
    if (!framework) {
      throw new Error(`Framework '${frameworkId}' not found`);
    }

    const checks: ComplianceCheck[] = framework.requirements.map((requirement) => ({
      requirement,
      result: requirement.check(config),
    }));

    const totalScore = checks.reduce((sum, check) => sum + check.result.score, 0);
    const overallScore = Math.round(totalScore / checks.length);

    let overallStatus: "compliant" | "non-compliant" | "partial";
    if (overallScore >= 80) {
      overallStatus = "compliant";
    } else if (overallScore >= 50) {
      overallStatus = "partial";
    } else {
      overallStatus = "non-compliant";
    }

    const compliantCount = checks.filter((c) => c.result.status === "compliant").length;
    const partialCount = checks.filter((c) => c.result.status === "partial").length;
    const nonCompliantCount = checks.filter((c) => c.result.status === "non-compliant").length;

    const summary = `${compliantCount} compliant, ${partialCount} partial, ${nonCompliantCount} non-compliant out of ${checks.length} requirements`;

    const report: ComplianceReport = {
      framework,
      overallScore,
      overallStatus,
      checks,
      generatedAt: Date.now(),
      summary,
    };

    this.reports.push(report);
    if (this.reports.length > 50) {
      this.reports.shift();
    }

    this.saveToStorage();
    this.notifyListeners();

    return report;
  }

  getLatestReport(frameworkId: string): ComplianceReport | undefined {
    return this.reports
      .filter((r) => r.framework.id === frameworkId)
      .sort((a, b) => b.generatedAt - a.generatedAt)[0];
  }

  getAllReports(): ComplianceReport[] {
    return this.reports.sort((a, b) => b.generatedAt - a.generatedAt);
  }

  getFrameworks(): ComplianceFramework[] {
    return COMPLIANCE_FRAMEWORKS;
  }

  exportReport(report: ComplianceReport): string {
    return JSON.stringify(report, null, 2);
  }

  clearReports() {
    this.reports = [];
    this.saveToStorage();
    this.notifyListeners();
  }
}
