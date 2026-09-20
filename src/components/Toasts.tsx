import { useToasts } from "../services/toast";

/** toast host — renders whatever the toast service currently holds */
export default function Toasts() {
  const toasts = useToasts();
  return (
    <div className="fixed bottom-5 right-5 z-[60] flex flex-col gap-2 items-end pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="toast-in flex items-center gap-2.5 rounded-lg border border-lagoon-500/35 bg-ink-850/95 px-3.5 py-2.5 shadow-[0_12px_36px_-12px_rgba(0,0,0,0.85)]"
        >
          <span className="grid place-items-center w-5 h-5 rounded-full bg-lagoon-500/15 text-lagoon-400">
            <svg viewBox="0 0 16 16" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 8.5 6.5 12 13 4.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <span className="text-[12.5px] font-mono text-mist-100">{t.msg}</span>
        </div>
      ))}
    </div>
  );
}
