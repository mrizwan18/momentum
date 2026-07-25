import { describe, expect, it } from "vitest";
import { computeFrequency } from "./frequency";
import type { StatisticsEntryRecord } from "@momentum/types";

function stat(date: string, practiceMinutes: number): StatisticsEntryRecord {
  return {
    id: date,
    date,
    practiceMinutes,
    sessionsCompleted: practiceMinutes > 0 ? 1 : 0,
    growthScore: null,
    updatedAt: 0,
  };
}

const TODAY = new Date(2026, 6, 25);

describe("computeFrequency", () => {
  it("returns 0 of N with no practice history", () => {
    const summary = computeFrequency([], 7, TODAY);
    expect(summary).toEqual({ daysPracticed: 0, totalDays: 7, ratio: 0 });
  });

  it("counts only days within the trailing window with real practice", () => {
    const summary = computeFrequency(
      [
        stat("2026-07-25", 10),
        stat("2026-07-24", 15),
        stat("2026-07-17", 20), // outside the 7-day window
        stat("2026-07-23", 0), // logged but zero minutes/sessions
      ],
      7,
      TODAY,
    );
    expect(summary).toEqual({ daysPracticed: 2, totalDays: 7, ratio: 2 / 7 });
  });

  it("counts a day with sessionsCompleted > 0 even if minutes rounds to 0", () => {
    const summary = computeFrequency(
      [
        {
          id: "2026-07-25",
          date: "2026-07-25",
          practiceMinutes: 0,
          sessionsCompleted: 1,
          growthScore: null,
          updatedAt: 0,
        },
      ],
      7,
      TODAY,
    );
    expect(summary.daysPracticed).toBe(1);
  });
});
