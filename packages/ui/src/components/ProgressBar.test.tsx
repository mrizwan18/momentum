import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { ProgressBar } from "./ProgressBar";

describe("ProgressBar", () => {
  it("exposes value via ARIA progressbar attributes", () => {
    render(<ProgressBar value={57} label="Session progress" />);
    const bar = screen.getByRole("progressbar", { name: "Session progress" });
    expect(bar).toHaveAttribute("aria-valuenow", "57");
    expect(bar).toHaveAttribute("aria-valuemin", "0");
    expect(bar).toHaveAttribute("aria-valuemax", "100");
  });

  it("clamps out-of-range values", () => {
    render(<ProgressBar value={150} label="Progress" />);
    expect(screen.getByRole("progressbar")).toHaveAttribute(
      "aria-valuenow",
      "100",
    );
    render(<ProgressBar value={-20} label="Progress 2" />);
    expect(
      screen.getByRole("progressbar", { name: "Progress 2" }),
    ).toHaveAttribute("aria-valuenow", "0");
  });

  it("marks itself disabled", () => {
    render(<ProgressBar value={50} label="Progress" disabled />);
    expect(screen.getByRole("progressbar")).toHaveAttribute(
      "aria-disabled",
      "true",
    );
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <ProgressBar value={57} label="Session progress" />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
