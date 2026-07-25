import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { MonthlyGraphCard } from "./MonthlyGraphCard";
import type { DailySeriesPoint } from "../lib/date-series";

const monthly: DailySeriesPoint[] = Array.from({ length: 30 }, (_, i) => ({
  date: `2026-07-${String(i + 1).padStart(2, "0")}`,
  label: `7/${i + 1}`,
  minutes: i % 3 === 0 ? 20 : 0,
  isToday: i === 29,
}));

describe("MonthlyGraphCard", () => {
  it("shows the total minutes for the month", () => {
    const total = monthly.reduce((sum, d) => sum + d.minutes, 0);
    render(
      <MonthlyGraphCard
        monthly={monthly}
        trend={{
          currentTotal: total,
          previousTotal: total,
          percentChange: 0,
          direction: "flat",
        }}
      />,
    );
    expect(screen.getByText(String(total))).toBeInTheDocument();
    expect(screen.getByText("minutes in the last 30 days")).toBeInTheDocument();
  });

  it("shows a downward trend message", () => {
    render(
      <MonthlyGraphCard
        monthly={monthly}
        trend={{
          currentTotal: 50,
          previousTotal: 100,
          percentChange: -50,
          direction: "down",
        }}
      />,
    );
    expect(
      screen.getByText("▼ 50% vs the previous 30 days"),
    ).toBeInTheDocument();
  });

  it("omits the trend line when there's no previous-window data", () => {
    render(
      <MonthlyGraphCard
        monthly={monthly}
        trend={{
          currentTotal: 30,
          previousTotal: 0,
          percentChange: null,
          direction: "up",
        }}
      />,
    );
    expect(
      screen.queryByText(/vs the previous 30 days/),
    ).not.toBeInTheDocument();
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <MonthlyGraphCard
        monthly={monthly}
        trend={{
          currentTotal: 0,
          previousTotal: 0,
          percentChange: null,
          direction: "flat",
        }}
      />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
