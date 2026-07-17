import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { ScoreCard } from "./ScoreCard";

describe("ScoreCard", () => {
  it("renders an honest empty state instead of a fabricated score", () => {
    render(<ScoreCard />);
    expect(screen.getByText("No score yet")).toBeInTheDocument();
    expect(
      screen.getByText(/complete a practice session/i),
    ).toBeInTheDocument();
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<ScoreCard />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
