/* ── GHCR devcontainer artifact generation for nyeinpysone-ui/ERP ── */

export const OWNER = "nyeinpysone-ui";
export const REPO = "ERP";
export const REPO_SLUG = `${OWNER}/${REPO}`;
export const GHCR_IMAGE = `ghcr.io/${OWNER}/erp-devcontainer`;

export type PkgMgr = "npm" | "pnpm" | "yarn" | "bun";
export type NodeMajor = "18" | "20" | "22";
export type Platform = "linux/amd64" | "linux/arm64" | "linux/amd64,linux/arm64";
export type FeatureKey = "dind" | "postgres" | "redis" | "python" | "playwright";

export interface EnvConfig {
  nodeMajor: NodeMajor;
  pkgMgr: PkgMgr;
  platform: Platform;
  feat: Record<FeatureKey, boolean>;
  ext: Record<string, boolean>;
}

export interface FeatureDef {
  key: FeatureKey;
  label: string;
  desc: string;
  exts?: string[];
}

export interface ExtDef {
  id: string;
  label: string;
  onByDefault?: boolean;
}

export const FEATURES: FeatureDef[] = [
  {
    key: "dind",
    label: "Docker-in-Docker",
    desc: "run containers from inside the dev box",
  },
  {
    key: "postgres",
    label: "PostgreSQL 16",
    desc: "local erp database + DATABASE_URL wired",
    exts: ["mtxr.sqltools", "mtxr.sqltools-driver-pg"],
  },
  {
    key: "redis",
    label: "Redis 7",
    desc: "cache / queue backing service on :6379",
  },
  {
    key: "python",
    label: "Python 3.12",
    desc: "for scripting & report tooling",
    exts: ["ms-python.python"],
  },
  {
    key: "playwright",
    label: "Playwright browsers",
    desc: "chromium + deps installed post-create",
    exts: ["ms-playwright.playwright"],
  },
];

export const EXTENSIONS: ExtDef[] = [
  { id: "dbaeumer.vscode-eslint", label: "ESLint", onByDefault: true },
  { id: "esbenp.prettier-vscode", label: "Prettier", onByDefault: true },
  { id: "bradlc.vscode-tailwindcss", label: "Tailwind CSS", onByDefault: true },
  { id: "ms-azuretools.vscode-docker", label: "Docker", onByDefault: true },
  { id: "mtxr.sqltools", label: "SQLTools" },
  { id: "mtxr.sqltools-driver-pg", label: "SQLTools · pg" },
  { id: "ms-python.python", label: "Python" },
  { id: "ms-playwright.playwright", label: "Playwright" },
];

export const DEFAULT_CONFIG: EnvConfig = {
  nodeMajor: "22",
  pkgMgr: "pnpm",
  platform: "linux/amd64",
  feat: { dind: true, postgres: true, redis: false, python: false, playwright: false },
  ext: Object.fromEntries(EXTENSIONS.map((e) => [e.id, !!e.onByDefault])),
};

/* ── derived bits ─────────────────────────────────────────────── */

export function portsFor(cfg: EnvConfig): string[] {
  const ports = ["5173", "3000"];
  if (cfg.feat.postgres) ports.push("5432");
  if (cfg.feat.redis) ports.push("6379");
  return ports;
}

const LOCKFILE: Record<PkgMgr, string> = {
  npm: "package-lock.json",
  pnpm: "pnpm-lock.yaml",
  yarn: "yarn.lock",
  bun: "bun.lockb",
};

function installCmd(cfg: EnvConfig): string {
  const base =
    cfg.pkgMgr === "npm"
      ? "npm install"
      : cfg.pkgMgr === "pnpm"
        ? "corepack enable && corepack prepare pnpm@latest --activate && pnpm install"
        : cfg.pkgMgr === "yarn"
          ? "corepack enable && yarn install"
          : "npm i -g bun && bun install";
  return cfg.feat.playwright
    ? `${base} && npx playwright install --with-deps chromium`
    : base;
}

function enabledExtensions(cfg: EnvConfig): string[] {
  return EXTENSIONS.filter((e) => cfg.ext[e.id]).map((e) => e.id);
}

/* ── devcontainer.json ────────────────────────────────────────── */

export function buildDevcontainerJson(cfg: EnvConfig): string {
  const features: Record<string, unknown> = {
    "ghcr.io/devcontainers/features/common-utils:2": {
      installZsh: true,
      configureZshAsDefaultShell: true,
    },
  };
  if (cfg.feat.dind)
    features["ghcr.io/devcontainers/features/docker-in-docker:2"] = {
      moby: false,
      version: "latest",
    };
  if (cfg.feat.postgres)
    features["ghcr.io/rocker-org/devcontainer-features/postgres:1"] = {
      version: "16",
    };
  if (cfg.feat.redis)
    features["ghcr.io/devcontainers-extra/features/redis-homebrew:1"] = {};
  if (cfg.feat.python)
    features["ghcr.io/devcontainers/features/python:1"] = { version: "3.12" };

  const portsAttributes: Record<string, unknown> = {
    "5173": { label: "ERP web · vite", onAutoForward: "notify" },
    "3000": { label: "ERP api", onAutoForward: "notify" },
  };
  if (cfg.feat.postgres)
    portsAttributes["5432"] = { label: "PostgreSQL", onAutoForward: "silent" };
  if (cfg.feat.redis)
    portsAttributes["6379"] = { label: "Redis", onAutoForward: "silent" };

  const containerEnv: Record<string, string> = {};
  if (cfg.feat.postgres)
    containerEnv.DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/erp";
  if (cfg.feat.redis) containerEnv.REDIS_URL = "redis://localhost:6379";

  const doc: Record<string, unknown> = {
    name: `${REPO} — ${OWNER} · GHCR dev environment`,
    image: `${GHCR_IMAGE}:latest`,
    features,
    forwardPorts: portsFor(cfg).map(Number),
    portsAttributes,
    ...(Object.keys(containerEnv).length ? { containerEnv } : {}),
    postCreateCommand: installCmd(cfg),
    mounts: [
      `source=erp-node-modules,target=\${containerWorkspaceFolder}/node_modules,type=volume`,
    ],
    customizations: {
      vscode: {
        extensions: enabledExtensions(cfg),
        settings: {
          "editor.formatOnSave": true,
          "editor.codeActionsOnSave": { "source.fixAll.eslint": "explicit" },
          "files.eol": "\n",
          "terminal.integrated.defaultProfile.linux": "zsh",
        },
      },
    },
    remoteUser: "node",
  };

  return JSON.stringify(doc, null, 2) + "\n";
}

/* ── setup script ─────────────────────────────────────────────── */

function hostToolingBlock(cfg: EnvConfig): string {
  switch (cfg.pkgMgr) {
    case "npm":
      return `ok "npm $(npm --version) ships with Node ${cfg.nodeMajor} — nothing to activate"`;
    case "yarn":
      return `if command -v corepack >/dev/null 2>&1; then
  corepack enable && corepack prepare yarn@stable --activate
  ok "yarn $(yarn --version) active on host"
else
  warn "corepack missing — install Node >= ${cfg.nodeMajor} to mirror the in-container toolchain"
fi`;
    case "bun":
      return `command -v bun >/dev/null 2>&1 || curl -fsSL https://bun.sh/install | bash
ok "bun $(bun --version) active on host"`;
    default:
      return `if command -v corepack >/dev/null 2>&1; then
  corepack enable && corepack prepare pnpm@latest --activate
  ok "pnpm $(pnpm --version) active on host"
else
  warn "corepack missing — install Node >= ${cfg.nodeMajor} to mirror the in-container toolchain"
fi`;
  }
}

export function buildSetupScript(cfg: EnvConfig): string {
  const dcJson = buildDevcontainerJson(cfg).trimEnd();
  const ports = portsFor(cfg);
  const portFlags = ports.map((p) => `-p ${p}:${p}`).join(" \\\n    ");
  const featureNames = FEATURES.filter((f) => cfg.feat[f.key])
    .map((f) => f.label.toLowerCase())
    .join(", ");

  return `#!/usr/bin/env bash
# ════════════════════════════════════════════════════════════════════
#  GHCR devcontainer environment bootstrap
#  repo   : ${REPO_SLUG}
#  image  : ${GHCR_IMAGE}:latest
#  usage  : ./setup-ghcr-env.sh [--pull | --build | --push]
#
#  --pull   (default) fetch the prebuilt image from GHCR
#  --build  build the image locally with the devcontainer CLI
#  --push   build + publish to GHCR (needs GHCR_TOKEN)
# ════════════════════════════════════════════════════════════════════
set -euo pipefail

# ── config ──────────────────────────────────────────────────────────
REPO_SLUG="${REPO_SLUG}"
REPO_NAME="${REPO}"
GHCR_IMAGE="${GHCR_IMAGE}"
GHCR_TAG="latest"
NODE_MAJOR="${cfg.nodeMajor}"
PKG_MGR="${cfg.pkgMgr}"
PLATFORM="${cfg.platform}"
WORKDIR="/workspaces/${REPO}"
ROOT="$(cd "$(dirname "\${BASH_SOURCE[0]}")" && pwd)"
DC_DIR="\${ROOT}/.devcontainer"

# ── output helpers ──────────────────────────────────────────────────
c_g=$'\\033[0;32m'; c_y=$'\\033[1;33m'; c_c=$'\\033[0;36m'; c_r=$'\\033[0;31m'; c_x=$'\\033[0m'
log()  { printf '%s▸%s %s\\n' "$c_c" "$c_x" "$*"; }
ok()   { printf '%s✔%s %s\\n' "$c_g" "$c_x" "$*"; }
warn() { printf '%s⚠%s %s\\n' "$c_y" "$c_x" "$*"; }
die()  { printf '%s✖ %s%s\\n' "$c_r" "$*" "$c_x" >&2; exit 1; }

# ── 1 · preflight ───────────────────────────────────────────────────
command -v docker >/dev/null 2>&1 || die "docker is required → https://docs.docker.com/get-docker/"
command -v git    >/dev/null 2>&1 || die "git is required"
docker info >/dev/null 2>&1       || die "Docker daemon is not running — start it and retry"
ok "preflight · $(docker --version) · $(git --version)"

# ── 2 · ghcr auth (optional for public pulls) ───────────────────────
if [[ -n "\${GHCR_TOKEN:-}" ]]; then
  printf '%s' "$GHCR_TOKEN" | docker login ghcr.io -u "${OWNER}" --password-stdin >/dev/null
  ok "authenticated to ghcr.io as ${OWNER}"
else
  warn "GHCR_TOKEN not set — anonymous pull (fine for public images)"
fi

# ── 3 · resolve the dev image ───────────────────────────────────────
MODE="\${1:---pull}"
case "$MODE" in
  --build)
    command -v devcontainer >/dev/null 2>&1 || npm install -g @devcontainers/cli
    log "building \${GHCR_IMAGE}:\${GHCR_TAG} (\${PLATFORM})"
    devcontainer build --workspace-folder "$ROOT" \\
      --image-name "\${GHCR_IMAGE}:\${GHCR_TAG}" \\
      --platform "\${PLATFORM}"
    ;;
  --push)
    command -v devcontainer >/dev/null 2>&1 || npm install -g @devcontainers/cli
    [[ -n "\${GHCR_TOKEN:-}" ]] || die "--push requires GHCR_TOKEN"
    log "building + pushing \${GHCR_IMAGE}:\${GHCR_TAG}"
    devcontainer build --workspace-folder "$ROOT" \\
      --image-name "\${GHCR_IMAGE}:\${GHCR_TAG}" \\
      --platform "\${PLATFORM}"
    docker push "\${GHCR_IMAGE}:\${GHCR_TAG}"
    ok "published to GHCR"
    ;;
  *)
    log "pulling \${GHCR_IMAGE}:\${GHCR_TAG}"
    docker pull "\${GHCR_IMAGE}:\${GHCR_TAG}"
    ;;
esac
ok "image ready · \${GHCR_IMAGE}:\${GHCR_TAG}"

# ── 4 · devcontainer.json ───────────────────────────────────────────
mkdir -p "$DC_DIR"
if [[ ! -f "\${DC_DIR}/devcontainer.json" ]]; then
  log "writing \${DC_DIR}/devcontainer.json"
  cat > "\${DC_DIR}/devcontainer.json" <<'JSON'
${dcJson}
JSON
  ok "devcontainer.json created"
else
  ok "devcontainer.json already present — leaving untouched"
fi

# ── 5 · mirror the toolchain on the host ────────────────────────────
${hostToolingBlock(cfg)}

# ── 6 · bring the environment up ────────────────────────────────────
if command -v devcontainer >/dev/null 2>&1; then
  log "devcontainer up — features: ${featureNames || "base image only"}"
  devcontainer up --workspace-folder "$ROOT"
  ok "container is up"
else
  log "starting a plain container (npm i -g @devcontainers/cli for the full flow)"
  docker run --rm -dit --name erp-dev \\
    -v "\${ROOT}:\${WORKDIR}" -w "\${WORKDIR}" \\
    ${portFlags} \\
    "\${GHCR_IMAGE}:\${GHCR_TAG}" sleep infinity >/dev/null
  ok "container 'erp-dev' running — attach: docker exec -it erp-dev bash"
fi

printf '\\n%s● %s dev environment is online%s\\n' "$c_g" "$REPO_NAME" "$c_x"
printf '  reopen the repo in VS Code → "Dev Containers: Reopen in Container"\\n'
`;
}

/* ── GHCR publish workflow ─────────────────────────────────────── */

export function buildWorkflow(cfg: EnvConfig): string {
  return `# Builds the ${REPO} dev image from .devcontainer/ and pushes it to GHCR.
name: devcontainer → ghcr

on:
  push:
    branches: [main]
    paths:
      - ".devcontainer/**"
      - "package.json"
      - "${LOCKFILE[cfg.pkgMgr]}"
      - ".github/workflows/devcontainer-ghcr.yml"
  workflow_dispatch:

env:
  IMAGE: ${GHCR_IMAGE}

permissions:
  contents: read
  packages: write

jobs:
  build-and-push:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout ${REPO_SLUG}
        uses: actions/checkout@v4

      - name: Log in to GHCR
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: \${{ github.actor }}
          password: \${{ secrets.GITHUB_TOKEN }}

      - name: Build & push dev image
        uses: devcontainers/ci@v0.3
        with:
          imageName: \${{ env.IMAGE }}
          imageTag: latest,\${{ github.sha }}
          platform: ${cfg.platform}
          push: always
          cacheFrom: \${{ env.IMAGE }}
`;
}

/* ── bundle ─────────────────────────────────────────────────────── */

export interface GeneratedFile {
  name: string;
  path: string;
  lang: "bash" | "json" | "yaml";
  content: string;
  desc: string;
}

export function buildFiles(cfg: EnvConfig): GeneratedFile[] {
  return [
    {
      name: "setup-ghcr-env.sh",
      path: "./setup-ghcr-env.sh",
      lang: "bash",
      content: buildSetupScript(cfg),
      desc: "Run at the repo root — pulls or builds the GHCR image and boots the env.",
    },
    {
      name: "devcontainer.json",
      path: ".devcontainer/devcontainer.json",
      lang: "json",
      content: buildDevcontainerJson(cfg),
      desc: "Container contract: image, features, ports, extensions, bootstrap command.",
    },
    {
      name: "devcontainer-ghcr.yml",
      path: ".github/workflows/devcontainer-ghcr.yml",
      lang: "yaml",
      content: buildWorkflow(cfg),
      desc: "Publishes a fresh image to ghcr.io on every relevant push to main.",
    },
  ];
}
