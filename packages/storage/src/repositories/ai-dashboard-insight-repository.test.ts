import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createMomentumDatabase, type MomentumDatabase } from "../db";
import { createAiDashboardInsightRepository } from "./ai-dashboard-insight-repository";

function input(date: string) {
  return {
    date,
    todaysFocus: "Breath control",
    dailyInsight: "You're most consistent in the mornings.",
    motivationalMessage: "Keep it up!",
    practiceRecommendation: "10 minutes of scales",
    estimatedImprovementPercent: 5,
    suggestedSessionLengthMinutes: 15,
    recoveryAdvice: null,
    provider: "mock" as const,
  };
}

describe("ai dashboard insight repository", () => {
  let db: MomentumDatabase;

  beforeEach(() => {
    db = createMomentumDatabase(`test-dashboard-insight-${Math.random()}`);
  });

  afterEach(async () => {
    await db.delete();
  });

  it("returns undefined before any insight exists for a date", async () => {
    const repo = createAiDashboardInsightRepository(db);
    expect(await repo.getForDate("2026-07-26")).toBeUndefined();
  });

  it("sets and reads an insight for a date", async () => {
    const repo = createAiDashboardInsightRepository(db);
    const record = await repo.setForDate(input("2026-07-26"));
    expect(record.id).toBe("2026-07-26");
    expect(await repo.getForDate("2026-07-26")).toEqual(record);
  });

  it("replaces the insight for the same date on a repeat set", async () => {
    const repo = createAiDashboardInsightRepository(db);
    await repo.setForDate(input("2026-07-26"));
    await repo.setForDate({ ...input("2026-07-26"), todaysFocus: "Updated" });

    const record = await repo.getForDate("2026-07-26");
    expect(record?.todaysFocus).toBe("Updated");
  });
});
