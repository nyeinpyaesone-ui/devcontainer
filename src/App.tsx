import { useMemo, useState } from "react";
import {
  DEFAULT_CONFIG,
  GHCR_IMAGE,
  REPO_SLUG,
  buildFiles,
  buildSetupScript,
  type EnvConfig,
} from "./lib/generate";
import { HeroTerminal } from "./components/HeroTerminal";
import { ConfigPanel } from "./components/ConfigPanel";
import { CodePanel } from "./components/CodePanel";
import { HowItWorks } from "./components/HowItWorks";
import {
  CopyBtn,
  DownloadBtn,
  IconArrowDown,
  IconContainer,
  Reveal,
} from "./components/ui";

const QUICKSTART: { prompt: string; text: string; ok?: boolean }[] = [
  { prompt: "❯", text: `git clone https://github.com/${REPO_SLUG} && cd ERP` },
  {
    prompt: "❯",
    text: "curl -fsSL -o setup-ghcr-env.sh https://github.com/nyeinpysone-ui/ERP/raw/main/setup-ghcr-env.sh && chmod +x setup-ghcr-env.sh",
  },
  { prompt: "❯", text: "./setup-ghcr-env.sh --pull" },
  { prompt: "✔", text: "ERP dev environment online — reopen in VS Code", ok: true },
];

export default function App() {
  const [cfg, setCfg] = useState<EnvConfig>(DEFAULT_CONFIG);
  const files = useMemo(() => buildFiles(cfg), [cfg]);
  const setupScript = useMemo(() => buildSetupScript(cfg), [cfg]);

  const goto = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <div className="relative min-h-screen overflow-x-clip">
      {/* ── ambient layers ── */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="bg-grid absolute inset-0" />
        <div className="glow-a absolute -top-44 left-[-12%] h-[580px] w-[580px] rounded-full bg-[radial-gradient(closest-side,rgba(43,184,166,0.14),transparent)] blur-2xl" />
        <div className="glow-b absolute right-[-14%] top-[32%] h-[640px] w-[640px] rounded-full bg-[radial-gradient(closest-side,rgba(245,168,60,0.11),transparent)] blur-2xl" />
        <div className="glow-a absolute bottom-[-20%] left-[22%] h-[520px] w-[520px] rounded-full bg-[radial-gradient(closest-side,rgba(130,182,255,0.07),transparent)] blur-2xl" />
        <div className="noise absolute inset-0" />
      </div>

      {/* ── header ── */}
      <header className="sticky top-0 z-40 border-b border-ink-700/60 bg-ink-950/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-5 py-3">
          <a href="#top" className="flex items-center gap-2.5" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }}>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-ember-500/40 bg-ember-500/10 text-ember-400">
              <IconContainer className="h-4.5 w-4.5" />
            </span>
            <span className="font-display text-[15px] font-bold tracking-tight text-mist-100">
              envforge
              <span className="ml-2 hidden font-mono text-[10.5px] font-medium uppercase tracking-[0.18em] text-mist-600 sm:inline">
                ghcr studio
              </span>
            </span>
          </a>
          <div className="ml-auto flex items-center gap-2.5">
            <span className="hidden items-center gap-2 rounded-md border border-ink-700 bg-ink-900 px-2.5 py-1.5 font-mono text-[11px] text-mist-300 md:flex">
              <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-lagoon-400" />
              {REPO_SLUG}
            </span>
            <span className="hidden rounded-md border border-lagoon-400/30 bg-lagoon-400/10 px-2.5 py-1.5 font-mono text-[10.5px] uppercase tracking-[0.12em] text-lagoon-300 lg:block">
              ghcr.io · public
            </span>
            <DownloadBtn
              filename="setup-ghcr-env.sh"
              content={setupScript}
              label="setup.sh"
            />
          </div>
        </div>
      </header>

      <main id="top" className="relative z-10 mx-auto max-w-6xl px-5">
        {/* ── opener: script, live ── */}
        <section className="grid items-center gap-10 pb-16 pt-12 lg:grid-cols-[1.02fr_1fr] lg:gap-12 lg:pt-16">
          <div>
            <Reveal>
              <p className="font-mono text-[11.5px] font-medium uppercase tracking-[0.28em] text-ember-400">
                // ghcr devcontainer studio
              </p>
            </Reveal>
            <Reveal delay={80}>
              <h1 className="mt-4 font-display text-[clamp(2.1rem,5.2vw,3.6rem)] font-bold leading-[1.06] tracking-tight text-mist-100">
                Boot the ERP dev box
                <span className="mt-1 block text-lagoon-300">from one GHCR image.</span>
              </h1>
            </Reveal>
            <Reveal delay={160}>
              <p className="mt-5 max-w-lg text-[15px] leading-relaxed text-mist-500">
                A generated environment setup script for{" "}
                <code className="rounded bg-ink-800 px-1.5 py-0.5 font-mono text-[13px] text-mist-300">
                  {REPO_SLUG}
                </code>{" "}
                — it pulls the prebuilt container from{" "}
                <span className="text-lagoon-300">ghcr.io</span>, writes the devcontainer
                contract, wires the services, and leaves the repo running in VS Code.
              </p>
            </Reveal>
            <Reveal delay={240}>
              <div className="mt-6 flex flex-wrap gap-2">
                {[
                  { t: `${GHCR_IMAGE}:latest`, c: "text-lagoon-300 border-lagoon-400/30 bg-lagoon-400/5" },
                  { t: `node ${cfg.nodeMajor} · ${cfg.pkgMgr}`, c: "text-ember-300 border-ember-500/30 bg-ember-500/5" },
                  { t: "ubuntu · bookworm", c: "text-skyx-400 border-skyx-400/30 bg-skyx-400/5" },
                  { t: "3 generated files", c: "text-mist-300 border-ink-600 bg-ink-800/60" },
                ].map((chip) => (
                  <span
                    key={chip.t}
                    className={`rounded-md border px-2.5 py-1 font-mono text-[11px] tracking-wide transition-colors ${chip.c}`}
                  >
                    {chip.t}
                  </span>
                ))}
              </div>
            </Reveal>
            <Reveal delay={320}>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <DownloadBtn
                  primary
                  filename="setup-ghcr-env.sh"
                  content={setupScript}
                  label="Download setup-ghcr-env.sh"
                />
                <button
                  onClick={() => goto("builder")}
                  className="group inline-flex items-center gap-2 rounded-md border border-ink-600 bg-ink-800/70 px-4 py-2 font-mono text-[12px] font-semibold tracking-wide text-mist-300 transition-all duration-200 hover:border-lagoon-400/50 hover:text-lagoon-300 active:scale-95"
                >
                  Open the builder
                  <IconArrowDown className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-y-0.5" />
                </button>
              </div>
            </Reveal>
          </div>

          <Reveal delay={200}>
            <HeroTerminal cfg={cfg} />
          </Reveal>
        </section>

        {/* ── builder ── */}
        <section id="builder" className="scroll-mt-24 border-t border-ink-800 py-16">
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="font-mono text-[11px] font-medium uppercase tracking-[0.28em] text-lagoon-400">
                  // 01 — the builder
                </p>
                <h2 className="mt-3 font-display text-[clamp(1.5rem,3.2vw,2.2rem)] font-bold tracking-tight text-mist-100">
                  Shape the environment. <span className="text-ember-400">Take the files.</span>
                </h2>
              </div>
              <p className="max-w-xs text-[13px] leading-relaxed text-mist-600">
                Every toggle re-renders all three artifacts in real time — copy them or
                download them straight into the repo.
              </p>
            </div>
          </Reveal>

          <div className="mt-8 grid gap-6 lg:grid-cols-[400px_1fr]">
            <Reveal delay={100} className="lg:sticky lg:top-24 lg:self-start">
              <ConfigPanel cfg={cfg} onChange={setCfg} />
            </Reveal>
            <Reveal delay={200}>
              <CodePanel files={files} />
            </Reveal>
          </div>
        </section>

        {/* ── how it works ── */}
        <section className="border-t border-ink-800 py-16">
          <div className="grid gap-10 lg:grid-cols-[360px_1fr]">
            <div className="lg:sticky lg:top-24 lg:self-start">
              <Reveal>
                <p className="font-mono text-[11px] font-medium uppercase tracking-[0.28em] text-coral-400">
                  // 02 — under the hood
                </p>
                <h2 className="mt-3 font-display text-[clamp(1.5rem,3.2vw,2.2rem)] font-bold tracking-tight text-mist-100">
                  What the script does when it runs
                </h2>
                <p className="mt-4 max-w-sm text-[13.5px] leading-relaxed text-mist-500">
                  Five stages, each idempotent — run it on a fresh laptop or re-run it
                  after pulling new config from <span className="text-mist-300">main</span>.
                  It never touches an existing{" "}
                  <code className="font-mono text-[12px] text-lagoon-300">devcontainer.json</code>.
                </p>
              </Reveal>
            </div>
            <HowItWorks />
          </div>
        </section>

        {/* ── quickstart ── */}
        <section className="border-t border-ink-800 py-16">
          <Reveal>
            <p className="font-mono text-[11px] font-medium uppercase tracking-[0.28em] text-skyx-400">
              // 03 — quickstart
            </p>
            <h2 className="mt-3 font-display text-[clamp(1.5rem,3.2vw,2.2rem)] font-bold tracking-tight text-mist-100">
              Three commands, zero drift
            </h2>
          </Reveal>
          <Reveal delay={120}>
            <div className="mt-7 overflow-hidden rounded-xl border border-ink-700 bg-ink-900/80">
              {QUICKSTART.map((q, i) => (
                <div
                  key={i}
                  className={`group flex items-center gap-3 px-4 py-3 transition-colors hover:bg-ink-800/50 sm:px-5 ${
                    i > 0 ? "border-t border-ink-800" : ""
                  }`}
                >
                  <span
                    className={`font-mono text-[13px] ${q.ok ? "text-lagoon-400" : "text-ember-400"}`}
                  >
                    {q.prompt}
                  </span>
                  <code
                    className={`min-w-0 flex-1 truncate font-mono text-[12.5px] ${
                      q.ok ? "text-lagoon-300" : "text-mist-300"
                    }`}
                  >
                    {q.text}
                  </code>
                  {!q.ok && (
                    <span className="opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                      <CopyBtn text={q.text} label="" />
                    </span>
                  )}
                </div>
              ))}
            </div>
          </Reveal>
        </section>
      </main>

      {/* ── footer ── */}
      <footer className="relative z-10 border-t border-ink-800 bg-ink-950/60">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-5 py-6">
          <span className="flex items-center gap-2 font-mono text-[11.5px] text-mist-600">
            <IconContainer className="h-3.5 w-3.5 text-ember-500/70" />
            crafted for <span className="text-mist-300">{REPO_SLUG}</span>
          </span>
          <span className="font-mono text-[11.5px] text-mist-600">
            images live at <span className="text-lagoon-400/80">{GHCR_IMAGE}</span>
          </span>
          <span className="ml-auto font-mono text-[10.5px] uppercase tracking-[0.16em] text-mist-600">
            devcontainers v0.3 · ubuntu bookworm
          </span>
        </div>
      </footer>
    </div>
  );
}
