import type { Config } from "./generator";

export interface CostEstimate {
  imageSize: number; // MB
  buildTime: number; // seconds
  memoryUsage: number; // MB
  cpuUsage: number; // cores
  diskUsage: number; // MB
  monthlyCost: number; // USD (assuming cloud hosting)
}

export function estimateCosts(c: Config): CostEstimate {
  // Base image size
  let imageSize = 0;
  switch (c.base) {
    case "ubuntu-24.04":
      imageSize = 77;
      break;
    case "debian-12":
      imageSize = 125;
      break;
    case "alpine-3.20":
      imageSize = 7;
      break;
    default:
      imageSize = 100;
  }

  // Feature sizes
  const featureSizes: Record<string, number> = {
    "docker-in-docker": 450,
    git: 50,
    "github-cli": 30,
    node: 120,
    pnpm: 40,
    python: 180,
  };

  c.features.forEach((f) => {
    if (f.on && featureSizes[f.id]) {
      imageSize += featureSizes[f.id];
    }
  });

  // Toolchain sizes
  const toolchainSizes: Record<string, number> = {
    rust: 310,
    go: 160,
    python: 240,
    java: 280,
    dotnet: 210,
    php: 90,
    ruby: 90,
  };

  c.langs.forEach((l) => {
    if (l.on && toolchainSizes[l.id]) {
      imageSize += toolchainSizes[l.id];
    }
  });

  // Essential packages
  const essentialCount = c.toolGroups.reduce((sum, g) => sum + (g.on ? g.pkgs.length : 0), 0);
  imageSize += essentialCount * 3.5;

  // Extra apt packages
  const extraPkgs = c.aptExtra.split(",").filter((p) => p.trim()).length;
  imageSize += extraPkgs * 6;

  // Build time estimation
  let buildTime = 30; // base
  buildTime += c.features.filter((f) => f.on).length * 21;
  buildTime += c.langs.filter((l) => l.on).length * 34;
  buildTime += essentialCount * 0.5;
  buildTime += extraPkgs * 2;

  // Memory usage estimation
  let memoryUsage = 512; // base
  memoryUsage += c.features.filter((f) => f.on).length * 128;
  memoryUsage += c.langs.filter((l) => l.on).length * 256;
  memoryUsage += c.ports.length * 64;

  // CPU usage estimation
  let cpuUsage = 2; // base
  cpuUsage += c.langs.filter((l) => l.on).length * 0.5;
  cpuUsage += c.features.filter((f) => f.id === "docker-in-docker" && f.on).length * 1;

  // Disk usage (workspace + node_modules + caches)
  let diskUsage = imageSize * 1.5; // image + layers
  diskUsage += 1024; // workspace estimate
  diskUsage += 512; // node_modules estimate
  diskUsage += c.langs.filter((l) => l.on).length * 256; // caches

  // Monthly cost estimation (assuming GitHub Codespaces pricing)
  // $0.18/hour for 2-core, 4GB instance
  // Adjust based on actual resource usage
  const hourlyRate = 0.18;
  const hoursPerMonth = 160; // assuming 8 hours/day, 20 days/month
  let monthlyCost = hourlyRate * hoursPerMonth;

  // Adjust for resource usage
  if (memoryUsage > 4096) monthlyCost *= 1.5;
  if (cpuUsage > 4) monthlyCost *= 1.3;
  if (diskUsage > 10240) monthlyCost *= 1.2;

  return {
    imageSize: Math.round(imageSize),
    buildTime: Math.round(buildTime),
    memoryUsage: Math.round(memoryUsage),
    cpuUsage: Math.round(cpuUsage * 10) / 10,
    diskUsage: Math.round(diskUsage),
    monthlyCost: Math.round(monthlyCost * 100) / 100,
  };
}

export function formatSize(mb: number): string {
  if (mb < 1024) return `${mb} MB`;
  return `${(mb / 1024).toFixed(1)} GB`;
}

export function formatTime(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs}s`;
}
