import { useEffect, useRef, useState } from "react";
import type { RunLine } from "../lib/generator";

const LINE_COLOR: Record<RunLine["c"], string> = {
  cmd: "text-mist-100 font-semibold",
  log: "text-skyx-400",
  ok: "text-lagoon-400",
  warn: "text-ember-500",
  dim: "text-mist-600",
  exit: "text-mist-300 font-semibold",
  err: "text-coral-400 font-semibold",
};

export default function DryRunModal({
  lines,
  title,
  onClose,
  onDone,
  failed = false,
}: {
  lines: RunLine[];
  title: string;
  onClose: () => void;
  onDone: () => void;
  failed?: boolean;
}) {
  const [shown, setShown] = useState(0);
  const bodyRef = useRef<HTMLDivElement>(null);
  const timers = useRef<number[]>([]);
  const done = shown >= lines.length;

  useEffect(() => {
    // staggered reveal
    let t = 220;
    lines.forEach((ln, i) => {
      const delay = ln.c === "dim" && ln.t === "" ? 90 : ln.t.length > 60 ? 460 : 260;
      t += delay;
      timers.current.push(window.setTimeout(() => setShown(i + 1), t));
    });
    const cur = timers.current;
    return () => cur.forEach(clearTimeout);
  }, [lines]);

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight, behavior: "smooth" });
  }, [shown]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const fired = useRef(false);
  useEffect(() => {
    if (done && !fired.current) {
      fired.current = true;
      const t = window.setTimeout(onDone, 500);
      return () => clearTimeout(t);
    }
  }, [done, onDone]);

  const skip = () => {
    timers.current.forEach(clearTimeout);
    setShown(lines.length);
  };

  const pct = Math.round((shown / lines.length) * 100);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4">
      <div className="backdrop-in absolute inset-0 bg-ink-950/80 backdrop-blur-[3px]" onClick={onClose} />
      <div className="modal-in relative w-full max-w-2xl border border-ink-600 rounded-xl bg-ink-900 shadow-[0_30px_90px_-20px_rgba(0,0,0,0.9)] overflow-hidden">
        {/* window chrome */}
        <div className="flex items-center gap-2 border-b border-ink-700/70 bg-ink-850 px-4 py-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-coral-500/80" />
          <span className="w-2.5 h-2.5 rounded-full bg-ember-500/80" />
          <span className="w-2.5 h-2.5 rounded-full bg-lagoon-500/80" />
          <span className="ml-3 font-mono text-[12px] text-mist-500 truncate">
            dry-run · {title}
          </span>
          <span className="ml-auto font-mono text-[11px] text-mist-600">
            {done ? (
              failed ? (
                <span className="text-coral-400">exit 1</span>
              ) : (
                <span className="text-lagoon-400">exit 0</span>
              )
            ) : (
              `${pct}%`
            )}
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="close"
            className="grid place-items-center w-6 h-6 rounded-md text-mist-500 hover:text-mist-100 hover:bg-ink-700 transition-colors"
          >
            <svg viewBox="0 0 12 12" className="w-3 h-3" stroke="currentColor" strokeWidth="1.6" fill="none">
              <path d="M2.5 2.5l7 7m0-7-7 7" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* progress */}
        <div className="h-1 bg-ink-800">
          <div
            className={`h-full transition-all duration-300 ${failed ? "bg-coral-500" : "bg-lagoon-500"} ${
              done ? "" : "bar-stripes"
            }`}
            style={{ width: `${pct}%` }}
          />
        </div>

        {/* terminal body */}
        <div
          ref={bodyRef}
          className="code-scroll scanlines overflow-y-auto h-[46vh] min-h-[280px] bg-ink-950/80 px-4 py-3 font-mono text-[12.5px] leading-[1.7]"
        >
          {lines.slice(0, shown).map((ln, i) => (
            <div key={i} className={LINE_COLOR[ln.c]}>
              {ln.t || "\u00A0"}
            </div>
          ))}
          {!done && (
            <span className="caret inline-block w-[7px] h-[15px] translate-y-[2px] bg-lagoon-400" />
          )}
        </div>

        {/* footer */}
        <div className="flex items-center gap-3 border-t border-ink-700/70 bg-ink-850 px-4 py-3">
          {!done ? (
            <button
              type="button"
              onClick={skip}
              className="rounded-lg border border-ink-600 px-3.5 py-1.5 text-[12px] font-mono text-mist-300 hover:border-ember-500/50 hover:text-ember-300 transition-all active:scale-95"
            >
              skip animation ›
            </button>
          ) : failed ? (
            <span className="flex items-center gap-2 text-[12px] font-mono text-coral-400">
              <svg viewBox="0 0 16 16" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M3 3l10 10M13 3 3 13" strokeLinecap="round" />
              </svg>
              policy gate refused the build — fix the manifest
            </span>
          ) : (
            <span className="flex items-center gap-2 text-[12px] font-mono text-lagoon-400">
              <svg viewBox="0 0 16 16" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M3 8.5 6.5 12 13 4.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              environment verified — all policy gates green
            </span>
          )}
          <button
            type="button"
            onClick={onClose}
            className="ml-auto rounded-lg bg-ember-500 px-4 py-1.5 text-[12px] font-semibold text-ink-950 hover:bg-ember-400 transition-all active:scale-95"
          >
            {done ? "back to forge" : "close"}
          </button>
        </div>
      </div>
    </div>
  );
}
