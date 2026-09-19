import { DEFAULT_CONFIG, buildArtifacts } from "./lib/generator";

export default function App() {
  const arts = buildArtifacts(DEFAULT_CONFIG);

  return (
    <div className="min-h-screen bg-ink-950 text-mist-100 font-body p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="font-display font-bold text-3xl mb-4 text-ember-400">
          GHCR Devcontainer Forge
        </h1>
        <p className="text-mist-300 mb-8">
          Target: <code className="font-mono text-lagoon-400">nyeinpyaesone-ui/ERP</code>
        </p>

        <div className="space-y-6">
          <div className="border border-ink-700 rounded-xl p-6 bg-ink-900/70">
            <h2 className="font-display font-semibold text-xl mb-4">
              Seven-Step Sprint Integration Complete
            </h2>
            <ul className="space-y-2 text-sm text-mist-300">
              <li>✓ <strong>!sprint-setup</strong> — Sprint metadata stamped to .devcontainer/sprint.json</li>
              <li>✓ <strong>!env-setup</strong> — Toolchain probe via docker run after image pull</li>
              <li>✓ <strong>!dev-flow</strong> — Workflow reference written to dev-flow.md</li>
              <li>✓ <strong>!qa</strong> — QA checklist written to .devcontainer/qa-checklist.md</li>
              <li>✓ <strong>!code-review</strong> — CI policy gate workflow written to .github/workflows/</li>
              <li>✓ <strong>!cicd</strong> — Bootstrap one-liner documented in BOOTSTRAP.md</li>
              <li>✓ <strong>!maintenance</strong> — Regeneration guide written to MAINTENANCE.md</li>
            </ul>
          </div>

          <div className="border border-lagoon-500/40 rounded-xl p-6 bg-lagoon-500/[0.05]">
            <h2 className="font-display font-semibold text-xl mb-4 text-lagoon-300">
              Setup Script Ready
            </h2>
            <p className="text-mist-300 mb-4">
              The integrated setup-env.sh includes all seven sprint phases, policy enforcement,
              toolchain automation, and maintenance documentation.
            </p>
            <div className="flex gap-3">
              <a
                href="/setup-env.sh"
                download
                className="inline-flex items-center gap-2 rounded-lg bg-ember-500 px-4 py-2 text-sm font-bold text-ink-950 hover:bg-ember-400 transition-all"
              >
                <svg viewBox="0 0 16 16" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M8 2v8m0 0 3-3M8 10 5 7M3 13.5h10" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Download setup-env.sh
              </a>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(arts.setup);
                  alert("setup-env.sh copied to clipboard");
                }}
                className="inline-flex items-center gap-2 rounded-lg border border-ink-600 px-4 py-2 text-sm font-semibold text-mist-300 hover:border-ember-500/50 hover:text-ember-300 transition-all"
              >
                <svg viewBox="0 0 16 16" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.4">
                  <rect x="5.5" y="5.5" width="8" height="8" rx="1.5" />
                  <path d="M10.5 3.5v-.25A1.75 1.75 0 0 0 8.75 1.5h-5A1.75 1.75 0 0 0 2 3.25v5a1.75 1.75 0 0 0 1.75 1.75H4" strokeLinecap="round" />
                </svg>
                Copy to clipboard
              </button>
            </div>
          </div>

          <div className="border border-ink-700 rounded-xl p-6 bg-ink-900/70">
            <h2 className="font-display font-semibold text-lg mb-3">Script Statistics</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="font-display font-bold text-2xl text-mist-100">
                  {arts.setup.split("\n").length}
                </div>
                <div className="font-mono text-[10px] text-mist-600 uppercase tracking-wider">lines</div>
              </div>
              <div>
                <div className="font-display font-bold text-2xl text-ember-400">
                  {DEFAULT_CONFIG.langs.filter((l) => l.on).length}
                </div>
                <div className="font-mono text-[10px] text-mist-600 uppercase tracking-wider">toolchains</div>
              </div>
              <div>
                <div className="font-display font-bold text-2xl text-lagoon-400">
                  {DEFAULT_CONFIG.enforce.nonRoot && DEFAULT_CONFIG.enforce.engines && DEFAULT_CONFIG.enforce.secretsGuard && DEFAULT_CONFIG.enforce.preCommit && DEFAULT_CONFIG.enforce.schemaGate ? 5 : DEFAULT_CONFIG.enforce.nonRoot && DEFAULT_CONFIG.enforce.engines && DEFAULT_CONFIG.enforce.secretsGuard && DEFAULT_CONFIG.enforce.preCommit ? 4 : DEFAULT_CONFIG.enforce.nonRoot && DEFAULT_CONFIG.enforce.engines && DEFAULT_CONFIG.enforce.secretsGuard ? 3 : DEFAULT_CONFIG.enforce.nonRoot && DEFAULT_CONFIG.enforce.engines ? 2 : DEFAULT_CONFIG.enforce.nonRoot ? 1 : 0}
                </div>
                <div className="font-mono text-[10px] text-mist-600 uppercase tracking-wider">policy gates</div>
              </div>
              <div>
                <div className="font-display font-bold text-2xl text-skyx-400">
                  {DEFAULT_CONFIG.features.filter((f) => f.on).length}
                </div>
                <div className="font-mono text-[10px] text-mist-600 uppercase tracking-wider">features</div>
              </div>
            </div>
          </div>

          <div className="border border-ink-700 rounded-xl p-6 bg-ink-900/70">
            <h2 className="font-display font-semibold text-lg mb-3">Usage</h2>
            <pre className="font-mono text-xs text-mist-300 bg-ink-950/60 rounded-lg p-4 overflow-x-auto">
{`# Download and make executable
chmod +x setup-env.sh

# Run with all seven sprint phases
./setup-env.sh

# Dry-run to see what would happen
./setup-env.sh --dry-run

# Regenerate without re-cloning
./setup-env.sh --regenerate`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
