import { useMemo } from "react";
import {
  estimateLayers,
  totalLayerMb,
  type Config,
  type LayerInfo,
} from "../lib/generator";
import { CountUp } from "./ui";

const KIND_STYLE: Record<LayerInfo["kind"], { bar: string; text: string; tick: string }> = {
  base: { bar: "bg-ember-500/75", text: "text-ember-300", tick: "bg-ember-500" },
  feature: { bar: "bg-lagoon-500/75", text: "text-lagoon-300", tick: "bg-lagoon-500" },
  apt: { bar: "bg-skyx-400/75", text: "text-skyx-300", tick: "bg-skyx-400" },
  lang: { bar: "bg-coral-500/75", text: "text-coral-300", tick: "bg-coral-500" },
  mount: { bar: "bg-mist-500/40", text: "text-mist-400", tick: "bg-mist-500" },
};

export default function LayerStack({ cfg }: { cfg: Config }) {
  const layers = useMemo(() => estimateLayers(cfg), [cfg]);
  const total = totalLayerMb(layers);
  const maxMb = Math.max(...layers.map((l) => l.mb), 1);

  return (
    <div className="border border-ink-700/80 rounded-xl bg-ink-900/70 overflow-hidden transition-colors duration-300 hover:border-ink-600">
      <header className="flex items-center gap-3 px-4 pt-3.5 pb-3 border-b border-ink-700/60 bg-ink-850/60">
        <span className="step-num">img</span>
        <h2 className="font-display font-semibold tracking-wide text-[15px] text-mist-100">
          Image anatomy
        </h2>
        <span className="ml-auto flex items-baseline gap-1.5">
          <CountUp
            value={total}
            className="font-display font-bold text-[17px] text-ember-400 tabular-nums"
          />
          <span className="font-mono text-[10.5px] text-mist-600">MB est.</span>
        </span>
      </header>

      <div className="p-3.5 space-y-1">
        {layers.map((l, i) => {
          const s = KIND_STYLE[l.kind];
          const pct = l.mb > 0 ? Math.max((l.mb / maxMb) * 100, 4) : 0;
          return (
            <div
              key={l.id + i}
              className="group/layer rounded-lg px-2.5 py-2 -mx-0.5 transition-all duration-200 hover:bg-ink-800/60 hover:translate-x-[3px]"
            >
              <div className="flex items-center gap-2.5 mb-1.5">
                <span className={`w-1 h-3.5 rounded-full shrink-0 ${s.tick}`} />
                <code className="font-mono text-[11.5px] text-mist-300 truncate group-hover/layer:text-mist-100 transition-colors">
                  {l.label}
                </code>
                <span className="ml-auto shrink-0 font-mono text-[10.5px] text-mist-600 tabular-nums">
                  {l.mb > 0 ? `${l.mb} MB` : l.kind === "mount" ? "mount" : "0"}
                </span>
              </div>
              {l.mb > 0 ? (
                <div className="ml-[14px] h-[6px] rounded-full bg-ink-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${s.bar} transition-[width] duration-700 ease-out`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              ) : (
                <div className="ml-[14px] h-[6px] rounded-full border border-dashed border-ink-600/80" />
              )}
              <p className={`ml-[14px] mt-1 font-mono text-[10px] ${s.text} opacity-70 group-hover/layer:opacity-100 transition-opacity truncate`}>
                {l.detail}
              </p>
            </div>
          );
        })}
      </div>

      <footer className="border-t border-ink-700/60 bg-ink-850/50 px-4 py-2.5 font-mono text-[10.5px] text-mist-600 leading-relaxed">
        {layers.length} layers · uncompressed estimates · feature layers are
        <span className="text-lagoon-400/90"> cached across rebuilds</span>
      </footer>
    </div>
  );
}
