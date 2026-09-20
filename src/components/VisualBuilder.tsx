import { useState, useCallback } from "react";
import type { Config, FeatureDef, LangChain, ToolGroup } from "../lib/generator";
import { DEFAULT_CONFIG } from "../lib/generator";

interface VisualBuilderProps {
  config: Config;
  onConfigChange: (config: Config) => void;
  isOpen: boolean;
  onClose: () => void;
}

interface DraggableItem {
  id: string;
  type: "feature" | "toolchain" | "tool" | "port" | "extension";
  label: string;
  icon: string;
  description: string;
}

const PALETTE_ITEMS: DraggableItem[] = [
  // Features
  { id: "docker-in-docker", type: "feature", label: "Docker-in-Docker", icon: "🐳", description: "Run Docker inside the container" },
  { id: "git", type: "feature", label: "Git", icon: "📝", description: "Latest Git version" },
  { id: "github-cli", type: "feature", label: "GitHub CLI", icon: "🐙", description: "gh command-line tool" },
  { id: "node", type: "feature", label: "Node.js", icon: "🟢", description: "Node.js runtime" },
  { id: "python", type: "feature", label: "Python", icon: "🐍", description: "Python runtime" },
  
  // Toolchains
  { id: "rust", type: "toolchain", label: "Rust", icon: "🦀", description: "Rust toolchain" },
  { id: "go", type: "toolchain", label: "Go", icon: "🔵", description: "Go toolchain" },
  { id: "java", type: "toolchain", label: "Java", icon: "☕", description: "Java toolchain" },
  { id: "dotnet", type: "toolchain", label: ".NET", icon: "🟣", description: ".NET toolchain" },
  { id: "php", type: "toolchain", label: "PHP", icon: "🐘", description: "PHP toolchain" },
  { id: "ruby", type: "toolchain", label: "Ruby", icon: "💎", description: "Ruby toolchain" },
  
  // Tools
  { id: "core", type: "tool", label: "Core Utilities", icon: "🔧", description: "curl, wget, jq, etc." },
  { id: "build", type: "tool", label: "Build Tools", icon: "🏗️", description: "gcc, make, cmake" },
  { id: "shell", type: "tool", label: "Shell Tools", icon: "💻", description: "fzf, ripgrep, bat" },
  { id: "vcs", type: "tool", label: "VCS Tools", icon: "📦", description: "git-lfs, gh, pre-commit" },
  { id: "net", type: "tool", label: "Network Tools", icon: "🌐", description: "dnsutils, ping, nc" },
  
  // Ports
  { id: "3000", type: "port", label: "Port 3000", icon: "🔌", description: "Web server" },
  { id: "5173", type: "port", label: "Port 5173", icon: "🔌", description: "Vite dev server" },
  { id: "5432", type: "port", label: "Port 5432", icon: "🐘", description: "PostgreSQL" },
  { id: "3306", type: "port", label: "Port 3306", icon: "🐬", description: "MySQL" },
  { id: "27017", type: "port", label: "Port 27017", icon: "🍃", description: "MongoDB" },
  { id: "6379", type: "port", label: "Port 6379", icon: "🔴", description: "Redis" },
  
  // Extensions
  { id: "vscode-eslint", type: "extension", label: "ESLint", icon: "🔍", description: "JavaScript linter" },
  { id: "prettier", type: "extension", label: "Prettier", icon: "✨", description: "Code formatter" },
  { id: "tailwind", type: "extension", label: "Tailwind CSS", icon: "🎨", description: "CSS framework" },
  { id: "docker", type: "extension", label: "Docker", icon: "🐳", description: "Docker extension" },
];

export default function VisualBuilder({ config, onConfigChange, isOpen, onClose }: VisualBuilderProps) {
  const [draggedItem, setDraggedItem] = useState<DraggableItem | null>(null);
  const [hoveredZone, setHoveredZone] = useState<string | null>(null);

  const handleDragStart = (item: DraggableItem) => {
    setDraggedItem(item);
  };

  const handleDragOver = (e: React.DragEvent, zone: string) => {
    e.preventDefault();
    setHoveredZone(zone);
  };

  const handleDragLeave = () => {
    setHoveredZone(null);
  };

  const handleDrop = useCallback((zone: string) => {
    if (!draggedItem) return;

    const newConfig = { ...config };

    switch (draggedItem.type) {
      case "feature":
        newConfig.features = config.features.map((f: FeatureDef) =>
          f.id === draggedItem.id ? { ...f, on: true } : f
        );
        break;

      case "toolchain":
        newConfig.langs = config.langs.map((l: LangChain) =>
          l.id === draggedItem.id ? { ...l, on: true } : l
        );
        break;

      case "tool":
        newConfig.toolGroups = config.toolGroups.map((g: ToolGroup) =>
          g.id === draggedItem.id ? { ...g, on: true } : g
        );
        break;

      case "port":
        if (!config.ports.includes(draggedItem.id)) {
          newConfig.ports = [...config.ports, draggedItem.id];
        }
        break;

      case "extension":
        const extMap: Record<string, string> = {
          "vscode-eslint": "dbaeumer.vscode-eslint",
          "prettier": "esbenp.prettier-vscode",
          "tailwind": "bradlc.vscode-tailwindcss",
          "docker": "ms-azuretools.vscode-docker",
        };
        const extId = extMap[draggedItem.id];
        if (extId && !config.extensions.includes(extId)) {
          newConfig.extensions = [...config.extensions, extId];
        }
        break;
    }

    onConfigChange(newConfig);
    setDraggedItem(null);
    setHoveredZone(null);
  }, [draggedItem, config, onConfigChange]);

  const removeItem = (type: string, id: string) => {
    const newConfig = { ...config };

    switch (type) {
      case "feature":
        newConfig.features = config.features.map((f: FeatureDef) =>
          f.id === id ? { ...f, on: false } : f
        );
        break;

      case "toolchain":
        newConfig.langs = config.langs.map((l: LangChain) =>
          l.id === id ? { ...l, on: false } : l
        );
        break;

      case "tool":
        newConfig.toolGroups = config.toolGroups.map((g: ToolGroup) =>
          g.id === id ? { ...g, on: false } : g
        );
        break;

      case "port":
        newConfig.ports = config.ports.filter((p: string) => p !== id);
        break;

      case "extension":
        const extMap: Record<string, string> = {
          "vscode-eslint": "dbaeumer.vscode-eslint",
          "prettier": "esbenp.prettier-vscode",
          "tailwind": "bradlc.vscode-tailwindcss",
          "docker": "ms-azuretools.vscode-docker",
        };
        const extId = extMap[id];
        if (extId) {
          newConfig.extensions = config.extensions.filter((e: string) => e !== extId);
        }
        break;
    }

    onConfigChange(newConfig);
  };

  const resetConfig = () => {
    onConfigChange(DEFAULT_CONFIG);
  };

  if (!isOpen) return null;

  const activeFeatures = config.features.filter((f: FeatureDef) => f.on);
  const activeToolchains = config.langs.filter((l: LangChain) => l.on);
  const activeTools = config.toolGroups.filter((g: ToolGroup) => g.on);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-ink-900 border border-ink-700 rounded-xl shadow-2xl w-full max-w-7xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-ink-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
              <span className="text-2xl">🎨</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-mist-100">Visual Configuration Builder</h2>
              <p className="text-sm text-mist-500">Drag and drop to configure your devcontainer</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={resetConfig}
              className="px-4 py-2 bg-ink-800 hover:bg-ink-700 text-mist-300 rounded-lg transition-colors"
            >
              Reset
            </button>
            <button
              onClick={onClose}
              className="text-mist-500 hover:text-mist-100 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Palette */}
          <div className="w-80 border-r border-ink-700 overflow-y-auto p-4 bg-ink-800/50">
            <h3 className="text-sm font-semibold text-mist-300 uppercase tracking-wider mb-4">
              Component Palette
            </h3>
            <div className="space-y-6">
              {["feature", "toolchain", "tool", "port", "extension"].map((type) => (
                <div key={type}>
                  <h4 className="text-xs font-medium text-mist-500 uppercase mb-2">
                    {type}s
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {PALETTE_ITEMS.filter((item) => item.type === type).map((item) => (
                      <div
                        key={item.id}
                        draggable
                        onDragStart={() => handleDragStart(item)}
                        className="p-3 bg-ink-900 border border-ink-700 rounded-lg cursor-move hover:border-blue-500/50 hover:bg-ink-800 transition-all group"
                      >
                        <div className="text-2xl mb-1">{item.icon}</div>
                        <div className="text-xs font-medium text-mist-100 group-hover:text-blue-400">
                          {item.label}
                        </div>
                        <div className="text-[10px] text-mist-600 mt-0.5">
                          {item.description}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Canvas */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-6">
              {/* Features Zone */}
              <div
                onDragOver={(e) => handleDragOver(e, "features")}
                onDragLeave={handleDragLeave}
                onDrop={() => handleDrop("features")}
                className={`border-2 border-dashed rounded-xl p-6 transition-all ${
                  hoveredZone === "features"
                    ? "border-blue-500 bg-blue-500/10"
                    : "border-ink-700 bg-ink-800/30"
                }`}
              >
                <h3 className="text-sm font-semibold text-mist-300 uppercase tracking-wider mb-4">
                  Devcontainer Features ({activeFeatures.length})
                </h3>
                <div className="flex flex-wrap gap-3">
                  {activeFeatures.map((f: FeatureDef) => {
                    const item = PALETTE_ITEMS.find((p) => p.id === f.id);
                    return (
                      <div
                        key={f.id}
                        className="relative p-3 bg-ink-900 border border-lagoon-500/30 rounded-lg group"
                      >
                        <button
                          onClick={() => removeItem("feature", f.id)}
                          className="absolute -top-2 -right-2 w-5 h-5 bg-coral-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs"
                        >
                          ×
                        </button>
                        <div className="text-2xl mb-1">{item?.icon}</div>
                        <div className="text-xs font-medium text-mist-100">{item?.label}</div>
                      </div>
                    );
                  })}
                  {activeFeatures.length === 0 && (
                    <div className="text-sm text-mist-600 italic">
                      Drag features here to enable them
                    </div>
                  )}
                </div>
              </div>

              {/* Toolchains Zone */}
              <div
                onDragOver={(e) => handleDragOver(e, "toolchains")}
                onDragLeave={handleDragLeave}
                onDrop={() => handleDrop("toolchains")}
                className={`border-2 border-dashed rounded-xl p-6 transition-all ${
                  hoveredZone === "toolchains"
                    ? "border-purple-500 bg-purple-500/10"
                    : "border-ink-700 bg-ink-800/30"
                }`}
              >
                <h3 className="text-sm font-semibold text-mist-300 uppercase tracking-wider mb-4">
                  Language Toolchains ({activeToolchains.length})
                </h3>
                <div className="flex flex-wrap gap-3">
                  {activeToolchains.map((l: LangChain) => {
                    const item = PALETTE_ITEMS.find((p) => p.id === l.id);
                    return (
                      <div
                        key={l.id}
                        className="relative p-3 bg-ink-900 border border-purple-500/30 rounded-lg group"
                      >
                        <button
                          onClick={() => removeItem("toolchain", l.id)}
                          className="absolute -top-2 -right-2 w-5 h-5 bg-coral-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs"
                        >
                          ×
                        </button>
                        <div className="text-2xl mb-1">{item?.icon}</div>
                        <div className="text-xs font-medium text-mist-100">{item?.label}</div>
                        <div className="text-[10px] text-mist-600">v{l.version}</div>
                      </div>
                    );
                  })}
                  {activeToolchains.length === 0 && (
                    <div className="text-sm text-mist-600 italic">
                      Drag toolchains here to enable them
                    </div>
                  )}
                </div>
              </div>

              {/* Tools Zone */}
              <div
                onDragOver={(e) => handleDragOver(e, "tools")}
                onDragLeave={handleDragLeave}
                onDrop={() => handleDrop("tools")}
                className={`border-2 border-dashed rounded-xl p-6 transition-all ${
                  hoveredZone === "tools"
                    ? "border-green-500 bg-green-500/10"
                    : "border-ink-700 bg-ink-800/30"
                }`}
              >
                <h3 className="text-sm font-semibold text-mist-300 uppercase tracking-wider mb-4">
                  Essential Tools ({activeTools.length})
                </h3>
                <div className="flex flex-wrap gap-3">
                  {activeTools.map((g: ToolGroup) => {
                    const item = PALETTE_ITEMS.find((p) => p.id === g.id);
                    return (
                      <div
                        key={g.id}
                        className="relative p-3 bg-ink-900 border border-green-500/30 rounded-lg group"
                      >
                        <button
                          onClick={() => removeItem("tool", g.id)}
                          className="absolute -top-2 -right-2 w-5 h-5 bg-coral-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs"
                        >
                          ×
                        </button>
                        <div className="text-2xl mb-1">{item?.icon}</div>
                        <div className="text-xs font-medium text-mist-100">{item?.label}</div>
                        <div className="text-[10px] text-mist-600">{g.pkgs.length} packages</div>
                      </div>
                    );
                  })}
                  {activeTools.length === 0 && (
                    <div className="text-sm text-mist-600 italic">
                      Drag tools here to enable them
                    </div>
                  )}
                </div>
              </div>

              {/* Ports Zone */}
              <div
                onDragOver={(e) => handleDragOver(e, "ports")}
                onDragLeave={handleDragLeave}
                onDrop={() => handleDrop("ports")}
                className={`border-2 border-dashed rounded-xl p-6 transition-all ${
                  hoveredZone === "ports"
                    ? "border-orange-500 bg-orange-500/10"
                    : "border-ink-700 bg-ink-800/30"
                }`}
              >
                <h3 className="text-sm font-semibold text-mist-300 uppercase tracking-wider mb-4">
                  Forwarded Ports ({config.ports.length})
                </h3>
                <div className="flex flex-wrap gap-3">
                  {config.ports.map((port: string) => {
                    const item = PALETTE_ITEMS.find((p) => p.id === port);
                    return (
                      <div
                        key={port}
                        className="relative p-3 bg-ink-900 border border-orange-500/30 rounded-lg group"
                      >
                        <button
                          onClick={() => removeItem("port", port)}
                          className="absolute -top-2 -right-2 w-5 h-5 bg-coral-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs"
                        >
                          ×
                        </button>
                        <div className="text-2xl mb-1">{item?.icon}</div>
                        <div className="text-xs font-medium text-mist-100">:{port}</div>
                        <div className="text-[10px] text-mist-600">{item?.description}</div>
                      </div>
                    );
                  })}
                  {config.ports.length === 0 && (
                    <div className="text-sm text-mist-600 italic">
                      Drag ports here to forward them
                    </div>
                  )}
                </div>
              </div>

              {/* Extensions Zone */}
              <div
                onDragOver={(e) => handleDragOver(e, "extensions")}
                onDragLeave={handleDragLeave}
                onDrop={() => handleDrop("extensions")}
                className={`border-2 border-dashed rounded-xl p-6 transition-all ${
                  hoveredZone === "extensions"
                    ? "border-pink-500 bg-pink-500/10"
                    : "border-ink-700 bg-ink-800/30"
                }`}
              >
                <h3 className="text-sm font-semibold text-mist-300 uppercase tracking-wider mb-4">
                  VS Code Extensions ({config.extensions.length})
                </h3>
                <div className="flex flex-wrap gap-3">
                  {config.extensions.map((ext: string) => {
                    const extId = ext.split(".").pop() || ext;
                    const item = PALETTE_ITEMS.find((p) => p.id === extId);
                    return (
                      <div
                        key={ext}
                        className="relative p-3 bg-ink-900 border border-pink-500/30 rounded-lg group"
                      >
                        <button
                          onClick={() => removeItem("extension", extId)}
                          className="absolute -top-2 -right-2 w-5 h-5 bg-coral-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs"
                        >
                          ×
                        </button>
                        <div className="text-2xl mb-1">{item?.icon || "🔌"}</div>
                        <div className="text-xs font-medium text-mist-100">{item?.label || ext}</div>
                      </div>
                    );
                  })}
                  {config.extensions.length === 0 && (
                    <div className="text-sm text-mist-600 italic">
                      Drag extensions here to install them
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-ink-700 bg-ink-800/50">
          <div className="flex items-center justify-between text-xs text-mist-500">
            <span>💡 Tip: Drag items from the palette to the canvas to configure your devcontainer</span>
            <span>
              {activeFeatures.length + activeToolchains.length + activeTools.length + config.ports.length + config.extensions.length} components configured
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
