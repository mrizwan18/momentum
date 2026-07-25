import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { axe } from "jest-axe";
import { HeatmapCard } from "./HeatmapCard";
import { computeHeatmapWeeks } from "../lib/heatmap";

const weeks = computeHeatmapWeeks([], 12, new Date(2026, 6, 25));

describe("HeatmapCard", () => {
  it("renders one column per week and one cell per day", () => {
    const { container } = render(<HeatmapCard weeks={weeks} />);
    const columns = container.querySelectorAll('[role="img"] > div');
    expect(columns).toHaveLength(12);
    columns.forEach((column) => {
      expect(column.children).toHaveLength(7);
    });
  });

  it("labels the grid with an accessible name", () => {
    const { getByRole } = render(<HeatmapCard weeks={weeks} />);
    expect(
      getByRole("img", {
        name: "Practice activity heatmap for the last 12 weeks",
      }),
    ).toBeInTheDocument();
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<HeatmapCard weeks={weeks} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
