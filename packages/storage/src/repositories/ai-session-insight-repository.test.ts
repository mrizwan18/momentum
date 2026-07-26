import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createMomentumDatabase, type MomentumDatabase } from "../db";
import { createAiSessionInsightRepository } from "./ai-session-insight-repository";
import type { VocalMetrics } from "@momentum/types";

const metrics: VocalMetrics = {
  pitchAccuracy: 70,
  pitchStability: 68,
  rhythm: 72,
  breathControl: 65,
  toneQuality: 74,
  consistency: 71,
  vocalRange: 60,
  confidence: 66,
  timing: 69,
  voiceClarity: 73,
  pronunciation: 75,
  energy: 70,
};

function input(sessionId: string) {
  return {
    sessionId,
    whatImproved: ["Rhythm"],
    whatDeclined: [],
    bestMoment: "The song section",
    biggestOpportunity: "Breath control",
    tomorrowsGoal: "Focus on breathing",
    encouragingSentence: "Nice work today!",
    metricsSnapshot: metrics,
    provider: "mock" as const,
  };
}

describe("ai session insight repository", () => {
  let db: MomentumDatabase;

  beforeEach(() => {
    db = createMomentumDatabase(`test-ai-insight-${Math.random()}`);
  });

  afterEach(async () => {
    await db.delete();
  });

  it("creates an insight keyed by sessionId", async () => {
    const repo = createAiSessionInsightRepository(db);
    const record = await repo.create(input("session-1"));
    expect(record.id).toBe("session-1");
    expect(await repo.getBySession("session-1")).toEqual(record);
  });

  it("overwrites rather than duplicates on a repeat create for the same session", async () => {
    const repo = createAiSessionInsightRepository(db);
    await repo.create(input("session-1"));
    await repo.create({ ...input("session-1"), bestMoment: "Updated" });

    const record = await repo.getBySession("session-1");
    expect(record?.bestMoment).toBe("Updated");
    expect(await repo.list()).toHaveLength(1);
  });

  it("lists every insight, oldest first", async () => {
    const repo = createAiSessionInsightRepository(db);
    await repo.create(input("session-1"));
    await new Promise((resolve) => setTimeout(resolve, 2));
    await repo.create(input("session-2"));

    const list = await repo.list();
    expect(list.map((i) => i.sessionId)).toEqual(["session-1", "session-2"]);
  });
});
