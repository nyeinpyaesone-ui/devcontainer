import { useEffect, useMemo, useState } from "react";
import { GHCR_IMAGE, FEATURES, portsFor, type EnvConfig } from "../lib/generate";

type Kind = "cmd" | "info" | "ok" | "live";
interface Line {
  kind: Kind;
  text: string;
  delay?: number;
}

export function HeroTerminal({ cfg }: { cfg: EnvConfig }) {
  const lines = useMemo<Line[]>(() => {
    const feats = FEATURES.filter((f) => cfg.feat[f.key])
      .map((f) => f.label.toLowerCase())
      .join(", ");
    return [
      { kind: "cmd", text: "./setup-ghcr-env.sh --pull" },
      { kind: "info", text: "preflight · docker 27.3.1 · git 2.47.1", delay: 420 },
      { kind: "ok", text: "ghcr.io · anonymous pull (public image)" },
      { kind: "info", text: `pulling ${GHCR_IMAGE}:latest`, delay: 300 },
      { kind: "ok", text: "image ready · sha256:9f4c…e21b (1.28 GB)", delay: 620 },
      { kind: "info", text: "writing .devcontainer/devcontainer.json", delay: 260 },
      { kind: "info", text: `features: ${feats || "base image"} · node@${cfg.nodeMajor}` },
      { kind: "info", text: `forwarding ${portsFor(cfg).join(" · ")}` },
      { kind: "ok", text: `${cfg.pkgMgr} install … 1,284 packages in 12.4s`, delay: 700 },
      { kind: "live", text: "ERP dev environment online — reopen in VS Code", delay: 380 },
    ];
  }, [cfg]);

  const [progress, setProgress] = useState({ line: 0, char: 0 });

  useEffect(() => {
    setProgress({ line: 0, char: 0 });
  }, [lines]);

  useEffect(() => {
    if (progress.line >= lines.length) {
      const t = setTimeout(() => setProgress({ line: 0, char: 0 }), 4600);
      return () => clearTimeout(t);
    }
    const cur = lines[progress.line];
    const typing = cur.kind === "cmd" && progress.char < cur.text.length;
    const delay = typing
      ? progress.char === 0
        ? 650
        : 26 + Math.random() * 34
      : (cur.delay ?? 250);

    const t = setTimeout(() => {
      setProgress((p) => {
        const c = lines[p.line];
        if (c.kind === "cmd" && p.char < c.text.length)
          return { line: p.line, char: p.char + 1 };
        return { line: p.line + 1, char: 0 };
      });
    }, delay);
    return () => clearTimeout(t);
  }, [progress, lines]);

  const finished = progress.line >= lines.length;

  return (
    <div className="relative overflow-hidden rounded-xl border border-ink-700 bg-ink-900/90 shadow-[0_24px_80px_rgba(3,6,14,0.7)]">
      {/* title bar */}
      <div className="flex items-center gap-2 border-b border-ink-700/80 bg-ink-850 px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-coral-500/80" />
        <span className="h-2.5 w-2.5 rounded-full bg-ember-500/80" />
        <span className="h-2.5 w-2.5 rounded-full bg-lagoon-400/80" />
        <span className="ml-3 truncate font-mono text-[11px] tracking-wide text-mist-500">
          setup — nyeinpysone-ui/ERP — bash
        </span>
        <span className="ml-auto flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-lagoon-400">
          <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-lagoon-400" />
          live
        </span>
      </div>

      {/* body */}
      <div className="scanlines relative h-[324px] overflow-hidden px-5 py-4 sm:h-[348px]">
        <div className="font-mono text-[12.5px] leading-[1.85] sm:text-[13px]">
          {lines.slice(0, progress.line).map((l, i) => (
            <TermLine key={i} line={l} />
          ))}
          {!finished && lines[progress.line].kind === "cmd" && (
            <div className="flex">
              <span className="mr-2 text-lagoon-400">❯</span>
              <span className="whitespace-pre text-mist-100">
                {lines[progress.line].text.slice(0, progress.char)}
              </span>
              <span className="cursor ml-0.5 inline-block h-[15px] w-[7px] translate-y-[2px] bg-ember-400" />
            </div>
          )}
          {finished && (
            <div className="flex">
              <span className="mr-2 text-lagoon-400">❯</span>
              <span className="cursor inline-block h-[15px] w-[7px] translate-y-[2px] bg-ember-400" />
            </div>
          )}
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-ink-900 to-transparent" />
      </div>
    </div>
  );
}

function TermLine({ line }: { line: Line }) {
  if (line.kind === "cmd")
    return (
      <div className="flex">
        <span className="mr-2 text-lagoon-400">❯</span>
        <span className="text-mist-100">{line.text}</span>
      </div>
    );
  if (line.kind === "ok")
    return (
      <div className="flex">
        <span className="mr-2 text-lagoon-400">✔</span>
        <span className="text-mist-300">{line.text}</span>
      </div>
    );
  if (line.kind === "live")
    return (
      <div className="flex">
        <span className="mr-2 text-ember-400">●</span>
        <span className="font-medium text-ember-300">{line.text}</span>
      </div>
    );
  return (
    <div className="flex">
      <span className="mr-2 text-skyx-400">▸</span>
      <span className="text-mist-500">{line.text}</span>
    </div>
  );
}
