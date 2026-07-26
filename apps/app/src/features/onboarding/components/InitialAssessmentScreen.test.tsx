import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { InitialAssessmentScreen } from "./InitialAssessmentScreen";
import type { BaselineAssessmentRecord } from "@momentum/types";

const assessment: BaselineAssessmentRecord = {
  id: "assessment-1",
  recordingId: "recording-1",
  overallScore: 72,
  metrics: {
    pitchAccuracy: 76,
    pitchStability: 70,
    rhythm: 68,
    breathControl: 60,
    toneQuality: 74,
    consistency: 72,
    vocalRange: 65,
    confidence: 66,
    timing: 69,
    voiceClarity: 73,
    pronunciation: 75,
    energy: 70,
  },
  strengths: ["Warm tone"],
  areasToImprove: ["Pitch stability"],
  recommendedDailyPractice: "Scales",
  recommendedDurationMinutes: 15,
  suggestedSkillLevel: "beginner",
  difficulty: "easy",
  motivationalSummary: "Great start!",
  provider: "mock",
  createdAt: 0,
};

describe("InitialAssessmentScreen", () => {
  it("shows the real overall score and every breakdown row", () => {
    render(
      <InitialAssessmentScreen
        onBack={vi.fn()}
        onNext={vi.fn()}
        assessment={assessment}
        pending={false}
      />,
    );
    expect(screen.getByText("72")).toBeInTheDocument();
    expect(screen.getByText("Good Start!")).toBeInTheDocument();
    expect(screen.getByText("76%")).toBeInTheDocument(); // Pitch Accuracy
    expect(screen.getByText("74%")).toBeInTheDocument(); // Tone & Clarity
    for (const label of [
      "Pitch Accuracy",
      "Tone & Clarity",
      "Rhythm",
      "Range",
      "Consistency",
    ]) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }
  });

  it("explains the baseline's purpose", () => {
    render(
      <InitialAssessmentScreen
        onBack={vi.fn()}
        onNext={vi.fn()}
        assessment={assessment}
        pending={false}
      />,
    );
    expect(screen.getByText(/This is your baseline/)).toBeInTheDocument();
  });

  it("calls onBack and onNext", async () => {
    const onBack = vi.fn();
    const onNext = vi.fn();
    render(
      <InitialAssessmentScreen
        onBack={onBack}
        onNext={onNext}
        assessment={assessment}
        pending={false}
      />,
    );

    await userEvent.click(screen.getByRole("button", { name: "Go back" }));
    expect(onBack).toHaveBeenCalled();

    await userEvent.click(
      screen.getByRole("button", { name: "Continue to Dashboard" }),
    );
    expect(onNext).toHaveBeenCalled();
  });

  it("shows a pending state with no fabricated numbers when the assessment hasn't arrived yet", () => {
    render(
      <InitialAssessmentScreen
        onBack={vi.fn()}
        onNext={vi.fn()}
        assessment={null}
        pending
      />,
    );
    expect(screen.getByText("Analyzing…")).toBeInTheDocument();
    expect(
      screen.getByText(/finish your analysis automatically/),
    ).toBeInTheDocument();
    expect(screen.queryByText("Good Start!")).not.toBeInTheDocument();
    expect(screen.getAllByText("—").length).toBeGreaterThan(0);
  });

  it("still lets the user continue to the Dashboard while pending", async () => {
    const onNext = vi.fn();
    render(
      <InitialAssessmentScreen
        onBack={vi.fn()}
        onNext={onNext}
        assessment={null}
        pending
      />,
    );
    await userEvent.click(
      screen.getByRole("button", { name: "Continue to Dashboard" }),
    );
    expect(onNext).toHaveBeenCalled();
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <InitialAssessmentScreen
        onBack={vi.fn()}
        onNext={vi.fn()}
        assessment={assessment}
        pending={false}
      />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("has no accessibility violations while pending", async () => {
    const { container } = render(
      <InitialAssessmentScreen
        onBack={vi.fn()}
        onNext={vi.fn()}
        assessment={null}
        pending
      />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
