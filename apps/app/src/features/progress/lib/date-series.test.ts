import { describe, expect, it } from "vitest";
import { computeDailySeries } from "./date-series";
import type { StatisticsEntryRecord } from "@momentum/types";

function stat(date: string, practiceMinutes: number): StatisticsEntryRecord {
  return {
    id: date,
    date,
    practiceMinutes,
    sessionsCompleted: 1,
    growthScore: null,
    updatedAt: 0,
  };
}

const TODAY = new Date(2026, 6, 25);
const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

describe("computeDailySeries", () => {
  it("returns one point per day, oldest first, ending with today", () => {
    const series = computeDailySeries([], 7, TODAY);
    expect(series).toHaveLength(7);
    expect(series[6].date).toBe("2026-07-25");
    expect(series[6].isToday).toBe(true);
    expect(series[0].isToday).toBe(false);
  });

  it("fills in real practice minutes where data exists, 0 otherwise", () => {
    const series = computeDailySeries(
      [stat("2026-07-24", 15), stat("2026-07-25", 30)],
      7,
      TODAY,
    );
    expect(series.find((p) => p.date === "2026-07-24")?.minutes).toBe(15);
    expect(series.find((p) => p.date === "2026-07-25")?.minutes).toBe(30);
    expect(series.find((p) => p.date === "2026-07-20")?.minutes).toBe(0);
  });

  it("uses weekday labels for a 7-day window", () => {
    const series = computeDailySeries([], 7, TODAY);
    expect(series[6].label).toBe(WEEKDAY_LABELS[TODAY.getDay()]);
  });

  it("uses M/D labels for longer windows", () => {
    const series = computeDailySeries([], 30, TODAY);
    expect(series[series.length - 1].label).toBe("7/25");
  });
});
