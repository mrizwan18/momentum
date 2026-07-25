import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { WeeklyGraphCard } from "./WeeklyGraphCard";
import type { DailySeriesPoint } from "../lib/date-series";
import type { Trend } from "../lib/trend";

const weekly: DailySeriesPoint[] = [
  { date: "2026-07-19", label: "Sun", minutes: 0, isToday: false },
  { date: "2026-07-20", label: "Mon", minutes: 10, isToday: false },
  { date: "2026-07-21", label: "Tue", minutes: 0, isToday: false },
  { date: "2026-07-22", label: "Wed", minutes: 30, isToday: false },
  { date: "2026-07-23", label: "Thu", minutes: 5, isToday: false },
  { date: "2026-07-24", label: "Fri", minutes: 0, isToday: false },
  { date: "2026-07-25", label: "Sat", minutes: 15, isToday: true },
];

const trend: Trend = {
  currentTotal: 60,
  previousTotal: 40,
  percentChange: 50,
  direction: "up",
};

describe("WeeklyGraphCard", () => {
  it("shows the total minutes and best day", () => {
    render(<WeeklyGraphCard weekly={weekly} trend={trend} />);
    expect(screen.getByText("60")).toBeInTheDocument();
    expect(screen.getByText("minutes practiced")).toBeInTheDocument();
    expect(screen.getByText("Best day")).toBeInTheDocument();
    expect(screen.getByText("30:00")).toBeInTheDocument();
  });

  it("shows the upward trend message", () => {
    render(<WeeklyGraphCard weekly={weekly} trend={trend} />);
    expect(screen.getByText("▲ 50% vs last week")).toBeInTheDocument();
  });

  it("hides the best-day chip when no day has any minutes", () => {
    const zeroWeek = weekly.map((day) => ({ ...day, minutes: 0 }));
    render(<WeeklyGraphCard weekly={zeroWeek} trend={trend} />);
    expect(screen.queryByText("Best day")).not.toBeInTheDocument();
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <WeeklyGraphCard weekly={weekly} trend={trend} />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
