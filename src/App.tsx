import { useEffect, useMemo, useRef, useState } from "react";
import ChangelogModal from "./components/ChangelogModal";
import CodePanel, { type FileTab } from "./components/CodePanel";
import CommandPalette, { type PaletteGroup } from "./components/CommandPalette";
import DryRunModal from "./components/DryRunModal";
import LayerStack from "./components/LayerStack";
import OnboardingTour from "./components/OnboardingTour";
import PerfDashboard from "./components/PerfDashboard";
import PolicyMatrix from "./components/PolicyMatrix";
import ShortcutsModal from "./components/ShortcutsModal";
import TemplatePicker from "./components/TemplatePicker";
import Toasts from "./components/Toasts";
import {
  ChipInput,
  CountUp,
  Gauge,
  IconCopy,
  IconDownload,
  IconPlay,
  IconReset,
  Kbd,
  LogoMark,
  Reveal,
  Section,
  Select,
  Sparkline,
  Switch,
  TextField,
} from "./components/ui";
import { copyText } from "./services/clipboard";
import { downloadFile } from "./services/downloads";
import { toast } from "./services/toast";
import {
  activeFeatures,
  bootstrapLine,
  byteSize,
  clearConfig,
  DEFAULT_CONFIG,
  essentialPkgs,
  formatDuration,
  hasViolation,
  imageRef,
  loadConfig,
  policyMatrix,
  readiness,
  saveConfig,
  shortHash,
  type Config,
  type Enforcement,
} from "./lib/generator";
import { useForgeBackend } from "./lib/useForgeBackend";
import { useTheme } from "./hooks/useTheme";
import { usePerformanceMetrics } from "./hooks/usePerformanceMetrics";
import { templates, type Template } from "./lib/templates";

export default function App() {
  const [boot] = useState(loadConfig);
  const [cfg, setCfg] = useState<Config>(boot.cfg);
  const [tab, setTab] = useState(0);
  const [showRun, setShowRun] = useState(false);
  const [verified, setVerified] = useState(false);
  const [runFailed, setRunFailed] = useState(false);
  const [scriptCopied, setScriptCopied] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const [templatePickerOpen, setTemplatePickerOpen] = useState(false);
  const [changelogOpen, setChangelogOpen] = useState(false);
  const [perfDashboardOpen, setPerfDashboardOpen] = useState(false);
  const announcedRestore = useRef(false);
  const announcedOnboarding = useRef(false);

  const { theme, toggle: toggleTheme } = useTheme();
  const { metrics, recordGeneration } = usePerformanceMetrics();

  const backend = useForgeBackend(cfg);
  const { bundle, status, ms, cacheHits, workerOk, times } = backend;
  const arts = bundle.arts;
  const runLines = bundle.runLines;
  const img = imageRef(cfg);
  const feats = activeFeatures(cfg);
  const est = bundle.estSeconds;

  useEffect(() => {
    if (boot.restored && !announcedRestore.current) {
      announcedRestore.current = true;
      toast("manifest restored from last session");
    }
  }, []);

  // Auto-show onboarding for first-time users
  useEffect(() => {
    if (!boot.restored && !announcedOnboarding.current) {
      announcedOnboarding.current = true;
      const hasSeenTour = localStorage.getItem("forge.onboarding.seen");
      if (!hasSeenTour) {
        setTimeout(() => setOnboardingOpen(true), 800);
      }
    }
  }, []);

  // Record performance metrics on generation
  useEffect(() => {
    if (ms > 0) {
      const bytesGenerated = arts.setup.length + arts.json.length + arts.dockerfile.length + arts.workflow.length + arts.quickstart.length;
      const cacheHit = cacheHits > 0;
      recordGeneration(ms, bytesGenerated, cacheHit);
    }
  }, [ms, arts, cacheHits, recordGeneration]);

  // Mark onboarding as seen when closed
  useEffect(() => {
    if (!onboardingOpen && announcedOnboarding.current) {
      localStorage.setItem("forge.onboarding.seen", "true");
    }
  }, [onboardingOpen]);

  useEffect(() => {
    saveConfig(cfg);
  }, [cfg]);

  const patch = (p: Partial<Config>) => {
    setCfg((c) => ({ ...c, ...p }));
    setVerified(false);
    setRunFailed(false);
  };

  const patchEnforce = (key: keyof Enforcement, v: boolean) => {
    setCfg((c) => ({ ...c, enforce: { ...c.enforce, [key]: v } }));
    setVerified(false);
    setRunFailed(false);
  };

  const patchToolGroup = (id: string, v: boolean) => {
    setCfg((c) => ({
      ...c,
      toolGroups: c.toolGroups.map((g) => (g.id === id ? { ...g, on: v } : g)),
    }));
    setVerified(false);
    setRunFailed(false);
  };

  const patchLang = (id: string, p: Partial<{ on: boolean; version: string }>) => {
    setCfg((c) => ({
      ...c,
      langs: c.langs.map((l) => (l.id === id ? { ...l, ...p } : l)),
    }));
    setVerified(false);
    setRunFailed(false);
  };

  // ── export/import manifest ─────────────────────────────────────────────
  const exportManifest = () => {
    const json = JSON.stringify(cfg, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${cfg.owner}-${cfg.repo}-manifest.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 800);
    toast("manifest exported");
  };

  const importManifest = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const imported = JSON.parse(ev.target?.result as string) as Config;
          setCfg(imported);
          saveConfig(imported);
          setVerified(false);
          setRunFailed(false);
          toast("manifest imported");
        } catch {
          toast("invalid manifest file");
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  // ── share URL ──────────────────────────────────────────────────────────
  const shareURL = () => {
    const encoded = btoa(JSON.stringify(cfg));
    const url = `${window.location.origin}${window.location.pathname}#config=${encoded}`;
    navigator.clipboard.writeText(url);
    toast("share URL copied to clipboard");
  };

  // load from URL hash on mount
  useEffect(() => {
    const hash = window.location.hash;
    if (hash.startsWith("#config=")) {
      try {
        const encoded = hash.slice(8);
        const decoded = JSON.parse(atob(encoded)) as Config;
        setCfg(decoded);
        saveConfig(decoded);
        toast("manifest loaded from share URL");
      } catch {
        toast("invalid share URL");
      }
    }
  }, []);

  const essCount = bundle.essentialCount;
  const policies = bundle.policies;
  const enforcedCount = bundle.enforcedCount;
  const ready = readiness(cfg);

  const files: FileTab[] = [
    { name: "setup-env.sh", lang: "bash", badge: "sh", content: arts.setup },
    { name: "devcontainer.json", lang: "json", badge: "json", content: arts.json },
    { name: "Dockerfile", lang: "dockerfile", badge: "docker", content: arts.dockerfile },
    { name: "validate-devcontainer.yml", lang: "yaml", badge: "ci", content: arts.workflow },
    { name: "quickstart.sh", lang: "bash", badge: "sh", content: arts.quickstart },
  ];

  const copyScript = async () => {
    if (await copyText(arts.setup)) {
      setScriptCopied(true);
      window.setTimeout(() => setScriptCopied(false), 1800);
      toast("setup-env.sh copied to clipboard");
    } else toast("Clipboard unavailable in this browser");
  };

  const downloadAll = () => {
    downloadFile("setup-env.sh", arts.setup);
    window.setTimeout(() => downloadFile("devcontainer.json", arts.json), 260);
    window.setTimeout(() => downloadFile("Dockerfile", arts.dockerfile), 520);
    window.setTimeout(() => downloadFile("validate-devcontainer.yml", arts.workflow), 780);
    window.setTimeout(() => downloadFile("quickstart.sh", arts.quickstart), 1040);
    toast("5 artifacts downloaded");
  };

  const applyTemplate = (template: Template) => {
    setCfg((c) => ({ ...c, ...template.config }));
    saveConfig({ ...cfg, ...template.config });
    toast(`template "${template.name}" applied`);
  };

  const keyHandler = useRef<(e: KeyboardEvent) => void>(() => {});
  keyHandler.current = (e) => {
    // "?" opens shortcuts help (no modifier needed)
    if (e.key === "?" && !e.metaKey && !e.ctrlKey && !e.altKey) {
      const target = e.target as HTMLElement;
      const isInput = target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable;
      if (!isInput) {
        e.preventDefault();
        setShortcutsOpen(true);
        return;
      }
    }

    const mod = e.metaKey || e.ctrlKey;
    if (!mod) return;
    if (e.key.toLowerCase() === "k") {
      e.preventDefault();
      setPaletteOpen((p) => !p);
      return;
    }
    if (/^[1-5]$/.test(e.key)) {
      e.preventDefault();
      setTab(Number(e.key) - 1);
    } else if (e.key.toLowerCase() === "s") {
      e.preventDefault();
      downloadAll();
    } else if (e.key === "Enter") {
      e.preventDefault();
      setShowRun(true);
    }
  };
  useEffect(() => {
    const h = (e: KeyboardEvent) => keyHandler.current(e);
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  const goTo = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

  const commands = useMemo<PaletteGroup[]>(() => {
    const jump = (label: string, id: string, kw: string) => ({
      id: `go-${id}`,
      label: `jump to ${label}`,
      keywords: kw,
      run: () => goTo(id),
    });
    return [
      {
        title: "artifacts",
        items: files.map((f, i) => ({
          id: `open-${f.name}`,
          label: `open ${f.name}`,
          hint: `editor tab ${i + 1}`,
          kbd: `⌘+${i + 1}`,
          keywords: "tab file editor view",
          run: () => {
            setTab(i);
            goTo("artifacts");
          },
        })),
      },
      {
        title: "actions",
        items: [
          { id: "act-dry", label: "simulate dry-run", kbd: "⌘+⏎", keywords: "verify terminal run test", run: () => setShowRun(true) },
          { id: "act-copy", label: "copy setup-env.sh", keywords: "clipboard script bash", run: () => void copyScript() },
          { id: "act-dl", label: "download all artifacts", kbd: "⌘+S", keywords: "save export ship", run: downloadAll },
          {
            id: "act-reset",
            label: "reset manifest to defaults",
            keywords: "clear fresh start undo",
            run: () => {
              clearConfig();
              setCfg(DEFAULT_CONFIG);
              setVerified(false);
              setRunFailed(false);
              toast("manifest reset to defaults");
            },
          },
        ],
      },
      {
        title: "jump to",
        items: [
          jump("target registry", "sec-registry", "ghcr image owner repo tag"),
          jump("base environment", "sec-base", "shell user clone volume smoke"),
          jump("devcontainer features", "sec-features", "node python dind git gh pnpm"),
          jump("essential tooling", "sec-tools", "packages apt groups core build shell"),
          jump("language toolchains", "sec-langs", "rust go java dotnet php ruby pyenv"),
          jump("network", "sec-network", "ports forward localhost"),
          jump("editor & bootstrap", "sec-editor", "extensions vscode post-create pipeline"),
          jump("enforcement", "sec-enforce", "policy gates P1 P2 P3 P4 P5"),
          jump("image anatomy", "sec-anatomy", "layers size mb docker"),
          jump("ship readiness", "sec-summary", "score gauge verdict"),
        ],
      },
    ];
  }, [files, cfg]);

  return (
    <div className="min-h-screen flex flex-col">
      <div className="bg-forge" aria-hidden />

      <header className="sticky top-0 z-40 border-b border-ink-700/70 bg-ink-950/85 backdrop-blur-md">
        <div className="max-w-[1480px] mx-auto px-4 sm:px-6 h-[60px] flex items-center gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <LogoMark className="w-9 h-9 shrink-0" />
            <div className="leading-tight min-w-0">
              <div className="font-display font-bold tracking-[0.04em] text-[15px] text-mist-100 whitespace-nowrap">
                DEVCONTAINER <span className="text-ember-500">FORGE</span>
                <span className="ml-2 text-[9px] font-mono font-normal text-mist-600 bg-ink-800 px-1.5 py-0.5 rounded border border-ink-700">
                  v1.8.0
                </span>
              </div>
              <div className="font-mono text-[10.5px] text-mist-600 truncate">
                ghcr env setup · {cfg.owner}/{cfg.repo}
              </div>
            </div>
          </div>

          {/* Utility buttons */}
          <div className="hidden lg:flex items-center gap-1.5">
            <button
              type="button"
              onClick={exportManifest}
              title="Export manifest as JSON"
              className="grid place-items-center w-8 h-8 rounded-lg border border-ink-700 bg-ink-900/60 text-mist-500 transition-all hover:border-skyx-400/50 hover:text-skyx-400 active:scale-95"
            >
              <svg viewBox="0 0 16 16" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M8 2v8m0 0 3-3M8 10 5 7M3 13.5h10" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              type="button"
              onClick={importManifest}
              title="Import manifest from JSON"
              className="grid place-items-center w-8 h-8 rounded-lg border border-ink-700 bg-ink-900/60 text-mist-500 transition-all hover:border-lagoon-500/50 hover:text-lagoon-400 active:scale-95"
            >
              <svg viewBox="0 0 16 16" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M8 10V2m0 0 3 3M8 2 5 5M3 13.5h10" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              type="button"
              onClick={shareURL}
              title="Copy shareable URL"
              className="grid place-items-center w-8 h-8 rounded-lg border border-ink-700 bg-ink-900/60 text-mist-500 transition-all hover:border-ember-500/50 hover:text-ember-400 active:scale-95"
            >
              <svg viewBox="0 0 16 16" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M6.5 9.5 9.5 6.5M6 11.5a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.5M10 4.5a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => setShortcutsOpen(true)}
              title="Keyboard shortcuts"
              className="grid place-items-center w-8 h-8 rounded-lg border border-ink-700 bg-ink-900/60 text-mist-500 transition-all hover:border-mist-500/50 hover:text-mist-300 active:scale-95"
            >
              <Kbd>?</Kbd>
            </button>
            <button
              type="button"
              onClick={() => setTemplatePickerOpen(true)}
              title="Start from template"
              className="grid place-items-center w-8 h-8 rounded-lg border border-ink-700 bg-ink-900/60 text-mist-500 transition-all hover:border-coral-500/50 hover:text-coral-400 active:scale-95"
            >
              <svg viewBox="0 0 16 16" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="2" y="2" width="5" height="5" rx="0.5" />
                <rect x="9" y="2" width="5" height="5" rx="0.5" />
                <rect x="2" y="9" width="5" height="5" rx="0.5" />
                <rect x="9" y="9" width="5" height="5" rx="0.5" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => setChangelogOpen(true)}
              title="Changelog"
              className="grid place-items-center w-8 h-8 rounded-lg border border-ink-700 bg-ink-900/60 text-mist-500 transition-all hover:border-lagoon-500/50 hover:text-lagoon-400 active:scale-95"
            >
              <svg viewBox="0 0 16 16" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M8 2v12M4 6l4-4 4 4M4 10l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => setPerfDashboardOpen(true)}
              title="Performance analytics"
              className="grid place-items-center w-8 h-8 rounded-lg border border-ink-700 bg-ink-900/60 text-mist-500 transition-all hover:border-skyx-400/50 hover:text-skyx-400 active:scale-95"
            >
              <svg viewBox="0 0 16 16" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M2 12L6 8l3 3 5-7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => setOnboardingOpen(true)}
              title="Interactive tour"
              className="grid place-items-center w-8 h-8 rounded-lg border border-ink-700 bg-ink-900/60 text-mist-500 transition-all hover:border-ember-500/50 hover:text-ember-400 active:scale-95"
            >
              <svg viewBox="0 0 16 16" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="8" cy="8" r="6" />
                <path d="M8 5v3l2 2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              type="button"
              onClick={toggleTheme}
              title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
              className="grid place-items-center w-8 h-8 rounded-lg border border-ink-700 bg-ink-900/60 text-mist-500 transition-all hover:border-mist-500/50 hover:text-mist-300 active:scale-95"
            >
              {theme === "dark" ? (
                <svg viewBox="0 0 16 16" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="8" cy="8" r="4" />
                  <path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.5 3.5l1.5 1.5M11 11l1.5 1.5M3.5 12.5l1.5-1.5M11 5l1.5-1.5" strokeLinecap="round" />
                </svg>
              ) : (
                <svg viewBox="0 0 16 16" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M14 9.5A6.5 6.5 0 0 1 6.5 2 5.5 5.5 0 1 0 14 9.5z" />
                </svg>
              )}
            </button>
          </div>

          <div className="ml-auto flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setPaletteOpen(true)}
              title="open command palette"
              className="hidden md:flex items-center gap-2 rounded-lg border border-ink-600 bg-ink-900/60 px-2.5 py-1.5 font-mono text-[10.5px] text-mist-500 transition-all duration-200 hover:border-ember-500/50 hover:text-ember-300 active:scale-95"
            >
              <svg viewBox="0 0 16 16" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M6 3 3 8l3 5M10 3l3 5-3 5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              commands
              <Kbd>⌘K</Kbd>
            </button>
            <span
              className={`hidden sm:flex items-center gap-2 font-mono text-[10.5px] px-2.5 py-1.5 rounded-lg border ${
                verified
                  ? "border-lagoon-500/40 text-lagoon-300 bg-lagoon-500/[0.07]"
                  : runFailed
                    ? "border-coral-500/45 text-coral-400 bg-coral-500/[0.07]"
                    : "border-ink-600 text-mist-500 bg-ink-900/60"
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  verified
                    ? "bg-lagoon-400 led-live"
                    : runFailed
                      ? "bg-coral-500 violation-pulse"
                      : "bg-ember-500/80"
                }`}
              />
              {verified ? "dry-run passed" : runFailed ? "dry-run failed" : "unverified"}
            </span>
            <span
              title={workerOk ? "forge worker backend" : "worker unavailable"}
              className={`hidden md:flex items-center gap-2 font-mono text-[10.5px] px-2.5 py-1.5 rounded-lg border transition-colors ${
                status === "compiling"
                  ? "border-skyx-400/45 text-skyx-300 bg-skyx-400/[0.07]"
                  : "border-ink-600 text-mist-500 bg-ink-900/60"
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  status === "compiling"
                    ? "bg-skyx-400 led-live"
                    : workerOk
                      ? "bg-lagoon-400"
                      : "bg-ember-500/80"
                }`}
              />
              {status === "compiling" ? "compiling…" : workerOk ? "worker" : "main"}
              <span className="text-mist-600 tabular-nums">
                {ms > 0.05 ? `${ms.toFixed(1)}ms` : "cached"} · {cacheHits} hits
              </span>
              <Sparkline values={times} className="w-14 h-4 text-lagoon-400" />
            </span>
            <button
              type="button"
              onClick={() => setShowRun(true)}
              className="flex items-center gap-2 rounded-lg border border-lagoon-500/40 bg-lagoon-500/[0.08] px-3.5 py-2 text-[12.5px] font-semibold text-lagoon-300 transition-all hover:bg-lagoon-500/[0.16] hover:border-lagoon-400/60 active:scale-95"
            >
              <IconPlay className="w-3 h-3" />
              <span className="hidden sm:inline">dry-run</span>
            </button>
            <button
              type="button"
              onClick={downloadAll}
              className="flex items-center gap-2 rounded-lg border border-ink-600 px-3.5 py-2 text-[12.5px] font-semibold text-mist-300 transition-all hover:border-skyx-400/50 hover:text-skyx-400 active:scale-95"
            >
              <IconDownload className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">download all</span>
            </button>
            <button
              type="button"
              onClick={copyScript}
              className="flex items-center gap-2 rounded-lg bg-ember-500 px-3.5 py-2 text-[12.5px] font-bold text-ink-950 shadow-[0_6px_24px_-8px_rgba(245,168,60,0.55)] transition-all hover:bg-ember-400 active:scale-95"
            >
              {scriptCopied ? (
                <svg viewBox="0 0 16 16" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 8.5 6.5 12 13 4.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (
                <IconCopy className="w-3.5 h-3.5" />
              )}
              <span className="hidden sm:inline">{scriptCopied ? "copied" : "copy script"}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-[1480px] mx-auto px-4 sm:px-6 py-6 grid gap-6 lg:grid-cols-[396px_1fr] items-start">
        <div className="space-y-4">
          <Reveal>
            <div className="flex items-center justify-between">
              <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-mist-600">
                environment manifest
              </p>
              <button
                type="button"
                onClick={() => {
                  clearConfig();
                  setCfg(DEFAULT_CONFIG);
                  setVerified(false);
                  setRunFailed(false);
                  toast("config reset to forge defaults");
                }}
                className="flex items-center gap-1.5 font-mono text-[11px] text-mist-600 hover:text-ember-400 transition-colors"
              >
                <IconReset className="w-3 h-3" />
                reset
              </button>
            </div>
          </Reveal>

          <Reveal delay={40}>
            <Section index="01" title="Target registry" hint="ghcr.io" anchor="sec-registry">
              <div className="grid grid-cols-2 gap-3">
                <TextField label="owner / org" value={cfg.owner} onChange={(v) => patch({ owner: v })} />
                <TextField label="repository" value={cfg.repo} onChange={(v) => patch({ repo: v })} />
              </div>
              <TextField
                label="image tag"
                value={cfg.tag}
                onChange={(v) => patch({ tag: v })}
                placeholder="latest"
              />
              <div className="rounded-lg border border-ember-500/25 bg-ember-500/[0.05] px-3 py-2.5 flex items-center gap-2 overflow-hidden">
                <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-ember-500/90 shrink-0">
                  ref
                </span>
                <code key={img} className="stat-flash font-mono text-[12.5px] text-ember-300 truncate">
                  {img}
                </code>
              </div>
            </Section>
          </Reveal>

          <Reveal delay={80}>
            <Section index="02" title="Base environment" hint={cfg.base} anchor="sec-base">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="block text-[10.5px] uppercase tracking-[0.14em] text-mist-600 font-mono mb-1.5">
                    base image
                  </span>
                  <Select
                    ariaLabel="base image"
                    value={cfg.base}
                    onChange={(v) => patch({ base: v })}
                    options={[
                      { value: "ubuntu-24.04", label: "ubuntu-24.04" },
                      { value: "debian-12", label: "debian-12" },
                      { value: "alpine-3.20", label: "alpine-3.20" },
                    ]}
                  />
                </div>
                <div>
                  <span className="block text-[10.5px] uppercase tracking-[0.14em] text-mist-600 font-mono mb-1.5">
                    shell
                  </span>
                  <Select
                    ariaLabel="shell"
                    value={cfg.shell}
                    onChange={(v) => patch({ shell: v as Config["shell"] })}
                    options={[
                      { value: "zsh", label: "zsh + oh-my" },
                      { value: "bash", label: "bash" },
                    ]}
                  />
                </div>
              </div>
              {hasViolation(cfg) && (
                <div className="rounded-lg border border-coral-500/45 bg-coral-500/[0.07] px-3 py-2.5 text-[12px] text-coral-400 leading-relaxed">
                  <span className="font-mono text-[9.5px] uppercase tracking-[0.16em] mr-2 align-middle border border-coral-500/40 rounded px-1.5 py-0.5">
                    P1 violation
                  </span>
                  remoteUser=root — the generated script will{" "}
                  <span className="font-semibold">exit 1</span> and the CI gate will fail.
                </div>
              )}
              <Switch
                on={cfg.clone !== "off"}
                onChange={(v) => patch({ clone: v ? "shallow" : "off" })}
                label="git clone the repo during setup"
                desc={`Shallow clone into ./${cfg.repo} — off means an existing workspace is required`}
              />
              <Switch
                on={cfg.namedVolume}
                onChange={(v) => patch({ namedVolume: v })}
                label="Named volume for node_modules"
                desc="Keeps deps outside the bind mount — rebuilds stay fast"
              />
              <Switch
                on={cfg.smokeTest}
                onChange={(v) => patch({ smokeTest: v })}
                label="Smoke-test image after pull"
                desc="docker run --rm … sh -lc entrypoint check in setup step"
              />
            </Section>
          </Reveal>

          <Reveal delay={120}>
            <Section index="03" title="Devcontainer features" hint={`${feats.length} active`} anchor="sec-features">
              <div className="space-y-2">
                {cfg.features.map((f) => (
                  <Switch
                    key={f.id}
                    on={f.on}
                    onChange={(v) =>
                      patch({
                        features: cfg.features.map((x) => (x.id === f.id ? { ...x, on: v } : x)),
                      })
                    }
                    label={f.label}
                    desc={f.desc}
                    right={
                      f.versions && f.on ? (
                        <span className="w-[86px] shrink-0" onClick={(e) => e.stopPropagation()}>
                          <Select
                            ariaLabel={`${f.label} version`}
                            value={f.version ?? f.versions[0]}
                            onChange={(v) =>
                              patch({
                                features: cfg.features.map((x) =>
                                  x.id === f.id ? { ...x, version: v } : x
                                ),
                              })
                            }
                            options={f.versions.map((v) => ({ value: v, label: `v${v}` }))}
                          />
                        </span>
                      ) : undefined
                    }
                  />
                ))}
              </div>
            </Section>
          </Reveal>

          <Reveal delay={140}>
            <Section
              index="04"
              title="Essential tooling"
              hint={`${essCount} pkgs pre-installed`}
              anchor="sec-tools"
            >
              <div className="space-y-2">
                {cfg.toolGroups.map((g) => (
                  <Switch
                    key={g.id}
                    on={g.on}
                    onChange={(v) => patchToolGroup(g.id, v)}
                    label={g.label}
                    desc={g.desc}
                    right={
                      <span
                        className={`shrink-0 font-mono text-[10px] px-2 py-1 rounded-md border transition-colors ${
                          g.on
                            ? "border-lagoon-500/40 text-lagoon-300 bg-lagoon-500/[0.08]"
                            : "border-ink-600 text-mist-600"
                        }`}
                      >
                        {g.pkgs.length} pkgs
                      </span>
                    }
                  />
                ))}
              </div>
              {essCount > 0 && (
                <div className="flex flex-wrap gap-1.5 rounded-lg border border-ink-700/70 bg-ink-950/50 px-3 py-2.5">
                  {essentialPkgs(cfg).map((p) => (
                    <code
                      key={p}
                      className="chip-in font-mono text-[10.5px] text-mist-300 bg-ink-800/80 border border-ink-700/80 rounded px-1.5 py-0.5"
                    >
                      {p}
                    </code>
                  ))}
                </div>
              )}
            </Section>
          </Reveal>

          <Reveal delay={150}>
            <Section index="05" title="Language toolchains" hint={`${bundle.langCount} pinned`} anchor="sec-langs">
              <div className="space-y-2">
                {cfg.langs.map((l) => (
                  <Switch
                    key={l.id}
                    on={l.on}
                    onChange={(v) => patchLang(l.id, { on: v })}
                    label={l.label}
                    desc={l.desc}
                    right={
                      l.on ? (
                        <span className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                          <span className="font-mono text-[9.5px] uppercase tracking-wider px-1.5 py-1 rounded border border-coral-500/40 text-coral-300 bg-coral-500/[0.08]">
                            {l.via}
                          </span>
                          <span className="w-[92px]">
                            <Select
                              ariaLabel={`${l.label} version`}
                              value={l.version}
                              onChange={(v) => patchLang(l.id, { version: v })}
                              options={l.versions.map((v) => ({ value: v, label: v }))}
                            />
                          </span>
                        </span>
                      ) : undefined
                    }
                  />
                ))}
              </div>
            </Section>
          </Reveal>

          <Reveal delay={160}>
            <Section index="06" title="Network" hint={`${cfg.ports.length} ports`} anchor="sec-network">
              <span className="block text-[10.5px] uppercase tracking-[0.14em] text-mist-600 font-mono mb-1.5">
                forwarded ports
              </span>
              <ChipInput
                ariaLabel="add port"
                values={cfg.ports}
                onChange={(v) => patch({ ports: v.filter((p) => /^\d+$/.test(p)) })}
                placeholder="5173, 3000, 5432 … (enter to add)"
              />
            </Section>
          </Reveal>

          <Reveal delay={200}>
            <Section index="07" title="Editor & bootstrap" anchor="sec-editor">
              <span className="block text-[10.5px] uppercase tracking-[0.14em] text-mist-600 font-mono mb-1.5">
                VS Code extensions
              </span>
              <ChipInput
                ariaLabel="add extension"
                values={cfg.extensions}
                onChange={(v) => patch({ extensions: v })}
                placeholder="publisher.extension (enter to add)"
              />
              <span className="block text-[10.5px] uppercase tracking-[0.14em] text-mist-600 font-mono mb-1.5 pt-1">
                post-create pipeline
              </span>
              <div className="space-y-2">
                {cfg.postSteps.map((s) => (
                  <Switch
                    key={s.id}
                    on={s.on}
                    onChange={(v) =>
                      patch({
                        postSteps: cfg.postSteps.map((x) => (x.id === s.id ? { ...x, on: v } : x)),
                      })
                    }
                    label={s.label}
                    desc={s.cmd}
                  />
                ))}
              </div>
            </Section>
          </Reveal>

          <Reveal delay={220}>
            <Section index="08" title="Enforcement" hint={`${enforcedCount}/5 gates`} anchor="sec-enforce">
              {(
                [
                  { key: "nonRoot", label: "P1 · non-root execution", desc: "Refuse remoteUser=root" },
                  { key: "engines", label: "P2 · runtime pinning", desc: "Write .nvmrc on setup" },
                  { key: "secretsGuard", label: "P3 · secret hygiene", desc: "Force .env into .gitignore" },
                  { key: "preCommit", label: "P4 · pre-commit guard", desc: "Install .githooks" },
                  { key: "schemaGate", label: "P5 · schema gate", desc: "jq parse + CI build gate" },
                ] as { key: keyof Enforcement; label: string; desc: string }[]
              ).map((d) => (
                <Switch
                  key={d.key}
                  on={cfg.enforce[d.key]}
                  onChange={(v) => patchEnforce(d.key, v)}
                  label={d.label}
                  desc={d.desc}
                />
              ))}
            </Section>
          </Reveal>

          <Reveal delay={240}>
            <div
              id="sec-summary"
              className="sticky bottom-4 scroll-mt-24 border border-ink-600/80 rounded-xl bg-ink-850/95 backdrop-blur px-4 py-3.5 shadow-[0_16px_44px_-18px_rgba(0,0,0,0.85)]"
            >
              <div className="flex items-center justify-between mb-2.5">
                <span className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-mist-600">
                  live summary
                </span>
                <span className="font-mono text-[10.5px] text-lagoon-400">● regenerating</span>
              </div>

              <div className="flex items-center gap-4 pb-3.5 mb-3.5 border-b border-ink-700/70">
                <div className="relative shrink-0">
                  <Gauge score={ready.score} />
                  <div className="absolute inset-0 grid place-items-center">
                    <CountUp
                      value={ready.score}
                      className="font-display font-bold text-[22px] text-mist-100 tabular-nums"
                    />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`font-display font-semibold text-[14.5px] tracking-wide ${
                        ready.blocked
                          ? "text-coral-400"
                          : ready.score >= 90
                            ? "text-lagoon-400"
                            : ready.score >= 70
                              ? "text-ember-400"
                              : ready.score >= 40
                                ? "text-skyx-400"
                                : "text-mist-400"
                      }`}
                    >
                      {ready.verdict}
                    </span>
                    {ready.blocked && (
                      <span className="violation-pulse font-mono text-[9.5px] px-1.5 py-0.5 rounded border border-coral-500/50 text-coral-400 bg-coral-500/10">
                        P1 refuses root
                      </span>
                    )}
                  </div>
                  <p className="font-mono text-[10.5px] text-mist-600 mt-1 leading-relaxed">
                    {ready.missing.length
                      ? `gaps: ${ready.missing.slice(0, 3).join(" · ")}${ready.missing.length > 3 ? " · …" : ""}`
                      : "every check green — commit and ship"}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {ready.items.map((i) => (
                      <span
                        key={i.label}
                        title={`${i.label} · ${i.on ? `+${i.pts} pts` : "missing"}`}
                        className={`w-2.5 h-2.5 rounded-[3px] transition-all duration-300 cursor-default ${
                          i.on
                            ? "bg-lagoon-500/80 shadow-[0_0_6px_rgba(69,214,194,0.4)]"
                            : "bg-ink-700 hover:bg-ink-600"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-3">
                <div>
                  <div key={bundle.arts.setup.split("\n").length} className="stat-flash font-display font-bold text-xl text-mist-100">
                    {bundle.arts.setup.split("\n").length}
                  </div>
                  <div className="font-mono text-[10px] text-mist-600 uppercase tracking-wider">script lines</div>
                </div>
                <div>
                  <div key={bundle.langCount} className="stat-flash font-display font-bold text-xl text-coral-400">
                    {bundle.langCount}
                  </div>
                  <div className="font-mono text-[10px] text-mist-600 uppercase tracking-wider">toolchains</div>
                </div>
                <div>
                  <div key={feats.length} className="stat-flash font-display font-bold text-xl text-mist-100">
                    {feats.length}
                  </div>
                  <div className="font-mono text-[10px] text-mist-600 uppercase tracking-wider">features</div>
                </div>
                <div>
                  <div key={est} className="stat-flash font-display font-bold text-xl text-ember-400">
                    {formatDuration(est)}
                  </div>
                  <div className="font-mono text-[10px] text-mist-600 uppercase tracking-wider">est. first build</div>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-ink-700/70 flex items-center justify-between font-mono text-[10.5px] text-mist-600">
                <span>
                  bundle {byteSize(arts.setup + arts.json + arts.dockerfile + arts.workflow + arts.quickstart)} ·{" "}
                  <span className="text-mist-500">autosaved</span>
                </span>
                <span>
                  sha <span className="text-ember-400/90">{shortHash(arts.setup).slice(0, 8)}</span>
                </span>
              </div>
            </div>
          </Reveal>
        </div>

        <div className="space-y-5 min-w-0">
          <Reveal delay={60}>
            <div className="relative">
              <span className="ghost-word" aria-hidden>
                {cfg.repo}
              </span>
              <div className="relative flex flex-wrap items-end gap-x-6 gap-y-3">
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-lagoon-400 mb-2">
                    generated artifacts
                  </p>
                  <h1 className="font-display font-bold text-[clamp(30px,3.6vw,44px)] leading-[1.05] tracking-[-0.015em] text-mist-100">
                    The env script for{" "}
                    <span className="text-ember-400">
                      {cfg.owner}/{cfg.repo}
                    </span>
                    ,<br className="hidden sm:block" /> forged{" "}
                    <span className="relative inline-block text-lagoon-400">
                      live
                      <span className="absolute left-0 -bottom-0.5 h-[3px] w-full bg-lagoon-500/50 rounded-full" />
                    </span>
                    .
                  </h1>
                </div>
                <p className="basis-full sm:basis-auto sm:max-w-[330px] text-[13px] text-mist-500 leading-relaxed sm:ml-auto">
                  Tune the manifest on the left — every keystroke rebuilds{" "}
                  <code className="font-mono text-[12px] text-mist-300">setup-env.sh</code>, the
                  devcontainer config, the extending Dockerfile and the CI policy gate below.
                </p>
              </div>
            </div>
          </Reveal>

          <Reveal delay={100}>
            <div className="flex items-center gap-3 rounded-xl border border-ink-700/80 bg-ink-900/70 px-3.5 py-2.5 transition-colors duration-200 hover:border-ember-500/40">
              <span className="font-mono text-[13px] text-ember-400 shrink-0 select-none">$</span>
              <code className="font-mono text-[12px] text-mist-300 truncate">{bootstrapLine(cfg)}</code>
              <button
                type="button"
                onClick={async () => {
                  if (await copyText(bootstrapLine(cfg))) {
                    toast("bootstrap one-liner copied");
                  } else toast("Clipboard unavailable in this browser");
                }}
                className="ml-auto shrink-0 flex items-center gap-1.5 rounded-md border border-ink-600 px-2.5 py-1.5 font-mono text-[11px] text-mist-300 transition-all hover:border-ember-500/50 hover:text-ember-300 active:scale-95"
              >
                <IconCopy className="w-3 h-3" />
                copy
              </button>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <PolicyMatrix policies={policies} />
          </Reveal>

          <div id="artifacts" className="scroll-mt-24">
            <Reveal delay={160}>
              <CodePanel files={files} onToast={toast} active={tab} onTabChange={setTab} />
            </Reveal>
          </div>

          <Reveal delay={180}>
            <div className="grid gap-5 xl:grid-cols-[1.05fr_1fr] items-start">
              <div id="sec-anatomy" className="scroll-mt-24">
                <LayerStack cfg={cfg} />
              </div>
              <div className="border border-ink-700/80 rounded-xl bg-ink-900/70 px-4 sm:px-5 py-4 transition-colors duration-300 hover:border-ink-600">
                <p className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-mist-600 mb-3.5">
                  ship pipeline
                </p>
                <ol className="grid sm:grid-cols-3 gap-y-4">
                  {[
                    {
                      n: "1",
                      t: "Bootstrap",
                      d: "Run the script — it clones the repo, pulls the GHCR image and writes .devcontainer/ with the pre-install Dockerfile.",
                      c: "text-ember-400",
                      cmd: "./setup-env.sh",
                    },
                    {
                      n: "2",
                      t: "Rebuild",
                      d: "Reopen in Container (or devcontainer up). Features install, ports forward, post-create runs.",
                      c: "text-lagoon-400",
                      cmd: "devcontainer up --workspace-folder .",
                    },
                    {
                      n: "3",
                      t: "Share",
                      d: "Commit .devcontainer/ plus the CI gate — every teammate gets the identical, policy-checked environment.",
                      c: "text-skyx-400",
                      cmd: "git add .devcontainer .github && git commit",
                    },
                  ].map((s, i) => (
                    <li key={s.n} className="relative sm:px-4 first:pl-0">
                      {i > 0 && (
                        <span className="hidden sm:block absolute left-[-13px] top-[13px] w-[26px] dash-flow" />
                      )}
                      <div className="flex items-center gap-2.5 mb-1.5">
                        <span
                          className={`font-mono text-[11px] w-6 h-6 grid place-items-center rounded-md border border-current/40 transition-transform duration-200 hover:scale-110 ${s.c}`}
                        >
                          {s.n}
                        </span>
                        <span className="font-display font-semibold text-[14px] text-mist-100">{s.t}</span>
                      </div>
                      <p className="text-[12px] text-mist-500 leading-relaxed mb-2">{s.d}</p>
                      <code
                        className={`block font-mono text-[11px] truncate rounded-md bg-ink-950/70 border border-ink-700/70 px-2.5 py-1.5 ${s.c}`}
                      >
                        {s.cmd}
                      </code>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </Reveal>
        </div>
      </main>

      <footer className="border-t border-ink-700/70 bg-ink-950/80">
        <div className="max-w-[1480px] mx-auto px-4 sm:px-6 py-3.5 flex flex-wrap items-center gap-x-6 gap-y-1.5 font-mono text-[11px] text-mist-600">
          <span className="flex items-center gap-2">
            <span className="led-live w-1.5 h-1.5 rounded-full bg-lagoon-400" />
            forge v1.8.0 · spec devcontainers/v0.245.2 · toolchains + policy gates P1–P5
          </span>
          <span className="hidden md:inline">manifest autosaves to this browser</span>
          <span className="sm:ml-auto">
            target <span className="text-ember-400/90">{img}</span>
          </span>
        </div>
      </footer>

      {showRun && (
        <DryRunModal
          lines={runLines}
          title={img}
          failed={hasViolation(cfg)}
          onClose={() => setShowRun(false)}
          onDone={() => {
            const failed = hasViolation(cfg);
            setVerified(!failed);
            setRunFailed(failed);
            toast(failed ? "dry-run failed · P1 refused the build" : "dry-run passed · exit 0");
          }}
        />
      )}
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} groups={commands} />
      <ShortcutsModal open={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />
      <OnboardingTour open={onboardingOpen} onClose={() => setOnboardingOpen(false)} />
      <TemplatePicker open={templatePickerOpen} onClose={() => setTemplatePickerOpen(false)} onSelect={applyTemplate} />
      <ChangelogModal open={changelogOpen} onClose={() => setChangelogOpen(false)} />
      <PerfDashboard open={perfDashboardOpen} onClose={() => setPerfDashboardOpen(false)} />
      <Toasts />
    </div>
  );
}
