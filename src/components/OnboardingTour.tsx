import { useEffect, useState } from "react";
import { Kbd } from "./ui";

interface OnboardingTourProps {
  open: boolean;
  onClose: () => void;
}

export default function OnboardingTour({ open, onClose }: OnboardingTourProps) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!open) setStep(0);
  }, [open]);

  if (!open) return null;

  const steps = [
    {
      title: "Welcome to the GHCR Devcontainer Forge",
      content:
        "This tool generates production-ready devcontainer environments for your repositories. Let's take a quick tour to get you started.",
      icon: "👋",
    },
    {
      title: "Configure Your Environment",
      content:
        "Use the left panel to configure your devcontainer: target registry, base image, features, toolchains, essential tooling, network ports, extensions, and enforcement policies.",
      icon: "⚙️",
    },
    {
      title: "Generated Artifacts",
      content:
        "The right panel shows your generated artifacts in real-time: setup-env.sh, devcontainer.json, Dockerfile, CI workflow, and quickstart script. Every change updates instantly.",
      icon: "📦",
    },
    {
      title: "Ship Readiness Gauge",
      content:
        "The readiness gauge scores your configuration from 0-100 based on best practices. Green means ship-ready, yellow means mostly ready, red means gaps remain.",
      icon: "🎯",
    },
    {
      title: "Command Palette",
      content:
        "Press ⌘K (or Ctrl+K) to open the command palette. Jump to any section, toggle features, download artifacts, or run a dry-run simulation — all from your keyboard.",
      icon: "⌨️",
    },
    {
      title: "Policy Enforcement",
      content:
        "Five policy gates (P1-P5) ensure your environment meets security and quality standards: non-root execution, runtime pinning, secret hygiene, pre-commit guards, and schema validation.",
      icon: "🛡️",
    },
    {
      title: "Export & Share",
      content:
        "Export your manifest as JSON, import it later, or share a URL with your team. Everything is saved to your browser automatically.",
      icon: "🔗",
    },
    {
      title: "Ready to Ship!",
      content:
        "You're all set! Configure your environment, review the generated artifacts, and download setup-env.sh. Run it in your repo to bootstrap the devcontainer.",
      icon: "🚀",
    },
  ];

  const current = steps[step];
  const isLast = step === steps.length - 1;

  return (
    <div className="fixed inset-0 z-50">
      <div className="backdrop-in absolute inset-0 bg-ink-950/90 backdrop-blur-[6px]" />
      <div className="modal-in absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(92vw,560px)] border border-ink-600 rounded-2xl bg-ink-900 shadow-[0_40px_120px_-30px_rgba(0,0,0,0.9)] overflow-hidden">
        {/* Progress bar */}
        <div className="h-1 bg-ink-800">
          <div
            className="h-full bg-gradient-to-r from-ember-500 to-lagoon-500 transition-all duration-500 ease-out"
            style={{ width: `${((step + 1) / steps.length) * 100}%` }}
          />
        </div>

        {/* Content */}
        <div className="p-8 text-center">
          <div className="text-6xl mb-4">{current.icon}</div>
          <h2 className="font-display font-bold text-[22px] text-mist-100 mb-3">
            {current.title}
          </h2>
          <p className="font-body text-[14px] text-mist-400 leading-relaxed max-w-[440px] mx-auto">
            {current.content}
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-ink-700/70 bg-ink-850 px-6 py-4">
          <div className="flex items-center gap-2">
            {steps.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setStep(i)}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === step
                    ? "bg-ember-500 w-6"
                    : i < step
                      ? "bg-lagoon-500"
                      : "bg-ink-600 hover:bg-ink-500"
                }`}
                aria-label={`Go to step ${i + 1}`}
              />
            ))}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="font-mono text-[12px] text-mist-500 hover:text-mist-300 transition-colors"
            >
              Skip tour
            </button>
            {step > 0 && (
              <button
                type="button"
                onClick={() => setStep((s) => s - 1)}
                className="rounded-lg border border-ink-600 px-4 py-2 text-[12px] font-semibold text-mist-300 hover:border-ink-500 hover:text-mist-100 transition-all active:scale-95"
              >
                ← Back
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                if (isLast) {
                  onClose();
                } else {
                  setStep((s) => s + 1);
                }
              }}
              className="rounded-lg bg-ember-500 px-4 py-2 text-[12px] font-bold text-ink-950 hover:bg-ember-400 transition-all active:scale-95"
            >
              {isLast ? "Get started" : "Next →"}
            </button>
          </div>
        </div>

        {/* Keyboard hint */}
        <div className="border-t border-ink-700/70 bg-ink-850/50 px-6 py-2.5 font-mono text-[10px] text-mist-600 text-center">
          Use <Kbd>←</Kbd> <Kbd>→</Kbd> to navigate · <Kbd>Esc</Kbd> to close
        </div>
      </div>
    </div>
  );
}
