import { z } from "zod";
import { THEME_PREFERENCES } from "./theme";

/**
 * Singleton row: Dexie is keyed on `id`, and the app only ever reads/writes
 * the row whose id equals SETTINGS_SINGLETON_ID.
 */
export const SETTINGS_SINGLETON_ID = "app";

export const SettingsSchema = z.object({
  id: z.literal(SETTINGS_SINGLETON_ID),
  theme: z.enum(THEME_PREFERENCES),
  createdAt: z.number(),
  updatedAt: z.number(),
});

export type SettingsRecord = z.infer<typeof SettingsSchema>;
