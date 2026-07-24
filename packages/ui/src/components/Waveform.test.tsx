import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { Waveform } from "./Waveform";

const levels = [0.3, 0.6, 0.9, 0.5, 0.4, 0.7, 0.2, 0.5, 0.8, 0.3];

describe("Waveform", () => {
  it("exposes an accessible name", () => {
    render(<Waveform levels={levels} label="Swar Sadhana recording" />);
    expect(
      screen.getByRole("img", { name: "Swar Sadhana recording" }),
    ).toBeInTheDocument();
  });

  it("renders one bar per level", () => {
    const { container } = render(<Waveform levels={levels} label="Waveform" />);
    expect(container.querySelectorAll("span")).toHaveLength(levels.length);
  });

  it("marks bars up to the current progress as played", () => {
    const { container } = render(
      <Waveform levels={levels} label="Waveform" progress={0.5} />,
    );
    const bars = container.querySelectorAll("span");
    const halfway = Math.round(0.5 * (levels.length - 1));
    const playedColor = (bars[0] as HTMLElement).style.backgroundColor;
    const unplayedColor = (bars[bars.length - 1] as HTMLElement).style
      .backgroundColor;
    expect(playedColor).not.toBe(unplayedColor);
    expect((bars[halfway] as HTMLElement).style.backgroundColor).toBe(
      playedColor,
    );
  });

  it("clamps out-of-range progress", () => {
    const { container } = render(
      <Waveform levels={levels} label="Waveform" progress={5} />,
    );
    const bars = container.querySelectorAll("span");
    const first = (bars[0] as HTMLElement).style.backgroundColor;
    const last = (bars[bars.length - 1] as HTMLElement).style.backgroundColor;
    expect(last).toBe(first);
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<Waveform levels={levels} label="Waveform" />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
