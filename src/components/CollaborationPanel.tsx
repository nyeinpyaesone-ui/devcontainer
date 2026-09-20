import { useState, useEffect } from "react";
import { CollaborationEngine, type CollaborationSession, type Collaborator } from "../lib/collaboration-engine";
import type { Config } from "../lib/generator";

interface CollaborationPanelProps {
  config: Config;
  onConfigChange: (config: Config) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function CollaborationPanel({ config, onConfigChange, isOpen, onClose }: CollaborationPanelProps) {
  const [engine] = useState(() => new CollaborationEngine());
  const [session, setSession] = useState<CollaborationSession | null>(null);
  const [userName, setUserName] = useState("You");
  const [comment, setComment] = useState("");
  const [activeTab, setActiveTab] = useState<"activity" | "users" | "comments">("activity");

  useEffect(() => {
    if (isOpen) {
      const initialSession = engine.getSession();
      setSession(initialSession);

      const unsubscribe = engine.subscribe((updatedSession) => {
        setSession(updatedSession);
      });

      // Simulate activity every 5 seconds
      const interval = setInterval(() => {
        engine.simulateActivity();
      }, 5000);

      return () => {
        unsubscribe();
        clearInterval(interval);
      };
    }
  }, [isOpen, engine]);

  const handleStartSession = () => {
    engine.startSession(config, userName);
  };

  const handleEndSession = () => {
    engine.endSession();
  };

  const handleLock = () => {
    engine.lockConfig(userName);
  };

  const handleUnlock = () => {
    engine.unlockConfig(userName);
  };

  const handleAddComment = () => {
    if (comment.trim()) {
      engine.addComment(userName, comment);
      setComment("");
    }
  };

  const formatTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (seconds < 60) return "just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case "config_change":
        return "✏️";
      case "user_join":
        return "👋";
      case "user_leave":
        return "🚪";
      case "comment":
        return "💬";
      case "approval":
        return "🔒";
      default:
        return "📝";
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-ink-900 border border-ink-700 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="border-b border-ink-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-mist-100 flex items-center gap-2">
                👥 Real-time Collaboration
              </h2>
              <p className="text-mist-400 text-sm mt-1">
                Work together on devcontainer configurations
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

          {/* Session Controls */}
          {!session ? (
            <div className="bg-ink-800 rounded-lg p-4">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-mist-300 mb-2">
                    Your Name
                  </label>
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="w-full px-3 py-2 bg-ink-900 border border-ink-700 rounded-lg text-mist-100 focus:outline-none focus:border-purple-500"
                    placeholder="Enter your name"
                  />
                </div>
                <button
                  onClick={handleStartSession}
                  className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors"
                >
                  Start Session
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-ink-800 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-mist-400">Session: {session.name}</div>
                  <div className="text-xs text-mist-500 mt-1">
                    Started {formatTime(session.createdAt)} by {session.createdBy}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {session.isLocked ? (
                    <button
                      onClick={handleUnlock}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors"
                    >
                      🔓 Unlock
                    </button>
                  ) : (
                    <button
                      onClick={handleLock}
                      className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg transition-colors"
                    >
                      🔒 Lock for Review
                    </button>
                  )}
                  <button
                    onClick={handleEndSession}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors"
                  >
                    End Session
                  </button>
                </div>
              </div>

              {/* Online Users */}
              <div className="mt-4 flex items-center gap-2">
                <span className="text-sm text-mist-400">Online:</span>
                {engine.getOnlineCollaborators().map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center gap-1 px-2 py-1 bg-ink-900 rounded-lg"
                    title={`${user.name} - ${user.currentSection || "Viewing"}`}
                  >
                    <span className="text-lg">{user.avatar}</span>
                    <span className="text-sm text-mist-300">{user.name}</span>
                    <div
                      className="w-2 h-2 rounded-full bg-green-500"
                      style={{ backgroundColor: user.color }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Tabs */}
        {session && (
          <div className="border-b border-ink-700">
            <div className="flex">
              <button
                onClick={() => setActiveTab("activity")}
                className={`px-6 py-3 font-medium transition-colors ${
                  activeTab === "activity"
                    ? "text-purple-400 border-b-2 border-purple-400"
                    : "text-mist-500 hover:text-mist-300"
                }`}
              >
                Activity Feed
              </button>
              <button
                onClick={() => setActiveTab("users")}
                className={`px-6 py-3 font-medium transition-colors ${
                  activeTab === "users"
                    ? "text-purple-400 border-b-2 border-purple-400"
                    : "text-mist-500 hover:text-mist-300"
                }`}
              >
                Users
              </button>
              <button
                onClick={() => setActiveTab("comments")}
                className={`px-6 py-3 font-medium transition-colors ${
                  activeTab === "comments"
                    ? "text-purple-400 border-b-2 border-purple-400"
                    : "text-mist-500 hover:text-mist-300"
                }`}
              >
                Comments
              </button>
            </div>
          </div>
        )}

        {/* Content */}
        {session && (
          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === "activity" && (
              <div className="space-y-3">
                {engine.getRecentEvents(20).map((event) => (
                  <div key={event.id} className="bg-ink-800 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{getEventIcon(event.type)}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-mist-100">{event.userName}</span>
                          <span className="text-xs text-mist-500">{formatTime(event.timestamp)}</span>
                        </div>
                        <p className="text-sm text-mist-300">{event.details}</p>
                        {event.section && (
                          <span className="inline-block mt-2 px-2 py-1 bg-ink-900 rounded text-xs text-mist-400">
                            {event.section}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "users" && (
              <div className="space-y-3">
                {session.collaborators.map((user) => (
                  <div key={user.id} className="bg-ink-800 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{user.avatar}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-mist-100">{user.name}</span>
                          {user.isOnline ? (
                            <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded">
                              Online
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 bg-ink-700 text-mist-500 text-xs rounded">
                              Offline
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-mist-400 mt-1">
                          {user.isOnline ? (
                            <>
                              Currently {user.currentSection ? `viewing ${user.currentSection}` : "active"}
                            </>
                          ) : (
                            <>Last active {formatTime(user.lastActive)}</>
                          )}
                        </div>
                      </div>
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: user.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "comments" && (
              <div className="space-y-4">
                <div className="bg-ink-800 rounded-lg p-4">
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Add a comment..."
                    className="w-full px-3 py-2 bg-ink-900 border border-ink-700 rounded-lg text-mist-100 focus:outline-none focus:border-purple-500 resize-none"
                    rows={3}
                  />
                  <button
                    onClick={handleAddComment}
                    disabled={!comment.trim()}
                    className="mt-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-ink-700 disabled:text-mist-600 text-white font-semibold rounded-lg transition-colors"
                  >
                    Post Comment
                  </button>
                </div>

                <div className="space-y-3">
                  {session.events
                    .filter((e) => e.type === "comment")
                    .reverse()
                    .map((event) => (
                      <div key={event.id} className="bg-ink-800 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <span className="text-2xl">💬</span>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-mist-100">{event.userName}</span>
                              <span className="text-xs text-mist-500">{formatTime(event.timestamp)}</span>
                            </div>
                            <p className="text-sm text-mist-300">{event.details}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        {session && (
          <div className="border-t border-ink-700 p-4 bg-ink-800">
            <div className="flex items-center justify-between text-sm text-mist-400">
              <div>
                {session.collaborators.filter((c) => c.isOnline).length} online •{" "}
                {session.events.length} events
              </div>
              {session.isLocked && (
                <div className="text-orange-400">
                  🔒 Locked by {session.lockedBy}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
