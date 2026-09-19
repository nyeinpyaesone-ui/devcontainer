// ────────────────────────────────────────────────────────────────────────────
// services/hotkeys — declarative global shortcuts.
// Combo syntax: "mod+k", "mod+shift+l", "escape" — "mod" matches ⌘ or ctrl.
// Bare (modifier-less) keys never fire while typing in a field.
// ────────────────────────────────────────────────────────────────────────────
import { useEffect, useRef } from "react";

export type HotkeyMap = Record<string, (e: KeyboardEvent) => void>;

export function useHotkeys(map: HotkeyMap, enabled = true) {
  const ref = useRef(map);
  ref.current = map;

  useEffect(() => {
    if (!enabled) return;
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const typing =
        !!target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName);
      for (const [combo, fn] of Object.entries(ref.current)) {
        const parts = combo.toLowerCase().split("+");
        const key = parts[parts.length - 1];
        const needsMod = parts.includes("mod");
        const needsShift = parts.includes("shift");
        const mod = e.metaKey || e.ctrlKey;
        if (mod !== needsMod) continue;
        if (needsShift !== e.shiftKey) continue;
        if (e.key.toLowerCase() !== key) continue;
        if (typing && !needsMod) continue;
        e.preventDefault();
        fn(e);
        return;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [enabled]);
}
