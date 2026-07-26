import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createMomentumDatabase, type MomentumDatabase } from "../db";
import { createCoachMessageRepository } from "./coach-message-repository";

describe("coach message repository", () => {
  let db: MomentumDatabase;

  beforeEach(() => {
    db = createMomentumDatabase(`test-coach-message-${Math.random()}`);
  });

  afterEach(async () => {
    await db.delete();
  });

  it("appends a user message with no provider", async () => {
    const repo = createCoachMessageRepository(db);
    const record = await repo.append({
      role: "user",
      message: "How do I improve my breath control?",
    });
    expect(record.role).toBe("user");
    expect(record.provider).toBeNull();
  });

  it("appends a coach reply with a provider and suggested exercises", async () => {
    const repo = createCoachMessageRepository(db);
    const record = await repo.append({
      role: "coach",
      message: "Try diaphragmatic breathing for 5 minutes daily.",
      suggestedExercises: ["Breathing"],
      provider: "mock",
    });
    expect(record.provider).toBe("mock");
    expect(record.suggestedExercises).toEqual(["Breathing"]);
  });

  it("lists messages chronologically", async () => {
    const repo = createCoachMessageRepository(db);
    await repo.append({ role: "user", message: "First" });
    await new Promise((resolve) => setTimeout(resolve, 2));
    await repo.append({ role: "coach", message: "Second" });

    const list = await repo.list();
    expect(list.map((m) => m.message)).toEqual(["First", "Second"]);
  });

  it("caps the list to the most recent N messages when a limit is given", async () => {
    const repo = createCoachMessageRepository(db);
    for (let i = 0; i < 5; i += 1) {
      await repo.append({ role: "user", message: `Message ${i}` });
      await new Promise((resolve) => setTimeout(resolve, 2));
    }

    const list = await repo.list(2);
    expect(list.map((m) => m.message)).toEqual(["Message 3", "Message 4"]);
  });
});
