import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ThemePreference } from "@momentum/types";
import { THEME_STORAGE_KEY } from "../lib/theme-storage-key";

interface ThemeState {
  theme: ThemePreference;
  setTheme: (theme: ThemePreference) => void;
}

/**
 * Persisted to localStorage (not Dexie) so the theme is readable
 * synchronously before IndexedDB has a chance to open — see the inline
 * script in app/layout.tsx that prevents a flash of the wrong theme.
 */
export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: "light",
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: THEME_STORAGE_KEY,
    },
  ),
);
