import { type PolicyState } from "../lib/generator";

const STYLES: Record<
  PolicyState["status"],
  { dot: string; text: string; ring: string; word: string; icon: string }
> = {
  enforced: {
    dot: "bg-lagoon-400",
    text: "text-lagoon-300",
    ring: "border-lagoon-500/30 hover:border-lagoon-500/60",
    word: "enforced",
    icon: "M2.5 7 6 10.5 13.5 3",
  },
  warn: {
    dot: "bg-ember-500",
    text: "text-ember-300",
    ring: "border-ember-500/30 hover:border-ember-500/60",
    word: "warning",
    icon: "M8 3v5.5M8 12.5v.1",
  },
  violation: {
    dot: "bg-coral-500 violation-pulse",
    text: "text-coral-400",
    ring: "border-coral-500/45 hover:border-coral-400/70",
    word: "violation",
    icon: "M3 3l10 10M13 3 3 13",
  },
  off: {
    dot: "bg-ink-600",
    text: "text-mist-600",
    ring: "border-ink-700 hover:border-ink-600",
    word: "off",
    icon: "M2.5 8h11",
  },
};

export default function PolicyMatrix({ policies }: { policies: PolicyState[] }) {
  const enforced = policies.filter((p) => p.status === "enforced").length;
  const violations = policies.filter((p) => p.status === "violation");
  const warns = policies.filter((p) => p.status === "warn");

  return (
    <div
      className={`border rounded-xl px-4 py-3.5 transition-colors duration-300 ${
        violations.length
          ? "border-coral-500/40 bg-coral-500/[0.04]"
          : "border-ink-700/80 bg-ink-900/70"
      }`}
    >
      <div className="flex items-center gap-3 mb-3">
        <span className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-mist-600">
          policy matrix
        </span>
        <span
          key={enforced}
          className={`stat-flash font-mono text-[11px] ${
            violations.length ? "text-coral-400" : "text-lagoon-400"
          }`}
        >
          {enforced}/{policies.length} enforced
        </span>
        {violations.length > 0 && (
          <span className="ml-auto flex items-center gap-1.5 font-mono text-[10.5px] text-coral-400">
            <span className="w-1.5 h-1.5 rounded-full bg-coral-500 violation-pulse" />
            build refused
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {policies.map((p) => {
          const s = STYLES[p.status];
          return (
            <button
              key={p.id}
              type="button"
              title={p.detail}
              className={`group flex items-center gap-2 rounded-lg border ${s.ring} bg-ink-950/50 px-2.5 py-1.5 transition-all duration-200 active:scale-95`}
            >
              <svg
                viewBox="0 0 16 16"
                className={`w-3 h-3 shrink-0 ${s.text}`}
                fill="none"
                stroke="currentColor"
                strokeWidth="1.9"
                strokeLinecap="round"
              >
                <path d={s.icon} />
              </svg>
              <span className="font-mono text-[10px] text-mist-600">{p.id}</span>
              <span className={`text-[12px] font-medium ${s.text}`}>{p.label}</span>
              <span className={`hidden md:inline font-mono text-[9.5px] uppercase tracking-wider opacity-70 ${s.text}`}>
                {s.word}
              </span>
            </button>
          );
        })}
      </div>

      {(violations.length > 0 || warns.length > 0) && (
        <p
          className={`mt-2.5 text-[11.5px] font-mono leading-relaxed ${
            violations.length ? "text-coral-400/90" : "text-ember-400/80"
          }`}
        >
          {violations.length
            ? `▲ ${violations.map((v) => v.detail).join(" · ")}`
            : `▲ ${warns.map((w) => `${w.id}: ${w.detail}`).join(" · ")}`}
        </p>
      )}
    </div>
  );
}
