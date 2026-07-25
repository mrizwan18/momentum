import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { axe } from "jest-axe";
import { StreakHistoryCard } from "./StreakHistoryCard";

const points = Array.from({ length: 30 }, (_, i) => ({
  date: `2026-07-${String((i % 28) + 1).padStart(2, "0")}`,
  streakLength: i % 5,
}));

describe("StreakHistoryCard", () => {
  it("renders the chart container with an accessible label", () => {
    const { getByRole } = render(<StreakHistoryCard points={points} />);
    expect(
      getByRole("img", { name: "Streak length over the last 30 days" }),
    ).toBeInTheDocument();
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<StreakHistoryCard points={points} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
