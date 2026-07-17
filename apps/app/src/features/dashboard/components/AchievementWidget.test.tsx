import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { AchievementWidget } from "./AchievementWidget";

describe("AchievementWidget", () => {
  it("renders an honest empty state — no achievements storage exists yet", () => {
    render(<AchievementWidget />);
    expect(screen.getByText("No achievements yet")).toBeInTheDocument();
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<AchievementWidget />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
