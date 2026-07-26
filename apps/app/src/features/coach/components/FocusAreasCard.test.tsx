import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { FocusAreasCard } from "./FocusAreasCard";

const areas = [
  { label: "Pitch Accuracy", value: 82 },
  { label: "Voice Control", value: 78 },
  { label: "Rhythm", value: 70 },
  { label: "Consistency", value: 88 },
  { label: "Stamina", value: 75 },
];

describe("FocusAreasCard", () => {
  it("shows every focus area with its real percentage", () => {
    render(<FocusAreasCard areas={areas} />);
    for (const area of areas) {
      expect(screen.getByText(area.label)).toBeInTheDocument();
      expect(screen.getByText(`${area.value}%`)).toBeInTheDocument();
    }
  });

  it("gives the radar chart an accessible text summary", () => {
    render(<FocusAreasCard areas={areas} />);
    expect(
      screen.getByRole("img", { name: /Pitch Accuracy 82%/ }),
    ).toBeInTheDocument();
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<FocusAreasCard areas={areas} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
