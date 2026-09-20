import type { Config } from "./generator";

export interface DependencyNode {
  id: string;
  label: string;
  type: "feature" | "toolchain" | "package" | "port" | "extension";
  group: string;
}

export interface DependencyEdge {
  from: string;
  to: string;
  label?: string;
}

export interface DependencyGraph {
  nodes: DependencyNode[];
  edges: DependencyEdge[];
}

export function buildDependencyGraph(c: Config): DependencyGraph {
  const nodes: DependencyNode[] = [];
  const edges: DependencyEdge[] = [];

  // Add base image as root
  nodes.push({
    id: "base",
    label: c.base,
    type: "feature",
    group: "base",
  });

  // Add features
  c.features.forEach((f) => {
    if (f.on) {
      nodes.push({
        id: `feature-${f.id}`,
        label: f.label,
        type: "feature",
        group: "features",
      });
      edges.push({
        from: "base",
        to: `feature-${f.id}`,
        label: "extends",
      });
    }
  });

  // Add toolchains
  c.langs.forEach((l) => {
    if (l.on) {
      nodes.push({
        id: `lang-${l.id}`,
        label: `${l.label} ${l.version}`,
        type: "toolchain",
        group: "toolchains",
      });
      edges.push({
        from: "base",
        to: `lang-${l.id}`,
        label: "installs",
      });

      // Toolchain dependencies
      if (l.id === "python") {
        edges.push({
          from: `lang-${l.id}`,
          to: "feature-node",
          label: "may require",
        });
      }
      if (l.id === "rust" || l.id === "go") {
        edges.push({
          from: `lang-${l.id}`,
          to: "pkg-build-essential",
          label: "requires",
        });
      }
    }
  });

  // Add essential packages
  c.toolGroups.forEach((g) => {
    if (g.on) {
      g.pkgs.forEach((pkg) => {
        const pkgId = `pkg-${pkg.replace(/[^a-z0-9]/gi, "-")}`;
        if (!nodes.find((n) => n.id === pkgId)) {
          nodes.push({
            id: pkgId,
            label: pkg,
            type: "package",
            group: g.id,
          });
          edges.push({
            from: "base",
            to: pkgId,
            label: "installs",
          });
        }
      });
    }
  });

  // Add ports
  c.ports.forEach((port) => {
    nodes.push({
      id: `port-${port}`,
      label: `:${port}`,
      type: "port",
      group: "network",
    });
    edges.push({
      from: "base",
      to: `port-${port}`,
      label: "forwards",
    });
  });

  // Add extensions
  c.extensions.forEach((ext) => {
    const extId = `ext-${ext.replace(/[^a-z0-9]/gi, "-")}`;
    nodes.push({
      id: extId,
      label: ext.split(".").pop() || ext,
      type: "extension",
      group: "extensions",
    });
    edges.push({
      from: "base",
      to: extId,
      label: "installs",
    });
  });

  // Docker-in-docker special relationships
  if (c.features.find((f) => f.id === "docker-in-docker" && f.on)) {
    c.ports.forEach((port) => {
      if (["5432", "3306", "27017", "6379"].includes(port)) {
        edges.push({
          from: "feature-docker-in-docker",
          to: `port-${port}`,
          label: "enables",
        });
      }
    });
  }

  return { nodes, edges };
}
