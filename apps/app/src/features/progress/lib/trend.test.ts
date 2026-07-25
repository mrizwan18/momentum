import { describe, expect, it } from "vitest";
import { computeTrend } from "./trend";
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

const TODAY = new Date(2026, 6, 25); // window: 2026-07-19..07-25; previous window: 2026-07-12..07-18

describe("computeTrend", () => {
  it("is flat with no history at all", () => {
    const trend = computeTrend([], 7, TODAY);
    expect(trend).toEqual({
      currentTotal: 0,
      previousTotal: 0,
      percentChange: null,
      direction: "flat",
    });
  });

  it("reports an upward trend with a percent change", () => {
    const trend = computeTrend(
      [stat("2026-07-25", 100), stat("2026-07-15", 50)],
      7,
      TODAY,
    );
    expect(trend.currentTotal).toBe(100);
    expect(trend.previousTotal).toBe(50);
    expect(trend.percentChange).toBe(100);
    expect(trend.direction).toBe("up");
  });

  it("reports a downward trend", () => {
    const trend = computeTrend(
      [stat("2026-07-25", 20), stat("2026-07-15", 80)],
      7,
      TODAY,
    );
    expect(trend.direction).toBe("down");
    expect(trend.percentChange).toBe(-75);
  });

  it("has a null percentChange when the previous window had zero minutes", () => {
    const trend = computeTrend([stat("2026-07-25", 30)], 7, TODAY);
    expect(trend.previousTotal).toBe(0);
    expect(trend.percentChange).toBeNull();
    expect(trend.direction).toBe("up");
  });

  it("is flat when both windows are equal", () => {
    const trend = computeTrend(
      [stat("2026-07-25", 40), stat("2026-07-15", 40)],
      7,
      TODAY,
    );
    expect(trend.direction).toBe("flat");
    expect(trend.percentChange).toBe(0);
  });
});
