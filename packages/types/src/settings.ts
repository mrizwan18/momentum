import type { ThemePreference } from "./theme";

/**
 * Singleton row: Dexie is keyed on `id`, and the app only ever reads/writes
 * the row whose id equals SETTINGS_SINGLETON_ID.
 */
export const SETTINGS_SINGLETON_ID = "app";

export interface SettingsRecord {
  id: typeof SETTINGS_SINGLETON_ID;
  theme: ThemePreference;
  createdAt: number;
  updatedAt: number;
}
