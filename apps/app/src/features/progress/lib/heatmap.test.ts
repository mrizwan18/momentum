import { describe, expect, it } from "vitest";
import { computeHeatmapWeeks } from "./heatmap";
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

describe("computeHeatmapWeeks", () => {
  it("returns the requested number of 7-day weeks", () => {
    const weeks = computeHeatmapWeeks([], 4, TODAY);
    expect(weeks).toHaveLength(4);
    weeks.forEach((week) => expect(week.days).toHaveLength(7));
  });

  it("each week starts on a Sunday and ends on a Saturday", () => {
    const weeks = computeHeatmapWeeks([], 4, TODAY);
    for (const week of weeks) {
      expect(new Date(week.days[0].date).getDay()).toBe(0);
      expect(new Date(week.days[6].date).getDay()).toBe(6);
    }
  });

  it("the last week contains today", () => {
    const weeks = computeHeatmapWeeks([], 4, TODAY);
    const lastWeek = weeks[weeks.length - 1];
    const todayCell = lastWeek.days.find((d) => d.date === "2026-07-25");
    expect(todayCell).toBeDefined();
    expect(todayCell?.isFuture).toBe(false);
  });

  it("marks dates after today as future with 0 minutes, not fabricated activity", () => {
    // Mid-week, so its calendar week has real days left over to pad.
    const midWeekToday = new Date(2026, 6, 22);
    const weeks = computeHeatmapWeeks([], 4, midWeekToday);
    const lastWeek = weeks[weeks.length - 1];
    const futureCells = lastWeek.days.filter((d) => d.date > "2026-07-22");
    expect(futureCells.length).toBeGreaterThan(0);
    futureCells.forEach((cell) => {
      expect(cell.isFuture).toBe(true);
      expect(cell.minutes).toBe(0);
      expect(cell.level).toBe(0);
    });
  });

  it("maps minutes to increasing intensity levels", () => {
    const weeks = computeHeatmapWeeks(
      [
        stat("2026-07-25", 0),
        stat("2026-07-24", 10),
        stat("2026-07-23", 20),
        stat("2026-07-22", 45),
        stat("2026-07-21", 90),
      ],
      4,
      TODAY,
    );
    const byDate = new Map(
      weeks.flatMap((w) => w.days).map((d) => [d.date, d]),
    );
    expect(byDate.get("2026-07-25")?.level).toBe(0);
    expect(byDate.get("2026-07-24")?.level).toBe(1);
    expect(byDate.get("2026-07-23")?.level).toBe(2);
    expect(byDate.get("2026-07-22")?.level).toBe(3);
    expect(byDate.get("2026-07-21")?.level).toBe(4);
  });
});
