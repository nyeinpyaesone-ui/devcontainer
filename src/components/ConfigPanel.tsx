import type { ReactNode } from "react";
import {
  EXTENSIONS,
  FEATURES,
  GHCR_IMAGE,
  portsFor,
  type EnvConfig,
  type FeatureKey,
  type NodeMajor,
  type PkgMgr,
  type Platform,
} from "../lib/generate";

interface Props {
  cfg: EnvConfig;
  onChange: (next: EnvConfig) => void;
}

export function ConfigPanel({ cfg, onChange }: Props) {
  const set = (patch: Partial<EnvConfig>) => onChange({ ...cfg, ...patch });

  const toggleFeature = (key: FeatureKey) => {
    const on = !cfg.feat[key];
    const feat = { ...cfg.feat, [key]: on };
    const ext = { ...cfg.ext };
    if (on) {
      const def = FEATURES.find((f) => f.key === key);
      def?.exts?.forEach((id) => {
        ext[id] = true;
      });
    }
    onChange({ ...cfg, feat, ext });
  };

  const featureCount = FEATURES.filter((f) => cfg.feat[f.key]).length;
  const extCount = EXTENSIONS.filter((e) => cfg.ext[e.id]).length;

  return (
    <div className="divide-y divide-ink-700/70 rounded-xl border border-ink-700 bg-ink-900/80">
      <PanelHead step="01" title="Runtime" hint="what runs inside the box" />
      <div className="space-y-4 px-5 pb-5">
        <div>
          <Label>Node.js</Label>
          <Seg
            options={(["18", "20", "22"] as NodeMajor[]).map((v) => ({
              v,
              label: `node ${v}`,
            }))}
            value={cfg.nodeMajor}
            onChange={(v) => set({ nodeMajor: v })}
          />
        </div>
        <div>
          <Label>Package manager</Label>
          <Seg
            options={(["npm", "pnpm", "yarn", "bun"] as PkgMgr[]).map((v) => ({
              v,
              label: v,
            }))}
            value={cfg.pkgMgr}
            onChange={(v) => set({ pkgMgr: v })}
          />
        </div>
      </div>

      <PanelHead step="02" title="Image" hint="where the box lives on GHCR" />
      <div className="space-y-4 px-5 pb-5">
        <div className="flex items-center justify-between gap-3 rounded-lg border border-ink-700 bg-ink-950/70 px-3.5 py-2.5">
          <code className="truncate font-mono text-[12px] text-lagoon-300">
            {GHCR_IMAGE}
          </code>
          <span className="shrink-0 rounded border border-lagoon-400/30 bg-lagoon-400/10 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-lagoon-300">
            public
          </span>
        </div>
        <div>
          <Label>Build platform</Label>
          <Seg
            options={(
              [
                ["linux/amd64", "amd64"],
                ["linux/arm64", "arm64"],
                ["linux/amd64,linux/arm64", "multi-arch"],
              ] as [Platform, string][]
            ).map(([v, label]) => ({ v, label }))}
            value={cfg.platform}
            onChange={(v) => set({ platform: v })}
          />
        </div>
      </div>

      <PanelHead step="03" title="Features" hint="devcontainer features baked in" />
      <div className="space-y-1 px-3 pb-4">
        {FEATURES.map((f) => {
          const on = cfg.feat[f.key];
          return (
            <button
              key={f.key}
              onClick={() => toggleFeature(f.key)}
              className={`group flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors duration-200 ${
                on ? "bg-ink-800/80" : "hover:bg-ink-800/50"
              }`}
            >
              <span
                className={`relative h-5 w-9 shrink-0 rounded-full transition-colors duration-200 ${
                  on ? "bg-ember-500" : "bg-ink-600"
                }`}
              >
                <span
                  className={`absolute top-0.5 h-4 w-4 rounded-full bg-ink-950 shadow transition-transform duration-200 ${
                    on ? "translate-x-[18px]" : "translate-x-0.5"
                  }`}
                />
              </span>
              <span className="min-w-0">
                <span
                  className={`block text-[13.5px] font-medium transition-colors ${
                    on ? "text-mist-100" : "text-mist-500 group-hover:text-mist-300"
                  }`}
                >
                  {f.label}
                </span>
                <span className="block truncate font-mono text-[11px] text-mist-600">
                  {f.desc}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <PanelHead step="04" title="VS Code extensions" hint="installed on first create" />
      <div className="flex flex-wrap gap-1.5 px-5 pb-5">
        {EXTENSIONS.map((e) => {
          const on = !!cfg.ext[e.id];
          return (
            <button
              key={e.id}
              onClick={() => onChange({ ...cfg, ext: { ...cfg.ext, [e.id]: !on } })}
              className={`rounded-full border px-3 py-1 font-mono text-[11px] transition-all duration-200 active:scale-95 ${
                on
                  ? "border-lagoon-400/45 bg-lagoon-400/10 text-lagoon-300"
                  : "border-ink-600 text-mist-600 hover:border-ink-600 hover:text-mist-300"
              }`}
            >
              {e.label}
            </button>
          );
        })}
      </div>

      {/* live summary */}
      <div className="flex flex-wrap items-center gap-1.5 bg-ink-850 px-5 py-3.5">
        {[
          `${featureCount} feature${featureCount === 1 ? "" : "s"}`,
          `${portsFor(cfg).length} ports`,
          `${extCount} extensions`,
          `${cfg.pkgMgr} · node ${cfg.nodeMajor}`,
        ].map((t) => (
          <span
            key={t}
            className="rounded border border-ink-600 bg-ink-900 px-2 py-0.5 font-mono text-[10.5px] tracking-wide text-mist-500"
          >
            {t}
          </span>
        ))}
        <span className="ml-auto font-mono text-[10.5px] text-ember-400">
          → files update live
        </span>
      </div>
    </div>
  );
}

function PanelHead({ step, title, hint }: { step: string; title: string; hint: string }) {
  return (
    <div className="flex items-baseline gap-3 px-5 pb-3 pt-5">
      <span className="font-mono text-[11px] font-semibold text-ember-500">{step}</span>
      <h3 className="font-display text-[15px] font-semibold tracking-tight text-mist-100">
        {title}
      </h3>
      <span className="ml-auto hidden font-mono text-[10.5px] text-mist-600 sm:block">{hint}</span>
    </div>
  );
}

function Label({ children }: { children: ReactNode }) {
  return (
    <div className="mb-1.5 font-mono text-[10.5px] uppercase tracking-[0.16em] text-mist-600">
      {children}
    </div>
  );
}

function Seg<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { v: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="grid grid-flow-col gap-1 rounded-lg border border-ink-700 bg-ink-950/70 p-1">
      {options.map((o) => {
        const active = o.v === value;
        return (
          <button
            key={o.v}
            onClick={() => onChange(o.v)}
            className={`rounded-md px-2 py-1.5 font-mono text-[11.5px] font-medium tracking-wide transition-all duration-200 active:scale-95 ${
              active
                ? "bg-ember-500 text-ink-950 shadow-[0_2px_12px_rgba(245,168,60,0.3)]"
                : "text-mist-500 hover:bg-ink-800 hover:text-mist-300"
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
