import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ActiveSessionState {
  activeSessionId: string | null;
  setActiveSessionId: (id: string | null) => void;
}

/**
 * Persisted so any screen can synchronously know "is there a session to
 * resume" before Dexie has a chance to resolve. Dexie (via
 * SessionsRepository) stays the source of truth for the full record; this
 * store only mirrors the id, the same pattern used by the theme store.
 */
export const useActiveSessionStore = create<ActiveSessionState>()(
  persist(
    (set) => ({
      activeSessionId: null,
      setActiveSessionId: (activeSessionId) => set({ activeSessionId }),
    }),
    { name: "momentum-active-session" },
  ),
);
