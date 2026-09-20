import { Kbd } from "./ui";

interface ChangelogModalProps {
  open: boolean;
  onClose: () => void;
}

export default function ChangelogModal({ open, onClose }: ChangelogModalProps) {
  if (!open) return null;

  const releases = [
    {
      version: "1.7.0",
      date: "2026-01-XX",
      highlights: ["Production-ready features", "Template library", "Interactive onboarding"],
      changes: [
        "Added export/import manifest functionality",
        "Added shareable URLs with base64 encoding",
        "Added keyboard shortcuts help modal",
        "Added interactive onboarding tour",
        "Added template library with 6 pre-configured setups",
        "Added version badge to header",
        "Enhanced header layout with utility buttons",
        "Improved accessibility with ARIA labels",
      ],
    },
    {
      version: "1.6.0",
      date: "2026-01-XX",
      highlights: ["Seven-step sprint integration", "Policy enforcement"],
      changes: [
        "Integrated seven-step sprint workflow (sprint-setup → maintenance)",
        "Added policy enforcement gates (P1-P5)",
        "Added toolchain automation (Rust, Go, Python, Java, .NET, PHP, Ruby)",
        "Added essential tooling groups (core, build, shell, vcs, net)",
        "Added ship readiness gauge with animated scoring",
        "Added policy matrix with enforcement status",
        "Added dry-run terminal simulator",
        "Added command palette with 33+ commands",
      ],
    },
    {
      version: "1.5.0",
      date: "2026-01-XX",
      highlights: ["Performance backend", "Virtualized editor"],
      changes: [
        "Added Web Worker backend for off-main-thread computation",
        "Added virtualized code editor with line windowing",
        "Added memoized syntax highlighting",
        "Added latency sparkline in backend chip",
        "Added request coalescing and caching",
        "Improved scroll performance for large artifacts",
      ],
    },
    {
      version: "1.4.0",
      date: "2026-01-XX",
      highlights: ["Image anatomy", "Language toolchains"],
      changes: [
        "Added image anatomy layer stack visualization",
        "Added language toolchain automation",
        "Added per-runtime install automation (rustup, tarball, pyenv, apt)",
        "Added toolchain verification in quickstart",
        "Added coral toolchain layer in image stack",
        "Enhanced build estimate with toolchain costs",
      ],
    },
    {
      version: "1.3.0",
      date: "2026-01-XX",
      highlights: ["Essential tooling", "Clone strategy"],
      changes: [
        "Added essential tooling groups (58 packages)",
        "Added clone strategy configuration",
        "Added git tuning options",
        "Added Dockerfile grouped install blocks",
        "Enhanced setup script with tooling awareness",
      ],
    },
    {
      version: "1.2.0",
      date: "2026-01-XX",
      highlights: ["CI policy gate", "Bootstrap one-liner"],
      changes: [
        "Added CI policy gate workflow",
        "Added bootstrap one-liner strip",
        "Added quickstart verification script",
        "Enhanced dry-run with policy simulation",
      ],
    },
    {
      version: "1.1.0",
      date: "2026-01-XX",
      highlights: ["Session persistence", "Keyboard shortcuts"],
      changes: [
        "Added session persistence with localStorage",
        "Added keyboard shortcuts (⌘1-5, ⌘S, ⌘⏎)",
        "Added session restore announcement",
        "Enhanced reset with config clearing",
      ],
    },
    {
      version: "1.0.0",
      date: "2026-01-XX",
      highlights: ["Initial release"],
      changes: [
        "Initial release of GHCR Devcontainer Forge",
        "Generated setup-env.sh script",
        "Generated devcontainer.json",
        "Generated Dockerfile",
        "Interactive configuration UI",
        "Real-time artifact regeneration",
      ],
    },
  ];

  return (
    <div className="fixed inset-0 z-50">
      <div className="backdrop-in absolute inset-0 bg-ink-950/80 backdrop-blur-[3px]" onClick={onClose} />
      <div className="modal-in absolute left-1/2 top-[10vh] w-[min(92vw,720px)] -translate-x-1/2 border border-ink-600 rounded-xl bg-ink-900 shadow-[0_30px_90px_-20px_rgba(0,0,0,0.9)] overflow-hidden">
        <div className="flex items-center justify-between border-b border-ink-700/70 bg-ink-850 px-5 py-3.5">
          <div className="flex items-center gap-3">
            <svg viewBox="0 0 16 16" className="w-5 h-5 text-ember-400" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M8 2v12M4 6l4-4 4 4M4 10l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <h2 className="font-display font-semibold text-[16px] text-mist-100">Changelog</h2>
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

        <div className="code-scroll max-h-[70vh] overflow-y-auto p-5 space-y-6">
          {releases.map((release, idx) => (
            <div key={release.version} className="relative">
              {/* Timeline dot */}
              <div className="absolute left-0 top-1.5 w-2 h-2 rounded-full bg-ember-500" />
              {idx < releases.length - 1 && (
                <div className="absolute left-[3px] top-4 bottom-[-24px] w-[2px] bg-ink-700" />
              )}

              {/* Content */}
              <div className="ml-6">
                <div className="flex items-baseline gap-3 mb-2">
                  <h3 className="font-display font-bold text-[15px] text-mist-100">
                    v{release.version}
                  </h3>
                  <span className="font-mono text-[10.5px] text-mist-600">{release.date}</span>
                </div>

                {/* Highlights */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {release.highlights.map((h) => (
                    <span
                      key={h}
                      className="font-mono text-[10px] px-2 py-0.5 rounded border border-lagoon-500/40 text-lagoon-300 bg-lagoon-500/[0.08]"
                    >
                      {h}
                    </span>
                  ))}
                </div>

                {/* Changes */}
                <ul className="space-y-1.5">
                  {release.changes.map((change) => (
                    <li key={change} className="flex items-start gap-2 text-[12px] text-mist-400 leading-relaxed">
                      <span className="text-lagoon-400 mt-0.5">•</span>
                      <span>{change}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-ink-700/70 bg-ink-850 px-5 py-3 font-mono text-[10.5px] text-mist-600">
          <span className="text-mist-500">Current version:</span> v1.7.0 · Press <Kbd>Esc</Kbd> to close
        </div>
      </div>
    </div>
  );
}
