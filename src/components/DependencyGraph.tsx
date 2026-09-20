import { buildDependencyGraph } from "../lib/dependency-graph";
import type { Config } from "../lib/generator";

interface DependencyGraphProps {
  config: Config;
}

export default function DependencyGraph({ config }: DependencyGraphProps) {
  const graph = buildDependencyGraph(config);

  // Group nodes by type
  const groupedNodes = {
    base: graph.nodes.filter((n) => n.type === "feature" && n.group === "base"),
    features: graph.nodes.filter((n) => n.type === "feature" && n.group === "features"),
    toolchains: graph.nodes.filter((n) => n.type === "toolchain"),
    packages: graph.nodes.filter((n) => n.type === "package"),
    ports: graph.nodes.filter((n) => n.type === "port"),
    extensions: graph.nodes.filter((n) => n.type === "extension"),
  };

  const typeColors = {
    base: "bg-blue-500/20 border-blue-500/50 text-blue-400",
    feature: "bg-purple-500/20 border-purple-500/50 text-purple-400",
    toolchain: "bg-green-500/20 border-green-500/50 text-green-400",
    package: "bg-yellow-500/20 border-yellow-500/50 text-yellow-400",
    port: "bg-orange-500/20 border-orange-500/50 text-orange-400",
    extension: "bg-pink-500/20 border-pink-500/50 text-pink-400",
  };

  return (
    <div className="bg-ink-900 border border-ink-700 rounded-lg p-6">
      <h3 className="text-lg font-bold text-mist-100 mb-4">Dependency Graph</h3>
      <div className="space-y-6">
        {/* Base */}
        {groupedNodes.base.length > 0 && (
          <div>
            <div className="text-xs text-mist-500 uppercase mb-2">Base Image</div>
            <div className="flex flex-wrap gap-2">
              {groupedNodes.base.map((node) => (
                <div
                  key={node.id}
                  className={`px-3 py-2 rounded-lg border ${typeColors.base} text-sm font-medium`}
                >
                  {node.label}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Features */}
        {groupedNodes.features.length > 0 && (
          <div>
            <div className="text-xs text-mist-500 uppercase mb-2">
              Features ({groupedNodes.features.length})
            </div>
            <div className="flex flex-wrap gap-2">
              {groupedNodes.features.map((node) => (
                <div
                  key={node.id}
                  className={`px-3 py-2 rounded-lg border ${typeColors.feature} text-sm`}
                >
                  {node.label}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Toolchains */}
        {groupedNodes.toolchains.length > 0 && (
          <div>
            <div className="text-xs text-mist-500 uppercase mb-2">
              Toolchains ({groupedNodes.toolchains.length})
            </div>
            <div className="flex flex-wrap gap-2">
              {groupedNodes.toolchains.map((node) => (
                <div
                  key={node.id}
                  className={`px-3 py-2 rounded-lg border ${typeColors.toolchain} text-sm`}
                >
                  {node.label}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Packages */}
        {groupedNodes.packages.length > 0 && (
          <div>
            <div className="text-xs text-mist-500 uppercase mb-2">
              Packages ({groupedNodes.packages.length})
            </div>
            <div className="flex flex-wrap gap-2">
              {groupedNodes.packages.slice(0, 20).map((node) => (
                <div
                  key={node.id}
                  className={`px-2 py-1 rounded border ${typeColors.package} text-xs`}
                >
                  {node.label}
                </div>
              ))}
              {groupedNodes.packages.length > 20 && (
                <div className="px-2 py-1 text-xs text-mist-500">
                  +{groupedNodes.packages.length - 20} more
                </div>
              )}
            </div>
          </div>
        )}

        {/* Ports */}
        {groupedNodes.ports.length > 0 && (
          <div>
            <div className="text-xs text-mist-500 uppercase mb-2">
              Ports ({groupedNodes.ports.length})
            </div>
            <div className="flex flex-wrap gap-2">
              {groupedNodes.ports.map((node) => (
                <div
                  key={node.id}
                  className={`px-3 py-2 rounded-lg border ${typeColors.port} text-sm font-mono`}
                >
                  {node.label}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Extensions */}
        {groupedNodes.extensions.length > 0 && (
          <div>
            <div className="text-xs text-mist-500 uppercase mb-2">
              Extensions ({groupedNodes.extensions.length})
            </div>
            <div className="flex flex-wrap gap-2">
              {groupedNodes.extensions.map((node) => (
                <div
                  key={node.id}
                  className={`px-3 py-2 rounded-lg border ${typeColors.extension} text-sm`}
                >
                  {node.label}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="mt-6 pt-6 border-t border-ink-700">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          <div>
            <div className="text-mist-500">Total Nodes</div>
            <div className="text-2xl font-bold text-mist-100">{graph.nodes.length}</div>
          </div>
          <div>
            <div className="text-mist-500">Total Edges</div>
            <div className="text-2xl font-bold text-mist-100">{graph.edges.length}</div>
          </div>
          <div>
            <div className="text-mist-500">Complexity</div>
            <div className="text-2xl font-bold text-mist-100">
              {graph.nodes.length < 20 ? "Low" : graph.nodes.length < 50 ? "Medium" : "High"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
