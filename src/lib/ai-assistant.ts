import type { Config, FeatureDef, LangChain, ToolGroup } from "./generator";

export interface AIInsight {
  type: "suggestion" | "warning" | "optimization" | "pattern";
  priority: "high" | "medium" | "low";
  title: string;
  description: string;
  action?: () => void;
  confidence: number; // 0-100
}

export interface PatternMatch {
  name: string;
  description: string;
  matchScore: number; // 0-100
  recommendations: string[];
}

// Common configuration patterns
const CONFIG_PATTERNS = {
  "full-stack-web": {
    name: "Full-Stack Web Application",
    indicators: ["node", "docker-in-docker", "5432", "3000"],
    recommendations: [
      "Enable PostgreSQL feature for database",
      "Add Redis for caching",
      "Configure environment variables",
      "Set up hot-reload for development",
    ],
  },
  "microservices": {
    name: "Microservices Architecture",
    indicators: ["docker-in-docker", "multiple-ports", "kubernetes"],
    recommendations: [
      "Enable Docker Compose for orchestration",
      "Add service mesh tools",
      "Configure health checks",
      "Set up logging aggregation",
    ],
  },
  "data-science": {
    name: "Data Science / ML",
    indicators: ["python", "jupyter", "gpu"],
    recommendations: [
      "Enable GPU support if available",
      "Add data visualization tools",
      "Configure large memory allocation",
      "Install ML frameworks (TensorFlow, PyTorch)",
    ],
  },
  "rust-backend": {
    name: "Rust Backend Service",
    indicators: ["rust", "cargo", "docker"],
    recommendations: [
      "Enable rust-analyzer extension",
      "Add debugging tools (lldb)",
      "Configure release build optimization",
      "Set up cross-compilation targets",
    ],
  },
};

export class AIAssistant {
  private config: Config;

  constructor(config: Config) {
    this.config = config;
  }

  // Detect configuration patterns
  detectPatterns(): PatternMatch[] {
    const matches: PatternMatch[] = [];
    const activeFeatures = this.config.features.filter((f: FeatureDef) => f.on).map((f: FeatureDef) => f.id);
    const activeLangs = this.config.langs.filter((l: LangChain) => l.on).map((l: LangChain) => l.id as string);
    const ports = this.config.ports;

    for (const [patternId, pattern] of Object.entries(CONFIG_PATTERNS)) {
      let matchScore = 0;
      const totalIndicators = pattern.indicators.length;

      for (const indicator of pattern.indicators) {
        if (activeFeatures.includes(indicator)) matchScore += 25;
        if (activeLangs.includes(indicator)) matchScore += 25;
        if (ports.includes(indicator)) matchScore += 25;
        if (indicator === "multiple-ports" && ports.length > 3) matchScore += 25;
      }

      const normalizedScore = Math.min(100, (matchScore / totalIndicators) * 100);

      if (normalizedScore > 30) {
        matches.push({
          name: pattern.name,
          description: `Detected ${normalizedScore}% match with ${pattern.name} pattern`,
          matchScore: normalizedScore,
          recommendations: pattern.recommendations,
        });
      }
    }

    return matches.sort((a, b) => b.matchScore - a.matchScore);
  }

  // Generate intelligent insights
  generateInsights(): AIInsight[] {
    const insights: AIInsight[] = [];
    const patterns = this.detectPatterns();

    // Pattern-based insights
    if (patterns.length > 0 && patterns[0].matchScore > 70) {
      insights.push({
        type: "pattern",
        priority: "high",
        title: `Detected: ${patterns[0].name}`,
        description: `Your configuration matches the ${patterns[0].name} pattern with ${patterns[0].matchScore}% confidence.`,
        confidence: patterns[0].matchScore,
      });

      for (const rec of patterns[0].recommendations.slice(0, 2)) {
        insights.push({
          type: "suggestion",
          priority: "medium",
          title: "Recommended Enhancement",
          description: rec,
          confidence: patterns[0].matchScore * 0.8,
        });
      }
    }

    // Feature combination insights
    const hasNode = this.config.features.some((f) => f.id === "node" && f.on);
    const hasDocker = this.config.features.some((f) => f.id === "docker-in-docker" && f.on);
    const hasDatabase = this.config.ports.includes("5432") || this.config.ports.includes("3306");

    if (hasNode && hasDocker && !hasDatabase) {
      insights.push({
        type: "suggestion",
        priority: "medium",
        title: "Consider Adding Database",
        description: "Most Node.js + Docker setups benefit from a database. Consider adding PostgreSQL or MongoDB.",
        confidence: 75,
      });
    }

    // Performance insights
    const totalPackages = this.config.toolGroups.reduce((sum, g) => sum + (g.on ? g.pkgs.length : 0), 0);
    if (totalPackages > 50) {
      insights.push({
        type: "optimization",
        priority: "low",
        title: "High Package Count",
        description: `You have ${totalPackages} packages enabled. Consider if all are necessary to reduce image size.`,
        confidence: 60,
      });
    }

    // Security insights
    const securityPolicies = Object.values(this.config.enforce).filter(Boolean).length;
    if (securityPolicies < 3) {
      insights.push({
        type: "warning",
        priority: "high",
        title: "Low Security Coverage",
        description: `Only ${securityPolicies}/5 security policies enabled. Consider enabling more for better protection.`,
        confidence: 90,
      });
    }

    // Toolchain insights
    const activeLangs = this.config.langs.filter((l) => l.on);
    if (activeLangs.length === 0 && hasNode) {
      insights.push({
        type: "suggestion",
        priority: "low",
        title: "Node Feature Active",
        description: "You have Node.js feature enabled. Consider if you also need the Node toolchain for more control.",
        confidence: 50,
      });
    }

    // Port insights
    if (this.config.ports.length > 5) {
      insights.push({
        type: "warning",
        priority: "medium",
        title: "Many Ports Exposed",
        description: `${this.config.ports.length} ports are exposed. Review if all are necessary for security.`,
        confidence: 70,
      });
    }

    // Extension insights
    if (this.config.extensions.length < 3) {
      insights.push({
        type: "suggestion",
        priority: "low",
        title: "Few Extensions Configured",
        description: "Consider adding more VS Code extensions for better development experience.",
        confidence: 55,
      });
    }

    return insights.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  // Smart suggestions based on context
  getSmartSuggestions(): string[] {
    const suggestions: string[] = [];
    const patterns = this.detectPatterns();

    if (patterns.length > 0) {
      suggestions.push(`Based on your setup, this looks like a ${patterns[0].name.toLowerCase()}.`);
    }

    const activeFeatures = this.config.features.filter((f) => f.on).length;
    if (activeFeatures === 0) {
      suggestions.push("Start by enabling some devcontainer features like Git or Docker.");
    }

    if (this.config.langs.filter((l) => l.on).length === 0) {
      suggestions.push("Consider adding language toolchains for your development needs.");
    }

    if (!this.config.enforce.nonRoot) {
      suggestions.push("Enable non-root execution for better security.");
    }

    if (this.config.ports.length === 0) {
      suggestions.push("Add ports if your application needs network access.");
    }

    return suggestions;
  }

  // Natural language configuration parsing (simplified)
  parseNaturalLanguage(input: string): Partial<Config> {
    const lower = input.toLowerCase();
    const updates: Partial<Config> = {};

    // Detect language mentions
    if (lower.includes("node") || lower.includes("javascript") || lower.includes("typescript")) {
      updates.features = this.config.features.map((f: FeatureDef) =>
        f.id === "node" ? { ...f, on: true } : f
      );
    }

    if (lower.includes("python")) {
      const pythonLang = this.config.langs.find((l: LangChain) => l.id === "python");
      if (pythonLang) {
        updates.langs = this.config.langs.map((l: LangChain) =>
          l.id === "python" ? { ...l, on: true } : l
        );
      }
    }

    if (lower.includes("rust")) {
      const rustLang = this.config.langs.find((l: LangChain) => l.id === "rust");
      if (rustLang) {
        updates.langs = this.config.langs.map((l: LangChain) =>
          l.id === "rust" ? { ...l, on: true } : l
        );
      }
    }

    if (lower.includes("go") || lower.includes("golang")) {
      const goLang = this.config.langs.find((l: LangChain) => l.id === "go");
      if (goLang) {
        updates.langs = this.config.langs.map((l: LangChain) =>
          l.id === "go" ? { ...l, on: true } : l
        );
      }
    }

    // Detect database mentions
    if (lower.includes("postgres") || lower.includes("postgresql")) {
      updates.ports = [...new Set([...this.config.ports, "5432"])];
    }

    if (lower.includes("mongo") || lower.includes("mongodb")) {
      updates.ports = [...new Set([...this.config.ports, "27017"])];
    }

    if (lower.includes("redis")) {
      updates.ports = [...new Set([...this.config.ports, "6379"])];
    }

    // Detect security mentions
    if (lower.includes("secure") || lower.includes("security")) {
      updates.enforce = {
        ...this.config.enforce,
        nonRoot: true,
        secretsGuard: true,
        preCommit: true,
      };
    }

    // Detect docker mentions
    if (lower.includes("docker")) {
      updates.features = this.config.features.map((f) =>
        f.id === "docker-in-docker" ? { ...f, on: true } : f
      );
    }

    return updates;
  }
}
