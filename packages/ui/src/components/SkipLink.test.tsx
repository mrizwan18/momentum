import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { SkipLink } from "./SkipLink";

describe("SkipLink", () => {
  it("links to the given target id", () => {
    render(<SkipLink targetId="main" />);
    expect(
      screen.getByRole("link", { name: "Skip to main content" }),
    ).toHaveAttribute("href", "#main");
  });

  it("is visually hidden until focused", () => {
    render(<SkipLink targetId="main" />);
    expect(screen.getByRole("link")).toHaveClass("sr-only");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<SkipLink targetId="main" />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
