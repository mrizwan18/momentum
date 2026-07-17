import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { OneThingCard } from "./OneThingCard";

describe("OneThingCard", () => {
  it("renders an honest empty state instead of a fabricated recommendation", () => {
    render(<OneThingCard />);
    expect(screen.getByText("Nothing planned yet")).toBeInTheDocument();
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<OneThingCard />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
