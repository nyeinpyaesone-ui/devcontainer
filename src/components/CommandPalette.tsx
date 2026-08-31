import { useEffect, useMemo, useRef, useState } from "react";
import { Kbd } from "./ui";

export interface PaletteItem {
  id: string;
  label: string;
  hint?: string;
  kbd?: string;
  keywords?: string;
  run: () => void;
}

export interface PaletteGroup {
  title: string;
  items: PaletteItem[];
}

export default function CommandPalette({
  open,
  onClose,
  groups,
}: {
  open: boolean;
  onClose: () => void;
  groups: PaletteGroup[];
}) {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    if (open) {
      setQuery("");
      setActive(0);
    }
  }, [open]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return groups
      .map((g) => ({
        ...g,
        items: g.items.filter(
          (i) =>
            !q ||
            i.label.toLowerCase().includes(q) ||
            (i.keywords ?? "").toLowerCase().includes(q) ||
            (i.hint ?? "").toLowerCase().includes(q)
        ),
      }))
      .filter((g) => g.items.length > 0);
  }, [groups, query]);

  const flat = useMemo(() => filtered.flatMap((g) => g.items), [filtered]);

  useEffect(() => setActive(0), [query]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setActive((a) => Math.min(a + 1, flat.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActive((a) => Math.max(a - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        const it = flat[active];
        if (it) {
          it.run();
          onClose();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, flat, active, onClose]);

  useEffect(() => {
    itemRefs.current[active]?.scrollIntoView({ block: "nearest" });
  }, [active]);

  if (!open) return null;

  let cursor = -1;

  return (
    <div className="fixed inset-0 z-50">
      <div className="backdrop-in absolute inset-0 bg-ink-950/80 backdrop-blur-[3px]" onClick={onClose} />
      <div className="modal-in absolute left-1/2 top-[12vh] w-[min(92vw,560px)] -translate-x-1/2 border border-ink-600 rounded-xl bg-ink-900 shadow-[0_30px_90px_-20px_rgba(0,0,0,0.9)] overflow-hidden">
        {/* input */}
        <div className="flex items-center gap-3 border-b border-ink-700/70 bg-ink-850 px-4 py-3">
          <svg viewBox="0 0 16 16" className="w-4 h-4 text-mist-500 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.6">
            <circle cx="7" cy="7" r="4.5" />
            <path d="m10.5 10.5 3 3" strokeLinecap="round" />
          </svg>
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="type a command — open, toggle, jump, ship…"
            className="flex-1 bg-transparent font-mono text-[13px] text-mist-100 placeholder:text-mist-600 outline-none"
          />
          <Kbd>esc</Kbd>
        </div>

        {/* results */}
        <div className="code-scroll max-h-[52vh] overflow-y-auto py-2">
          {flat.length === 0 && (
            <div className="px-5 py-8 text-center font-mono text-[12px] text-mist-600">
              no command matches <span className="text-coral-400">“{query}”</span>
            </div>
          )}
          {filtered.map((g) => (
            <div key={g.title}>
              <div className="px-4 pt-2.5 pb-1 font-mono text-[9.5px] uppercase tracking-[0.16em] text-mist-600">
                {g.title}
              </div>
              {g.items.map((it) => {
                cursor += 1;
                const idx = cursor;
                const isActive = idx === active;
                return (
                  <button
                    key={it.id}
                    ref={(el) => {
                      itemRefs.current[idx] = el;
                    }}
                    type="button"
                    onClick={() => {
                      it.run();
                      onClose();
                    }}
                    onMouseEnter={() => setActive(idx)}
                    className={`w-full flex items-center gap-3 px-4 py-2 text-left transition-colors duration-100 ${
                      isActive ? "bg-ember-500/[0.12]" : "hover:bg-ink-800/50"
                    }`}
                  >
                    <span
                      className={`w-1 h-4 rounded-full transition-colors ${
                        isActive ? "bg-ember-500" : "bg-transparent"
                      }`}
                    />
                    <span
                      className={`flex-1 font-mono text-[12.5px] ${
                        isActive ? "text-ember-200" : "text-mist-200"
                      }`}
                    >
                      {it.label}
                    </span>
                    {it.hint && <span className="font-mono text-[10.5px] text-mist-600">{it.hint}</span>}
                    {it.kbd && (
                      <span className="flex items-center gap-1">
                        {it.kbd.split("+").map((k) => (
                          <Kbd key={k}>{k}</Kbd>
                        ))}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* footer */}
        <div className="flex items-center gap-3 border-t border-ink-700/70 bg-ink-850 px-4 py-2.5 font-mono text-[10.5px] text-mist-600">
          <span className="flex items-center gap-1">
            <Kbd>↑</Kbd>
            <Kbd>↓</Kbd> navigate
          </span>
          <span className="flex items-center gap-1">
            <Kbd>↵</Kbd> run
          </span>
          <span className="ml-auto text-mist-700">{flat.length} commands</span>
        </div>
      </div>
    </div>
  );
}
