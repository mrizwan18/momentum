import { describe, expect, it } from "vitest";
import type { StatisticsEntryRecord } from "@momentum/types";
import { computeWeeklyByDay } from "./weekly-snapshot";
import { toDateOnly } from "./streak";

const TODAY = new Date(2026, 6, 17);

function entry(
  daysAgo: number,
  practiceMinutes: number,
  sessionsCompleted: number,
): StatisticsEntryRecord {
  const date = new Date(TODAY);
  date.setDate(date.getDate() - daysAgo);
  const key = toDateOnly(date);
  return {
    id: key,
    date: key,
    practiceMinutes,
    sessionsCompleted,
    growthScore: null,
    updatedAt: 0,
  };
}

describe("computeWeeklyByDay", () => {
  it("returns exactly 7 days, oldest first, ending on today", () => {
    const result = computeWeeklyByDay([], TODAY);
    expect(result).toHaveLength(7);
    expect(result[6].isToday).toBe(true);
    expect(result.slice(0, 6).every((day) => !day.isToday)).toBe(true);
  });

  it("pulls real minutes from statistics, defaulting missing days to 0", () => {
    const entries = [entry(0, 12, 1), entry(2, 30, 2)];
    const result = computeWeeklyByDay(entries, TODAY);
    expect(result[6].minutes).toBe(12);
    expect(result[4].minutes).toBe(30);
    expect(result[0].minutes).toBe(0);
  });

  it("uses single-letter day-of-week labels", () => {
    const result = computeWeeklyByDay([], TODAY);
    result.forEach((day) => expect(day.label).toMatch(/^[SMTWF]$/));
  });
});
