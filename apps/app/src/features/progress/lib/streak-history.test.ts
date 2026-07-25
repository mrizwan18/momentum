import { describe, expect, it } from "vitest";
import { computeStreakHistory } from "./streak-history";
import type { StatisticsEntryRecord } from "@momentum/types";

function stat(date: string, practiceMinutes = 15): StatisticsEntryRecord {
  return {
    id: date,
    date,
    practiceMinutes,
    sessionsCompleted: 1,
    growthScore: null,
    updatedAt: 0,
  };
}

const TODAY = new Date(2026, 6, 25); // 2026-07-25

describe("computeStreakHistory", () => {
  it("is all zeros with no practice history", () => {
    const points = computeStreakHistory([], 5, TODAY);
    expect(points.every((p) => p.streakLength === 0)).toBe(true);
  });

  it("builds a running streak across consecutive practice days", () => {
    const points = computeStreakHistory(
      [stat("2026-07-21"), stat("2026-07-22"), stat("2026-07-23")],
      5,
      TODAY,
    );
    const byDate = new Map(points.map((p) => [p.date, p.streakLength]));
    expect(byDate.get("2026-07-21")).toBe(1);
    expect(byDate.get("2026-07-22")).toBe(2);
    expect(byDate.get("2026-07-23")).toBe(3);
  });

  it("carries the streak forward through the grace-period day after last practice", () => {
    const points = computeStreakHistory(
      [stat("2026-07-23"), stat("2026-07-24")],
      5,
      TODAY,
    );
    const byDate = new Map(points.map((p) => [p.date, p.streakLength]));
    // 2026-07-25 (today) is the day right after the last practice — still "current".
    expect(byDate.get("2026-07-25")).toBe(2);
  });

  it("drops to 0 once more than one day has passed without practice", () => {
    const points = computeStreakHistory(
      [stat("2026-07-20"), stat("2026-07-21")],
      7,
      TODAY,
    );
    const byDate = new Map(points.map((p) => [p.date, p.streakLength]));
    expect(byDate.get("2026-07-23")).toBe(0);
    expect(byDate.get("2026-07-25")).toBe(0);
  });

  it("resets the streak count after a gap", () => {
    const points = computeStreakHistory(
      [stat("2026-07-18"), stat("2026-07-23"), stat("2026-07-24")],
      10,
      TODAY,
    );
    const byDate = new Map(points.map((p) => [p.date, p.streakLength]));
    expect(byDate.get("2026-07-18")).toBe(1);
    expect(byDate.get("2026-07-23")).toBe(1);
    expect(byDate.get("2026-07-24")).toBe(2);
  });
});
