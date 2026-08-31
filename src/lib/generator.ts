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

export interface Enforcement {
  nonRoot: boolean;
  engines: boolean;
  secretsGuard: boolean;
  preCommit: boolean;
  schemaGate: boolean;
}

export interface ToolGroup {
  id: string;
  label: string;
  desc: string;
  on: boolean;
  pkgs: string[];
}

export interface LangChain {
  id: "rust" | "go" | "python" | "java" | "dotnet" | "php" | "ruby";
  label: string;
  desc: string;
  via: string; // provisioning method badge
  on: boolean;
  version: string;
  versions: string[];
  verify: string; // smoke command run inside the container
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
  toolGroups: ToolGroup[];
  langs: LangChain[];
  namedVolume: boolean;
  smokeTest: boolean;
  cloneRepo: boolean;
  aptExtra: string;
  enforce: Enforcement;
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
  toolGroups: [
    {
      id: "core",
      label: "Core utilities",
      desc: "The baseline every workspace expects",
      on: true,
      pkgs: [
        "curl",
        "wget",
        "jq",
        "unzip",
        "zip",
        "tar",
        "rsync",
        "ca-certificates",
        "gnupg",
        "lsb-release",
        "locales",
        "less",
        "tree",
      ],
    },
    {
      id: "build",
      label: "Build toolchain",
      desc: "Native modules, bindings and scripts compile clean",
      on: true,
      pkgs: ["build-essential", "make", "pkg-config", "cmake", "python3", "python3-pip", "python3-venv"],
    },
    {
      id: "shell",
      label: "Shell productivity",
      desc: "Modern replacements that make the terminal fast",
      on: true,
      pkgs: ["fzf", "ripgrep", "fd-find", "bat", "eza", "zoxide", "git-delta"],
    },
    {
      id: "vcs",
      label: "VCS workflow",
      desc: "gh via apt as fallback when the feature is off",
      on: true,
      pkgs: ["git-lfs", "gh", "pre-commit", "tig"],
    },
    {
      id: "net",
      label: "Network & debug",
      desc: "For talking to services and tracing failures",
      on: false,
      pkgs: ["dnsutils", "iputils-ping", "netcat-openbsd", "iproute2", "openssl", "lsof"],
    },
  ],
  langs: [
    {
      id: "rust",
      label: "Rust",
      desc: "rustup profile=minimal + rustfmt + clippy",
      via: "rustup",
      on: true,
      version: "stable",
      versions: ["stable", "1.83.0", "1.75.0"],
      verify: "rustc --version",
    },
    {
      id: "go",
      label: "Go",
      desc: "official linux-amd64 tarball → /usr/local/go",
      via: "tarball",
      on: true,
      version: "1.23.4",
      versions: ["1.23.4", "1.22.10", "1.21.13"],
      verify: "go version",
    },
    {
      id: "python",
      label: "Python",
      desc: "pyenv compile & pin — advanced alt to the apt feature",
      via: "pyenv",
      on: false,
      version: "3.13.1",
      versions: ["3.13.1", "3.12.8", "3.11.11"],
      verify: "python --version",
    },
    {
      id: "java",
      label: "Java",
      desc: "OpenJDK headless + JAVA_HOME export",
      via: "apt",
      on: false,
      version: "21",
      versions: ["21", "17"],
      verify: "java -version",
    },
    {
      id: "dotnet",
      label: ".NET",
      desc: "dotnet-install.sh SDK channel → /usr/local/dotnet",
      via: "script",
      on: false,
      version: "9.0",
      versions: ["9.0", "8.0"],
      verify: "dotnet --version",
    },
    {
      id: "php",
      label: "PHP",
      desc: "php-cli + extensions + composer installer",
      via: "apt",
      on: false,
      version: "8.3",
      versions: ["8.3", "8.2"],
      verify: "php --version",
    },
    {
      id: "ruby",
      label: "Ruby",
      desc: "ruby-full + dev headers for native gems",
      via: "apt",
      on: false,
      version: "3.2",
      versions: ["3.2", "3.1"],
      verify: "ruby --version",
    },
  ],
  namedVolume: true,
  smokeTest: true,
  cloneRepo: true,
  aptExtra: "postgresql-client, redis-tools",
  enforce: {
    nonRoot: true,
    engines: true,
    secretsGuard: true,
    preCommit: true,
    schemaGate: true,
  },
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

export const activeToolGroups = (c: Config) => c.toolGroups.filter((g) => g.on);

/** deduplicated essential packages from the enabled tool groups */
export function essentialPkgs(c: Config): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const g of activeToolGroups(c)) {
    for (const p of g.pkgs) {
      if (!seen.has(p)) {
        seen.add(p);
        out.push(p);
      }
    }
  }
  return out;
}

/** everything the extending Dockerfile installs: essentials + project extras */
export function imagePkgs(c: Config): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const p of [...essentialPkgs(c), ...aptList(c)]) {
    if (!seen.has(p)) {
      seen.add(p);
      out.push(p);
    }
  }
  return out;
}

export const activeLangs = (c: Config) => c.langs.filter((l) => l.on);

/** Dockerfile automation for one pinned toolchain — runs as root during build */
export function langInstallLines(l: LangChain, c: Config): string[] {
  const v = l.version;
  const home = `/home/${c.remoteUser}`;
  switch (l.id) {
    case "rust":
      return [
        `# ── rust · automated via rustup (${v}) ────────────────────────────`,
        `RUN curl -fsSL https://sh.rustup.rs \\`,
        `      | sh -s -- -y --profile minimal --default-toolchain ${v} \\`,
        `            --component rustfmt --component clippy`,
        `ENV PATH="${home}/.cargo/bin:\${PATH}" \\`,
        `    CARGO_NET_GIT_FETCH_WITH_CLI="true"`,
        ``,
      ];
    case "go":
      return [
        `# ── go · official tarball (v${v}) ────────────────────────────────`,
        `RUN curl -fsSL "https://go.dev/dl/go${v}.linux-amd64.tar.gz" \\`,
        `      | tar -C /usr/local -xz`,
        `ENV PATH="/usr/local/go/bin:${home}/go/bin:\${PATH}" \\`,
        `    GOPATH="${home}/go"`,
        ``,
      ];
    case "python":
      return [
        `# ── python · pyenv compile & pin (${v}) ──────────────────────────`,
        `RUN apt-get update \\`,
        `    && apt-get install -y --no-install-recommends \\`,
        `       libssl-dev zlib1g-dev libbz2-dev libreadline-dev \\`,
        `       libsqlite3-dev libffi-dev liblzma-dev \\`,
        `    && git clone --depth 1 https://github.com/pyenv/pyenv.git /opt/pyenv \\`,
        `    && PYENV_ROOT=/opt/pyenv /opt/pyenv/bin/pyenv install -s ${v} \\`,
        `    && PYENV_ROOT=/opt/pyenv /opt/pyenv/bin/pyenv global ${v} \\`,
        `    && rm -rf /var/lib/apt/lists/*`,
        `ENV PYENV_ROOT="/opt/pyenv" \\`,
        `    PATH="/opt/pyenv/shims:/opt/pyenv/bin:\${PATH}"`,
        ``,
      ];
    case "java":
      return [
        `# ── java · OpenJDK ${v} via apt ─────────────────────────────────`,
        `RUN apt-get update \\`,
        `    && apt-get install -y --no-install-recommends openjdk-${v}-jdk-headless \\`,
        `    && rm -rf /var/lib/apt/lists/*`,
        `ENV JAVA_HOME="/usr/lib/jvm/java-${v}-openjdk-amd64" \\`,
        `    PATH="\${JAVA_HOME}/bin:\${PATH}"`,
        ``,
      ];
    case "dotnet":
      return [
        `# ── .NET · dotnet-install.sh (channel ${v}) ──────────────────────`,
        `RUN curl -fsSL https://dot.net/v1/dotnet-install.sh \\`,
        `      | bash -s -- --channel ${v} --install-dir /usr/local/dotnet`,
        `ENV DOTNET_ROOT="/usr/local/dotnet" \\`,
        `    PATH="/usr/local/dotnet:\${PATH}" \\`,
        `    DOTNET_CLI_TELEMETRY_OPTOUT="1"`,
        ``,
      ];
    case "php":
      return [
        `# ── php · apt + composer (${v}) ──────────────────────────────────`,
        `RUN apt-get update \\`,
        `    && apt-get install -y --no-install-recommends \\`,
        `       php${v}-cli php${v}-xml php${v}-mbstring php${v}-curl php${v}-zip \\`,
        `    && curl -fsSL https://getcomposer.org/installer \\`,
        `      | php -- --install-dir=/usr/local/bin --filename=composer \\`,
        `    && rm -rf /var/lib/apt/lists/*`,
        ``,
      ];
    case "ruby":
      return [
        `# ── ruby · apt (${v}) ────────────────────────────────────────────`,
        `RUN apt-get update \\`,
        `    && apt-get install -y --no-install-recommends \\`,
        `       ruby-full ruby-dev build-essential \\`,
        `    && rm -rf /var/lib/apt/lists/*`,
        ``,
      ];
  }
}

export function postCreateCommand(c: Config): string | null {
  const cmds = activeSteps(c).map((s) => s.cmd);
  return cmds.length ? cmds.join(" && ") : null;
}

// ── policy enforcement model ─────────────────────────────────────────────────

export interface PolicyState {
  id: "P1" | "P2" | "P3" | "P4" | "P5";
  label: string;
  status: "enforced" | "warn" | "violation" | "off";
  detail: string;
}

export function policyMatrix(c: Config): PolicyState[] {
  const e = c.enforce;
  const nodeFeat = c.features.find((f) => f.id === "node");
  const nodeOn = !!nodeFeat?.on;
  const nodeVer = nodeFeat?.version ?? "22";
  const isRoot = c.remoteUser === "root";
  return [
    {
      id: "P1",
      label: "non-root",
      status: !e.nonRoot ? "off" : isRoot ? "violation" : "enforced",
      detail: !e.nonRoot
        ? "check disabled — any user accepted"
        : isRoot
          ? "remoteUser=root — generated script exits 1, CI gate fails"
          : `container runs as '${c.remoteUser}' — verified in script + CI`,
    },
    {
      id: "P2",
      label: "runtime pin",
      status: !e.engines ? "off" : nodeOn ? "enforced" : "warn",
      detail: !e.engines
        ? "no .nvmrc written — toolchains may drift"
        : nodeOn
          ? `.nvmrc pinned to node ${nodeVer} on every setup run`
          : "node feature off — nothing to pin",
    },
    {
      id: "P3",
      label: "secret hygiene",
      status: e.secretsGuard ? "enforced" : "warn",
      detail: e.secretsGuard
        ? ".env + .env.local force-ignored on setup"
        : ".env unguarded — secrets could be committed",
    },
    {
      id: "P4",
      label: "pre-commit",
      status: e.preCommit ? "enforced" : "warn",
      detail: e.preCommit
        ? ".githooks/pre-commit refuses staged .env files"
        : "staged secret files would pass silently",
    },
    {
      id: "P5",
      label: "schema gate",
      status: e.schemaGate ? "enforced" : "warn",
      detail: e.schemaGate
        ? "jq parse locally · devcontainer build gate in CI"
        : "broken devcontainer.json only surfaces on 'up'",
    },
  ];
}

export const hasViolation = (c: Config) => c.enforce.nonRoot && c.remoteUser === "root";

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
  if (imagePkgs(c).length) {
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
  const groups = activeToolGroups(c);
  const extras = aptList(c).filter((p) => !essentialPkgs(c).includes(p));
  const lines: string[] = [
    `# ──────────────────────────────────────────────────────────────────`,
    `# Extends the published GHCR image with pre-installed essentials`,
    `# and ${c.repo}-specific extras. Rebuild is triggered automatically`,
    `# because devcontainer.json points here via "build.dockerfile".`,
    `# ──────────────────────────────────────────────────────────────────`,
    `ARG BASE_IMAGE=${imageRef(c)}`,
    `FROM \${BASE_IMAGE}`,
    ``,
    `LABEL org.opencontainers.image.source="https://github.com/${c.owner}/${c.repo}" \\`,
    `      org.opencontainers.image.title="${c.repo} dev environment" \\`,
    `      devcontainer.base="${c.base}"`,
    ``,
  ];
  if (groups.length || extras.length) {
    lines.push(
      `USER root`,
      ``,
      `# ── pre-installed development tooling ─────────────────────────────`,
      `RUN apt-get update \\`,
      `    && DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends \\`
    );
    for (const g of groups) {
      lines.push(`       # ${g.label.toLowerCase()} — ${g.desc.toLowerCase()}`);
      lines.push(...g.pkgs.map((p) => `       ${p} \\`));
    }
    if (extras.length) {
      lines.push(`       # project extras from the manifest`);
      lines.push(...extras.map((p) => `       ${p} \\`));
    }
    lines.push(
      `    && rm -rf /var/lib/apt/lists/* \\`,
      `    && apt-get clean`,
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
    `#  Tools     : ${essentialPkgs(c).length ? essentialPkgs(c).length + " essential packages pre-installed" : "none"}`,
    `#  Spec      : devcontainers v0.245+  ·  forge v1.6.0`,
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
    `CLONE_REPO="${c.cloneRepo ? 1 : 0}"`,
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
    `# ── step 4 · clone repo & scaffold workspace ─────────────────────────`,
    `if [ -d "\${PROJECT_DIR}/.git" ]; then`,
    `  ok "workspace already present at \${PROJECT_DIR}"`,
    `elif [ "$CLONE_REPO" = "1" ]; then`,
    `  log "cloning github.com/\${REPO_OWNER}/\${REPO_NAME} (depth 1)"`,
    `  git clone --depth 1 "https://github.com/\${REPO_OWNER}/\${REPO_NAME}.git" "$PROJECT_DIR"`,
    `  ok "cloned → \${PROJECT_DIR}"`,
    `else`,
    `  die "workspace not found at \${PROJECT_DIR} — cloning is disabled in the manifest"`,
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

  const imgPkgs = imagePkgs(c);
  if (imgPkgs.length) {
    const ess = essentialPkgs(c);
    push(
      `# ── step 6 · write extending Dockerfile (pre-installed tooling) ─────`,
      `log "writing .devcontainer/Dockerfile — ${imgPkgs.length} packages pre-installed into the image"`,
      `cat > "\${DEVCONTAINER_DIR}/Dockerfile" <<'DEVCONTAINER_DOCKERFILE'`,
      dockerfile,
      `DEVCONTAINER_DOCKERFILE`,
      ...(ess.length
        ? [
            `printf '  %sessentials%s: %s\\n' "$C_DIM" "$C_RESET" "${ess.slice(0, 8).join(" · ")}${ess.length > 8 ? " · …" : ""}"`,
          ]
        : []),
      `ok "Dockerfile written — tooling baked in on first 'devcontainer up'"`,
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

  // ── policy enforcement ─────────────────────────────────────────────
  const enf = c.enforce;
  const nodeFeat = c.features.find((f) => f.id === "node");
  const nodeOn = !!nodeFeat?.on;
  const nodeVer = nodeFeat?.version ?? "22";
  const anyPolicy = enf.nonRoot || enf.engines || enf.secretsGuard || enf.preCommit || enf.schemaGate;

  push(
    `# ── step · policy enforcement ───────────────────────────────────────`,
    anyPolicy
      ? `log "enforcing \${REPO_NAME} environment policy"`
      : `warn "all enforcement policies disabled — environment ships unguarded"`,
    ``
  );

  if (enf.nonRoot) {
    if (c.remoteUser === "root") {
      push(
        `# P1 · non-root execution — REFUSED`,
        `die "P1 · remoteUser=root is refused by policy — choose 'vscode' or 'node' in the forge manifest"`,
        ``
      );
    } else {
      push(
        `# P1 · non-root execution`,
        `ok "P1 · container runs as '${c.remoteUser}' (non-root verified)"`,
        ``
      );
    }
  } else {
    push(`# P1 · non-root execution (disabled)`, `warn "P1 · non-root check disabled — user: ${c.remoteUser}"`, ``);
  }

  if (enf.engines) {
    if (nodeOn) {
      push(
        `# P2 · runtime pinning — .nvmrc committed next to the code`,
        `printf '%s\\n' "${nodeVer}" > "\${PROJECT_DIR}/.nvmrc"`,
        `ok "P2 · node ${nodeVer} pinned via .nvmrc (honored by nvm, fnm, volta)"`,
        ``
      );
    } else {
      push(`# P2 · runtime pinning`, `warn "P2 · node feature is off — runtime left unpinned"`, ``);
    }
  } else {
    push(`# P2 · runtime pinning (disabled)`, `warn "P2 · no .nvmrc written — toolchains may drift"`, ``);
  }

  if (enf.secretsGuard) {
    push(
      `# P3 · secret hygiene — keep .env out of history`,
      `touch "\${PROJECT_DIR}/.gitignore"`,
      `grep -qxF ".env" "\${PROJECT_DIR}/.gitignore" 2>/dev/null || \\`,
      `  printf '\\n# added by setup-env.sh · policy P3\\n.env\\n.env.local\\n' >> "\${PROJECT_DIR}/.gitignore"`,
      `ok "P3 · .gitignore now guards .env"`,
      ``
    );
  } else {
    push(`# P3 · secret hygiene (disabled)`, `warn "P3 · .env left unguarded in .gitignore"`, ``);
  }

  if (enf.preCommit) {
    push(
      `# P4 · pre-commit guard — refuse staged secret files`,
      `mkdir -p "\${PROJECT_DIR}/.githooks"`,
      `cat > "\${PROJECT_DIR}/.githooks/pre-commit" <<'PRE_COMMIT_HOOK'`,
      `#!/usr/bin/env sh`,
      `if git diff --cached --name-only | grep -qE '(^|/)\\.env'; then`,
      `  echo "✖ pre-commit: refusing to stage .env files (policy P3/P4)" >&2`,
      `  exit 1`,
      `fi`,
      `PRE_COMMIT_HOOK`,
      `chmod +x "\${PROJECT_DIR}/.githooks/pre-commit"`,
      `git -C "\${PROJECT_DIR}" config core.hooksPath .githooks 2>/dev/null || true`,
      `ok "P4 · pre-commit guard installed (core.hooksPath=.githooks)"`,
      ``
    );
  } else {
    push(`# P4 · pre-commit guard (disabled)`, `warn "P4 · staged .env files would pass silently"`, ``);
  }

  if (enf.schemaGate) {
    push(
      `# P5 · schema gate — validate what we just wrote`,
      `if command -v jq >/dev/null 2>&1; then`,
      `  jq empty "\${DEVCONTAINER_DIR}/devcontainer.json" || die "P5 · devcontainer.json is not valid JSON"`,
      `  ok "P5 · devcontainer.json parses — full build gate runs in CI"`,
      `else`,
      `  warn "P5 · jq not found locally — schema gate deferred to CI"`,
      `fi`,
      ``
    );
  } else {
    push(`# P5 · schema gate (disabled)`, `warn "P5 · config errors will only surface on 'devcontainer up'"`, ``);
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

// ── CI policy gate ───────────────────────────────────────────────────────────

export function buildWorkflow(c: Config): string {
  const img = imageRef(c);
  const e = c.enforce;
  const blocks: string[] = [];

  blocks.push(
    `      - name: P1 · refuse root user`,
    `        run: |`,
    `          user=$(jq -r '.remoteUser // "vscode"' .devcontainer/devcontainer.json)`,
    `          if [ "$user" = "root" ]; then`,
    `            echo "::error::remoteUser=root violates the non-root policy"`,
    `            exit 1`,
    `          fi`,
    `          echo "container user: $user"`,
    ``
  );

  if (e.engines) {
    blocks.push(
      `      - name: P2 · runtime pin present`,
      `        run: test -f .nvmrc && echo "node pinned to $(cat .nvmrc)"`,
      ``
    );
  }

  blocks.push(
    `      - name: P5 · config build gate`,
    `        run: devcontainer build --workspace-folder .`,
    ``
  );

  if (e.secretsGuard || e.preCommit) {
    blocks.push(
      `      - name: P3/P4 · secret scan`,
      `        uses: gitleaks/gitleaks-action@v2`,
      `        env:`,
      `          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}`,
      ``
    );
  }

  blocks.push(
    `      - name: Smoke test against GHCR`,
    `        run: |`,
    `          docker pull ${img}`,
    `          docker run --rm ${img} sh -lc 'echo "image healthy: $(whoami)"'`
  );

  return `# CI enforcement for the ${c.owner}/${c.repo} devcontainer environment.
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

${blocks.join("\n")}
`;
}

// ── artifacts bundle ─────────────────────────────────────────────────────────

export interface Artifacts {
  setup: string;
  json: string;
  dockerfile: string;
  quickstart: string;
  workflow: string;
}

export function buildArtifacts(c: Config): Artifacts {
  const json = buildDevcontainerJson(c);
  const dockerfile = buildDockerfile(c);
  return {
    setup: buildSetupScript(c, json, dockerfile),
    json,
    dockerfile,
    quickstart: buildQuickstart(c),
    workflow: buildWorkflow(c),
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
  if (essentialPkgs(c).length) s += 24;
  if (c.smokeTest) s += 7;
  if (Object.values(c.enforce).some(Boolean)) s += 8;
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
  c: "cmd" | "log" | "ok" | "warn" | "dim" | "exit" | "err";
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
  ];
  if (c.cloneRepo) {
    lines.push({ t: `▸ cloning github.com/${c.owner}/${c.repo} (depth 1)`, c: "log" });
    lines.push({ t: `✔ cloned → ./${c.repo}`, c: "ok" });
  } else {
    lines.push({ t: `▲ cloning disabled — expecting an existing workspace at ./${c.repo}`, c: "warn" });
  }
  lines.push(
    { t: `▸ writing .devcontainer/devcontainer.json`, c: "log" },
    { t: `✔ devcontainer.json (${byteSize(arts.json)})`, c: "ok" }
  );
  const ess = essentialPkgs(c);
  const all = imagePkgs(c);
  if (all.length) {
    lines.push({ t: `▸ pre-install manifest → Dockerfile`, c: "log" });
    if (ess.length) {
      lines.push({
        t: `  essentials: ${ess.slice(0, 6).join(" · ")}${ess.length > 6 ? " · …" : ""} (${ess.length} pkgs)`,
        c: "dim",
      });
    }
    lines.push({ t: `✔ ${all.length} packages will be baked in on first build`, c: "ok" });
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

  // ── policy enforcement ─────────────────────────────────────────────
  const e = c.enforce;
  const nodeFeat = c.features.find((f) => f.id === "node");
  const violated = hasViolation(c);
  const anyPolicy = e.nonRoot || e.engines || e.secretsGuard || e.preCommit || e.schemaGate;
  lines.push({ t: `▸ enforcing ${c.repo} environment policy`, c: "log" });
  if (!anyPolicy) {
    lines.push({ t: `▲ all enforcement policies disabled — shipping unguarded`, c: "warn" });
  } else {
    if (e.nonRoot) {
      lines.push(
        violated
          ? { t: `✖ P1 · remoteUser=root is refused by policy`, c: "err" }
          : { t: `✔ P1 · container runs as '${c.remoteUser}' (non-root verified)`, c: "ok" }
      );
    }
    if (e.engines) {
      lines.push(
        nodeFeat?.on
          ? { t: `✔ P2 · node ${nodeFeat.version ?? "22"} pinned via .nvmrc`, c: "ok" }
          : { t: `▲ P2 · node feature off — runtime left unpinned`, c: "warn" }
      );
    }
    if (e.secretsGuard) lines.push({ t: `✔ P3 · .gitignore now guards .env`, c: "ok" });
    if (e.preCommit) lines.push({ t: `✔ P4 · pre-commit guard installed`, c: "ok" });
    if (e.schemaGate) lines.push({ t: `✔ P5 · devcontainer.json parses — build gate runs in CI`, c: "ok" });
  }

  lines.push({ t: ``, c: "dim" });
  if (violated) {
    lines.push({ t: `✖ ${c.repo} environment refused — fix P1 in the manifest`, c: "err" });
    lines.push({ t: `exit 1 · policy gate failed after ${formatDuration(estimateSeconds(c))}`, c: "exit" });
  } else {
    lines.push({ t: `✔ ${c.repo} environment ready — code "./${c.repo}"`, c: "ok" });
    lines.push({ t: `exit 0 · wall ${formatDuration(estimateSeconds(c))}`, c: "exit" });
  }
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
  const img = imagePkgs(c);
  const ess = essentialPkgs(c);
  const extra = aptList(c);
  if (img.length) {
    layers.push({
      id: "apt",
      label: `RUN apt-get install ${img.slice(0, 3).join(" ")}${img.length > 3 ? " …" : ""}`,
      detail: ess.length
        ? `${ess.length} essentials${extra.length ? ` + ${extra.length} project extras` : ""} pre-installed via Dockerfile`
        : `${img.length} extra package${img.length > 1 ? "s" : ""} baked in via Dockerfile`,
      mb: Math.round(ess.length * 3.5 + extra.length * 6),
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
      toolGroups: mergeList(DEFAULT_CONFIG.toolGroups, p.toolGroups),
      enforce: { ...DEFAULT_CONFIG.enforce, ...(p.enforce ?? {}) },
    };
    return { cfg, restored: true };
  } catch {
    return { cfg: DEFAULT_CONFIG, restored: false };
  }
}
