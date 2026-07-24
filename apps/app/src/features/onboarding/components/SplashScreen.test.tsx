import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { SplashScreen } from "./SplashScreen";

describe("SplashScreen", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("shows the wordmark and subtitle", () => {
    render(<SplashScreen onComplete={vi.fn()} />);
    expect(screen.getByText("Momentum")).toBeInTheDocument();
    expect(screen.getByText("Your voice, your progress.")).toBeInTheDocument();
  });

  it("calls onComplete once the loading bar finishes", () => {
    const onComplete = vi.fn();
    render(<SplashScreen onComplete={onComplete} />);
    expect(onComplete).not.toHaveBeenCalled();
    act(() => {
      vi.advanceTimersByTime(2300);
    });
    expect(onComplete).toHaveBeenCalledOnce();
  });

  it("has no accessibility violations", async () => {
    vi.useRealTimers();
    const { container, unmount } = render(
      <SplashScreen onComplete={vi.fn()} />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
    unmount();
  });
});
