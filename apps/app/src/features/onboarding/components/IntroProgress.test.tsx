import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { IntroProgress } from "./IntroProgress";

describe("IntroProgress", () => {
  it("shows the headline, streak, and stat tiles", () => {
    render(<IntroProgress onNext={vi.fn()} />);
    expect(screen.getByText("Track. Improve.")).toBeInTheDocument();
    expect(screen.getByText("Grow.")).toBeInTheDocument();
    expect(screen.getByText("Current Streak")).toBeInTheDocument();
    expect(screen.getByText("12")).toBeInTheDocument();
    expect(screen.getByText("860 kcal")).toBeInTheDocument();
    expect(screen.getByText("6h 40m")).toBeInTheDocument();
  });

  it("shows step 3 of 3 and calls onNext", async () => {
    const onNext = vi.fn();
    render(<IntroProgress onNext={onNext} />);
    expect(
      screen.getByRole("img", { name: /step 3 of 3/i }),
    ).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Continue" }));
    expect(onNext).toHaveBeenCalledOnce();
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<IntroProgress onNext={vi.fn()} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
