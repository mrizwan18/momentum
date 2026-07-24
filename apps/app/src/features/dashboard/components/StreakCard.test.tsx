import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { StreakCard } from "./StreakCard";
import type { StreakSummary } from "../lib/streak";
import type { WeeklyByDayEntry } from "../lib/weekly-snapshot";

const streak: StreakSummary = {
  current: 5,
  longest: 12,
  lastPracticeDate: "2026-07-17",
  nextMilestone: 7,
  daysUntilMilestone: 2,
};

const weeklyByDay: WeeklyByDayEntry[] = [
  { label: "M", minutes: 10, isToday: false },
  { label: "T", minutes: 20, isToday: false },
  { label: "W", minutes: 0, isToday: false },
  { label: "T", minutes: 15, isToday: false },
  { label: "F", minutes: 30, isToday: false },
  { label: "S", minutes: 5, isToday: false },
  { label: "S", minutes: 12, isToday: true },
];

describe("StreakCard", () => {
  it("shows the current and longest streak", () => {
    render(<StreakCard streak={streak} weeklyByDay={weeklyByDay} />);
    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText("Longest: 12")).toBeInTheDocument();
  });

  it("shows days remaining until the next milestone", () => {
    render(<StreakCard streak={streak} weeklyByDay={weeklyByDay} />);
    expect(screen.getByText(/2 to 7-day/i)).toBeInTheDocument();
  });

  it("uses singular 'day' for a streak of one", () => {
    render(
      <StreakCard
        streak={{ ...streak, current: 1 }}
        weeklyByDay={weeklyByDay}
      />,
    );
    expect(screen.getByText("day in a row")).toBeInTheDocument();
  });

  it("omits the milestone line once there is no next milestone", () => {
    render(
      <StreakCard
        streak={{ ...streak, nextMilestone: null, daysUntilMilestone: null }}
        weeklyByDay={weeklyByDay}
      />,
    );
    expect(screen.queryByText(/milestone/i)).not.toBeInTheDocument();
  });

  it("renders the trailing 7 days as a bar chart", () => {
    render(<StreakCard streak={streak} weeklyByDay={weeklyByDay} />);
    expect(
      screen.getByRole("img", { name: "Practice minutes for the last 7 days" }),
    ).toBeInTheDocument();
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <StreakCard streak={streak} weeklyByDay={weeklyByDay} />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
