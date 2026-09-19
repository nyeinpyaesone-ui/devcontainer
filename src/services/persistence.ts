// ────────────────────────────────────────────────────────────────────────────
// services/persistence — a tiny typed localStorage store with a migration
// hook, so saved state from older schema versions always merges safely
// ────────────────────────────────────────────────────────────────────────────

export interface Store<T> {
  load(): { value: T; restored: boolean };
  save(value: T): void;
  clear(): void;
}

export function defineStore<T>(
  key: string,
  defaults: T,
  migrate: (raw: unknown, defaults: T) => T
): Store<T> {
  return {
    load() {
      try {
        const raw = localStorage.getItem(key);
        if (!raw) return { value: defaults, restored: false };
        const parsed: unknown = JSON.parse(raw);
        if (!parsed || typeof parsed !== "object") return { value: defaults, restored: false };
        return { value: migrate(parsed, defaults), restored: true };
      } catch {
        return { value: defaults, restored: false };
      }
    },
    save(value) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch {
        /* storage full or unavailable — the app keeps working in-memory */
      }
    },
    clear() {
      try {
        localStorage.removeItem(key);
      } catch {
        /* ignore */
      }
    },
  };
}
