import { useEffect, useRef, useState, type ReactNode } from "react";

/* ── scroll reveal ─────────────────────────────────────────────── */

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
      (entries) => {
        if (entries[0].isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`reveal ${inView ? "in" : ""} ${className}`}
    >
      {children}
    </div>
  );
}

/* ── clipboard / download ──────────────────────────────────────── */

export async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    ta.remove();
  }
}

export function download(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 800);
}

export function CopyBtn({
  text,
  label = "Copy",
  className = "",
}: {
  text: string;
  label?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={async () => {
        await copyText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1600);
      }}
      className={`group inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 font-mono text-[11.5px] font-medium tracking-wide transition-all duration-200 active:scale-95 ${
        copied
          ? "border-lagoon-400/50 bg-lagoon-400/10 text-lagoon-300"
          : "border-ink-600 bg-ink-800 text-mist-300 hover:border-ember-500/50 hover:text-ember-300"
      } ${className}`}
    >
      {copied ? <IconCheck className="h-3.5 w-3.5" /> : <IconCopy className="h-3.5 w-3.5" />}
      {copied ? "Copied" : label}
    </button>
  );
}

export function DownloadBtn({
  filename,
  content,
  label,
  primary = false,
}: {
  filename: string;
  content: string;
  label: string;
  primary?: boolean;
}) {
  return (
    <button
      onClick={() => download(filename, content)}
      className={`inline-flex items-center gap-2 rounded-md px-4 py-2 font-mono text-[12px] font-semibold tracking-wide transition-all duration-200 active:scale-95 ${
        primary
          ? "bg-ember-500 text-ink-950 shadow-[0_0_24px_rgba(245,168,60,0.25)] hover:bg-ember-400 hover:shadow-[0_0_32px_rgba(245,168,60,0.4)]"
          : "border border-ink-600 bg-ink-800 text-mist-300 hover:border-ember-500/50 hover:text-ember-300"
      }`}
    >
      <IconDownload className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}

/* ── inline icons ──────────────────────────────────────────────── */

type IconProps = { className?: string };

export function IconCopy({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="9" y="9" width="12" height="12" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

export function IconCheck({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M4 12.5l5 5L20 6.5" />
    </svg>
  );
}

export function IconDownload({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 3v12m0 0l-4.5-4.5M12 15l4.5-4.5M4 20h16" />
    </svg>
  );
}

export function IconArrowDown({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 4v16m0 0l-6-6m6 6l6-6" />
    </svg>
  );
}

export function IconContainer({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 2.5l8.5 4.9v9.2L12 21.5l-8.5-4.9V7.4L12 2.5z" />
      <path d="M3.5 7.4L12 12.3l8.5-4.9M12 12.3v9.2" />
    </svg>
  );
}
