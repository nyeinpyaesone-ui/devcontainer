import type { Config } from "./generator";

export type Environment = "development" | "staging" | "production";

export interface EnvironmentConfig {
  name: Environment;
  label: string;
  description: string;
  modifications: Partial<Config>;
}

export const ENVIRONMENTS: EnvironmentConfig[] = [
  {
    name: "development",
    label: "Development",
    description: "Full tooling, debugging enabled, verbose logging",
    modifications: {
      smokeTest: true,
      enforce: {
        nonRoot: true,
        engines: true,
        secretsGuard: true,
        preCommit: true,
        schemaGate: true,
      },
    },
  },
  {
    name: "staging",
    label: "Staging",
    description: "Production-like, reduced tooling, stricter policies",
    modifications: {
      smokeTest: true,
      enforce: {
        nonRoot: true,
        engines: true,
        secretsGuard: true,
        preCommit: true,
        schemaGate: true,
      },
    },
  },
  {
    name: "production",
    label: "Production",
    description: "Minimal footprint, maximum security, no debugging",
    modifications: {
      smokeTest: true,
      enforce: {
        nonRoot: true,
        engines: true,
        secretsGuard: true,
        preCommit: true,
        schemaGate: true,
      },
    },
  },
];

export function applyEnvironment(baseConfig: Config, env: Environment): Config {
  const envConfig = ENVIRONMENTS.find((e) => e.name === env);
  if (!envConfig) return baseConfig;

  const modified = { ...baseConfig, ...envConfig.modifications };

  // Environment-specific adjustments
  switch (env) {
    case "development":
      // Enable all debugging tools
      modified.toolGroups = baseConfig.toolGroups.map((g) => ({
        ...g,
        on: g.id === "core" || g.id === "shell" || g.id === "build" ? true : g.on,
      }));
      break;

    case "staging":
      // Reduce debugging tools, keep essentials
      modified.toolGroups = baseConfig.toolGroups.map((g) => ({
        ...g,
        on: g.id === "core" || g.id === "build" ? true : g.id === "shell" ? false : g.on,
      }));
      break;

    case "production":
      // Minimal tooling, maximum security
      modified.toolGroups = baseConfig.toolGroups.map((g) => ({
        ...g,
        on: g.id === "core" ? true : false,
      }));
      // Disable non-essential features
      modified.features = baseConfig.features.map((f) => ({
        ...f,
        on: f.id === "git" || f.id === "github-cli" ? true : false,
      }));
      break;
  }

  return modified;
}

export function getEnvironmentDiff(base: Config, env: Environment): string[] {
  const modified = applyEnvironment(base, env);
  const diffs: string[] = [];

  // Compare features
  const baseFeatures = base.features.filter((f) => f.on).map((f) => f.id);
  const modFeatures = modified.features.filter((f) => f.on).map((f) => f.id);
  if (JSON.stringify(baseFeatures) !== JSON.stringify(modFeatures)) {
    diffs.push(`Features: ${baseFeatures.length} → ${modFeatures.length}`);
  }

  // Compare toolchains
  const baseLangs = base.langs.filter((l) => l.on).length;
  const modLangs = modified.langs.filter((l) => l.on).length;
  if (baseLangs !== modLangs) {
    diffs.push(`Toolchains: ${baseLangs} → ${modLangs}`);
  }

  // Compare tool groups
  const baseTools = base.toolGroups.filter((g) => g.on).length;
  const modTools = modified.toolGroups.filter((g) => g.on).length;
  if (baseTools !== modTools) {
    diffs.push(`Tool groups: ${baseTools} → ${modTools}`);
  }

  // Compare policies
  const basePolicies = Object.values(base.enforce).filter(Boolean).length;
  const modPolicies = Object.values(modified.enforce).filter(Boolean).length;
  if (basePolicies !== modPolicies) {
    diffs.push(`Policies: ${basePolicies}/5 → ${modPolicies}/5`);
  }

  return diffs;
}
