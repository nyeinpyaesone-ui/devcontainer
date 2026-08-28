import { useEffect, useMemo, useRef, useState } from "react";
import CodePanel, { type FileTab } from "./components/CodePanel";
import DryRunModal from "./components/DryRunModal";
import Toasts, { type Toast } from "./components/Toasts";
import {
  ChipInput,
  IconCopy,
  IconDownload,
  IconPlay,
  IconReset,
  LogoMark,
  Reveal,
  Section,
  Select,
  Switch,
  TextField,
  copyText,
  downloadFile,
} from "./components/ui";
import {
  activeFeatures,
  buildArtifacts,
  buildRunLines,
  byteSize,
  DEFAULT_CONFIG,
  estimateSeconds,
  formatDuration,
  imageRef,
  shortHash,
  type Config,
} from "./lib/generator";
import { countLines } from "./lib/highlight";

// ── typewriter ticker ────────────────────────────────────────────────────────

function Ticker({ messages }: { messages: string[] }) {
  const [mi, setMi] = useState(0);
  const [chars, setChars] = useState(0);
  const msg = messages[mi % messages.length];

  useEffect(() => {
    if (chars < msg.length) {
      const t = window.setTimeout(() => setChars((c) => c + 2), 26);
      return () => clearTimeout(t);
    }
    const t = window.setTimeout(() => {
      setChars(0);
      setMi((i) => (i + 1) % messages.length);
    }, 2600);
    return () => clearTimeout(t);
  }, [chars, msg, messages.length]);

  return (
    <div className="hidden xl:flex items-center gap-2 min-w-0 font-mono text-[11.5px] text-mist-500 border border-ink-700/70 rounded-lg bg-ink-900/70 px-3 py-1.5 max-w-[430px]">
      <span className="text-lagoon-400 shrink-0">▸</span>
      <span className="truncate">
        {msg.slice(0, chars)}
        <span className="caret inline-block w-[6px] h-[12px] translate-y-[1px] bg-lagoon-400/80 ml-0.5" />
      </span>
    </div>
  );
}

// ── app ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [cfg, setCfg] = useState<Config>(DEFAULT_CONFIG);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [showRun, setShowRun] = useState(false);
  const [verified, setVerified] = useState(false);
  const [scriptCopied, setScriptCopied] = useState(false);
  const toastId = useRef(0);

  const arts = useMemo(() => buildArtifacts(cfg), [cfg]);
  const runLines = useMemo(() => buildRunLines(cfg, arts), [cfg, arts]);
  const img = imageRef(cfg);
  const feats = activeFeatures(cfg);
  const est = estimateSeconds(cfg);

  const patch = (p: Partial<Config>) => {
    setCfg((c) => ({ ...c, ...p }));
    setVerified(false);
  };

  const toast = (msg: string) => {
    const id = ++toastId.current;
    setToasts((t) => [...t.slice(-2), { id, msg }]);
    window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2800);
  };

  const files: FileTab[] = [
    { name: "setup-env.sh", lang: "bash", badge: "sh", content: arts.setup },
    { name: "devcontainer.json", lang: "json", badge: "json", content: arts.json },
    { name: "Dockerfile", lang: "dockerfile", badge: "docker", content: arts.dockerfile },
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
    window.setTimeout(() => downloadFile("quickstart.sh", arts.quickstart), 780);
    toast("4 artifacts downloaded");
  };

  const tickerMsgs = useMemo(
    () => [
      `resolved ${img} → sha256:${shortHash(arts.setup)}…`,
      feats.length
        ? `features: ${feats.map((f) => f.ref.split("/").pop() + (f.version ? "@" + f.version : "")).join(" · ")}`
        : "features: none selected",
      `forwarding :${cfg.ports.join(" :")} → localhost`,
      "spec devcontainers/v0.245.2 · schema valid",
    ],
    [img, arts.setup, feats, cfg.ports]
  );

  return (
    <div className="min-h-screen flex flex-col">
      <div className="bg-forge" aria-hidden />

      {/* ── header ─────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 border-b border-ink-700/70 bg-ink-950/85 backdrop-blur-md">
        <div className="max-w-[1480px] mx-auto px-4 sm:px-6 h-[60px] flex items-center gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <LogoMark className="w-9 h-9 shrink-0" />
            <div className="leading-tight min-w-0">
              <div className="font-display font-bold tracking-[0.04em] text-[15px] text-mist-100 whitespace-nowrap">
                DEVCONTAINER <span className="text-ember-500">FORGE</span>
              </div>
              <div className="font-mono text-[10.5px] text-mist-600 truncate">
                ghcr env setup · {cfg.owner}/{cfg.repo}
              </div>
            </div>
          </div>

          <Ticker messages={tickerMsgs} />

          <div className="ml-auto flex items-center gap-2.5">
            <span
              className={`hidden sm:flex items-center gap-2 font-mono text-[10.5px] px-2.5 py-1.5 rounded-lg border ${
                verified
                  ? "border-lagoon-500/40 text-lagoon-300 bg-lagoon-500/[0.07]"
                  : "border-ink-600 text-mist-500 bg-ink-900/60"
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  verified ? "bg-lagoon-400 led-live" : "bg-ember-500/80"
                }`}
              />
              {verified ? "dry-run passed" : "unverified"}
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

      {/* ── workspace ──────────────────────────────────────────────────── */}
      <main className="flex-1 w-full max-w-[1480px] mx-auto px-4 sm:px-6 py-6 grid gap-6 lg:grid-cols-[396px_1fr] items-start">
        {/* left · configuration */}
        <div className="space-y-4">
          <Reveal>
            <div className="flex items-center justify-between">
              <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-mist-600">
                environment manifest
              </p>
              <button
                type="button"
                onClick={() => {
                  setCfg(DEFAULT_CONFIG);
                  setVerified(false);
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
            <Section index="01" title="Target registry" hint="ghcr.io">
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
            <Section index="02" title="Base environment" hint={cfg.base}>
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
              <div>
                <span className="block text-[10.5px] uppercase tracking-[0.14em] text-mist-600 font-mono mb-1.5">
                  remote user
                </span>
                <Select
                  ariaLabel="remote user"
                  value={cfg.remoteUser}
                  onChange={(v) => patch({ remoteUser: v })}
                  options={[
                    { value: "vscode", label: "vscode (non-root)" },
                    { value: "node", label: "node" },
                    { value: "root", label: "root (not recommended)" },
                  ]}
                />
              </div>
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
            <Section index="03" title="Devcontainer features" hint={`${feats.length} active`}>
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
              <p className="font-mono text-[10.5px] text-mist-600 leading-relaxed">
                resolved from <span className="text-skyx-400">ghcr.io/devcontainers/features</span> —
                installed by the CLI on first <span className="text-mist-300">devcontainer up</span>
              </p>
            </Section>
          </Reveal>

          <Reveal delay={160}>
            <Section index="04" title="Network" hint={`${cfg.ports.length} ports`}>
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
            <Section index="05" title="Editor & bootstrap">
              <span className="block text-[10.5px] uppercase tracking-[0.14em] text-mist-600 font-mono mb-1.5">
                VS Code extensions
              </span>
              <ChipInput
                ariaLabel="add extension"
                values={cfg.extensions}
                onChange={(v) => patch({ extensions: v })}
                placeholder="publisher.extension (enter to add)"
              />
              <TextField
                label="extra apt packages (→ Dockerfile)"
                value={cfg.aptExtra}
                onChange={(v) => patch({ aptExtra: v })}
                placeholder="curl, jq, …"
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

          {/* live summary */}
          <Reveal delay={240}>
            <div className="sticky bottom-4 border border-ink-600/80 rounded-xl bg-ink-850/95 backdrop-blur px-4 py-3.5 shadow-[0_16px_44px_-18px_rgba(0,0,0,0.85)]">
              <div className="flex items-center justify-between mb-2.5">
                <span className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-mist-600">
                  live summary
                </span>
                <span className="font-mono text-[10.5px] text-lagoon-400">● regenerating</span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <div key={countLines(arts.setup)} className="stat-flash font-display font-bold text-xl text-mist-100">
                    {countLines(arts.setup)}
                  </div>
                  <div className="font-mono text-[10px] text-mist-600 uppercase tracking-wider">script lines</div>
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
                <span>bundle {byteSize(arts.setup + arts.json + arts.dockerfile)}</span>
                <span>
                  sha <span className="text-ember-400/90">{shortHash(arts.setup).slice(0, 8)}</span>
                </span>
              </div>
            </div>
          </Reveal>
        </div>

        {/* right · artifacts */}
        <div className="space-y-5 min-w-0">
          <Reveal delay={60}>
            <div className="flex flex-wrap items-end gap-x-6 gap-y-2">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-lagoon-400 mb-1.5">
                  generated artifacts
                </p>
                <h1 className="font-display font-bold text-[26px] sm:text-[30px] leading-[1.08] text-mist-100">
                  The env script for{" "}
                  <span className="text-ember-400">
                    {cfg.owner}/{cfg.repo}
                  </span>
                  <span className="text-mist-600">, forged live.</span>
                </h1>
              </div>
              <p className="basis-full sm:basis-auto sm:max-w-[330px] text-[13px] text-mist-500 leading-relaxed sm:ml-auto">
                Tune the manifest on the left — every keystroke rebuilds{" "}
                <code className="font-mono text-[12px] text-mist-300">setup-env.sh</code>, the devcontainer
                config and the extending Dockerfile below.
              </p>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <CodePanel files={files} onToast={toast} />
          </Reveal>

          {/* ship pipeline */}
          <Reveal delay={180}>
            <div className="border border-ink-700/80 rounded-xl bg-ink-900/70 px-4 sm:px-5 py-4">
              <p className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-mist-600 mb-3.5">
                ship pipeline
              </p>
              <ol className="grid sm:grid-cols-3 gap-y-4">
                {[
                  {
                    n: "1",
                    t: "Bootstrap",
                    d: "Run the script at the repo root — it pulls the GHCR image, scaffolds .devcontainer/ and writes both configs.",
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
                    d: "Commit .devcontainer/ to the ERP repo — every teammate gets the identical environment.",
                    c: "text-skyx-400",
                    cmd: "git add .devcontainer && git commit",
                  },
                ].map((s, i) => (
                  <li key={s.n} className="relative sm:px-4 first:pl-0">
                    {i > 0 && (
                      <span className="hidden sm:block absolute left-[-9px] top-[13px] w-[18px] border-t border-dashed border-ink-600" />
                    )}
                    <div className="flex items-center gap-2.5 mb-1.5">
                      <span className={`font-mono text-[11px] w-6 h-6 grid place-items-center rounded-md border border-current/40 ${s.c}`}>
                        {s.n}
                      </span>
                      <span className="font-display font-semibold text-[14px] text-mist-100">{s.t}</span>
                    </div>
                    <p className="text-[12px] text-mist-500 leading-relaxed mb-2">{s.d}</p>
                    <code className={`block font-mono text-[11px] truncate rounded-md bg-ink-950/70 border border-ink-700/70 px-2.5 py-1.5 ${s.c}`}>
                      {s.cmd}
                    </code>
                  </li>
                ))}
              </ol>
            </div>
          </Reveal>
        </div>
      </main>

      {/* ── footer ─────────────────────────────────────────────────────── */}
      <footer className="border-t border-ink-700/70 bg-ink-950/80">
        <div className="max-w-[1480px] mx-auto px-4 sm:px-6 py-3.5 flex flex-wrap items-center gap-x-6 gap-y-1.5 font-mono text-[11px] text-mist-600">
          <span className="flex items-center gap-2">
            <span className="led-live w-1.5 h-1.5 rounded-full bg-lagoon-400" />
            forge v1.4.0 · spec devcontainers/v0.245.2
          </span>
          <span>artifacts regenerate on every keystroke</span>
          <span className="ml-auto text-mist-500">
            target <span className="text-ember-400/90">{img}</span>
          </span>
        </div>
      </footer>

      {showRun && (
        <DryRunModal
          lines={runLines}
          title={img}
          onClose={() => setShowRun(false)}
          onDone={() => {
            setVerified(true);
            toast("dry-run passed · exit 0");
          }}
        />
      )}
      <Toasts toasts={toasts} />
    </div>
  );
}
