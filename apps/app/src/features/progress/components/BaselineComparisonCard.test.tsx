import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import type { BaselineComparisonNumbers } from "@/ai/types";
import { BaselineComparisonCard } from "./BaselineComparisonCard";

const comparison: BaselineComparisonNumbers = {
  progressPercent: 12,
  pitchImprovement: 10,
  rhythmImprovement: -5,
  confidenceImprovement: 0,
  consistencyImprovement: 8,
  rangeImprovement: 3,
  trend: "improving",
};

describe("BaselineComparisonCard", () => {
  it("shows the headline progress percent and trend", () => {
    render(
      <BaselineComparisonCard
        comparison={comparison}
        aiSummary={null}
        aiStatus="loading"
      />,
    );
    expect(screen.getByText("+12%")).toBeInTheDocument();
    expect(screen.getByText("Improving")).toBeInTheDocument();
  });

  it("shows every per-metric row with an up/down arrow", () => {
    render(
      <BaselineComparisonCard
        comparison={comparison}
        aiSummary={null}
        aiStatus="loading"
      />,
    );
    expect(screen.getByText("▲ 10%")).toBeInTheDocument(); // pitch
    expect(screen.getByText("▼ 5%")).toBeInTheDocument(); // rhythm
    expect(screen.getByText("▲ 8%")).toBeInTheDocument(); // consistency
    expect(screen.getByText("0%")).toBeInTheDocument(); // confidence (no change, no arrow)
  });

  it("shows a reviewing message while the AI narration loads", () => {
    render(
      <BaselineComparisonCard
        comparison={comparison}
        aiSummary={null}
        aiStatus="loading"
      />,
    );
    expect(
      screen.getByText("Your AI coach is reviewing your progress…"),
    ).toBeInTheDocument();
  });

  it("shows the AI narration once ready", () => {
    render(
      <BaselineComparisonCard
        comparison={comparison}
        aiSummary="Solid progress since your baseline."
        aiStatus="ready"
      />,
    );
    expect(
      screen.getByText("Solid progress since your baseline."),
    ).toBeInTheDocument();
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <BaselineComparisonCard
        comparison={comparison}
        aiSummary="Solid progress since your baseline."
        aiStatus="ready"
      />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
