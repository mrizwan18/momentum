import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { InitialAssessmentScreen } from "./InitialAssessmentScreen";

describe("InitialAssessmentScreen", () => {
  it("shows the overall score and every breakdown row", () => {
    render(<InitialAssessmentScreen onBack={vi.fn()} onNext={vi.fn()} />);
    expect(screen.getByText("72")).toBeInTheDocument();
    expect(screen.getByText("Good Start!")).toBeInTheDocument();
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
    render(<InitialAssessmentScreen onBack={vi.fn()} onNext={vi.fn()} />);
    expect(screen.getByText(/This is your baseline/)).toBeInTheDocument();
  });

  it("calls onBack and onNext", async () => {
    const onBack = vi.fn();
    const onNext = vi.fn();
    render(<InitialAssessmentScreen onBack={onBack} onNext={onNext} />);

    await userEvent.click(screen.getByRole("button", { name: "Go back" }));
    expect(onBack).toHaveBeenCalled();

    await userEvent.click(
      screen.getByRole("button", { name: "Continue to Dashboard" }),
    );
    expect(onNext).toHaveBeenCalled();
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <InitialAssessmentScreen onBack={vi.fn()} onNext={vi.fn()} />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
