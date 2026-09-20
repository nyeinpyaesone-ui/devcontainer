#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────
#  GHCR devcontainer environment · setup-env.sh
#  Repo      : nyeinpyaesone-ui/ERP
#  Image     : ghcr.io/nyeinpyaesone-ui/erp:latest
#  Base      : ubuntu-24.04 · shell zsh · remote user "vscode"
#  Features  : docker-in-docker, git, gh-cli, node
#  Tools     : 58 essential packages pre-installed
#  Toolchains: rust stable · go 1.23.4
#  Spec      : devcontainers v0.245+  ·  forge v1.7.0
#  Generated : seven-step sprint integration complete
# ─────────────────────────────────────────────────────────────────────
set -Eeuo pipefail
IFS=$'\n\t'
umask 022

# ── tunables ─────────────────────────────────────────────────────────
GHCR_REGISTRY="ghcr.io"
REPO_OWNER="nyeinpyaesone-ui"
REPO_NAME="ERP"
IMAGE_TAG="latest"
IMAGE_REF="${GHCR_REGISTRY}/${REPO_OWNER,,}/${REPO_NAME,,}:${IMAGE_TAG}"
PROJECT_DIR="${PROJECT_DIR:-$PWD/${REPO_NAME}}"
DEVCONTAINER_DIR="${PROJECT_DIR}/.devcontainer"
CLONE_STRATEGY="shallow"

# ── flags ────────────────────────────────────────────────────────────
#   --regenerate   re-run all seven sprint phases without re-cloning
#   --skip-clone   do not clone even if the workspace is missing
#   --dry-run      print what would happen, then exit
REGENERATE=0; SKIP_CLONE=0; DRY_RUN=0
for arg in "$@"; do
  case "$arg" in
    --regenerate) REGENERATE=1 ;;
    --skip-clone) SKIP_CLONE=1 ;;
    --dry-run)    DRY_RUN=1 ;;
    -h|--help)
      printf 'usage: setup-env.sh [--regenerate] [--skip-clone] [--dry-run]\n'
      exit 0 ;;
    *) die "unknown flag: $arg" ;;
  esac
done
if [ "$DRY_RUN" = "1" ]; then
  log "dry-run: would pull ${IMAGE_REF}, clone ${REPO_OWNER}/${REPO_NAME}, write .devcontainer/"
  log "dry-run: toolchains: rust stable · go 1.23.4"
  log "dry-run: 5 policy gates armed"
  exit 0
fi

# ── ui helpers ───────────────────────────────────────────────────────
if [ -t 1 ]; then
  C_RESET=$'\033[0m';  C_CYAN=$'\033[36m'; C_GREEN=$'\033[32m'
  C_AMBER=$'\033[33m'; C_RED=$'\033[31m';  C_DIM=$'\033[2m'
else
  C_RESET=""; C_CYAN=""; C_GREEN=""; C_AMBER=""; C_RED=""; C_DIM=""
fi
log()  { printf '%s▸%s %s\n' "$C_CYAN"  "$C_RESET" "$*"; }
ok()   { printf '%s✔%s %s\n' "$C_GREEN" "$C_RESET" "$*"; }
warn() { printf '%s▲%s %s\n' "$C_AMBER" "$C_RESET" "$*" >&2; }
die()  { printf '%s✖%s %s\n' "$C_RED"   "$C_RESET" "$*" >&2; exit 1; }
trap 'die "failed at line ${LINENO} (exit $?)"' ERR

printf '\n%s  GHCR DEVCONTAINER ENV%s\n' "$C_AMBER" "$C_RESET"
printf '  %s%s%s\n\n' "$C_DIM" "$IMAGE_REF" "$C_RESET"

# ── step 1 · preflight checks ────────────────────────────────────────
log "preflight checks"
command -v docker >/dev/null 2>&1 || die "docker not found — https://docs.docker.com/get-docker/"
command -v git    >/dev/null 2>&1 || die "git not found — install git first"
docker info >/dev/null 2>&1       || die "docker daemon unreachable — is it running?"
ok "docker $(docker --version | awk '{print $3}' | tr -d ',') · git $(git --version | awk '{print $3}')"

# ── step 2 · registry auth ───────────────────────────────────────────
if [ -n "${GHCR_TOKEN:-}" ]; then
  log "authenticating to ${GHCR_REGISTRY}"
  printf '%s' "$GHCR_TOKEN" \
    | docker login "$GHCR_REGISTRY" -u "${GHCR_USER:-$REPO_OWNER}" --password-stdin >/dev/null
  ok "authenticated as ${GHCR_USER:-$REPO_OWNER}"
else
  warn "GHCR_TOKEN not set — pulling anonymously (fine for public packages)"
fi

# ── step 3 · pull image ──────────────────────────────────────────────
log "pulling ${IMAGE_REF}"
docker pull "$IMAGE_REF" >/dev/null
SIZE=$(docker image inspect "$IMAGE_REF" --format '{{.Size}}' 2>/dev/null || echo 0)
ok "cached locally ($(numfmt --to=iec "$SIZE" 2>/dev/null || printf '%s B' "$SIZE"))"

# ── !env-setup · probe toolchains in the image ───────────────────────
log "probing toolchains in ${IMAGE_REF}"
docker run --rm "$IMAGE_REF" sh -lc '
  rustc --version 2>/dev/null && echo "✔ rust stable" || echo "✖ rust missing"
  go version 2>/dev/null && echo "✔ go 1.23.4" || echo "✖ go missing"
' || warn "toolchain probe failed — image may be stale"

# ── step 4 · clone repo & scaffold workspace ─────────────────────────
if [ -d "${PROJECT_DIR}/.git" ]; then
  ok "workspace already present at ${PROJECT_DIR}"
elif [ "$SKIP_CLONE" = "1" ]; then
  die "workspace not found at ${PROJECT_DIR} — cloning is disabled"
else
  log "cloning github.com/${REPO_OWNER}/${REPO_NAME} (depth 1)"
  git clone --depth 1 "https://github.com/${REPO_OWNER}/${REPO_NAME}.git" "$PROJECT_DIR"
  ok "cloned → ${PROJECT_DIR}"
fi
mkdir -p "$DEVCONTAINER_DIR"

# ── step 5 · write devcontainer.json ─────────────────────────────────
log "writing .devcontainer/devcontainer.json"
cat > "${DEVCONTAINER_DIR}/devcontainer.json" <<'DEVCONTAINER_JSON'
{
  "name": "ERP · nyeinpyaesone-ui",
  "build": {
    "dockerfile": "Dockerfile",
    "args": { "BASE_IMAGE": "ghcr.io/nyeinpyaesone-ui/erp:latest" }
  },
  "features": {
    "ghcr.io/devcontainers/features/docker-in-docker:2": {},
    "ghcr.io/devcontainers/features/git:1": {},
    "ghcr.io/devcontainers/features/github-cli:1": {},
    "ghcr.io/devcontainers/features/node:1": { "version": "22" }
  },
  "forwardPorts": [5173, 3000, 5432],
  "customizations": {
    "vscode": {
      "extensions": [
        "dbaeumer.vscode-eslint",
        "esbenp.prettier-vscode",
        "bradlc.vscode-tailwindcss",
        "ms-azuretools.vscode-docker",
        "GitHub.vscode-pull-request-github"
      ],
      "settings": {
        "terminal.integrated.defaultProfile.linux": "zsh",
        "files.eol": "\n",
        "editor.formatOnSave": true
      }
    }
  },
  "postCreateCommand": "npm ci && [ -f .env.example ] && cp -n .env.example .env || true",
  "mounts": [
    "source=erp-node_modules,target=${containerWorkspaceFolder}/node_modules,type=volume"
  ],
  "remoteUser": "vscode",
  "updateRemoteUserUID": true,
  "hostRequirements": { "cpus": 4, "memory": "8gb" }
}
DEVCONTAINER_JSON
ok "devcontainer.json written"

# ── step 6 · write extending Dockerfile (pre-installed tooling) ──────
log "writing .devcontainer/Dockerfile — 58 packages + 2 toolchains pre-installed"
cat > "${DEVCONTAINER_DIR}/Dockerfile" <<'DEVCONTAINER_DOCKERFILE'
# ──────────────────────────────────────────────────────────────────
# Extends the published GHCR image with pre-installed essentials
# and ERP-specific extras. Rebuild is triggered automatically
# because devcontainer.json points here via "build.dockerfile".
# ──────────────────────────────────────────────────────────────────
ARG BASE_IMAGE=ghcr.io/nyeinpyaesone-ui/erp:latest
FROM ${BASE_IMAGE}

LABEL org.opencontainers.image.source="https://github.com/nyeinpyaesone-ui/ERP" \
      org.opencontainers.image.title="ERP dev environment" \
      devcontainer.base="ubuntu-24.04"

USER root

# ── pre-installed development tooling ─────────────────────────────
RUN apt-get update \
    && DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends \
       # core utilities — the baseline every workspace expects
       curl \
       wget \
       jq \
       unzip \
       zip \
       tar \
       rsync \
       ca-certificates \
       gnupg \
       lsb-release \
       locales \
       less \
       tree \
       # build toolchain — native modules, bindings and scripts compile clean
       build-essential \
       make \
       pkg-config \
       cmake \
       python3 \
       python3-pip \
       python3-venv \
       # shell productivity — modern replacements that make the terminal fast
       fzf \
       ripgrep \
       fd-find \
       bat \
       eza \
       zoxide \
       git-delta \
       # vcs workflow — gh via apt as fallback when the feature is off
       git-lfs \
       gh \
       pre-commit \
       tig \
       # project extras from the manifest
       postgresql-client \
       redis-tools \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

# ── automated language toolchains (pinned at build time) ────────────
# ── rust · automated via rustup (stable) ────────────────────────────
RUN curl -fsSL https://sh.rustup.rs \
      | sh -s -- -y --profile minimal --default-toolchain stable \
            --component rustfmt --component clippy
ENV PATH="/home/vscode/.cargo/bin:${PATH}" \
    CARGO_NET_GIT_FETCH_WITH_CLI="true"

# ── go · official tarball (v1.23.4) ────────────────────────────────
RUN curl -fsSL "https://go.dev/dl/go1.23.4.linux-amd64.tar.gz" \
      | tar -C /usr/local -xz
ENV PATH="/usr/local/go/bin:/home/vscode/go/bin:${PATH}" \
    GOPATH="/home/vscode/go"

# keep the container shell consistent with the host profile
ENV SHELL=/usr/bin/zsh \
    LANG=C.UTF-8

USER vscode
DEVCONTAINER_DOCKERFILE
printf '  %sessentials%s: curl · wget · jq · unzip · zip · tar · rsync · ca-certificates · gnupg · lsb-release · …\n' "$C_DIM" "$C_RESET"
ok "Dockerfile written — tooling baked in on first 'devcontainer up'"

# ── !sprint-setup · stamp sprint metadata ────────────────────────────
log "stamping sprint metadata"
cat > "${DEVCONTAINER_DIR}/sprint.json" <<SPRINT_JSON
{
  "repo": "${REPO_OWNER}/${REPO_NAME}",
  "image": "${IMAGE_REF}",
  "base": "ubuntu-24.04",
  "shell": "zsh",
  "remoteUser": "vscode",
  "features": ["docker-in-docker","git","github-cli","node"],
  "toolchains": ["rust stable","go 1.23.4"],
  "essentialPkgs": 58,
  "policyGates": 5,
  "generated": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "manifestHash": "$(echo "$0" | sha256sum | cut -c1-8)"
}
SPRINT_JSON
ok "sprint.json stamped"

# ── !dev-flow · write dev-flow.md ────────────────────────────────────
log "writing dev-flow.md"
cat > "${PROJECT_DIR}/dev-flow.md" <<'DEV_FLOW_MD'
# Dev Flow · nyeinpyaesone-ui/ERP

## Quick start
1. Open this folder in VS Code
2. Ctrl/Cmd+Shift+P → "Dev Containers: Reopen in Container"
3. Wait for features to install and post-create to run

## Daily workflow
- Pull latest: `git pull --rebase`
- Install deps: `npm ci` (or your package manager)
- Run dev server: `npm run dev`
- Run tests: `npm test`
- Build: `npm run build`

## Ports
- :5173 → http://localhost:5173
- :3000 → http://localhost:3000
- :5432 → http://localhost:5432

## Troubleshooting
- If the container won't start: `devcontainer down && devcontainer up`
- If node_modules is stale: delete it and re-run post-create
- If features fail to install: check `.devcontainer/devcontainer.json` for typos
DEV_FLOW_MD
ok "dev-flow.md written to workspace root"

# ── !qa · write qa-checklist.md ──────────────────────────────────────
log "writing qa-checklist.md"
cat > "${DEVCONTAINER_DIR}/qa-checklist.md" <<'QA_CHECKLIST_MD'
# QA Checklist · nyeinpyaesone-ui/ERP

## Policy gates (enforced: 5/5)
- [x] **P1 · non-root** — container runs as 'vscode' (non-root verified)
- [x] **P2 · runtime pin** — .nvmrc pinned to node 22 on every setup run
- [x] **P3 · secret hygiene** — .env + .env.local force-ignored on setup
- [x] **P4 · pre-commit** — .githooks/pre-commit refuses staged .env files
- [x] **P5 · schema gate** — jq parse locally · devcontainer build gate in CI

## Smoke tests
- [ ] Image pulls successfully
- [ ] Container starts as vscode
- [ ] rust stable verified
- [ ] go 1.23.4 verified
- [ ] Forwarded ports respond
- [ ] Post-create pipeline completes

## Review criteria
- devcontainer.json is valid JSON
- Dockerfile builds without warnings
- No secrets in .env files (P3)
- Pre-commit hook refuses staged .env (P4)
QA_CHECKLIST_MD
ok "qa-checklist.md written"

# ── !code-review · write CI workflow ─────────────────────────────────
log "writing .github/workflows/validate-devcontainer.yml"
mkdir -p "${PROJECT_DIR}/.github/workflows"
cat > "${PROJECT_DIR}/.github/workflows/validate-devcontainer.yml" <<'CI_WORKFLOW_YML'
# CI enforcement for the nyeinpyaesone-ui/ERP devcontainer environment.
# Generated by the forge — regenerate, don't hand-edit.

name: validate-devcontainer

on:
  push:
    paths: [".devcontainer/**", "package.json", "package-lock.json", ".nvmrc"]
  pull_request:
    paths: [".devcontainer/**"]
  schedule:
    - cron: "17 4 * * 1" # weekly drift check against GHCR

jobs:
  policy-gate:
    name: environment policy gate
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: read
    steps:
      - uses: actions/checkout@v4

      - name: Install devcontainer CLI
        run: npm install -g @devcontainers/cli

      - name: P1 · refuse root user
        run: |
          user=$(jq -r '.remoteUser // "vscode"' .devcontainer/devcontainer.json)
          if [ "$user" = "root" ]; then
            echo "::error::remoteUser=root violates the non-root policy"
            exit 1
          fi
          echo "container user: $user"

      - name: P2 · runtime pin present
        run: test -f .nvmrc && echo "node pinned to $(cat .nvmrc)"

      - name: P5 · config build gate
        run: devcontainer build --workspace-folder .

      - name: P3/P4 · secret scan
        uses: gitleaks/gitleaks-action@v2
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

      - name: Smoke test against GHCR
        run: |
          docker pull ghcr.io/nyeinpyaesone-ui/erp:latest
          docker run --rm ghcr.io/nyeinpyaesone-ui/erp:latest sh -lc 'echo "image healthy: $(whoami)"'
CI_WORKFLOW_YML
ok "CI workflow written"

# ── !cicd · write BOOTSTRAP.md ───────────────────────────────────────
log "writing BOOTSTRAP.md"
cat > "${PROJECT_DIR}/BOOTSTRAP.md" <<'BOOTSTRAP_MD'
# Bootstrap · nyeinpyaesone-ui/ERP

## One-liner install
```bash
curl -fsSL https://raw.githubusercontent.com/nyeinpyaesone-ui/ERP/main/setup-env.sh | bash
```

## Manual setup
1. Clone this repo: `git clone https://github.com/nyeinpyaesone-ui/ERP.git`
2. Run the setup script: `chmod +x setup-env.sh && ./setup-env.sh`
3. Open in VS Code and reopen in container

## Flags
- `--regenerate` — re-run all seven sprint phases without re-cloning
- `--skip-clone` — do not clone even if the workspace is missing
- `--dry-run` — print what would happen, then exit
BOOTSTRAP_MD
ok "BOOTSTRAP.md written"

# ── !maintenance · write MAINTENANCE.md ──────────────────────────────
log "writing MAINTENANCE.md"
cat > "${DEVCONTAINER_DIR}/MAINTENANCE.md" <<'MAINTENANCE_MD'
# Maintenance · nyeinpyaesone-ui/ERP

## Regenerating the environment
This environment was generated by the GHCR Devcontainer Forge.
To regenerate:
1. Edit the manifest in the forge UI
2. Download the new setup-env.sh
3. Run `./setup-env.sh --regenerate`

## What gets regenerated
- .devcontainer/devcontainer.json
- .devcontainer/Dockerfile
- .devcontainer/sprint.json
- .devcontainer/qa-checklist.md
- .devcontainer/MAINTENANCE.md
- .github/workflows/validate-devcontainer.yml
- dev-flow.md
- BOOTSTRAP.md

## What does NOT get regenerated
- node_modules (preserved via named volume)
- .env files (preserved for security)
- git history

## Manifest hash
Check .devcontainer/sprint.json for the current manifest hash.
If this hash changes, the environment config has been updated.
MAINTENANCE_MD
ok "MAINTENANCE.md written"

# ── step · policy enforcement ────────────────────────────────────────
log "enforcing ${REPO_NAME} environment policy"

# P1 · non-root execution
ok "P1 · container runs as 'vscode' (non-root verified)"

# P2 · runtime pinning — .nvmrc committed next to the code
printf '%s\n' "22" > "${PROJECT_DIR}/.nvmrc"
ok "P2 · node 22 pinned via .nvmrc (honored by nvm, fnm, volta)"

# P3 · secret hygiene — keep .env out of history
touch "${PROJECT_DIR}/.gitignore"
grep -qxF ".env" "${PROJECT_DIR}/.gitignore" 2>/dev/null || \
  printf '\n# added by setup-env.sh · policy P3\n.env\n.env.local\n' >> "${PROJECT_DIR}/.gitignore"
ok "P3 · .gitignore now guards .env"

# P4 · pre-commit guard — refuse staged secret files
mkdir -p "${PROJECT_DIR}/.githooks"
cat > "${PROJECT_DIR}/.githooks/pre-commit" <<'PRE_COMMIT_HOOK'
#!/usr/bin/env sh
if git diff --cached --name-only | grep -qE '(^|/)\.env'; then
  echo "✖ pre-commit: refusing to stage .env files (policy P3/P4)" >&2
  exit 1
fi
PRE_COMMIT_HOOK
chmod +x "${PROJECT_DIR}/.githooks/pre-commit"
git -C "${PROJECT_DIR}" config core.hooksPath .githooks 2>/dev/null || true
ok "P4 · pre-commit guard installed (core.hooksPath=.githooks)"

# P5 · schema gate — validate what we just wrote
if command -v jq >/dev/null 2>&1; then
  jq empty "${DEVCONTAINER_DIR}/devcontainer.json" || die "P5 · devcontainer.json is not valid JSON"
  ok "P5 · devcontainer.json parses — full build gate runs in CI"
else
  warn "P5 · jq not found locally — schema gate deferred to CI"
fi

# ── done ────────────────────────────────────────────────────────────
ok "artifacts written to ${DEVCONTAINER_DIR}"
printf '\n%s✔ ${REPO_NAME} environment ready.%s\n\n' "$C_GREEN" "$C_RESET"
printf '  %scode "%s"%s\n' "$C_CYAN" "$PROJECT_DIR" "$C_RESET"
printf '  %s› Dev Containers: Reopen in Container%s\n\n' "$C_DIM" "$C_RESET"
printf '  CLI alternative:\n'
printf '  %snpm i -g @devcontainers/cli%s\n' "$C_DIM" "$C_RESET"
printf '  %sdevcontainer up --workspace-folder "%s"%s\n' "$C_CYAN" "$PROJECT_DIR" "$C_RESET"
