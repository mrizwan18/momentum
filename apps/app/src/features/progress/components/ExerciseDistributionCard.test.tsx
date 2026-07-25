import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { ExerciseDistributionCard } from "./ExerciseDistributionCard";
import type { ExerciseDistributionEntry } from "../lib/exercise-distribution";

const distribution: ExerciseDistributionEntry[] = [
  { category: "breathing", count: 6, totalDurationSeconds: 300, percent: 0.6 },
  { category: "song", count: 4, totalDurationSeconds: 800, percent: 0.4 },
];

describe("ExerciseDistributionCard", () => {
  it("shows an empty state with no attempts", () => {
    render(<ExerciseDistributionCard distribution={[]} />);
    expect(screen.getByText("No exercises yet")).toBeInTheDocument();
  });

  it("lists each category with its percentage", () => {
    render(<ExerciseDistributionCard distribution={distribution} />);
    expect(screen.getByText("Breathing")).toBeInTheDocument();
    expect(screen.getByText("Song")).toBeInTheDocument();
    expect(screen.getByText("60%")).toBeInTheDocument();
    expect(screen.getByText("40%")).toBeInTheDocument();
  });

  it("has no accessibility violations with data", async () => {
    const { container } = render(
      <ExerciseDistributionCard distribution={distribution} />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("has no accessibility violations when empty", async () => {
    const { container } = render(
      <ExerciseDistributionCard distribution={[]} />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
