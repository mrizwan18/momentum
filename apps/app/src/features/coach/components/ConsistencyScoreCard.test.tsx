import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { ConsistencyScoreCard } from "./ConsistencyScoreCard";

describe("ConsistencyScoreCard", () => {
  it("shows the current score and an upward change", () => {
    render(
      <ConsistencyScoreCard
        score={{ current: 85, previous: 73, changePoints: 12 }}
      />,
    );
    expect(screen.getByText("85%")).toBeInTheDocument();
    expect(screen.getByText("↑ 12% from last week")).toBeInTheDocument();
  });

  it("shows a downward change", () => {
    render(
      <ConsistencyScoreCard
        score={{ current: 40, previous: 60, changePoints: -20 }}
      />,
    );
    expect(screen.getByText("↓ 20% from last week")).toBeInTheDocument();
  });

  it("shows no change", () => {
    render(
      <ConsistencyScoreCard
        score={{ current: 50, previous: 50, changePoints: 0 }}
      />,
    );
    expect(screen.getByText("Same as last week")).toBeInTheDocument();
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <ConsistencyScoreCard
        score={{ current: 85, previous: 73, changePoints: 12 }}
      />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
