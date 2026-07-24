import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { QuickPracticeRow } from "./QuickPracticeRow";

describe("QuickPracticeRow", () => {
  it("renders one shortcut per real exercise category", () => {
    render(<QuickPracticeRow />);
    expect(screen.getByText("Breathing")).toBeInTheDocument();
    expect(screen.getByText("Warmup")).toBeInTheDocument();
    expect(screen.getByText("Sa Re Ga Ma")).toBeInTheDocument();
    expect(screen.getByText("Alankars")).toBeInTheDocument();
    expect(screen.getByText("Song Practice")).toBeInTheDocument();
  });

  it("links every shortcut to the practice flow", () => {
    render(<QuickPracticeRow />);
    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(5);
    links.forEach((link) => expect(link).toHaveAttribute("href", "/practice"));
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<QuickPracticeRow />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
