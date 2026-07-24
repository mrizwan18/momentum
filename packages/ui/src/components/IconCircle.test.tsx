import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { IconCircle } from "./IconCircle";

describe("IconCircle", () => {
  it("renders its icon", () => {
    render(<IconCircle icon={<span data-testid="icon" />} />);
    expect(screen.getByTestId("icon")).toBeInTheDocument();
  });

  it("sizes via the size prop", () => {
    const { container } = render(<IconCircle icon={<span />} size={56} />);
    const chip = container.firstChild as HTMLElement;
    expect(chip.style.height).toBe("56px");
    expect(chip.style.width).toBe("56px");
  });

  it("is decorative by default", () => {
    const { container } = render(<IconCircle icon={<span />} />);
    expect(container.firstChild).toHaveAttribute("aria-hidden", "true");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<IconCircle icon={<span />} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
