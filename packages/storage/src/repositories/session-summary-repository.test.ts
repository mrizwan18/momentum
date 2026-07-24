import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createMomentumDatabase, type MomentumDatabase } from "../db";
import { createSessionSummaryRepository } from "./session-summary-repository";

describe("session summary repository", () => {
  let db: MomentumDatabase;

  beforeEach(() => {
    db = createMomentumDatabase(`test-summary-${Math.random()}`);
  });

  afterEach(async () => {
    await db.delete();
  });

  it("creates a summary with no fabricated score", async () => {
    const repo = createSessionSummaryRepository(db);
    const summary = await repo.create({
      sessionId: "session-1",
      xpEarned: 100,
    });

    expect(summary.overallScore).toBeNull();
    expect(summary.momentumDelta).toBeNull();
    expect(summary.xpEarned).toBe(100);
    expect(summary.achievementIds).toEqual([]);
  });

  it("looks a summary up by session id", async () => {
    const repo = createSessionSummaryRepository(db);
    await repo.create({ sessionId: "session-1", xpEarned: 100 });

    const found = await repo.getBySession("session-1");
    expect(found?.sessionId).toBe("session-1");
  });

  it("overwrites rather than duplicates when a session is re-summarized", async () => {
    const repo = createSessionSummaryRepository(db);
    await repo.create({ sessionId: "session-1", xpEarned: 100 });
    await repo.create({ sessionId: "session-1", xpEarned: 150 });

    const found = await repo.getBySession("session-1");
    expect(found?.xpEarned).toBe(150);
    expect(await db.sessionSummaries.count()).toBe(1);
  });

  it("lists every summary oldest first", async () => {
    const repo = createSessionSummaryRepository(db);
    await repo.create({ sessionId: "session-1", xpEarned: 100 });
    await new Promise((resolve) => setTimeout(resolve, 2));
    await repo.create({ sessionId: "session-2", xpEarned: 120 });

    const all = await repo.list();
    expect(all.map((summary) => summary.sessionId)).toEqual([
      "session-1",
      "session-2",
    ]);
  });
});
