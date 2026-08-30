// ────────────────────────────────────────────────────────────────────────────
// Generator core: config model + artifact builders for the GHCR devcontainer
// environment of nyeinpyaesone-ui/ERP.
// ────────────────────────────────────────────────────────────────────────────

export interface FeatureDef {
  id: string;
  label: string;
  ref: string;
  desc: string;
  on: boolean;
  version?: string;
  versions?: string[];
  optionKey?: string;
}

export interface PostStep {
  id: string;
  label: string;
  cmd: string;
  on: boolean;
}

export interface Config {
  owner: string;
  repo: string;
  tag: string;
  base: string;
  shell: "zsh" | "bash";
  remoteUser: string;
  features: FeatureDef[];
  ports: string[];
  extensions: string[];
  postSteps: PostStep[];
  namedVolume: boolean;
  smokeTest: boolean;
  aptExtra: string;
}

export const DEFAULT_CONFIG: Config = {
  owner: "nyeinpyaesone-ui",
  repo: "ERP",
  tag: "latest",
  base: "ubuntu-24.04",
  shell: "zsh",
  remoteUser: "vscode",
  features: [
    {
      id: "din-docker",
      label: "Docker-in-Docker",
      ref: "ghcr.io/devcontainers/features/docker-in-docker:2",
      desc: "Run docker build/run inside the container",
      on: true,
    },
    {
      id: "git",
      label: "Git (latest)",
      ref: "ghcr.io/devcontainers/features/git:1",
      desc: "Upgrade git beyond the base image version",
      on: true,
    },
    {
      id: "gh-cli",
      label: "GitHub CLI",
      ref: "ghcr.io/devcontainers/features/github-cli:1",
      desc: "gh for PRs, issues and package auth",
      on: true,
    },
    {
      id: "node",
      label: "Node.js",
      ref: "ghcr.io/devcontainers/features/node:1",
      desc: "Node + nvm, pinned major version",
      on: true,
      version: "22",
      versions: ["24", "22", "20", "18"],
      optionKey: "version",
    },
    {
      id: "pnpm",
      label: "pnpm",
      ref: "ghcr.io/devcontainers-extra/features/pnpm:2",
      desc: "Fast disk-efficient package manager",
      on: false,
    },
    {
      id: "python",
      label: "Python",
      ref: "ghcr.io/devcontainers/features/python:1",
      desc: "For tooling, scripts and data fixes",
      on: false,
      version: "3.12",
      versions: ["3.13", "3.12", "3.11"],
      optionKey: "version",
    },
  ],
  ports: ["5173", "3000", "5432"],
  extensions: [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "ms-azuretools.vscode-docker",
    "GitHub.vscode-pull-request-github",
  ],
  postSteps: [
    { id: "deps", label: "Install dependencies", cmd: "npm ci", on: true },
    {
      id: "env",
      label: "Seed .env from example",
      cmd: "[ -f .env.example ] && cp -n .env.example .env || true",
      on: true,
    },
    { id: "build", label: "Warm production build", cmd: "npm run build", on: false },
    {
      id: "pw",
      label: "Install Playwright browsers",
      cmd: "npx playwright install --with-deps chromium",
      on: false,
    },
  ],
  namedVolume: true,
  smokeTest: true,
  aptExtra: "curl, jq, postgresql-client",
};

// ── derived helpers ──────────────────────────────────────────────────────────

export const imageRef = (c: Config) =>
  `ghcr.io/${c.owner.toLowerCase()}/${c.repo.toLowerCase()}:${c.tag || "latest"}`;

export const bootstrapLine = (c: Config) =>
  `curl -fsSL https://raw.githubusercontent.com/${c.owner}/${c.repo}/main/setup-env.sh | bash`;

export const activeFeatures = (c: Config) => c.features.filter((f) => f.on);
export const activeSteps = (c: Config) => c.postSteps.filter((s) => s.on);
export const aptList = (c: Config) =>
  c.aptExtra
    .split(/[,\s]+/)
    .map((s) => s.trim())
    .filter(Boolean);

export function postCreateCommand(c: Config): string | null {
  const cmds = activeSteps(c).map((s) => s.cmd);
  return cmds.length ? cmds.join(" && ") : null;
}

// ── devcontainer.json ────────────────────────────────────────────────────────

export function buildDevcontainerJson(c: Config): string {
  const feats: Record<string, unknown> = {};
  for (const f of activeFeatures(c)) {
    feats[f.ref] = f.version && f.optionKey ? { [f.optionKey]: f.version } : {};
  }
  const post = postCreateCommand(c);
  const doc: Record<string, unknown> = {
    name: `${c.repo} · ${c.owner}`,
  };
  if (aptList(c).length) {
    doc.build = { dockerfile: "Dockerfile", args: { BASE_IMAGE: imageRef(c) } };
  } else {
    doc.image = imageRef(c);
  }
  if (Object.keys(feats).length) doc.features = feats;
  if (c.ports.length) doc.forwardPorts = c.ports.map((p) => Number(p));
  doc.customizations = {
    vscode: {
      extensions: c.extensions,
      settings: {
        "terminal.integrated.defaultProfile.linux": c.shell,
        "files.eol": "\n",
        "editor.formatOnSave": true,
      },
    },
  };
  if (post) doc.postCreateCommand = post;
  if (c.namedVolume) {
    doc.mounts = [
      `source=${c.repo.toLowerCase()}-node_modules,target=\${containerWorkspaceFolder}/node_modules,type=volume`,
    ];
    doc.postCreateCommand = post ?? "sudo chown -R $(id -u):$(id -g) node_modules 2>/dev/null || true";
  }
  doc.remoteUser = c.remoteUser;
  doc.updateRemoteUserUID = true;
  doc.hostRequirements = { cpus: 4, memory: "8gb" };
  return JSON.stringify(doc, null, 2);
}

// ── Dockerfile (extends the published GHCR image) ────────────────────────────

export function buildDockerfile(c: Config): string {
  const pkgs = aptList(c);
  const lines: string[] = [
    `# ──────────────────────────────────────────────────────────────────`,
    `# Extends the published GHCR image with ${c.repo}-specific extras.`,
    `# Rebuild is triggered automatically because devcontainer.json`,
    `# points at this Dockerfile via "build.dockerfile".`,
    `# ──────────────────────────────────────────────────────────────────`,
    `ARG BASE_IMAGE=${imageRef(c)}`,
    `FROM \${BASE_IMAGE}`,
    ``,
    `LABEL org.opencontainers.image.source="https://github.com/${c.owner}/${c.repo}" \\`,
    `      org.opencontainers.image.title="${c.repo} dev environment" \\`,
    `      devcontainer.base="${c.base}"`,
    ``,
  ];
  if (pkgs.length) {
    lines.push(
      `# extra tooling on top of the ${c.base} base`,
      `RUN apt-get update \\`,
      `    && apt-get install -y --no-install-recommends \\`,
      ...pkgs.map((p, i) => `       ${p}${i < pkgs.length - 1 ? " \\" : ""}`),
      `    && rm -rf /var/lib/apt/lists/*`,
      ``
    );
  }
  lines.push(
    `# keep the container shell consistent with the host profile`,
    `ENV SHELL=/usr/bin/${c.shell} \\`,
    `    LANG=C.UTF-8`,
    ``,
    `USER ${c.remoteUser}`
  );
  return lines.join("\n");
}

// ── setup-env.sh ─────────────────────────────────────────────────────────────

export function buildSetupScript(c: Config, json: string, dockerfile: string): string {
  const feats = activeFeatures(c);
  const steps = activeSteps(c);
  const img = imageRef(c);
  const iso = new Date().toISOString().slice(0, 16).replace("T", " ");
  const L: string[] = [];
  const push = (...xs: string[]) => L.push(...xs);

  push(
    `#!/usr/bin/env bash`,
    `# ─────────────────────────────────────────────────────────────────────`,
    `#  GHCR devcontainer environment · setup-env.sh`,
    `#  Repo      : ${c.owner}/${c.repo}`,
    `#  Image     : ${img}`,
    `#  Base      : ${c.base} · shell ${c.shell} · remote user "${c.remoteUser}"`,
    `#  Features  : ${feats.length ? feats.map((f) => f.ref.split("/").pop()).join(", ") : "none"}`,
    `#  Spec      : devcontainers v0.245+  ·  forge v1.4.0`,
    `#  Generated : ${iso} UTC — regenerate, don't hand-edit.`,
    `# ─────────────────────────────────────────────────────────────────────`,
    `set -Eeuo pipefail`,
    `IFS=$'\\n\\t'`,
    `umask 022`,
    ``,
    `# ── tunables ─────────────────────────────────────────────────────────`,
    `GHCR_REGISTRY="ghcr.io"`,
    `REPO_OWNER="${c.owner}"`,
    `REPO_NAME="${c.repo}"`,
    `IMAGE_TAG="${c.tag || "latest"}"`,
    `IMAGE_REF="\${GHCR_REGISTRY}/\${REPO_OWNER,,}/\${REPO_NAME,,}:\${IMAGE_TAG}"`,
    `PROJECT_DIR="\${PROJECT_DIR:-$PWD/\${REPO_NAME}}"`,
    `DEVCONTAINER_DIR="\${PROJECT_DIR}/.devcontainer"`,
    ``,
    `# ── ui helpers ───────────────────────────────────────────────────────`,
    `if [ -t 1 ]; then`,
    `  C_RESET=$'\\033[0m';  C_CYAN=$'\\033[36m'; C_GREEN=$'\\033[32m'`,
    `  C_AMBER=$'\\033[33m'; C_RED=$'\\033[31m';  C_DIM=$'\\033[2m'`,
    `else`,
    `  C_RESET=""; C_CYAN=""; C_GREEN=""; C_AMBER=""; C_RED=""; C_DIM=""`,
    `fi`,
    `log()  { printf '%s▸%s %s\\n' "$C_CYAN"  "$C_RESET" "$*"; }`,
    `ok()   { printf '%s✔%s %s\\n' "$C_GREEN" "$C_RESET" "$*"; }`,
    `warn() { printf '%s▲%s %s\\n' "$C_AMBER" "$C_RESET" "$*" >&2; }`,
    `die()  { printf '%s✖%s %s\\n' "$C_RED"   "$C_RESET" "$*" >&2; exit 1; }`,
    `trap 'die "failed at line \${LINENO} (exit $?)"' ERR`,
    ``,
    `printf '\\n%s  GHCR DEVCONTAINER ENV%s\\n' "$C_AMBER" "$C_RESET"`,
    `printf '  %s%s%s\\n\\n' "$C_DIM" "$IMAGE_REF" "$C_RESET"`,
    ``
  );

  push(
    `# ── step 1 · preflight ───────────────────────────────────────────────`,
    `log "preflight checks"`,
    `command -v docker >/dev/null 2>&1 || die "docker not found — https://docs.docker.com/get-docker/"`,
    `command -v git    >/dev/null 2>&1 || die "git not found — install git first"`,
    `docker info >/dev/null 2>&1       || die "docker daemon unreachable — is it running?"`,
    `ok "docker $(docker --version | awk '{print $3}' | tr -d ',') · git $(git --version | awk '{print $3}')"`,
    ``
  );

  push(
    `# ── step 2 · registry auth ───────────────────────────────────────────`,
    `if [ -n "\${GHCR_TOKEN:-}" ]; then`,
    `  log "authenticating to \${GHCR_REGISTRY}"`,
    `  printf '%s' "$GHCR_TOKEN" \\`,
    `    | docker login "$GHCR_REGISTRY" -u "\${GHCR_USER:-$REPO_OWNER}" --password-stdin >/dev/null`,
    `  ok "authenticated as \${GHCR_USER:-$REPO_OWNER}"`,
    `else`,
    `  warn "GHCR_TOKEN not set — pulling anonymously (fine for public packages)"`,
    `fi`,
    ``
  );

  push(
    `# ── step 3 · pull image ──────────────────────────────────────────────`,
    `log "pulling \${IMAGE_REF}"`,
    `docker pull "$IMAGE_REF" >/dev/null`,
    `SIZE=$(docker image inspect "$IMAGE_REF" --format '{{.Size}}' 2>/dev/null || echo 0)`,
    `ok "cached locally ($(numfmt --to=iec "$SIZE" 2>/dev/null || printf '%s B' "$SIZE"))"`,
    ``
  );

  push(
    `# ── step 4 · workspace scaffold ──────────────────────────────────────`,
    `if [ ! -d "\${PROJECT_DIR}/.git" ]; then`,
    `  log "cloning github.com/\${REPO_OWNER}/\${REPO_NAME}"`,
    `  git clone --depth 1 "https://github.com/\${REPO_OWNER}/\${REPO_NAME}.git" "$PROJECT_DIR"`,
    `else`,
    `  ok "workspace already present at \${PROJECT_DIR}"`,
    `fi`,
    `mkdir -p "$DEVCONTAINER_DIR"`,
    ``
  );

  push(
    `# ── step 5 · write devcontainer.json ─────────────────────────────────`,
    `log "writing .devcontainer/devcontainer.json"`,
    `cat > "\${DEVCONTAINER_DIR}/devcontainer.json" <<'DEVCONTAINER_JSON'`,
    json,
    `DEVCONTAINER_JSON`,
    `ok "devcontainer.json ($(wc -c < "\${DEVCONTAINER_DIR}/devcontainer.json") bytes)"`,
    ``
  );

  if (aptList(c).length) {
    push(
      `# ── step 6 · write extending Dockerfile ─────────────────────────────`,
      `log "writing .devcontainer/Dockerfile"`,
      `cat > "\${DEVCONTAINER_DIR}/Dockerfile" <<'DEVCONTAINER_DOCKERFILE'`,
      dockerfile,
      `DEVCONTAINER_DOCKERFILE`,
      `ok "Dockerfile written — image will be extended at build time"`,
      ``
    );
  }

  if (feats.length) {
    push(
      `# ── step ${aptList(c).length ? 7 : 6} · feature manifest ───────────────────────────────`,
      `log "features installed by the devcontainer CLI on first 'up':"`,
      ...feats.map((f) => `printf '  %s•%s %s\\n' "$C_DIM" "$C_RESET" "${f.ref}${f.version ? "@" + f.version : ""}"`),
      ``
    );
  }

  if (c.ports.length) {
    push(
      `# ── step · port forwarding ──────────────────────────────────────────`,
      `log "ports forwarded to localhost: ${c.ports.join(", ")}"`,
      ``
    );
  }

  if (steps.length) {
    push(
      `# ── step · post-create pipeline ─────────────────────────────────────`,
      `log "post-create command queued for first container start:"`,
      `printf '  %s%s%s\\n' "$C_DIM" "${postCreateCommand(c)}" "$C_RESET"`,
      ``
    );
  }

  if (c.smokeTest) {
    push(
      `# ── step · smoke test ───────────────────────────────────────────────`,
      `log "smoke-testing the image entrypoint"`,
      `docker run --rm "$IMAGE_REF" sh -lc 'echo "container ok: $(whoami)@$(hostname)"' >/dev/null`,
      `ok "smoke test passed"`,
      ``
    );
  }

  push(
    `# ── done ────────────────────────────────────────────────────────────`,
    `ok "artifacts written to \${DEVCONTAINER_DIR}"`,
    `printf '\\n%s✔ \${REPO_NAME} environment ready.%s\\n\\n' "$C_GREEN" "$C_RESET"`,
    `printf '  %scode "%s"%s\\n' "$C_CYAN" "$PROJECT_DIR" "$C_RESET"`,
    `printf '  %s› Dev Containers: Reopen in Container%s\\n\\n' "$C_DIM" "$C_RESET"`,
    `printf '  CLI alternative:\\n'`,
    `printf '  %snpm i -g @devcontainers/cli%s\\n' "$C_DIM" "$C_RESET"`,
    `printf '  %sdevcontainer up --workspace-folder "%s"%s\\n' "$C_CYAN" "$PROJECT_DIR" "$C_RESET"`,
    ``
  );

  return L.join("\n");
}

// ── quickstart tab ───────────────────────────────────────────────────────────

export function buildQuickstart(c: Config): string {
  const repo = c.repo;
  return [
    `#!/usr/bin/env bash`,
    `# quickstart — GHCR devcontainer env for ${c.owner}/${repo}`,
    ``,
    `# 1 · bootstrap the environment (pull, scaffold, write configs)`,
    `chmod +x setup-env.sh && ./setup-env.sh`,
    ``,
    `# 2 · private package? export a token with read:packages scope first`,
    `export GHCR_TOKEN="ghp_xxxxxxxxxxxx"`,
    `export GHCR_USER="${c.owner}"`,
    ``,
    `# 3 · open in VS Code and rebuild`,
    `code ./${repo}`,
    `#    › Ctrl/Cmd+Shift+P → "Dev Containers: Reopen in Container"`,
    ``,
    `# 4 · or drive it headless from the CLI`,
    `npm i -g @devcontainers/cli`,
    `devcontainer up --workspace-folder ./${repo}`,
    `devcontainer exec --workspace-folder ./${repo} ${c.shell}`,
    ``,
    `# 5 · verify the forwarded ports once the container is up`,
    ...c.ports.map((p) => `curl -fsS http://localhost:${p} >/dev/null && echo "port ${p} ✔"`),
    ``,
  ].join("\n");
}

// ── artifacts bundle ─────────────────────────────────────────────────────────

export interface Artifacts {
  setup: string;
  json: string;
  dockerfile: string;
  quickstart: string;
}

export function buildArtifacts(c: Config): Artifacts {
  const json = buildDevcontainerJson(c);
  const dockerfile = buildDockerfile(c);
  return {
    setup: buildSetupScript(c, json, dockerfile),
    json,
    dockerfile,
    quickstart: buildQuickstart(c),
  };
}

// ── stats ────────────────────────────────────────────────────────────────────

export function estimateSeconds(c: Config): number {
  const baseCost: Record<string, number> = {
    "ubuntu-24.04": 38,
    "debian-12": 26,
    "alpine-3.20": 14,
  };
  let s = baseCost[c.base] ?? 30;
  s += activeFeatures(c).length * 21;
  s += activeSteps(c).length * 9;
  const pkgs = aptList(c).length;
  if (pkgs) s += 16 + pkgs * 2;
  if (c.smokeTest) s += 7;
  return s;
}

export function formatDuration(total: number): string {
  const m = Math.floor(total / 60);
  const s = total % 60;
  return m ? `${m}m ${String(s).padStart(2, "0")}s` : `${s}s`;
}

export function shortHash(content: string): string {
  let h = 5381;
  for (let i = 0; i < content.length; i++) {
    h = ((h << 5) + h + content.charCodeAt(i)) | 0;
  }
  return (h >>> 0).toString(16).padStart(8, "0");
}

export function byteSize(s: string): string {
  const b = new TextEncoder().encode(s).length;
  return b < 1024 ? `${b} B` : `${(b / 1024).toFixed(1)} kB`;
}

// ── dry-run script (simulated terminal output) ──────────────────────────────

export interface RunLine {
  t: string;
  c: "cmd" | "log" | "ok" | "warn" | "dim" | "exit";
}

export function buildRunLines(c: Config, arts: Artifacts): RunLine[] {
  const img = imageRef(c);
  const feats = activeFeatures(c);
  const lines: RunLine[] = [
    { t: `$ bash setup-env.sh`, c: "cmd" },
    { t: ``, c: "dim" },
    { t: `  GHCR DEVCONTAINER ENV`, c: "warn" },
    { t: `  ${img}`, c: "dim" },
    { t: ``, c: "dim" },
    { t: `▸ preflight checks`, c: "log" },
    { t: `✔ docker 27.3.1 · git 2.45.2`, c: "ok" },
    { t: `▲ GHCR_TOKEN not set — pulling anonymously (fine for public packages)`, c: "warn" },
    { t: `▸ pulling ${img}`, c: "log" },
    { t: `  9f2c41e8a5d2 ▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸ 100% · ${c.base === "alpine-3.20" ? "96 MiB" : "412 MiB"}`, c: "dim" },
    { t: `✔ cached locally`, c: "ok" },
    { t: `▸ cloning github.com/${c.owner}/${c.repo}`, c: "log" },
    { t: `▸ writing .devcontainer/devcontainer.json`, c: "log" },
    { t: `✔ devcontainer.json (${byteSize(arts.json)})`, c: "ok" },
  ];
  if (aptList(c).length) {
    lines.push({ t: `✔ Dockerfile written — image will be extended at build time`, c: "ok" });
  }
  for (const f of feats) {
    lines.push({ t: `  • ${f.ref}${f.version ? "@" + f.version : ""}`, c: "dim" });
  }
  if (c.ports.length) {
    lines.push({ t: `▸ ports forwarded to localhost: ${c.ports.join(", ")}`, c: "log" });
  }
  const post = postCreateCommand(c);
  if (post) {
    lines.push({ t: `▸ post-create queued: ${post}`, c: "log" });
  }
  if (c.smokeTest) {
    lines.push({ t: `▸ smoke-testing the image entrypoint`, c: "log" });
    lines.push({ t: `✔ smoke test passed`, c: "ok" });
  }
  lines.push({ t: ``, c: "dim" });
  lines.push({ t: `✔ ${c.repo} environment ready — code "./${c.repo}"`, c: "ok" });
  lines.push({ t: `exit 0 · wall ${formatDuration(estimateSeconds(c))}`, c: "exit" });
  return lines;
}

// ── image layer estimation ───────────────────────────────────────────────────

export interface LayerInfo {
  id: string;
  label: string;
  detail: string;
  mb: number;
  kind: "base" | "feature" | "apt" | "mount";
}

const BASE_MB: Record<string, number> = {
  "ubuntu-24.04": 78,
  "debian-12": 125,
  "alpine-3.20": 8,
};

const FEATURE_MB: Record<string, number> = {
  "din-docker": 92,
  git: 18,
  "gh-cli": 32,
  node: 86,
  pnpm: 24,
  python: 112,
};

export function estimateLayers(c: Config): LayerInfo[] {
  const layers: LayerInfo[] = [
    {
      id: "base",
      label: `FROM ${imageRef(c)}`,
      detail: `${c.base} registry base`,
      mb: BASE_MB[c.base] ?? 78,
      kind: "base",
    },
  ];
  for (const f of activeFeatures(c)) {
    layers.push({
      id: f.id,
      label: `feature · ${(f.ref.split("/").pop() ?? f.label).replace(/:\d+$/, "")}`,
      detail: f.version ? `${f.label} pinned to v${f.version}` : f.desc,
      mb: FEATURE_MB[f.id] ?? 24,
      kind: "feature",
    });
  }
  const apt = aptList(c);
  if (apt.length) {
    layers.push({
      id: "apt",
      label: `RUN apt-get install ${apt.slice(0, 3).join(" ")}${apt.length > 3 ? " …" : ""}`,
      detail: `${apt.length} extra package${apt.length > 1 ? "s" : ""} baked in via Dockerfile`,
      mb: apt.length * 6,
      kind: "apt",
    });
  }
  if (c.namedVolume) {
    layers.push({
      id: "vol",
      label: "VOLUME node_modules",
      detail: "named volume — survives rebuilds, never bloats the image",
      mb: 0,
      kind: "mount",
    });
  }
  layers.push({
    id: "ws",
    label: `WORKSPACE /workspaces/${c.repo.toLowerCase()}`,
    detail: "bind mount — lives on your disk, not in the image",
    mb: 0,
    kind: "mount",
  });
  return layers;
}

export const totalLayerMb = (layers: LayerInfo[]) =>
  layers.reduce((a, l) => a + l.mb, 0);

// ── session persistence ──────────────────────────────────────────────────────

const STORE_KEY = "dcforge.manifest.v1";

export function saveConfig(c: Config) {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(c));
  } catch {
    /* storage unavailable — ignore */
  }
}

export function clearConfig() {
  try {
    localStorage.removeItem(STORE_KEY);
  } catch {
    /* ignore */
  }
}

export function loadConfig(): { cfg: Config; restored: boolean } {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return { cfg: DEFAULT_CONFIG, restored: false };
    const p = JSON.parse(raw) as Partial<Config>;
    if (!p || typeof p !== "object") return { cfg: DEFAULT_CONFIG, restored: false };
    const mergeList = <T extends { id: string }>(
      defs: T[],
      got?: Array<Partial<T> & { id: string }>
    ): T[] =>
      defs.map((d) => {
        const g = got?.find((x) => x && x.id === d.id);
        return g ? { ...d, ...g } : d;
      });
    const cfg: Config = {
      ...DEFAULT_CONFIG,
      ...p,
      features: mergeList(DEFAULT_CONFIG.features, p.features),
      postSteps: mergeList(DEFAULT_CONFIG.postSteps, p.postSteps),
    };
    return { cfg, restored: true };
  } catch {
    return { cfg: DEFAULT_CONFIG, restored: false };
  }
}
