import { useState, useMemo } from "react";
import type { Config } from "../lib/generator";
import { AIAssistant, type AIInsight, type PatternMatch } from "../lib/ai-assistant";

interface AnalyticsData {
  featureUsage: { name: string; count: number }[];
  toolchainUsage: { name: string; count: number }[];
  policyCompliance: { name: string; enabled: boolean }[];
  portDistribution: { port: string; service: string }[];
  complexityScore: number;
  recommendations: string[];
}

interface AIAssistantPanelProps {
  config: Config;
  analytics?: AnalyticsData;
  isOpen: boolean;
  onClose: () => void;
}

export default function AIAssistantPanel({ config, analytics, isOpen, onClose }: AIAssistantPanelProps) {
  const [activeTab, setActiveTab] = useState<"insights" | "patterns" | "suggestions">("insights");
  const [nlInput, setNlInput] = useState("");

  const assistant = useMemo(() => new AIAssistant(config), [config]);
  const insights = useMemo(() => assistant.generateInsights(), [assistant]);
  const patterns = useMemo(() => assistant.detectPatterns(), [assistant]);
  const suggestions = useMemo(() => {
    const baseSuggestions = assistant.getSmartSuggestions();
    // Enhance suggestions with analytics data
    if (analytics) {
      if (analytics.complexityScore > 70) {
        baseSuggestions.push("Consider simplifying your configuration - complexity score is high");
      }
      if (analytics.policyCompliance.filter(p => p.enabled).length < 3) {
        baseSuggestions.push("Enable more security policies for better compliance");
      }
      if (analytics.recommendations.length > 0) {
        baseSuggestions.push(...analytics.recommendations);
      }
    }
    return baseSuggestions;
  }, [assistant, analytics]);

  const handleApplySuggestion = (insight: AIInsight) => {
    // In a real implementation, this would apply the suggestion to the config
    console.log("Applying suggestion:", insight.title);
  };

  const handleNaturalLanguage = () => {
    if (!nlInput.trim()) return;
    const updates = assistant.parseNaturalLanguage(nlInput);
    console.log("NL parsing result:", updates);
    setNlInput("");
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-500/10 text-red-400 border-red-500/30";
      case "medium":
        return "bg-yellow-500/10 text-yellow-400 border-yellow-500/30";
      case "low":
        return "bg-blue-500/10 text-blue-400 border-blue-500/30";
      default:
        return "bg-gray-500/10 text-gray-400 border-gray-500/30";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "suggestion":
        return "💡";
      case "warning":
        return "⚠️";
      case "optimization":
        return "⚡";
      case "pattern":
        return "🎯";
      default:
        return "ℹ️";
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-ink-900 border border-ink-700 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-ink-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <span className="text-2xl">🤖</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-mist-100">AI Configuration Assistant</h2>
              <p className="text-sm text-mist-500">Intelligent insights and suggestions</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-mist-500 hover:text-mist-100 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Natural Language Input */}
        <div className="p-6 border-b border-ink-700 bg-ink-800/50">
          <label className="block text-sm font-medium text-mist-300 mb-2">
            Describe your project in natural language
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={nlInput}
              onChange={(e) => setNlInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleNaturalLanguage()}
              placeholder="e.g., 'I'm building a Node.js web app with PostgreSQL and Docker'"
              className="flex-1 px-4 py-2 bg-ink-900 border border-ink-700 rounded-lg text-mist-100 placeholder:text-mist-600 focus:outline-none focus:border-purple-500"
            />
            <button
              onClick={handleNaturalLanguage}
              className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all"
            >
              Apply
            </button>
          </div>
          <p className="text-xs text-mist-600 mt-2">
            Try: "secure python data science setup" or "rust backend with docker"
          </p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-ink-700">
          <button
            onClick={() => setActiveTab("insights")}
            className={`flex-1 px-6 py-3 font-medium transition-colors ${
              activeTab === "insights"
                ? "text-purple-400 border-b-2 border-purple-400"
                : "text-mist-500 hover:text-mist-300"
            }`}
          >
            Insights ({insights.length})
          </button>
          <button
            onClick={() => setActiveTab("patterns")}
            className={`flex-1 px-6 py-3 font-medium transition-colors ${
              activeTab === "patterns"
                ? "text-purple-400 border-b-2 border-purple-400"
                : "text-mist-500 hover:text-mist-300"
            }`}
          >
            Patterns ({patterns.length})
          </button>
          <button
            onClick={() => setActiveTab("suggestions")}
            className={`flex-1 px-6 py-3 font-medium transition-colors ${
              activeTab === "suggestions"
                ? "text-purple-400 border-b-2 border-purple-400"
                : "text-mist-500 hover:text-mist-300"
            }`}
          >
            Suggestions ({suggestions.length})
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === "insights" && (
            <div className="space-y-4">
              {insights.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">✨</div>
                  <p className="text-mist-300">No insights yet</p>
                  <p className="text-sm text-mist-500 mt-2">
                    Configure more options to receive AI insights
                  </p>
                </div>
              ) : (
                insights.map((insight, idx) => (
                  <div
                    key={idx}
                    className={`border rounded-lg p-4 ${getPriorityColor(insight.priority)}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="text-2xl">{getTypeIcon(insight.type)}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-mist-100">{insight.title}</h3>
                          <span className="text-xs px-2 py-0.5 rounded bg-ink-800 text-mist-400">
                            {insight.confidence}% confident
                          </span>
                        </div>
                        <p className="text-sm text-mist-300 mb-3">{insight.description}</p>
                        {insight.action && (
                          <button
                            onClick={() => handleApplySuggestion(insight)}
                            className="text-sm px-3 py-1 bg-ink-800 hover:bg-ink-700 text-mist-100 rounded transition-colors"
                          >
                            Apply Suggestion
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === "patterns" && (
            <div className="space-y-4">
              {patterns.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🔍</div>
                  <p className="text-mist-300">No patterns detected</p>
                  <p className="text-sm text-mist-500 mt-2">
                    Enable more features to match configuration patterns
                  </p>
                </div>
              ) : (
                patterns.map((pattern, idx) => (
                  <div key={idx} className="border border-ink-700 rounded-lg p-4 bg-ink-800/50">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-mist-100">{pattern.name}</h3>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-ink-900 rounded-full h-2 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                            style={{ width: `${pattern.matchScore}%` }}
                          />
                        </div>
                        <span className="text-sm font-mono text-mist-400">
                          {pattern.matchScore}%
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-mist-400 mb-3">{pattern.description}</p>
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-mist-500 uppercase">Recommendations:</p>
                      {pattern.recommendations.map((rec, recIdx) => (
                        <div key={recIdx} className="flex items-start gap-2 text-sm text-mist-300">
                          <span className="text-purple-400">•</span>
                          <span>{rec}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === "suggestions" && (
            <div className="space-y-3">
              {suggestions.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">💡</div>
                  <p className="text-mist-300">No suggestions available</p>
                  <p className="text-sm text-mist-500 mt-2">
                    Your configuration looks good!
                  </p>
                </div>
              ) : (
                suggestions.map((suggestion, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 p-4 border border-ink-700 rounded-lg bg-ink-800/50"
                  >
                    <div className="text-2xl">💡</div>
                    <p className="flex-1 text-sm text-mist-300">{suggestion}</p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-ink-700 bg-ink-800/50">
          <div className="flex items-center justify-between text-xs text-mist-500">
            <span>AI Assistant v1.0 • Pattern Recognition Engine</span>
            <span>{insights.length + patterns.length + suggestions.length} total recommendations</span>
          </div>
        </div>
      </div>
    </div>
  );
}
