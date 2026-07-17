import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { StreakCard } from "./StreakCard";
import type { StreakSummary } from "../lib/streak";

const streak: StreakSummary = {
  current: 5,
  longest: 12,
  lastPracticeDate: "2026-07-17",
  nextMilestone: 7,
  daysUntilMilestone: 2,
};

describe("StreakCard", () => {
  it("shows the current and longest streak", () => {
    render(<StreakCard streak={streak} />);
    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText("Longest: 12")).toBeInTheDocument();
  });

  it("shows days remaining until the next milestone", () => {
    render(<StreakCard streak={streak} />);
    expect(screen.getByText(/2 to 7-day/i)).toBeInTheDocument();
  });

  it("uses singular 'day' for a streak of one", () => {
    render(<StreakCard streak={{ ...streak, current: 1 }} />);
    expect(screen.getByText("day in a row")).toBeInTheDocument();
  });

  it("omits the milestone line once there is no next milestone", () => {
    render(
      <StreakCard
        streak={{ ...streak, nextMilestone: null, daysUntilMilestone: null }}
      />,
    );
    expect(screen.queryByText(/milestone/i)).not.toBeInTheDocument();
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<StreakCard streak={streak} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
