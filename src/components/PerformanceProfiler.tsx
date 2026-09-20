import { useEffect, useState } from "react";
import type { Config } from "../lib/generator";
import { profilePerformance, type PerformanceIssue, type PerformanceProfile } from "../lib/performance-profiler";

interface PerformanceProfilerProps {
  config: Config;
  isOpen: boolean;
  onClose: () => void;
}

export function PerformanceProfiler({ config, isOpen, onClose }: PerformanceProfilerProps) {
  const [profile, setProfile] = useState<PerformanceProfile | null>(null);

  useEffect(() => {
    if (isOpen) {
      setProfile(profilePerformance(config));
    }
  }, [config, isOpen]);

  if (!isOpen || !profile) return null;

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "text-red-400 bg-red-500/10 border-red-500/30";
      case "high":
        return "text-orange-400 bg-orange-500/10 border-orange-500/30";
      case "medium":
        return "text-yellow-400 bg-yellow-500/10 border-yellow-500/30";
      case "low":
        return "text-blue-400 bg-blue-500/10 border-blue-500/30";
      default:
        return "text-mist-400 bg-mist-500/10 border-mist-500/30";
    }
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case "A":
        return "text-green-400";
      case "B":
        return "text-blue-400";
      case "C":
        return "text-yellow-400";
      case "D":
        return "text-orange-400";
      case "F":
        return "text-red-400";
      default:
        return "text-mist-400";
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-ink-900 border border-ink-700 rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="border-b border-ink-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-mist-100">Performance Profiler</h2>
              <p className="text-mist-400 text-sm mt-1">
                Detailed analysis of your devcontainer performance
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

          {/* Score and Grade */}
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-4">
              <div className="relative">
                <svg className="w-24 h-24 transform -rotate-90">
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className="text-ink-700"
                  />
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className={getGradeColor(profile.grade).split(" ")[0]}
                    strokeDasharray={`${2 * Math.PI * 40}`}
                    strokeDashoffset={`${2 * Math.PI * 40 * (1 - profile.score / 100)}`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className={`text-3xl font-bold ${getGradeColor(profile.grade)}`}>
                    {profile.score}
                  </span>
                </div>
              </div>
              <div>
                <div className={`text-4xl font-bold ${getGradeColor(profile.grade)}`}>
                  Grade {profile.grade}
                </div>
                <div className="text-mist-400 text-sm">Performance Score</div>
              </div>
            </div>

            {/* Metrics */}
            <div className="flex-1 grid grid-cols-3 gap-4">
              <div className="bg-ink-800 rounded-lg p-4">
                <div className="text-mist-400 text-xs mb-1">Build Time</div>
                <div className="text-2xl font-bold text-mist-100">{profile.buildTime}s</div>
                <div className="text-mist-500 text-xs">Estimated</div>
              </div>
              <div className="bg-ink-800 rounded-lg p-4">
                <div className="text-mist-400 text-xs mb-1">Image Size</div>
                <div className="text-2xl font-bold text-mist-100">{profile.imageSize}MB</div>
                <div className="text-mist-500 text-xs">Estimated</div>
              </div>
              <div className="bg-ink-800 rounded-lg p-4">
                <div className="text-mist-400 text-xs mb-1">Memory Usage</div>
                <div className="text-2xl font-bold text-mist-100">{profile.memoryUsage}MB</div>
                <div className="text-mist-500 text-xs">Estimated</div>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="mt-4 p-4 bg-ink-800 rounded-lg">
            <p className="text-mist-300">{profile.summary}</p>
          </div>
        </div>

        {/* Issues List */}
        <div className="flex-1 overflow-y-auto p-6">
          {profile.issues.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">✅</div>
              <h3 className="text-xl font-bold text-mist-100 mb-2">No Performance Issues</h3>
              <p className="text-mist-400">Your configuration is well optimized!</p>
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-mist-100 mb-4">
                Performance Issues ({profile.issues.length})
              </h3>
              {profile.issues.map((issue, index) => (
                <div
                  key={index}
                  className={`border rounded-lg p-4 ${getSeverityColor(issue.severity)}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold text-mist-100">{issue.title}</span>
                        <span className="text-xs px-2 py-0.5 rounded bg-ink-800 text-mist-400">
                          {issue.category}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded bg-ink-800 text-mist-400">
                          {issue.severity}
                        </span>
                      </div>
                      <p className="text-sm text-mist-300 mb-2">{issue.description}</p>
                      <div className="text-sm text-mist-400 mb-2">
                        <strong>Impact:</strong> {issue.impact}
                      </div>
                      <div className="text-sm text-mist-300 mb-2">
                        <strong>Recommendation:</strong> {issue.recommendation}
                      </div>
                      {issue.estimatedSavings && (
                        <div className="text-sm text-green-400">
                          <strong>Estimated Savings:</strong> {issue.estimatedSavings}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-ink-700 p-4 bg-ink-800">
          <div className="flex items-center justify-between text-sm text-mist-400">
            <div>
              {profile.issues.length} issue{profile.issues.length !== 1 ? "s" : ""} found
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-ember-500 hover:bg-ember-600 text-ink-950 font-semibold rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
