import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import type { DashboardInsightRecord } from "@momentum/types";
import { DashboardAiCard } from "./DashboardAiCard";

const insight: DashboardInsightRecord = {
  id: "2026-07-25",
  date: "2026-07-25",
  todaysFocus: "Breath control",
  dailyInsight: "You've been consistent this week.",
  motivationalMessage: "Keep it up!",
  practiceRecommendation: "Try the breathing exercises",
  estimatedImprovementPercent: 5,
  suggestedSessionLengthMinutes: 15,
  recoveryAdvice: "Rest your voice tomorrow.",
  provider: "mock",
  generatedAt: 0,
};

describe("DashboardAiCard", () => {
  it("shows a preparing message while loading", () => {
    render(<DashboardAiCard status="loading" insight={null} />);
    expect(screen.getByText("Today's Focus")).toBeInTheDocument();
    expect(screen.getByText("Preparing today's insight…")).toBeInTheDocument();
  });

  it("shows the real insight once ready", () => {
    render(<DashboardAiCard status="ready" insight={insight} />);
    expect(screen.getByText("Breath control")).toBeInTheDocument();
    expect(
      screen.getByText("You've been consistent this week."),
    ).toBeInTheDocument();
    expect(screen.getByText("Keep it up!")).toBeInTheDocument();
    expect(screen.getByText(/Try the breathing exercises/)).toBeInTheDocument();
    expect(screen.getByText("Rest your voice tomorrow.")).toBeInTheDocument();
  });

  it("shows an offline message when unavailable", () => {
    render(<DashboardAiCard status="unavailable" insight={null} />);
    expect(screen.getByText(/back online/)).toBeInTheDocument();
    expect(screen.queryByText("Today's Focus")).not.toBeInTheDocument();
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <DashboardAiCard status="ready" insight={insight} />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
