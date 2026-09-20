import { useState, useEffect } from "react";
import { ComplianceEngine, type ComplianceReport, type ComplianceFramework } from "../lib/compliance-engine";
import type { Config } from "../lib/generator";

interface CompliancePanelProps {
  config: Config;
  isOpen: boolean;
  onClose: () => void;
}

export function CompliancePanel({ config, isOpen, onClose }: CompliancePanelProps) {
  const [engine] = useState(() => new ComplianceEngine());
  const [selectedFramework, setSelectedFramework] = useState<string>("soc2");
  const [currentReport, setCurrentReport] = useState<ComplianceReport | null>(null);
  const [allReports, setAllReports] = useState<ComplianceReport[]>([]);
  const [frameworks, setFrameworks] = useState<ComplianceFramework[]>([]);

  useEffect(() => {
    if (isOpen) {
      setFrameworks(engine.getFrameworks());
      setAllReports(engine.getAllReports());
      
      // Load latest report for selected framework
      const latest = engine.getLatestReport(selectedFramework);
      if (latest) {
        setCurrentReport(latest);
      }

      const unsubscribe = engine.subscribe(() => {
        setAllReports(engine.getAllReports());
        const latest = engine.getLatestReport(selectedFramework);
        if (latest) {
          setCurrentReport(latest);
        }
      });

      return () => {
        unsubscribe();
      };
    }
  }, [isOpen, engine, selectedFramework]);

  const handleGenerateReport = () => {
    const report = engine.generateReport(config, selectedFramework);
    setCurrentReport(report);
  };

  const handleExportReport = () => {
    if (!currentReport) return;
    const data = engine.exportReport(currentReport);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `compliance-${currentReport.framework.id}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClearReports = () => {
    if (window.confirm("Clear all compliance reports? This cannot be undone.")) {
      engine.clearReports();
      setCurrentReport(null);
      setAllReports([]);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "compliant":
        return "text-green-400 bg-green-500/10 border-green-500/30";
      case "partial":
        return "text-yellow-400 bg-yellow-500/10 border-yellow-500/30";
      case "non-compliant":
        return "text-red-400 bg-red-500/10 border-red-500/30";
      default:
        return "text-gray-400 bg-gray-500/10 border-gray-500/30";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "compliant":
        return "✓";
      case "partial":
        return "⚠";
      case "non-compliant":
        return "✗";
      default:
        return "?";
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
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
                📋 Compliance & Audit System
              </h2>
              <p className="text-mist-400 text-sm mt-1">
                Track compliance with industry standards and regulations
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

          {/* Framework Selector */}
          <div className="bg-ink-800 rounded-lg p-4">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-mist-300 mb-2">
                  Select Compliance Framework
                </label>
                <select
                  value={selectedFramework}
                  onChange={(e) => setSelectedFramework(e.target.value)}
                  className="w-full px-3 py-2 bg-ink-900 border border-ink-700 rounded-lg text-mist-100 focus:outline-none focus:border-purple-500"
                >
                  {frameworks.map((fw) => (
                    <option key={fw.id} value={fw.id}>
                      {fw.icon} {fw.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleGenerateReport}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors"
                >
                  Generate Report
                </button>
                {currentReport && (
                  <button
                    onClick={handleExportReport}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
                  >
                    Export
                  </button>
                )}
                <button
                  onClick={handleClearReports}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors"
                >
                  Clear All
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {currentReport ? (
            <div className="space-y-6">
              {/* Overall Status */}
              <div className={`border-2 rounded-lg p-6 ${getStatusColor(currentReport.overallStatus)}`}>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold mb-2">
                      {currentReport.framework.icon} {currentReport.framework.name}
                    </h3>
                    <p className="text-sm opacity-80">{currentReport.framework.description}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-4xl font-bold">{currentReport.overallScore}%</div>
                    <div className="text-sm uppercase font-semibold mt-1">
                      {currentReport.overallStatus}
                    </div>
                  </div>
                </div>
                <div className="text-sm opacity-80">
                  Generated: {formatDate(currentReport.generatedAt)}
                </div>
                <div className="text-sm mt-2 font-semibold">{currentReport.summary}</div>
              </div>

              {/* Requirements Checklist */}
              <div className="bg-ink-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-mist-100 mb-4">
                  Requirements Checklist
                </h3>
                <div className="space-y-3">
                  {currentReport.checks.map((check, idx) => (
                    <div
                      key={idx}
                      className={`border rounded-lg p-4 ${getStatusColor(check.result.status)}`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{getStatusIcon(check.result.status)}</span>
                          <div>
                            <div className="font-semibold text-mist-100">
                              {check.requirement.id}: {check.requirement.name}
                            </div>
                            <div className="text-xs text-mist-400 mt-1">
                              Category: {check.requirement.category}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold">{check.result.score}%</div>
                          <div className="text-xs uppercase font-semibold">
                            {check.result.status}
                          </div>
                        </div>
                      </div>
                      <div className="text-sm text-mist-300 mt-2">
                        {check.requirement.description}
                      </div>
                      <div className="text-sm mt-2 font-semibold">
                        Evidence: {check.result.evidence}
                      </div>
                      {check.result.remediation && (
                        <div className="text-sm mt-2 text-yellow-400">
                          Remediation: {check.result.remediation}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-mist-400">
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-xl font-semibold mb-2">No Report Generated</h3>
              <p className="text-sm">
                Select a compliance framework and click "Generate Report" to begin
              </p>
            </div>
          )}

          {/* Report History */}
          {allReports.length > 0 && (
            <div className="bg-ink-800 rounded-lg p-6 mt-6">
              <h3 className="text-lg font-semibold text-mist-100 mb-4">
                Report History ({allReports.length})
              </h3>
              <div className="space-y-2">
                {allReports.slice(0, 10).map((report, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 bg-ink-900 rounded-lg hover:bg-ink-700 transition-colors cursor-pointer"
                    onClick={() => setCurrentReport(report)}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{report.framework.icon}</span>
                      <div>
                        <div className="font-semibold text-mist-100">
                          {report.framework.name}
                        </div>
                        <div className="text-xs text-mist-400">
                          {formatDate(report.generatedAt)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className={`px-3 py-1 rounded ${getStatusColor(report.overallStatus)}`}>
                        {report.overallScore}%
                      </div>
                      <div className={`text-sm font-semibold ${getStatusColor(report.overallStatus).split(' ')[0]}`}>
                        {report.overallStatus}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-ink-700 p-4 bg-ink-800">
          <div className="flex items-center justify-between text-sm text-mist-400">
            <div>
              {allReports.length} reports generated
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
