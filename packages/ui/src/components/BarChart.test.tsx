import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { BarChart, type BarChartDatum } from "./BarChart";

const week: BarChartDatum[] = [
  { label: "M", value: 20 },
  { label: "T", value: 35 },
  { label: "W", value: 60, active: true },
  { label: "T", value: 15 },
  { label: "F", value: 40 },
  { label: "S", value: 55, active: true },
  { label: "S", value: 10 },
];

describe("BarChart", () => {
  it("exposes an accessible name for the whole chart", () => {
    render(<BarChart data={week} label="This week's practice minutes" />);
    expect(
      screen.getByRole("img", { name: "This week's practice minutes" }),
    ).toBeInTheDocument();
  });

  it("renders every day label", () => {
    render(<BarChart data={week} label="Weekly" />);
    expect(screen.getAllByText("M")).toHaveLength(1);
    expect(screen.getAllByText("S")).toHaveLength(2);
  });

  it("colors active bars distinctly from inactive bars", () => {
    const { container } = render(<BarChart data={week} label="Weekly" />);
    const track = container.querySelector('[role="img"]')!.children[0];
    const bars = Array.from(track.children).map(
      (column) => column.children[0] as HTMLElement,
    );
    expect(bars).toHaveLength(7);
    const activeColor = bars[2].style.backgroundColor;
    const inactiveColor = bars[0].style.backgroundColor;
    expect(activeColor).not.toBe("");
    expect(activeColor).not.toBe(inactiveColor);
  });

  it("handles an all-zero dataset without dividing by zero", () => {
    const zeros: BarChartDatum[] = [
      { label: "M", value: 0 },
      { label: "T", value: 0 },
    ];
    expect(() =>
      render(<BarChart data={zeros} label="Weekly" />),
    ).not.toThrow();
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<BarChart data={week} label="Weekly" />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
