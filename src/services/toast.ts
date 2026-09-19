// ────────────────────────────────────────────────────────────────────────────
// services/toast — an app-wide notification channel. Any module can call
// toast("…") directly; any component can subscribe via useToasts().
// ────────────────────────────────────────────────────────────────────────────
import { useEffect, useState } from "react";

export interface ToastMsg {
  id: number;
  msg: string;
}

type Listener = (toasts: ToastMsg[]) => void;

let seq = 0;
let current: ToastMsg[] = [];
const listeners = new Set<Listener>();

function emit() {
  const snap = [...current];
  for (const l of listeners) l(snap);
}

/** push a toast from anywhere in the app */
export function toast(msg: string, ttlMs = 2800) {
  const id = ++seq;
  current = [...current.slice(-2), { id, msg }];
  emit();
  window.setTimeout(() => {
    current = current.filter((t) => t.id !== id);
    emit();
  }, ttlMs);
}

/** subscribe to the toast stream */
export function useToasts(): ToastMsg[] {
  const [list, setList] = useState<ToastMsg[]>(current);
  useEffect(() => {
    const l: Listener = (t) => setList(t);
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  }, []);
  return list;
}
