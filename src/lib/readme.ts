import type { Config } from "./generator";

export function buildReadme(c: Config): string {
  const hasPostgres = c.ports.includes("5432");
  const hasRedis = c.ports.includes("6379");
  const hasMongo = c.ports.includes("27017");
  const hasMysql = c.ports.includes("3306");
  const hasElastic = c.ports.includes("9200");

  const services = [];
  if (hasPostgres) services.push("PostgreSQL");
  if (hasRedis) services.push("Redis");
  if (hasMongo) services.push("MongoDB");
  if (hasMysql) services.push("MySQL");
  if (hasElastic) services.push("Elasticsearch");

  const toolchains = c.langs.filter(l => l.on).map(l => `${l.label} ${l.version}`);

  return `# ${c.repo}

> Development environment powered by [GHCR Devcontainer Forge](https://github.com/nyeinpyaesone-ui/ERP)

## Quick Start

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) installed and running
- [VS Code](https://code.visualstudio.com/) with [Dev Containers extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)
- [Git](https://git-scm.com/downloads)

### Setup

1. **Clone the repository**
   \`\`\`bash
   git clone https://github.com/${c.owner}/${c.repo}.git
   cd ${c.repo}
   \`\`\`

2. **Run the setup script**
   \`\`\`bash
   chmod +x setup-env.sh
   ./setup-env.sh
   \`\`\`

3. **Open in VS Code**
   \`\`\`bash
   code .
   \`\`\`

4. **Reopen in Container**
   - Press \`F1\` or \`Ctrl/Cmd+Shift+P\`
   - Select "Dev Containers: Reopen in Container"
   - Wait for the container to build and start

## Development Environment

### Base Configuration

- **Base Image**: ${c.base}
- **Shell**: ${c.shell}
- **Remote User**: ${c.remoteUser}
- **Node Version**: ${c.features.find(f => f.id === 'node')?.version || 'N/A'}

${toolchains.length > 0 ? `### Language Toolchains

${toolchains.map(t => `- ${t}`).join('\n')}
` : ''}

### Essential Tooling

${c.toolGroups.filter(g => g.on).map(g => `- **${g.label}**: ${g.desc}`).join('\n')}

### VS Code Extensions

${c.extensions.map(ext => `- ${ext}`).join('\n')}

${services.length > 0 ? `## Services

This project includes the following services:

${services.map(s => `- **${s}**: Accessible via Docker Compose`).join('\n')}

### Starting Services

\`\`\`bash
docker-compose up -d
\`\`\`

### Stopping Services

\`\`\`bash
docker-compose down
\`\`\`
` : ''}

## Development Workflow

### Available Scripts

\`\`\`bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Build for production
npm run build

# Lint code
npm run lint
\`\`\`

### Port Forwarding

The following ports are automatically forwarded:

${c.ports.map(port => `- **${port}**: http://localhost:${port}`).join('\n')}

## Policy Enforcement

This project enforces the following policies:

${c.enforce.nonRoot ? '- ✅ **P1 - Non-root execution**: Container runs as non-root user\n' : ''}${c.enforce.engines ? '- ✅ **P2 - Runtime pinning**: Node.js version pinned via .nvmrc\n' : ''}${c.enforce.secretsGuard ? '- ✅ **P3 - Secret hygiene**: Secrets excluded from version control\n' : ''}${c.enforce.preCommit ? '- ✅ **P4 - Pre-commit hooks**: Automated code quality checks\n' : ''}${c.enforce.schemaGate ? '- ✅ **P5 - Schema validation**: devcontainer.json validated\n' : ''}

## Project Structure

\`\`\`
${c.repo}/
├── .devcontainer/
│   ├── devcontainer.json    # Dev container configuration
│   ├── Dockerfile           # Container definition
│   ├── sprint.json          # Sprint metadata
│   ├── qa-checklist.md      # QA procedures
│   └── MAINTENANCE.md       # Maintenance guide
├── .github/
│   └── workflows/
│       └── validate-devcontainer.yml  # CI/CD pipeline
├── setup-env.sh             # Environment setup script
├── dev-flow.md              # Development workflow
├── BOOTSTRAP.md             # Bootstrap instructions
└── README.md                # This file
\`\`\`

## Troubleshooting

### Container won't start

\`\`\`bash
# Rebuild the container
docker-compose down
docker-compose build --no-cache
docker-compose up -d
\`\`\`

### Permissions issues

\`\`\`bash
# Fix ownership
sudo chown -R $(whoami) .
\`\`\`

### Port conflicts

Check if ports are already in use:
\`\`\`bash
lsof -i :${c.ports[0] || '3000'}
\`\`\`

## Contributing

1. Fork the repository
2. Create a feature branch (\`git checkout -b feature/amazing-feature\`)
3. Commit your changes (\`git commit -m 'Add amazing feature'\`)
4. Push to the branch (\`git push origin feature/amazing-feature\`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For issues and questions:
- Open an issue on [GitHub](https://github.com/${c.owner}/${c.repo}/issues)
- Check the [documentation](docs/)
- Review the [troubleshooting guide](TROUBLESHOOTING.md)

---

**Built with ❤️ using GHCR Devcontainer Forge**
`;
}
