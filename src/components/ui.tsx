import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type KeyboardEvent,
} from "react";

// ── scroll reveal ────────────────────────────────────────────────────────────

export function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold: 0.08, rootMargin: "0px 0px -24px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`reveal ${inView ? "is-in" : ""} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

// ── section frame ────────────────────────────────────────────────────────────

export function Section({
  index,
  title,
  hint,
  anchor,
  children,
}: {
  index: string;
  title: string;
  hint?: string;
  anchor?: string;
  children: ReactNode;
}) {
  return (
    <section
      id={anchor}
      className="border border-ink-700/80 bg-ink-900/70 rounded-xl overflow-hidden transition-colors duration-300 hover:border-ink-600 scroll-mt-24"
    >
      <header className="flex items-baseline gap-3 px-4 pt-3.5 pb-3 border-b border-ink-700/60 bg-ink-850/60">
        <span className="step-num">{index}</span>
        <h2 className="font-display font-semibold tracking-wide text-[15px] text-mist-100">
          {title}
        </h2>
        {hint && (
          <span className="ml-auto text-[11px] text-mist-600 font-mono">{hint}</span>
        )}
      </header>
      <div className="p-4 space-y-3.5">{children}</div>
    </section>
  );
}

// ── switch ───────────────────────────────────────────────────────────────────

export function Switch({
  on,
  onChange,
  label,
  desc,
  right,
}: {
  on: boolean;
  onChange: (v: boolean) => void;
  label: string;
  desc?: string;
  right?: ReactNode;
}) {
  return (
    <div
      className={`group flex items-center gap-3 rounded-lg border px-3 py-2.5 transition-all duration-200 cursor-pointer ${
        on
          ? "border-lagoon-500/35 bg-lagoon-500/[0.06]"
          : "border-ink-700/70 bg-ink-850/40 hover:border-ink-600"
      }`}
      onClick={() => onChange(!on)}
      role="switch"
      aria-checked={on}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === " " || e.key === "Enter") {
          e.preventDefault();
          onChange(!on);
        }
      }}
    >
      <button
        type="button"
        tabIndex={-1}
        className={`relative shrink-0 w-9 h-5 rounded-full transition-colors duration-200 ${
          on ? "bg-lagoon-500" : "bg-ink-600"
        }`}
      >
        <span
          className={`absolute top-0.5 w-4 h-4 rounded-full bg-ink-950 transition-all duration-200 ease-out ${
            on ? "left-[18px]" : "left-0.5"
          }`}
          style={{
            boxShadow: on ? "0 0 8px rgba(69,214,194,0.5)" : "none",
          }}
        />
      </button>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span
            className={`text-[13px] font-medium transition-colors ${
              on ? "text-mist-100" : "text-mist-300"
            }`}
          >
            {label}
          </span>
          {right}
        </div>
        {desc && (
          <p className="text-[11px] text-mist-600 leading-snug mt-0.5">{desc}</p>
        )}
      </div>
    </div>
  );
}

// ── select ───────────────────────────────────────────────────────────────────

export function Select({
  value,
  onChange,
  options,
  ariaLabel,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  ariaLabel: string;
}) {
  return (
    <div className="relative">
      <select
        aria-label={ariaLabel}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none rounded-lg border border-ink-700 bg-ink-850/80 px-3 py-2 pr-8 text-[13px] font-mono text-mist-100 transition-colors hover:border-ink-600 focus:border-ember-500/60"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <svg
        viewBox="0 0 12 12"
        className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-mist-500"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
      >
        <path d="M2.5 4.5 6 8l3.5-3.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

// ── text field ───────────────────────────────────────────────────────────────

export function TextField({
  label,
  value,
  onChange,
  mono = true,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  mono?: boolean;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="block text-[10.5px] uppercase tracking-[0.14em] text-mist-600 font-mono mb-1.5">
        {label}
      </span>
      <input
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full rounded-lg border border-ink-700 bg-ink-850/80 px-3 py-2 text-[13px] text-mist-100 transition-colors hover:border-ink-600 focus:border-ember-500/60 placeholder:text-mist-600 ${
          mono ? "font-mono" : ""
        }`}
      />
    </label>
  );
}

// ── chip input ───────────────────────────────────────────────────────────────

export function ChipInput({
  values,
  onChange,
  placeholder,
  ariaLabel,
}: {
  values: string[];
  onChange: (v: string[]) => void;
  placeholder: string;
  ariaLabel: string;
}) {
  const [draft, setDraft] = useState("");

  const add = () => {
    const v = draft.trim().replace(/,+$/, "");
    if (v && !values.includes(v)) onChange([...values, v]);
    setDraft("");
  };

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      add();
    } else if (e.key === "Backspace" && !draft && values.length) {
      onChange(values.slice(0, -1));
    }
  };

  return (
    <div className="rounded-lg border border-ink-700 bg-ink-850/80 p-2 transition-colors hover:border-ink-600 focus-within:border-ember-500/60">
      <div className="flex flex-wrap gap-1.5">
        {values.map((v) => (
          <span
            key={v}
            className="chip-in inline-flex items-center gap-1.5 rounded-md border border-skyx-400/25 bg-skyx-400/[0.08] pl-2 pr-1 py-0.5 text-[11.5px] font-mono text-skyx-400"
          >
            {v}
            <button
              type="button"
              aria-label={`remove ${v}`}
              onClick={() => onChange(values.filter((x) => x !== v))}
              className="grid place-items-center w-4 h-4 rounded text-skyx-400/60 hover:text-coral-400 hover:bg-coral-500/10 transition-colors"
            >
              <svg viewBox="0 0 10 10" className="w-2.5 h-2.5" stroke="currentColor" strokeWidth="1.6" fill="none">
                <path d="M2 2l6 6M8 2l-6 6" strokeLinecap="round" />
              </svg>
            </button>
          </span>
        ))}
        <input
          aria-label={ariaLabel}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKey}
          onBlur={() => draft.trim() && add()}
          placeholder={values.length ? "" : placeholder}
          className="flex-1 min-w-[120px] bg-transparent px-1 py-0.5 text-[12px] font-mono text-mist-100 placeholder:text-mist-600 outline-none"
        />
      </div>
    </div>
  );
}

// ── inline SVG icons ─────────────────────────────────────────────────────────

export function IconCopy({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={className} fill="none" stroke="currentColor" strokeWidth="1.4">
      <rect x="5.5" y="5.5" width="8" height="8" rx="1.5" />
      <path d="M10.5 3.5v-.25A1.75 1.75 0 0 0 8.75 1.5h-5A1.75 1.75 0 0 0 2 3.25v5a1.75 1.75 0 0 0 1.75 1.75H4" strokeLinecap="round" />
    </svg>
  );
}

export function IconCheck({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={className} fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M3 8.5 6.5 12 13 4.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconDownload({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={className} fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M8 2v8m0 0 3-3M8 10 5 7M3 13.5h10" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconPlay({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={className} fill="currentColor">
      <path d="M5 3.2v9.6c0 .5.55.8.98.53l7.2-4.8a.63.63 0 0 0 0-1.06L5.98 2.67A.63.63 0 0 0 5 3.2Z" />
    </svg>
  );
}

export function IconTerminal({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={className} fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="m3 4.5 3.5 3.5L3 11.5M8.5 12H13" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconReset({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={className} fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M2.8 6.5a5.5 5.5 0 1 1-.6 4M2.8 6.5V2.8m0 3.7h3.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function LogoMark({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="none">
      <rect x="1" y="1" width="30" height="30" rx="7" fill="#0d1526" stroke="#1a2947" />
      <path d="M8 13.5 16 9l8 4.5-8 4.5z" stroke="#f5a83c" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M8 18l8 4.5L24 18" stroke="#45d6c2" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M8 22.5 16 27l8-4.5" stroke="#82b6ff" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}

// copyText / useClipboard live in services/clipboard;
// downloadFile / downloadBundle live in services/downloads.

// ── animated number ──────────────────────────────────────────────────────────

export function CountUp({
  value,
  duration = 700,
  className = "",
}: {
  value: number;
  duration?: number;
  className?: string;
}) {
  const [disp, setDisp] = useState(0);
  const current = useRef(0);
  const raf = useRef(0);

  useEffect(() => {
    const from = current.current;
    const to = value;
    if (from === to) return;
    const t0 = performance.now();
    const tick = (t: number) => {
      const k = Math.min(1, (t - t0) / duration);
      const eased = 1 - Math.pow(1 - k, 3);
      const v = from + (to - from) * eased;
      current.current = v;
      setDisp(v);
      if (k < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [value, duration]);

  return <span className={className}>{Math.round(disp)}</span>;
}

// ── keyboard key chip ────────────────────────────────────────────────────────

export function Kbd({ children }: { children: ReactNode }) {
  return <kbd className="kbd">{children}</kbd>;
}

// ── radial gauge ─────────────────────────────────────────────────────────────

export function Gauge({
  score,
  size = 92,
  className = "",
}: {
  score: number;
  size?: number;
  className?: string;
}) {
  const clamped = Math.min(Math.max(score, 0), 100);
  const r = (size - 14) / 2;
  const C = 2 * Math.PI * r;
  const off = C * (1 - clamped / 100);
  const color =
    clamped >= 90 ? "#45d6c2" : clamped >= 70 ? "#ffb454" : clamped >= 40 ? "#57b3ff" : "#f75c74";
  return (
    <svg width={size} height={size} className={className} aria-hidden>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="rgba(255,255,255,0.06)"
        strokeWidth="7"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth="7"
        strokeLinecap="round"
        strokeDasharray={C}
        strokeDashoffset={off}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{
          transition:
            "stroke-dashoffset 0.8s cubic-bezier(0.22, 1, 0.36, 1), stroke 0.4s ease",
          filter: `drop-shadow(0 0 6px ${color}55)`,
        }}
      />
    </svg>
  );
}

// ── latency sparkline ────────────────────────────────────────────────────────

export function Sparkline({ values, className = "" }: { values: number[]; className?: string }) {
  if (values.length < 2) {
    return (
      <svg viewBox="0 0 56 16" className={className} aria-hidden>
        <line x1="1" y1="12" x2="55" y2="12" stroke="currentColor" strokeOpacity="0.25" strokeWidth="1.4" strokeDasharray="2 3" />
      </svg>
    );
  }
  const w = 56;
  const h = 16;
  const max = Math.max(...values, 1);
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * (w - 2) + 1;
    const y = h - 2 - (v / max) * (h - 5);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const last = pts[pts.length - 1].split(",");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={className} aria-hidden>
      <polyline
        points={pts.join(" ")}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
        strokeLinecap="round"
        strokeOpacity="0.85"
      />
      <circle cx={last[0]} cy={last[1]} r="1.8" fill="currentColor" />
    </svg>
  );
}
