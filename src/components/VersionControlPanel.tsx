import { useState, useEffect } from "react";
import { GitIntegrationEngine, type GitCommit, type GitBranch, type GitVersion } from "../lib/git-integration";
import type { Config } from "../lib/generator";

interface VersionControlPanelProps {
  config: Config;
  onConfigChange: (config: Config) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function VersionControlPanel({ config, onConfigChange, isOpen, onClose }: VersionControlPanelProps) {
  const [engine] = useState(() => new GitIntegrationEngine());
  const [activeTab, setActiveTab] = useState<"branches" | "commits" | "versions" | "remotes">("branches");
  const [currentBranch, setCurrentBranch] = useState(engine.getCurrentBranch());
  const [branches, setBranches] = useState<GitBranch[]>(engine.getBranches());
  const [commits, setCommits] = useState<GitCommit[]>(engine.getCommitHistory());
  const [versions, setVersions] = useState<GitVersion[]>(engine.getVersions());
  const [remotes, setRemotes] = useState(engine.getRemotes());
  
  // Form states
  const [newBranchName, setNewBranchName] = useState("");
  const [commitMessage, setCommitMessage] = useState("");
  const [commitAuthor, setCommitAuthor] = useState("");
  const [remoteName, setRemoteName] = useState("");
  const [remoteUrl, setRemoteUrl] = useState("");
  const [versionTag, setVersionTag] = useState("");

  useEffect(() => {
    if (isOpen) {
      const unsubscribe = engine.subscribe(() => {
        setCurrentBranch(engine.getCurrentBranch());
        setBranches(engine.getBranches());
        setCommits(engine.getCommitHistory());
        setVersions(engine.getVersions());
        setRemotes(engine.getRemotes());
      });

      return () => {
        unsubscribe();
      };
    }
  }, [isOpen, engine]);

  const handleCreateBranch = () => {
    if (!newBranchName.trim()) return;
    try {
      engine.createBranch(newBranchName);
      setNewBranchName("");
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to create branch");
    }
  };

  const handleSwitchBranch = (branchName: string) => {
    try {
      engine.switchBranch(branchName);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to switch branch");
    }
  };

  const handleDeleteBranch = (branchName: string) => {
    if (!confirm(`Delete branch '${branchName}'?`)) return;
    try {
      engine.deleteBranch(branchName);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to delete branch");
    }
  };

  const handleCommit = () => {
    if (!commitMessage.trim() || !commitAuthor.trim()) return;
    engine.commit(commitMessage, commitAuthor, config);
    setCommitMessage("");
  };

  const handleRevert = (hash: string) => {
    if (!confirm("Revert this commit?")) return;
    try {
      engine.revertCommit(hash);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to revert commit");
    }
  };

  const handleAddRemote = () => {
    if (!remoteName.trim() || !remoteUrl.trim()) return;
    try {
      engine.addRemote(remoteName, remoteUrl);
      setRemoteName("");
      setRemoteUrl("");
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to add remote");
    }
  };

  const handleRemoveRemote = (name: string) => {
    if (!confirm(`Remove remote '${name}'?`)) return;
    engine.removeRemote(name);
  };

  const handlePush = (remoteName: string) => {
    try {
      engine.push(remoteName);
      alert(`Pushed to ${remoteName}`);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to push");
    }
  };

  const handlePull = (remoteName: string) => {
    try {
      engine.pull(remoteName);
      alert(`Pulled from ${remoteName}`);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to pull");
    }
  };

  const handleTagVersion = (versionId: string) => {
    if (!versionTag.trim()) return;
    engine.tagVersion(versionId, versionTag);
    setVersionTag("");
  };

  const handleCheckoutVersion = (versionId: string) => {
    if (!confirm("Checkout this version? Current config will be replaced.")) return;
    const config = engine.checkoutVersion(versionId);
    if (config) {
      onConfigChange(config);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const formatRelativeTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return "just now";
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-ink-900 border border-ink-700 rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="border-b border-ink-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-mist-100 flex items-center gap-2">
                🔀 Version Control & Git Integration
              </h2>
              <p className="text-mist-400 text-sm mt-1">
                Manage branches, commits, and versions
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-mist-400 hover:text-mist-100 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Current Branch Info */}
          <div className="bg-ink-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-mist-400">Current Branch</div>
                <div className="text-xl font-bold text-mist-100 flex items-center gap-2">
                  <span className="text-2xl">🌿</span>
                  {currentBranch}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-mist-400">Statistics</div>
                <div className="text-sm text-mist-300">
                  {engine.getStats().totalCommits} commits · {engine.getStats().totalBranches} branches · {engine.getStats().totalVersions} versions
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-ink-700">
          <div className="flex">
            <button
              onClick={() => setActiveTab("branches")}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === "branches"
                  ? "text-purple-400 border-b-2 border-purple-400"
                  : "text-mist-500 hover:text-mist-300"
              }`}
            >
              🌿 Branches
            </button>
            <button
              onClick={() => setActiveTab("commits")}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === "commits"
                  ? "text-purple-400 border-b-2 border-purple-400"
                  : "text-mist-500 hover:text-mist-300"
              }`}
            >
              📝 Commits
            </button>
            <button
              onClick={() => setActiveTab("versions")}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === "versions"
                  ? "text-purple-400 border-b-2 border-purple-400"
                  : "text-mist-500 hover:text-mist-300"
              }`}
            >
              🏷️ Versions
            </button>
            <button
              onClick={() => setActiveTab("remotes")}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === "remotes"
                  ? "text-purple-400 border-b-2 border-purple-400"
                  : "text-mist-500 hover:text-mist-300"
              }`}
            >
              🌐 Remotes
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Branches Tab */}
          {activeTab === "branches" && (
            <div className="space-y-6">
              {/* Create Branch */}
              <div className="bg-ink-800 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-mist-100 mb-3">Create New Branch</h3>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newBranchName}
                    onChange={(e) => setNewBranchName(e.target.value)}
                    placeholder="Branch name"
                    className="flex-1 px-3 py-2 bg-ink-900 border border-ink-700 rounded-lg text-mist-100 focus:outline-none focus:border-purple-500"
                  />
                  <button
                    onClick={handleCreateBranch}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors"
                  >
                    Create
                  </button>
                </div>
              </div>

              {/* Commit Form */}
              <div className="bg-ink-800 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-mist-100 mb-3">Commit Changes</h3>
                <div className="space-y-2">
                  <input
                    type="text"
                    value={commitAuthor}
                    onChange={(e) => setCommitAuthor(e.target.value)}
                    placeholder="Author name"
                    className="w-full px-3 py-2 bg-ink-900 border border-ink-700 rounded-lg text-mist-100 focus:outline-none focus:border-purple-500"
                  />
                  <textarea
                    value={commitMessage}
                    onChange={(e) => setCommitMessage(e.target.value)}
                    placeholder="Commit message"
                    rows={3}
                    className="w-full px-3 py-2 bg-ink-900 border border-ink-700 rounded-lg text-mist-100 focus:outline-none focus:border-purple-500 resize-none"
                  />
                  <button
                    onClick={handleCommit}
                    className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors"
                  >
                    Commit
                  </button>
                </div>
              </div>

              {/* Branch List */}
              <div className="bg-ink-800 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-mist-100 mb-3">All Branches</h3>
                <div className="space-y-2">
                  {branches.map((branch) => (
                    <div
                      key={branch.name}
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        branch.isCurrent ? "bg-purple-600/20 border border-purple-500/50" : "bg-ink-900"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{branch.isCurrent ? "🌿" : "🌱"}</span>
                        <div>
                          <div className="font-semibold text-mist-100">{branch.name}</div>
                          <div className="text-xs text-mist-400">
                            {branch.isCurrent && "Current branch · "}
                            {branch.ahead > 0 && `${branch.ahead} ahead · `}
                            {branch.behind > 0 && `${branch.behind} behind`}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {!branch.isCurrent && (
                          <button
                            onClick={() => handleSwitchBranch(branch.name)}
                            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
                          >
                            Switch
                          </button>
                        )}
                        {branch.name !== "main" && (
                          <button
                            onClick={() => handleDeleteBranch(branch.name)}
                            className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Commits Tab */}
          {activeTab === "commits" && (
            <div className="space-y-4">
              {commits.length === 0 ? (
                <div className="text-center py-12 text-mist-400">
                  No commits yet. Make your first commit!
                </div>
              ) : (
                commits.map((commit) => (
                  <div key={commit.hash} className="bg-ink-800 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="font-semibold text-mist-100 mb-1">{commit.message}</div>
                        <div className="text-sm text-mist-400">
                          {commit.author} · {formatRelativeTime(commit.timestamp)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-mist-500 font-mono">{commit.hash}</div>
                        <button
                          onClick={() => handleRevert(commit.hash)}
                          className="mt-1 px-2 py-1 bg-orange-600 hover:bg-orange-700 text-white text-xs rounded transition-colors"
                        >
                          Revert
                        </button>
                      </div>
                    </div>
                    <div className="text-xs text-mist-500">
                      Branch: {commit.branch} · {formatDate(commit.timestamp)}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Versions Tab */}
          {activeTab === "versions" && (
            <div className="space-y-4">
              {versions.length === 0 ? (
                <div className="text-center py-12 text-mist-400">
                  No versions yet. Commit changes to create versions.
                </div>
              ) : (
                versions.map((version) => (
                  <div key={version.id} className="bg-ink-800 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg">🏷️</span>
                          <span className="font-semibold text-mist-100">{version.id}</span>
                          {version.tags.map((tag) => (
                            <span key={tag} className="px-2 py-0.5 bg-purple-600/30 text-purple-300 text-xs rounded">
                              {tag}
                            </span>
                          ))}
                        </div>
                        <div className="text-sm text-mist-300 mb-1">{version.message}</div>
                        <div className="text-xs text-mist-400">
                          {version.author} · {formatRelativeTime(version.timestamp)}
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => handleCheckoutVersion(version.id)}
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
                        >
                          Checkout
                        </button>
                        <input
                          type="text"
                          value={versionTag}
                          onChange={(e) => setVersionTag(e.target.value)}
                          placeholder="Add tag"
                          className="px-2 py-1 bg-ink-900 border border-ink-700 rounded text-xs text-mist-100 focus:outline-none focus:border-purple-500"
                        />
                        <button
                          onClick={() => handleTagVersion(version.id)}
                          className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded transition-colors"
                        >
                          Tag
                        </button>
                      </div>
                    </div>
                    <div className="text-xs text-mist-500">
                      Branch: {version.branch} · Commit: {version.commitHash}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Remotes Tab */}
          {activeTab === "remotes" && (
            <div className="space-y-6">
              {/* Add Remote */}
              <div className="bg-ink-800 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-mist-100 mb-3">Add Remote Repository</h3>
                <div className="space-y-2">
                  <input
                    type="text"
                    value={remoteName}
                    onChange={(e) => setRemoteName(e.target.value)}
                    placeholder="Remote name (e.g., origin)"
                    className="w-full px-3 py-2 bg-ink-900 border border-ink-700 rounded-lg text-mist-100 focus:outline-none focus:border-purple-500"
                  />
                  <input
                    type="text"
                    value={remoteUrl}
                    onChange={(e) => setRemoteUrl(e.target.value)}
                    placeholder="Remote URL (e.g., https://github.com/user/repo.git)"
                    className="w-full px-3 py-2 bg-ink-900 border border-ink-700 rounded-lg text-mist-100 focus:outline-none focus:border-purple-500"
                  />
                  <button
                    onClick={handleAddRemote}
                    className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors"
                  >
                    Add Remote
                  </button>
                </div>
              </div>

              {/* Remote List */}
              <div className="bg-ink-800 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-mist-100 mb-3">Remote Repositories</h3>
                {remotes.length === 0 ? (
                  <div className="text-center py-8 text-mist-400">
                    No remotes configured
                  </div>
                ) : (
                  <div className="space-y-2">
                    {remotes.map((remote) => (
                      <div key={remote.name} className="flex items-center justify-between p-3 bg-ink-900 rounded-lg">
                        <div>
                          <div className="font-semibold text-mist-100 flex items-center gap-2">
                            <span className="text-lg">🌐</span>
                            {remote.name}
                            <span className="text-xs px-2 py-0.5 bg-blue-600/30 text-blue-300 rounded">
                              {remote.type}
                            </span>
                          </div>
                          <div className="text-xs text-mist-400 font-mono mt-1">{remote.url}</div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handlePush(remote.name)}
                            className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded transition-colors"
                          >
                            Push
                          </button>
                          <button
                            onClick={() => handlePull(remote.name)}
                            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
                          >
                            Pull
                          </button>
                          <button
                            onClick={() => handleRemoveRemote(remote.name)}
                            className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-ink-700 p-4 bg-ink-800">
          <div className="flex items-center justify-between text-sm text-mist-400">
            <div>
              Branch: {currentBranch} · {engine.getStats().totalCommits} commits
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-ink-700 hover:bg-ink-600 text-mist-100 rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
