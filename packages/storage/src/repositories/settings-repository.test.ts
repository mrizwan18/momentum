import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createMomentumDatabase, type MomentumDatabase } from "../db";
import { createSettingsRepository } from "./settings-repository";

describe("settings repository", () => {
  let db: MomentumDatabase;

  beforeEach(() => {
    db = createMomentumDatabase(`test-settings-${Math.random()}`);
  });

  afterEach(async () => {
    await db.delete();
  });

  it("returns undefined before any settings have been saved", async () => {
    const repo = createSettingsRepository(db);
    await expect(repo.get()).resolves.toBeUndefined();
  });

  it("creates the singleton row on first write", async () => {
    const repo = createSettingsRepository(db);
    const record = await repo.setTheme("dark");

    expect(record.id).toBe("app");
    expect(record.theme).toBe("dark");
    expect(record.createdAt).toBe(record.updatedAt);
  });

  it("updates the existing row instead of creating a new one", async () => {
    const repo = createSettingsRepository(db);
    const first = await repo.setTheme("dark");
    const second = await repo.setTheme("light");

    expect(second.theme).toBe("light");
    expect(second.createdAt).toBe(first.createdAt);
    expect(await db.settings.count()).toBe(1);
  });
});
