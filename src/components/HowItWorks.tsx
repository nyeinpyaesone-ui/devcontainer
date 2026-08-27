import { GHCR_IMAGE, OWNER } from "../lib/generate";
import { Reveal } from "./ui";

const STEPS = [
  {
    n: "01",
    title: "Preflight",
    desc: "Verifies docker + git exist and that the Docker daemon is actually running before touching anything.",
    cmd: "command -v docker && docker info",
    tone: "ember",
  },
  {
    n: "02",
    title: "GHCR auth",
    desc: `Logs into ghcr.io as ${OWNER} when GHCR_TOKEN is set; falls back to anonymous pulls for public images.`,
    cmd: `docker login ghcr.io -u ${OWNER}`,
    tone: "sky",
  },
  {
    n: "03",
    title: "Resolve the image",
    desc: "Pulls the prebuilt image by default — or builds (and optionally pushes) it with the devcontainer CLI.",
    cmd: `docker pull ${GHCR_IMAGE}:latest`,
    tone: "lagoon",
  },
  {
    n: "04",
    title: "Write devcontainer.json",
    desc: "Drops the container contract into .devcontainer/ if missing: image, features, ports, extensions.",
    cmd: "cat > .devcontainer/devcontainer.json",
    tone: "coral",
  },
  {
    n: "05",
    title: "Boot the environment",
    desc: "Runs devcontainer up — with a plain docker run fallback — then points you at “Reopen in Container”.",
    cmd: "devcontainer up --workspace-folder .",
    tone: "ember",
  },
];

const TONES: Record<string, { num: string; node: string; chip: string }> = {
  ember: {
    num: "text-ember-400 border-ember-500/40",
    node: "bg-ember-500",
    chip: "text-ember-300 border-ember-500/25 bg-ember-500/5",
  },
  lagoon: {
    num: "text-lagoon-400 border-lagoon-400/40",
    node: "bg-lagoon-400",
    chip: "text-lagoon-300 border-lagoon-400/25 bg-lagoon-400/5",
  },
  sky: {
    num: "text-skyx-400 border-skyx-400/40",
    node: "bg-skyx-400",
    chip: "text-skyx-400 border-skyx-400/25 bg-skyx-400/5",
  },
  coral: {
    num: "text-coral-400 border-coral-400/40",
    node: "bg-coral-400",
    chip: "text-coral-400 border-coral-400/25 bg-coral-400/5",
  },
};

export function HowItWorks() {
  return (
    <ol className="relative space-y-2.5 before:absolute before:bottom-6 before:left-[13px] before:top-6 before:w-px before:bg-gradient-to-b before:from-ink-600 before:via-ink-700 before:to-transparent">
      {STEPS.map((s, i) => {
        const tone = TONES[s.tone];
        return (
          <Reveal key={s.n} delay={i * 90}>
            <li className="group relative flex gap-5 rounded-xl border border-transparent p-4 transition-all duration-300 hover:border-ink-700 hover:bg-ink-900/70 sm:gap-7 sm:p-5">
              <span
                className={`absolute left-[9px] top-8 h-[9px] w-[9px] rounded-full ring-4 ring-ink-950 transition-transform duration-300 group-hover:scale-125 ${tone.node}`}
              />
              <span
                className={`ml-8 flex h-11 w-14 shrink-0 items-center justify-center rounded-lg border bg-ink-900 font-mono text-[13px] font-semibold transition-colors sm:ml-9 ${tone.num}`}
              >
                {s.n}
              </span>
              <div className="min-w-0">
                <h3 className="font-display text-[17px] font-semibold tracking-tight text-mist-100">
                  {s.title}
                </h3>
                <p className="mt-1 max-w-xl text-[13.5px] leading-relaxed text-mist-500">
                  {s.desc}
                </p>
                <code
                  className={`mt-2.5 inline-block max-w-full truncate rounded-md border px-2.5 py-1 font-mono text-[11.5px] ${tone.chip}`}
                >
                  {s.cmd}
                </code>
              </div>
            </li>
          </Reveal>
        );
      })}
    </ol>
  );
}
