import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { MomentumCard } from "./MomentumCard";

describe("MomentumCard", () => {
  it("renders an honest empty state instead of a fabricated momentum score", () => {
    render(<MomentumCard />);
    expect(screen.getByText("Momentum score coming soon")).toBeInTheDocument();
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<MomentumCard />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
