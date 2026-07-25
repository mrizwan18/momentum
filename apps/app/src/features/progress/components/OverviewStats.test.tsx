import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { OverviewStats } from "./OverviewStats";

describe("OverviewStats", () => {
  it("shows the frequency ratio and completion rate", () => {
    render(
      <OverviewStats
        frequency={{ daysPracticed: 18, totalDays: 30, ratio: 0.6 }}
        completionRate={{ completed: 9, abandoned: 1, total: 10, rate: 0.9 }}
      />,
    );
    expect(screen.getByText("18")).toBeInTheDocument();
    expect(screen.getByText("/ 30")).toBeInTheDocument();
    expect(screen.getByText("90%")).toBeInTheDocument();
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <OverviewStats
        frequency={{ daysPracticed: 0, totalDays: 30, ratio: 0 }}
        completionRate={{ completed: 0, abandoned: 0, total: 0, rate: 0 }}
      />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
