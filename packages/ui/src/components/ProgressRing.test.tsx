import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { ProgressRing } from "./ProgressRing";

describe("ProgressRing", () => {
  it("exposes value via ARIA progressbar attributes", () => {
    render(<ProgressRing value={84} label="Today's score" />);
    const ring = screen.getByRole("progressbar", { name: "Today's score" });
    expect(ring).toHaveAttribute("aria-valuenow", "84");
    expect(ring).toHaveAttribute("aria-valuemin", "0");
    expect(ring).toHaveAttribute("aria-valuemax", "100");
  });

  it("clamps out-of-range values", () => {
    render(<ProgressRing value={150} label="Score" />);
    expect(screen.getByRole("progressbar")).toHaveAttribute(
      "aria-valuenow",
      "100",
    );
  });

  it("omits aria-valuenow when indeterminate/loading", () => {
    render(<ProgressRing label="Loading score" />);
    expect(screen.getByRole("progressbar")).not.toHaveAttribute(
      "aria-valuenow",
    );
  });

  it("marks itself disabled", () => {
    render(<ProgressRing value={50} label="Score" disabled />);
    expect(screen.getByRole("progressbar")).toHaveAttribute(
      "aria-disabled",
      "true",
    );
  });

  it("renders children centered inside the ring", () => {
    render(
      <ProgressRing value={84} label="Score">
        <span>84</span>
      </ProgressRing>,
    );
    expect(screen.getByText("84")).toBeInTheDocument();
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <ProgressRing value={84} label="Today's score" />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
