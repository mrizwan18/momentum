import { describe, expect, it } from "vitest";
import type { StatisticsEntryRecord } from "@momentum/types";
import { toDateOnly } from "@/lib/date";
import { computeConsistencyScore } from "./consistency-score";

function entry(date: Date, minutes: number): StatisticsEntryRecord {
  const dateKey = toDateOnly(date);
  return {
    id: dateKey,
    date: dateKey,
    practiceMinutes: minutes,
    sessionsCompleted: minutes > 0 ? 1 : 0,
    growthScore: null,
    updatedAt: 0,
  };
}

describe("computeConsistencyScore", () => {
  it("returns 0/0 with no history", () => {
    const today = new Date("2026-07-25T12:00:00Z");
    expect(computeConsistencyScore([], today)).toEqual({
      current: 0,
      previous: 0,
      changePoints: 0,
    });
  });

  it("computes this week's ratio out of 7 trailing days", () => {
    const today = new Date("2026-07-25T12:00:00Z");
    const entries = [0, 1, 2].map((offset) => {
      const date = new Date(today);
      date.setDate(date.getDate() - offset);
      return entry(date, 20);
    });

    const score = computeConsistencyScore(entries, today);
    expect(score.current).toBe(Math.round((3 / 7) * 100));
  });

  it("computes the percentage-point delta vs. the prior 7-day window", () => {
    const today = new Date("2026-07-25T12:00:00Z");
    const entries: StatisticsEntryRecord[] = [];
    // This week: practiced all 7 days.
    for (let offset = 0; offset < 7; offset += 1) {
      const date = new Date(today);
      date.setDate(date.getDate() - offset);
      entries.push(entry(date, 15));
    }
    // Prior week: practiced only 2 of 7 days.
    for (const offset of [8, 10]) {
      const date = new Date(today);
      date.setDate(date.getDate() - offset);
      entries.push(entry(date, 15));
    }

    const score = computeConsistencyScore(entries, today);
    expect(score.current).toBe(100);
    expect(score.previous).toBe(Math.round((2 / 7) * 100));
    expect(score.changePoints).toBe(score.current - score.previous);
    expect(score.changePoints).toBeGreaterThan(0);
  });
});
