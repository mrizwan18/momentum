import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { axe } from "jest-axe";
import { OnboardingBackdrop } from "./OnboardingBackdrop";

describe("OnboardingBackdrop", () => {
  it("is hidden from assistive technology", () => {
    const { container } = render(<OnboardingBackdrop />);
    expect(container.firstChild).toHaveAttribute("aria-hidden", "true");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<OnboardingBackdrop />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
