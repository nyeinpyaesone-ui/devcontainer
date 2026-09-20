import type { Config } from "./generator";

export interface Collaborator {
  id: string;
  name: string;
  avatar: string;
  color: string;
  isOnline: boolean;
  lastActive: number;
  currentSection?: string;
}

export interface CollaborationEvent {
  id: string;
  type: "config_change" | "user_join" | "user_leave" | "comment" | "approval";
  userId: string;
  userName: string;
  timestamp: number;
  details: string;
  section?: string;
}

export interface CollaborationSession {
  id: string;
  name: string;
  createdAt: number;
  createdBy: string;
  collaborators: Collaborator[];
  events: CollaborationEvent[];
  config: Config;
  isLocked: boolean;
  lockedBy?: string;
}

export class CollaborationEngine {
  private session: CollaborationSession | null = null;
  private listeners: Set<(session: CollaborationSession) => void> = new Set();
  private simulatedUsers: Collaborator[] = [
    {
      id: "user-1",
      name: "Alice Chen",
      avatar: "👩‍💻",
      color: "#3b82f6",
      isOnline: true,
      lastActive: Date.now(),
      currentSection: "Features",
    },
    {
      id: "user-2",
      name: "Bob Smith",
      avatar: "👨‍💼",
      color: "#10b981",
      isOnline: true,
      lastActive: Date.now(),
      currentSection: "Toolchains",
    },
    {
      id: "user-3",
      name: "Carol Davis",
      avatar: "👩‍🔬",
      color: "#f59e0b",
      isOnline: false,
      lastActive: Date.now() - 300000,
    },
  ];

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem("devcontainer-collaboration");
    if (stored) {
      try {
        this.session = JSON.parse(stored);
      } catch (e) {
        console.error("Failed to load collaboration session:", e);
      }
    }
  }

  private saveToStorage() {
    if (typeof window === "undefined") return;
    if (this.session) {
      localStorage.setItem("devcontainer-collaboration", JSON.stringify(this.session));
    }
  }

  private notifyListeners() {
    if (this.session) {
      this.listeners.forEach((listener) => listener(this.session!));
    }
  }

  subscribe(listener: (session: CollaborationSession) => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  startSession(config: Config, userName: string): CollaborationSession {
    this.session = {
      id: `session-${Date.now()}`,
      name: `${userName}'s Session`,
      createdAt: Date.now(),
      createdBy: userName,
      collaborators: [
        {
          id: "current-user",
          name: userName,
          avatar: "👤",
          color: "#8b5cf6",
          isOnline: true,
          lastActive: Date.now(),
        },
        ...this.simulatedUsers,
      ],
      events: [
        {
          id: `event-${Date.now()}`,
          type: "user_join",
          userId: "current-user",
          userName,
          timestamp: Date.now(),
          details: `${userName} started a collaboration session`,
        },
      ],
      config,
      isLocked: false,
    };

    this.saveToStorage();
    this.notifyListeners();
    return this.session;
  }

  endSession() {
    if (this.session) {
      this.session.events.push({
        id: `event-${Date.now()}`,
        type: "user_leave",
        userId: "current-user",
        userName: this.session.createdBy,
        timestamp: Date.now(),
        details: `${this.session.createdBy} ended the collaboration session`,
      });
      this.session = null;
      if (typeof window !== "undefined") {
        localStorage.removeItem("devcontainer-collaboration");
      }
      this.notifyListeners();
    }
  }

  updateConfig(config: Config, section: string, userName: string) {
    if (!this.session) return;

    this.session.config = config;
    this.session.events.push({
      id: `event-${Date.now()}`,
      type: "config_change",
      userId: "current-user",
      userName,
      timestamp: Date.now(),
      details: `${userName} updated ${section}`,
      section,
    });

    // Keep only last 50 events
    if (this.session.events.length > 50) {
      this.session.events = this.session.events.slice(-50);
    }

    this.saveToStorage();
    this.notifyListeners();
  }

  lockConfig(userName: string) {
    if (!this.session) return;
    this.session.isLocked = true;
    this.session.lockedBy = userName;
    this.session.events.push({
      id: `event-${Date.now()}`,
      type: "approval",
      userId: "current-user",
      userName,
      timestamp: Date.now(),
      details: `${userName} locked the configuration for review`,
    });
    this.saveToStorage();
    this.notifyListeners();
  }

  unlockConfig(userName: string) {
    if (!this.session) return;
    this.session.isLocked = false;
    this.session.lockedBy = undefined;
    this.session.events.push({
      id: `event-${Date.now()}`,
      type: "approval",
      userId: "current-user",
      userName,
      timestamp: Date.now(),
      details: `${userName} unlocked the configuration`,
    });
    this.saveToStorage();
    this.notifyListeners();
  }

  addComment(userName: string, comment: string) {
    if (!this.session) return;
    this.session.events.push({
      id: `event-${Date.now()}`,
      type: "comment",
      userId: "current-user",
      userName,
      timestamp: Date.now(),
      details: comment,
    });
    this.saveToStorage();
    this.notifyListeners();
  }

  getSession(): CollaborationSession | null {
    return this.session;
  }

  getOnlineCollaborators(): Collaborator[] {
    if (!this.session) return [];
    return this.session.collaborators.filter((c) => c.isOnline);
  }

  getRecentEvents(limit: number = 10): CollaborationEvent[] {
    if (!this.session) return [];
    return this.session.events.slice(-limit).reverse();
  }

  // Simulate other users' activity
  simulateActivity() {
    if (!this.session) return;

    const actions = [
      { user: this.simulatedUsers[0], section: "Features", action: "viewing" },
      { user: this.simulatedUsers[1], section: "Toolchains", action: "editing" },
    ];

    const randomAction = actions[Math.floor(Math.random() * actions.length)];
    
    // Update user's current section
    const collaborator = this.session.collaborators.find(
      (c) => c.id === randomAction.user.id
    );
    if (collaborator) {
      collaborator.currentSection = randomAction.section;
      collaborator.lastActive = Date.now();
    }

    this.saveToStorage();
    this.notifyListeners();
  }
}
