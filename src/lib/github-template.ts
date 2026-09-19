import type { Config } from "./generator";
import { buildArtifacts } from "./generator";
import { generateSecurityAudit } from "./security-audit";
import { estimateCosts } from "./cost-estimation";

export interface TemplateFile {
  path: string;
  content: string;
  description: string;
}

export function generateGitHubTemplate(c: Config): TemplateFile[] {
  const artifacts = buildArtifacts(c);
  const security = generateSecurityAudit(c);
  const costs = estimateCosts(c);

  const files: TemplateFile[] = [
    {
      path: ".devcontainer/devcontainer.json",
      content: artifacts.json,
      description: "VS Code devcontainer configuration",
    },
    {
      path: ".devcontainer/Dockerfile",
      content: artifacts.dockerfile,
      description: "Container definition with toolchains",
    },
    {
      path: ".devcontainer/sprint.json",
      content: JSON.stringify(
        {
          repo: `${c.owner}/${c.repo}`,
          image: `ghcr.io/${c.owner.toLowerCase()}/${c.repo.toLowerCase()}:${c.tag}`,
          base: c.base,
          shell: c.shell,
          remoteUser: c.remoteUser,
          features: c.features.filter((f) => f.on).map((f) => f.label),
          toolchains: c.langs.filter((l) => l.on).map((l) => `${l.label} ${l.version}`),
          essentialPkgs: c.toolGroups.reduce((sum, g) => sum + (g.on ? g.pkgs.length : 0), 0),
          policyGates: Object.values(c.enforce).filter(Boolean).length,
          generated: new Date().toISOString(),
        },
        null,
        2
      ),
      description: "Sprint metadata and configuration hash",
    },
    {
      path: ".devcontainer/qa-checklist.md",
      content: `# QA Checklist for ${c.repo}\n\n## Security Score: ${security.score}/100 (${security.grade})\n\n${security.summary}\n\n## Issues Found: ${security.issues.length}\n\n${security.issues
        .map(
          (issue) =>
            `- [${issue.severity.toUpperCase()}] ${issue.title}\n  - ${issue.description}\n  - Recommendation: ${issue.recommendation}`
        )
        .join("\n\n")}`,
      description: "Quality assurance checklist with security audit",
    },
    {
      path: ".github/workflows/validate-devcontainer.yml",
      content: artifacts.workflow,
      description: "CI/CD workflow for validation",
    },
    {
      path: "setup-env.sh",
      content: artifacts.setup,
      description: "Automated environment setup script",
    },
    {
      path: "docker-compose.yml",
      content: artifacts.compose,
      description: "Multi-service orchestration",
    },
    {
      path: "README.md",
      content: artifacts.readme,
      description: "Project documentation",
    },
    {
      path: ".env.example",
      content: artifacts.envExample,
      description: "Environment variables template",
    },
    {
      path: "Makefile",
      content: artifacts.makefile,
      description: "Common development tasks",
    },
    {
      path: "COST_ESTIMATE.md",
      content: `# Cost Estimate for ${c.repo}\n\n## Resource Usage\n\n- **Image Size**: ${costs.imageSize} MB\n- **Build Time**: ${costs.buildTime}s\n- **Memory Usage**: ${costs.memoryUsage} MB\n- **CPU Usage**: ${costs.cpuUsage} cores\n- **Disk Usage**: ${costs.diskUsage} MB\n\n## Monthly Cost (GitHub Codespaces)\n\n**Estimated: $${costs.monthlyCost}/month**\n\n*Based on 160 hours/month usage*\n\n## Cost Optimization Tips\n\n${
  costs.imageSize > 1024
    ? "- Consider using Alpine base image to reduce size\n"
    : ""
}${
  costs.monthlyCost > 50
    ? "- Review resource allocation and adjust instance size\n"
    : ""
}${
  costs.memoryUsage > 4096
    ? "- Optimize memory usage or increase instance size\n"
    : ""
}`,
      description: "Cost estimation and optimization recommendations",
    },
    {
      path: ".gitignore",
      content: `# Dependencies\nnode_modules/\n.pnp\n.pnp.js\n\n# Testing\ncoverage/\n\n# Production\nbuild/\ndist/\n\n# Environment\n.env\n.env.local\n.env.development.local\n.env.test.local\n.env.production.local\n\n# Logs\nnpm-debug.log*\nyarn-debug.log*\nyarn-error.log*\nlerna-debug.log*\n\n# Editor\n.vscode/*\n!.vscode/extensions.json\n.idea\n.DS_Store\n*.suo\n*.ntvs*\n*.njsproj\n*.sln\n*.sw?\n\n# OS\n.DS_Store\nThumbs.db\n`,
      description: "Git ignore rules",
    },
    {
      path: ".vscode/extensions.json",
      content: JSON.stringify(
        {
          recommendations: c.extensions,
        },
        null,
        2
      ),
      description: "Recommended VS Code extensions",
    },
    {
      path: "LICENSE",
      content: `MIT License\n\nCopyright (c) ${new Date().getFullYear()} ${c.owner}\n\nPermission is hereby granted, free of charge, to any person obtaining a copy\nof this software and associated documentation files (the "Software"), to deal\nin the Software without restriction, including without limitation the rights\nto use, copy, modify, merge, publish, distribute, sublicense, and/or sell\ncopies of the Software, and to permit persons to whom the Software is\nfurnished to do so, subject to the following conditions:\n\nThe above copyright notice and this permission notice shall be included in all\ncopies or substantial portions of the Software.\n\nTHE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\nIMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,\nFITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE\nAUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER\nLIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,\nOUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE\nSOFTWARE.\n`,
      description: "MIT License",
    },
  ];

  return files;
}

export function downloadTemplateAsZip(files: TemplateFile[], repoName: string) {
  // This would use JSZip in a real implementation
  // For now, we'll download files individually
  console.log(`Would download ${files.length} files as ${repoName}-template.zip`);
}
