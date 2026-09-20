import { useState } from "react";
import { generateSecurityAudit, type SecurityIssue } from "../lib/security-audit";
import type { Config } from "../lib/generator";

interface SecurityAuditModalProps {
  config: Config;
  onClose: () => void;
}

export default function SecurityAuditModal({ config, onClose }: SecurityAuditModalProps) {
  const [filter, setFilter] = useState<string>("all");
  const audit = generateSecurityAudit(config);

  const filteredIssues =
    filter === "all" ? audit.issues : audit.issues.filter((i) => i.severity === filter);

  const severityColors = {
    critical: "bg-red-500/10 border-red-500/30 text-red-400",
    high: "bg-orange-500/10 border-orange-500/30 text-orange-400",
    medium: "bg-yellow-500/10 border-yellow-500/30 text-yellow-400",
    low: "bg-blue-500/10 border-blue-500/30 text-blue-400",
    info: "bg-gray-500/10 border-gray-500/30 text-gray-400",
  };

  const gradeColors = {
    A: "text-green-400",
    B: "text-blue-400",
    C: "text-yellow-400",
    D: "text-orange-400",
    F: "text-red-400",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-ink-900 border border-ink-700 rounded-lg shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-ink-700">
          <div>
            <h2 className="text-2xl font-bold text-mist-100">Security Audit Report</h2>
            <p className="text-sm text-mist-500 mt-1">
              Comprehensive security analysis of your devcontainer configuration
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
          {/* Score Card */}
          <div className="bg-ink-800 rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-sm text-mist-500 mb-1">Security Score</div>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-mist-100">{audit.score}</span>
                  <span className="text-xl text-mist-500">/100</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-mist-500 mb-1">Grade</div>
                <div className={`text-5xl font-bold ${gradeColors[audit.grade as keyof typeof gradeColors]}`}>
                  {audit.grade}
                </div>
              </div>
            </div>
            <p className="text-sm text-mist-400">{audit.summary}</p>
          </div>

          {/* Issue Summary */}
          <div className="grid grid-cols-5 gap-3 mb-6">
            {(["critical", "high", "medium", "low", "info"] as const).map((severity) => {
              const count = audit.issues.filter((i) => i.severity === severity).length;
              return (
                <button
                  key={severity}
                  onClick={() => setFilter(filter === severity ? "all" : severity)}
                  className={`p-3 rounded-lg border transition-all ${
                    filter === severity
                      ? severityColors[severity]
                      : "bg-ink-800 border-ink-700 text-mist-500 hover:border-ink-600"
                  }`}
                >
                  <div className="text-2xl font-bold">{count}</div>
                  <div className="text-xs uppercase">{severity}</div>
                </button>
              );
            })}
          </div>

          {/* Issues List */}
          <div className="space-y-3">
            {filteredIssues.length === 0 ? (
              <div className="text-center py-12 text-mist-500">
                {filter === "all" ? "No security issues found!" : `No ${filter} severity issues`}
              </div>
            ) : (
              filteredIssues.map((issue, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-lg border ${severityColors[issue.severity]}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold uppercase px-2 py-1 rounded bg-black/20">
                        {issue.severity}
                      </span>
                      <span className="text-xs text-mist-500">{issue.category}</span>
                      {issue.policy && (
                        <span className="text-xs px-2 py-1 rounded bg-black/20">
                          {issue.policy}
                        </span>
                      )}
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{issue.title}</h3>
                  <p className="text-sm mb-3">{issue.description}</p>
                  <div className="text-sm">
                    <span className="font-semibold">Recommendation:</span> {issue.recommendation}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t border-ink-700">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-ink-700 hover:bg-ink-600 text-mist-100 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
