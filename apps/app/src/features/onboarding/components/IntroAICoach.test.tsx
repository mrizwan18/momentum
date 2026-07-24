import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { IntroAICoach } from "./IntroAICoach";

describe("IntroAICoach", () => {
  it("shows the headline and the three preview cards", () => {
    render(<IntroAICoach onNext={vi.fn()} />);
    expect(screen.getByText("Your personal")).toBeInTheDocument();
    expect(screen.getAllByText("AI Coach")).toHaveLength(2); // headline + card label
    expect(screen.getByText("Consistency Score")).toBeInTheDocument();
    expect(screen.getByText("85%")).toBeInTheDocument();
    expect(screen.getByText("Personalized Insight")).toBeInTheDocument();
  });

  it("shows step 2 of 3 and calls onNext", async () => {
    const onNext = vi.fn();
    render(<IntroAICoach onNext={onNext} />);
    expect(
      screen.getByRole("img", { name: /step 2 of 3/i }),
    ).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Continue" }));
    expect(onNext).toHaveBeenCalledOnce();
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<IntroAICoach onNext={vi.fn()} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
