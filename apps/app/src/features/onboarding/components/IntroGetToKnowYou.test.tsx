import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { IntroGetToKnowYou } from "./IntroGetToKnowYou";

describe("IntroGetToKnowYou", () => {
  it("shows the headline and subhead", () => {
    render(<IntroGetToKnowYou onNext={vi.fn()} />);
    expect(screen.getByText("Let's get to")).toBeInTheDocument();
    expect(screen.getByText("know you")).toBeInTheDocument();
    expect(
      screen.getByText(/personalize your experience/i),
    ).toBeInTheDocument();
  });

  it("calls onNext when Get Started is pressed", async () => {
    const onNext = vi.fn();
    render(<IntroGetToKnowYou onNext={onNext} />);
    await userEvent.click(screen.getByRole("button", { name: /get started/i }));
    expect(onNext).toHaveBeenCalledOnce();
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<IntroGetToKnowYou onNext={vi.fn()} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
