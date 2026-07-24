import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { OnboardingFooter } from "./OnboardingFooter";

describe("OnboardingFooter", () => {
  it("shows the right number of progress dots", () => {
    render(<OnboardingFooter dotsCount={3} activeIndex={1} onNext={vi.fn()} />);
    expect(
      screen.getByRole("img", { name: /step 2 of 3/i }),
    ).toBeInTheDocument();
  });

  it("calls onNext when the FAB is pressed", async () => {
    const onNext = vi.fn();
    render(<OnboardingFooter dotsCount={3} activeIndex={0} onNext={onNext} />);
    await userEvent.click(screen.getByRole("button", { name: "Continue" }));
    expect(onNext).toHaveBeenCalledOnce();
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <OnboardingFooter dotsCount={3} activeIndex={0} onNext={vi.fn()} />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
