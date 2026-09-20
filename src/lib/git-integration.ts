import type { Config } from "./generator";

export interface GitCommit {
  hash: string;
  message: string;
  author: string;
  timestamp: number;
  config: Config;
  branch: string;
}

export interface GitBranch {
  name: string;
  isCurrent: boolean;
  isRemote: boolean;
  lastCommit: string;
  ahead: number;
  behind: number;
}

export interface GitStatus {
  modified: string[];
  staged: string[];
  untracked: string[];
  conflicts: string[];
}

export interface GitRemote {
  name: string;
  url: string;
  type: "origin" | "upstream" | "fork";
}

export interface GitVersion {
  id: string;
  commitHash: string;
  branch: string;
  message: string;
  author: string;
  timestamp: number;
  config: Config;
  tags: string[];
}

export class GitIntegrationEngine {
  private commits: GitCommit[] = [];
  private branches: GitBranch[] = [];
  private currentBranch: string = "main";
  private remotes: GitRemote[] = [];
  private status: GitStatus = {
    modified: [],
    staged: [],
    untracked: [],
    conflicts: [],
  };
  private versions: GitVersion[] = [];
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.loadFromStorage();
    this.initializeDefaultBranch();
  }

  private loadFromStorage() {
    if (typeof window === "undefined") return;
    
    const commits = localStorage.getItem("git-commits");
    const branches = localStorage.getItem("git-branches");
    const currentBranch = localStorage.getItem("git-current-branch");
    const remotes = localStorage.getItem("git-remotes");
    const versions = localStorage.getItem("git-versions");

    if (commits) this.commits = JSON.parse(commits);
    if (branches) this.branches = JSON.parse(branches);
    if (currentBranch) this.currentBranch = currentBranch;
    if (remotes) this.remotes = JSON.parse(remotes);
    if (versions) this.versions = JSON.parse(versions);
  }

  private saveToStorage() {
    if (typeof window === "undefined") return;
    
    localStorage.setItem("git-commits", JSON.stringify(this.commits));
    localStorage.setItem("git-branches", JSON.stringify(this.branches));
    localStorage.setItem("git-current-branch", this.currentBranch);
    localStorage.setItem("git-remotes", JSON.stringify(this.remotes));
    localStorage.setItem("git-versions", JSON.stringify(this.versions));
  }

  private notifyListeners() {
    this.listeners.forEach((listener) => listener());
  }

  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private initializeDefaultBranch() {
    if (this.branches.length === 0) {
      this.branches.push({
        name: "main",
        isCurrent: true,
        isRemote: false,
        lastCommit: "",
        ahead: 0,
        behind: 0,
      });
      this.saveToStorage();
    }
  }

  // Branch Management
  createBranch(name: string, fromBranch: string = this.currentBranch) {
    if (this.branches.find((b) => b.name === name)) {
      throw new Error(`Branch '${name}' already exists`);
    }

    this.branches.push({
      name,
      isCurrent: false,
      isRemote: false,
      lastCommit: this.branches.find((b) => b.name === fromBranch)?.lastCommit || "",
      ahead: 0,
      behind: 0,
    });

    this.saveToStorage();
    this.notifyListeners();
  }

  switchBranch(name: string) {
    const branch = this.branches.find((b) => b.name === name);
    if (!branch) {
      throw new Error(`Branch '${name}' not found`);
    }

    this.branches.forEach((b) => (b.isCurrent = b.name === name));
    this.currentBranch = name;
    this.saveToStorage();
    this.notifyListeners();
  }

  deleteBranch(name: string) {
    if (name === "main") {
      throw new Error("Cannot delete main branch");
    }

    if (this.currentBranch === name) {
      throw new Error("Cannot delete current branch");
    }

    this.branches = this.branches.filter((b) => b.name !== name);
    this.saveToStorage();
    this.notifyListeners();
  }

  mergeBranch(sourceBranch: string, targetBranch: string = this.currentBranch) {
    const sourceCommits = this.commits.filter((c) => c.branch === sourceBranch);
    const targetCommits = this.commits.filter((c) => c.branch === targetBranch);

    // Simple merge: add all commits from source to target
    sourceCommits.forEach((commit) => {
      if (!targetCommits.find((c) => c.hash === commit.hash)) {
        this.commits.push({
          ...commit,
          branch: targetBranch,
        });
      }
    });

    this.saveToStorage();
    this.notifyListeners();
  }

  // Commit Management
  commit(message: string, author: string, config: Config) {
    const hash = this.generateHash();
    const commit: GitCommit = {
      hash,
      message,
      author,
      timestamp: Date.now(),
      config,
      branch: this.currentBranch,
    };

    this.commits.push(commit);

    // Update branch
    const branch = this.branches.find((b) => b.name === this.currentBranch);
    if (branch) {
      branch.lastCommit = hash;
      branch.ahead++;
    }

    // Create version
    const version: GitVersion = {
      id: `v${this.versions.length + 1}`,
      commitHash: hash,
      branch: this.currentBranch,
      message,
      author,
      timestamp: Date.now(),
      config,
      tags: [],
    };

    this.versions.push(version);

    this.saveToStorage();
    this.notifyListeners();

    return hash;
  }

  getCommitHistory(branch: string = this.currentBranch, limit: number = 50): GitCommit[] {
    return this.commits
      .filter((c) => c.branch === branch)
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }

  getCommit(hash: string): GitCommit | undefined {
    return this.commits.find((c) => c.hash === hash);
  }

  revertCommit(hash: string) {
    const commit = this.commits.find((c) => c.hash === hash);
    if (!commit) {
      throw new Error(`Commit '${hash}' not found`);
    }

    // Create a revert commit
    this.commit(
      `Revert "${commit.message}"`,
      commit.author,
      this.commits[this.commits.length - 2]?.config || commit.config
    );

    this.notifyListeners();
  }

  // Remote Management
  addRemote(name: string, url: string, type: "origin" | "upstream" | "fork" = "origin") {
    if (this.remotes.find((r) => r.name === name)) {
      throw new Error(`Remote '${name}' already exists`);
    }

    this.remotes.push({ name, url, type });
    this.saveToStorage();
    this.notifyListeners();
  }

  removeRemote(name: string) {
    this.remotes = this.remotes.filter((r) => r.name !== name);
    this.saveToStorage();
    this.notifyListeners();
  }

  push(remoteName: string = "origin", branch: string = this.currentBranch) {
    const remote = this.remotes.find((r) => r.name === remoteName);
    if (!remote) {
      throw new Error(`Remote '${remoteName}' not found`);
    }

    // Simulate push
    const branchData = this.branches.find((b) => b.name === branch);
    if (branchData) {
      branchData.ahead = 0;
    }

    this.saveToStorage();
    this.notifyListeners();
  }

  pull(remoteName: string = "origin", branch: string = this.currentBranch) {
    const remote = this.remotes.find((r) => r.name === remoteName);
    if (!remote) {
      throw new Error(`Remote '${remoteName}' not found`);
    }

    // Simulate pull
    const branchData = this.branches.find((b) => b.name === branch);
    if (branchData) {
      branchData.behind = 0;
    }

    this.saveToStorage();
    this.notifyListeners();
  }

  // Status Management
  getStatus(): GitStatus {
    return this.status;
  }

  stageFile(file: string) {
    if (!this.status.staged.includes(file)) {
      this.status.staged.push(file);
      this.status.modified = this.status.modified.filter((f) => f !== file);
      this.notifyListeners();
    }
  }

  unstageFile(file: string) {
    this.status.staged = this.status.staged.filter((f) => f !== file);
    this.status.modified.push(file);
    this.notifyListeners();
  }

  // Version Management
  getVersions(): GitVersion[] {
    return this.versions.sort((a, b) => b.timestamp - a.timestamp);
  }

  getVersion(id: string): GitVersion | undefined {
    return this.versions.find((v) => v.id === id);
  }

  tagVersion(id: string, tag: string) {
    const version = this.versions.find((v) => v.id === id);
    if (version && !version.tags.includes(tag)) {
      version.tags.push(tag);
      this.saveToStorage();
      this.notifyListeners();
    }
  }

  checkoutVersion(id: string): Config | undefined {
    const version = this.versions.find((v) => v.id === id);
    return version?.config;
  }

  // Utilities
  private generateHash(): string {
    return Math.random().toString(36).substring(2, 10);
  }

  getCurrentBranch(): string {
    return this.currentBranch;
  }

  getBranches(): GitBranch[] {
    return this.branches;
  }

  getRemotes(): GitRemote[] {
    return this.remotes;
  }

  getStats() {
    return {
      totalCommits: this.commits.length,
      totalBranches: this.branches.length,
      totalVersions: this.versions.length,
      totalRemotes: this.remotes.length,
    };
  }

  reset() {
    this.commits = [];
    this.branches = [];
    this.currentBranch = "main";
    this.remotes = [];
    this.versions = [];
    this.status = {
      modified: [],
      staged: [],
      untracked: [],
      conflicts: [],
    };

    this.initializeDefaultBranch();
    this.saveToStorage();
    this.notifyListeners();
  }
}
