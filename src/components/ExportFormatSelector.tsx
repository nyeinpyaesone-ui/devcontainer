import { useState } from "react";
import type { Config } from "../lib/generator";
import { toast } from "../services/toast";

interface ExportFormat {
  id: string;
  name: string;
  extension: string;
  icon: string;
  description: string;
  convert: (config: Config) => string;
}

const exportFormats: ExportFormat[] = [
  {
    id: "json",
    name: "JSON",
    extension: "json",
    icon: "{}",
    description: "Standard JSON format for programmatic use",
    convert: (config) => JSON.stringify(config, null, 2),
  },
  {
    id: "yaml",
    name: "YAML",
    extension: "yaml",
    icon: "---",
    description: "Human-readable YAML format",
    convert: (config) => {
      // Simple YAML conversion (basic implementation)
      const lines: string[] = [];
      lines.push(`# DevContainer Configuration`);
      lines.push(`owner: "${config.owner}"`);
      lines.push(`repo: "${config.repo}"`);
      lines.push(`tag: "${config.tag}"`);
      lines.push(`base: "${config.base}"`);
      lines.push(`shell: "${config.shell}"`);
      lines.push(`remoteUser: "${config.remoteUser}"`);
      lines.push(`clone: "${config.clone}"`);
      lines.push(`namedVolume: ${config.namedVolume}`);
      lines.push(`smokeTest: ${config.smokeTest}`);
      lines.push(`aptExtra: "${config.aptExtra}"`);
      lines.push(``);
      lines.push(`ports:`);
      config.ports.forEach((port) => lines.push(`  - "${port}"`));
      lines.push(``);
      lines.push(`extensions:`);
      config.extensions.forEach((ext) => lines.push(`  - "${ext}"`));
      lines.push(``);
      lines.push(`features:`);
      config.features.forEach((f) => {
        lines.push(`  - id: "${f.id}"`);
        lines.push(`    label: "${f.label}"`);
        lines.push(`    on: ${f.on}`);
        if (f.version) lines.push(`    version: "${f.version}"`);
      });
      lines.push(``);
      lines.push(`langs:`);
      config.langs.forEach((l) => {
        lines.push(`  - id: "${l.id}"`);
        lines.push(`    label: "${l.label}"`);
        lines.push(`    on: ${l.on}`);
        lines.push(`    version: "${l.version}"`);
      });
      lines.push(``);
      lines.push(`toolGroups:`);
      config.toolGroups.forEach((g) => {
        lines.push(`  - id: "${g.id}"`);
        lines.push(`    label: "${g.label}"`);
        lines.push(`    on: ${g.on}`);
      });
      lines.push(``);
      lines.push(`enforce:`);
      lines.push(`  nonRoot: ${config.enforce.nonRoot}`);
      lines.push(`  engines: ${config.enforce.engines}`);
      lines.push(`  secretsGuard: ${config.enforce.secretsGuard}`);
      lines.push(`  preCommit: ${config.enforce.preCommit}`);
      lines.push(`  schemaGate: ${config.enforce.schemaGate}`);
      lines.push(``);
      lines.push(`git:`);
      lines.push(`  protocolV2: ${config.git.protocolV2}`);
      lines.push(`  commitGraph: ${config.git.commitGraph}`);
      lines.push(`  maintenance: ${config.git.maintenance}`);
      lines.push(`  sshSign: ${config.git.sshSign}`);
      lines.push(`  bundle: ${config.git.bundle}`);
      return lines.join("\n");
    },
  },
  {
    id: "markdown",
    name: "Markdown",
    extension: "md",
    icon: "MD",
    description: "Documentation-friendly Markdown format",
    convert: (config) => {
      const lines: string[] = [];
      lines.push(`# DevContainer Configuration`);
      lines.push(``);
      lines.push(`## Repository`);
      lines.push(`- **Owner**: ${config.owner}`);
      lines.push(`- **Repository**: ${config.repo}`);
      lines.push(`- **Tag**: ${config.tag}`);
      lines.push(``);
      lines.push(`## Base Configuration`);
      lines.push(`- **Base Image**: ${config.base}`);
      lines.push(`- **Shell**: ${config.shell}`);
      lines.push(`- **Remote User**: ${config.remoteUser}`);
      lines.push(`- **Clone Strategy**: ${config.clone}`);
      lines.push(`- **Named Volume**: ${config.namedVolume ? "Yes" : "No"}`);
      lines.push(`- **Smoke Test**: ${config.smokeTest ? "Yes" : "No"}`);
      lines.push(``);
      lines.push(`## Ports`);
      if (config.ports.length > 0) {
        config.ports.forEach((port) => lines.push(`- ${port}`));
      } else {
        lines.push(`_No ports configured_`);
      }
      lines.push(``);
      lines.push(`## Extensions`);
      if (config.extensions.length > 0) {
        config.extensions.forEach((ext) => lines.push(`- ${ext}`));
      } else {
        lines.push(`_No extensions configured_`);
      }
      lines.push(``);
      lines.push(`## Features`);
      const activeFeatures = config.features.filter((f) => f.on);
      if (activeFeatures.length > 0) {
        activeFeatures.forEach((f) => {
          const version = f.version ? ` (v${f.version})` : "";
          lines.push(`- **${f.label}**${version}`);
        });
      } else {
        lines.push(`_No features enabled_`);
      }
      lines.push(``);
      lines.push(`## Language Toolchains`);
      const activeLangs = config.langs.filter((l) => l.on);
      if (activeLangs.length > 0) {
        activeLangs.forEach((l) => lines.push(`- **${l.label}** v${l.version}`));
      } else {
        lines.push(`_No toolchains configured_`);
      }
      lines.push(``);
      lines.push(`## Essential Tooling`);
      const activeGroups = config.toolGroups.filter((g) => g.on);
      if (activeGroups.length > 0) {
        activeGroups.forEach((g) => lines.push(`- **${g.label}**: ${g.desc}`));
      } else {
        lines.push(`_No tool groups enabled_`);
      }
      lines.push(``);
      lines.push(`## Additional Packages`);
      lines.push(config.aptExtra || `_No additional packages_`);
      lines.push(``);
      lines.push(`## Policies`);
      lines.push(`- **Non-root execution**: ${config.enforce.nonRoot ? "✅ Enabled" : "❌ Disabled"}`);
      lines.push(`- **Runtime pinning**: ${config.enforce.engines ? "✅ Enabled" : "❌ Disabled"}`);
      lines.push(`- **Secret hygiene**: ${config.enforce.secretsGuard ? "✅ Enabled" : "❌ Disabled"}`);
      lines.push(`- **Pre-commit hooks**: ${config.enforce.preCommit ? "✅ Enabled" : "❌ Disabled"}`);
      lines.push(`- **Schema validation**: ${config.enforce.schemaGate ? "✅ Enabled" : "❌ Disabled"}`);
      lines.push(``);
      lines.push(`## Git Optimizations`);
      lines.push(`- **Protocol v2**: ${config.git.protocolV2 ? "✅ Enabled" : "❌ Disabled"}`);
      lines.push(`- **Commit graph**: ${config.git.commitGraph ? "✅ Enabled" : "❌ Disabled"}`);
      lines.push(`- **Maintenance**: ${config.git.maintenance ? "✅ Enabled" : "❌ Disabled"}`);
      lines.push(`- **SSH signing**: ${config.git.sshSign ? "✅ Enabled" : "❌ Disabled"}`);
      lines.push(`- **Bundle**: ${config.git.bundle ? "✅ Enabled" : "❌ Disabled"}`);
      return lines.join("\n");
    },
  },
  {
    id: "toml",
    name: "TOML",
    extension: "toml",
    icon: "TOML",
    description: "TOML format for Rust/Go projects",
    convert: (config) => {
      const lines: string[] = [];
      lines.push(`# DevContainer Configuration`);
      lines.push(``);
      lines.push(`[repository]`);
      lines.push(`owner = "${config.owner}"`);
      lines.push(`repo = "${config.repo}"`);
      lines.push(`tag = "${config.tag}"`);
      lines.push(``);
      lines.push(`[base]`);
      lines.push(`image = "${config.base}"`);
      lines.push(`shell = "${config.shell}"`);
      lines.push(`remoteUser = "${config.remoteUser}"`);
      lines.push(`clone = "${config.clone}"`);
      lines.push(`namedVolume = ${config.namedVolume}`);
      lines.push(`smokeTest = ${config.smokeTest}`);
      lines.push(`aptExtra = "${config.aptExtra}"`);
      lines.push(``);
      lines.push(`ports = [${config.ports.map((p) => `"${p}"`).join(", ")}]`);
      lines.push(`extensions = [${config.extensions.map((e) => `"${e}"`).join(", ")}]`);
      lines.push(``);
      lines.push(`[enforce]`);
      lines.push(`nonRoot = ${config.enforce.nonRoot}`);
      lines.push(`engines = ${config.enforce.engines}`);
      lines.push(`secretsGuard = ${config.enforce.secretsGuard}`);
      lines.push(`preCommit = ${config.enforce.preCommit}`);
      lines.push(`schemaGate = ${config.enforce.schemaGate}`);
      lines.push(``);
      lines.push(`[git]`);
      lines.push(`protocolV2 = ${config.git.protocolV2}`);
      lines.push(`commitGraph = ${config.git.commitGraph}`);
      lines.push(`maintenance = ${config.git.maintenance}`);
      lines.push(`sshSign = ${config.git.sshSign}`);
      lines.push(`bundle = ${config.git.bundle}`);
      return lines.join("\n");
    },
  },
];

interface ExportFormatSelectorProps {
  config: Config;
}

export default function ExportFormatSelector({ config }: ExportFormatSelectorProps) {
  const [selectedFormat, setSelectedFormat] = useState<string>("json");
  const [preview, setPreview] = useState<string>("");

  const handleFormatChange = (formatId: string) => {
    setSelectedFormat(formatId);
    const format = exportFormats.find((f) => f.id === formatId);
    if (format) {
      setPreview(format.convert(config));
    }
  };

  const handleExport = () => {
    const format = exportFormats.find((f) => f.id === selectedFormat);
    if (!format) return;

    const content = format.convert(config);
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `devcontainer-config.${format.extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast(`Configuration exported as ${format.name}`);
  };

  const handleCopy = async () => {
    const format = exportFormats.find((f) => f.id === selectedFormat);
    if (!format) return;

    const content = format.convert(config);
    try {
      await navigator.clipboard.writeText(content);
      toast(`${format.name} configuration copied to clipboard`);
    } catch (err) {
      toast("Failed to copy to clipboard");
    }
  };

  return (
    <div className="bg-ink-900 border border-ink-700 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-mist-100 mb-4">Export Configuration</h3>

      {/* Format Selection */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {exportFormats.map((format) => (
          <button
            key={format.id}
            onClick={() => handleFormatChange(format.id)}
            className={`p-4 rounded-lg border transition-all ${
              selectedFormat === format.id
                ? "border-ember-500 bg-ember-500/10"
                : "border-ink-700 bg-ink-800 hover:border-ink-600"
            }`}
          >
            <div className="text-2xl font-bold text-mist-100 mb-2">{format.icon}</div>
            <div className="text-sm font-medium text-mist-100">{format.name}</div>
            <div className="text-xs text-mist-500 mt-1">{format.description}</div>
          </button>
        ))}
      </div>

      {/* Preview */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-mist-300">Preview</label>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 text-sm bg-ink-800 hover:bg-ink-700 text-mist-300 rounded-lg transition-colors"
            >
              Copy
            </button>
            <button
              onClick={handleExport}
              className="px-3 py-1.5 text-sm bg-ember-500 hover:bg-ember-600 text-ink-950 rounded-lg transition-colors font-medium"
            >
              Export
            </button>
          </div>
        </div>
        <div className="bg-ink-950 border border-ink-700 rounded-lg p-4 max-h-96 overflow-y-auto">
          <pre className="text-sm text-mist-300 font-mono whitespace-pre-wrap">
            {preview || "Select a format to preview"}
          </pre>
        </div>
      </div>

      {/* Format Info */}
      <div className="bg-ink-800 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-ember-500/20 flex items-center justify-center">
            <span className="text-sm font-bold text-ember-400">
              {exportFormats.find((f) => f.id === selectedFormat)?.icon}
            </span>
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium text-mist-100 mb-1">
              {exportFormats.find((f) => f.id === selectedFormat)?.name} Format
            </div>
            <div className="text-xs text-mist-500">
              {exportFormats.find((f) => f.id === selectedFormat)?.description}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
