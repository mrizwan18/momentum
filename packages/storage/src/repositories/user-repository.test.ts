import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createMomentumDatabase, type MomentumDatabase } from "../db";
import { createUserRepository } from "./user-repository";

describe("user repository", () => {
  let db: MomentumDatabase;

  beforeEach(() => {
    db = createMomentumDatabase(`test-user-${Math.random()}`);
  });

  afterEach(async () => {
    await db.delete();
  });

  it("returns undefined before any user record exists", async () => {
    const repo = createUserRepository(db);
    await expect(repo.get()).resolves.toBeUndefined();
  });

  it("creates the singleton row on first write", async () => {
    const repo = createUserRepository(db);
    const user = await repo.setDisplayName("Rizwan");
    expect(user.id).toBe("local");
    expect(user.displayName).toBe("Rizwan");
  });

  it("updates the existing row instead of creating a new one", async () => {
    const repo = createUserRepository(db);
    await repo.setDisplayName("Rizwan");
    await repo.setActiveSkill("skill-1");

    const user = await repo.get();
    expect(user?.displayName).toBe("Rizwan");
    expect(user?.activeSkillId).toBe("skill-1");
    expect(await db.users.count()).toBe(1);
  });

  it("stores age from onboarding without disturbing other fields", async () => {
    const repo = createUserRepository(db);
    await repo.setDisplayName("Rizwan");
    const user = await repo.setAge(24);

    expect(user.age).toBe(24);
    expect(user.displayName).toBe("Rizwan");
    expect(await db.users.count()).toBe(1);
  });
});
