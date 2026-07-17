import { describe, expect, it } from "vitest";
import type { StatisticsEntryRecord } from "@momentum/types";
import { computeWeeklySnapshot } from "./weekly-snapshot";
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

describe("computeWeeklySnapshot", () => {
  it("returns zeroes when there are no statistics", () => {
    const result = computeWeeklySnapshot([], TODAY);
    expect(result).toEqual({
      practiceMinutes: 0,
      sessionsCompleted: 0,
      daysPracticed: 0,
    });
  });

  it("sums practice minutes and sessions within the trailing 7 days", () => {
    const entries = [entry(0, 10, 1), entry(1, 20, 1), entry(6, 5, 1)];
    const result = computeWeeklySnapshot(entries, TODAY);
    expect(result.practiceMinutes).toBe(35);
    expect(result.sessionsCompleted).toBe(3);
    expect(result.daysPracticed).toBe(3);
  });

  it("excludes entries older than 7 days", () => {
    const entries = [entry(0, 10, 1), entry(7, 100, 5), entry(30, 100, 5)];
    const result = computeWeeklySnapshot(entries, TODAY);
    expect(result.practiceMinutes).toBe(10);
    expect(result.sessionsCompleted).toBe(1);
  });

  it("does not count zero-activity entries as practiced days", () => {
    const entries = [entry(0, 0, 0)];
    const result = computeWeeklySnapshot(entries, TODAY);
    expect(result.daysPracticed).toBe(0);
  });
});
