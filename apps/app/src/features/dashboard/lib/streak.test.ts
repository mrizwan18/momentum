import { describe, expect, it } from "vitest";
import { computeStreak, getPracticeStatus, toDateOnly } from "./streak";

const TODAY = new Date(2026, 6, 17); // 2026-07-17 (local time, matches toDateOnly)

function daysAgo(n: number): string {
  const date = new Date(TODAY);
  date.setDate(date.getDate() - n);
  return toDateOnly(date);
}

describe("computeStreak", () => {
  it("returns zeroes and the first milestone when there is no history", () => {
    const result = computeStreak([], TODAY);
    expect(result.current).toBe(0);
    expect(result.longest).toBe(0);
    expect(result.lastPracticeDate).toBeNull();
    expect(result.nextMilestone).toBe(7);
    expect(result.daysUntilMilestone).toBe(7);
  });

  it("counts a single practice day as a streak of one", () => {
    const result = computeStreak([daysAgo(0)], TODAY);
    expect(result.current).toBe(1);
    expect(result.longest).toBe(1);
    expect(result.lastPracticeDate).toBe(daysAgo(0));
  });

  it("counts consecutive days ending today", () => {
    const result = computeStreak(
      [daysAgo(4), daysAgo(3), daysAgo(2), daysAgo(1), daysAgo(0)],
      TODAY,
    );
    expect(result.current).toBe(5);
    expect(result.longest).toBe(5);
  });

  it("keeps the streak alive when the last practice was yesterday", () => {
    const result = computeStreak([daysAgo(2), daysAgo(1)], TODAY);
    expect(result.current).toBe(2);
  });

  it("resets the current streak once more than a day has been missed", () => {
    const result = computeStreak([daysAgo(10), daysAgo(9), daysAgo(5)], TODAY);
    expect(result.current).toBe(0);
    expect(result.longest).toBe(2);
    expect(result.lastPracticeDate).toBe(daysAgo(5));
  });

  it("preserves the longest streak even after it lapses", () => {
    const result = computeStreak(
      [daysAgo(20), daysAgo(19), daysAgo(18), daysAgo(17), daysAgo(10)],
      TODAY,
    );
    expect(result.longest).toBe(4);
    expect(result.current).toBe(0);
  });

  it("computes days until the next milestone", () => {
    const dates = Array.from({ length: 5 }, (_, i) => daysAgo(4 - i));
    const result = computeStreak(dates, TODAY);
    expect(result.current).toBe(5);
    expect(result.nextMilestone).toBe(7);
    expect(result.daysUntilMilestone).toBe(2);
  });

  it("has no next milestone once the longest one is exceeded", () => {
    const dates = Array.from({ length: 400 }, (_, i) => daysAgo(399 - i));
    const result = computeStreak(dates, TODAY);
    expect(result.current).toBe(400);
    expect(result.nextMilestone).toBeNull();
    expect(result.daysUntilMilestone).toBeNull();
  });

  it("de-duplicates repeated dates", () => {
    const result = computeStreak([daysAgo(0), daysAgo(0), daysAgo(1)], TODAY);
    expect(result.current).toBe(2);
  });
});

describe("getPracticeStatus", () => {
  it("is 'new' when there is no history", () => {
    expect(getPracticeStatus(computeStreak([], TODAY), TODAY)).toBe("new");
  });

  it("is 'practiced-today' when the last session was today", () => {
    const streak = computeStreak([daysAgo(0)], TODAY);
    expect(getPracticeStatus(streak, TODAY)).toBe("practiced-today");
  });

  it("is 'streak-active' when the streak is alive but today isn't done yet", () => {
    const streak = computeStreak([daysAgo(1)], TODAY);
    expect(getPracticeStatus(streak, TODAY)).toBe("streak-active");
  });

  it("is 'recovery' once the streak has lapsed", () => {
    const streak = computeStreak([daysAgo(5)], TODAY);
    expect(getPracticeStatus(streak, TODAY)).toBe("recovery");
  });
});
