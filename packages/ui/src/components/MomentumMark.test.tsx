import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { MomentumMark } from "./MomentumMark";

describe("MomentumMark", () => {
  it("renders as a labeled image", () => {
    render(<MomentumMark />);
    expect(screen.getByRole("img", { name: "Momentum" })).toBeInTheDocument();
  });

  it("sizes via the size prop", () => {
    render(<MomentumMark size={64} />);
    const mark = screen.getByRole("img", { name: "Momentum" });
    expect(mark).toHaveAttribute("width", "64");
    expect(mark).toHaveAttribute("height", "64");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<MomentumMark />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
