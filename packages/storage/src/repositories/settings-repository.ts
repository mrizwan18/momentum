import {
  SETTINGS_SINGLETON_ID,
  type SettingsRecord,
  type ThemePreference,
} from "@momentum/types";
import type { MomentumDatabase } from "../db";

export interface SettingsRepository {
  get(): Promise<SettingsRecord | undefined>;
  setTheme(theme: ThemePreference): Promise<SettingsRecord>;
}

export function createSettingsRepository(
  db: MomentumDatabase,
): SettingsRepository {
  return {
    async get() {
      return db.settings.get(SETTINGS_SINGLETON_ID);
    },

    async setTheme(theme) {
      return db.transaction("rw", db.settings, async () => {
        const now = Date.now();
        const existing = await db.settings.get(SETTINGS_SINGLETON_ID);
        const record: SettingsRecord = existing
          ? { ...existing, theme, updatedAt: now }
          : {
              id: SETTINGS_SINGLETON_ID,
              theme,
              createdAt: now,
              updatedAt: now,
            };

        await db.settings.put(record);
        return record;
      });
    },
  };
}
