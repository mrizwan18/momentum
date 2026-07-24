import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { StatTile } from "./StatTile";

describe("StatTile", () => {
  it("shows the value and label", () => {
    render(
      <StatTile
        icon={<span />}
        value="860 kcal"
        label="Calories Burned"
        tint="peach"
      />,
    );
    expect(screen.getByText("860 kcal")).toBeInTheDocument();
    expect(screen.getByText("Calories Burned")).toBeInTheDocument();
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <StatTile
        icon={<span />}
        value="6h 40m"
        label="Total Practice"
        tint="pink"
      />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
