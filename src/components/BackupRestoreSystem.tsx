import { useState, useEffect } from "react";
import type { Config } from "../lib/generator";
import { toast } from "../services/toast";

interface Backup {
  id: string;
  name: string;
  timestamp: number;
  config: Config;
  description?: string;
}

interface BackupRestoreSystemProps {
  currentConfig: Config;
  onRestore: (config: Config) => void;
}

const STORAGE_KEY = "devcontainer-forge-backups";
const MAX_BACKUPS = 10;

export default function BackupRestoreSystem({ currentConfig, onRestore }: BackupRestoreSystemProps) {
  const [backups, setBackups] = useState<Backup[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [backupName, setBackupName] = useState("");
  const [backupDescription, setBackupDescription] = useState("");

  // Load backups from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setBackups(JSON.parse(stored));
      } catch (err) {
        console.error("Failed to load backups:", err);
      }
    }
  }, []);

  // Save backups to localStorage
  const saveBackups = (newBackups: Backup[]) => {
    setBackups(newBackups);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newBackups));
  };

  const handleCreateBackup = () => {
    if (!backupName.trim()) {
      toast("Please enter a backup name");
      return;
    }

    const newBackup: Backup = {
      id: Date.now().toString(),
      name: backupName.trim(),
      timestamp: Date.now(),
      config: JSON.parse(JSON.stringify(currentConfig)), // Deep copy
      description: backupDescription.trim() || undefined,
    };

    const newBackups = [newBackup, ...backups].slice(0, MAX_BACKUPS);
    saveBackups(newBackups);

    setBackupName("");
    setBackupDescription("");
    setShowCreateModal(false);
    toast(`Backup "${newBackup.name}" created successfully`);
  };

  const handleRestoreBackup = (backup: Backup) => {
    if (confirm(`Restore backup "${backup.name}"? This will replace your current configuration.`)) {
      onRestore(JSON.parse(JSON.stringify(backup.config))); // Deep copy
      toast(`Backup "${backup.name}" restored successfully`);
    }
  };

  const handleDeleteBackup = (backupId: string) => {
    const backup = backups.find((b) => b.id === backupId);
    if (backup && confirm(`Delete backup "${backup.name}"?`)) {
      const newBackups = backups.filter((b) => b.id !== backupId);
      saveBackups(newBackups);
      toast(`Backup "${backup.name}" deleted`);
    }
  };

  const handleExportBackup = (backup: Backup) => {
    const content = JSON.stringify(backup.config, null, 2);
    const blob = new Blob([content], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `backup-${backup.name.replace(/[^a-z0-9]/gi, "-")}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast(`Backup "${backup.name}" exported`);
  };

  const handleImportBackup = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const config = JSON.parse(event.target?.result as string) as Config;
          const newBackup: Backup = {
            id: Date.now().toString(),
            name: file.name.replace(".json", ""),
            timestamp: Date.now(),
            config,
          };

          const newBackups = [newBackup, ...backups].slice(0, MAX_BACKUPS);
          saveBackups(newBackups);
          toast(`Backup imported from ${file.name}`);
        } catch (err) {
          toast("Failed to import backup: Invalid JSON file");
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const formatRelativeTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return formatDate(timestamp);
  };

  return (
    <div className="bg-ink-900 border border-ink-700 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-mist-100">Backup & Restore</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={handleImportBackup}
            className="px-3 py-1.5 text-sm bg-ink-800 hover:bg-ink-700 text-mist-300 rounded-lg transition-colors"
          >
            Import
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-3 py-1.5 text-sm bg-ember-500 hover:bg-ember-600 text-ink-950 rounded-lg transition-colors font-medium"
          >
            Create Backup
          </button>
        </div>
      </div>

      {/* Backup List */}
      {backups.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-ink-800 flex items-center justify-center">
            <svg className="w-8 h-8 text-mist-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"
              />
            </svg>
          </div>
          <p className="text-mist-300 mb-2">No backups yet</p>
          <p className="text-sm text-mist-500">Create your first backup to save your current configuration</p>
        </div>
      ) : (
        <div className="space-y-3">
          {backups.map((backup) => (
            <div key={backup.id} className="bg-ink-800 border border-ink-700 rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-medium text-mist-100 truncate">{backup.name}</h4>
                    <span className="text-xs text-mist-500">{formatRelativeTime(backup.timestamp)}</span>
                  </div>
                  {backup.description && (
                    <p className="text-xs text-mist-500 mb-2">{backup.description}</p>
                  )}
                  <div className="flex items-center gap-4 text-xs text-mist-600">
                    <span>{backup.config.owner}/{backup.config.repo}</span>
                    <span>{backup.config.features.filter((f) => f.on).length} features</span>
                    <span>{backup.config.langs.filter((l) => l.on).length} toolchains</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => handleRestoreBackup(backup)}
                    className="px-3 py-1.5 text-xs bg-lagoon-500/20 hover:bg-lagoon-500/30 text-lagoon-400 rounded transition-colors"
                  >
                    Restore
                  </button>
                  <button
                    onClick={() => handleExportBackup(backup)}
                    className="px-3 py-1.5 text-xs bg-ink-700 hover:bg-ink-600 text-mist-300 rounded transition-colors"
                  >
                    Export
                  </button>
                  <button
                    onClick={() => handleDeleteBackup(backup.id)}
                    className="px-3 py-1.5 text-xs bg-coral-500/20 hover:bg-coral-500/30 text-coral-400 rounded transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Backup Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-ink-900 border border-ink-700 rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-mist-100 mb-4">Create Backup</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-mist-300 mb-2">
                  Backup Name <span className="text-coral-400">*</span>
                </label>
                <input
                  type="text"
                  value={backupName}
                  onChange={(e) => setBackupName(e.target.value)}
                  placeholder="e.g., Production Setup v2"
                  className="w-full px-3 py-2 bg-ink-800 border border-ink-700 rounded-lg text-mist-100 placeholder:text-mist-600 focus:outline-none focus:border-ember-500"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-mist-300 mb-2">
                  Description <span className="text-mist-600">(optional)</span>
                </label>
                <textarea
                  value={backupDescription}
                  onChange={(e) => setBackupDescription(e.target.value)}
                  placeholder="Add a description for this backup..."
                  rows={3}
                  className="w-full px-3 py-2 bg-ink-800 border border-ink-700 rounded-lg text-mist-100 placeholder:text-mist-600 focus:outline-none focus:border-ember-500 resize-none"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setBackupName("");
                  setBackupDescription("");
                }}
                className="px-4 py-2 text-sm bg-ink-800 hover:bg-ink-700 text-mist-300 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateBackup}
                className="px-4 py-2 text-sm bg-ember-500 hover:bg-ember-600 text-ink-950 rounded-lg transition-colors font-medium"
              >
                Create Backup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Info */}
      <div className="mt-4 pt-4 border-t border-ink-700">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-skyx-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div className="text-xs text-mist-500">
            <p className="mb-1">
              <strong className="text-mist-300">Backup Storage:</strong> Backups are stored in your browser's
              localStorage. Maximum {MAX_BACKUPS} backups allowed.
            </p>
            <p>
              <strong className="text-mist-300">Tip:</strong> Export important backups to JSON files for
              long-term storage or sharing with team members.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
