import { useEffect } from "react";
import { Kbd } from "./ui";

interface ShortcutsModalProps {
  open: boolean;
  onClose: () => void;
}

export default function ShortcutsModal({ open, onClose }: ShortcutsModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  const shortcuts = [
    {
      category: "General",
      items: [
        { keys: ["⌘", "K"], action: "Open command palette" },
        { keys: ["?"], action: "Show this help" },
        { keys: ["Esc"], action: "Close modals" },
      ],
    },
    {
      category: "Artifacts",
      items: [
        { keys: ["⌘", "1"], action: "Open setup-env.sh" },
        { keys: ["⌘", "2"], action: "Open devcontainer.json" },
        { keys: ["⌘", "3"], action: "Open Dockerfile" },
        { keys: ["⌘", "4"], action: "Open CI workflow" },
        { keys: ["⌘", "5"], action: "Open quickstart.sh" },
      ],
    },
    {
      category: "Actions",
      items: [
        { keys: ["⌘", "S"], action: "Download all artifacts" },
        { keys: ["⌘", "⏎"], action: "Run dry-run simulation" },
        { keys: ["⌘", "C"], action: "Copy setup-env.sh to clipboard" },
      ],
    },
    {
      category: "Navigation",
      items: [
        { keys: ["↑", "↓"], action: "Navigate command palette" },
        { keys: ["↵"], action: "Execute command" },
      ],
    },
  ];

  return (
    <div className="fixed inset-0 z-50">
      <div className="backdrop-in absolute inset-0 bg-ink-950/80 backdrop-blur-[3px]" onClick={onClose} />
      <div className="modal-in absolute left-1/2 top-[10vh] w-[min(92vw,640px)] -translate-x-1/2 border border-ink-600 rounded-xl bg-ink-900 shadow-[0_30px_90px_-20px_rgba(0,0,0,0.9)] overflow-hidden">
        <div className="flex items-center justify-between border-b border-ink-700/70 bg-ink-850 px-5 py-3.5">
          <div className="flex items-center gap-3">
            <svg viewBox="0 0 16 16" className="w-5 h-5 text-ember-400" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="2" y="3" width="12" height="10" rx="1.5" />
              <path d="M5 6h.01M8 6h.01M11 6h.01M5 9h6" strokeLinecap="round" />
            </svg>
            <h2 className="font-display font-semibold text-[16px] text-mist-100">Keyboard Shortcuts</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid place-items-center w-7 h-7 rounded-md text-mist-500 hover:text-mist-100 hover:bg-ink-700 transition-colors"
            aria-label="close"
          >
            <svg viewBox="0 0 12 12" className="w-3.5 h-3.5" stroke="currentColor" strokeWidth="1.6" fill="none">
              <path d="M2.5 2.5l7 7m0-7-7 7" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="code-scroll max-h-[70vh] overflow-y-auto p-5 space-y-5">
          {shortcuts.map((group) => (
            <div key={group.category}>
              <h3 className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-mist-600 mb-2.5">
                {group.category}
              </h3>
              <div className="space-y-1.5">
                {group.items.map((item) => (
                  <div key={item.action} className="flex items-center justify-between gap-4">
                    <span className="font-mono text-[12.5px] text-mist-300">{item.action}</span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {item.keys.map((key, i) => (
                        <span key={i} className="flex items-center gap-1.5">
                          <Kbd>{key}</Kbd>
                          {i < item.keys.length - 1 && <span className="text-mist-600 text-[10px]">+</span>}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-ink-700/70 bg-ink-850 px-5 py-3 font-mono text-[10.5px] text-mist-600">
          <span className="text-mist-500">Tip:</span> Press <Kbd>?</Kbd> anytime to open this help
        </div>
      </div>
    </div>
  );
}
