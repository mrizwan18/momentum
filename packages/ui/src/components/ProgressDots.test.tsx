import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { ProgressDots } from "./ProgressDots";

describe("ProgressDots", () => {
  it("renders one dot per step", () => {
    const { container } = render(<ProgressDots count={3} activeIndex={0} />);
    expect(container.querySelectorAll("span")).toHaveLength(3);
  });

  it("exposes an accessible step description", () => {
    render(<ProgressDots count={3} activeIndex={1} label="Onboarding step" />);
    expect(
      screen.getByRole("img", { name: "Onboarding step: step 2 of 3" }),
    ).toBeInTheDocument();
  });

  it("colors only the active dot with the primary color", () => {
    const { container } = render(<ProgressDots count={3} activeIndex={1} />);
    const dots = container.querySelectorAll("span");
    expect(dots[1].style.backgroundColor).not.toBe(
      dots[0].style.backgroundColor,
    );
    expect(dots[0].style.backgroundColor).toBe(dots[2].style.backgroundColor);
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<ProgressDots count={3} activeIndex={0} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
