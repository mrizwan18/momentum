import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { AnalyzingScreen } from "./AnalyzingScreen";

describe("AnalyzingScreen", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("shows every stage, starting with only the first as current", () => {
    render(<AnalyzingScreen onBack={vi.fn()} onComplete={vi.fn()} />);
    expect(screen.getByText("Detecting pitch accuracy")).toBeInTheDocument();
    expect(screen.getByText("Analyzing tone & clarity")).toBeInTheDocument();
    expect(screen.getByText("Evaluating rhythm")).toBeInTheDocument();
    expect(screen.getByText("Assessing range")).toBeInTheDocument();
    expect(screen.getByText("Preparing your report")).toBeInTheDocument();
  });

  it("completes stages sequentially and then calls onComplete", () => {
    const onComplete = vi.fn();
    render(<AnalyzingScreen onBack={vi.fn()} onComplete={onComplete} />);

    // Advance one stage at a time — each `act()` lets React commit the
    // completedCount update and run the effect that schedules the *next*
    // stage's timeout before the fake clock advances again.
    for (const durationMs of [900, 1100, 1000, 900, 800]) {
      act(() => {
        vi.advanceTimersByTime(durationMs);
      });
    }

    expect(onComplete).toHaveBeenCalled();
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <AnalyzingScreen onBack={vi.fn()} onComplete={vi.fn()} />,
    );
    vi.useRealTimers();
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
