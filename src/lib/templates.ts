import { DEFAULT_CONFIG, type Config } from "../lib/generator";

export interface Template {
  id: string;
  name: string;
  description: string;
  icon: string;
  config: Partial<Config>;
}

export const templates: Template[] = [
  {
    id: "node-fullstack",
    name: "Node.js Full-Stack",
    description: "React + Express + PostgreSQL + Redis",
    icon: "🟢",
    config: {
      features: [
        { ...DEFAULT_CONFIG.features[0], on: true }, // docker-in-docker
        { ...DEFAULT_CONFIG.features[1], on: true }, // git
        { ...DEFAULT_CONFIG.features[2], on: true }, // github-cli
        { ...DEFAULT_CONFIG.features[3], on: true, version: "20" }, // node 20
      ],
      ports: ["3000", "5173", "5432", "6379"],
      extensions: [
        "dbaeumer.vscode-eslint",
        "esbenp.prettier-vscode",
        "bradlc.vscode-tailwindcss",
        "ms-azuretools.vscode-docker",
      ],
      postSteps: [
        { id: "deps", label: "Install dependencies", cmd: "npm ci", on: true },
        { id: "env", label: "Seed .env", cmd: "[ -f .env.example ] && cp -n .env.example .env || true", on: true },
      ],
    },
  },
  {
    id: "python-ml",
    name: "Python ML/AI",
    description: "PyTorch + Jupyter + CUDA support",
    icon: "🐍",
    config: {
      features: [
        { ...DEFAULT_CONFIG.features[0], on: true }, // docker-in-docker
        { ...DEFAULT_CONFIG.features[1], on: true }, // git
        { ...DEFAULT_CONFIG.features[2], on: true }, // github-cli
        { ...DEFAULT_CONFIG.features[4], on: true, version: "3.11" }, // python 3.11
      ],
      ports: ["8888", "6006"],
      extensions: [
        "ms-python.python",
        "ms-python.vscode-pylance",
        "ms-toolsai.jupyter",
        "ms-toolsai.tensorboard",
      ],
      postSteps: [
        { id: "venv", label: "Create virtualenv", cmd: "python -m venv .venv && source .venv/bin/activate", on: true },
        { id: "deps", label: "Install dependencies", cmd: "pip install -r requirements.txt", on: true },
      ],
    },
  },
  {
    id: "go-microservice",
    name: "Go Microservice",
    description: "Go 1.22 + gRPC + Docker",
    icon: "🔵",
    config: {
      features: [
        { ...DEFAULT_CONFIG.features[0], on: true }, // docker-in-docker
        { ...DEFAULT_CONFIG.features[1], on: true }, // git
        { ...DEFAULT_CONFIG.features[2], on: true }, // github-cli
      ],
      langs: [
        { ...DEFAULT_CONFIG.langs[1], on: true, version: "1.22" }, // go 1.22
      ],
      ports: ["8080", "9090"],
      extensions: [
        "golang.go",
        "ms-azuretools.vscode-docker",
        "zxh404.vscode-proto3",
      ],
      postSteps: [
        { id: "deps", label: "Download modules", cmd: "go mod download", on: true },
        { id: "tools", label: "Install tools", cmd: "go install github.com/grpc-ecosystem/grpc-gateway/v2/protoc-gen-grpc-gateway@latest", on: true },
      ],
    },
  },
  {
    id: "rust-backend",
    name: "Rust Backend",
    description: "Rust + Actix-web + PostgreSQL",
    icon: "🦀",
    config: {
      features: [
        { ...DEFAULT_CONFIG.features[0], on: true }, // docker-in-docker
        { ...DEFAULT_CONFIG.features[1], on: true }, // git
        { ...DEFAULT_CONFIG.features[2], on: true }, // github-cli
      ],
      langs: [
        { ...DEFAULT_CONFIG.langs[0], on: true, version: "stable" }, // rust stable
      ],
      ports: ["8080", "5432"],
      extensions: [
        "rust-lang.rust-analyzer",
        "vadimcn.vscode-lldb",
        "ms-azuretools.vscode-docker",
      ],
      postSteps: [
        { id: "build", label: "Build project", cmd: "cargo build", on: true },
        { id: "fmt", label: "Check formatting", cmd: "cargo fmt --check", on: true },
      ],
    },
  },
  {
    id: "java-spring",
    name: "Java Spring Boot",
    description: "Java 21 + Spring Boot + Maven",
    icon: "☕",
    config: {
      features: [
        { ...DEFAULT_CONFIG.features[0], on: true }, // docker-in-docker
        { ...DEFAULT_CONFIG.features[1], on: true }, // git
        { ...DEFAULT_CONFIG.features[2], on: true }, // github-cli
      ],
      langs: [
        { ...DEFAULT_CONFIG.langs[3], on: true, version: "21" }, // java 21
      ],
      ports: ["8080", "5005"],
      extensions: [
        "vscjava.vscode-java-pack",
        "vmware.vscode-boot-dev-pack",
        "redhat.java",
      ],
      postSteps: [
        { id: "build", label: "Build with Maven", cmd: "./mvnw clean install -DskipTests", on: true },
      ],
    },
  },
  {
    id: "dotnet-api",
    name: ".NET Web API",
    description: ".NET 8 + Entity Framework + SQL Server",
    icon: "🟣",
    config: {
      features: [
        { ...DEFAULT_CONFIG.features[0], on: true }, // docker-in-docker
        { ...DEFAULT_CONFIG.features[1], on: true }, // git
        { ...DEFAULT_CONFIG.features[2], on: true }, // github-cli
      ],
      langs: [
        { ...DEFAULT_CONFIG.langs[4], on: true, version: "8.0" }, // .NET 8
      ],
      ports: ["5000", "5001", "1433"],
      extensions: [
        "ms-dotnettools.csharp",
        "ms-dotnettools.vscode-dotnet-runtime",
        "ms-mssql.mssql",
      ],
      postSteps: [
        { id: "restore", label: "Restore packages", cmd: "dotnet restore", on: true },
        { id: "build", label: "Build solution", cmd: "dotnet build", on: true },
      ],
    },
  },
];
