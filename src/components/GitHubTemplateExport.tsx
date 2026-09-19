import { useState } from "react";
import { generateGitHubTemplate } from "../lib/github-template";
import type { Config } from "../lib/generator";
import { downloadFile } from "../services/downloads";

interface GitHubTemplateExportProps {
  config: Config;
  onClose: () => void;
}

export default function GitHubTemplateExport({ config, onClose }: GitHubTemplateExportProps) {
  const [exporting, setExporting] = useState(false);
  const files = generateGitHubTemplate(config);

  const handleExportAll = async () => {
    setExporting(true);
    try {
      // Download each file with a small delay
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        downloadFile(file.path, file.content);
        if (i < files.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 300));
        }
      }
    } finally {
      setExporting(false);
    }
  };

  const handleExportFile = (path: string, content: string) => {
    downloadFile(path, content);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-ink-900 border border-ink-700 rounded-lg shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-ink-700">
          <div>
            <h2 className="text-2xl font-bold text-mist-100">Export GitHub Template</h2>
            <p className="text-sm text-mist-500 mt-1">
              Download {files.length} files to create a complete repository template
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-mist-500 hover:text-mist-100 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="mb-6 p-4 bg-ink-800 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-mist-500">Total Files</div>
              <div className="text-2xl font-bold text-mist-100">{files.length}</div>
            </div>
            <div className="text-xs text-mist-400">
              All files will be downloaded to your default download location
            </div>
          </div>

          <div className="space-y-2">
            {files.map((file) => (
              <div
                key={file.path}
                className="flex items-center justify-between p-3 bg-ink-800 rounded-lg hover:bg-ink-700 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-mono text-mist-100 truncate">{file.path}</div>
                  <div className="text-xs text-mist-500 mt-1">{file.description}</div>
                </div>
                <button
                  onClick={() => handleExportFile(file.path, file.content)}
                  className="ml-4 px-3 py-1.5 bg-ink-700 hover:bg-ink-600 text-mist-100 rounded text-xs transition-colors"
                >
                  Download
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t border-ink-700">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-ink-700 hover:bg-ink-600 text-mist-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleExportAll}
            disabled={exporting}
            className="px-6 py-2 bg-ember-500 hover:bg-ember-600 text-ink-950 rounded-lg transition-colors font-semibold disabled:opacity-50"
          >
            {exporting ? "Exporting..." : `Export All ${files.length} Files`}
          </button>
        </div>
      </div>
    </div>
  );
}
